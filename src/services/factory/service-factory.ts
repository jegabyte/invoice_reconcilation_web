import { AppConfig } from '@/config/app.config';
import { IAuthService } from '@/services/interfaces/auth.interface';
import { IDataService, RuleFilters } from '@/services/interfaces/data.interface';
import { User, Invoice, Vendor, ValidationRule, LineItem } from '@/types/models';
import { ValidationResult } from '@/types/models/validation';

// Mock implementations
import { MockAuthService } from '@/services/mock/mock-auth.service';
import { MockDataService } from '@/services/mock/mock-data.service';

// Firebase implementations (to be created)

class ServiceFactory {
    private static authService: IAuthService;
    private static dataService: IDataService;

    static getAuthService(): IAuthService {
        if (!this.authService) {
            if (AppConfig.features.useMockData) {
                this.authService = new MockAuthServiceAdapter();
            } else {
                this.authService = new FirebaseAuthServiceAdapter();
            }
        }
        return this.authService;
    }

    static getDataService(): IDataService {
        if (!this.dataService) {
            if (AppConfig.features.useMockData) {
                this.dataService = new MockDataServiceAdapter();
            } else {
                this.dataService = new FirebaseDataServiceAdapter();
            }
        }
        return this.dataService;
    }
}

// Adapters to conform to interfaces
class MockAuthServiceAdapter implements IAuthService {
    async signIn(data: any) {
        return MockAuthService.signIn(data);
    }

    async signUp(_data: any) {
        return MockAuthService.signUp(_data);
    }

    async signOut() {
        return MockAuthService.signOut();
    }

    async resetPassword(_email: string) {
        return MockAuthService.resetPassword(_email);
    }

    async updatePassword(_currentPassword: string, _newPassword: string) {
        return MockAuthService.updatePassword(_currentPassword, _newPassword);
    }

    async updateProfile(_updates: any) {
        return MockAuthService.updateProfile(_updates);
    }

    getCurrentUser() {
        return MockAuthService.getCurrentUser();
    }

    subscribeToAuthState(_callback: (user: any) => void) {
        return MockAuthService.subscribeToAuthState(_callback);
    }

    hasPermission(_resource: string, _action: string) {
        return MockAuthService.hasPermission(_resource, _action);
    }

    canAccessVendor(_vendorId: string) {
        return MockAuthService.canAccessVendor(_vendorId);
    }
}

class MockDataServiceAdapter implements IDataService {
    // Invoices
    async getInvoices(_filters?: any) {
        return MockDataService.getInvoices(_filters);
    }

    async getInvoiceById(_id: string) {
        return MockDataService.getInvoiceById(_id);
    }

    async createInvoice(_invoice: any) {
        return MockDataService.createInvoice(_invoice);
    }

    async updateInvoice(_id: string, _updates: any) {
        // MockDataService doesn't have updateInvoice, only updateInvoiceStatus
        // For now, we'll just update the status if it's provided
        if (_updates.status) {
            return MockDataService.updateInvoiceStatus(_id, _updates.status);
        }
        throw new Error('MockDataService.updateInvoice not implemented');
    }

    async deleteInvoice(_id: string) {
        return MockDataService.deleteInvoice(_id);
    }

    // Vendors
    async getVendors(_filters?: any) {
        return MockDataService.getVendors(_filters);
    }

    async getVendorById(_id: string) {
        return MockDataService.getVendorById(_id);
    }

    async createVendor(vendor: any) {
        return MockDataService.createVendor(vendor);
    }

    async updateVendor(id: string, updates: any) {
        return MockDataService.updateVendor(id, updates);
    }

    async deleteVendor(_id: string) {
        throw new Error('Delete vendor not implemented');
    }

    // Rules
    async getRules(filters?: any) {
        return MockDataService.getRules(filters);
    }

    async getRuleById(_id: string) {
        return MockDataService.getRuleById(_id);
    }

    async createRule(rule: any) {
        return MockDataService.createRule(rule);
    }

    async updateRule(id: string, updates: any) {
        return MockDataService.updateRule(id, updates);
    }

    async deleteRule(_id: string) {
        return MockDataService.deleteRule(_id);
    }

    // Line Items
    async getLineItems(_invoiceId: string) {
        return MockDataService.getLineItems(_invoiceId);
    }

    async getLineItemValidationResults(_lineItemId: string) {
        return MockDataService.getLineItemValidationResults(_lineItemId);
    }

    // Real-time subscriptions
    subscribe<T>(_collection: string, _filters: any[], _onData: (data: T[]) => void, _onError?: (error: Error) => void) {
        return MockDataService.subscribe(_collection, _filters, _onData, _onError);
    }
}

// Firebase adapters (placeholders - implement when needed)
class FirebaseAuthServiceAdapter implements IAuthService {
    async signIn(_data: any): Promise<User> {
        // TODO: Implement Firebase auth
        throw new Error('Firebase auth not implemented');
    }

    async signUp(_data: any): Promise<User> {
        throw new Error('Firebase auth not implemented');
    }

    async signOut() {
        throw new Error('Firebase auth not implemented');
    }

    async resetPassword(_email: string) {
        throw new Error('Firebase auth not implemented');
    }

    async updatePassword(_currentPassword: string, _newPassword: string) {
        throw new Error('Firebase auth not implemented');
    }

    async updateProfile(_updates: any): Promise<void> {
        throw new Error('Firebase auth not implemented');
    }

    getCurrentUser(): User | null {
        throw new Error('Firebase auth not implemented');
    }

    subscribeToAuthState(_callback: (user: any) => void): () => void {
        throw new Error('Firebase auth not implemented');
    }

    hasPermission(_resource: string, _action: string): boolean {
        throw new Error('Firebase auth not implemented');
    }

    canAccessVendor(_vendorId: string): boolean {
        throw new Error('Firebase auth not implemented');
    }
}

class FirebaseDataServiceAdapter implements IDataService {
    // Implement all methods similarly as placeholders
    async getInvoices(_filters?: any): Promise<Invoice[]> {
        throw new Error('Firebase data service not implemented');
    }

    async getInvoiceById(_id: string): Promise<Invoice | null> {
        throw new Error('Firebase data service not implemented');
    }

    async createInvoice(_invoice: any): Promise<Invoice> {
        throw new Error('Firebase data service not implemented');
    }

    async updateInvoice(_id: string, _updates: any): Promise<void> {
        throw new Error('Firebase data service not implemented');
    }

    async deleteInvoice(_id: string): Promise<void> {
        throw new Error('Firebase data service not implemented');
    }

    async getVendors(_filters?: any): Promise<Vendor[]> {
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

    async getLineItems(_invoiceId: string): Promise<LineItem[]> {
        throw new Error('Firebase data service not implemented');
    }

    async getLineItemValidationResults(_lineItemId: string): Promise<ValidationResult[]> {
        throw new Error('Firebase data service not implemented');
    }

    subscribe<T>(_collection: string, _filters: any[], _onData: (data: T[]) => void, _onError?: (error: Error) => void): () => void {
        throw new Error('Firebase data service not implemented');
    }
}

export { ServiceFactory };