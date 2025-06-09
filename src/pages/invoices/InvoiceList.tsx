import { Invoice, Vendor } from '@/types/models';
import { StatusBadge, ProgressBar } from '@/components/common';
import { formatCurrency, formatDate, formatDateRange } from '@/utils/formatters';

interface InvoiceListProps {
    invoices: Invoice[];
    vendors: Vendor[];
    onSelectInvoice: (invoice: Invoice) => void;
}

export default function InvoiceList({ invoices, vendors, onSelectInvoice }: InvoiceListProps) {
    const getVendorName = (vendorId: string) => {
        const vendor = vendors.find(v => v.id === vendorId);
        return vendor?.vendorName || vendorId;
    };

    if (invoices.length === 0) {
        return (
            <div className="bg-white shadow-sm rounded-lg p-12 text-center">
                <div className="text-4xl mb-4">📋</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
                <p className="text-gray-500">Upload your first invoice to get started</p>
            </div>
        );
    }

    return (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-gray-900">Recent Invoices</h3>
                    <div className="flex items-center space-x-6 text-sm">
                        <div className="flex items-center">
                            <span className="text-gray-500">Total:</span>
                            <span className="ml-2 font-semibold text-gray-900">{invoices.length}</span>
                        </div>
                        <div className="flex items-center">
                            <span className="text-gray-500">Pending:</span>
                            <span className="ml-2 font-semibold text-yellow-600">
                {invoices.filter(inv => inv.status === 'PENDING').length}
              </span>
                        </div>
                        <div className="flex items-center">
                            <span className="text-gray-500">This Month:</span>
                            <span className="ml-2 font-semibold text-gray-900">
                {formatCurrency(
                    invoices.reduce((sum, inv) => sum + (inv.financial?.totalAmount || 0), 0)
                )}
              </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Invoice Number
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Partner
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Upload Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Period
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Items
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Progress
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {invoices.map((invoice) => (
                        <tr
                            key={invoice.id}
                            onClick={() => onSelectInvoice(invoice)}
                            className="hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-blue-600 hover:text-blue-700">
                                    {invoice.invoiceNumber}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                    {getVendorName(invoice.vendorId)}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(invoice.receivedDate)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDateRange(invoice.periodStart, invoice.periodEnd)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-semibold text-gray-900">
                                    {formatCurrency(invoice.financial?.totalAmount || 0)}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {invoice.summary?.totalLineItems || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <StatusBadge status={invoice.status} />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <ProgressBar progress={invoice.processingStatus?.progress || 0} />
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
