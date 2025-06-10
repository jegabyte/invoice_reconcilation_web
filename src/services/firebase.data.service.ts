import { FirestoreService } from './firebase/firestore.service';
import { COLLECTIONS } from '@/config/constants';
import { 
    ExtractionResult, 
    InvoiceReconciliationSummary, 
    ReconciliationRule, 
    ReconciliationStatus, 
    VendorConfiguration 
} from '@/types/firestore';
import { 
    where, 
    orderBy, 
    limit, 
    QueryConstraint, 
    Timestamp
} from 'firebase/firestore';

export class DataService {
    // ==========================================
    // VENDOR CONFIGURATIONS
    // ==========================================
    
    static async getVendors(filters?: {
        isActive?: boolean;
        vendorType?: string;
    }): Promise<VendorConfiguration[]> {
        const constraints: QueryConstraint[] = [orderBy('vendorName')];
        
        if (filters?.isActive !== undefined) {
            constraints.push(where('isActive', '==', filters.isActive));
        }
        if (filters?.vendorType) {
            constraints.push(where('vendorType', '==', filters.vendorType));
        }
        
        return FirestoreService.list<VendorConfiguration>(
            COLLECTIONS.VENDOR_CONFIGURATIONS, 
            constraints
        );
    }
    
    static async getVendor(id: string): Promise<VendorConfiguration | null> {
        return FirestoreService.get<VendorConfiguration>(
            COLLECTIONS.VENDOR_CONFIGURATIONS, 
            id
        );
    }
    
    static async createVendor(vendor: Omit<VendorConfiguration, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        return FirestoreService.create(COLLECTIONS.VENDOR_CONFIGURATIONS, {
            ...vendor,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        });
    }
    
    static async updateVendor(id: string, updates: Partial<VendorConfiguration>): Promise<void> {
        return FirestoreService.update(COLLECTIONS.VENDOR_CONFIGURATIONS, id, {
            ...updates,
            updatedAt: Timestamp.now()
        });
    }
    
    static async deleteVendor(id: string): Promise<void> {
        return FirestoreService.delete(COLLECTIONS.VENDOR_CONFIGURATIONS, id);
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
        const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];
        
        if (filters?.vendorId) {
            constraints.push(where('vendorId', '==', filters.vendorId));
        }
        if (filters?.status) {
            constraints.push(where('status', '==', filters.status));
        }
        if (filters?.startDate) {
            constraints.push(where('invoiceDate', '>=', Timestamp.fromDate(filters.startDate)));
        }
        if (filters?.endDate) {
            constraints.push(where('invoiceDate', '<=', Timestamp.fromDate(filters.endDate)));
        }
        
