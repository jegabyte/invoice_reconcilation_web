import {
    vendorApiService,
    extractionApiService,
    reconciliationApiService,
    rulesApiService,
    statisticsApiService
} from './api';
import type {
    ExtractionResult,
    InvoiceReconciliationSummary,
    ReconciliationRule,
    ReconciliationStatus,
    VendorConfiguration
} from '@/types/api.types';

export class ApiDataService {
    // ==========================================
    // VENDOR CONFIGURATIONS
    // ==========================================
    
    static async getVendors(filters?: {
        isActive?: boolean;
        vendorType?: string;
    }): Promise<VendorConfiguration[]> {
        const response = await vendorApiService.getVendors();
        let vendors = response.data;
        
        // Apply client-side filtering
        if (filters?.isActive !== undefined) {
            vendors = vendors.filter(v => v.isActive === filters.isActive);
        }
        if (filters?.vendorType) {
            vendors = vendors.filter(v => v.vendorType === filters.vendorType);
        }
        
        return vendors;
    }
    
    static async getVendor(id: string): Promise<VendorConfiguration | null> {
        try {
            const response = await vendorApiService.getVendorById(id);
            return response.data;
        } catch (error: any) {
            if (error.code === 'NOT_FOUND') {
                return null;
            }
            throw error;
        }
    }
    
    static async createVendor(vendor: Omit<VendorConfiguration, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        const response = await vendorApiService.createVendor(vendor);
        return response.data.id!;
    }
    
    static async updateVendor(id: string, updates: Partial<VendorConfiguration>): Promise<void> {
        await vendorApiService.updateVendor(id, updates);
    }
    
    static async deleteVendor(id: string): Promise<void> {
        await vendorApiService.deleteVendor(id);
    }
    
    // ==========================================
    // EXTRACTION RESULTS
    // ==========================================
    
    static async getExtractionResults(filters?: {
        vendorId?: string;
        status?: string;
        startDate?: Date;
        endDate?: Date;
    }): Promise<ExtractionResult[]> {
        const response = await extractionApiService.getExtractions({
            vendorId: filters?.vendorId,
            status: filters?.status as any,
            startDate: filters?.startDate?.toISOString(),
            endDate: filters?.endDate?.toISOString(),
        });
        return response.data;
    }
    
    static async getExtractionResult(id: string): Promise<ExtractionResult | null> {
        try {
            const response = await extractionApiService.getExtractionById(id);
            return response.data;
        } catch (error: any) {
            if (error.code === 'NOT_FOUND') {
                return null;
            }
            throw error;
        }
    }
    
    static async createExtractionResult(result: Omit<ExtractionResult, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        const response = await extractionApiService.createExtraction(result);
        return response.data.id!;
    }
    
    static async updateExtractionResult(id: string, updates: Partial<ExtractionResult>): Promise<void> {
        await extractionApiService.updateExtraction(id, updates);
    }
    
    // ==========================================
    // RECONCILIATION SUMMARIES
    // ==========================================
    
    static async getReconciliationSummaries(filters?: {
        vendorId?: string;
        status?: string;
        startDate?: Date;
        endDate?: Date;
    }): Promise<InvoiceReconciliationSummary[]> {
        const response = await reconciliationApiService.getReconciliationSummaries({
            vendorId: filters?.vendorId,
            status: filters?.status,
            startDate: filters?.startDate?.toISOString(),
            endDate: filters?.endDate?.toISOString(),
        });
        return response.data;
    }
    
    static async getReconciliationSummary(id: string): Promise<InvoiceReconciliationSummary | null> {
        try {
            const response = await reconciliationApiService.getReconciliationSummaryById(id);
            return response.data;
        } catch (error: any) {
            if (error.code === 'NOT_FOUND') {
                return null;
            }
            throw error;
        }
    }
    
    static async createReconciliationSummary(summary: Omit<InvoiceReconciliationSummary, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        const response = await reconciliationApiService.createReconciliationSummary(summary);
        return response.data.id!;
    }
    
    static async updateReconciliationSummary(id: string, updates: Partial<InvoiceReconciliationSummary>): Promise<void> {
        if (updates.approvalStatus === 'APPROVED') {
            await reconciliationApiService.approveReconciliation(id, updates.notes);
        } else if (updates.approvalStatus === 'REJECTED') {
            await reconciliationApiService.rejectReconciliation(id, updates.notes || 'Rejected');
        } else {
            // For other updates, use the general update endpoint
            // This would need to be implemented in the API service
        }
    }
    
