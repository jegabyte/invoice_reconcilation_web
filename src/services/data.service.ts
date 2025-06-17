import { firebaseDataService } from './firebase';
import { apiDataService } from './api.data.service';
import * as ApiTypes from '@/types/api.types';

// Check if Firebase is enabled via environment variable
const USE_FIREBASE = import.meta.env.VITE_ENABLE_FIREBASE === 'true';

// Interface for data service to ensure both implementations have the same API
interface IDataService {
  // Vendors
  getAllVendors(filters?: any): Promise<ApiTypes.VendorConfiguration[]>;
  getVendorById(id: string): Promise<ApiTypes.VendorConfiguration | null>;
  createVendor(data: Omit<ApiTypes.VendorConfiguration, 'id'>): Promise<ApiTypes.VendorConfiguration>;
  updateVendor(id: string, data: Partial<ApiTypes.VendorConfiguration>): Promise<void>;
  deleteVendor(id: string): Promise<void>;
  subscribeToVendors(callback: (vendors: ApiTypes.VendorConfiguration[]) => void): () => void;

  // Extractions
  getAllExtractions(filters?: any): Promise<ApiTypes.ExtractionResult[]>;
  getExtractionById(id: string): Promise<ApiTypes.ExtractionResult | null>;
  getExtractionByInvoiceId(invoiceId: string): Promise<ApiTypes.ExtractionResult | null>;
  createExtraction(data: Omit<ApiTypes.ExtractionResult, 'id'>): Promise<ApiTypes.ExtractionResult>;
  updateExtraction(id: string, data: Partial<ApiTypes.ExtractionResult>): Promise<void>;
  deleteExtraction(id: string): Promise<void>;
  subscribeToExtractions(filters: any, callback: (extractions: ApiTypes.ExtractionResult[]) => void): () => void;

  // Reconciliations
  getAllReconciliations(filters?: any): Promise<ApiTypes.InvoiceReconciliationSummary[]>;
  getReconciliationById(id: string): Promise<ApiTypes.InvoiceReconciliationSummary | null>;
  getReconciliationByInvoiceId(invoiceId: string): Promise<ApiTypes.InvoiceReconciliationSummary | null>;
  createReconciliation(data: Omit<ApiTypes.InvoiceReconciliationSummary, 'id'>): Promise<ApiTypes.InvoiceReconciliationSummary>;
  updateReconciliation(id: string, data: Partial<ApiTypes.InvoiceReconciliationSummary>): Promise<void>;
  deleteReconciliation(id: string): Promise<void>;
  approveReconciliation(id: string, approvedBy: string, notes?: string): Promise<void>;
  rejectReconciliation(id: string, rejectedBy: string, notes: string): Promise<void>;
  subscribeToReconciliations(filters: any, callback: (reconciliations: ApiTypes.InvoiceReconciliationSummary[]) => void): () => void;

  // Rules
  getAllRules(filters?: any): Promise<ApiTypes.ReconciliationRule[]>;
  getRuleById(id: string): Promise<ApiTypes.ReconciliationRule | null>;
  getActiveRulesForVendor(vendorId: string): Promise<ApiTypes.ReconciliationRule[]>;
  createRule(data: Omit<ApiTypes.ReconciliationRule, 'id'>): Promise<ApiTypes.ReconciliationRule>;
  updateRule(id: string, data: Partial<ApiTypes.ReconciliationRule>): Promise<void>;
  deleteRule(id: string): Promise<void>;
  toggleRuleStatus(id: string, isActive: boolean): Promise<void>;
  subscribeToRules(filters: any, callback: (rules: ApiTypes.ReconciliationRule[]) => void): () => void;

  // Status
  getAllStatuses(filters?: any): Promise<ApiTypes.ReconciliationStatus[]>;
  getStatusById(id: string): Promise<ApiTypes.ReconciliationStatus | null>;
  getStatusByInvoiceId(invoiceId: string): Promise<ApiTypes.ReconciliationStatus | null>;
  createStatus(data: Omit<ApiTypes.ReconciliationStatus, 'id'>): Promise<ApiTypes.ReconciliationStatus>;
  updateStatus(id: string, data: Partial<ApiTypes.ReconciliationStatus>): Promise<void>;
  updateProgress(id: string, stage: string, progress: ApiTypes.ProgressInfo): Promise<void>;
  subscribeToStatus(invoiceId: string, callback: (status: ApiTypes.ReconciliationStatus | null) => void): () => void;
}

class UnifiedDataService implements IDataService {
  private service: typeof firebaseDataService | typeof apiDataService;
  private useFirebase: boolean;

  constructor() {
    this.useFirebase = USE_FIREBASE;
    this.service = this.useFirebase ? firebaseDataService : apiDataService;
    console.log(`Data Service initialized with ${this.useFirebase ? 'Firebase' : 'REST API'}`);
  }

  // Vendors
  async getAllVendors(filters?: any) {
    if (this.useFirebase) {
      return firebaseDataService.vendors.getAllVendors(filters);
    }
    return apiDataService.getVendors();
  }

