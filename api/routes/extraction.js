const express = require('express');
const router = express.Router();
const { Firestore } = require('@google-cloud/firestore');
const { COLLECTIONS } = require('../config/constants');

const firestore = new Firestore({
  projectId: process.env.GOOGLE_CLOUD_PROJECT || process.env.GCP_PROJECT_ID,
});

// Get extraction parts by extraction_id
router.get('/parts/:extractionId', async (req, res) => {
  try {
    const { extractionId } = req.params;
    console.log('=== EXTRACTION PARTS API DEBUG ===');
    console.log('Fetching extraction parts for extraction_id:', extractionId);
    
    // Query extraction_parts collection
    const snapshot = await firestore
      .collection(COLLECTIONS.EXTRACTION_PARTS)
      .where('extraction_id', '==', extractionId)
      .get();
    
    console.log('Query result - documents found:', snapshot.size);
    
    if (snapshot.empty) {
      console.log('No extraction parts found for extraction_id:', extractionId);
      
      // Try alternate query with 'id' field
      const snapshot2 = await firestore
        .collection(COLLECTIONS.EXTRACTION_PARTS)
        .where('id', '==', extractionId)
        .get();
      
      console.log('Alternate query (id field) - documents found:', snapshot2.size);
      
      // Try one more query - maybe the extraction_id is stored in a nested field
      const snapshot3 = await firestore
        .collection(COLLECTIONS.EXTRACTION_PARTS)
        .limit(5)
        .get();
      
      console.log('Sample extraction_parts documents (first 5):');
      snapshot3.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`Document ${index + 1} - ID: ${doc.id}`);
        console.log(`- extraction_id field: ${data.extraction_id}`);
        console.log(`- id field: ${data.id}`);
        console.log(`- Has invoice.line_items: ${!!data.invoice?.line_items}`);
        console.log(`- Has line_items: ${!!data.line_items}`);
        console.log(`- Has parts: ${!!data.parts}`);
      });
      
      if (snapshot2.empty) {
        return res.json({ 
          extraction_id: extractionId,
          line_items: [],
          total_items: 0,
          message: 'No extraction parts found for this extraction_id'
        });
      }
      
      // Use alternate query results
      const doc = snapshot2.docs[0];
      const data = doc.data();
      console.log('Document data from alternate query:', JSON.stringify(data, null, 2));
      
      const lineItems = data.invoice?.line_items || [];
      console.log('Line items found:', lineItems.length);
      
      return res.json({
        extraction_id: extractionId,
        line_items: lineItems,
        total_items: lineItems.length,
        extracted_at: data.created_at || data.timestamp
      });
    }
    
    // Get the document data
    const doc = snapshot.docs[0];
    const data = doc.data();
    console.log('Document ID:', doc.id);
    console.log('Document data:', JSON.stringify(data, null, 2));
    
    // Extract line items from the invoice data - check multiple possible locations
    let lineItems = [];
    
    // Check different possible locations for line items
    if (data.invoice?.line_items) {
      lineItems = data.invoice.line_items;
      console.log('Line items found in data.invoice.line_items');
    } else if (data.line_items) {
      lineItems = data.line_items;
      console.log('Line items found in data.line_items');
    } else if (data.parts) {
      // Check if parts contain line items
      for (const part of data.parts) {
        if (part.invoice?.line_items) {
          lineItems = lineItems.concat(part.invoice.line_items);
        }
      }
      console.log('Line items found in data.parts');
    }
    
    console.log('Total line items found:', lineItems.length);
    console.log('First line item (if exists):', lineItems[0] ? JSON.stringify(lineItems[0], null, 2) : 'None');
    
    res.json({
      extraction_id: extractionId,
      line_items: lineItems,
      total_items: lineItems.length,
      extracted_at: data.created_at || data.timestamp
    });
  } catch (error) {
    console.error('Error fetching extraction parts:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;