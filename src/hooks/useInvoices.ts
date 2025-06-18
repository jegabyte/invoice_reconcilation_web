import { useState, useEffect, useCallback } from 'react';
import { InvoiceReconciliationSummary, ReconciliationStatus } from '@/types/api.types';
import { ApiDataService } from '@/services/api.data.service';

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

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const [reconciliationSummaries, reconciliationStatuses] = await Promise.all([
                ApiDataService.getReconciliationSummaries(),
                ApiDataService.getReconciliationStatuses()
            ]);

            setInvoices(reconciliationSummaries);
            setStatuses(reconciliationStatuses);
        } catch (err) {
            setError(err as Error);
            console.error('Error loading invoice data:', err);
        } finally {
            setLoading(false);
        }
    }, []);

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
        refreshData: loadData
    };
}