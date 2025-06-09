import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';

// Layout
import { MainLayout } from '@/components/layout/MainLayout';
import AuthLayout from '@/components/layout/AuthLayout';

// Pages
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import InvoicesPage from '@/pages/invoices/InvoicesPage';
import InvoiceDetailPage from '@/pages/invoices/InvoiceDetailPage';
import VendorsPage from '@/pages/vendors/VendorsPage';
import RulesPage from '@/pages/rules/RulesPage';
import SettingsPage from '@/pages/settings/SettingsPage';
import UnauthorizedPage from '@/pages/error/UnauthorizedPage';
import NotFoundPage from '@/pages/error/NotFoundPage';

// Components
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Styles
import './styles/globals.css';

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    {/* Auth Routes */}
                    <Route element={<AuthLayout />}>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    </Route>

                    {/* Protected Routes */}
                    <Route element={<ProtectedRoute />}>
                        <Route element={<MainLayout />}>
                            <Route path="/dashboard" element={<DashboardPage />} />

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
                    <Route path="/unauthorized" element={<UnauthorizedPage />} />
                    <Route path="/404" element={<NotFoundPage />} />

                    {/* Default Routes */}
                    <Route path="/" element={<Navigate to="/invoices" replace />} />
                    <Route path="*" element={<Navigate to="/404" replace />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
