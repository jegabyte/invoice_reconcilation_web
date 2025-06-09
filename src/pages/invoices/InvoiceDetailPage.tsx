import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, CheckCircle, XCircle } from 'lucide-react';
import { Card, LoadingSpinner, StatusBadge } from '@/components/common';
import { useInvoices } from '@/hooks/useInvoices';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Invoice, LineItem } from '@/types/models';

export default function InvoiceDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { getInvoiceById, getLineItems, approveInvoice, rejectInvoice, loading } = useInvoices();
    
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [lineItems, setLineItems] = useState<LineItem[]>([]);
    const [loadingLineItems, setLoadingLineItems] = useState(false);

    useEffect(() => {
        if (id) {
            loadInvoiceData();
        }
    }, [id]);

    const loadInvoiceData = async () => {
        if (!id) return;
        
        const invoiceData = await getInvoiceById(id);
        if (invoiceData) {
            setInvoice(invoiceData);
            
            setLoadingLineItems(true);
            const items = await getLineItems(id);
            setLineItems(items);
            setLoadingLineItems(false);
        }
    };

    const handleApprove = async () => {
        if (!invoice) return;
        
        if (confirm('Are you sure you want to approve this invoice?')) {
            await approveInvoice(invoice.id);
            await loadInvoiceData();
        }
    };

    const handleReject = async () => {
        if (!invoice) return;
        
        const reason = prompt('Please provide a reason for rejection:');
        if (reason) {
            await rejectInvoice(invoice.id, reason);
            await loadInvoiceData();
        }
    };

    if (loading || !invoice) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/invoices')}
                        className="p-2 text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">
                            Invoice {invoice.invoiceNumber}
                        </h1>
                        <p className="text-sm text-gray-600">
                            {invoice.vendorName} • {formatDate(invoice.invoiceDate)}
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center space-x-3">
                    <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                    </button>
                    
                    {invoice.status === 'VALIDATED' && (
                        <>
                            <button
                                onClick={handleReject}
                                className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                            >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                            </button>
                            <button
                                onClick={handleApprove}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                            >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <Card title="Invoice Details">
                        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Status</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    <StatusBadge status={invoice.status} />
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Invoice Number</dt>
                                <dd className="mt-1 text-sm text-gray-900">{invoice.invoiceNumber}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Vendor Invoice #</dt>
                                <dd className="mt-1 text-sm text-gray-900">{invoice.vendorInvoiceNumber}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Period</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    {formatDate(invoice.periodStart)} - {formatDate(invoice.periodEnd)}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Due Date</dt>
                                <dd className="mt-1 text-sm text-gray-900">{formatDate(invoice.dueDate)}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Received Date</dt>
                                <dd className="mt-1 text-sm text-gray-900">{formatDate(invoice.receivedDate)}</dd>
                            </div>
                        </dl>
                    </Card>

                    <Card title="Line Items">
                        {loadingLineItems ? (
                            <div className="flex justify-center py-4">
                                <LoadingSpinner />
                            </div>
                        ) : lineItems.length === 0 ? (
                            <p className="text-center text-gray-500 py-4">No line items found</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Booking
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Guest
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Dates
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Amount
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {lineItems.map((item) => (
                                            <tr key={item.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {item.booking.confirmationNumber}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {item.booking.guestName}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatDate(item.booking.checkInDate)} - {formatDate(item.booking.checkOutDate)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatCurrency(item.financial.totalAmount)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <StatusBadge status={item.validation.status} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card title="Financial Summary">
                        <dl className="space-y-4">
                            <div className="flex justify-between">
                                <dt className="text-sm text-gray-600">Subtotal</dt>
                                <dd className="text-sm font-medium text-gray-900">
                                    {formatCurrency(invoice.financial.subtotal)}
                                </dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-sm text-gray-600">Tax</dt>
                                <dd className="text-sm font-medium text-gray-900">
                                    {formatCurrency(invoice.financial.taxAmount)}
                                </dd>
                            </div>
                            <div className="flex justify-between pt-4 border-t border-gray-200">
                                <dt className="text-base font-medium text-gray-900">Total</dt>
                                <dd className="text-base font-medium text-gray-900">
                                    {formatCurrency(invoice.financial.totalAmount)}
                                </dd>
                            </div>
                            {invoice.financial.variance && (
                                <div className="flex justify-between pt-4 border-t border-gray-200">
                                    <dt className="text-sm text-gray-600">Variance</dt>
                                    <dd className={`text-sm font-medium ${invoice.financial.variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        {formatCurrency(Math.abs(invoice.financial.variance))} ({invoice.financial.variancePercentage?.toFixed(2)}%)
                                    </dd>
                                </div>
                            )}
                        </dl>
                    </Card>

                    <Card title="Processing Status">
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                                    <span className="text-sm text-gray-600">{invoice.processingStatus.progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-primary-600 h-2 rounded-full"
                                        style={{ width: `${invoice.processingStatus.progress}%` }}
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Extraction</span>
                                    <StatusBadge status={invoice.processingStatus.extraction.status} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Validation</span>
                                    <StatusBadge status={invoice.processingStatus.validation.status} />
                                </div>
                            </div>
                            
                            {invoice.processingStatus.validation.status === 'COMPLETED' && (
                                <div className="pt-4 border-t border-gray-200">
                                    <p className="text-sm text-gray-600">
                                        Rules Applied: {invoice.processingStatus.validation.rulesApplied}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Passed: {invoice.processingStatus.validation.rulesPassed}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Failed: {invoice.processingStatus.validation.rulesFailed}
                                    </p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}