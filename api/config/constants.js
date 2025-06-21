// Firestore Collection Names
// These can be overridden by environment variables for different customer environments
const COLLECTIONS = {
  VENDORS: process.env.COLLECTION_VENDORS || 'vendor_configurations',
  EXTRACTIONS: process.env.COLLECTION_EXTRACTIONS || 'extractionResults',
  RECONCILIATIONS: process.env.COLLECTION_RECONCILIATIONS || 'invoice_reconciliation_summaries',
  RULES: process.env.COLLECTION_RULES || 'reconciliation_rules',
  STATUS: process.env.COLLECTION_STATUS || 'reconciliation_status',
  EXTRACTION_METADATA: process.env.COLLECTION_EXTRACTION_METADATA || 'extraction_metadata',
  EXTRACTION_PARTS: process.env.COLLECTION_EXTRACTION_PARTS || 'extraction_parts'
};

// Server Configuration
const SERVER_CONFIG = {
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development'
};

// Storage Configuration
const STORAGE_CONFIG = {
  BUCKET_NAME: process.env.STORAGE_BUCKET_NAME || process.env.GCS_BUCKET_NAME,
  UPLOAD_PATH: process.env.STORAGE_UPLOAD_PATH || 'pending'
};

// Export configurations
module.exports = {
  COLLECTIONS,
  SERVER_CONFIG,
  STORAGE_CONFIG
};