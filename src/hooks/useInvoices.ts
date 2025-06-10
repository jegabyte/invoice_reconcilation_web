import { useState, useEffect, useCallback } from 'react';
import { ExtractionResult, InvoiceReconciliationSummary, ReconciliationStatus } from '@/types/api.types';
import { ApiDataService } from '@/services/api.data.service';

interface UseInvoicesReturn {
    extractions: ExtractionResult[];
    summaries: InvoiceReconciliationSummary[];
    statuses: ReconciliationStatus[];
    loading: boolean;
    error: Error | null;
    refreshData: () => Promise<void>;
}

export function useInvoices(): UseInvoicesReturn {
    const [extractions, setExtractions] = useState<ExtractionResult[]>([]);
    const [summaries, setSummaries] = useState<InvoiceReconciliationSummary[]>([]);
    const [statuses, setStatuses] = useState<ReconciliationStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const [extractionResults, reconciliationSummaries, reconciliationStatuses] = await Promise.all([
                ApiDataService.getExtractionResults(),
                ApiDataService.getReconciliationSummaries(),
                ApiDataService.getReconciliationStatuses()
            ]);

            setExtractions(extractionResults);
            setSummaries(reconciliationSummaries);
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
        const unsubscribeExtractions = ApiDataService.subscribeToExtractionResults(
            (data) => setExtractions(data),
            {}
        );

        return () => {
            unsubscribeExtractions();
        };
    }, []);

    return {
        extractions,
        summaries,
        statuses,
        loading,
        error,
        refreshData: loadData
    };
}