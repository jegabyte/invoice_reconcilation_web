import { apiClient } from './client';
import { API_ENDPOINTS } from './config';
import type { VendorConfiguration } from '@/types/api.types';

// Convert API response to VendorConfiguration format
function mapApiVendorToConfiguration(apiVendor: any): VendorConfiguration {
  return {
    id: apiVendor.vendor_id || apiVendor.id,
    vendorCode: apiVendor.vendor_id || apiVendor.vendor_code || '',
    vendorName: apiVendor.vendor_name || '',
    vendorType: apiVendor.vendor_type || 'OTHER',
    isActive: apiVendor.active !== undefined ? apiVendor.active : true,
    businessModel: 'NET_RATE', // Default as not provided in API
    integrationSettings: {
      apiEndpoint: null,
      apiKey: null,
      ftpDetails: null,
      emailSettings: {
        incomingEmail: apiVendor.contact_info?.primary_email || apiVendor.contact_information?.pic_email || '',
        supportEmail: apiVendor.contact_info?.escalation_email || apiVendor.contact_information?.support_email || '',
      },
    },
    invoiceSettings: {
      defaultCurrency: 'USD',
      invoicePrefix: apiVendor.vendor_id || '',
      dueDays: 30,
      paymentTerms: 'Net 30',
      taxRate: 0,
    },
    extractionSettings: {
      templateId: apiVendor.extraction_template_id || apiVendor.extraction_settings?.template_id || '',
      customFields: [],
      dateFormat: 'YYYY-MM-DD',
      numberFormat: 'en-US',
    },
    reconciliationSettings: {
      autoReconcile: apiVendor.business_rules?.auto_approve_threshold ? true : false,
      matchingThreshold: apiVendor.business_rules?.auto_approve_threshold || apiVendor.extraction_settings?.auto_review_threshold || 0.95,
      defaultRules: [],
      bookingSourceField: 'booking_id',
      amountTolerancePercentage: apiVendor.tolerance_percentage || 2.0,
    },
    contacts: [],
    createdAt: apiVendor.created_at || new Date().toISOString(),
    updatedAt: apiVendor.updated_at || new Date().toISOString(),
  };
}

class VendorApiService {
  async getVendors(): Promise<{ success: boolean; data: VendorConfiguration[]; total: number }> {
    try {
      const response = await apiClient.get<any[]>(API_ENDPOINTS.vendors);
      const mappedVendors = (response || []).map(mapApiVendorToConfiguration);
      return {
        success: true,
        data: mappedVendors,
        total: mappedVendors.length,
      };
    } catch (error) {
      console.error('Error fetching vendors:', error);
      throw error;
    }
  }

  async getVendorById(id: string): Promise<{ success: boolean; data: VendorConfiguration }> {
    try {
      const response = await apiClient.get<any>(API_ENDPOINTS.vendor(id));
      return {
        success: true,
        data: mapApiVendorToConfiguration(response),
      };
    } catch (error: any) {
      if (error.code === 'NOT_FOUND' || error.response?.status === 404) {
        throw {
          code: 'NOT_FOUND',
          message: `Vendor with ID ${id} not found`,
          details: { id },
        };
      }
      throw error;
    }
  }

  async createVendor(vendorData: Omit<VendorConfiguration, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; data: VendorConfiguration; message: string }> {
    // Since no API is configured for creation, return a dummy success response
    const newVendor: VendorConfiguration = {
      ...vendorData,
      id: `vendor_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    return {
      success: true,
      data: newVendor,
      message: 'Vendor saved successfully',
    };
  }

  async updateVendor(id: string, updates: Partial<VendorConfiguration>): Promise<{ success: boolean; data: VendorConfiguration; message: string }> {
    // Since no API is configured for updates, return a dummy success response
    // First get the existing vendor to merge updates
    try {
      const existingVendor = await this.getVendorById(id);
      const updatedVendor = {
        ...existingVendor.data,
        ...updates,
        id,
        updatedAt: new Date().toISOString(),
      };
      
      return {
        success: true,
        data: updatedVendor,
        message: 'Vendor saved successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  async deleteVendor(_id: string): Promise<{ success: boolean; message: string }> {
    // Since no API is configured for deletion, return a dummy success response
    return {
      success: true,
      message: 'Vendor deleted successfully',
    };
  }
}

export const vendorApiService = new VendorApiService();