import { useState, useEffect, useCallback } from 'react';
import { VendorConfiguration } from '@/types/api.types';
import { ApiDataService } from '@/services/api.data.service';

interface UseVendorsReturn {
    vendors: VendorConfiguration[];
    loading: boolean;
    error: Error | null;
    refreshVendors: () => Promise<void>;
}

export function useVendors(): UseVendorsReturn {
    const [vendors, setVendors] = useState<VendorConfiguration[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const loadVendors = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await ApiDataService.getVendors();
            setVendors(data);
        } catch (err) {
            setError(err as Error);
            console.error('Error loading vendors:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadVendors();

        // Subscribe to real-time updates
        const unsubscribe = ApiDataService.subscribeToVendors(
            (data) => {
                setVendors(data);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    return {
        vendors,
        loading,
        error,
        refreshVendors: loadVendors
    };
}