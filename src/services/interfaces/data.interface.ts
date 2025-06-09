import { Invoice, Vendor, ValidationRule, LineItem, ValidationResult } from '@/types/models';

export interface InvoiceFilters {
    vendorId?: string;
    status?: string;
    dateFrom?: Date;
    dateTo?: Date;
}

export interface VendorFilters {
    status?: string;
    vendorIds?: string[];
}

export interface RuleFilters {
    vendorCode?: string;
    isActive?: boolean;
}

export interface IDataService {
    // Invoices
    getInvoices(filters?: InvoiceFilters): Promise<Invoice[]>;
    getInvoiceById(id: string): Promise<Invoice | null>;
    createInvoice(invoice: Partial<Invoice>): Promise<Invoice>;
    updateInvoice(id: string, updates: Partial<Invoice>): Promise<void>;
    deleteInvoice(id: string): Promise<void>;
    
    // Vendors
    getVendors(filters?: VendorFilters): Promise<Vendor[]>;
    getVendorById(id: string): Promise<Vendor | null>;
    createVendor(vendor: Partial<Vendor>): Promise<Vendor>;
    updateVendor(id: string, updates: Partial<Vendor>): Promise<void>;
    deleteVendor(id: string): Promise<void>;
    
    // Rules
    getRules(filters?: RuleFilters): Promise<ValidationRule[]>;
    getRuleById(id: string): Promise<ValidationRule | null>;
    createRule(rule: Partial<ValidationRule>): Promise<ValidationRule>;
    updateRule(id: string, updates: Partial<ValidationRule>): Promise<void>;
    deleteRule(id: string): Promise<void>;
    
    // Line Items
    getLineItems(invoiceId: string): Promise<LineItem[]>;
    getLineItemValidationResults(lineItemId: string): Promise<ValidationResult[]>;
    
    // Real-time subscriptions
    subscribe<T>(
        collection: string,
        filters: any[],
        onData: (data: T[]) => void,
        onError?: (error: Error) => void
    ): () => void;
}