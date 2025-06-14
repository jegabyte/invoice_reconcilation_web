import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, FileText, Filter, AlertCircle, DollarSign, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { useInvoices } from '@/hooks/useInvoices';
import { useVendors } from '@/hooks/useVendors';
import { LoadingSpinner, Card } from '@/components/common';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { APP_CONFIG } from '@/config/app.config';
import AddInvoiceModal from './AddInvoiceModal';

export default function InvoicesPage() {
    const navigate = useNavigate();
    const { extractions, loading, error } = useInvoices();
    const { vendors } = useVendors();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedVendor, setSelectedVendor] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);

    // Date range state - no default values
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // Filter extractions based on all criteria including date range
    const filteredExtractions = extractions.filter(extraction => {
        const matchesSearch = searchTerm === '' ||
            extraction.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            extraction.vendorName.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesVendor = selectedVendor === '' || extraction.vendorId === selectedVendor;
        const matchesStatus = selectedStatus === '' || extraction.status === selectedStatus;

        // Date filtering - only apply if dates are set
        const invoiceDate = new Date(extraction.invoiceDate);
        const matchesDateRange = (!dateFrom || invoiceDate >= new Date(dateFrom)) &&
            (!dateTo || invoiceDate <= new Date(dateTo));

        return matchesSearch && matchesVendor && matchesStatus && matchesDateRange;
    });

    // Calculate metrics based on filtered data
    const metrics = {
        totalInvoices: filteredExtractions.length,
        processed: filteredExtractions.filter(e => e.status === 'COMPLETED').length,
        pending: filteredExtractions.filter(e => e.status === 'PENDING').length,
        reviewRequired: filteredExtractions.filter(e => e.status === 'REVIEW_REQUIRED').length,
        totalAmount: filteredExtractions.reduce((sum, e) => sum + e.totalAmount, 0)
    };

    const handleViewDetails = (extractionId: string) => {
        navigate(`/invoices/${extractionId}`);
    };

    const handleAddInvoice = async (file: File, vendorId: string, invoiceData: any) => {
        try {
            // TODO: Implement invoice upload/creation
            console.log('Adding invoice:', { file, vendorId, invoiceData });
            setShowAddModal(false);
            // Refresh the invoice list
            window.location.reload();
        } catch (error) {
            console.error('Error adding invoice:', error);
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedVendor('');
        setSelectedStatus('');
        setDateFrom('');
        setDateTo('');
    };

    // Check if any filters are active
    const hasActiveFilters = searchTerm || selectedVendor || selectedStatus || dateFrom || dateTo;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-red-600">Error loading invoices: {error.message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Invoices Dashboard</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        View and manage all your invoices in one place
                    </p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Invoice
                </button>
            </div>

            {/* Filters - Sleek Design */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="flex flex-wrap gap-2 items-center">
                    <Filter className="h-4 w-4 text-gray-400" />
                    
                    {/* Search */}
                    <div className="relative flex-1 min-w-[150px] max-w-[200px]">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-7 pr-2 py-1 w-full bg-white border border-gray-200 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                        />
                    </div>

                    {/* Vendor */}
                    <select
                        value={selectedVendor}
                        onChange={(e) => setSelectedVendor(e.target.value)}
                        className="px-2 py-1 bg-white border border-gray-200 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                    >
                        <option value="">All Vendors</option>
                        {vendors.map(vendor => (
                            <option key={vendor.id} value={vendor.id}>
                                {vendor.vendorName}
                            </option>
                        ))}
                    </select>

                    {/* Status */}
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="px-2 py-1 bg-white border border-gray-200 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                    >
                        {APP_CONFIG.filterOptions.invoice.status.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    {/* Date Range */}
                    <div className="flex items-center gap-1">
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="px-2 py-1 bg-white border border-gray-200 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                        />
                        <span className="text-gray-400 text-xs">to</span>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="px-2 py-1 bg-white border border-gray-200 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                        />
                    </div>

                    {/* Clear Filters Button */}
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-all"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Summary Cards - Compact Design */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <Card className="p-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-600">Total Invoices</p>
                            <p className="mt-0.5 text-xl font-bold text-gray-900">{metrics.totalInvoices}</p>
                        </div>
                        <FileText className="h-6 w-6 text-gray-400" />
                    </div>
                </Card>

                <Card className="p-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-600">Processed</p>
                            <p className="mt-0.5 text-xl font-bold text-green-600">{metrics.processed}</p>
                        </div>
                        <CheckCircle className="h-6 w-6 text-green-500" />
                    </div>
                </Card>

                <Card className="p-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-600">Pending</p>
                            <p className="mt-0.5 text-xl font-bold text-blue-600">{metrics.pending}</p>
                        </div>
                        <Clock className="h-6 w-6 text-blue-500" />
                    </div>
                </Card>

                <Card className="p-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-600">Review Required</p>
                            <p className="mt-0.5 text-xl font-bold text-yellow-600">{metrics.reviewRequired}</p>
                        </div>
                        <AlertTriangle className="h-6 w-6 text-yellow-500" />
                    </div>
                </Card>

                <Card className="p-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-600">Total Amount</p>
                            <p className="mt-0.5 text-lg font-bold text-gray-900">
                                {formatCurrency(metrics.totalAmount)}
                            </p>
                        </div>
                        <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                </Card>
            </div>

            {/* Extractions List */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-xs">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Invoice #
                            </th>
                            <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Vendor
                            </th>
                            <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                                Date
                            </th>
                            <th className="px-2 py-1.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Amount
                            </th>
                            <th className="px-2 py-1.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-2 py-1.5 text-right text-xs font-medium text-gray-500 uppercase">
                                Actions
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {filteredExtractions.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-4 text-center text-xs text-gray-500">
                                    No invoices found
                                </td>
                            </tr>
                        ) : (
                            filteredExtractions.map((extraction) => (
                                <tr key={extraction.id} className="hover:bg-gray-50">
                                    <td className="px-2 py-1.5 whitespace-nowrap">
                                        <div className="text-xs font-medium text-gray-900">
                                            {extraction.invoiceNumber}
                                        </div>
                                    </td>
                                    <td className="px-2 py-1.5 whitespace-nowrap">
                                        <div className="text-xs text-gray-900 truncate max-w-[150px]" title={extraction.vendorName}>
                                            {extraction.vendorName}
                                        </div>
                                    </td>
                                    <td className="px-2 py-1.5 whitespace-nowrap hidden md:table-cell">
                                        <div className="text-xs text-gray-600">
                                            {new Date(extraction.invoiceDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                                        </div>
                                    </td>
                                    <td className="px-2 py-1.5 whitespace-nowrap text-right">
                                        <div className="text-xs font-medium text-gray-900">
                                            {formatCurrency(extraction.totalAmount)}
                                        </div>
                                    </td>
                                    <td className="px-2 py-1.5 whitespace-nowrap text-center">
                                        <span className={`inline-flex px-1.5 py-0.5 text-xs font-medium rounded ${
                                            extraction.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                extraction.status === 'PENDING' ? 'bg-blue-100 text-blue-800' :
                                                    extraction.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {extraction.status === 'REVIEW_REQUIRED' ? 'REVIEW' : extraction.status}
                                        </span>
                                    </td>
                                    <td className="px-2 py-1.5 whitespace-nowrap text-right">
                                        <button
                                            onClick={() => handleViewDetails(extraction.id!)}
                                            className="text-xs text-blue-600 hover:text-blue-900 px-1"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Add Invoice Modal */}
            <AddInvoiceModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSubmit={handleAddInvoice}
                vendors={vendors.map(v => ({ id: v.id || v.vendorCode, vendorName: v.vendorName }))}
            />
        </div>
    );
}
