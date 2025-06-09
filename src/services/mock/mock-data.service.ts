import { Invoice, Vendor, ValidationRule, LineItem, InvoiceStatus, ProcessingStatus, RuleResult, ValidationResult } from '@/types/models';
import { Timestamp } from 'firebase/firestore';

// Helper function to convert Date to Firestore Timestamp
const toTimestamp = (date: Date): Timestamp => {
    return Timestamp.fromDate(date);
};

// Mock data storage
let mockInvoices: Invoice[] = [];
let mockVendors: Vendor[] = [];
let mockRules: ValidationRule[] = [];
let mockLineItems: LineItem[] = [];

// Initialize with sample data
function initializeMockData() {
    // Sample Vendors
    mockVendors = [
        {
            id: 'v1',
            vendorCode: 'HOTEL001',
            vendorName: 'Grand Plaza Hotel Group',
            vendorType: 'DIRECT',
            status: 'ACTIVE',
            businessModel: {
                type: 'COMMISSION',
                defaultCommissionPercentage: 15,
                paymentTermsDays: 30,
                currency: 'USD'
            },
            integration: {
                apiEnabled: true,
                invoiceFormat: 'PDF',
                invoiceDelivery: 'EMAIL',
                fieldMappings: {}
            },
            contract: {
                contractNumber: 'CTR-2024-001',
                startDate: toTimestamp(new Date('2024-01-01')),
                endDate: toTimestamp(new Date('2025-12-31')),
                autoRenew: true,
                terms: 'Standard terms and conditions apply'
            },
            contacts: [
                {
                    type: 'PRIMARY',
                    name: 'John Smith',
                    email: 'john.smith@grandplaza.com'
                }
            ],
            processingConfig: {
                autoProcess: true,
                validationRuleSet: 'standard',
                requiresManualApproval: false,
                duplicateCheckDays: 30,
                dateToleranceDays: 3,
                amountTolerancePercentage: 2
            },
            statistics: {
                totalInvoices: 145,
                totalAmount: 2450000,
                lastInvoiceDate: toTimestamp(new Date('2024-12-01')),
                averageProcessingTime: 120,
                disputeRate: 2.5,
                validationPassRate: 97.5
            },
            metadata: {
                createdAt: toTimestamp(new Date('2023-01-15')),
                createdBy: 'admin',
                lastModified: toTimestamp(new Date('2024-06-01')),
                modifiedBy: 'admin',
                tags: ['premium', 'hotel']
            }
        },
        {
            id: 'v2',
            vendorCode: 'OTA001',
            vendorName: 'TravelBooking.com',
            vendorType: 'OTA',
            status: 'ACTIVE',
            businessModel: {
                type: 'NET_RATE',
                defaultMarkupPercentage: 20,
                paymentTermsDays: 45,
                currency: 'USD'
            },
            integration: {
                apiEnabled: true,
                apiEndpoint: 'https://api.travelbooking.com/invoices',
                invoiceFormat: 'JSON',
                invoiceDelivery: 'API',
                fieldMappings: {}
            },
            contract: {
                contractNumber: 'CTR-2024-002',
                startDate: toTimestamp(new Date('2024-01-01')),
                endDate: toTimestamp(new Date('2025-12-31')),
                autoRenew: true,
                terms: 'OTA standard terms'
            },
            contacts: [
                {
                    type: 'PRIMARY',
                    name: 'Sarah Johnson',
                    email: 'sarah@travelbooking.com'
                }
            ],
            processingConfig: {
                autoProcess: true,
                validationRuleSet: 'ota-standard',
                requiresManualApproval: false,
                duplicateCheckDays: 60,
                dateToleranceDays: 7,
                amountTolerancePercentage: 5
            },
            statistics: {
                totalInvoices: 523,
                totalAmount: 8750000,
                lastInvoiceDate: toTimestamp(new Date('2024-12-05')),
                averageProcessingTime: 90,
                disputeRate: 3.2,
                validationPassRate: 95.8
            },
            metadata: {
                createdAt: toTimestamp(new Date('2023-02-01')),
                createdBy: 'admin',
                lastModified: toTimestamp(new Date('2024-05-15')),
                modifiedBy: 'admin',
                tags: ['ota', 'high-volume']
            }
        }
    ];

    // Sample Invoices with varied statuses and validation results
    const currentDate = new Date();
    const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
    
    mockInvoices = [
        {
            id: 'inv1',
            invoiceNumber: 'INV-2024-001',
            vendorId: 'v1',
            vendorName: 'Grand Plaza Hotel Group',
            vendorInvoiceNumber: 'GP-2024-1234',
            invoiceDate: toTimestamp(new Date('2024-12-01')),
            periodStart: toTimestamp(new Date('2024-11-01')),
            periodEnd: toTimestamp(new Date('2024-11-30')),
            receivedDate: toTimestamp(new Date('2024-12-02')),
            dueDate: toTimestamp(new Date('2024-12-31')),
            financial: {
                currency: 'USD',
                subtotal: 45000,
                taxAmount: 4500,
                totalAmount: 49500,
                commissionAmount: 6750,
                netAmount: 42750
            },
            status: 'VALIDATED' as InvoiceStatus,
            processingStatus: {
                stage: 'COMPLETE',
                progress: 100,
                startTime: toTimestamp(new Date('2024-12-02T10:00:00')),
                lastUpdateTime: toTimestamp(new Date('2024-12-02T10:15:00')),
                extraction: {
                    status: 'COMPLETED',
                    attempts: 1,
                    confidence: 98.5,
                    warnings: [],
                    errors: []
                },
                validation: {
                    status: 'COMPLETED',
                    rulesApplied: 15,
                    rulesPassed: 14,
                    rulesFailed: 1,
                    warnings: 1
                }
            } as ProcessingStatus,
            files: {
                originalFile: {
                    gcsPath: 'invoices/raw/v1/GP-2024-1234.pdf',
                    fileName: 'GP-2024-1234.pdf',
                    fileType: 'application/pdf',
                    fileSize: 245000,
                    uploadedAt: toTimestamp(new Date('2024-12-02')),
                    uploadedBy: 'user@example.com'
                }
            },
            summary: {
                totalLineItems: 125,
                validatedLineItems: 124,
                disputedLineItems: 1,
                totalBookings: 125,
                uniqueProperties: 5,
                dateRange: {
                    earliest: toTimestamp(new Date('2024-11-01')),
                    latest: toTimestamp(new Date('2024-11-30'))
                }
            },
            audit: {
                createdAt: toTimestamp(new Date('2024-12-02')),
                createdBy: 'user@example.com',
                lastModified: toTimestamp(new Date('2024-12-02')),
                modifiedBy: 'system',
                history: []
            },
            metadata: {
                source: 'MANUAL_UPLOAD',
                tags: ['november-2024', 'hotel-group']
            }
        },
        {
            id: 'inv2',
            invoiceNumber: 'INV-2024-002',
            vendorId: 'v2',
            vendorName: 'TravelBooking.com',
            vendorInvoiceNumber: 'TB-NOV-2024-5678',
            invoiceDate: toTimestamp(new Date('2024-12-05')),
            periodStart: toTimestamp(new Date('2024-11-01')),
            periodEnd: toTimestamp(new Date('2024-11-30')),
            receivedDate: toTimestamp(new Date('2024-12-05')),
            dueDate: toTimestamp(new Date('2025-01-19')),
            financial: {
                currency: 'USD',
                subtotal: 125000,
                taxAmount: 12500,
                totalAmount: 137500,
                netAmount: 137500
            },
            status: 'EXTRACTING' as InvoiceStatus,
            processingStatus: {
                stage: 'EXTRACTION',
                progress: 35,
                startTime: toTimestamp(new Date('2024-12-05T14:00:00')),
                lastUpdateTime: toTimestamp(new Date('2024-12-05T14:05:00')),
                extraction: {
                    status: 'IN_PROGRESS',
                    attempts: 1,
                    confidence: 0,
                    warnings: [],
                    errors: []
                },
                validation: {
                    status: 'PENDING',
                    rulesApplied: 0,
                    rulesPassed: 0,
                    rulesFailed: 0,
                    warnings: 0
                }
            } as ProcessingStatus,
            files: {
                originalFile: {
                    gcsPath: 'invoices/raw/v2/TB-NOV-2024-5678.json',
                    fileName: 'TB-NOV-2024-5678.json',
                    fileType: 'application/json',
                    fileSize: 1250000,
                    uploadedAt: toTimestamp(new Date('2024-12-05')),
                    uploadedBy: 'api-integration'
                }
            },
            summary: {
                totalLineItems: 0,
                validatedLineItems: 0,
                disputedLineItems: 0,
                totalBookings: 0,
                uniqueProperties: 0,
                dateRange: {
                    earliest: toTimestamp(new Date('2024-11-01')),
                    latest: toTimestamp(new Date('2024-11-30'))
                }
            },
            audit: {
                createdAt: toTimestamp(new Date('2024-12-05')),
                createdBy: 'api-integration',
                lastModified: toTimestamp(new Date('2024-12-05')),
                modifiedBy: 'system',
                history: []
            },
            metadata: {
                source: 'API',
                tags: ['november-2024', 'ota']
            }
        },
        {
            id: 'inv3',
            invoiceNumber: 'INV-2024-003',
            vendorId: 'v1',
            vendorName: 'Grand Plaza Hotel Group',
            vendorInvoiceNumber: 'GP-2024-1235',
            invoiceDate: toTimestamp(new Date('2024-11-01')),
            periodStart: toTimestamp(new Date('2024-10-01')),
            periodEnd: toTimestamp(new Date('2024-10-31')),
            receivedDate: toTimestamp(new Date('2024-11-02')),
            dueDate: toTimestamp(new Date('2024-11-30')),
            financial: {
                currency: 'USD',
                subtotal: 52000,
                taxAmount: 5200,
                totalAmount: 57200,
                commissionAmount: 7800,
                netAmount: 49400
            },
            status: 'PAID' as InvoiceStatus,
            processingStatus: {
                stage: 'COMPLETE',
                progress: 100,
                startTime: toTimestamp(new Date('2024-11-02')),
                lastUpdateTime: toTimestamp(new Date('2024-11-02')),
                extraction: {
                    status: 'COMPLETED',
                    attempts: 1,
                    confidence: 99.2,
                    warnings: [],
                    errors: []
                },
                validation: {
                    status: 'COMPLETED',
                    rulesApplied: 15,
                    rulesPassed: 15,
                    rulesFailed: 0,
                    warnings: 0
                }
            } as ProcessingStatus,
            files: {
                originalFile: {
                    gcsPath: 'invoices/raw/v1/GP-2024-1235.pdf',
                    fileName: 'GP-2024-1235.pdf',
                    fileType: 'application/pdf',
                    fileSize: 265000,
                    uploadedAt: toTimestamp(new Date('2024-11-02')),
                    uploadedBy: 'user@example.com'
                }
            },
            summary: {
                totalLineItems: 143,
                validatedLineItems: 143,
                disputedLineItems: 0,
                totalBookings: 143,
                uniqueProperties: 5,
                dateRange: {
                    earliest: toTimestamp(new Date('2024-10-01')),
                    latest: toTimestamp(new Date('2024-10-31'))
                }
            },
            audit: {
                createdAt: toTimestamp(new Date('2024-11-02')),
                createdBy: 'user@example.com',
                lastModified: toTimestamp(new Date('2024-11-25')),
                modifiedBy: 'admin@example.com',
                approvedAt: toTimestamp(new Date('2024-11-03')),
                approvedBy: 'admin@example.com',
                history: []
            },
            metadata: {
                source: 'MANUAL_UPLOAD',
                tags: ['october-2024', 'hotel-group', 'paid']
            }
        },
        // Invoice 4 - Processing with warnings
        {
            id: 'inv4',
            invoiceNumber: 'INV-2024-004',
            vendorId: 'v2',
            vendorName: 'TravelBooking.com',
            vendorInvoiceNumber: 'TB-2024-5679',
            invoiceDate: toTimestamp(new Date('2024-12-04')),
            periodStart: toTimestamp(new Date('2024-11-01')),
            periodEnd: toTimestamp(new Date('2024-11-30')),
            receivedDate: toTimestamp(new Date('2024-12-04')),
            dueDate: toTimestamp(new Date('2025-01-04')),
            financial: {
                currency: 'USD',
                subtotal: 89000,
                taxAmount: 8900,
                totalAmount: 97900
            },
            status: 'VALIDATING' as InvoiceStatus,
            processingStatus: {
                stage: 'VALIDATION',
                progress: 75,
                startTime: toTimestamp(new Date('2024-12-04T14:00:00')),
                lastUpdateTime: toTimestamp(new Date()),
                extraction: {
                    status: 'COMPLETED',
                    attempts: 1,
                    confidence: 97.8,
                    warnings: [],
                    errors: []
                },
                validation: {
                    status: 'IN_PROGRESS',
                    rulesApplied: 12,
                    rulesPassed: 10,
                    rulesFailed: 0,
                    warnings: 2
                }
            } as ProcessingStatus,
            files: {
                originalFile: {
                    gcsPath: 'invoices/raw/v2/TB-2024-5679.xlsx',
                    fileName: 'TB-2024-5679.xlsx',
                    fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    fileSize: 756000,
                    uploadedAt: toTimestamp(new Date('2024-12-04')),
                    uploadedBy: 'user@example.com'
                }
            },
            summary: {
                totalLineItems: 275,
                validatedLineItems: 200,
                disputedLineItems: 0,
                totalBookings: 275,
                uniqueProperties: 15,
                dateRange: {
                    earliest: toTimestamp(new Date('2024-11-01')),
                    latest: toTimestamp(new Date('2024-11-30'))
                }
            },
            audit: {
                createdAt: toTimestamp(new Date('2024-12-04')),
                createdBy: 'user@example.com',
                lastModified: toTimestamp(new Date()),
                modifiedBy: 'system',
                history: []
            },
            metadata: {
                source: 'API',
                tags: ['november-2024', 'ota', 'processing']
            }
        },
        // Invoice 5 - Rejected
        {
            id: 'inv5',
            invoiceNumber: 'INV-2024-005',
            vendorId: 'v1',
            vendorName: 'Grand Plaza Hotel Group',
            vendorInvoiceNumber: 'GP-2024-1238',
            invoiceDate: toTimestamp(new Date('2024-11-28')),
            periodStart: toTimestamp(new Date('2024-10-01')),
            periodEnd: toTimestamp(new Date('2024-10-31')),
            receivedDate: toTimestamp(new Date('2024-11-28')),
            dueDate: toTimestamp(new Date('2024-12-28')),
            financial: {
                currency: 'USD',
                subtotal: 23000,
                taxAmount: 2300,
                totalAmount: 25300
            },
            status: 'REJECTED' as InvoiceStatus,
            processingStatus: {
                stage: 'COMPLETE',
                progress: 100,
                startTime: toTimestamp(new Date('2024-11-28T10:00:00')),
                lastUpdateTime: toTimestamp(new Date('2024-11-28T11:30:00')),
                extraction: {
                    status: 'COMPLETED',
                    attempts: 2,
                    confidence: 82.5,
                    warnings: ['Poor scan quality', 'Multiple currencies detected'],
                    errors: []
                },
                validation: {
                    status: 'FAILED',
                    rulesApplied: 15,
                    rulesPassed: 5,
                    rulesFailed: 10,
                    warnings: 3
                }
            } as ProcessingStatus,
            files: {
                originalFile: {
                    gcsPath: 'invoices/raw/v1/GP-2024-1238.pdf',
                    fileName: 'GP-2024-1238.pdf',
                    fileType: 'application/pdf',
                    fileSize: 189000,
                    uploadedAt: toTimestamp(new Date('2024-11-28')),
                    uploadedBy: 'admin@example.com'
                }
            },
            summary: {
                totalLineItems: 65,
                validatedLineItems: 20,
                disputedLineItems: 45,
                totalBookings: 65,
                uniqueProperties: 3,
                dateRange: {
                    earliest: toTimestamp(new Date('2024-10-01')),
                    latest: toTimestamp(new Date('2024-10-31'))
                }
            },
            audit: {
                createdAt: toTimestamp(new Date('2024-11-28')),
                createdBy: 'admin@example.com',
                lastModified: toTimestamp(new Date('2024-11-28')),
                modifiedBy: 'admin@example.com',
                rejectedAt: toTimestamp(new Date('2024-11-28T11:30:00')),
                rejectedBy: 'admin@example.com',
                history: []
            },
            metadata: {
                source: 'EMAIL',
                tags: ['october-2024', 'hotel-group', 'rejected', 'quality-issues']
            }
        },
        // Invoice 6 - Pending
        {
            id: 'inv6',
            invoiceNumber: 'INV-2024-006',
            vendorId: 'v2',
            vendorName: 'TravelBooking.com',
            vendorInvoiceNumber: 'TB-2024-5680',
            invoiceDate: toTimestamp(new Date()),
            periodStart: toTimestamp(lastMonth),
            periodEnd: toTimestamp(new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0)),
            receivedDate: toTimestamp(new Date()),
            dueDate: toTimestamp(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 30)),
            financial: {
                currency: 'USD',
                subtotal: 0,
                taxAmount: 0,
                totalAmount: 0
            },
            status: 'PENDING' as InvoiceStatus,
            processingStatus: {
                stage: 'UPLOAD',
                progress: 0,
                startTime: toTimestamp(new Date()),
                lastUpdateTime: toTimestamp(new Date()),
                extraction: {
                    status: 'PENDING',
                    attempts: 0,
                    confidence: 0,
                    warnings: [],
                    errors: []
                },
                validation: {
                    status: 'PENDING',
                    rulesApplied: 0,
                    rulesPassed: 0,
                    rulesFailed: 0,
                    warnings: 0
                }
            } as ProcessingStatus,
            files: {
                originalFile: {
                    gcsPath: 'invoices/raw/v2/TB-2024-5680.pdf',
                    fileName: 'TB-2024-5680.pdf',
                    fileType: 'application/pdf',
                    fileSize: 512000,
                    uploadedAt: toTimestamp(new Date()),
                    uploadedBy: 'user@example.com'
                }
            },
            summary: {
                totalLineItems: 0,
                validatedLineItems: 0,
                disputedLineItems: 0,
                totalBookings: 0,
                uniqueProperties: 0,
                dateRange: {
                    earliest: toTimestamp(lastMonth),
                    latest: toTimestamp(new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0))
                }
            },
            audit: {
                createdAt: toTimestamp(new Date()),
                createdBy: 'user@example.com',
                lastModified: toTimestamp(new Date()),
                modifiedBy: 'user@example.com',
                history: []
            },
            metadata: {
                source: 'MANUAL_UPLOAD',
                tags: ['current-month', 'ota', 'pending']
            }
        },
        // Invoice 7 - Extracting
        {
            id: 'inv7',
            invoiceNumber: 'INV-2024-007',
            vendorId: 'v1',
            vendorName: 'Grand Plaza Hotel Group',
            vendorInvoiceNumber: 'GP-2024-1239',
            invoiceDate: toTimestamp(new Date()),
            periodStart: toTimestamp(lastMonth),
            periodEnd: toTimestamp(new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0)),
            receivedDate: toTimestamp(new Date()),
            dueDate: toTimestamp(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 15)),
            financial: {
                currency: 'USD',
                subtotal: 0,
                taxAmount: 0,
                totalAmount: 0
            },
            status: 'EXTRACTING' as InvoiceStatus,
            processingStatus: {
                stage: 'EXTRACTION',
                progress: 45,
                startTime: toTimestamp(new Date(new Date().getTime() - 10 * 60000)), // 10 minutes ago
                lastUpdateTime: toTimestamp(new Date()),
                extraction: {
                    status: 'IN_PROGRESS',
                    attempts: 1,
                    confidence: 0,
                    warnings: [],
                    errors: []
                },
                validation: {
                    status: 'PENDING',
                    rulesApplied: 0,
                    rulesPassed: 0,
                    rulesFailed: 0,
                    warnings: 0
                }
            } as ProcessingStatus,
            files: {
                originalFile: {
                    gcsPath: 'invoices/raw/v1/GP-2024-1239.csv',
                    fileName: 'GP-2024-1239.csv',
                    fileType: 'text/csv',
                    fileSize: 234000,
                    uploadedAt: toTimestamp(new Date()),
                    uploadedBy: 'admin@example.com'
                }
            },
            summary: {
                totalLineItems: 0,
                validatedLineItems: 0,
                disputedLineItems: 0,
                totalBookings: 0,
                uniqueProperties: 0,
                dateRange: {
                    earliest: toTimestamp(lastMonth),
                    latest: toTimestamp(new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0))
                }
            },
            audit: {
                createdAt: toTimestamp(new Date()),
                createdBy: 'admin@example.com',
                lastModified: toTimestamp(new Date()),
                modifiedBy: 'system',
                history: []
            },
            metadata: {
                source: 'FTP',
                tags: ['current-month', 'hotel-group', 'processing']
            }
        },
        // Invoice 8 - Approved
        {
            id: 'inv8',
            invoiceNumber: 'INV-2024-008',
            vendorId: 'v2',
            vendorName: 'TravelBooking.com',
            vendorInvoiceNumber: 'TB-2024-5677',
            invoiceDate: toTimestamp(new Date('2024-11-25')),
            periodStart: toTimestamp(new Date('2024-10-01')),
            periodEnd: toTimestamp(new Date('2024-10-31')),
            receivedDate: toTimestamp(new Date('2024-11-25')),
            dueDate: toTimestamp(new Date('2024-12-25')),
            financial: {
                currency: 'USD',
                subtotal: 167000,
                taxAmount: 16700,
                totalAmount: 183700,
                netAmount: 183700
            },
            status: 'APPROVED' as InvoiceStatus,
            processingStatus: {
                stage: 'COMPLETE',
                progress: 100,
                startTime: toTimestamp(new Date('2024-11-25T08:00:00')),
                lastUpdateTime: toTimestamp(new Date('2024-11-26T14:00:00')),
                extraction: {
                    status: 'COMPLETED',
                    attempts: 1,
                    confidence: 99.7,
                    warnings: [],
                    errors: []
                },
                validation: {
                    status: 'COMPLETED',
                    rulesApplied: 25,
                    rulesPassed: 25,
                    rulesFailed: 0,
                    warnings: 0
                }
            } as ProcessingStatus,
            files: {
                originalFile: {
                    gcsPath: 'invoices/raw/v2/TB-2024-5677.xlsx',
                    fileName: 'TB-2024-5677.xlsx',
                    fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    fileSize: 1234000,
                    uploadedAt: toTimestamp(new Date('2024-11-25')),
                    uploadedBy: 'user@example.com'
                }
            },
            summary: {
                totalLineItems: 580,
                validatedLineItems: 580,
                disputedLineItems: 0,
                totalBookings: 580,
                uniqueProperties: 35,
                dateRange: {
                    earliest: toTimestamp(new Date('2024-10-01')),
                    latest: toTimestamp(new Date('2024-10-31'))
                }
            },
            audit: {
                createdAt: toTimestamp(new Date('2024-11-25')),
                createdBy: 'user@example.com',
                lastModified: toTimestamp(new Date('2024-11-26')),
                modifiedBy: 'admin@example.com',
                approvedAt: toTimestamp(new Date('2024-11-26T14:00:00')),
                approvedBy: 'admin@example.com',
                history: []
            },
            metadata: {
                source: 'API',
                tags: ['october-2024', 'ota', 'approved', 'high-volume']
            }
        },
        // Invoice 9 - Extracted (awaiting validation)
        {
            id: 'inv9',
            invoiceNumber: 'INV-2024-009',
            vendorId: 'v1',
            vendorName: 'Grand Plaza Hotel Group',
            vendorInvoiceNumber: 'GP-2024-1240',
            invoiceDate: toTimestamp(new Date('2024-12-05')),
            periodStart: toTimestamp(new Date('2024-11-01')),
            periodEnd: toTimestamp(new Date('2024-11-30')),
            receivedDate: toTimestamp(new Date('2024-12-05')),
            dueDate: toTimestamp(new Date('2025-01-05')),
            financial: {
                currency: 'USD',
                subtotal: 71000,
                taxAmount: 7100,
                totalAmount: 78100,
                commissionAmount: 10650,
                netAmount: 67450
            },
            status: 'EXTRACTED' as InvoiceStatus,
            processingStatus: {
                stage: 'VALIDATION',
                progress: 50,
                startTime: toTimestamp(new Date('2024-12-05T07:00:00')),
                lastUpdateTime: toTimestamp(new Date('2024-12-05T07:45:00')),
                extraction: {
                    status: 'COMPLETED',
                    attempts: 1,
                    confidence: 98.3,
                    warnings: [],
                    errors: []
                },
                validation: {
                    status: 'PENDING',
                    rulesApplied: 0,
                    rulesPassed: 0,
                    rulesFailed: 0,
                    warnings: 0
                }
            } as ProcessingStatus,
            files: {
                originalFile: {
                    gcsPath: 'invoices/raw/v1/GP-2024-1240.pdf',
                    fileName: 'GP-2024-1240.pdf',
                    fileType: 'application/pdf',
                    fileSize: 567000,
                    uploadedAt: toTimestamp(new Date('2024-12-05')),
                    uploadedBy: 'user@example.com'
                }
            },
            summary: {
                totalLineItems: 195,
                validatedLineItems: 0,
                disputedLineItems: 0,
                totalBookings: 195,
                uniqueProperties: 7,
                dateRange: {
                    earliest: toTimestamp(new Date('2024-11-01')),
                    latest: toTimestamp(new Date('2024-11-30'))
                }
            },
            audit: {
                createdAt: toTimestamp(new Date('2024-12-05')),
                createdBy: 'user@example.com',
                lastModified: toTimestamp(new Date('2024-12-05')),
                modifiedBy: 'system',
                history: []
            },
            metadata: {
                source: 'MANUAL_UPLOAD',
                tags: ['november-2024', 'hotel-group', 'extracted']
            }
        },
        // Invoice 10 - Cancelled
        {
            id: 'inv10',
            invoiceNumber: 'INV-2024-010',
            vendorId: 'v2',
            vendorName: 'TravelBooking.com',
            vendorInvoiceNumber: 'TB-2024-5676-DUP',
            invoiceDate: toTimestamp(new Date('2024-11-20')),
            periodStart: toTimestamp(new Date('2024-10-01')),
            periodEnd: toTimestamp(new Date('2024-10-31')),
            receivedDate: toTimestamp(new Date('2024-11-20')),
            dueDate: toTimestamp(new Date('2024-12-20')),
            financial: {
                currency: 'USD',
                subtotal: 98000,
                taxAmount: 9800,
                totalAmount: 107800
            },
            status: 'CANCELLED' as InvoiceStatus,
            processingStatus: {
                stage: 'COMPLETE',
                progress: 100,
                startTime: toTimestamp(new Date('2024-11-20T09:00:00')),
                lastUpdateTime: toTimestamp(new Date('2024-11-20T10:00:00')),
                extraction: {
                    status: 'COMPLETED',
                    attempts: 1,
                    confidence: 99.1,
                    warnings: [],
                    errors: []
                },
                validation: {
                    status: 'FAILED',
                    rulesApplied: 15,
                    rulesPassed: 14,
                    rulesFailed: 1,
                    warnings: 0
                }
            } as ProcessingStatus,
            files: {
                originalFile: {
                    gcsPath: 'invoices/raw/v2/TB-2024-5676-DUP.pdf',
                    fileName: 'TB-2024-5676-DUP.pdf',
                    fileType: 'application/pdf',
                    fileSize: 445000,
                    uploadedAt: toTimestamp(new Date('2024-11-20')),
                    uploadedBy: 'user@example.com'
                }
            },
            summary: {
                totalLineItems: 320,
                validatedLineItems: 319,
                disputedLineItems: 1,
                totalBookings: 320,
                uniqueProperties: 18,
                dateRange: {
                    earliest: toTimestamp(new Date('2024-10-01')),
                    latest: toTimestamp(new Date('2024-10-31'))
                }
            },
            audit: {
                createdAt: toTimestamp(new Date('2024-11-20')),
                createdBy: 'user@example.com',
                lastModified: toTimestamp(new Date('2024-11-20')),
                modifiedBy: 'system',
                history: [{
                    timestamp: toTimestamp(new Date('2024-11-20T10:00:00')),
                    userId: 'system',
                    action: 'CANCELLED',
                    details: { reason: 'Duplicate invoice detected' }
                }]
            },
            metadata: {
                source: 'EMAIL',
                tags: ['october-2024', 'ota', 'cancelled', 'duplicate']
            }
        }
    ];

    // Sample Rules
    mockRules = [
        {
            id: 'rule1',
            ruleId: 'AMT-001',
            ruleName: 'Amount Tolerance Check',
            description: 'Validates that invoice amounts are within acceptable tolerance',
            category: 'FINANCIAL',
            vendorCode: '*',
            entityType: 'LINE_ITEM',
            ruleType: 'HARD',
            priority: 1,
            version: '1.0',
            isActive: true,
            effectiveFrom: toTimestamp(new Date('2024-01-01')),
            conditions: [
                {
                    type: 'NUMERIC_COMPARISON',
                    operator: 'IN_RANGE',
                    invoiceField: 'amount',
                    omsField: 'totalAmount',
                    configuration: {
                        tolerance: {
                            percentage: 2,
                            mode: 'PERCENTAGE_ONLY'
                        }
                    }
                }
            ],
            actions: {
                onMatch: 'CONTINUE',
                onMismatch: 'FLAG_WARNING'
            },
            metrics: {
                executionCount: 1523,
                passCount: 1498,
                failCount: 25,
                averageExecutionTimeMs: 15,
                lastExecuted: toTimestamp(new Date('2024-12-05')),
                errorRate: 1.64
            },
            metadata: {
                createdAt: toTimestamp(new Date('2024-01-01')),
                createdBy: 'admin',
                lastModified: toTimestamp(new Date('2024-01-01')),
                modifiedBy: 'admin',
                tags: ['financial', 'critical']
            }
        },
        {
            id: 'rule2',
            ruleId: 'DUP-001',
            ruleName: 'Duplicate Invoice Check',
            description: 'Prevents processing of duplicate invoices',
            category: 'DUPLICATE',
            vendorCode: '*',
            entityType: 'INVOICE',
            ruleType: 'HARD',
            priority: 1,
            version: '1.0',
            isActive: true,
            effectiveFrom: toTimestamp(new Date('2024-01-01')),
            conditions: [
                {
                    type: 'DUPLICATE_CHECK',
                    operator: 'EQUALS',
                    invoiceField: 'vendorInvoiceNumber',
                    configuration: {
                        duplicateCheck: {
                            lookbackDays: 90,
                            fields: ['vendorInvoiceNumber', 'vendorId'],
                            exactMatch: true
                        }
                    }
                }
            ],
            actions: {
                onMatch: 'BLOCK_PROCESSING',
                onMismatch: 'CONTINUE'
            },
            metrics: {
                executionCount: 850,
                passCount: 847,
                failCount: 3,
                averageExecutionTimeMs: 25,
                lastExecuted: toTimestamp(new Date('2024-12-05')),
                errorRate: 0.35
            },
            metadata: {
                createdAt: toTimestamp(new Date('2024-01-01')),
                createdBy: 'admin',
                lastModified: toTimestamp(new Date('2024-01-01')),
                modifiedBy: 'admin',
                tags: ['duplicate', 'critical']
            }
        }
    ];
}

