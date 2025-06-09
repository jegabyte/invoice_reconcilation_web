import { useState, useEffect } from 'react';
import { Invoice, LineItem } from '@/types/models';
import { Modal } from '@/components/common';
import { formatCurrency, formatDate, formatStatus } from '@/utils/formatters';
import { ChevronRight, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { ServiceFactory } from '@/services/factory/service-factory';
import { LineItemDetail } from '@/components/invoices/LineItemDetail';

interface InvoiceDetailsModalProps {
    invoice: Invoice | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function InvoiceDetailsModal({ invoice, isOpen, onClose }: InvoiceDetailsModalProps) {
    const [lineItems, setLineItems] = useState<LineItem[]>([]);
    const [selectedLineItem, setSelectedLineItem] = useState<LineItem | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (invoice?.id) {
            loadLineItems();
        }
    }, [invoice?.id]);

    const loadLineItems = async () => {
        if (!invoice) return;
        
        try {
            setLoading(true);
            const dataService = ServiceFactory.getDataService();
            const items = await dataService.getLineItems(invoice.id);
            setLineItems(items);
        } catch (error) {
            console.error('Error loading line items:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!invoice) return null;

    const getValidationIcon = (status: string) => {
        switch (status) {
            case 'PASSED':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'FAILED':
            case 'DISPUTED':
                return <XCircle className="w-5 h-5 text-red-500" />;
            case 'WARNING':
                return <AlertCircle className="w-5 h-5 text-yellow-500" />;
            default:
                return <AlertCircle className="w-5 h-5 text-gray-400" />;
        }
    };

    const getValidationColor = (status: string) => {
        switch (status) {
            case 'PASSED':
                return 'bg-green-50 hover:bg-green-100 border-green-200';
            case 'FAILED':
            case 'DISPUTED':
                return 'bg-red-50 hover:bg-red-100 border-red-200';
            case 'WARNING':
                return 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200';
            default:
                return 'bg-gray-50 hover:bg-gray-100 border-gray-200';
        }
    };

    return (
        <>
            <Modal isOpen={isOpen && !selectedLineItem} onClose={onClose} title="Invoice Details" size="lg">
                <div className="space-y-6">
                    {/* Invoice Summary */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h4 className="text-sm font-medium text-gray-500">Invoice Number</h4>
                            <p className="mt-1 text-base font-semibold text-gray-900">{invoice.invoiceNumber}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-gray-500">Total Amount</h4>
                            <p className="mt-1 text-base font-semibold text-gray-900">
                                {formatCurrency(invoice.financial?.totalAmount || 0)}
                            </p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-gray-500">Invoice Date</h4>
                            <p className="mt-1 text-sm text-gray-900">{formatDate(invoice.invoiceDate)}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-gray-500">Status</h4>
                            <p className="mt-1 text-sm font-medium text-gray-900">{formatStatus(invoice.status)}</p>
                        </div>
                    </div>

                    {/* Line Items Section */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Line Items ({lineItems.length})
                        </h3>
                        
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                            </div>
                        ) : lineItems.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No line items available
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {lineItems.map((lineItem) => (
                                    <div
                                        key={lineItem.id}
                                        onClick={() => setSelectedLineItem(lineItem)}
                                        className={`border rounded-lg p-4 cursor-pointer transition-all ${getValidationColor(lineItem.validation.status)}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                {getValidationIcon(lineItem.validation.status)}
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {lineItem.booking.confirmationNumber}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {lineItem.booking.guestName} • {lineItem.booking.propertyName}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center space-x-4">
                                                <div className="text-right">
                                                    <p className="font-medium text-gray-900">
                                                        {formatCurrency(lineItem.financial.totalAmount)}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {lineItem.validation.passedRules || 0}/{lineItem.validation.totalRules || 0} rules passed
                                                    </p>
                                                </div>
                                                <ChevronRight className="w-5 h-5 text-gray-400" />
                                            </div>
                                        </div>
                                        
                                        {lineItem.validation.warnings && lineItem.validation.warnings > 0 && (
                                            <div className="mt-2 flex items-center text-sm text-yellow-600">
                                                <AlertCircle className="w-4 h-4 mr-1" />
                                                {lineItem.validation.warnings} warning{lineItem.validation.warnings > 1 ? 's' : ''}
                                            </div>
                                        )}
                                        
                                        {lineItem.validation.failedRules && lineItem.validation.failedRules > 0 && (
                                            <div className="mt-2 flex items-center text-sm text-red-600">
                                                <XCircle className="w-4 h-4 mr-1" />
                                                {lineItem.validation.failedRules} rule{lineItem.validation.failedRules > 1 ? 's' : ''} failed
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </Modal>

            {/* Line Item Detail Modal */}
            {selectedLineItem && (
                <Modal 
                    isOpen={!!selectedLineItem} 
                    onClose={() => setSelectedLineItem(null)} 
                    title="Line Item Details" 
                    size="lg"
                >
                    <LineItemDetail 
                        lineItem={selectedLineItem} 
                        onClose={() => setSelectedLineItem(null)} 
                    />
                </Modal>
            )}
        </>
    );
}