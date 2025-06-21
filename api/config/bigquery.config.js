// BigQuery configuration
const BIGQUERY_CONFIG = {
  // Dataset configuration
  datasets: {
    reconSummary: process.env.BIGQUERY_DATASET || 'recon_summary',
  },
  
  // Table configuration
  tables: {
    invoiceReview: process.env.BIGQUERY_TABLE_INVOICE_REVIEW || 'invoice_review',
  },
  
  // SQL queries - can be overridden via environment variables
  queries: {
    // Main invoice summaries query
    invoiceSummaries: process.env.BIGQUERY_QUERY_INVOICE_SUMMARIES || `
      SELECT 
        invoice_number, 
        vendor_name,
        extraction_id, 
        invoice_date,
        total_invoice_amount as invoice_amount, 
        invoice_currency as currency, 
        invoice_status, 
        invoice_recommendation 
      FROM \`${process.env.GCP_PROJECT_ID}.${process.env.BIGQUERY_DATASET || 'recon_summary'}.${process.env.BIGQUERY_TABLE_INVOICE_REVIEW || 'invoice_review'}\`
    `,
    
    // Query for specific invoice
    invoiceById: process.env.BIGQUERY_QUERY_INVOICE_BY_ID || `
      SELECT 
        invoice_number, 
        vendor_name,
        extraction_id, 
        invoice_date,
        total_invoice_amount as invoice_amount, 
        invoice_currency as currency, 
        invoice_status, 
        invoice_recommendation 
      FROM \`${process.env.GCP_PROJECT_ID}.${process.env.BIGQUERY_DATASET || 'recon_summary'}.${process.env.BIGQUERY_TABLE_INVOICE_REVIEW || 'invoice_review'}\` 
      WHERE extraction_id = '{{extractionId}}'
      LIMIT 1
    `,
  },
};

module.exports = { BIGQUERY_CONFIG };