// Initialize data on first import
initializeMockData();

export class MockDataService {
    // Generate rule results for line items
    private static generateRuleResults(_invoiceId: string, lineIndex: number): RuleResult[] {
        const results: RuleResult[] = [];
        
        // Amount validation
        results.push({
            ruleId: 'rule1',
            ruleName: 'Total Amount Validation',
            ruleType: 'HARD',
            result: lineIndex % 5 === 0 ? 'WARNING' : 'PASSED',
            message: lineIndex % 5 === 0 ? 'Amount variance exceeds 5% threshold' : 'Amount matches within tolerance',
            field: 'financial.totalAmount',
            operator: 'IN_RANGE',
            expectedValue: 340,
            actualValue: lineIndex % 5 === 0 ? 357 : 340,
            evidence: {
                ruleId: 'rule1',
                ruleName: 'Total Amount Validation',
                ruleType: 'HARD',
                field: 'financial.totalAmount',
                operator: 'IN_RANGE',
                expectedValue: 340,
                actualValue: lineIndex % 5 === 0 ? 357 : 340,
                passed: lineIndex % 5 !== 0,
                severity: lineIndex % 5 === 0 ? 'WARNING' : 'INFO',
                message: lineIndex % 5 === 0 ? 'Amount variance exceeds 5% threshold' : 'Amount matches within tolerance',
                details: `Tolerance: 5%, Actual variance: ${lineIndex % 5 === 0 ? '5.0%' : '0%'}`,
                timestamp: new Date()
            }
        });
        
        // Booking confirmation validation
        results.push({
            ruleId: 'rule2',
            ruleName: 'Booking Confirmation Match',
            ruleType: 'HARD',
            result: 'PASSED',
            message: 'Booking confirmation number found in OMS',
            field: 'booking.confirmationNumber',
            operator: 'EQUALS',
            expectedValue: `CNF${100000 + lineIndex}`,
            actualValue: `CNF${100000 + lineIndex}`,
            evidence: {
                ruleId: 'rule2',
                ruleName: 'Booking Confirmation Match',
                ruleType: 'HARD',
                field: 'booking.confirmationNumber',
                operator: 'EQUALS',
                expectedValue: `CNF${100000 + lineIndex}`,
                actualValue: `CNF${100000 + lineIndex}`,
                passed: true,
                severity: 'INFO',
                message: 'Booking confirmation number found in OMS',
                timestamp: new Date()
            }
        });
        
        // Date validation
        results.push({
            ruleId: 'rule3',
            ruleName: 'Check-in Date Validation',
            ruleType: 'SOFT',
            result: 'PASSED',
            message: 'Check-in date matches OMS',
            field: 'booking.checkInDate',
            operator: 'EQUALS',
            evidence: {
                ruleId: 'rule3',
                ruleName: 'Check-in Date Validation',
                ruleType: 'SOFT',
                field: 'booking.checkInDate',
                operator: 'EQUALS',
                expectedValue: new Date(),
                actualValue: new Date(),
                passed: true,
                severity: 'INFO',
                message: 'Check-in date matches OMS',
                timestamp: new Date()
            }
        });
        
        // Guest name validation
        results.push({
            ruleId: 'rule4',
            ruleName: 'Guest Name Match',
            ruleType: 'SOFT',
            result: 'PASSED',
            message: 'Guest name matches booking',
            field: 'booking.guestName',
            operator: 'CONTAINS',
            evidence: {
                ruleId: 'rule4',
                ruleName: 'Guest Name Match',
                ruleType: 'SOFT',
                field: 'booking.guestName',
                operator: 'CONTAINS',
                expectedValue: `Guest ${lineIndex + 1}`,
                actualValue: `Guest ${lineIndex + 1}`,
                passed: true,
                severity: 'INFO',
                message: 'Guest name matches booking',
                timestamp: new Date()
            }
        });
        
        // Commission calculation validation
        results.push({
            ruleId: 'rule5',
            ruleName: 'Commission Calculation',
            ruleType: 'HARD',
            result: 'PASSED',
            message: 'Commission calculated correctly at 10%',
            field: 'financial.commissionAmount',
            operator: 'EQUALS',
            expectedValue: 34,
            actualValue: 34,
            evidence: {
                ruleId: 'rule5',
                ruleName: 'Commission Calculation',
                ruleType: 'HARD',
                field: 'financial.commissionAmount',
                operator: 'EQUALS',
                expectedValue: 34,
                actualValue: 34,
                passed: true,
                severity: 'INFO',
                message: 'Commission calculated correctly at 10%',
                details: 'Base amount: $340, Commission rate: 10%, Calculated: $34',
                timestamp: new Date()
            }
        });
        
        // Duplicate check
        results.push({
            ruleId: 'rule6',
            ruleName: 'Duplicate Invoice Check',
            ruleType: 'HARD',
            result: 'PASSED',
            message: 'No duplicate found in last 30 days',
            field: 'invoice.number',
            operator: 'NOT_EQUALS',
            evidence: {
                ruleId: 'rule6',
                ruleName: 'Duplicate Invoice Check',
                ruleType: 'HARD',
                field: 'invoice.number',
                operator: 'NOT_EQUALS',
                expectedValue: 'unique',
                actualValue: 'unique',
                passed: true,
                severity: 'INFO',
                message: 'No duplicate found in last 30 days',
                details: 'Checked against 150 invoices in the last 30 days',
                timestamp: new Date()
            }
        });
        
        // Property mapping validation
        results.push({
            ruleId: 'rule7',
            ruleName: 'Property Code Mapping',
            ruleType: 'SOFT',
            result: 'PASSED',
            message: 'Property code mapped successfully',
            field: 'booking.propertyId',
            operator: 'MATCHES_PATTERN',
            evidence: {
                ruleId: 'rule7',
                ruleName: 'Property Code Mapping',
                ruleType: 'SOFT',
                field: 'booking.propertyId',
                operator: 'MATCHES_PATTERN',
                expectedValue: 'prop*',
                actualValue: `prop${(lineIndex % 3) + 1}`,
                passed: true,
                severity: 'INFO',
                message: 'Property code mapped successfully',
                timestamp: new Date()
            }
        });
        
        // Tax validation (warning example)
        if (lineIndex % 7 === 0) {
            results.push({
                ruleId: 'rule8',
                ruleName: 'Tax Rate Validation',
                ruleType: 'SOFT',
                result: 'WARNING',
                message: 'Tax rate differs from expected rate',
                field: 'financial.taxes',
                operator: 'EQUALS',
                expectedValue: 15,
                actualValue: 17.5,
                evidence: {
                    ruleId: 'rule8',
                    ruleName: 'Tax Rate Validation',
                    ruleType: 'SOFT',
                    field: 'financial.taxes',
                    operator: 'EQUALS',
                    expectedValue: 15,
                    actualValue: 17.5,
                    passed: false,
                    severity: 'WARNING',
                    message: 'Tax rate differs from expected rate',
                    details: 'Expected 5% tax rate, found 5.8%',
                    timestamp: new Date()
                }
            });
        }
        
        return results;
    }
    // Invoices
    static async getInvoices(filters?: any): Promise<Invoice[]> {
        await this.simulateDelay();
        
        let filtered = [...mockInvoices];
        
        if (filters?.vendorId) {
            filtered = filtered.filter(inv => inv.vendorId === filters.vendorId);
        }
        
        if (filters?.status) {
            filtered = filtered.filter(inv => inv.status === filters.status);
        }
        
        return filtered.sort((a, b) => b.invoiceDate.toDate().getTime() - a.invoiceDate.toDate().getTime());
    }

