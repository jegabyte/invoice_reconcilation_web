import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { useInvoices } from '@/hooks/useInvoices';
import { useVendors } from '@/hooks/useVendors';
import InvoiceList from './InvoiceList';
import AddInvoiceModal from './AddInvoiceModal';
import { LoadingSpinner, ErrorMessage } from '@/components/common';
import { formatCurrency } from '@/utils/formatters';
import { INVOICE_STATUS } from '@/config/constants';
import { InvoiceStatus } from '@/types/models';

export default function InvoicesPage() {
    const navigate = useNavigate();
    const [showAddModal, setShowAddModal] = useState(false);
    const [filters, setFilters] = useState({
        status: '',
        vendorId: '',
        dateFrom: '',
        dateTo: '',
        searchTerm: ''
    });

    // Convert string dates to Date objects for the hook
    const invoiceFilters = useMemo(() => ({
        status: filters.status as InvoiceStatus | undefined,
        vendorId: filters.vendorId || undefined,
        dateFrom: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
        dateTo: filters.dateTo ? new Date(filters.dateTo) : undefined,
        searchTerm: filters.searchTerm || undefined,
        realtime: true
    }), [filters]);

    const {
        invoices,
        loading,
        error,
        uploadInvoice,
        stats
    } = useInvoices(invoiceFilters);

    const { vendors } = useVendors();

    const handleInvoiceSelect = (invoice: any) => {
        navigate(`/invoices/${invoice.id}`);
    };

    const handleUploadInvoice = async (file: File, vendorId: string, data: any) => {
        try {
            const invoiceId = await uploadInvoice(file, vendorId, data);
            setShowAddModal(false);
            navigate(`/invoices/${invoiceId}`);
        } catch (error) {
            console.error('Error uploading invoice:', error);
        }
    };

    if (loading && invoices.length === 0) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <ErrorMessage message={error.message} />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white shadow-sm rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">Invoice Management</h1>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Invoice
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-500">Total Invoices</p>
                        <p className="mt-1 text-2xl font-semibold text-gray-900">{stats.total}</p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4">
                        <p className="text-sm font-medium text-yellow-700">Pending</p>
                        <p className="mt-1 text-2xl font-semibold text-yellow-900">{stats.pending}</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                        <p className="text-sm font-medium text-blue-700">Processing</p>
                        <p className="mt-1 text-2xl font-semibold text-blue-900">{stats.processing}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                        <p className="text-sm font-medium text-green-700">Total Amount</p>
                        <p className="mt-1 text-2xl font-semibold text-green-900">
                            {formatCurrency(stats.totalAmount)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white shadow-sm rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Search invoices..."
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={filters.searchTerm}
                            onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                        />
                    </div>

                    <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    >
                        <option value="">All Status</option>
                        {Object.entries(INVOICE_STATUS).map(([key, value]) => (
                            <option key={key} value={value}>{value.replace(/_/g, ' ')}</option>
                        ))}
                    </select>

                    <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={filters.vendorId}
                        onChange={(e) => setFilters({ ...filters, vendorId: e.target.value })}
                    >
                        <option value="">All Partners</option>
                        {vendors.map(vendor => (
                            <option key={vendor.id} value={vendor.id}>{vendor.vendorName}</option>
                        ))}
                    </select>

                    <input
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={filters.dateFrom}
                        onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                        placeholder="From date"
                    />

                    <input
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={filters.dateTo}
                        onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                        placeholder="To date"
                    />
                </div>
            </div>

            {/* Invoice List */}
            <InvoiceList
                invoices={invoices}
                onSelectInvoice={handleInvoiceSelect}
                vendors={vendors}
            />

            {/* Add Invoice Modal */}
            {showAddModal && (
                <AddInvoiceModal
                    isOpen={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    onSubmit={handleUploadInvoice}
                    vendors={vendors}
                />
            )}
        </div>
    );
}
