import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, FileText, Filter, AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { useInvoices } from '@/hooks/useInvoices';
import { useVendors } from '@/hooks/useVendors';
import { LoadingSpinner, Card, SuccessNotification, InvoicesShimmer } from '@/components/common';
import { formatCurrency, formatDate, formatNumber } from '@/utils/formatters';
import { APP_CONFIG } from '@/config/app.config';
import AddInvoiceModal from './AddInvoiceModal';
import { uploadApiService } from '@/services/api/upload.api.service';
import { cache, CACHE_KEYS } from '@/utils/cache';

export default function InvoicesPage() {
    const navigate = useNavigate();
    const { invoices, loading, error, refreshData } = useInvoices();
    const { vendors } = useVendors();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedVendor, setSelectedVendor] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showSuccessNotification, setShowSuccessNotification] = useState(false);

    // Date range state - no default values
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // Get vendor name mapping - support both camelCase and snake_case
    const vendorMap = vendors.reduce((acc, vendor) => {
        acc[vendor.id!] = vendor.vendorName || vendor.vendor_name || '';
        return acc;
    }, {} as Record<string, string>);

    // Filter invoices based on all criteria including date range
    const filteredInvoices = invoices.filter(invoice => {
        const invoiceVendorName = invoice.vendor_name || invoice.vendorName || '';
        const matchesSearch = searchTerm === '' ||
            (invoice.invoiceId && invoice.invoiceId.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (invoice.invoiceNumber && invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
            invoiceVendorName.toLowerCase().includes(searchTerm.toLowerCase());

        // For vendor filter, compare by vendor name since vendorId is derived from vendor_name
        const matchesVendor = selectedVendor === '' || 
            (selectedVendor && vendorMap[selectedVendor] && 
             invoiceVendorName.toLowerCase() === vendorMap[selectedVendor].toLowerCase());
        
        const matchesStatus = selectedStatus === '' || invoice.invoice_status === selectedStatus;

        // Date filtering - only apply if dates are set (filter by invoice date)
        let matchesDateRange = true;
        if (dateFrom || dateTo) {
            if (invoice.invoiceDate) {
                const invoiceDate = new Date(invoice.invoiceDate);
                matchesDateRange = (!dateFrom || invoiceDate >= new Date(dateFrom)) &&
                    (!dateTo || invoiceDate <= new Date(dateTo));
            } else {
                // If no invoice date, exclude from filtered results when date filter is active
                matchesDateRange = false;
            }
        }

        return matchesSearch && matchesVendor && matchesStatus && matchesDateRange;
    });

    // Calculate metrics based on filtered data using invoice_status field
    const metrics = {
        totalInvoices: filteredInvoices.length,
        processed: filteredInvoices.filter(i => {
            // Count MATCHED and MATCHED_WITH_WARNING as Matched
            const status = i.invoice_status || '';
            return status === 'MATCHED' || status === 'MATCHED_WITH_WARNING';
        }).length,
        onHold: filteredInvoices.filter(i => {
            // Count HOLD_PENDING_REVIEW and PENDING_REVIEW as Pending Review
            const status = i.invoice_status || '';
            return status === 'HOLD_PENDING_REVIEW' || status === 'PENDING_REVIEW';
        }).length,
        disputed: filteredInvoices.filter(i => {
            // Count DISPUTED
            const status = i.invoice_status || '';
            return status === 'DISPUTED';
        }).length,
        totalLineItems: filteredInvoices.reduce((sum, i) => sum + (i.total_line_items || 0), 0)
    };

    const handleViewDetails = (invoiceId: string) => {
        navigate(`/invoices/${invoiceId}`);
    };

    const handleAddInvoice = async (file: File, vendorId: string, invoiceData: any) => {
        try {
            console.log('Uploading invoice:', { fileName: file.name, vendorId, invoiceData });
            
            // Upload the invoice file
            const uploadResult = await uploadApiService.uploadInvoice(file, vendorId, invoiceData);
            
            console.log('Upload result:', uploadResult);
            
            // Close modal and show success notification
            setShowAddModal(false);
            setShowSuccessNotification(true);
            
            // Clear cache and refresh data
            cache.remove(CACHE_KEYS.INVOICES);
            setTimeout(() => {
                refreshData();
            }, 1000);
        } catch (error: any) {
            console.error('Error uploading invoice:', error);
            alert(`Failed to upload invoice: ${error.message || 'Unknown error'}`);
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedVendor('');
        setSelectedStatus('');
        setDateFrom('');
        setDateTo('');
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        cache.remove(CACHE_KEYS.INVOICES);
        await refreshData();
        setIsRefreshing(false);
    };

    // Check if any filters are active
    const hasActiveFilters = searchTerm || selectedVendor || selectedStatus || dateFrom || dateTo;

    if (loading && invoices.length === 0) {
        return <InvoicesShimmer />;
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
                <div className="flex items-center space-x-2">
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing || loading}
                        className="flex items-center px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
                        title="Refresh data"
                    >
                        <RefreshCw className={`h-4 w-4 ${isRefreshing || loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Invoice
                    </button>
                </div>
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
                            placeholder="Search invoice..."
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
                                {vendor.vendorName || vendor.vendor_name || ''}
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                            <p className="text-xs font-medium text-gray-600">Matched</p>
                            <p className="mt-0.5 text-xl font-bold text-green-600">{metrics.processed}</p>
                        </div>
                        <CheckCircle className="h-6 w-6 text-green-500" />
                    </div>
                </Card>

                <Card className="p-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-600">Pending Review</p>
                            <p className="mt-0.5 text-xl font-bold text-yellow-600">{metrics.onHold}</p>
                        </div>
                        <Clock className="h-6 w-6 text-yellow-500" />
                    </div>
                </Card>

                <Card className="p-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-600">Disputed</p>
                            <p className="mt-0.5 text-xl font-bold text-red-600">{metrics.disputed}</p>
                        </div>
                        <AlertCircle className="h-6 w-6 text-red-500" />
                    </div>
                </Card>
            </div>

            {/* Reconciliation Summary List */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                #
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Invoice Number
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Vendor
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Invoice Date
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Invoice Amount
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Recommendation
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {filteredInvoices.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                                    No reconciliations found
                                </td>
                            </tr>
                        ) : (
                            filteredInvoices.map((invoice, index) => {
                                // Use invoice_status field for determining status
                                const status = invoice.invoice_status || '';
                                
                                // Format dates - handle BigQuery date format
                                const formatBigQueryDate = (dateValue: any) => {
                                    if (!dateValue) return '-';
                                    
                                    // BigQuery returns date as an object with 'value' property
                                    const dateStr = dateValue.value || dateValue;
                                    
                                    try {
                                        const date = new Date(dateStr);
                                        if (isNaN(date.getTime())) return '-';
                                        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                                    } catch (e) {
                                        return '-';
                                    }
                                };
                                
                                const invoiceDate = formatBigQueryDate(invoice.invoiceDate || invoice.invoice_date);
                                
                                return (
                                    <tr key={invoice.id} className="hover:bg-gray-50 border-b border-gray-200">
                                        <td className="px-3 py-3 whitespace-nowrap text-center">
                                            <div className="text-sm text-gray-500">
                                                {index + 1}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {invoice.invoiceNumber || invoice.invoice_number || '-'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 truncate max-w-[200px]" title={invoice.vendor_name}>
                                                {invoice.vendor_name}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="text-sm text-gray-600">
                                                {invoiceDate}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-right">
                                            <div className="text-sm font-medium text-gray-900">
                                                {formatNumber(invoice.total_invoice_amount || 0, 2)}
                                                {invoice.invoiceCurrency && (
                                                    <span className="text-gray-500 ml-1">{invoice.invoiceCurrency}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-center">
                                            <div className="flex flex-col items-center space-y-1">
                                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                                    status === 'MATCHED' || status === 'MATCHED_WITH_WARNING' 
                                                        ? 'bg-green-100 text-green-800'
                                                        : status === 'DISPUTED'
                                                        ? 'bg-red-100 text-red-800'
                                                        : status === 'HOLD_PENDING_REVIEW' || status === 'PENDING_REVIEW'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {status || 'PENDING'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-sm text-gray-900 max-w-[200px]" title={invoice.invoice_recommendation || ''}>
                                                {invoice.invoice_recommendation || '-'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-center">
                                            <button
                                                onClick={() => handleViewDetails(invoice.id!)}
                                                className="text-sm text-blue-600 hover:text-blue-900 font-medium"
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
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
                vendors={vendors.map(v => ({ id: v.id || v.vendorCode || v.vendor_code, vendorName: v.vendorName || v.vendor_name || '' }))}
            />
            
            {/* Success Notification */}
            <SuccessNotification
                isOpen={showSuccessNotification}
                onClose={() => setShowSuccessNotification(false)}
                title="Invoice Upload Successful!"
                message="Invoice reconciliation workflow triggered successfully"
                subMessage="Your invoice information will be available shortly"
                autoClose={true}
                autoCloseDelay={5000}
            />
        </div>
    );
}
