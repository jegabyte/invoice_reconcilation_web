import { APP_CONFIG } from '@/config/app.config';

// Use proxy in development to avoid CORS issues
const isDevelopment = import.meta.env.MODE === 'development';
const baseURL = isDevelopment ? '/api/invoice-api-stub' : APP_CONFIG.api.baseUrl;

export const API_CONFIG = {
  baseURL,
  timeout: APP_CONFIG.api.timeout,
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