  async getVendorById(id: string) {
    if (this.useFirebase) {
      return firebaseDataService.vendors.getVendorById(id);
    }
    return apiDataService.getVendorById(id);
  }

  async createVendor(data: Omit<ApiTypes.VendorConfiguration, 'id'>) {
    if (this.useFirebase) {
      return firebaseDataService.vendors.createVendor(data);
    }
    return apiDataService.createVendor(data);
  }

  async updateVendor(id: string, data: Partial<ApiTypes.VendorConfiguration>) {
    if (this.useFirebase) {
      return firebaseDataService.vendors.updateVendor(id, data);
    }
    return apiDataService.updateVendor(id, data);
  }

  async deleteVendor(id: string) {
    if (this.useFirebase) {
      return firebaseDataService.vendors.deleteVendor(id);
    }
    return apiDataService.deleteVendor(id);
  }

  subscribeToVendors(callback: (vendors: ApiTypes.VendorConfiguration[]) => void) {
    if (this.useFirebase) {
      return firebaseDataService.vendors.subscribeToVendors(callback);
    }
    return apiDataService.subscribeToVendors(callback);
  }

  // Extractions
  async getAllExtractions(filters?: any) {
    if (this.useFirebase) {
      return firebaseDataService.extractions.getAllExtractions(filters);
    }
    return apiDataService.getExtractions();
  }

  async getExtractionById(id: string) {
    if (this.useFirebase) {
      return firebaseDataService.extractions.getExtractionById(id);
    }
    return apiDataService.getExtractionById(id);
  }

  async getExtractionByInvoiceId(invoiceId: string) {
    if (this.useFirebase) {
      return firebaseDataService.extractions.getExtractionByInvoiceId(invoiceId);
    }
    return apiDataService.getExtractionByInvoiceId(invoiceId);
  }

  async createExtraction(data: Omit<ApiTypes.ExtractionResult, 'id'>) {
    if (this.useFirebase) {
      return firebaseDataService.extractions.createExtractionResult(data);
    }
    return apiDataService.createExtraction(data);
  }

  async updateExtraction(id: string, data: Partial<ApiTypes.ExtractionResult>) {
    if (this.useFirebase) {
      return firebaseDataService.extractions.updateExtractionResult(id, data);
    }
    return apiDataService.updateExtraction(id, data);
  }

  async deleteExtraction(id: string) {
    if (this.useFirebase) {
      return firebaseDataService.extractions.deleteExtractionResult(id);
    }
    return apiDataService.deleteExtraction(id);
  }

  subscribeToExtractions(filters: any, callback: (extractions: ApiTypes.ExtractionResult[]) => void) {
    if (this.useFirebase) {
      return firebaseDataService.extractions.subscribeToExtractions(filters, callback);
    }
    return apiDataService.subscribeToExtractions(callback);
  }

  // Reconciliations
  async getAllReconciliations(filters?: any) {
    if (this.useFirebase) {
      return firebaseDataService.reconciliations.getAllReconciliations(filters);
    }
    return apiDataService.getReconciliations();
  }

  async getReconciliationById(id: string) {
    if (this.useFirebase) {
      return firebaseDataService.reconciliations.getReconciliationById(id);
    }
    return apiDataService.getReconciliationById(id);
  }

  async getReconciliationByInvoiceId(invoiceId: string) {
    if (this.useFirebase) {
      return firebaseDataService.reconciliations.getReconciliationByInvoiceId(invoiceId);
    }
    return apiDataService.getReconciliationByInvoiceId(invoiceId);
  }

  async createReconciliation(data: Omit<ApiTypes.InvoiceReconciliationSummary, 'id'>) {
    if (this.useFirebase) {
      return firebaseDataService.reconciliations.createReconciliationSummary(data);
    }
    return apiDataService.createReconciliation(data);
  }

  async updateReconciliation(id: string, data: Partial<ApiTypes.InvoiceReconciliationSummary>) {
    if (this.useFirebase) {
      return firebaseDataService.reconciliations.updateReconciliationSummary(id, data);
    }
    return apiDataService.updateReconciliation(id, data);
  }

  async deleteReconciliation(id: string) {
    if (this.useFirebase) {
      return firebaseDataService.reconciliations.deleteReconciliationSummary(id);
    }
    return apiDataService.deleteReconciliation(id);
  }

  async approveReconciliation(id: string, approvedBy: string, notes?: string) {
    if (this.useFirebase) {
      return firebaseDataService.reconciliations.approveReconciliation(id, approvedBy, notes);
    }
    return apiDataService.approveReconciliation(id, approvedBy, notes || '');
  }

  async rejectReconciliation(id: string, rejectedBy: string, notes: string) {
    if (this.useFirebase) {
      return firebaseDataService.reconciliations.rejectReconciliation(id, rejectedBy, notes);
    }
    return apiDataService.rejectReconciliation(id, rejectedBy, notes);
  }

