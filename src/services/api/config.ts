// Use proxy in development to avoid CORS issues
const defaultBaseURL = 'https://us-central1-ava-staging-4a9e1.cloudfunctions.net/invoice-api-stub';

export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || defaultBaseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
};

export const API_ENDPOINTS = {
  // Vendors
  vendors: '/vendors',
  vendor: (id: string) => `/vendors/${id}`,

  // Invoice Summaries (replacing extractions)
  invoiceSummaries: '/invoice_summaries',
  invoiceSummary: (id: string) => `/invoice_summaries/${id}`,

  // Rules
  rules: '/rules',
  rule: (id: string) => `/rules/${id}`,

  // Legacy endpoints (kept for compatibility)
  extractions: '/invoice_summaries', // Maps to invoice_summaries
  extraction: (id: string) => `/invoice_summaries/${id}`,
  reconciliationSummaries: '/invoice_summaries',
  reconciliationSummary: (id: string) => `/invoice_summaries/${id}`,
  approveReconciliation: (id: string) => `/invoice_summaries/${id}/approve`,
  rejectReconciliation: (id: string) => `/invoice_summaries/${id}/reject`,
  reconciliationStatus: (invoiceId: string) => `/reconciliation-status/${invoiceId}`,
  statistics: '/statistics',
};
