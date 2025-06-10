import { apiClient } from './client';
import { API_ENDPOINTS } from './config';
import { mockReconciliationSummaries, mockReconciliationStatus } from './mock-data';
import type { InvoiceReconciliationSummary, ReconciliationStatus } from '@/types/api.types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface ReconciliationFilters {
  vendorId?: string;
  status?: string;
  approvalStatus?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

class ReconciliationApiService {
  async getReconciliationSummaries(filters?: ReconciliationFilters): Promise<{
    success: boolean;
    data: InvoiceReconciliationSummary[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    await delay(500);
    
    let filteredData = [...mockReconciliationSummaries];
    
    // Apply filters
    if (filters?.vendorId) {
      filteredData = filteredData.filter(r => r.vendorId === filters.vendorId);
    }
    if (filters?.status) {
      filteredData = filteredData.filter(r => r.status === filters.status);
    }
    if (filters?.approvalStatus) {
      filteredData = filteredData.filter(r => r.approvalStatus === filters.approvalStatus);
    }
    
    // Pagination
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedData = filteredData.slice(start, end);
    
    return {
      success: true,
      data: paginatedData,
      pagination: {
        page,
        limit,
        total: filteredData.length,
        totalPages: Math.ceil(filteredData.length / limit),
      },
    };
    
    // return apiClient.get(API_ENDPOINTS.reconciliationSummaries, filters);
  }

  async getReconciliationSummaryById(id: string): Promise<{ success: boolean; data: InvoiceReconciliationSummary }> {
    await delay(300);
    const summary = mockReconciliationSummaries.find(r => r.id === id);
    if (!summary) {
      throw {
        code: 'NOT_FOUND',
        message: `Reconciliation summary with ID ${id} not found`,
        details: { id },
      };
    }
    return {
      success: true,
      data: summary,
    };
    
    // return apiClient.get(API_ENDPOINTS.reconciliationSummary(id));
  }

  async createReconciliationSummary(summaryData: Omit<InvoiceReconciliationSummary, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; data: InvoiceReconciliationSummary; message: string }> {
    await delay(800);
    const newSummary: InvoiceReconciliationSummary = {
      ...summaryData,
      id: `recon_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockReconciliationSummaries.push(newSummary);
    
    return {
      success: true,
      data: newSummary,
      message: 'Reconciliation summary created successfully',
    };
    
    // return apiClient.post(API_ENDPOINTS.reconciliationSummaries, summaryData);
  }

  async approveReconciliation(id: string, notes?: string): Promise<{ success: boolean; data: InvoiceReconciliationSummary; message: string }> {
    await delay(400);
    const summaryIndex = mockReconciliationSummaries.findIndex(r => r.id === id);
    if (summaryIndex === -1) {
      throw {
        code: 'NOT_FOUND',
        message: `Reconciliation summary with ID ${id} not found`,
        details: { id },
      };
    }
    
    const updatedSummary = {
      ...mockReconciliationSummaries[summaryIndex],
      approvalStatus: 'APPROVED' as const,
      approvedBy: 'admin',
      approvalDate: new Date().toISOString(),
      notes: notes || mockReconciliationSummaries[summaryIndex].notes,
      updatedAt: new Date().toISOString(),
    };
    mockReconciliationSummaries[summaryIndex] = updatedSummary;
    
    return {
      success: true,
      data: updatedSummary,
      message: 'Reconciliation approved successfully',
    };
    
    // return apiClient.put(API_ENDPOINTS.approveReconciliation(id), { notes });
  }

  async rejectReconciliation(id: string, reason: string): Promise<{ success: boolean; data: InvoiceReconciliationSummary; message: string }> {
    await delay(400);
    const summaryIndex = mockReconciliationSummaries.findIndex(r => r.id === id);
    if (summaryIndex === -1) {
      throw {
        code: 'NOT_FOUND',
        message: `Reconciliation summary with ID ${id} not found`,
        details: { id },
      };
    }
    
    const updatedSummary = {
      ...mockReconciliationSummaries[summaryIndex],
      approvalStatus: 'REJECTED' as const,
      approvedBy: 'admin',
      approvalDate: new Date().toISOString(),
      notes: reason,
      updatedAt: new Date().toISOString(),
    };
    mockReconciliationSummaries[summaryIndex] = updatedSummary;
    
    return {
      success: true,
      data: updatedSummary,
      message: 'Reconciliation rejected',
    };
    
    // return apiClient.put(API_ENDPOINTS.rejectReconciliation(id), { reason });
  }

  async getReconciliationStatus(invoiceId: string): Promise<{ success: boolean; data: ReconciliationStatus }> {
    await delay(300);
    
    // Return mock status - in real implementation, this would be specific to the invoice
    return {
      success: true,
      data: {
        ...mockReconciliationStatus,
        invoiceId,
      },
    };
    
    // return apiClient.get(API_ENDPOINTS.reconciliationStatus(invoiceId));
  }

  async updateReconciliationStatus(invoiceId: string, updates: Partial<ReconciliationStatus>): Promise<{ success: boolean; data: ReconciliationStatus; message: string }> {
    await delay(400);
    
    // Mock implementation - update the status
    const updatedStatus = {
      ...mockReconciliationStatus,
      ...updates,
      invoiceId,
      lastUpdated: new Date().toISOString(),
    };
    
    return {
      success: true,
      data: updatedStatus,
      message: 'Status updated successfully',
    };
    
    // return apiClient.put(API_ENDPOINTS.reconciliationStatus(invoiceId), updates);
  }
}

export const reconciliationApiService = new ReconciliationApiService();