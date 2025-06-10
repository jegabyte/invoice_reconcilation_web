import { apiClient } from './client';
import { API_ENDPOINTS } from './config';
import { mockVendors } from './mock-data';
import type { VendorConfiguration } from '@/types/api.types';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class VendorApiService {
  async getVendors(): Promise<{ success: boolean; data: VendorConfiguration[]; total: number }> {
    // Mock implementation
    await delay(500);
    return {
      success: true,
      data: mockVendors,
      total: mockVendors.length,
    };
    
    // Real implementation (commented out for now)
    // return apiClient.get(API_ENDPOINTS.vendors);
  }

  async getVendorById(id: string): Promise<{ success: boolean; data: VendorConfiguration }> {
    await delay(300);
    const vendor = mockVendors.find(v => v.id === id);
    if (!vendor) {
      throw {
        code: 'NOT_FOUND',
        message: `Vendor with ID ${id} not found`,
        details: { id },
      };
    }
    return {
      success: true,
      data: vendor,
    };
    
    // return apiClient.get(API_ENDPOINTS.vendor(id));
  }

  async createVendor(vendorData: Omit<VendorConfiguration, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; data: VendorConfiguration; message: string }> {
    await delay(600);
    const newVendor: VendorConfiguration = {
      ...vendorData,
      id: `vendor_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockVendors.push(newVendor);
    
    return {
      success: true,
      data: newVendor,
      message: 'Vendor created successfully',
    };
    
    // return apiClient.post(API_ENDPOINTS.vendors, vendorData);
  }

  async updateVendor(id: string, updates: Partial<VendorConfiguration>): Promise<{ success: boolean; data: VendorConfiguration; message: string }> {
    await delay(400);
    const vendorIndex = mockVendors.findIndex(v => v.id === id);
    if (vendorIndex === -1) {
      throw {
        code: 'NOT_FOUND',
        message: `Vendor with ID ${id} not found`,
        details: { id },
      };
    }
    
    const updatedVendor = {
      ...mockVendors[vendorIndex],
      ...updates,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString(),
    };
    mockVendors[vendorIndex] = updatedVendor;
    
    return {
      success: true,
      data: updatedVendor,
      message: 'Vendor updated successfully',
    };
    
    // return apiClient.put(API_ENDPOINTS.vendor(id), updates);
  }

  async deleteVendor(id: string): Promise<{ success: boolean; message: string }> {
    await delay(400);
    const vendorIndex = mockVendors.findIndex(v => v.id === id);
    if (vendorIndex === -1) {
      throw {
        code: 'NOT_FOUND',
        message: `Vendor with ID ${id} not found`,
        details: { id },
      };
    }
    
    mockVendors.splice(vendorIndex, 1);
    
    return {
      success: true,
      message: 'Vendor deleted successfully',
    };
    
    // return apiClient.delete(API_ENDPOINTS.vendor(id));
  }
}

export const vendorApiService = new VendorApiService();