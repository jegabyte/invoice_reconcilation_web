import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, FileText, Filter, AlertCircle, DollarSign, Calendar } from 'lucide-react';
import { useInvoices } from '@/hooks/useInvoices';
import { useVendors } from '@/hooks/useVendors';
import { LoadingSpinner, Card } from '@/components/common';
import { formatCurrency, formatDate } from '@/utils/formatters';
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
        pendingReview: filteredExtractions.filter(e => e.status === 'REVIEW_REQUIRED').length,
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

            {/* Filters - Ultra Compact Design */}
            <Card className="p-2">
                <div className="flex flex-wrap gap-2 items-center">
                    {/* Search */}
                    <div className="flex-1 min-w-[180px] max-w-[250px]">
                        <div className="relative">
                            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-7 pr-2 py-1 w-full border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Vendor */}
                    <select
                        value={selectedVendor}
                        onChange={(e) => setSelectedVendor(e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none min-w-[120px]"
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
                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none min-w-[100px]"
                    >
                        <option value="">All Status</option>
                        <option value="PENDING">Pending</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="FAILED">Failed</option>
                        <option value="REVIEW_REQUIRED">Review Required</option>
                    </select>

                    {/* Date Range */}
                    <div className="flex items-center gap-1">
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                        />
                        <span className="text-gray-400 text-xs">-</span>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                        />
                    </div>

                    {/* Clear Filters Button */}
                    <button
                        onClick={clearFilters}
                        className={`px-3 py-1 text-sm font-medium rounded transition-all ${
                            hasActiveFilters
                                ? 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-300'
                                : 'text-gray-400 border border-gray-200 cursor-not-allowed'
                        }`}
                        disabled={!hasActiveFilters}
                    >
                        <div className="flex items-center gap-1">
                            <Filter className="h-3.5 w-3.5" />
                            Clear
                        </div>
                    </button>
                </div>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                            <p className="mt-1 text-2xl font-bold text-gray-900">{metrics.totalInvoices}</p>
                        </div>
                        <FileText className="h-8 w-8 text-gray-400" />
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Processed</p>
                            <p className="mt-1 text-2xl font-bold text-green-600">{metrics.processed}</p>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                            <div className="h-3 w-3 rounded-full bg-green-600"></div>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Pending Review</p>
                            <p className="mt-1 text-2xl font-bold text-yellow-600">{metrics.pendingReview}</p>
                        </div>
                        <AlertCircle className="h-8 w-8 text-yellow-400" />
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Amount</p>
                            <p className="mt-1 text-2xl font-bold text-gray-900">
                                {formatCurrency(metrics.totalAmount)}
                            </p>
                        </div>
                        <DollarSign className="h-8 w-8 text-green-600" />
                    </div>
                </Card>
            </div>

            {/* Extractions List */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Invoice Number
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Vendor
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Confidence
                            </th>
                            <th className="relative px-6 py-3">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {filteredExtractions.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                                    No extractions found
                                </td>
                            </tr>
                        ) : (
                            filteredExtractions.map((extraction) => (
                                <tr key={extraction.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {extraction.invoiceNumber}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{extraction.vendorName}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {formatDate(new Date(extraction.invoiceDate))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {formatCurrency(extraction.totalAmount)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                extraction.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                    extraction.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                        extraction.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                                                            'bg-blue-100 text-blue-800'
                                            }`}>
                                                {extraction.status}
                                            </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                                                <div
                                                    className={`h-2 rounded-full ${
                                                        extraction.confidence >= 0.8 ? 'bg-green-500' :
                                                            extraction.confidence >= 0.6 ? 'bg-yellow-500' :
                                                                'bg-red-500'
                                                    }`}
                                                    style={{ width: `${extraction.confidence * 100}%` }}
                                                />
                                            </div>
                                            <span className="ml-2 text-sm text-gray-600">
                                                    {(extraction.confidence * 100).toFixed(0)}%
                                                </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleViewDetails(extraction.id!)}
                                            className="text-blue-600 hover:text-blue-900"
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
                vendors={vendors}
            />
        </div>
    );
}
