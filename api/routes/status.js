const express = require('express');
const router = express.Router();
const { statusService, BaseFirestoreService } = require('../services/firestore.service');

// GET API status
router.get('/api-status', async (req, res) => {
  res.json({
    status: 'ok',
    backend: 'Google Cloud Firestore',
    authentication: 'Application Default Credentials',
    timestamp: new Date().toISOString()
  });
});

// GET all statuses
router.get('/', async (req, res) => {
  try {
    const statuses = await statusService.getAll(req.query);
    const converted = statuses.map(s => BaseFirestoreService.convertTimestamps(s));
    res.json(converted);
  } catch (error) {
    console.error('Error fetching statuses:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET status by ID
router.get('/:id', async (req, res) => {
  try {
    const status = await statusService.getById(req.params.id);
    if (!status) {
      return res.status(404).json({ error: 'Status not found' });
    }
    res.json(BaseFirestoreService.convertTimestamps(status));
  } catch (error) {
    console.error('Error fetching status:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET status by invoice ID
router.get('/invoice/:invoiceId', async (req, res) => {
  try {
    const statuses = await statusService.getAll({ invoiceId: req.params.invoiceId });
    const status = statuses[0] || null;
    res.json(status ? BaseFirestoreService.convertTimestamps(status) : null);
  } catch (error) {
    console.error('Error fetching status by invoice:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET statuses by run ID
router.get('/run/:runId', async (req, res) => {
  try {
    const statuses = await statusService.getAll({ run_id: req.params.runId });
    const converted = statuses.map(s => {
      const timestampConverted = BaseFirestoreService.convertTimestamps(s);
      // Map the reconciliation_status fields to a more frontend-friendly format
      return {
        id: timestampConverted.id,
        reconciliationId: timestampConverted.reconciliation_id,
        runId: timestampConverted.run_id,
        extractionId: timestampConverted.extraction_id,
        vendorName: timestampConverted.vendor_name,
        invoiceNumber: timestampConverted.invoice_number,
        bookingId: timestampConverted.booking_id,
        lineItemId: timestampConverted.line_item_id,
        hotelName: timestampConverted.hotel_name,
        status: timestampConverted.status,
        disputeType: timestampConverted.dispute_type,
        invoiceData: timestampConverted.invoice_data,
        omsData: timestampConverted.oms_data,
        rulesApplied: timestampConverted.rules_applied,
        statusHistory: timestampConverted.status_history,
        isCancelledBooking: timestampConverted.is_cancelled_booking,
        cancellationDate: timestampConverted.cancellation_date,
        expectedRefundDate: timestampConverted.expected_refund_date,
        daysInCurrentStatus: timestampConverted.days_in_current_status,
        createdAt: timestampConverted.created_at,
        updatedAt: timestampConverted.updated_at
      };
    });
    res.json(converted);
  } catch (error) {
    console.error('Error fetching statuses by run ID:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET statuses by extraction ID
router.get('/extraction/:extractionId', async (req, res) => {
  try {
    console.log('=== RECONCILIATION STATUS BY EXTRACTION ID ===');
    console.log('Fetching statuses for extraction_id:', req.params.extractionId);
    
    const statuses = await statusService.getAll({ extraction_id: req.params.extractionId });
    console.log('Statuses found with extraction_id query:', statuses.length);
    
    if (statuses.length === 0) {
      // Try alternate queries
      console.log('No statuses found with extraction_id, trying run_id...');
      
      // First, let's see what fields are available in a sample document
      const sampleSnapshot = await statusService.collection.limit(5).get();
      console.log('Sample reconciliation_status documents:');
      sampleSnapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`Document ${index + 1} - ID: ${doc.id}`);
        console.log(`- extraction_id: ${data.extraction_id}`);
        console.log(`- run_id: ${data.run_id}`);
        console.log(`- invoice_id: ${data.invoice_id}`);
        console.log(`- Keys: ${Object.keys(data).join(', ')}`);
      });
    } else {
      console.log('First status document:', JSON.stringify(statuses[0], null, 2));
    }
    
    const converted = statuses.map(s => {
      const timestampConverted = BaseFirestoreService.convertTimestamps(s);
      // Map the reconciliation_status fields to a more frontend-friendly format
      return {
        id: timestampConverted.id,
        reconciliationId: timestampConverted.reconciliation_id,
        runId: timestampConverted.run_id,
        extractionId: timestampConverted.extraction_id,
        vendorName: timestampConverted.vendor_name,
        invoiceNumber: timestampConverted.invoice_number,
        bookingId: timestampConverted.booking_id || timestampConverted.booking_id,
        lineItemId: timestampConverted.line_item_id,
        hotelName: timestampConverted.hotel_name,
        status: timestampConverted.status,
        disputeType: timestampConverted.dispute_type || timestampConverted.dispute_type,
        invoiceData: timestampConverted.invoice_data,
        omsData: timestampConverted.oms_data,
        rulesApplied: timestampConverted.rules_applied || timestampConverted.rules_applied,
        statusHistory: timestampConverted.status_history,
        isCancelledBooking: timestampConverted.is_cancelled_booking,
        cancellationDate: timestampConverted.cancellation_date,
        expectedRefundDate: timestampConverted.expected_refund_date,
        daysInCurrentStatus: timestampConverted.days_in_current_status,
        createdAt: timestampConverted.created_at,
        updatedAt: timestampConverted.updated_at,
        // Also include snake_case versions
        booking_id: timestampConverted.booking_id,
        hotel_name: timestampConverted.hotel_name,
        dispute_type: timestampConverted.dispute_type,
        invoice_data: timestampConverted.invoice_data,
        rules_applied: timestampConverted.rules_applied
      };
    });
    res.json(converted);
  } catch (error) {
    console.error('Error fetching statuses by extraction ID:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST create status
router.post('/', async (req, res) => {
  try {
    const status = await statusService.create(req.body);
    res.status(201).json(BaseFirestoreService.convertTimestamps(status));
  } catch (error) {
    console.error('Error creating status:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT update status
router.put('/:id', async (req, res) => {
  try {
    const status = await statusService.update(req.params.id, req.body);
    res.json(BaseFirestoreService.convertTimestamps(status));
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE status
router.delete('/:id', async (req, res) => {
  try {
    await statusService.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting status:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;