import { mockStatistics } from './mock-data';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface DashboardStatistics {
  activeVendors: number;
  totalExtractions: number;
  totalReconciliations: number;
  totalInvoiceAmount: number;
  totalReconciledAmount: number;
  averageVariance: number;
  pendingInvoices: number;
  disputedInvoices: number;
  successRate: number;
  monthlyTrend: Array<{
    month: string;
    invoices: number;
    amount: number;
    reconciled: number;
  }>;
}

class StatisticsApiService {
  async getStatistics(): Promise<{ success: boolean; data: DashboardStatistics }> {
    await delay(400);
    
    return {
      success: true,
      data: mockStatistics,
    };
    
    // return apiClient.get(API_ENDPOINTS.statistics);
  }

  async getVendorStatistics(vendorId: string): Promise<{ success: boolean; data: any }> {
    await delay(400);
    
    // Mock vendor-specific statistics
    return {
      success: true,
      data: {
        vendorId,
        totalInvoices: 150,
        totalAmount: 300000,
        reconciledAmount: 295000,
        pendingAmount: 5000,
        averageProcessingTime: 2.5, // days
        successRate: 98.5,
        lastInvoiceDate: '2024-01-15T00:00:00Z',
        monthlyInvoices: [
          { month: '2024-01', count: 15, amount: 30000 },
          { month: '2023-12', count: 18, amount: 35000 },
          { month: '2023-11', count: 16, amount: 32000 },
        ],
        commonIssues: [
          { type: 'AMOUNT_MISMATCH', count: 5 },
          { type: 'MISSING_REFERENCE', count: 3 },
          { type: 'DUPLICATE_INVOICE', count: 1 },
        ],
      },
    };
  }

  async getReconciliationMetrics(period?: { startDate: string; endDate: string }): Promise<{ success: boolean; data: any }> {
    await delay(500);
    
    // Mock reconciliation metrics
    return {
      success: true,
      data: {
        period: period || { startDate: '2024-01-01', endDate: '2024-01-31' },
        totalProcessed: 250,
        autoReconciled: 200,
        manuallyReconciled: 40,
        failed: 10,
        averageVariancePercentage: 0.8,
        processingTimeBreakdown: {
          extraction: { avg: 5, min: 2, max: 15 }, // minutes
          validation: { avg: 2, min: 1, max: 5 },
          reconciliation: { avg: 10, min: 5, max: 30 },
        },
        ruleEffectiveness: [
          { ruleId: 'rule_001', applied: 180, successful: 175, successRate: 97.2 },
          { ruleId: 'rule_002', applied: 150, successful: 145, successRate: 96.7 },
        ],
      },
    };
  }
}

export const statisticsApiService = new StatisticsApiService();