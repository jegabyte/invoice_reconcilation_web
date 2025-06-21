const express = require('express');
const router = express.Router();
const { Firestore } = require('@google-cloud/firestore');
const { reconciliationService, extractionMetadataService, BaseFirestoreService } = require('../services/firestore.service');
const bigQueryService = require('../services/bigquery.service');

// Helper function to map Firestore data to API format
function mapFirestoreToApi(firestoreData, extractionMetadata = null) {
  // Ensure safe defaults for potentially missing fields
  const lineItemStatus = firestoreData.status_summary || {
    MATCHED: 0,
    DISPUTED: 0,
    HOLD_PENDING_REVIEW: 0
  };
  const disputeSummary = firestoreData.dispute_type_summary || {};
  
  // Comment out to reduce log noise
  // console.log('=== mapFirestoreToApi DEBUG ===');
  // console.log('Firestore data has invoice_number:', firestoreData.invoice_number);
  // console.log('Extraction metadata:', extractionMetadata ? 'Present' : 'Not present');
  
  // Extract invoice metadata if available - check if 'data' field exists
  const invoiceMetadata = extractionMetadata?.data?.invoice_metadata || extractionMetadata?.invoice_metadata || {};
  
  // Also check if extraction metadata has the fields directly
  const directInvoiceNumber = extractionMetadata?.invoice_number || invoiceMetadata.invoice_number || firestoreData.invoice_number || '';
  const directInvoiceDate = extractionMetadata?.invoice_date || invoiceMetadata.invoice_date || firestoreData.invoice_date || '';
  const directPaymentDueDate = extractionMetadata?.payment_due_date || invoiceMetadata.payment_due_date || firestoreData.payment_due_date || '';
  
  return {
    id: firestoreData.id || firestoreData.extraction_id,
    run_id: firestoreData.id, // Document ID is the run_id
    invoiceId: firestoreData.extraction_id || firestoreData.invoice_number,
    vendorId: firestoreData.vendor_name?.toLowerCase().replace(/\s+/g, '_') || 'unknown',
    vendorName: firestoreData.vendor_name,
    reconciliationDate: firestoreData.timestamp || firestoreData.created_at || new Date().toISOString(),
    totalInvoiceAmount: firestoreData.total_invoice_amount || 0,
    totalReconciledAmount: firestoreData.total_oms_amount || 0,
    variance: firestoreData.difference_amount || 0,
    variancePercentage: firestoreData.total_invoice_amount > 0
      ? (firestoreData.difference_amount / firestoreData.total_invoice_amount) * 100
      : 0,
    status: mapInvoiceStatusToReconciliationStatus(firestoreData.invoice_status),
    matchedLineItems: lineItemStatus.MATCHED || 0,
    unmatchedLineItems: lineItemStatus.DISPUTED || 0,
    totalLineItems: firestoreData.total_line_items || 0,
    approvalStatus: firestoreData.invoice_status === 'APPROVED' ? 'APPROVED' : 'PENDING',
    approvedBy: firestoreData.invoice_status === 'APPROVED' ? 'system' : null,
    approvalDate: firestoreData.invoice_status === 'APPROVED' ? firestoreData.timestamp : null,
    notes: firestoreData.invoice_recommendation || '',
    createdAt: firestoreData.timestamp || new Date().toISOString(),
    updatedAt: firestoreData.timestamp || new Date().toISOString(),
    // Add invoice metadata fields - check multiple possible locations
    invoiceNumber: directInvoiceNumber,
    invoiceDate: directInvoiceDate,
    invoiceCurrency: extractionMetadata?.invoice_currency || invoiceMetadata.invoice_currency || firestoreData.invoice_currency || '',
    paymentDueDate: directPaymentDueDate,
    invoiceType: extractionMetadata?.invoice_type || invoiceMetadata.invoice_type || firestoreData.invoice_type || '',
    // Include original fields needed by the UI
    extraction_id: firestoreData.extraction_id,
    vendor_name: firestoreData.vendor_name,
    invoice_number: directInvoiceNumber,
    invoice_date: directInvoiceDate,
    payment_due_date: directPaymentDueDate,
    timestamp: firestoreData.timestamp,
    total_invoice_amount: firestoreData.total_invoice_amount,
    total_oms_amount: firestoreData.total_oms_amount,
    difference_amount: firestoreData.difference_amount,
    total_line_items: firestoreData.total_line_items || 0,
    status_summary: firestoreData.status_summary || {
      MATCHED: 0,
      DISPUTED: 0,
      HOLD_PENDING_REVIEW: 0
    },
    dispute_type_summary: firestoreData.dispute_type_summary || {},
    processing_completed: firestoreData.processing_completed,
    processing_version: firestoreData.processing_version,
    processing_status: firestoreData.processing_status || 'PROCESSING',
    failed_pages: firestoreData.failed_pages,
    total_pages: firestoreData.total_pages
  };
}

