import { useState, useEffect } from 'react';
import { FileText, Users, AlertCircle, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { Card, MetricCard } from '@/components/common';
import { useInvoices } from '@/hooks/useInvoices';
import { useVendors } from '@/hooks/useVendors';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { InvoiceStatus } from '@/types/models';

export default function DashboardPage() {
    const { invoices, loading: invoicesLoading } = useInvoices();
    const { vendors, loading: vendorsLoading } = useVendors();
    const [metrics, setMetrics] = useState({
        totalInvoices: 0,
        pendingInvoices: 0,
        totalAmount: 0,
        disputes: 0,
        activeVendors: 0,
        processingRate: 0
    });

    useEffect(() => {
        if (invoices.length > 0) {
            const totalAmount = invoices.reduce((sum, inv) => sum + inv.financial.totalAmount, 0);
            const pendingInvoices = invoices.filter(inv => 
                ['PENDING', 'EXTRACTING', 'VALIDATING'].includes(inv.status)
            ).length;
            const disputes = invoices.filter(inv => inv.status === 'DISPUTED').length;
            const approved = invoices.filter(inv => inv.status === 'APPROVED').length;
            
            setMetrics({
                totalInvoices: invoices.length,
                pendingInvoices,
                totalAmount,
                disputes,
                activeVendors: vendors.filter(v => v.status === 'ACTIVE').length,
                processingRate: invoices.length > 0 ? (approved / invoices.length) * 100 : 0
            });
        }
    }, [invoices, vendors]);

    const recentInvoices = invoices
        .sort((a, b) => {
            const dateA = a.receivedDate instanceof Date ? a.receivedDate.getTime() : a.receivedDate.toMillis();
            const dateB = b.receivedDate instanceof Date ? b.receivedDate.getTime() : b.receivedDate.toMillis();
            return dateB - dateA;
        })
        .slice(0, 5);

    const getStatusColor = (status: InvoiceStatus): string => {
        const colors: Record<InvoiceStatus, string> = {
            PENDING: 'text-yellow-600 bg-yellow-100',
            EXTRACTING: 'text-blue-600 bg-blue-100',
            EXTRACTED: 'text-indigo-600 bg-indigo-100',
            VALIDATING: 'text-purple-600 bg-purple-100',
            VALIDATED: 'text-green-600 bg-green-100',
            DISPUTED: 'text-red-600 bg-red-100',
            APPROVED: 'text-emerald-600 bg-emerald-100',
            REJECTED: 'text-gray-600 bg-gray-100',
            PAID: 'text-teal-600 bg-teal-100',
            CANCELLED: 'text-gray-500 bg-gray-100'
        };
        return colors[status] || 'text-gray-600 bg-gray-100';
    };

    if (invoicesLoading || vendorsLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
                <p className="mt-1 text-sm text-gray-600">
                    Overview of your invoice reconciliation system
                </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <MetricCard
                    title="Total Invoices"
                    value={metrics.totalInvoices.toString()}
                    icon={FileText}
                    trend={12}
                    trendLabel="from last month"
                />
                <MetricCard
                    title="Pending Processing"
                    value={metrics.pendingInvoices.toString()}
                    icon={Clock}
                    iconColor="text-yellow-600"
                    bgColor="bg-yellow-100"
                />
                <MetricCard
                    title="Total Amount"
                    value={formatCurrency(metrics.totalAmount)}
                    icon={TrendingUp}
                    iconColor="text-green-600"
                    bgColor="bg-green-100"
                />
                <MetricCard
                    title="Active Disputes"
                    value={metrics.disputes.toString()}
                    icon={AlertCircle}
                    iconColor="text-red-600"
                    bgColor="bg-red-100"
                />
                <MetricCard
                    title="Active Vendors"
                    value={metrics.activeVendors.toString()}
                    icon={Users}
                    iconColor="text-indigo-600"
                    bgColor="bg-indigo-100"
                />
                <MetricCard
                    title="Processing Rate"
                    value={`${metrics.processingRate.toFixed(1)}%`}
                    icon={CheckCircle}
                    iconColor="text-emerald-600"
                    bgColor="bg-emerald-100"
                />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card title="Recent Invoices">
                    <div className="space-y-3">
                        {recentInvoices.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No invoices yet</p>
                        ) : (
                            recentInvoices.map((invoice) => (
                                <div
                                    key={invoice.id}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">
                                            {invoice.invoiceNumber}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {invoice.vendorName} • {formatDate(invoice.invoiceDate)}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <span className="text-sm font-medium text-gray-900">
                                            {formatCurrency(invoice.financial.totalAmount)}
                                        </span>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                                            {invoice.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>

                <Card title="Processing Overview">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Extraction Queue</span>
                            <span className="text-sm font-medium text-gray-900">
                                {invoices.filter(i => i.status === 'EXTRACTING').length} invoices
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Validation Queue</span>
                            <span className="text-sm font-medium text-gray-900">
                                {invoices.filter(i => i.status === 'VALIDATING').length} invoices
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Awaiting Approval</span>
                            <span className="text-sm font-medium text-gray-900">
                                {invoices.filter(i => i.status === 'VALIDATED').length} invoices
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Recent Disputes</span>
                            <span className="text-sm font-medium text-gray-900">
                                {metrics.disputes} active
                            </span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}