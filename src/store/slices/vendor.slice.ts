import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { VendorConfiguration } from '@/types/api.types';

interface VendorState {
    vendors: VendorConfiguration[];
    selectedVendor: VendorConfiguration | null;
    isLoading: boolean;
    error: string | null;
    filters: {
        search: string;
        status: string;
        type: string;
        sortBy: string;
    };
    totalCount: number;
}

const initialState: VendorState = {
    vendors: [],
    selectedVendor: null,
    isLoading: false,
    error: null,
    filters: {
        search: '',
        status: '',
        type: '',
        sortBy: 'name',
    },
    totalCount: 0,
};

const vendorSlice = createSlice({
    name: 'vendor',
    initialState,
    reducers: {
        setVendors: (state, action: PayloadAction<{ vendors: VendorConfiguration[]; total: number }>) => {
            state.vendors = action.payload.vendors;
            state.totalCount = action.payload.total;
            state.error = null;
        },
        setSelectedVendor: (state, action: PayloadAction<VendorConfiguration | null>) => {
            state.selectedVendor = action.payload;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
        updateFilter: (state, action: PayloadAction<Partial<VendorState['filters']>>) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        clearFilters: (state) => {
            state.filters = initialState.filters;
        },
        addVendor: (state, action: PayloadAction<VendorConfiguration>) => {
            state.vendors.unshift(action.payload);
            state.totalCount += 1;
        },
        updateVendor: (state, action: PayloadAction<VendorConfiguration>) => {
            const index = state.vendors.findIndex(v => v.id === action.payload.id);
            if (index !== -1) {
                state.vendors[index] = action.payload;
            }
            if (state.selectedVendor?.id === action.payload.id) {
                state.selectedVendor = action.payload;
            }
        },
        deleteVendor: (state, action: PayloadAction<string>) => {
            state.vendors = state.vendors.filter(v => v.id !== action.payload);
            state.totalCount -= 1;
            if (state.selectedVendor?.id === action.payload) {
                state.selectedVendor = null;
            }
        },
    },
});

export const {
    setVendors,
    setSelectedVendor,
    setLoading,
    setError,
    updateFilter,
    clearFilters,
    addVendor,
    updateVendor,
    deleteVendor,
} = vendorSlice.actions;

export default vendorSlice.reducer;