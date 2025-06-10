import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layout
import { MainLayout } from '@/components/layout/MainLayout';

// Pages
import InvoicesPage from '@/pages/invoices/InvoicesPage';
import InvoiceDetailPage from '@/pages/invoices/InvoiceDetailPage';
import VendorsPage from '@/pages/vendors/VendorsPage';
import RulesPage from '@/pages/rules/RulesPage';
import SettingsPage from '@/pages/settings/SettingsPage';
import NotFoundPage from '@/pages/error/NotFoundPage';

// Styles
import './styles/globals.css';

function App() {
    return (
        <Router>
            <Routes>
                {/* Main Routes */}
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

                {/* Error Pages */}
                <Route path="/404" element={<NotFoundPage />} />

                {/* Default Routes */}
                <Route path="/" element={<Navigate to="/invoices" replace />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
