import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import { Card, LoadingSpinner } from '@/components/common';
import { ApiDataService } from '@/services/api.data.service';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { InvoiceReconciliationSummary, ReconciliationStatus, VendorConfiguration } from '@/types/api.types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function InvoiceDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    const [summary, setSummary] = useState<InvoiceReconciliationSummary | null>(null);
    const [vendor, setVendor] = useState<VendorConfiguration | null>(null);
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
            
            // Load reconciliation summary
            const summaryData = await ApiDataService.getReconciliationSummary(id);
            setSummary(summaryData);
            
            // Load vendor information if summary exists
            if (summaryData?.vendorId) {
                const vendorData = await ApiDataService.getVendor(summaryData.vendorId);
                setVendor(vendorData);
            }
            
            // Load reconciliation status
            const statusData = await ApiDataService.getReconciliationStatus(summaryData?.invoiceId || id);
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

    if (!summary) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Reconciliation not found</p>
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

    // Get invoice recommendation based on reconciliation status
    const getInvoiceRecommendation = () => {
        if (!summary) return 'No recommendation available';
        if (summary.status === 'MATCHED' && summary.variance === 0) return 'Approve for payment';
        if (summary.status === 'MISMATCHED' || summary.status === 'DISPUTED') return 'Review required';
        if (Math.abs(summary.variancePercentage) < 1) return 'Minor variance - review optional';
        return 'Manual review recommended';
    };

    // Download PDF functionality
    const handleDownloadPDF = () => {
        try {
            if (!summary || !vendor) {
                console.error('No reconciliation data available');
                return;
            }
            
            const doc = new jsPDF();
        
        // Header
        doc.setFontSize(20);
        doc.text(`Invoice #${summary.invoiceId}`, 20, 20);
        doc.setFontSize(12);
        doc.text(vendor.vendorName, 20, 30);
        
        // Invoice Information
        doc.setFontSize(14);
        doc.text('Reconciliation Summary', 20, 45);
        doc.setFontSize(10);
        doc.text(`Invoice ID: ${summary.invoiceId}`, 20, 55);
        doc.text(`Reconciliation Date: ${formatDate(new Date(summary.reconciliationDate))}`, 20, 62);
        doc.text(`Total Invoice Amount: ${formatCurrency(summary.totalInvoiceAmount)}`, 20, 69);
        doc.text(`Total Reconciled Amount: ${formatCurrency(summary.totalReconciledAmount)}`, 20, 76);
        doc.text(`Variance: ${formatCurrency(Math.abs(summary.variance))} (${Math.abs(summary.variancePercentage).toFixed(2)}%)`, 20, 83);
        doc.text(`Processing Status: ${getProcessingStatus()}`, 20, 90);
        
        // Reconciliation Outcome
        doc.setFontSize(14);
        doc.text('Reconciliation Outcome', 20, 105);
        doc.setFontSize(10);
        doc.text(`Status: ${getReconciliationOutcome()}`, 20, 115);
        doc.text(`Recommendation: ${getInvoiceRecommendation()}`, 20, 122);
        doc.text(`Approval Status: ${summary.approvalStatus}`, 20, 129);
        
        // Issues Table
        if (summary.issues && summary.issues.length > 0) {
            const issuesData = summary.issues.map(issue => [
                issue.type,
                issue.severity,
                issue.description,
                issue.variance ? formatCurrency(issue.variance) : '-'
            ]);
            
            autoTable(doc, {
                startY: 140,
                head: [['Issue Type', 'Severity', 'Description', 'Variance']],
                body: issuesData,
                theme: 'striped',
                headStyles: { fillColor: [66, 139, 202] }
            });
        }
        
        // Save the PDF
        doc.save(`reconciliation_${summary.invoiceId}.pdf`);
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
                            Invoice #{summary.invoiceId}
                        </h1>
                        <p className="text-sm text-gray-500">
                            {vendor?.vendorName || 'Unknown Vendor'}
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

            {/* Reconciliation Information */}
            <Card>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Reconciliation Information</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Invoice ID</p>
                            <p className="mt-1 text-sm text-gray-900">{summary.invoiceId}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Reconciliation Date</p>
                            <p className="mt-1 text-sm text-gray-900">
                                {formatDate(new Date(summary.reconciliationDate))}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Invoice Amount</p>
                            <p className="mt-1 text-sm font-semibold text-gray-900">
                                {formatCurrency(summary.totalInvoiceAmount)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Reconciled Amount</p>
                            <p className="mt-1 text-sm font-semibold text-gray-900">
                                {formatCurrency(summary.totalReconciledAmount)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Variance</p>
                            <p className={`mt-1 text-sm font-semibold ${
                                summary.variance === 0 ? 'text-green-600' :
                                Math.abs(summary.variance) < 10 ? 'text-yellow-600' :
                                'text-red-600'
                            }`}>
                                {formatCurrency(Math.abs(summary.variance))}
                                <span className="text-gray-500 ml-1">
                                    ({Math.abs(summary.variancePercentage).toFixed(2)}%)
                                </span>
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Processing Status</p>
                            <p className="mt-1 text-sm text-gray-900">
                                {getProcessingStatus()}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Line Items</p>
                            <p className="mt-1 text-sm text-gray-900">
                                {summary.matchedLineItems}/{summary.totalLineItems} matched
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Approval Status</p>
                            <p className="mt-1">
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                                    summary.approvalStatus === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                    summary.approvalStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {summary.approvalStatus}
                                </span>
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

            {/* Reconciliation Issues */}
            {summary.issues && summary.issues.length > 0 && (
                <Card>
                    <div className="p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Reconciliation Issues</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Severity
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Description
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Variance
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {summary.issues.map((issue, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {issue.type.replace(/_/g, ' ')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    issue.severity === 'HIGH' 
                                                    ? 'bg-red-100 text-red-800'
                                                    : issue.severity === 'MEDIUM'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {issue.severity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {issue.description}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                            {issue.variance ? formatCurrency(Math.abs(issue.variance)) : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Card>
            )}
            
            {/* Notes */}
            {summary.notes && (
                <Card>
                    <div className="p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Notes</h2>
                        <p className="text-sm text-gray-700">{summary.notes}</p>
                    </div>
                </Card>
            )}
        </div>
    );
}