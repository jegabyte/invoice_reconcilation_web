import { IDataService, InvoiceFilters, VendorFilters, RuleFilters } from '@/services/interfaces/data.interface';
import { Invoice, Vendor, ValidationRule, LineItem } from '@/types/models';
import { ValidationResult } from '@/types/models/validation';

export class FirebaseDataService implements IDataService {
    // Invoices
    async getInvoices(_filters?: InvoiceFilters): Promise<Invoice[]> {
        throw new Error('Firebase data service not implemented');
    }

    async getInvoiceById(_id: string): Promise<Invoice | null> {
        throw new Error('Firebase data service not implemented');
    }

    async createInvoice(_invoice: Partial<Invoice>): Promise<Invoice> {
        throw new Error('Firebase data service not implemented');
    }

    async updateInvoice(_id: string, _updates: Partial<Invoice>): Promise<void> {
        throw new Error('Firebase data service not implemented');
    }

    async deleteInvoice(_id: string): Promise<void> {
        throw new Error('Firebase data service not implemented');
    }

    // Vendors
    async getVendors(_filters?: VendorFilters): Promise<Vendor[]> {
        throw new Error('Firebase data service not implemented');
    }

    async getVendorById(_id: string): Promise<Vendor | null> {
        throw new Error('Firebase data service not implemented');
    }

    async createVendor(_vendor: Partial<Vendor>): Promise<Vendor> {
        throw new Error('Firebase data service not implemented');
    }

    async updateVendor(_id: string, _updates: Partial<Vendor>): Promise<void> {
        throw new Error('Firebase data service not implemented');
    }

    async deleteVendor(_id: string): Promise<void> {
        throw new Error('Firebase data service not implemented');
    }

    // Rules
    async getRules(_filters?: RuleFilters): Promise<ValidationRule[]> {
        throw new Error('Firebase data service not implemented');
    }

    async getRuleById(_id: string): Promise<ValidationRule | null> {
        throw new Error('Firebase data service not implemented');
    }

    async createRule(_rule: Partial<ValidationRule>): Promise<ValidationRule> {
        throw new Error('Firebase data service not implemented');
    }

    async updateRule(_id: string, _updates: Partial<ValidationRule>): Promise<void> {
        throw new Error('Firebase data service not implemented');
    }

    async deleteRule(_id: string): Promise<void> {
        throw new Error('Firebase data service not implemented');
    }

    // Line Items
    async getLineItems(_invoiceId: string): Promise<LineItem[]> {
        throw new Error('Firebase data service not implemented');
    }

    async getLineItemValidationResults(_lineItemId: string): Promise<ValidationResult[]> {
        throw new Error('Firebase data service not implemented');
    }

    // Real-time subscriptions
    subscribe<T>(_collection: string, _filters: any[], _onData: (data: T[]) => void, _onError?: (error: Error) => void): () => void {
        throw new Error('Firebase data service not implemented');
    }
}