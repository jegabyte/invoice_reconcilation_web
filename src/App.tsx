import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '@/store/slices/auth.slice';

// Layout
import { MainLayout } from '@/components/layout/MainLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Pages
import LoginPage from '@/pages/auth/LoginPage';
import InvoicesPage from '@/pages/invoices/InvoicesPage';
import InvoiceDetailPage from '@/pages/invoices/InvoiceDetailPage';
import VendorsPage from '@/pages/vendors/VendorsPage';
import RulesPage from '@/pages/rules/RulesPage';
import SettingsPage from '@/pages/settings/SettingsPage';
import NotFoundPage from '@/pages/error/NotFoundPage';

// Styles
import './styles/globals.css';

function AppContent() {
    const dispatch = useDispatch();

    useEffect(() => {
        // Check for existing auth token on app load
        const token = localStorage.getItem('authToken');
        if (token) {
            // In a real app, validate the token with the backend
            const mockUser = {
                id: '1',
                email: 'admin@example.com',
                name: 'Admin',
                role: 'admin' as const
            };
            dispatch(loginSuccess(mockUser));
        }
    }, [dispatch]);

    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>
                    {/* Invoices */}
                    <Route path="/invoices" element={<InvoicesPage />} />
                    <Route path="/invoices/:id" element={<InvoiceDetailPage />} />

                    {/* Vendors */}
                    <Route path="/vendors" element={<VendorsPage />} />

                    {/* Rules */}
                    <Route path="/rules" element={<RulesPage />} />

                    {/* Settings */}
                    <Route path="/settings" element={<SettingsPage />} />
                </Route>
            </Route>

            {/* Error Pages */}
            <Route path="/404" element={<NotFoundPage />} />

            {/* Default Routes */}
            <Route path="/" element={<Navigate to="/invoices" replace />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default App;
