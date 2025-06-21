import { useState, useEffect, useCallback } from 'react';
import { VendorConfiguration } from '@/types/api.types';
import { ApiDataService } from '@/services/api.data.service';
import { cache, CACHE_KEYS, CACHE_TTL } from '@/utils/cache';

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
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const loadVendors = useCallback(async (forceRefresh = false) => {
        try {
            // Check cache first
            if (!forceRefresh && isInitialLoad) {
                const cachedVendors = cache.get<VendorConfiguration[]>(CACHE_KEYS.VENDORS);
                if (cachedVendors) {
                    console.log('Loading vendors from cache');
                    setVendors(cachedVendors);
                    setLoading(false);
                    setIsInitialLoad(false);
                    return;
                }
            }

            setLoading(true);
            setError(null);

            const data = await ApiDataService.getVendors();
            setVendors(data);
            
            // Cache the data
            cache.set(CACHE_KEYS.VENDORS, data, CACHE_TTL.LONG);
            setIsInitialLoad(false);
        } catch (err) {
            setError(err as Error);
            console.error('Error loading vendors:', err);
        } finally {
            setLoading(false);
        }
    }, [isInitialLoad]);

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
        refreshVendors: () => loadVendors(true)
    };
}