    static async getInvoiceById(id: string): Promise<Invoice | null> {
        await this.simulateDelay();
        return mockInvoices.find(inv => inv.id === id) || null;
    }

    static async createInvoice(invoice: Partial<Invoice>): Promise<Invoice> {
        await this.simulateDelay();
        
        const newInvoice: Invoice = {
            id: `inv${Date.now()}`,
            invoiceNumber: `INV-${new Date().getFullYear()}-${String(mockInvoices.length + 1).padStart(3, '0')}`,
            status: 'PENDING',
            processingStatus: {
                stage: 'UPLOAD',
                progress: 0,
                startTime: toTimestamp(new Date()),
                lastUpdateTime: toTimestamp(new Date()),
                extraction: {
                    status: 'PENDING',
                    attempts: 0,
                    confidence: 0,
                    warnings: [],
                    errors: []
                },
                validation: {
                    status: 'PENDING',
                    rulesApplied: 0,
                    rulesPassed: 0,
                    rulesFailed: 0,
                    warnings: 0
                }
            } as ProcessingStatus,
            audit: {
                createdAt: toTimestamp(new Date()),
                createdBy: 'current-user',
                lastModified: toTimestamp(new Date()),
                modifiedBy: 'current-user',
                history: []
            },
            ...invoice
        } as Invoice;
        
        mockInvoices.push(newInvoice);
        
        // Simulate processing
        setTimeout(() => {
            const invoice = mockInvoices.find(i => i.id === newInvoice.id);
            if (invoice) {
                invoice.status = 'EXTRACTING';
                invoice.processingStatus.stage = 'EXTRACTION';
                invoice.processingStatus.progress = 25;
            }
        }, 2000);
        
        return newInvoice;
    }