    // ==========================================
    // RECONCILIATION RULES
    // ==========================================
    
    static async getReconciliationRules(filters?: {
        vendorId?: string;
        isActive?: boolean;
        category?: string;
    }): Promise<ReconciliationRule[]> {
        const response = await rulesApiService.getRules({
            vendorId: filters?.vendorId,
            isActive: filters?.isActive,
            category: filters?.category,
        });
        return response.data;
    }
    
    static async getReconciliationRule(id: string): Promise<ReconciliationRule | null> {
        try {
            const response = await rulesApiService.getRuleById(id);
            return response.data;
        } catch (error: any) {
            if (error.code === 'NOT_FOUND') {
                return null;
            }
            throw error;
        }
    }
    
    static async createReconciliationRule(rule: Omit<ReconciliationRule, 'id' | 'createdAt' | 'updatedAt' | 'lastUsed' | 'usageCount'>): Promise<string> {
        const response = await rulesApiService.createRule(rule);
        return response.data.id!;
    }
    
    static async updateReconciliationRule(id: string, updates: Partial<ReconciliationRule>): Promise<void> {
        await rulesApiService.updateRule(id, updates);
    }
    
    static async deleteReconciliationRule(id: string): Promise<void> {
        await rulesApiService.deleteRule(id);
    }
    
    // ==========================================
    // RECONCILIATION STATUS
    // ==========================================
    
    static async getReconciliationStatuses(_filters?: {
        vendorId?: string;
        currentStage?: string;
        overallStatus?: string;
    }): Promise<ReconciliationStatus[]> {
        // This would need to be implemented with a list endpoint
        // For now, return empty array
        return [];
    }
    
    static async getReconciliationStatus(invoiceId: string): Promise<ReconciliationStatus | null> {
        try {
            const response = await reconciliationApiService.getReconciliationStatus(invoiceId);
            return response.data;
        } catch (error: any) {
            if (error.code === 'NOT_FOUND') {
                return null;
            }
            throw error;
        }
    }
    
    static async createReconciliationStatus(_status: Omit<ReconciliationStatus, 'id' | 'lastUpdated'>): Promise<string> {
        // This would need to be implemented in the API service
        return `status_${Date.now()}`;
    }
    
    static async updateReconciliationStatus(invoiceId: string, updates: Partial<ReconciliationStatus>): Promise<void> {
        await reconciliationApiService.updateReconciliationStatus(invoiceId, updates);
    }
    
    // ==========================================
    // REAL-TIME SUBSCRIPTIONS
    // ==========================================
    
    // Note: Real-time subscriptions are not available in REST API
    // These methods return no-op unsubscribe functions
    
    static subscribeToVendors(
        callback: (vendors: VendorConfiguration[]) => void,
        filters?: { isActive?: boolean }
    ): () => void {
        // Initial load
        this.getVendors(filters).then(callback).catch(console.error);
        
        // Return no-op unsubscribe
        return () => {};
    }
    
    static subscribeToExtractionResults(
        callback: (results: ExtractionResult[]) => void,
        filters?: { vendorId?: string; status?: string }
    ): () => void {
        // Initial load
        this.getExtractionResults(filters).then(callback).catch(console.error);
        
        // Return no-op unsubscribe
        return () => {};
    }
    
    static subscribeToReconciliationStatus(
        invoiceId: string,
        callback: (status: ReconciliationStatus | null) => void
    ): () => void {
        // Initial load
        this.getReconciliationStatus(invoiceId).then(callback).catch(console.error);
        
        // Return no-op unsubscribe
        return () => {};
    }
    
    // ==========================================
    // UTILITY METHODS
    // ==========================================
    
    static async getStatistics() {
        const response = await statisticsApiService.getStatistics();
        return response.data;
    }
    
    // ==========================================
    // LINE ITEMS
    // ==========================================
    
    static async getLineItems(_invoiceId: string): Promise<any[]> {
        // This would need to be implemented with a specific endpoint
        // For now, return empty array
        return [];
    }
    
    static async getLineItemValidationResults(_lineItemId: string): Promise<any[]> {
        // This would need to be implemented with a specific endpoint
        // For now, return empty array
        return [];
    }
}