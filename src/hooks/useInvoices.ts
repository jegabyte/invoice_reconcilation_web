import { useState, useEffect, useCallback } from 'react';
import { InvoiceReconciliationSummary, ReconciliationStatus } from '@/types/api.types';
import { ApiDataService } from '@/services/api.data.service';
import { cache, CACHE_KEYS, CACHE_TTL } from '@/utils/cache';

interface UseInvoicesReturn {
    invoices: InvoiceReconciliationSummary[];
    statuses: ReconciliationStatus[];
    loading: boolean;
    error: Error | null;
    refreshData: () => Promise<void>;
}

export function useInvoices(): UseInvoicesReturn {
    const [invoices, setInvoices] = useState<InvoiceReconciliationSummary[]>([]);
    const [statuses, setStatuses] = useState<ReconciliationStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const loadData = useCallback(async (forceRefresh = false) => {
        try {
            // Check cache first if not forcing refresh
            if (!forceRefresh && isInitialLoad) {
                const cachedInvoices = cache.get<InvoiceReconciliationSummary[]>(CACHE_KEYS.INVOICES);
                const cachedStatuses = cache.get<ReconciliationStatus[]>('invoice_statuses');
                
                if (cachedInvoices && cachedStatuses) {
                    console.log('Loading invoices from cache');
                    setInvoices(cachedInvoices);
                    setStatuses(cachedStatuses);
                    setLoading(false);
                    setIsInitialLoad(false);
                    
                    // Load fresh data in background
                    loadFreshData(false);
                    return;
                }
            }
            
            // Show loading only if no cached data
            if (!invoices.length) {
                setLoading(true);
            }
            
            await loadFreshData(true);
        } catch (err) {
            setError(err as Error);
            console.error('Error loading invoice data:', err);
            setLoading(false);
        }
    }, [isInitialLoad, invoices.length]);
    
    const loadFreshData = async (showLoading: boolean) => {
        try {
            if (showLoading) {
                setLoading(true);
            }
            setError(null);

            const [reconciliationSummaries, reconciliationStatuses] = await Promise.all([
                ApiDataService.getReconciliationSummaries(),
                ApiDataService.getReconciliationStatuses()
            ]);

            // Update state
            setInvoices(reconciliationSummaries);
            setStatuses(reconciliationStatuses);
            
            // Update cache
            cache.set(CACHE_KEYS.INVOICES, reconciliationSummaries, CACHE_TTL.MEDIUM);
            cache.set('invoice_statuses', reconciliationStatuses, CACHE_TTL.MEDIUM);
            
            setIsInitialLoad(false);
        } catch (err) {
            setError(err as Error);
            console.error('Error loading fresh invoice data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();

        // Subscribe to real-time updates
        const unsubscribeReconciliations = ApiDataService.subscribeToReconciliationSummaries(
            (data) => setInvoices(data),
            {}
        );

        return () => {
            unsubscribeReconciliations();
        };
    }, [loadData]);

    return {
        invoices,
        statuses,
        loading,
        error,
        refreshData: () => loadData(true)
    };
}