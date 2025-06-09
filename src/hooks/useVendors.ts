import { useState, useEffect, useCallback } from 'react';
import { where, orderBy } from 'firebase/firestore';
import { Vendor } from '@/types/models';
import { MockDataService } from '@/services/mock/mock-data.service';
import { useAuth } from './useAuth';

interface UseVendorsOptions {
    status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
    realtime?: boolean;
}

interface UseVendorsReturn {
    vendors: Vendor[];
    loading: boolean;
    error: Error | null;
    refreshVendors: () => Promise<void>;
    toggleVendorStatus: (vendorId: string, newStatus: 'ACTIVE' | 'INACTIVE') => Promise<void>;
}

export function useVendors(options: UseVendorsOptions = {}): UseVendorsReturn {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const { user } = useAuth();

    const loadVendors = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const filters: any = {};
            
            // Apply vendor restriction if user is a vendor
            if (user?.role === 'VENDOR' && user.vendorAccess?.vendorIds) {
                // For vendor users, only show their vendors
                filters.vendorIds = user.vendorAccess.vendorIds;
            }

            if (options.status) {
                filters.status = options.status;
            }

            const data = await MockDataService.getVendors(filters);
            setVendors(data);
        } catch (err) {
            setError(err as Error);
            console.error('Error loading vendors:', err);
        } finally {
            setLoading(false);
        }
    }, [options.status, user?.role, user?.vendorAccess?.vendorIds]);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                const filters: any = {};
                
                if (user?.role === 'VENDOR' && user.vendorAccess?.vendorIds) {
                    // For vendor users, only show their vendors
                    filters.vendorIds = user.vendorAccess.vendorIds;
                }

                if (options.status) {
                    filters.status = options.status;
                }

                const data = await MockDataService.getVendors(filters);
                setVendors(data);
            } catch (err) {
                setError(err as Error);
                console.error('Error loading vendors:', err);
            } finally {
                setLoading(false);
            }
        };

        if (options.realtime) {
            const constraints = [];

            if (user?.role === 'VENDOR' && user.vendorAccess?.vendorIds) {
                constraints.push(where('id', 'in', user.vendorAccess.vendorIds));
            }

            if (options.status) {
                constraints.push(where('status', '==', options.status));
            }

            constraints.push(orderBy('vendorName'));

            const unsubscribe = MockDataService.subscribe<Vendor>(
                'vendors',
                [options],
                (data) => {
                    setVendors(data);
                    setLoading(false);
                    setError(null);
                },
                (err) => {
                    setError(err);
                    setLoading(false);
                }
            );

            return () => unsubscribe();
        } else {
            loadData();
        }
    }, [options.realtime, options.status, user?.role, user?.vendorAccess?.vendorIds]);

    const toggleVendorStatus = async (vendorId: string, newStatus: 'ACTIVE' | 'INACTIVE') => {
        try {
            await MockDataService.updateVendor(vendorId, {
                status: newStatus,
                metadata: {
                    lastModified: new Date(),
                    modifiedBy: user?.id || 'system'
                }
            } as any);
        } catch (error) {
            console.error('Error toggling vendor status:', error);
            throw error;
        }
    };

    return {
        vendors,
        loading,
        error,
        refreshVendors: loadVendors,
        toggleVendorStatus
    };
}
