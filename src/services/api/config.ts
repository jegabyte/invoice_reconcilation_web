export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
};

export const API_ENDPOINTS = {
  // Vendors
  vendors: '/vendors',
  vendor: (id: string) => `/vendors/${id}`,
  
  // Extractions
  extractions: '/extractions',
  extraction: (id: string) => `/extractions/${id}`,
  
  // Reconciliation Summaries
  reconciliationSummaries: '/reconciliation-summaries',
  reconciliationSummary: (id: string) => `/reconciliation-summaries/${id}`,
  approveReconciliation: (id: string) => `/reconciliation-summaries/${id}/approve`,
  rejectReconciliation: (id: string) => `/reconciliation-summaries/${id}/reject`,
  
  // Rules
  rules: '/rules',
  rule: (id: string) => `/rules/${id}`,
  
  // Reconciliation Status
  reconciliationStatus: (invoiceId: string) => `/reconciliation-status/${invoiceId}`,
  
  // Statistics
  statistics: '/statistics',
};