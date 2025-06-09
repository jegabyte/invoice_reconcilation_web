import { Vendor } from '@/types/models';
import { MockDataService } from '@/services/mock/mock-data.service';

export interface VendorFilters {
    status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
    vendorType?: string;
    searchTerm?: string;
}

export class VendorService {
    // Get vendors with filters
    static async getVendors(filters?: VendorFilters): Promise<Vendor[]> {
        const allVendors = await MockDataService.getVendors();
        
        if (!filters) return allVendors;
        
        let filtered = [...allVendors];
        
        if (filters.status) {
            filtered = filtered.filter(v => v.status === filters.status);
        }
        
        if (filters.vendorType) {
            filtered = filtered.filter(v => v.vendorType === filters.vendorType);
        }
        
        if (filters.searchTerm) {
            const searchLower = filters.searchTerm.toLowerCase();
            filtered = filtered.filter(v => 
                v.vendorName.toLowerCase().includes(searchLower) ||
                v.vendorCode.toLowerCase().includes(searchLower)
            );
        }
        
        return filtered;
    }
    
    // Get single vendor by ID
    static async getVendorById(id: string): Promise<Vendor | null> {
        const vendors = await MockDataService.getVendors();
        return vendors.find(v => v.id === id) || null;
    }
    
    // Create new vendor
    static async createVendor(vendor: Partial<Vendor>): Promise<Vendor> {
        return MockDataService.createVendor(vendor);
    }
    
    // Update vendor
    static async updateVendor(id: string, updates: Partial<Vendor>): Promise<void> {
        await MockDataService.updateVendor(id, updates);
    }
    
    // Delete vendor
    static async deleteVendor(id: string): Promise<void> {
        await MockDataService.deleteVendor(id);
    }
}