import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/auth.slice';
import invoiceReducer from './slices/invoice.slice';
import vendorReducer from './slices/vendor.slice';
import uiReducer from './slices/ui.slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    invoice: invoiceReducer,
    vendor: vendorReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;