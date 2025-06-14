import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import { Card, LoadingSpinner } from '@/components/common';
import { ApiDataService } from '@/services/api.data.service';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { ExtractionResult, InvoiceReconciliationSummary, ReconciliationStatus } from '@/types/api.types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

    // Determine processing status
    const getProcessingStatus = () => {
        if (!status) return 'Processing';
        if (status.currentStage === 'EXTRACTING') return 'Extraction in progress';
        if (status.currentStage === 'RECONCILING') return 'Invoice reconciliation in progress';
        if (status.currentStage === 'COMPLETED') return 'Processing completed';
        if (status.currentStage === 'FAILED') return 'Processing failed';
        return status.currentStage;
    };

    // Get reconciliation outcome
    const getReconciliationOutcome = () => {
        if (!summary) return 'Pending';
        if (summary.status === 'MATCHED' && summary.variance === 0) return 'Complete Match';
        if (summary.status === 'DISPUTED' || summary.status === 'MISMATCHED') return 'Disputed';
        return summary.status;
    };

    // Get invoice recommendation
    const getInvoiceRecommendation = () => {
        if (!extraction.extractedData.headerInfo.recommendation) return 'No recommendation available';
        return extraction.extractedData.headerInfo.recommendation;
    };

    // Download PDF functionality
    const handleDownloadPDF = () => {
        try {
            if (!extraction) {
                console.error('No extraction data available');
                return;
            }
            
            const doc = new jsPDF();
        
        // Header
        doc.setFontSize(20);
        doc.text(`Invoice #${extraction.invoiceNumber}`, 20, 20);
        doc.setFontSize(12);
        doc.text(extraction.vendorName, 20, 30);
        
        // Invoice Information
        doc.setFontSize(14);
        doc.text('Invoice Information', 20, 45);
        doc.setFontSize(10);
        doc.text(`Invoice Number: ${extraction.invoiceNumber}`, 20, 55);
        doc.text(`Invoice Date: ${formatDate(new Date(extraction.invoiceDate))}`, 20, 62);
        doc.text(`Due Date: ${extraction.dueDate ? formatDate(new Date(extraction.dueDate)) : 'N/A'}`, 20, 69);
        doc.text(`Currency: ${extraction.currency}`, 20, 76);
        doc.text(`Total Amount: ${formatCurrency(extraction.totalAmount)}`, 20, 83);
        doc.text(`Processing Status: ${getProcessingStatus()}`, 20, 90);
        
        // Reconciliation Outcome
        doc.setFontSize(14);
        doc.text('Reconciliation Outcome', 20, 105);
        doc.setFontSize(10);
        doc.text(`Outcome: ${getReconciliationOutcome()}`, 20, 115);
        doc.text(`Recommendation: ${getInvoiceRecommendation()}`, 20, 122);
        
        // Line Items Table
        const lineItemsData = extraction.extractedData.lineItems.map(item => [
            item.bookingReference || '-',
            formatCurrency(item.amount),
            item.metadata?.status || '-',
            item.metadata?.dispute_type || '-',
            item.metadata?.warnings_count || '0'
        ]);
        
        autoTable(doc, {
            startY: 135,
            head: [['Booking ID', 'Invoice Amount', 'Status', 'Dispute Type', 'Warnings']],
            body: lineItemsData,
            theme: 'striped',
            headStyles: { fillColor: [66, 139, 202] }
        });
        
        // Save the PDF
        doc.save(`invoice_${extraction.invoiceNumber}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please check the console for details.');
        }
    };

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
                        onClick={handleDownloadPDF}
                        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                    </button>
                </div>
            </div>

            {/* Invoice Information */}
            <Card>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Invoice Information</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                            <p className="text-sm font-medium text-gray-500">Total Amount</p>
                            <p className="mt-1 text-sm font-semibold text-gray-900">
                                {formatCurrency(extraction.totalAmount)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Processing Status</p>
                            <p className="mt-1 text-sm text-gray-900">
                                {getProcessingStatus()}
                            </p>
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

            {/* Reconciliation Outcome */}
            <Card>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Reconciliation Outcome</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Recon Outcome</p>
                            <p className="mt-1">
                                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                                    getReconciliationOutcome() === 'Complete Match' 
                                        ? 'bg-green-100 text-green-800' 
                                        : getReconciliationOutcome() === 'Disputed'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {getReconciliationOutcome()}
                                </span>
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Invoice Recommendation</p>
                            <p className="mt-1 text-sm text-gray-900">
                                {getInvoiceRecommendation()}
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
                                        Booking ID
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Invoice Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Dispute Type
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Warnings Count
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {extraction.extractedData.lineItems.map((item, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {item.bookingReference || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                                            {formatCurrency(item.amount)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                item.metadata?.status === 'MATCHED' 
                                                    ? 'bg-green-100 text-green-800'
                                                    : item.metadata?.status === 'DISPUTED'
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {item.metadata?.status || 'PENDING'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {item.metadata?.dispute_type || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                (item.metadata?.warnings_count || 0) > 0
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {item.metadata?.warnings_count || 0}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-50">
                                <tr>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                        Total
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                                        {formatCurrency(extraction.totalAmount)}
                                    </td>
                                    <td colSpan={3}></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </Card>
        </div>
    );
}