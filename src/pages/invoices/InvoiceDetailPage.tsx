import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import { Card, LoadingSpinner } from '@/components/common';
import { InvoiceDetailShimmer } from '@/components/invoices';
import { ApiDataService } from '@/services/api.data.service';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { InvoiceReconciliationSummary, ReconciliationStatus, VendorConfiguration } from '@/types/api.types';
import { cache, CACHE_KEYS, CACHE_TTL } from '@/utils/cache';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import 'jspdf-autotable';

export default function InvoiceDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    const [summary, setSummary] = useState<InvoiceReconciliationSummary | null>(null);
    const [vendor, setVendor] = useState<VendorConfiguration | null>(null);
    const [status, setStatus] = useState<ReconciliationStatus | null>(null);
    const [lineItemStatuses, setLineItemStatuses] = useState<any[]>([]);
    const [extractionLineItems, setExtractionLineItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedSections, setExpandedSections] = useState({
        extractionResults: false,
        reconciliationDetails: true
    });
    
    // Sorting states
    const [extractionSort, setExtractionSort] = useState<{ field: string; direction: 'asc' | 'desc' } | null>(null);
    const [reconciliationSort, setReconciliationSort] = useState<{ field: string; direction: 'asc' | 'desc' } | null>(null);

    useEffect(() => {
        if (id) {
            loadInvoiceData();
        }
    }, [id]);

    const loadInvoiceData = async () => {
        if (!id) return;
        
        try {
            setLoading(true);
            
            console.log('=== INVOICE DETAIL PAGE DEBUG ===');
            console.log('Route parameter ID:', id);
            
            // Load reconciliation summary (with cache)
            const summaryKey = CACHE_KEYS.RECONCILIATION_SUMMARY(id);
            let summaryData = cache.get<InvoiceReconciliationSummary>(summaryKey);
            
            if (!summaryData) {
                console.log('Cache miss for reconciliation summary, fetching from API...');
                const startTime = Date.now();
                summaryData = await ApiDataService.getReconciliationSummary(id);
                console.log(`API call took ${Date.now() - startTime}ms`);
                if (summaryData) {
                    cache.set(summaryKey, summaryData, CACHE_TTL.LONG);
                    console.log('Data cached with LONG TTL (30 minutes)');
                }
            } else {
                console.log('Using cached reconciliation summary - no API call needed');
            }
            
            console.log('Reconciliation summary data:', summaryData);
            console.log('Summary keys:', Object.keys(summaryData || {}));
            console.log('Invoice Number:', summaryData?.invoice_number);
            console.log('Invoice Date:', summaryData?.invoice_date);
            console.log('Payment Due Date:', summaryData?.payment_due_date);
            console.log('Extraction ID:', summaryData?.extraction_id);
            console.log('ID field:', summaryData?.id);
            console.log('InvoiceId field:', summaryData?.invoiceId);
            setSummary(summaryData);
            
            // Load data in parallel for better performance
            const parallelPromises = [];
            
            // Load vendor information if summary exists
            if (summaryData?.vendorId) {
                console.log('Loading vendor data for ID:', summaryData.vendorId);
                parallelPromises.push(
                    ApiDataService.getVendor(summaryData.vendorId)
                        .then(vendorData => {
                            console.log('Vendor data:', vendorData);
                            setVendor(vendorData);
                        })
                        .catch(vendorError => {
                            console.warn('Failed to load vendor data:', vendorError);
                            // Continue loading other data even if vendor fails
                        })
                );
            }
            
            // Load reconciliation status
            parallelPromises.push(
                ApiDataService.getReconciliationStatus(summaryData?.invoiceId || id)
                    .then(statusData => {
                        console.log('Reconciliation status data:', statusData);
                        setStatus(statusData);
                    })
                    .catch(error => {
                        console.error('Failed to load reconciliation status:', error);
                    })
            );
            
            // Load extraction line items (with cache)
            if (summaryData?.extraction_id) {
                const extractionKey = CACHE_KEYS.EXTRACTION_PARTS(summaryData.extraction_id);
                let cachedExtractionData = cache.get<any>(extractionKey);
                
                if (cachedExtractionData) {
                    console.log('Using cached extraction parts');
                    setExtractionLineItems(cachedExtractionData.line_items || []);
                } else {
                    parallelPromises.push(
                        fetch(`/api/extraction/parts/${summaryData.extraction_id}`)
                            .then(async (response) => {
                                if (response.ok) {
                                    const data = await response.json();
                                    console.log('Extraction parts loaded:', data.line_items?.length || 0, 'items');
                                    setExtractionLineItems(data.line_items || []);
                                    if (data) {
                                        cache.set(extractionKey, data, CACHE_TTL.LONG);
                                    }
                                } else {
                                    console.error('Failed to fetch extraction parts:', response.statusText);
                                    setExtractionLineItems([]);
                                }
                            })
                            .catch(error => {
                                console.error('Error fetching extraction parts:', error);
                                setExtractionLineItems([]);
                            })
                    );
                }
            } else {
                console.warn('No extraction_id found in summary data');
                setExtractionLineItems([]);
            }
            
            // Load line item statuses using extraction_id (with cache)
            if (summaryData?.extraction_id) {
                const statusKey = CACHE_KEYS.LINE_ITEM_STATUSES(summaryData.extraction_id);
                let cachedStatusData = cache.get<any[]>(statusKey);
                
                if (cachedStatusData) {
                    console.log('Using cached line item statuses');
                    setLineItemStatuses(cachedStatusData);
                } else {
                    parallelPromises.push(
                        fetch(`/api/status/extraction/${summaryData.extraction_id}`)
                            .then(async (response) => {
                                if (response.ok) {
                                    const lineItems = await response.json();
                                    console.log('Line item statuses loaded:', lineItems?.length || 0, 'items');
                                    setLineItemStatuses(lineItems || []);
                                    if (lineItems) {
                                        cache.set(statusKey, lineItems, CACHE_TTL.LONG);
                                    }
                                } else {
                                    console.error('Failed to fetch line item statuses:', response.statusText);
                                    setLineItemStatuses([]);
                                }
                            })
                            .catch(error => {
                                console.error('Error fetching line item statuses:', error);
                                setLineItemStatuses([]);
                            })
                    );
                }
            } else {
                console.warn('No extraction_id found for fetching line item statuses');
                setLineItemStatuses([]);
            }
            
            // Wait for all parallel requests to complete
            console.log(`Starting ${parallelPromises.length} parallel requests...`);
            const parallelStartTime = Date.now();
            await Promise.all(parallelPromises);
            console.log(`All parallel requests completed in ${Date.now() - parallelStartTime}ms`);
        } catch (error) {
            console.error('Error loading invoice data:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };
    
    // Sorting functions
    const sortData = (data: any[], field: string, direction: 'asc' | 'desc') => {
        return [...data].sort((a, b) => {
            let aVal = a[field];
            let bVal = b[field];
            
            // Handle nested fields
            if (field.includes('.')) {
                const fields = field.split('.');
                aVal = fields.reduce((obj, f) => obj?.[f], a);
                bVal = fields.reduce((obj, f) => obj?.[f], b);
            }
            
            // Handle dates
            if (field.includes('date')) {
                aVal = aVal ? new Date(aVal).getTime() : 0;
                bVal = bVal ? new Date(bVal).getTime() : 0;
            }
            
            // Handle null/undefined
            if (aVal === null || aVal === undefined) aVal = '';
            if (bVal === null || bVal === undefined) bVal = '';
            
            // Compare
            if (aVal < bVal) return direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    };
    
    const handleExtractionSort = (field: string) => {
        const newDirection = extractionSort?.field === field && extractionSort.direction === 'asc' ? 'desc' : 'asc';
        setExtractionSort({ field, direction: newDirection });
    };
    
    const handleReconciliationSort = (field: string) => {
        const newDirection = reconciliationSort?.field === field && reconciliationSort.direction === 'asc' ? 'desc' : 'asc';
        setReconciliationSort({ field, direction: newDirection });
    };
    
    // Apply sorting to data
    const sortedExtractionItems = extractionSort 
        ? sortData(extractionLineItems, extractionSort.field, extractionSort.direction)
        : extractionLineItems;
        
    const sortedReconciliationItems = reconciliationSort
        ? sortData(lineItemStatuses, reconciliationSort.field, reconciliationSort.direction)
        : lineItemStatuses;

    if (loading) {
        return <InvoiceDetailShimmer />;
    }

    if (!summary) {
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

    // Download PDF functionality
    const handleDownloadPDF = () => {
        try {
            if (!summary) {
                console.error('No invoice data available');
                return;
            }
            
            const doc = new jsPDF();
            let yPosition = 20;
        
            // Header
            doc.setFontSize(20);
            doc.setTextColor(33, 37, 41);
            doc.text('Invoice Details Report', 20, yPosition);
            yPosition += 15;
            
            // Invoice Summary Section
            doc.setFontSize(16);
            doc.setTextColor(0, 0, 0);
            doc.text('Invoice Summary', 20, yPosition);
            yPosition += 10;
            
            doc.setFontSize(10);
            doc.setTextColor(75, 85, 99);
            
            // Invoice details in two columns
            const col1X = 20;
            const col2X = 110;
            let currentY = yPosition;
            
            // Column 1
            doc.text(`Invoice Number: ${summary.invoiceNumber || summary.invoice_number || 'N/A'}`, col1X, currentY);
            currentY += 7;
            doc.text(`Invoice Date: ${(summary.invoiceDate || summary.invoice_date) ? formatDate(new Date(summary.invoiceDate || summary.invoice_date)) : 'N/A'}`, col1X, currentY);
            currentY += 7;
            doc.text(`Payment Due Date: ${(summary.paymentDueDate || summary.payment_due_date) ? formatDate(new Date(summary.paymentDueDate || summary.payment_due_date)) : 'N/A'}`, col1X, currentY);
            
            // Column 2
            currentY = yPosition;
            doc.text(`Vendor: ${summary.vendorName || summary.vendor_name}`, col2X, currentY);
            currentY += 7;
            doc.text(`Total Invoice Amount: ${formatCurrency(summary.totalInvoiceAmount || summary.total_invoice_amount)}`, col2X, currentY);
            currentY += 7;
            doc.text(`Status: ${summary.processing_status || 'PROCESSING'}`, col2X, currentY);
            
            yPosition = currentY + 15;
            
            // Reconciliation Summary Section
            doc.setFontSize(16);
            doc.setTextColor(0, 0, 0);
            doc.text('Reconciliation Summary', 20, yPosition);
            yPosition += 10;
            
            // Status Summary
            doc.setFontSize(10);
            doc.setTextColor(75, 85, 99);
            if (summary.status_summary) {
                Object.entries(summary.status_summary).forEach(([status, count]) => {
                    doc.text(`${status.replace(/_/g, ' ')}: ${count}`, 20, yPosition);
                    yPosition += 6;
                });
            }
            
            // Skip financial summary as requested
            
            // Add page break if needed
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
            } else {
                yPosition += 15;
            }
            
            // Extraction Results Section
            if (extractionLineItems.length > 0) {
                doc.setFontSize(16);
                doc.setTextColor(0, 0, 0);
                doc.text(`Extraction Results (${extractionLineItems.length} line items)`, 20, yPosition);
                yPosition += 10;
                
                // Extraction Results Table
                const extractionColumns = [
                    { header: 'Booking ID', dataKey: 'booking_id' },
                    { header: 'Hotel Name', dataKey: 'hotel_name' },
                    { header: 'Check-in', dataKey: 'check_in' },
                    { header: 'Check-out', dataKey: 'check_out' },
                    { header: 'Amount', dataKey: 'amount' },
                    { header: 'Commission', dataKey: 'commission' },
                    { header: 'Currency', dataKey: 'currency' }
                ];
                
                const extractionRows = extractionLineItems.map(item => ({
                    booking_id: item.booking_id || 'N/A',
                    hotel_name: item.hotel_name || 'N/A',
                    check_in: item.check_in_date ? new Date(item.check_in_date).toLocaleDateString() : 'N/A',
                    check_out: item.check_out_date ? new Date(item.check_out_date).toLocaleDateString() : 'N/A',
                    amount: formatCurrency(item.amount || 0),
                    commission: formatCurrency(item.commission || 0),
                    currency: item.currency || 'N/A'
                }));
                
                autoTable(doc, {
                    columns: extractionColumns,
                    body: extractionRows,
                    startY: yPosition,
                    headStyles: { 
                        fillColor: [249, 250, 251],
                        textColor: [75, 85, 99],
                        fontSize: 9,
                        fontStyle: 'bold'
                    },
                    bodyStyles: { 
                        fontSize: 8,
                        textColor: [55, 65, 81]
                    },
                    alternateRowStyles: { fillColor: [249, 250, 251] },
                    margin: { left: 20, right: 20 },
                    didDrawPage: (data) => {
                        yPosition = data.cursor.y;
                    }
                });
                
                yPosition += 10;
            }
            
            // Add new page for reconciliation details if needed
            if (yPosition > 200 || lineItemStatuses.length > 0) {
                doc.addPage();
                yPosition = 20;
            }
            
            // Reconciliation Details Section
            if (lineItemStatuses.length > 0) {
                doc.setFontSize(16);
                doc.setTextColor(0, 0, 0);
                doc.text(`Reconciliation Details (${lineItemStatuses.length} items)`, 20, yPosition);
                yPosition += 10;
                
                // Reconciliation Details Table
                const reconciliationColumns = [
                    { header: 'Booking ID', dataKey: 'booking_id' },
                    { header: 'Hotel Name', dataKey: 'hotel_name' },
                    { header: 'Amount', dataKey: 'amount' },
                    { header: 'Check-in', dataKey: 'check_in' },
                    { header: 'Check-out', dataKey: 'check_out' },
                    { header: 'Status', dataKey: 'status' },
                    { header: 'Dispute Type', dataKey: 'dispute_type' }
                ];
                
                const reconciliationRows = lineItemStatuses.map(item => ({
                    booking_id: item.bookingId || item.booking_id || 'N/A',
                    hotel_name: item.hotelName || item.hotel_name || 'N/A',
                    amount: formatCurrency(item.invoiceData?.amount || item.invoice_data?.amount || 0),
                    check_in: (item.invoiceData?.check_in_date || item.invoice_data?.check_in_date)
                        ? new Date(item.invoiceData?.check_in_date || item.invoice_data?.check_in_date).toLocaleDateString() 
                        : 'N/A',
                    check_out: (item.invoiceData?.check_out_date || item.invoice_data?.check_out_date)
                        ? new Date(item.invoiceData?.check_out_date || item.invoice_data?.check_out_date).toLocaleDateString() 
                        : 'N/A',
                    status: item.status?.replace(/_/g, ' ') || 'N/A',
                    dispute_type: (item.disputeType || item.dispute_type)?.replace(/_/g, ' ') || '-'
                }));
                
                autoTable(doc, {
                    columns: reconciliationColumns,
                    body: reconciliationRows,
                    startY: yPosition,
                    headStyles: { 
                        fillColor: [249, 250, 251],
                        textColor: [75, 85, 99],
                        fontSize: 9,
                        fontStyle: 'bold'
                    },
                    bodyStyles: { 
                        fontSize: 8,
                        textColor: [55, 65, 81]
                    },
                    alternateRowStyles: { fillColor: [249, 250, 251] },
                    margin: { left: 20, right: 20 },
                    styles: {
                        cellPadding: 2,
                        overflow: 'linebreak'
                    },
                    columnStyles: {
                        hotel_name: { cellWidth: 40 },
                        status: { cellWidth: 35 },
                        dispute_type: { cellWidth: 35 }
                    }
                });
            }
            
            // Add footer
            const pageCount = doc.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(156, 163, 175);
                doc.text(
                    `Page ${i} of ${pageCount} | Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
                    doc.internal.pageSize.width / 2,
                    doc.internal.pageSize.height - 10,
                    { align: 'center' }
                );
            }
            
            // Save the PDF
            const fileName = `invoice_${summary.invoiceNumber || summary.invoice_number || summary.extraction_id}_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);
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
                            Invoice Details
                        </h1>
                        <p className="text-sm text-gray-500">
                            {summary.invoiceNumber || summary.invoice_number || summary.extraction_id}
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

            {/* Invoice Summary */}
            <Card>
                <div className="p-3">
                    <h2 className="text-base font-medium text-gray-900 mb-2">Invoice Summary</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        <div>
                            <p className="text-xs font-medium text-gray-500">Invoice Number</p>
                            <p className="text-sm font-semibold text-gray-900">
                                {summary.invoiceNumber || summary.invoice_number || 'N/A'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500">Vendor</p>
                            <p className="text-sm font-semibold text-gray-900">
                                {summary.vendorName || summary.vendor_name}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500">Total Invoice Amount</p>
                            <p className="text-sm font-semibold text-gray-900">
                                {formatCurrency(summary.totalInvoiceAmount || summary.total_invoice_amount)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500">Invoice Date</p>
                            <p className="text-sm text-gray-900">
                                {(summary.invoiceDate || summary.invoice_date) ? formatDate(new Date(summary.invoiceDate || summary.invoice_date)) : 'N/A'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500">Due Date</p>
                            <p className="text-sm text-gray-900">
                                {(summary.paymentDueDate || summary.payment_due_date) ? formatDate(new Date(summary.paymentDueDate || summary.payment_due_date)) : 'N/A'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500">Status</p>
                            <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${
                                summary.processing_status === 'COMPLETED' 
                                    ? 'bg-green-100 text-green-800' 
                                    : summary.processing_status === 'FAILED'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                            }`}>
                                {summary.processing_status || 'PROCESSING'}
                            </span>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Reconciliation Summary */}
            <Card>
                <div className="p-2">
                    <h2 className="text-sm font-medium text-gray-900 mb-2">Reconciliation Summary</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
                        {/* Status Summary - Compact */}
                        {summary.status_summary && Object.entries(summary.status_summary).map(([status, count]) => (
                            <div key={status} className="flex items-center justify-between p-1.5 bg-gray-50 rounded text-xs">
                                <span className="text-gray-600">
                                    {status.replace(/_/g, ' ')}
                                </span>
                                <span className="font-bold text-gray-900 ml-1">
                                    {count}
                                </span>
                            </div>
                        ))}
                        
                        {/* Dispute Types - Inline with Status */}
                        {summary.dispute_type_summary && Object.entries(summary.dispute_type_summary).map(([type, count]) => (
                            <div key={type} className="flex items-center justify-between p-1.5 bg-red-50 rounded text-xs">
                                <span className="text-red-600">
                                    {type.replace(/_/g, ' ')}
                                </span>
                                <span className="font-bold text-red-900 ml-1">
                                    {count}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Extraction Results (Collapsible) */}
            <Card>
                <div className="p-3">
                    <button
                        onClick={() => toggleSection('extractionResults')}
                        className="w-full flex items-center justify-between text-left"
                    >
                        <h2 className="text-base font-medium text-gray-900">
                            Extraction Results ({extractionLineItems.length} line items)
                        </h2>
                        {expandedSections.extractionResults ? (
                            <ChevronUp className="h-5 w-5 text-gray-500" />
                        ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                        )}
                    </button>
                    
                    {expandedSections.extractionResults && (
                        <div className="mt-4">
                            {extractionLineItems.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th 
                                                    className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 w-24"
                                                    onClick={() => handleExtractionSort('booking_id')}
                                                >
                                                    <div className="flex items-center space-x-1">
                                                        <span className="text-xs">Booking ID</span>
                                                        {extractionSort?.field === 'booking_id' ? (
                                                            extractionSort.direction === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                                                        ) : <ChevronsUpDown className="h-3 w-3 text-gray-400" />}
                                                    </div>
                                                </th>
                                                <th 
                                                    className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 w-64"
                                                    onClick={() => handleExtractionSort('hotel_name')}
                                                >
                                                    <div className="flex items-center space-x-1">
                                                        <span className="text-xs">Hotel Name</span>
                                                        {extractionSort?.field === 'hotel_name' ? (
                                                            extractionSort.direction === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                                                        ) : <ChevronsUpDown className="h-3 w-3 text-gray-400" />}
                                                    </div>
                                                </th>
                                                <th 
                                                    className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 w-20"
                                                    onClick={() => handleExtractionSort('check_in_date')}
                                                >
                                                    <div className="flex items-center space-x-1">
                                                        <span className="text-xs">Check-in</span>
                                                        {extractionSort?.field === 'check_in_date' ? (
                                                            extractionSort.direction === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                                                        ) : <ChevronsUpDown className="h-3 w-3 text-gray-400" />}
                                                    </div>
                                                </th>
                                                <th 
                                                    className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 w-20"
                                                    onClick={() => handleExtractionSort('check_out_date')}
                                                >
                                                    <div className="flex items-center space-x-1">
                                                        <span className="text-xs">Check-out</span>
                                                        {extractionSort?.field === 'check_out_date' ? (
                                                            extractionSort.direction === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                                                        ) : <ChevronsUpDown className="h-3 w-3 text-gray-400" />}
                                                    </div>
                                                </th>
                                                <th 
                                                    className="px-2 py-1 text-right text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 w-20"
                                                    onClick={() => handleExtractionSort('amount')}
                                                >
                                                    <div className="flex items-center justify-end space-x-1">
                                                        <span className="text-xs">Amount</span>
                                                        {extractionSort?.field === 'amount' ? (
                                                            extractionSort.direction === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                                                        ) : <ChevronsUpDown className="h-3 w-3 text-gray-400" />}
                                                    </div>
                                                </th>
                                                <th 
                                                    className="px-2 py-1 text-right text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 w-24"
                                                    onClick={() => handleExtractionSort('commission')}
                                                >
                                                    <div className="flex items-center justify-end space-x-1">
                                                        <span className="text-xs">Commission</span>
                                                        {extractionSort?.field === 'commission' ? (
                                                            extractionSort.direction === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                                                        ) : <ChevronsUpDown className="h-3 w-3 text-gray-400" />}
                                                    </div>
                                                </th>
                                                <th 
                                                    className="px-2 py-1 text-center text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 w-16"
                                                    onClick={() => handleExtractionSort('currency')}
                                                >
                                                    <div className="flex items-center justify-center space-x-1">
                                                        <span className="text-xs">Currency</span>
                                                        {extractionSort?.field === 'currency' ? (
                                                            extractionSort.direction === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                                                        ) : <ChevronsUpDown className="h-3 w-3 text-gray-400" />}
                                                    </div>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {sortedExtractionItems.map((item, index) => (
                                                <tr key={index} className="hover:bg-gray-50">
                                                    <td className="px-2 py-1 text-xs text-gray-900">
                                                        {item.booking_id || 'N/A'}
                                                    </td>
                                                    <td className="px-2 py-1 text-xs text-gray-900 max-w-[240px] truncate" title={item.hotel_name || 'N/A'}>
                                                        {item.hotel_name || 'N/A'}
                                                    </td>
                                                    <td className="px-2 py-1 text-xs text-gray-900 whitespace-nowrap">
                                                        {item.check_in_date ? new Date(item.check_in_date).toLocaleDateString() : 'N/A'}
                                                    </td>
                                                    <td className="px-2 py-1 text-xs text-gray-900 whitespace-nowrap">
                                                        {item.check_out_date ? new Date(item.check_out_date).toLocaleDateString() : 'N/A'}
                                                    </td>
                                                    <td className="px-2 py-1 text-xs text-gray-900 text-right">
                                                        {formatCurrency(item.amount || 0)}
                                                    </td>
                                                    <td className="px-2 py-1 text-xs text-gray-900 text-right">
                                                        {formatCurrency(item.commission || 0)}
                                                    </td>
                                                    <td className="px-2 py-1 text-xs text-gray-900 text-center">
                                                        {item.currency || 'N/A'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 mt-4">No extraction results available.</p>
                            )}
                        </div>
                    )}
                </div>
            </Card>

            {/* Reconciliation Details */}
            <Card>
                <div className="p-3">
                    <button
                        onClick={() => toggleSection('reconciliationDetails')}
                        className="w-full flex items-center justify-between text-left"
                    >
                        <h2 className="text-base font-medium text-gray-900">
                            Reconciliation Details ({lineItemStatuses.length} items)
                        </h2>
                        {expandedSections.reconciliationDetails ? (
                            <ChevronUp className="h-5 w-5 text-gray-500" />
                        ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                        )}
                    </button>
                    
                    {expandedSections.reconciliationDetails && (
                        <div className="mt-4">
                            {lineItemStatuses.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th 
                                                    className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 w-20"
                                                    onClick={() => handleReconciliationSort('booking_id')}
                                                >
                                                    <div className="flex items-center space-x-1">
                                                        <span className="text-xs">Booking ID</span>
                                                        {reconciliationSort?.field === 'booking_id' ? (
                                                            reconciliationSort.direction === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                                                        ) : <ChevronsUpDown className="h-3 w-3 text-gray-400" />}
                                                    </div>
                                                </th>
                                                <th 
                                                    className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 w-52"
                                                    onClick={() => handleReconciliationSort('hotel_name')}
                                                >
                                                    <div className="flex items-center space-x-1">
                                                        <span className="text-xs">Hotel Name</span>
                                                        {reconciliationSort?.field === 'hotel_name' ? (
                                                            reconciliationSort.direction === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                                                        ) : <ChevronsUpDown className="h-3 w-3 text-gray-400" />}
                                                    </div>
                                                </th>
                                                <th 
                                                    className="px-2 py-1 text-right text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                                                    onClick={() => handleReconciliationSort('invoice_data.amount')}
                                                >
                                                    <div className="flex items-center justify-end space-x-1">
                                                        <span className="text-xs">Amount</span>
                                                        {reconciliationSort?.field === 'invoice_data.amount' ? (
                                                            reconciliationSort.direction === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                                                        ) : <ChevronsUpDown className="h-3 w-3 text-gray-400" />}
                                                    </div>
                                                </th>
                                                <th 
                                                    className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                                                    onClick={() => handleReconciliationSort('invoice_data.check_in_date')}
                                                >
                                                    <div className="flex items-center space-x-1">
                                                        <span className="text-xs">Check-in</span>
                                                        {reconciliationSort?.field === 'invoice_data.check_in_date' ? (
                                                            reconciliationSort.direction === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                                                        ) : <ChevronsUpDown className="h-3 w-3 text-gray-400" />}
                                                    </div>
                                                </th>
                                                <th 
                                                    className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                                                    onClick={() => handleReconciliationSort('invoice_data.check_out_date')}
                                                >
                                                    <div className="flex items-center space-x-1">
                                                        <span className="text-xs">Check-out</span>
                                                        {reconciliationSort?.field === 'invoice_data.check_out_date' ? (
                                                            reconciliationSort.direction === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                                                        ) : <ChevronsUpDown className="h-3 w-3 text-gray-400" />}
                                                    </div>
                                                </th>
                                                <th 
                                                    className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                                                    onClick={() => handleReconciliationSort('invoice_data.guest_name')}
                                                >
                                                    <div className="flex items-center space-x-1">
                                                        <span className="text-xs">Guest</span>
                                                        {reconciliationSort?.field === 'invoice_data.guest_name' ? (
                                                            reconciliationSort.direction === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                                                        ) : <ChevronsUpDown className="h-3 w-3 text-gray-400" />}
                                                    </div>
                                                </th>
                                                <th 
                                                    className="px-2 py-1 text-center text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                                                    onClick={() => handleReconciliationSort('status')}
                                                >
                                                    <div className="flex items-center justify-center space-x-1">
                                                        <span className="text-xs">Status</span>
                                                        {reconciliationSort?.field === 'status' ? (
                                                            reconciliationSort.direction === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                                                        ) : <ChevronsUpDown className="h-3 w-3 text-gray-400" />}
                                                    </div>
                                                </th>
                                                <th 
                                                    className="px-2 py-1 text-center text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                                                    onClick={() => handleReconciliationSort('dispute_type')}
                                                >
                                                    <div className="flex items-center justify-center space-x-1">
                                                        <span className="text-xs">Dispute Type</span>
                                                        {reconciliationSort?.field === 'dispute_type' ? (
                                                            reconciliationSort.direction === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                                                        ) : <ChevronsUpDown className="h-3 w-3 text-gray-400" />}
                                                    </div>
                                                </th>
                                                <th className="px-2 py-1 text-center text-xs font-medium text-gray-500 uppercase">
                                                    <span className="text-xs">Rules Applied</span>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {sortedReconciliationItems.map((item) => (
                                                <tr key={item.id} className="hover:bg-gray-50">
                                                    <td className="px-2 py-1 text-xs font-medium text-gray-900">
                                                        {item.bookingId || item.booking_id || 'N/A'}
                                                    </td>
                                                    <td className="px-2 py-1 text-xs text-gray-900 max-w-[200px] truncate" title={item.hotelName || item.hotel_name || 'N/A'}>
                                                        {item.hotelName || item.hotel_name || 'N/A'}
                                                    </td>
                                                    <td className="px-2 py-1 text-xs text-gray-900 text-right">
                                                        {formatCurrency(item.invoiceData?.amount || item.invoice_data?.amount || 0)}
                                                    </td>
                                                    <td className="px-2 py-1 text-xs text-gray-900">
                                                        {(item.invoiceData?.check_in_date || item.invoice_data?.check_in_date)
                                                            ? new Date(item.invoiceData?.check_in_date || item.invoice_data?.check_in_date).toLocaleDateString() 
                                                            : 'N/A'}
                                                    </td>
                                                    <td className="px-2 py-1 text-xs text-gray-900">
                                                        {(item.invoiceData?.check_out_date || item.invoice_data?.check_out_date)
                                                            ? new Date(item.invoiceData?.check_out_date || item.invoice_data?.check_out_date).toLocaleDateString() 
                                                            : 'N/A'}
                                                    </td>
                                                    <td className="px-2 py-1 text-xs text-gray-900">
                                                        {item.invoiceData?.guest_name || item.invoice_data?.guest_name || 'N/A'}
                                                    </td>
                                                    <td className="px-2 py-1 text-center">
                                                        <span className={`inline-flex px-1 py-0.5 text-xs font-semibold rounded-full ${
                                                            item.status === 'MATCHED' ? 'bg-green-100 text-green-800' :
                                                            item.status === 'HOLD_PENDING_REVIEW' ? 'bg-yellow-100 text-yellow-800' :
                                                            item.status === 'FLAG_AS_CANCELLED_PENDING_REFUND' ? 'bg-orange-100 text-orange-800' :
                                                            'bg-red-100 text-red-800'
                                                        }`}>
                                                            {item.status?.replace(/_/g, ' ') || 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td className="px-2 py-1 text-center">
                                                        {(item.disputeType || item.dispute_type) ? (
                                                            <span className="inline-flex px-1 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                                                {(item.disputeType || item.dispute_type).replace(/_/g, ' ')}
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-gray-500">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-2 py-1 text-center">
                                                        {(item.rulesApplied || item.rules_applied) && (item.rulesApplied || item.rules_applied).length > 0 ? (
                                                            <span className="text-xs text-gray-900">
                                                                {(item.rulesApplied || item.rules_applied).map((rule: any) => rule.rule_id).join(', ')}
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-gray-500">None</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 mt-4">No reconciliation details available.</p>
                            )}
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}