import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    duration?: number;
}

interface Modal {
    isOpen: boolean;
    type: string | null;
    data?: any;
}

interface UIState {
    isLoading: boolean;
    loadingText: string;
    toasts: Toast[];
    modals: {
        [key: string]: Modal;
    };
    sidebarOpen: boolean;
    notifications: {
        count: number;
        hasNew: boolean;
    };
}

const initialState: UIState = {
    isLoading: false,
    loadingText: '',
    toasts: [],
    modals: {},
    sidebarOpen: true,
    notifications: {
        count: 0,
        hasNew: false,
    },
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        setGlobalLoading: (state, action: PayloadAction<{ isLoading: boolean; text?: string }>) => {
            state.isLoading = action.payload.isLoading;
            state.loadingText = action.payload.text || '';
        },
        showToast: (state, action: PayloadAction<Omit<Toast, 'id'>>) => {
            const toast: Toast = {
                ...action.payload,
                id: Date.now().toString(),
                duration: action.payload.duration || 5000,
            };
            state.toasts.push(toast);
        },
        removeToast: (state, action: PayloadAction<string>) => {
            state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
        },
        clearToasts: (state) => {
            state.toasts = [];
        },
        openModal: (state, action: PayloadAction<{ key: string; type: string; data?: any }>) => {
            state.modals[action.payload.key] = {
                isOpen: true,
                type: action.payload.type,
                data: action.payload.data,
            };
        },
        closeModal: (state, action: PayloadAction<string>) => {
            if (state.modals[action.payload]) {
                state.modals[action.payload].isOpen = false;
            }
        },
        toggleSidebar: (state) => {
            state.sidebarOpen = !state.sidebarOpen;
        },
        setSidebarOpen: (state, action: PayloadAction<boolean>) => {
            state.sidebarOpen = action.payload;
        },
        updateNotifications: (state, action: PayloadAction<{ count: number; hasNew: boolean }>) => {
            state.notifications = action.payload;
        },
    },
});

export const {
    setGlobalLoading,
    showToast,
    removeToast,
    clearToasts,
    openModal,
    closeModal,
    toggleSidebar,
    setSidebarOpen,
    updateNotifications,
} = uiSlice.actions;

export default uiSlice.reducer;