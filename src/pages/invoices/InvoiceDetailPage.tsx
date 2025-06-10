import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, CheckCircle, FileText, AlertCircle } from 'lucide-react';
import { Card, LoadingSpinner } from '@/components/common';
import { ApiDataService } from '@/services/api.data.service';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { ExtractionResult, InvoiceReconciliationSummary, ReconciliationStatus } from '@/types/api.types';

export default function InvoiceDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    const [extraction, setExtraction] = useState<ExtractionResult | null>(null);
    const [summary, setSummary] = useState<InvoiceReconciliationSummary | null>(null);
    const [status, setStatus] = useState<ReconciliationStatus | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadInvoiceData();
        }
    }, [id]);

    const loadInvoiceData = async () => {
        if (!id) return;
        
        try {
            setLoading(true);
            
            // Load extraction result
            const extractionData = await ApiDataService.getExtractionResult(id);
            setExtraction(extractionData);
            
            // Try to load reconciliation summary if exists
            const summaries = await ApiDataService.getReconciliationSummaries({ 
                vendorId: extractionData?.vendorId 
            });
            const relatedSummary = summaries.find(s => s.invoiceId === id);
            setSummary(relatedSummary || null);
            
            // Load reconciliation status
            const statusData = await ApiDataService.getReconciliationStatus(id);
            setStatus(statusData);
        } catch (error) {
            console.error('Error loading invoice data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner />
            </div>
        );
    }

    if (!extraction) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Invoice not found</p>
                <button
                    onClick={() => navigate('/invoices')}
                    className="mt-4 text-blue-600 hover:text-blue-800"
                >
                    Back to Invoices
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/invoices')}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Invoice #{extraction.invoiceNumber}
                        </h1>
                        <p className="text-sm text-gray-500">
                            {extraction.vendorName}
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center space-x-3">
                    <button
                        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                    </button>
                </div>
            </div>

            {/* Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Extraction Status</p>
                            <p className="mt-1 text-lg font-semibold">{extraction.status}</p>
                        </div>
                        <FileText className="h-8 w-8 text-gray-400" />
                    </div>
                </Card>
                
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Confidence Score</p>
                            <p className="mt-1 text-lg font-semibold">
                                {(extraction.confidence * 100).toFixed(1)}%
                            </p>
                        </div>
                        <div className={`h-8 w-8 ${
                            extraction.confidence >= 0.8 ? 'text-green-500' :
                            extraction.confidence >= 0.6 ? 'text-yellow-500' :
                            'text-red-500'
                        }`}>
                            {extraction.confidence >= 0.8 ? <CheckCircle /> : <AlertCircle />}
                        </div>
                    </div>
                </Card>
                
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Amount</p>
                            <p className="mt-1 text-lg font-semibold">
                                {formatCurrency(extraction.totalAmount)}
                            </p>
                        </div>
                        <span className="text-2xl">💰</span>
                    </div>
                </Card>
            </div>

            {/* Invoice Details */}
            <Card>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Invoice Information</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Invoice Number</p>
                            <p className="mt-1 text-sm text-gray-900">{extraction.invoiceNumber}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Invoice Date</p>
                            <p className="mt-1 text-sm text-gray-900">
                                {formatDate(new Date(extraction.invoiceDate))}
                            </p>
                        </div>
                        {extraction.dueDate && (
                            <div>
                                <p className="text-sm font-medium text-gray-500">Due Date</p>
                                <p className="mt-1 text-sm text-gray-900">
                                    {formatDate(new Date(extraction.dueDate))}
                                </p>
                            </div>
                        )}
                        <div>
                            <p className="text-sm font-medium text-gray-500">Currency</p>
                            <p className="mt-1 text-sm text-gray-900">{extraction.currency}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Extraction Method</p>
                            <p className="mt-1 text-sm text-gray-900">{extraction.extractionMethod}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Created At</p>
                            <p className="mt-1 text-sm text-gray-900">
                                {formatDate(new Date(extraction.createdAt))}
                            </p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Line Items */}
            <Card>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Line Items</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        #
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Description
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Guest Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Check In
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Check Out
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Quantity
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Unit Price
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {extraction.extractedData.lineItems.map((item, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {item.lineNumber}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {item.description}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {item.guestName || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {item.checkInDate ? formatDate(new Date(item.checkInDate)) : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {item.checkOutDate ? formatDate(new Date(item.checkOutDate)) : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                            {item.quantity}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                            {formatCurrency(item.unitPrice)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                                            {formatCurrency(item.amount)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-50">
                                <tr>
                                    <td colSpan={7} className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                                        Total
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                                        {formatCurrency(extraction.totalAmount)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </Card>

            {/* Reconciliation Summary */}
            {summary && (
                <Card>
                    <div className="p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Reconciliation Summary</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Status</p>
                                <p className="mt-1 text-sm font-semibold text-gray-900">{summary.status}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Variance</p>
                                <p className="mt-1 text-sm font-semibold text-gray-900">
                                    {formatCurrency(summary.variance)} ({summary.variancePercentage.toFixed(2)}%)
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Matched Items</p>
                                <p className="mt-1 text-sm font-semibold text-gray-900">
                                    {summary.matchedLineItems} / {summary.totalLineItems}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Approval Status</p>
                                <p className="mt-1 text-sm font-semibold text-gray-900">
                                    {summary.approvalStatus || 'Pending'}
                                </p>
                            </div>
                        </div>

                        {summary.issues.length > 0 && (
                            <div className="mt-4">
                                <h3 className="text-sm font-medium text-gray-900 mb-2">Issues Found</h3>
                                <div className="space-y-2">
                                    {summary.issues.map((issue, index) => (
                                        <div key={index} className={`p-3 rounded-lg ${
                                            issue.severity === 'HIGH' ? 'bg-red-50' :
                                            issue.severity === 'MEDIUM' ? 'bg-yellow-50' :
                                            'bg-blue-50'
                                        }`}>
                                            <p className="text-sm font-medium">{issue.type}</p>
                                            <p className="text-sm text-gray-600">{issue.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            )}

            {/* Processing Status */}
            {status && (
                <Card>
                    <div className="p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Processing Status</h2>
                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">Extraction</span>
                                    <span className="text-sm text-gray-500">
                                        {status.progress.extraction.percentage}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full"
                                        style={{ width: `${status.progress.extraction.percentage}%` }}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">Validation</span>
                                    <span className="text-sm text-gray-500">
                                        {status.progress.validation.percentage}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full"
                                        style={{ width: `${status.progress.validation.percentage}%` }}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">Reconciliation</span>
                                    <span className="text-sm text-gray-500">
                                        {status.progress.reconciliation.percentage}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full"
                                        style={{ width: `${status.progress.reconciliation.percentage}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}