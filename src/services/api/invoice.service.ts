import {
    Invoice,
    LineItem,
    InvoiceStatus
} from '@/types/models';
import { MockDataService } from '@/services/mock/mock-data.service';
import { Timestamp } from 'firebase/firestore';

export interface InvoiceFilters {
    vendorId?: string;
    status?: InvoiceStatus;
    dateFrom?: Date;
    dateTo?: Date;
    searchTerm?: string;
    limit?: number;
}

export interface InvoiceUploadData {
    invoiceNumber: string;
    vendorInvoiceNumber?: string;
    invoiceDate: Date;
    periodStart: Date;
    periodEnd: Date;
    dueDate?: Date;
}

export class InvoiceService {
    // Get invoices with filters
    static async getInvoices(filters?: InvoiceFilters): Promise<Invoice[]> {
        return MockDataService.getInvoices(filters);
    }

    // Upload new invoice
    static async uploadInvoice(
        file: File,
        vendorId: string,
        invoiceData: InvoiceUploadData,
        userId: string
    ): Promise<string> {
        try {
            // Validate file
            this.validateFile(file);

            // Create invoice record using mock service
            const invoice = await MockDataService.createInvoice({
                ...invoiceData,
                vendorId,
                vendorInvoiceNumber: invoiceData.vendorInvoiceNumber || invoiceData.invoiceNumber,
                invoiceDate: Timestamp.fromDate(new Date(invoiceData.invoiceDate)),
                periodStart: Timestamp.fromDate(new Date(invoiceData.periodStart)),
                periodEnd: Timestamp.fromDate(new Date(invoiceData.periodEnd)),
                receivedDate: Timestamp.now(),
                dueDate: invoiceData.dueDate ? Timestamp.fromDate(new Date(invoiceData.dueDate)) : Timestamp.fromDate(this.calculateDueDate(invoiceData.invoiceDate, 30)),
                financial: {
                    currency: 'USD',
                    subtotal: 0,
                    taxAmount: 0,
                    totalAmount: 0
                },
                status: 'PENDING',
                files: {
                    originalFile: {
                        gcsPath: `invoices/raw/${vendorId}/${file.name}`,
                        fileName: file.name,
                        fileType: file.type,
                        fileSize: file.size,
                        uploadedAt: Timestamp.now(),
                        uploadedBy: userId
                    }
                },
                summary: {
                    totalLineItems: 0,
                    validatedLineItems: 0,
                    disputedLineItems: 0,
                    totalBookings: 0,
                    uniqueProperties: 0,
                    dateRange: {
                        earliest: Timestamp.fromDate(new Date(invoiceData.periodStart)),
                        latest: Timestamp.fromDate(new Date(invoiceData.periodEnd))
                    }
                }
            });

            // Simulate processing
            this.simulateProcessing(invoice.id);

            return invoice.id;
        } catch (error) {
            console.error('Error uploading invoice:', error);
            throw error;
        }
    }

    // Update invoice status
    static async updateInvoiceStatus(
        invoiceId: string,
        status: InvoiceStatus
    ): Promise<void> {
        await MockDataService.updateInvoiceStatus(invoiceId, status);
    }

    // Delete invoice
    static async deleteInvoice(invoiceId: string): Promise<void> {
        await MockDataService.deleteInvoice(invoiceId);
    }

    // Get single invoice by ID
    static async getInvoice(invoiceId: string): Promise<Invoice | null> {
        const invoices = await MockDataService.getInvoices();
        return invoices.find(inv => inv.id === invoiceId) || null;
    }

    // Get line items for invoice
    static async getLineItems(invoiceId: string): Promise<LineItem[]> {
        return MockDataService.getLineItems(invoiceId);
    }

    // Update invoice status - alias for updateInvoiceStatus
    static async updateStatus(invoiceId: string, status: InvoiceStatus): Promise<void> {
        return this.updateInvoiceStatus(invoiceId, status);
    }

    // Validate file
    private static validateFile(file: File): void {
        const validTypes = ['application/pdf', 'application/vnd.ms-excel', 
                          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                          'text/csv', 'application/json'];
        
        if (!validTypes.includes(file.type)) {
            throw new Error('Invalid file type. Please upload PDF, Excel, CSV, or JSON files.');
        }

        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            throw new Error('File size exceeds 10MB limit.');
        }
    }

    // Calculate due date
    private static calculateDueDate(invoiceDate: Date, paymentTermsDays: number): Date {
        const dueDate = new Date(invoiceDate);
        dueDate.setDate(dueDate.getDate() + paymentTermsDays);
        return dueDate;
    }

    // Simulate invoice processing
    private static simulateProcessing(invoiceId: string): void {
        // Simulate extraction after 2 seconds
        setTimeout(async () => {
            await MockDataService.updateInvoiceStatus(invoiceId, 'EXTRACTING');
        }, 2000);

        // Simulate validation after 5 seconds
        setTimeout(async () => {
            await MockDataService.updateInvoiceStatus(invoiceId, 'VALIDATING');
        }, 5000);

        // Simulate completion after 8 seconds
        setTimeout(async () => {
            await MockDataService.updateInvoiceStatus(invoiceId, 'VALIDATED');
        }, 8000);
    }
}