        return FirestoreService.list<ExtractionResult>(
            COLLECTIONS.EXTRACTION_RESULTS, 
            constraints
        );
    }
    
    static async getExtractionResult(id: string): Promise<ExtractionResult | null> {
        return FirestoreService.get<ExtractionResult>(
            COLLECTIONS.EXTRACTION_RESULTS, 
            id
        );
    }
    
    static async createExtractionResult(result: Omit<ExtractionResult, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        return FirestoreService.create(COLLECTIONS.EXTRACTION_RESULTS, {
            ...result,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        });
    }
    
    static async updateExtractionResult(id: string, updates: Partial<ExtractionResult>): Promise<void> {
        return FirestoreService.update(COLLECTIONS.EXTRACTION_RESULTS, id, {
            ...updates,
            updatedAt: Timestamp.now()
        });
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
        const constraints: QueryConstraint[] = [orderBy('reconciliationDate', 'desc')];
        
        if (filters?.vendorId) {
            constraints.push(where('vendorId', '==', filters.vendorId));
        }
        if (filters?.status) {
            constraints.push(where('status', '==', filters.status));
        }
        if (filters?.startDate) {
            constraints.push(where('reconciliationDate', '>=', Timestamp.fromDate(filters.startDate)));
        }
        if (filters?.endDate) {
            constraints.push(where('reconciliationDate', '<=', Timestamp.fromDate(filters.endDate)));
        }
        
        return FirestoreService.list<InvoiceReconciliationSummary>(
            COLLECTIONS.INVOICE_RECONCILIATION_SUMMARIES, 
            constraints
        );
    }
    
    static async getReconciliationSummary(id: string): Promise<InvoiceReconciliationSummary | null> {
        return FirestoreService.get<InvoiceReconciliationSummary>(
            COLLECTIONS.INVOICE_RECONCILIATION_SUMMARIES, 
            id
        );
    }
    
    static async createReconciliationSummary(summary: Omit<InvoiceReconciliationSummary, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        return FirestoreService.create(COLLECTIONS.INVOICE_RECONCILIATION_SUMMARIES, {
            ...summary,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        });
    }
    
    static async updateReconciliationSummary(id: string, updates: Partial<InvoiceReconciliationSummary>): Promise<void> {
        return FirestoreService.update(COLLECTIONS.INVOICE_RECONCILIATION_SUMMARIES, id, {
            ...updates,
            updatedAt: Timestamp.now()
        });
    }
    
    // ==========================================
    // RECONCILIATION RULES
    // ==========================================
    
    static async getReconciliationRules(filters?: {
        vendorId?: string;
        isActive?: boolean;
        category?: string;
    }): Promise<ReconciliationRule[]> {
        const constraints: QueryConstraint[] = [orderBy('priority'), orderBy('createdAt', 'desc')];
        
        if (filters?.vendorId) {
            constraints.push(where('vendorId', '==', filters.vendorId));
        }
        if (filters?.isActive !== undefined) {
            constraints.push(where('isActive', '==', filters.isActive));
        }
        if (filters?.category) {
            constraints.push(where('category', '==', filters.category));
        }
        
        return FirestoreService.list<ReconciliationRule>(
            COLLECTIONS.RECONCILIATION_RULES, 
            constraints
        );
    }
    
    static async getReconciliationRule(id: string): Promise<ReconciliationRule | null> {
        return FirestoreService.get<ReconciliationRule>(
            COLLECTIONS.RECONCILIATION_RULES, 
            id
        );
    }
    
    static async createReconciliationRule(rule: Omit<ReconciliationRule, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>): Promise<string> {
        return FirestoreService.create(COLLECTIONS.RECONCILIATION_RULES, {
            ...rule,
            usageCount: 0,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        });
    }
    
    static async updateReconciliationRule(id: string, updates: Partial<ReconciliationRule>): Promise<void> {
        return FirestoreService.update(COLLECTIONS.RECONCILIATION_RULES, id, {
            ...updates,
            updatedAt: Timestamp.now()
        });
    }
    
    static async deleteReconciliationRule(id: string): Promise<void> {
        return FirestoreService.delete(COLLECTIONS.RECONCILIATION_RULES, id);
    }
    
    // ==========================================
    // RECONCILIATION STATUS
    // ==========================================
    
    static async getReconciliationStatuses(filters?: {
        vendorId?: string;
        currentStage?: string;
        overallStatus?: string;
    }): Promise<ReconciliationStatus[]> {
        const constraints: QueryConstraint[] = [orderBy('lastUpdated', 'desc')];
        
        if (filters?.vendorId) {
            constraints.push(where('vendorId', '==', filters.vendorId));
        }
        if (filters?.currentStage) {
            constraints.push(where('currentStage', '==', filters.currentStage));
        }
        if (filters?.overallStatus) {
            constraints.push(where('overallStatus', '==', filters.overallStatus));
        }
        
        return FirestoreService.list<ReconciliationStatus>(
            COLLECTIONS.RECONCILIATION_STATUS, 
            constraints
        );
    }
    
    static async getReconciliationStatus(id: string): Promise<ReconciliationStatus | null> {
        return FirestoreService.get<ReconciliationStatus>(
            COLLECTIONS.RECONCILIATION_STATUS, 
            id
        );
    }
    
    static async createReconciliationStatus(status: Omit<ReconciliationStatus, 'id' | 'lastUpdated'>): Promise<string> {
        return FirestoreService.create(COLLECTIONS.RECONCILIATION_STATUS, {
            ...status,
            lastUpdated: Timestamp.now()
        });
    }
    
    static async updateReconciliationStatus(id: string, updates: Partial<ReconciliationStatus>): Promise<void> {
        return FirestoreService.update(COLLECTIONS.RECONCILIATION_STATUS, id, {
            ...updates,
            lastUpdated: Timestamp.now()
        });
    }
    
    // ==========================================
    // REAL-TIME SUBSCRIPTIONS
    // ==========================================
    
    static subscribeToVendors(
        callback: (vendors: VendorConfiguration[]) => void,
        filters?: { isActive?: boolean }
    ): () => void {
        const constraints: QueryConstraint[] = [orderBy('vendorName')];
        
        if (filters?.isActive !== undefined) {
            constraints.push(where('isActive', '==', filters.isActive));
        }
        
        return FirestoreService.subscribe<VendorConfiguration>(
            COLLECTIONS.VENDOR_CONFIGURATIONS,
            constraints,
            callback
        );
    }
    
    static subscribeToExtractionResults(
        callback: (results: ExtractionResult[]) => void,
        filters?: { vendorId?: string; status?: string }
    ): () => void {
        const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc'), limit(50)];
        
        if (filters?.vendorId) {
            constraints.push(where('vendorId', '==', filters.vendorId));
        }
        if (filters?.status) {
            constraints.push(where('status', '==', filters.status));
        }
        
        return FirestoreService.subscribe<ExtractionResult>(
            COLLECTIONS.EXTRACTION_RESULTS,
            constraints,
            callback
        );
    }
    
    static subscribeToReconciliationStatus(
        invoiceId: string,
        callback: (status: ReconciliationStatus | null) => void
    ): () => void {
        return FirestoreService.subscribeToDoc<ReconciliationStatus>(
            COLLECTIONS.RECONCILIATION_STATUS,
            invoiceId,
            callback
        );
    }
    
    // ==========================================
    // UTILITY METHODS
    // ==========================================
    
    static async getStatistics() {
        const [vendors, extractions, summaries] = await Promise.all([
            this.getVendors({ isActive: true }),
            this.getExtractionResults({ status: 'COMPLETED' }),
            this.getReconciliationSummaries()
        ]);
        
        const totalAmount = summaries.reduce((sum, s) => sum + s.totalInvoiceAmount, 0);
        const reconciledAmount = summaries.reduce((sum, s) => sum + s.totalReconciledAmount, 0);
        
        return {
            activeVendors: vendors.length,
            totalExtractions: extractions.length,
            totalReconciliations: summaries.length,
            totalInvoiceAmount: totalAmount,
            totalReconciledAmount: reconciledAmount,
            averageVariance: summaries.length > 0 
                ? summaries.reduce((sum, s) => sum + s.variancePercentage, 0) / summaries.length
                : 0
        };
    }
}