// Load environment variables from .env.local first, then .env
const dotenv = require('dotenv');

// Load .env.local first (higher priority)
const localEnvResult = dotenv.config({ path: '.env.local' });
console.log('.env.local loaded:', localEnvResult.error ? 'Failed' : 'Success');

// Then load .env (lower priority, won't override existing vars)
const envResult = dotenv.config();
console.log('.env loaded:', envResult.error ? 'Failed' : 'Success');

// Debug: Log important environment variables
console.log('Environment variables loaded:');
console.log('- GOOGLE_CLOUD_PROJECT:', process.env.GOOGLE_CLOUD_PROJECT);
console.log('- GCP_PROJECT_ID:', process.env.GCP_PROJECT_ID);
console.log('- STORAGE_BUCKET_NAME:', process.env.STORAGE_BUCKET_NAME);
console.log('- GCS_BUCKET_NAME:', process.env.GCS_BUCKET_NAME);
console.log('- STORAGE_UPLOAD_PATH:', process.env.STORAGE_UPLOAD_PATH);
const express = require('express');
const path = require('path');
const { Firestore } = require('@google-cloud/firestore');
const { SERVER_CONFIG, COLLECTIONS } = require('./api/config/constants');

const app = express();
const PORT = SERVER_CONFIG.PORT;

// Initialize Firestore with ADC (no API key needed)
const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCP_PROJECT_ID || process.env.NEXT_PUBLIC_GCP_PROJECT_ID;
const firestore = new Firestore({
  projectId: projectId,
  // ADC will be used automatically
});

// Set GOOGLE_CLOUD_PROJECT for other services if not already set
if (!process.env.GOOGLE_CLOUD_PROJECT && projectId) {
  process.env.GOOGLE_CLOUD_PROJECT = projectId;
}

// Make firestore available globally for API routes
global.firestore = firestore;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes - These run on the server with ADC
app.use('/api/vendors', require('./api/routes/vendors'));
app.use('/api/extractions', require('./api/routes/extractions'));
app.use('/api/extraction', require('./api/routes/extraction'));
app.use('/api/reconciliations', require('./api/routes/reconciliations'));
app.use('/api/rules', require('./api/routes/rules'));
app.use('/api/status', require('./api/routes/status'));
app.use('/api/upload', require('./api/routes/upload'));

// Test endpoint to check collections and extraction data
app.get('/api/test/extraction/:extractionId', async (req, res) => {
  try {
    const { extractionId } = req.params;
    console.log('=== TESTING EXTRACTION DATA ===');
    console.log('Project ID:', firestore.projectId);
    console.log('Extraction ID:', extractionId);
    
    // Test extraction_parts collection
    const partsSnapshot = await firestore.collection(COLLECTIONS.EXTRACTION_PARTS)
      .where('extraction_id', '==', extractionId)
      .get();
    console.log('extraction_parts with extraction_id query - documents found:', partsSnapshot.size);
    
    // Try alternative queries
    const partsSnapshot2 = await firestore.collection(COLLECTIONS.EXTRACTION_PARTS)
      .where('id', '==', extractionId)
      .get();
    console.log('extraction_parts with id query - documents found:', partsSnapshot2.size);
    
    // Test reconciliation_status collection
    const statusSnapshot = await firestore.collection(COLLECTIONS.STATUS)
      .where('extraction_id', '==', extractionId)
      .get();
    console.log('reconciliation_status with extraction_id query - documents found:', statusSnapshot.size);
    
    // Get first document from each to see structure
    let extractionPartsDoc = null;
    let reconciliationStatusDoc = null;
    
    if (!partsSnapshot.empty) {
      extractionPartsDoc = partsSnapshot.docs[0].data();
      console.log('Sample extraction_parts doc:', JSON.stringify(extractionPartsDoc, null, 2));
    } else if (!partsSnapshot2.empty) {
      extractionPartsDoc = partsSnapshot2.docs[0].data();
      console.log('Sample extraction_parts doc (from id query):', JSON.stringify(extractionPartsDoc, null, 2));
    }
    
    if (!statusSnapshot.empty) {
      reconciliationStatusDoc = statusSnapshot.docs[0].data();
      console.log('Sample reconciliation_status doc:', JSON.stringify(reconciliationStatusDoc, null, 2));
    }
    
    // Also check reconciliation summary
    const summarySnapshot = await firestore.collection(COLLECTIONS.RECONCILIATIONS)
      .where('extraction_id', '==', extractionId)
      .get();
    console.log('invoice_reconciliation_summaries with extraction_id - documents found:', summarySnapshot.size);
    
    res.json({
      project: firestore.projectId,
      extraction_id: extractionId,
      extraction_parts_count: partsSnapshot.size + partsSnapshot2.size,
      reconciliation_status_count: statusSnapshot.size,
      reconciliation_summary_count: summarySnapshot.size,
      sample_extraction_parts: extractionPartsDoc,
      sample_reconciliation_status: reconciliationStatusDoc
    });
  } catch (error) {
    console.error('Error testing extraction data:', error);
    res.status(500).json({ error: error.message });
  }
});

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'dist')));

// Handle React routing - serve index.html for all non-API routes
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(404).send('Page not found');
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Using Firestore project: ${firestore.projectId}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

// Export for use in API routes if needed
module.exports = { firestore };