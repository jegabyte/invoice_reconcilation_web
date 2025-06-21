import { apiClient } from './client';
import { API_ENDPOINTS } from './config';
import type { VendorConfiguration } from '@/types/api.types';

// Convert API response to VendorConfiguration format
function mapApiVendorToConfiguration(apiVendor: any): VendorConfiguration {
  // If the backend already transformed the data, use it directly
  if (apiVendor.vendorCode && apiVendor.vendorName) {
    return apiVendor as VendorConfiguration;
  }
  
  // Otherwise, do the mapping from snake_case to camelCase
  return {
    id: apiVendor.vendor_id || apiVendor.id,
    vendorCode: apiVendor.vendor_id || apiVendor.vendor_code || '',
    vendorName: apiVendor.vendor_name || '',
    vendorType: apiVendor.vendor_type || 'OTHER',
    isActive: apiVendor.active !== undefined ? apiVendor.active : apiVendor.isActive,
    businessModel: apiVendor.businessModel || apiVendor.business_model || 'NET_RATE',
    integrationSettings: apiVendor.integrationSettings || {
      apiEndpoint: null,
      apiKey: null,
      ftpDetails: null,
      defaultTolerances: apiVendor.integration_settings?.default_tolerances,
      bookingIdProcessing: apiVendor.integration_settings?.booking_id_processing,
      idField: apiVendor.integration_settings?.id_field,
      idPrefix: apiVendor.integration_settings?.id_prefix,
      defaultRulePriority: apiVendor.integration_settings?.default_rule_priority,
      emailSettings: {
        incomingEmail: apiVendor.contact_info?.primary_email || apiVendor.contact_information?.pic_email || '',
        supportEmail: apiVendor.contact_info?.escalation_email || apiVendor.contact_information?.support_email || '',
      },
    },
    invoiceSettings: apiVendor.invoiceSettings || {
      defaultCurrency: apiVendor.invoice_settings?.currency_code || 'USD',
      invoicePrefix: apiVendor.vendor_id || '',
      dueDays: 30,
      paymentTerms: 'Net 30',
      taxRate: 0,
      currencyCode: apiVendor.invoice_settings?.currency_code,
      invoiceFrequency: apiVendor.invoice_settings?.invoice_frequency,
      invoiceFormats: apiVendor.invoice_settings?.invoice_formats,
    },
    extractionSettings: apiVendor.extractionSettings || {
      templateId: apiVendor.extraction_template_id || apiVendor.extraction_settings?.template_id || '',
      extractionModel: apiVendor.extraction_settings?.extraction_model,
      confidenceThreshold: apiVendor.extraction_settings?.confidence_threshold,
      manualReviewThreshold: apiVendor.extraction_settings?.manual_review_threshold,
      autoReviewThreshold: apiVendor.extraction_settings?.auto_review_threshold,
      requiredFields: apiVendor.extraction_settings?.required_fields,
      customFields: [],
      dateFormat: 'YYYY-MM-DD',
      numberFormat: 'en-US',
    },
    reconciliationSettings: apiVendor.reconciliationSettings || {
      autoReconcile: apiVendor.reconciliation_settings?.allow_auto_approval || false,
      allowAutoApproval: apiVendor.reconciliation_settings?.allow_auto_approval,
      matchingThreshold: apiVendor.business_rules?.auto_approve_threshold || apiVendor.extraction_settings?.auto_review_threshold || 0.95,
      autoApprovalThreshold: apiVendor.reconciliation_settings?.auto_approval_threshold,
      holdThreshold: apiVendor.reconciliation_settings?.hold_threshold,
      futureBookingThreshold: apiVendor.reconciliation_settings?.future_booking_threshold,
      cancelledBookingRefundDays: apiVendor.reconciliation_settings?.cancelled_booking_refund_days,
      cancellationHandling: apiVendor.reconciliation_settings?.cancellation_handling,
      penaltyPercentageRange: apiVendor.reconciliation_settings?.penalty_percentage_range,
      defaultRules: [],
      bookingSourceField: 'booking_id',
      amountTolerancePercentage: apiVendor.tolerance_percentage || 2.0,
    },
    contacts: apiVendor.contacts || [],
    metadata: apiVendor.metadata,
    createdAt: apiVendor.createdAt || apiVendor.created_at || new Date().toISOString(),
    updatedAt: apiVendor.updatedAt || apiVendor.updated_at || new Date().toISOString(),
    createdBy: apiVendor.createdBy || apiVendor.created_by,
    updatedBy: apiVendor.updatedBy || apiVendor.updated_by,
    // Include snake_case properties for backward compatibility
    vendor_code: apiVendor.vendor_id || apiVendor.vendor_code || '',
    vendor_name: apiVendor.vendor_name || '',
    vendor_type: apiVendor.vendor_type || 'OTHER',
    is_active: apiVendor.active !== undefined ? apiVendor.active : apiVendor.isActive,
    business_model: apiVendor.business_model || 'NET_RATE',
    created_at: apiVendor.created_at || new Date().toISOString(),
    updated_at: apiVendor.updated_at || new Date().toISOString(),
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
    try {
      const response = await apiClient.post<any>(API_ENDPOINTS.vendors, vendorData);
      return {
        success: true,
        data: mapApiVendorToConfiguration(response),
        message: 'Vendor created successfully',
      };
    } catch (error) {
      console.error('Error creating vendor:', error);
      throw error;
    }
  }

  async updateVendor(id: string, updates: Partial<VendorConfiguration>): Promise<{ success: boolean; data: VendorConfiguration; message: string }> {
    try {
      const response = await apiClient.put<any>(API_ENDPOINTS.vendor(id), updates);
      return {
        success: true,
        data: mapApiVendorToConfiguration(response),
        message: 'Vendor updated successfully',
      };
    } catch (error) {
      console.error('Error updating vendor:', error);
      throw error;
    }
  }

  async deleteVendor(id: string): Promise<{ success: boolean; message: string }> {
    try {
      await apiClient.delete(API_ENDPOINTS.vendor(id));
      return {
        success: true,
        message: 'Vendor deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting vendor:', error);
      throw error;
    }
  }
}

export const vendorApiService = new VendorApiService();