function mapInvoiceStatusToReconciliationStatus(apiStatus) {
  switch (apiStatus) {
    case 'DISPUTED':
      return 'DISPUTED';
    case 'APPROVED':
      return 'MATCHED';
    case 'MATCHED':
      return 'MATCHED';
    case 'PENDING':
      return 'PENDING';
    default:
      return 'PENDING';
  }
}

// GET all reconciliations - Now using BigQuery for invoice summaries
router.get('/', async (req, res) => {
  try {
    // Use BigQuery for invoice summaries instead of Firestore
    const useBigQuery = process.env.USE_BIGQUERY_FOR_INVOICES !== 'false';
    
    if (useBigQuery) {
      try {
        // Fetch from BigQuery
        const invoiceSummaries = await bigQueryService.getInvoiceSummaries();
        
        // Filter based on query parameters if provided
        let filtered = invoiceSummaries;
        
        if (req.query.vendor_name) {
          filtered = filtered.filter(inv => 
            inv.vendor_name?.toLowerCase().includes(req.query.vendor_name.toLowerCase())
          );
        }
        
        if (req.query.invoice_status) {
          filtered = filtered.filter(inv => 
            inv.invoice_status === req.query.invoice_status
          );
        }
        
        console.log(`Returning ${filtered.length} invoices from BigQuery`);
        // Debug: Log first invoice to check data structure
        if (filtered.length > 0) {
          console.log('First invoice from BigQuery:', JSON.stringify(filtered[0], null, 2));
        }
        res.json(filtered);
        return;
      } catch (bigQueryError) {
        console.error('BigQuery error, falling back to Firestore:', bigQueryError);
        // Fall through to Firestore if BigQuery fails
      }
    }
    
    // Original Firestore logic as fallback
    const reconciliations = await reconciliationService.getAll(req.query);
    
    // Fetch extraction metadata for all reconciliations
    const extractionIds = reconciliations.map(r => r.extraction_id).filter(Boolean);
    
    // Fetch metadata by querying the 'id' field instead of document ID
    const extractionMetadataPromises = extractionIds.map(async (extractionId) => {
      try {
        // Try document ID first
        let metadata = await extractionMetadataService.getById(extractionId);
        if (metadata) {
          return metadata;
        }
        
        // If not found, try field query
        const snapshot = await extractionMetadataService.collection
          .where('id', '==', extractionId)
          .limit(1)
          .get();
        
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          return { id: doc.id, ...doc.data() };
        }
        
        // Also try extraction_id field
        const snapshot2 = await extractionMetadataService.collection
          .where('extraction_id', '==', extractionId)
          .limit(1)
          .get();
        
        if (!snapshot2.empty) {
          const doc = snapshot2.docs[0];
          return { id: doc.id, ...doc.data() };
        }
        
        return null;
      } catch (err) {
        console.error(`Failed to fetch metadata for ${extractionId}:`, err.message);
        return null;
      }
    });
    const extractionMetadataList = await Promise.all(extractionMetadataPromises);
    
    // Create a map of extraction_id to metadata
    const metadataMap = {};
    extractionMetadataList.forEach((metadata, index) => {
      if (metadata) {
        metadataMap[extractionIds[index]] = metadata;
      }
    });
    
    const converted = reconciliations.map(r => {
      const timestampConverted = BaseFirestoreService.convertTimestamps(r);
      const metadata = metadataMap[r.extraction_id] || null;
      return mapFirestoreToApi(timestampConverted, metadata);
    });
    res.json(converted);
  } catch (error) {
    console.error('Error fetching reconciliations:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET reconciliation by ID
router.get('/:id', async (req, res) => {
  try {
    console.log('=== RECONCILIATION API DEBUG - GET BY ID ===');
    console.log('Fetching reconciliation for ID:', req.params.id);
    
    const reconciliation = await reconciliationService.getById(req.params.id);
    console.log('Raw reconciliation from Firestore:', JSON.stringify(reconciliation, null, 2));
    console.log('Extraction ID from reconciliation:', reconciliation?.extraction_id);
    
    if (!reconciliation) {
      console.log('Reconciliation not found for ID:', req.params.id);
      return res.status(404).json({ error: 'Reconciliation not found' });
    }
    
    // Fetch extraction metadata if available
    let extractionMetadata = null;
    if (reconciliation.extraction_id) {
      console.log('Fetching extraction metadata for extraction_id:', reconciliation.extraction_id);
      try {
        // Try direct document lookup first
        extractionMetadata = await extractionMetadataService.getById(reconciliation.extraction_id);
        console.log('Direct lookup result:', extractionMetadata ? 'Found' : 'Not found');
        
        if (!extractionMetadata) {
          // Try field query
          const snapshot = await extractionMetadataService.collection
            .where('id', '==', reconciliation.extraction_id)
            .limit(1)
            .get();
          
          if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            extractionMetadata = { id: doc.id, ...doc.data() };
            console.log('Field query found metadata');
          } else {
            // Also try extraction_id field
            const snapshot2 = await extractionMetadataService.collection
              .where('extraction_id', '==', reconciliation.extraction_id)
              .limit(1)
              .get();
            
            if (!snapshot2.empty) {
              const doc = snapshot2.docs[0];
              extractionMetadata = { id: doc.id, ...doc.data() };
              console.log('extraction_id field query found metadata');
            }
          }
        }
        
        console.log('Extraction metadata:', JSON.stringify(extractionMetadata, null, 2));
      } catch (err) {
        console.error(`Failed to fetch metadata for ${reconciliation.extraction_id}:`, err.message);
      }
    } else {
      console.log('No extraction_id in reconciliation data');
    }
    
    const timestampConverted = BaseFirestoreService.convertTimestamps(reconciliation);
    const apiResponse = mapFirestoreToApi(timestampConverted, extractionMetadata);
    console.log('Final API response:', JSON.stringify(apiResponse, null, 2));
    
    res.json(apiResponse);
  } catch (error) {
    console.error('Error fetching reconciliation:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET reconciliation by invoice ID
router.get('/invoice/:invoiceId', async (req, res) => {
  try {
    const reconciliations = await reconciliationService.getAll({ extraction_id: req.params.invoiceId });
    const reconciliation = reconciliations[0] || null;
    if (reconciliation) {
      const timestampConverted = BaseFirestoreService.convertTimestamps(reconciliation);
      res.json(mapFirestoreToApi(timestampConverted));
    } else {
      res.json(null);
    }
  } catch (error) {
    console.error('Error fetching reconciliation by invoice:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST create reconciliation
router.post('/', async (req, res) => {
  try {
    const reconciliation = await reconciliationService.create(req.body);
    res.status(201).json(BaseFirestoreService.convertTimestamps(reconciliation));
  } catch (error) {
    console.error('Error creating reconciliation:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT update reconciliation
router.put('/:id', async (req, res) => {
  try {
    const reconciliation = await reconciliationService.update(req.params.id, req.body);
    res.json(BaseFirestoreService.convertTimestamps(reconciliation));
  } catch (error) {
    console.error('Error updating reconciliation:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST approve reconciliation
router.post('/:id/approve', async (req, res) => {
  try {
    const { approvedBy, notes } = req.body;
    const reconciliation = await reconciliationService.update(req.params.id, {
      approvalStatus: 'APPROVED',
      approvedBy,
      approvalDate: new Date().toISOString(),
      notes
    });
    res.json(BaseFirestoreService.convertTimestamps(reconciliation));
  } catch (error) {
    console.error('Error approving reconciliation:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST reject reconciliation
router.post('/:id/reject', async (req, res) => {
  try {
    const { rejectedBy, notes } = req.body;
    const reconciliation = await reconciliationService.update(req.params.id, {
      approvalStatus: 'REJECTED',
      approvedBy: rejectedBy,
      approvalDate: new Date().toISOString(),
      notes
    });
    res.json(BaseFirestoreService.convertTimestamps(reconciliation));
  } catch (error) {
    console.error('Error rejecting reconciliation:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE reconciliation
router.delete('/:id', async (req, res) => {
  try {
    await reconciliationService.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting reconciliation:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;