    static async updateInvoiceStatus(id: string, status: InvoiceStatus): Promise<void> {
        await this.simulateDelay();
        
        const invoice = mockInvoices.find(inv => inv.id === id);
        if (invoice) {
            invoice.status = status;
            invoice.audit.lastModified = toTimestamp(new Date());
            invoice.audit.modifiedBy = 'current-user';
        }
    }

    static async deleteInvoice(id: string): Promise<void> {
        await this.simulateDelay();
        mockInvoices = mockInvoices.filter(inv => inv.id !== id);
    }

    // Vendors
    static async getVendors(filters?: any): Promise<Vendor[]> {
        await this.simulateDelay();
        
        let filtered = [...mockVendors];
        
        if (filters?.status) {
            filtered = filtered.filter(v => v.status === filters.status);
        }
        
        return filtered;
    }

    static async getVendorById(id: string): Promise<Vendor | null> {
        await this.simulateDelay();
        return mockVendors.find(v => v.id === id) || null;
    }

    static async createVendor(vendor: Partial<Vendor>): Promise<Vendor> {
        await this.simulateDelay();
        
        const newVendor: Vendor = {
            id: `v${Date.now()}`,
            vendorCode: vendor.vendorCode || `VENDOR-${Date.now()}`,
            vendorName: vendor.vendorName || 'New Vendor',
            vendorType: vendor.vendorType || 'OTHER',
            status: vendor.status || 'ACTIVE',
            businessModel: vendor.businessModel || {
                type: 'NET_RATE',
                paymentTermsDays: 30,
                currency: 'USD'
            },
            integration: vendor.integration || {
                apiEnabled: false,
                invoiceFormat: 'PDF',
                invoiceDelivery: 'EMAIL',
                fieldMappings: {}
            },
            contract: vendor.contract || {
                contractNumber: `CONTRACT-${Date.now()}`,
                startDate: toTimestamp(new Date()),
                endDate: toTimestamp(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)),
                autoRenew: true,
                terms: 'Standard terms'
            },
            contacts: vendor.contacts || [],
            processingConfig: vendor.processingConfig || {
                autoProcess: false,
                validationRuleSet: 'default',
                requiresManualApproval: true,
                duplicateCheckDays: 30,
                dateToleranceDays: 2,
                amountTolerancePercentage: 5
            },
            statistics: {
                totalInvoices: 0,
                totalAmount: 0,
                lastInvoiceDate: toTimestamp(new Date()),
                averageProcessingTime: 0,
                disputeRate: 0,
                validationPassRate: 100
            },
            metadata: {
                createdAt: toTimestamp(new Date()),
                createdBy: 'current-user',
                lastModified: toTimestamp(new Date()),
                modifiedBy: 'current-user',
                tags: vendor.metadata?.tags || []
            }
        };
        
