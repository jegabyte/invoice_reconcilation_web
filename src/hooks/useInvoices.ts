import { useState, useEffect, useCallback } from 'react';
import { Invoice, LineItem } from '@/types/models';
import { InvoiceService, InvoiceFilters, InvoiceUploadData } from '@/services/api/invoice.service';
import { MockDataService } from '@/services/mock/mock-data.service';
import { FirestoreService, COLLECTIONS } from '@/services/firebase/firestore.service';
import { where, orderBy } from 'firebase/firestore';
import { useAuth } from './useAuth';

interface UseInvoicesOptions extends InvoiceFilters {
    realtime?: boolean;
}

interface UseInvoicesReturn {
    invoices: Invoice[];
    loading: boolean;
    error: Error | null;
    uploadInvoice: (file: File, vendorId: string, data: InvoiceUploadData) => Promise<string>;
    refreshInvoices: () => Promise<void>;
    deleteInvoice: (invoiceId: string) => Promise<void>;
    updateInvoiceStatus: (invoiceId: string, status: Invoice['status']) => Promise<void>;
    stats: {
        total: number;
        pending: number;
        processing: number;
        validated: number;
        disputed: number;
        totalAmount: number;
    };
    getInvoiceById: (id: string) => Promise<Invoice | null>;
    getLineItems: (invoiceId: string) => Promise<LineItem[]>;
    approveInvoice: (invoiceId: string) => Promise<void>;
    rejectInvoice: (invoiceId: string, reason: string) => Promise<void>;
}

export function useInvoices(options: UseInvoicesOptions = {}): UseInvoicesReturn {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const { user } = useAuth();

    // Load invoices
    const loadInvoices = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Apply vendor restriction if user is a vendor
            const filters = { ...options };
            if (user && user.role === 'VENDOR' && user.vendorAccess?.vendorIds) {
                filters.vendorId = user.vendorAccess.vendorIds[0]; // For now, use first vendor
            }

            const data = await InvoiceService.getInvoices(filters);
            setInvoices(data);
        } catch (err) {
            setError(err as Error);
            console.error('Error loading invoices:', err);
        } finally {
            setLoading(false);
        }
    }, [options.vendorId, options.status, options.dateFrom, options.dateTo, user?.role, user?.vendorAccess?.vendorIds]);

    // Upload invoice
    const uploadInvoice = useCallback(async (
        file: File,
        vendorId: string,
        data: InvoiceUploadData
    ): Promise<string> => {
        if (!user) throw new Error('User not authenticated');

        try {
            setError(null);
            const invoiceId = await InvoiceService.uploadInvoice(file, vendorId, data, user.id);

            // Refresh invoices list
            await loadInvoices();

            return invoiceId;
        } catch (err) {
            setError(err as Error);
            throw err;
        }
    }, [user, loadInvoices]);

    // Delete invoice
    const deleteInvoice = useCallback(async (invoiceId: string): Promise<void> => {
        if (!user) throw new Error('User not authenticated');

        try {
            setError(null);
            await InvoiceService.deleteInvoice(invoiceId);

            // Update local state
            setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
        } catch (err) {
            setError(err as Error);
            throw err;
        }
    }, [user]);

    // Update invoice status
    const updateInvoiceStatus = useCallback(async (
        invoiceId: string,
        status: Invoice['status']
    ): Promise<void> => {
        if (!user) throw new Error('User not authenticated');

        try {
            setError(null);
            await InvoiceService.updateStatus(invoiceId, status);

            // Update local state
            setInvoices(prev => prev.map(inv =>
                inv.id === invoiceId ? { ...inv, status } : inv
            ));
        } catch (err) {
            setError(err as Error);
            throw err;
        }
    }, [user]);

    // Calculate statistics
    const stats = {
        total: invoices.length,
        pending: invoices.filter(inv => inv.status === 'PENDING').length,
        processing: invoices.filter(inv =>
            ['EXTRACTING', 'VALIDATING'].includes(inv.status)
        ).length,
        validated: invoices.filter(inv =>
            ['VALIDATED', 'APPROVED'].includes(inv.status)
        ).length,
        disputed: invoices.filter(inv => inv.status === 'DISPUTED').length,
        totalAmount: invoices.reduce((sum, inv) =>
            sum + (inv.financial?.totalAmount || 0), 0
        )
    };

    // Load data on mount and when filters change
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Apply vendor restriction if user is a vendor
                const filters = { ...options };
                if (user && user.role === 'VENDOR' && user.vendorAccess?.vendorIds) {
                    filters.vendorId = user.vendorAccess.vendorIds[0]; // For now, use first vendor
                }

                const data = await InvoiceService.getInvoices(filters);
                setInvoices(data);
            } catch (err) {
                setError(err as Error);
                console.error('Error loading invoices:', err);
            } finally {
                setLoading(false);
            }
        };

        if (options.realtime) {
            const unsubscribe = MockDataService.subscribe<Invoice>(
                'invoices',
                [options],
                (data) => {
                    setInvoices(data);
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
    }, [options.realtime, options.vendorId, options.status, options.dateFrom, options.dateTo, user?.role, user?.vendorAccess?.vendorIds]);

    const getInvoiceById = async (id: string): Promise<Invoice | null> => {
        try {
            const doc = await MockDataService.getInvoiceById(id);
            return doc;
        } catch (error) {
            console.error('Error getting invoice:', error);
            return null;
        }
    };

    const getLineItems = async (invoiceId: string): Promise<LineItem[]> => {
        try {
            const items = await MockDataService.getLineItems(invoiceId);
            return items;
        } catch (error) {
            console.error('Error getting line items:', error);
            return [];
        }
    };

    const approveInvoice = async (invoiceId: string) => {
        await updateInvoiceStatus(invoiceId, 'APPROVED');
    };

    const rejectInvoice = async (invoiceId: string, _reason: string) => {
        await updateInvoiceStatus(invoiceId, 'REJECTED');
        // TODO: Add reason to audit log
    };

    return {
        invoices,
        loading,
        error,
        uploadInvoice,
        refreshInvoices: loadInvoices,
        deleteInvoice,
        updateInvoiceStatus,
        stats,
        getInvoiceById,
        getLineItems,
        approveInvoice,
        rejectInvoice
    };
}

