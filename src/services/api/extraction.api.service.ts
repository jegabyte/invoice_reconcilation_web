import { apiClient } from './client';
import { API_ENDPOINTS } from './config';
import { mockExtractions } from './mock-data';
import type { ExtractionResult } from '@/types/api.types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface ExtractionFilters {
  vendorId?: string;
  status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REVIEW_REQUIRED';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

class ExtractionApiService {
  async getExtractions(filters?: ExtractionFilters): Promise<{
    success: boolean;
    data: ExtractionResult[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    await delay(500);
    
    let filteredData = [...mockExtractions];
    
    // Apply filters
    if (filters?.vendorId) {
      filteredData = filteredData.filter(e => e.vendorId === filters.vendorId);
    }
    if (filters?.status) {
      filteredData = filteredData.filter(e => e.status === filters.status);
    }
    if (filters?.startDate) {
      filteredData = filteredData.filter(e => e.invoiceDate >= filters.startDate);
    }
    if (filters?.endDate) {
      filteredData = filteredData.filter(e => e.invoiceDate <= filters.endDate);
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
    
    // return apiClient.get(API_ENDPOINTS.extractions, filters);
  }

  async getExtractionById(id: string): Promise<{ success: boolean; data: ExtractionResult }> {
    await delay(300);
    const extraction = mockExtractions.find(e => e.id === id);
    if (!extraction) {
      throw {
        code: 'NOT_FOUND',
        message: `Extraction with ID ${id} not found`,
        details: { id },
      };
    }
    return {
      success: true,
      data: extraction,
    };
    
    // return apiClient.get(API_ENDPOINTS.extraction(id));
  }

  async createExtraction(extractionData: any): Promise<{ success: boolean; data: ExtractionResult; message: string }> {
    await delay(800);
    const newExtraction: ExtractionResult = {
      ...extractionData,
      id: `ext_${Date.now()}`,
      status: 'PENDING',
      confidence: 0,
      errors: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockExtractions.push(newExtraction);
    
    return {
      success: true,
      data: newExtraction,
      message: 'Extraction created successfully',
    };
    
    // return apiClient.post(API_ENDPOINTS.extractions, extractionData);
  }

  async updateExtraction(id: string, updates: Partial<ExtractionResult>): Promise<{ success: boolean; data: ExtractionResult; message: string }> {
    await delay(400);
    const extractionIndex = mockExtractions.findIndex(e => e.id === id);
    if (extractionIndex === -1) {
      throw {
        code: 'NOT_FOUND',
        message: `Extraction with ID ${id} not found`,
        details: { id },
      };
    }
    
    const updatedExtraction = {
      ...mockExtractions[extractionIndex],
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    };
    mockExtractions[extractionIndex] = updatedExtraction;
    
    return {
      success: true,
      data: updatedExtraction,
      message: 'Extraction updated successfully',
    };
    
    // return apiClient.put(API_ENDPOINTS.extraction(id), updates);
  }

  async uploadInvoice(formData: FormData): Promise<{ success: boolean; data: ExtractionResult; message: string }> {
    await delay(2000); // Simulate longer processing time
    
    // Mock response for file upload
    const newExtraction: ExtractionResult = {
      id: `ext_${Date.now()}`,
      invoiceId: `inv_${Date.now()}`,
      vendorId: 'vendor_001',
      vendorName: 'Booking.com',
      invoiceNumber: `UPLOAD-${Date.now()}`,
      invoiceDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      totalAmount: 1000,
      currency: 'USD',
      extractedData: {
        headerInfo: {},
        lineItems: [],
        summary: {
          subtotal: 1000,
          tax: 0,
          fees: 0,
          total: 1000,
        },
      },
      extractionMethod: 'OCR',
      confidence: 0.85,
      status: 'COMPLETED',
      errors: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockExtractions.push(newExtraction);
    
    return {
      success: true,
      data: newExtraction,
      message: 'Invoice uploaded and processed successfully',
    };
    
    // return apiClient.upload(API_ENDPOINTS.extractions, formData);
  }
}

export const extractionApiService = new ExtractionApiService();