        mockVendors.push(newVendor);
        return newVendor;
    }

    static async updateVendor(id: string, updates: Partial<Vendor>): Promise<void> {
        await this.simulateDelay();
        
        const vendor = mockVendors.find(v => v.id === id);
        if (vendor) {
            Object.assign(vendor, updates);
            vendor.metadata.lastModified = toTimestamp(new Date());
            vendor.metadata.modifiedBy = 'current-user';
        }
    }

    static async deleteVendor(id: string): Promise<void> {
        await this.simulateDelay();
        
        const index = mockVendors.findIndex(v => v.id === id);
        if (index !== -1) {
            mockVendors.splice(index, 1);
        }
    }

    // Rules
    static async getRules(filters?: any): Promise<ValidationRule[]> {
        await this.simulateDelay();
        
        let filtered = [...mockRules];
        
        if (filters?.vendorCode) {
            filtered = filtered.filter(r => 
                r.vendorCode === filters.vendorCode || r.vendorCode === '*'
            );
        }
        
        if (filters?.isActive !== undefined) {
            filtered = filtered.filter(r => r.isActive === filters.isActive);
        }
        
        return filtered;
    }

    static async getRuleById(id: string): Promise<ValidationRule | null> {
        await this.simulateDelay();
        return mockRules.find(r => r.id === id) || null;
    }

    static async createRule(rule: Partial<ValidationRule>): Promise<ValidationRule> {
        await this.simulateDelay();
        
        const newRule: ValidationRule = {
            id: `rule${Date.now()}`,
            ruleId: `CUSTOM-${String(mockRules.length + 1).padStart(3, '0')}`,
            version: '1.0',
            isActive: true,
            effectiveFrom: toTimestamp(new Date()),
            conditions: [],
            actions: {
                onMatch: 'CONTINUE',
                onMismatch: 'FLAG_WARNING'
            },
            metrics: {
                executionCount: 0,
                passCount: 0,
                failCount: 0,
                averageExecutionTimeMs: 0,
                errorRate: 0
            },
            metadata: {
                createdAt: toTimestamp(new Date()),
                createdBy: 'current-user',
                lastModified: toTimestamp(new Date()),
                modifiedBy: 'current-user',
                tags: []
            },
            ...rule
        } as ValidationRule;
        
        mockRules.push(newRule);
        return newRule;
    }

    static async updateRule(id: string, updates: Partial<ValidationRule>): Promise<void> {
        await this.simulateDelay();
        
        const rule = mockRules.find(r => r.id === id);
        if (rule) {
            Object.assign(rule, updates);
            rule.metadata.lastModified = toTimestamp(new Date());
            rule.metadata.modifiedBy = 'current-user';
        }
    }

    static async deleteRule(id: string): Promise<void> {
        await this.simulateDelay();
        mockRules = mockRules.filter(r => r.id !== id);
    }

    // Line Items
    static async getLineItems(invoiceId: string): Promise<LineItem[]> {
        await this.simulateDelay();
        
        // Generate mock line items for the invoice
        const invoice = mockInvoices.find(i => i.id === invoiceId);
        if (!invoice || invoice.summary.totalLineItems === 0) {
            return [];
        }
        
        // Return cached line items or generate new ones
        const existingItems = mockLineItems.filter(item => item.invoiceId === invoiceId);
        if (existingItems.length > 0) {
            return existingItems;
        }
        
        // Generate sample line items
        const items: LineItem[] = [];
        const numItems = Math.min(5, invoice.summary.totalLineItems); // Show first 5 items
        
        for (let i = 0; i < numItems; i++) {
            items.push({
                id: `li_${invoiceId}_${i}`,
                invoiceId: invoiceId,
                vendorId: invoice.vendorId,
                booking: {
                    confirmationNumber: `CNF${100000 + i}`,
                    vendorBookingRef: `VBR${200000 + i}`,
                    guestName: `Guest ${i + 1}`,
                    propertyId: `prop${(i % 3) + 1}`,
                    propertyName: `Property ${(i % 3) + 1}`,
                    roomType: 'Standard Room',
                    roomCount: 1,
                    checkInDate: invoice.periodStart,
                    checkOutDate: toTimestamp(new Date(invoice.periodStart.toDate().getTime() + 2 * 24 * 60 * 60 * 1000)),
                    bookingDate: toTimestamp(new Date(invoice.periodStart.toDate().getTime() - 30 * 24 * 60 * 60 * 1000)),
                    status: 'CONFIRMED'
                },
                financial: {
                    currency: invoice.financial.currency,
                    roomRate: 150,
                    nights: 2,
                    subtotal: 300,
                    taxes: 30,
                    fees: 10,
                    totalAmount: 340,
                    commissionPercentage: 15,
                    commissionAmount: 51,
                    netAmount: 289
                },
                validation: {
                    status: i === 0 && invoice.summary.disputedLineItems > 0 ? 'DISPUTED' : 'PASSED',
                    rulesApplied: this.generateRuleResults(invoiceId, i),
                    issues: i === 0 && invoice.summary.disputedLineItems > 0 ? [{
                        type: 'AMOUNT_MISMATCH',
                        severity: 'ERROR',
                        description: 'Amount differs from OMS by 5%',
                        field: 'totalAmount',
                        expectedValue: 340,
                        actualValue: 357
                    }] : [],
                    matchConfidence: 98.5,
                    overallStatus: i % 5 === 0 ? 'WARNING' : 'PASSED',
                    totalRules: 8,
                    passedRules: i % 5 === 0 ? 6 : 8,
                    failedRules: i % 5 === 0 ? 1 : 0,
                    warnings: i % 5 === 0 ? 1 : 0,
                    hardErrors: 0,
                    softErrors: i % 5 === 0 ? 1 : 0,
                    validatedAt: new Date()
                },
                metadata: {
                    lineNumber: i + 1,
                    extractedAt: invoice.receivedDate,
                    lastModified: toTimestamp(new Date()),
                    manuallyReviewed: false
                }
            });
        }
        
        // Cache the generated items
        mockLineItems.push(...items);
        
        return items;
    }
    
    // Get validation results for a line item
    static async getLineItemValidationResults(lineItemId: string): Promise<ValidationResult[]> {
        await this.simulateDelay();
        
        // Generate validation results based on the line item
        const lineItem = mockLineItems.find(item => item.id === lineItemId);
        if (!lineItem) {
            return [];
        }
        
        const results: ValidationResult[] = [];
        
        if (lineItem.validation.rulesApplied) {
            lineItem.validation.rulesApplied.forEach((rule, index) => {
                if (rule.evidence) {
                    results.push({
                        id: `vr_${lineItemId}_${index}`,
                        lineItemId: lineItemId,
                        invoiceId: lineItem.invoiceId,
                        ruleId: rule.ruleId,
                        ruleName: rule.ruleName,
                        ruleType: rule.ruleType,
                        passed: rule.result === 'PASSED',
                        evidence: rule.evidence,
                        createdAt: new Date()
                    });
                }
            });
        }
        
        return results;
    }

    // Helper method to simulate network delay
    private static simulateDelay(ms: number = 300): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Subscribe to data changes (mock implementation)
    static subscribe<T>(
        collection: string,
        filters: any[],
        onData: (data: T[]) => void,
        onError?: (error: Error) => void
    ): () => void {
        // Simulate real-time updates with polling
        let interval: NodeJS.Timeout;
        
        const fetchData = async () => {
            try {
                let data: any[] = [];
                
                switch (collection) {
                    case 'invoices':
                        data = await this.getInvoices(filters[0]);
                        break;
                    case 'vendors':
                        data = await this.getVendors(filters[0]);
                        break;
                    case 'validation_rules':
                        data = await this.getRules(filters[0]);
                        break;
                }
                
                onData(data as T[]);
            } catch (error) {
                if (onError) {
                    onError(error as Error);
                }
            }
        };
        
        // Initial fetch
        fetchData();
        
        // Poll every 5 seconds for updates
        interval = setInterval(fetchData, 5000);
        
        // Return unsubscribe function
        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }
}