// ==========================================
// SINGLE INVOICE HOOK
// ==========================================

interface UseInvoiceReturn {
    invoice: Invoice | null;
    lineItems: LineItem[];
    loading: boolean;
    error: Error | null;
    refreshInvoice: () => Promise<void>;
    refreshLineItems: () => Promise<void>;
}

export function useInvoice(invoiceId: string, realtime: boolean = false): UseInvoiceReturn {
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [lineItems, setLineItems] = useState<LineItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // Load invoice
    const loadInvoice = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await InvoiceService.getInvoice(invoiceId);
            setInvoice(data);
        } catch (err) {
            setError(err as Error);
            console.error('Error loading invoice:', err);
        } finally {
            setLoading(false);
        }
    }, [invoiceId]);

    // Load line items
    const loadLineItems = useCallback(async () => {
        try {
            const data = await InvoiceService.getLineItems(invoiceId);
            setLineItems(data);
        } catch (err) {
            console.error('Error loading line items:', err);
        }
    }, [invoiceId]);

    // Setup invoice subscription or load
    useEffect(() => {
        if (!invoiceId) {
            setLoading(false);
            return;
        }

        if (realtime) {
            const unsubscribe = FirestoreService.subscribeToDoc<Invoice>(
                COLLECTIONS.INVOICES,
                invoiceId,
                (data) => {
                    setInvoice(data);
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
            loadInvoice();
        }
    }, [invoiceId, realtime, loadInvoice]);

    // Setup line items subscription or load
    useEffect(() => {
        if (!invoiceId) return;

        if (realtime) {
            const unsubscribe = FirestoreService.subscribe<LineItem>(
                COLLECTIONS.LINE_ITEMS,
                [
                    where('invoiceId', '==', invoiceId),
                    orderBy('metadata.lineNumber')
                ],
                (data) => {
                    setLineItems(data);
                }
            );

            return () => unsubscribe();
        } else {
            loadLineItems();
        }
    }, [invoiceId, realtime, loadLineItems]);

    return {
        invoice,
        lineItems,
        loading,
        error,
        refreshInvoice: loadInvoice,
        refreshLineItems: loadLineItems
    };
}

// ==========================================
// INVOICE STATISTICS HOOK
// ==========================================

interface InvoiceStats {
    daily: Array<{ date: string; count: number; amount: number }>;
    byVendor: Array<{ vendorId: string; count: number; amount: number }>;
    byStatus: Array<{ status: string; count: number }>;
    processingTime: {
        average: number;
        min: number;
        max: number;
    };
}

export function useInvoiceStats(
    dateRange: { start: Date; end: Date },
    vendorId?: string
): {
    stats: InvoiceStats | null;
    loading: boolean;
    error: Error | null;
} {
    const [stats, setStats] = useState<InvoiceStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        const loadStats = async () => {
            if (!user) return;

            try {
                setLoading(true);
                setError(null);

                const filters: InvoiceFilters = {
                    dateFrom: dateRange.start,
                    dateTo: dateRange.end
                };

                // Apply vendor filter
                if (user.role === 'VENDOR' && user.vendorAccess?.vendorIds) {
                    filters.vendorId = user.vendorAccess.vendorIds[0];
                } else if (vendorId) {
                    filters.vendorId = vendorId;
                }

                const invoices = await InvoiceService.getInvoices(filters);

                // Calculate statistics
                // This is a simplified version - in production, this would be done on the backend
                const dailyStats = new Map<string, { count: number; amount: number }>();
                const vendorStats = new Map<string, { count: number; amount: number }>();
                const statusStats = new Map<string, number>();
                let totalProcessingTime = 0;
                let minProcessingTime = Infinity;
                let maxProcessingTime = 0;
                let processedCount = 0;

                invoices.forEach(invoice => {
                    // Daily stats
                    const date = invoice.invoiceDate.toDate().toISOString().split('T')[0];
                    const daily = dailyStats.get(date) || { count: 0, amount: 0 };
                    daily.count++;
                    daily.amount += invoice.financial?.totalAmount || 0;
                    dailyStats.set(date, daily);

                    // Vendor stats
                    const vendor = vendorStats.get(invoice.vendorId) || { count: 0, amount: 0 };
                    vendor.count++;
                    vendor.amount += invoice.financial?.totalAmount || 0;
                    vendorStats.set(invoice.vendorId, vendor);

                    // Status stats
                    statusStats.set(invoice.status, (statusStats.get(invoice.status) || 0) + 1);

                    // Processing time stats
                    if (invoice.processingStatus?.stage === 'COMPLETE' &&
                        invoice.processingStatus.startTime &&
                        invoice.processingStatus.lastUpdateTime) {
                        const startTime = invoice.processingStatus.startTime instanceof Date 
                            ? invoice.processingStatus.startTime.getTime() 
                            : invoice.processingStatus.startTime.toMillis();
                        const endTime = invoice.processingStatus.lastUpdateTime instanceof Date 
                            ? invoice.processingStatus.lastUpdateTime.getTime() 
                            : invoice.processingStatus.lastUpdateTime.toMillis();
                        const processingTime = endTime - startTime;

                        totalProcessingTime += processingTime;
                        minProcessingTime = Math.min(minProcessingTime, processingTime);
                        maxProcessingTime = Math.max(maxProcessingTime, processingTime);
                        processedCount++;
                    }
                });

                setStats({
                    daily: Array.from(dailyStats.entries()).map(([date, data]) => ({
                        date,
                        ...data
                    })).sort((a, b) => a.date.localeCompare(b.date)),
                    byVendor: Array.from(vendorStats.entries()).map(([vendorId, data]) => ({
                        vendorId,
                        ...data
                    })),
                    byStatus: Array.from(statusStats.entries()).map(([status, count]) => ({
                        status,
                        count
                    })),
                    processingTime: {
                        average: processedCount > 0 ? totalProcessingTime / processedCount : 0,
                        min: minProcessingTime === Infinity ? 0 : minProcessingTime,
                        max: maxProcessingTime
                    }
                });
            } catch (err) {
                setError(err as Error);
                console.error('Error loading invoice stats:', err);
            } finally {
                setLoading(false);
            }
        };

        loadStats();
    }, [dateRange, vendorId, user]);

    return { stats, loading, error };
}
