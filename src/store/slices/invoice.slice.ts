import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { InvoiceSummary } from '@/types/api.types';

interface InvoiceState {
    invoices: InvoiceSummary[];
    selectedInvoice: InvoiceSummary | null;
    isLoading: boolean;
    error: string | null;
    filters: {
        search: string;
        vendorId: string;
        status: string;
        dateRange: {
            startDate: string | null;
            endDate: string | null;
        };
    };
    totalCount: number;
}

const initialState: InvoiceState = {
    invoices: [],
    selectedInvoice: null,
    isLoading: false,
    error: null,
    filters: {
        search: '',
        vendorId: '',
        status: '',
        dateRange: {
            startDate: null,
            endDate: null,
        },
    },
    totalCount: 0,
};

const invoiceSlice = createSlice({
    name: 'invoice',
    initialState,
    reducers: {
        setInvoices: (state, action: PayloadAction<{ invoices: InvoiceSummary[]; total: number }>) => {
            state.invoices = action.payload.invoices;
            state.totalCount = action.payload.total;
            state.error = null;
        },
        setSelectedInvoice: (state, action: PayloadAction<InvoiceSummary | null>) => {
            state.selectedInvoice = action.payload;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
        updateFilter: (state, action: PayloadAction<Partial<InvoiceState['filters']>>) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        clearFilters: (state) => {
            state.filters = initialState.filters;
        },
        updateInvoice: (state, action: PayloadAction<InvoiceSummary>) => {
            const index = state.invoices.findIndex(inv => inv.id === action.payload.id);
            if (index !== -1) {
                state.invoices[index] = action.payload;
            }
            if (state.selectedInvoice?.id === action.payload.id) {
                state.selectedInvoice = action.payload;
            }
        },
    },
});

export const {
    setInvoices,
    setSelectedInvoice,
    setLoading,
    setError,
    updateFilter,
    clearFilters,
    updateInvoice,
} = invoiceSlice.actions;

export default invoiceSlice.reducer;