  subscribeToReconciliations(filters: any, callback: (reconciliations: ApiTypes.InvoiceReconciliationSummary[]) => void) {
    if (this.useFirebase) {
      return firebaseDataService.reconciliations.subscribeToReconciliations(filters, callback);
    }
    return apiDataService.subscribeToReconciliations(callback);
  }

  // Rules
  async getAllRules(filters?: any) {
    if (this.useFirebase) {
      return firebaseDataService.rules.getAllRules(filters);
    }
    return apiDataService.getRules();
  }

  async getRuleById(id: string) {
    if (this.useFirebase) {
      return firebaseDataService.rules.getRuleById(id);
    }
    return apiDataService.getRuleById(id);
  }

  async getActiveRulesForVendor(vendorId: string) {
    if (this.useFirebase) {
      return firebaseDataService.rules.getActiveRulesForVendor(vendorId);
    }
    return apiDataService.getRulesByVendor(vendorId);
  }

  async createRule(data: Omit<ApiTypes.ReconciliationRule, 'id'>) {
    if (this.useFirebase) {
      return firebaseDataService.rules.createRule(data);
    }
    return apiDataService.createRule(data);
  }

  async updateRule(id: string, data: Partial<ApiTypes.ReconciliationRule>) {
    if (this.useFirebase) {
      return firebaseDataService.rules.updateRule(id, data);
    }
    return apiDataService.updateRule(id, data);
  }

  async deleteRule(id: string) {
    if (this.useFirebase) {
      return firebaseDataService.rules.deleteRule(id);
    }
    return apiDataService.deleteRule(id);
  }

  async toggleRuleStatus(id: string, isActive: boolean) {
    if (this.useFirebase) {
      return firebaseDataService.rules.toggleRuleStatus(id, isActive);
    }
    return apiDataService.updateRule(id, { isActive });
  }

  subscribeToRules(filters: any, callback: (rules: ApiTypes.ReconciliationRule[]) => void) {
    if (this.useFirebase) {
      return firebaseDataService.rules.subscribeToRules(filters, callback);
    }
    return apiDataService.subscribeToRules(callback);
  }

  // Status
  async getAllStatuses(filters?: any) {
    if (this.useFirebase) {
      return firebaseDataService.status.getAllStatuses(filters);
    }
    return apiDataService.getStatuses();
  }

  async getStatusById(id: string) {
    if (this.useFirebase) {
      return firebaseDataService.status.getStatusById(id);
    }
    return apiDataService.getStatusById(id);
  }

  async getStatusByInvoiceId(invoiceId: string) {
    if (this.useFirebase) {
      return firebaseDataService.status.getStatusByInvoiceId(invoiceId);
    }
    return apiDataService.getStatusByInvoiceId(invoiceId);
  }

  async createStatus(data: Omit<ApiTypes.ReconciliationStatus, 'id'>) {
    if (this.useFirebase) {
      return firebaseDataService.status.createStatus(data);
    }
    return apiDataService.createStatus(data);
  }

  async updateStatus(id: string, data: Partial<ApiTypes.ReconciliationStatus>) {
    if (this.useFirebase) {
      return firebaseDataService.status.updateStatus(id, data);
    }
    return apiDataService.updateStatus(id, data);
  }

  async updateProgress(id: string, stage: string, progress: ApiTypes.ProgressInfo) {
    if (this.useFirebase) {
      return firebaseDataService.status.updateProgress(id, stage as any, progress);
    }
    return apiDataService.updateStatus(id, {
      progress: {
        [stage]: progress
      } as any
    });
  }

  subscribeToStatus(invoiceId: string, callback: (status: ApiTypes.ReconciliationStatus | null) => void) {
    if (this.useFirebase) {
      return firebaseDataService.status.subscribeToStatus(invoiceId, callback);
    }
    // Mock subscription for API
    return () => {};
  }

  // Utility methods
  async getDashboardStats() {
    if (this.useFirebase) {
      return firebaseDataService.getDashboardStats();
    }
    // Mock stats for API
    const [vendors, reconciliations] = await Promise.all([
      this.getAllVendors(),
      this.getAllReconciliations()
    ]);
    
    return {
      totalVendors: vendors.length,
      activeVendors: vendors.filter(v => v.isActive).length,
      reconciliationStats: {
        total: reconciliations.length,
        matched: reconciliations.filter(r => r.status === 'MATCHED').length,
        mismatched: reconciliations.filter(r => r.status === 'MISMATCHED').length,
        pending: reconciliations.filter(r => r.status === 'PENDING').length,
        disputed: reconciliations.filter(r => r.status === 'DISPUTED').length
      },
      activeProcessing: 0,
      processingByStage: {}
    };
  }
}

// Export singleton instance
export const dataService = new UnifiedDataService();

// Export as DataService for backward compatibility
export const DataService = dataService;

// Export type for use in components
export type DataServiceType = UnifiedDataService;