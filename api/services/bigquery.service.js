const { BigQuery } = require('@google-cloud/bigquery');
const { BIGQUERY_CONFIG } = require('../config/bigquery.config');

class BigQueryService {
  constructor() {
    this.bigquery = new BigQuery({
      projectId: process.env.GCP_PROJECT_ID,
    });
  }

  /**
   * Execute a BigQuery SQL query
   * @param {string} queryKey - Key to get query from config
   * @param {Object} params - Parameters to replace in query
   * @returns {Promise<Array>} Query results
   */
  async executeQuery(queryKey, params = {}) {
    try {
      let query = BIGQUERY_CONFIG.queries[queryKey];
      
      if (!query) {
        throw new Error(`Query not found for key: ${queryKey}`);
      }

      // Replace parameters in query if provided
      Object.keys(params).forEach(key => {
        query = query.replace(new RegExp(`{{${key}}}`, 'g'), params[key]);
      });

      console.log('Executing BigQuery query:', query);

      // Run the query
      const [rows] = await this.bigquery.query({
        query,
        useLegacySql: false,
      });

      return rows;
    } catch (error) {
      console.error('BigQuery error:', error);
      throw error;
    }
  }

  /**
   * Get invoice summaries from BigQuery
   * @returns {Promise<Array>} Invoice summaries
   */
  async getInvoiceSummaries() {
    try {
      const rows = await this.executeQuery('invoiceSummaries');
      
      // Debug: Log first row to check field names
      if (rows.length > 0) {
        console.log('BigQuery first row:', JSON.stringify(rows[0], null, 2));
      }
      
      // Transform BigQuery results to match expected format
      return rows.map(row => {
        // Handle BigQuery date format
        const invoiceDateValue = row.invoice_date?.value || row.invoice_date;
        
        return {
        id: row.extraction_id,
        extraction_id: row.extraction_id,
        // Both snake_case and camelCase for compatibility
        invoice_number: row.invoice_number,
        invoiceNumber: row.invoice_number,
        vendor_name: row.vendor_name,
        invoice_date: invoiceDateValue,
        invoiceDate: invoiceDateValue,
        total_invoice_amount: parseFloat(row.invoice_amount) || 0,
        invoiceCurrency: row.currency || 'USD',
        invoice_status: row.invoice_status,
        invoice_recommendation: row.invoice_recommendation,
        // Map status for UI metrics
        status_summary: this.mapStatusSummary(row.invoice_status),
        dispute_type_summary: this.mapDisputeSummary(row.invoice_status),
        total_line_items: row.total_line_items || 0,
        // Additional fields for compatibility
        timestamp: row.invoice_date,
        processing_completed: true,
        processing_version: '1.0',
        difference_amount: 0,
        total_oms_amount: 0,
      };
      });
    } catch (error) {
      console.error('Error fetching invoice summaries from BigQuery:', error);
      throw error;
    }
  }

  /**
   * Map invoice status to status summary format
   * @param {string} status - Invoice status from BigQuery
   * @returns {Object} Status summary object
   */
  mapStatusSummary(status) {
    const summary = {
      MATCHED: 0,
      DISPUTED: 0,
      HOLD_PENDING_REVIEW: 0,
    };

    if (status && status.includes('MATCHED')) {
      summary.MATCHED = 1;
    } else if (status && status.includes('DISPUTED')) {
      summary.DISPUTED = 1;
    } else if (status && status.includes('HOLD')) {
      summary.HOLD_PENDING_REVIEW = 1;
    }

    return summary;
  }

  /**
   * Map invoice status to dispute summary format
   * @param {string} status - Invoice status from BigQuery
   * @returns {Object} Dispute summary object
   */
  mapDisputeSummary(status) {
    const summary = {};
    
    if (status && status.includes('DISPUTED')) {
      summary.GENERAL_DISPUTE = 1;
    }
    
    return summary;
  }
}

module.exports = new BigQueryService();