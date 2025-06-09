import { Timestamp } from 'firebase/firestore';
import { 
    Invoice, 
    Vendor, 
    ValidationRule, 
    LineItem, 
    User,
    InvoiceStatus,
    ProcessingStage
} from '@/types/models';

// Helper to create consistent timestamps
const now = () => Timestamp.now();
const daysAgo = (days: number) => Timestamp.fromDate(new Date(Date.now() - days * 24 * 60 * 60 * 1000));

// Mock users for authentication
export const MOCK_USERS: Record<string, { password: string; user: User }> = {
    'admin@example.com': {
        password: 'admin123',
        user: {
            id: '1',
            email: 'admin@example.com',
            displayName: 'Admin User',
            role: 'ADMIN',
            permissions: {
                invoices: { create: true, read: true, update: true, delete: true, approve: true },
                rules: { create: true, read: true, update: true, delete: true },
                vendors: { create: true, read: true, update: true, delete: true },
                disputes: { create: true, read: true, update: true, delete: true, resolve: true },
                reports: { view: true, export: true, schedule: true },
                system: { configureSettings: true, manageUsers: true, viewAuditLogs: true }
            },
            preferences: {
                theme: 'light',
                language: 'en',
                timezone: 'UTC',
                dateFormat: 'MM/DD/YYYY',
                numberFormat: 'en-US',
                notifications: {
                    email: { enabled: true, frequency: 'DAILY', types: ['invoice_received'] },
                    inApp: { enabled: true, types: ['invoice_received'] }
                },
                dashboard: { defaultView: 'overview', widgets: [] }
            },
            activity: {
                lastLogin: now(),
                lastActivity: now(),
                loginCount: 1,
                recentActions: []
            },
            metadata: {
                createdAt: daysAgo(90),
                lastModified: now(),
                isActive: true
            }
        }
    },
    'user@example.com': {
        password: 'user123',
        user: {
            id: '2',
            email: 'user@example.com',
            displayName: 'Regular User',
            role: 'OPERATOR',
            permissions: {
                invoices: { create: true, read: true, update: true, delete: false, approve: false },
                rules: { create: false, read: true, update: false, delete: false },
                vendors: { create: false, read: true, update: false, delete: false },
                disputes: { create: true, read: true, update: true, delete: false, resolve: false },
                reports: { view: true, export: true, schedule: false },
                system: { configureSettings: false, manageUsers: false, viewAuditLogs: false }
            },
            preferences: {
                theme: 'light',
                language: 'en',
                timezone: 'UTC',
                dateFormat: 'MM/DD/YYYY',
                numberFormat: 'en-US',
                notifications: {
                    email: { enabled: true, frequency: 'WEEKLY', types: ['invoice_assigned'] },
                    inApp: { enabled: true, types: ['invoice_assigned'] }
                },
                dashboard: { defaultView: 'invoices', widgets: [] }
            },
            activity: {
                lastLogin: now(),
                lastActivity: now(),
                loginCount: 5,
                recentActions: []
            },
            metadata: {
                createdAt: daysAgo(30),
                lastModified: now(),
                isActive: true
            }
        }
    }
};

// Mock vendors
export const MOCK_VENDORS: Vendor[] = [
    {
        id: 'v1',
        vendorCode: 'EXPEDIA',
        vendorName: 'Expedia Partners',
        vendorType: 'OTA',
        status: 'ACTIVE',
        businessModel: {
            type: 'COMMISSION',
            defaultCommissionPercentage: 15,
            paymentTermsDays: 30,
            currency: 'USD'
        },
        integration: {
            apiEnabled: true,
            apiEndpoint: 'https://api.expedia.com/v2',
            invoiceFormat: 'XML',
            invoiceDelivery: 'API',
            fieldMappings: {
                confirmationNumber: ['booking_reference', 'confirmation_code'],
                guestName: ['guest_name', 'traveler_name']
            }
        },
        contract: {
            contractNumber: 'EXP-2024-001',
            startDate: daysAgo(365),
            endDate: daysAgo(-365),
            autoRenew: true,
            terms: 'Standard Expedia partner agreement'
        },
        contacts: [
            {
                type: 'PRIMARY',
                name: 'John Smith',
                email: 'john.smith@expedia.com',
                phone: '+1-555-0123'
            }
        ],
        processingConfig: {
            autoProcess: true,
            validationRuleSet: 'EXPEDIA_STANDARD',
            requiresManualApproval: false,
            approvalThreshold: 10000,
            duplicateCheckDays: 90,
            dateToleranceDays: 2,
            amountTolerancePercentage: 0.01
        },
        statistics: {
            totalInvoices: 156,
            totalAmount: 2456789.50,
            lastInvoiceDate: daysAgo(5),
            averageProcessingTime: 3.5,
            disputeRate: 0.02,
            validationPassRate: 0.98
        },
        metadata: {
            createdAt: daysAgo(400),
            createdBy: 'system',
            lastModified: daysAgo(10),
            modifiedBy: 'admin@example.com',
            tags: ['strategic', 'high-volume']
        }
    },
    {
        id: 'v2',
        vendorCode: 'BOOKING',
        vendorName: 'Booking.com Partners',
        vendorType: 'OTA',
        status: 'ACTIVE',
        businessModel: {
            type: 'COMMISSION',
            defaultCommissionPercentage: 18,
            paymentTermsDays: 45,
            currency: 'USD'
        },
        integration: {
            apiEnabled: false,
            invoiceFormat: 'EXCEL',
            invoiceDelivery: 'EMAIL',
            fieldMappings: {
                confirmationNumber: ['reservation_number'],
                guestName: ['guest_full_name']
            }
        },
        contract: {
            contractNumber: 'BK-2024-002',
            startDate: daysAgo(300),
            endDate: daysAgo(-430),
            autoRenew: true,
            terms: 'Booking.com standard terms'
        },
        contacts: [
            {
                type: 'PRIMARY',
                name: 'Emma Wilson',
                email: 'emma.wilson@booking.com'
            }
        ],
        processingConfig: {
            autoProcess: false,
            validationRuleSet: 'BOOKING_STANDARD',
            requiresManualApproval: true,
            approvalThreshold: 5000,
            duplicateCheckDays: 60,
            dateToleranceDays: 3,
            amountTolerancePercentage: 0.02
        },
        statistics: {
            totalInvoices: 89,
            totalAmount: 1234567.89,
            lastInvoiceDate: daysAgo(7),
            averageProcessingTime: 4.2,
            disputeRate: 0.03,
            validationPassRate: 0.95
        },
        metadata: {
            createdAt: daysAgo(300),
            createdBy: 'admin@example.com',
            lastModified: daysAgo(15),
            modifiedBy: 'admin@example.com',
            tags: ['ota', 'manual-processing']
        }
    }
];

// Mock validation rules
export const MOCK_RULES: ValidationRule[] = [
    {
        id: 'r1',
        ruleId: 'EXPEDIA_RATE_CHECK',
        ruleName: 'Expedia Rate Validation',
        description: 'Validates room rates match within tolerance',
        category: 'FINANCIAL',
        vendorCode: 'EXPEDIA',
        entityType: 'LINE_ITEM',
        ruleType: 'HARD',
        priority: 1,
        version: 'v1.0',
        isActive: true,
        effectiveFrom: daysAgo(90),
        conditions: [
            {
                type: 'NUMERIC_COMPARISON',
                operator: 'IN_RANGE',
                invoiceField: 'roomRate',
                omsField: 'rate',
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
            onMismatch: 'DISPUTED',
            onMismatchConfig: {
                disputeType: 'RATE_MISMATCH'
            }
        },
        metrics: {
            executionCount: 1543,
            passCount: 1501,
            failCount: 42,
            averageExecutionTimeMs: 15,
            lastExecuted: daysAgo(1),
            errorRate: 0.027
        },
        metadata: {
            createdAt: daysAgo(90),
            createdBy: 'system',
            lastModified: daysAgo(30),
            modifiedBy: 'admin@example.com',
            tags: ['rate-validation', 'critical']
        }
    },
    {
        id: 'r2',
        ruleId: 'GLOBAL_DUPLICATE_CHECK',
        ruleName: 'Global Duplicate Invoice Check',
        description: 'Prevents duplicate invoice processing',
        category: 'DUPLICATE',
        vendorCode: '*',
        entityType: 'INVOICE',
        ruleType: 'HARD',
        priority: 1,
        version: 'v2.0',
        isActive: true,
        effectiveFrom: daysAgo(180),
        conditions: [
            {
                type: 'DUPLICATE_CHECK',
                operator: 'EQUALS',
                invoiceField: 'invoiceNumber',
                configuration: {
                    duplicateCheck: {
                        lookbackDays: 90,
                        fields: ['invoiceNumber', 'vendorId'],
                        exactMatch: true
                    }
                }
            }
        ],
        actions: {
            onMatch: 'DISPUTED',
            onMismatch: 'CONTINUE',
            onMatchConfig: {
                disputeType: 'DUPLICATE_INVOICE'
            }
        },
        metrics: {
            executionCount: 2156,
            passCount: 2150,
            failCount: 6,
            averageExecutionTimeMs: 25,
            lastExecuted: daysAgo(0),
            errorRate: 0.003
        },
        metadata: {
            createdAt: daysAgo(180),
            createdBy: 'system',
            lastModified: daysAgo(60),
            modifiedBy: 'admin@example.com',
            tags: ['duplicate-check', 'global']
        }
    }
];

// Helper to generate sample invoices
export function generateMockInvoice(vendorId: string, index: number): Invoice {
    const vendor = MOCK_VENDORS.find(v => v.id === vendorId) || MOCK_VENDORS[0];
    const daysOffset = index * 7;
    const status: InvoiceStatus = index % 3 === 0 ? 'VALIDATED' : index % 3 === 1 ? 'PENDING' : 'DISPUTED';
    const stage: ProcessingStage = status === 'VALIDATED' ? 'COMPLETE' : status === 'PENDING' ? 'VALIDATION' : 'RECONCILIATION';
    
    return {
        id: `inv-${vendorId}-${index}`,
        invoiceNumber: `INV-${vendor.vendorCode}-${String(1000 + index).padStart(6, '0')}`,
        vendorId: vendorId,
        vendorName: vendor.vendorName,
        vendorInvoiceNumber: `${vendor.vendorCode}-${2024}${String(index).padStart(4, '0')}`,
        invoiceDate: daysAgo(daysOffset),
        periodStart: daysAgo(daysOffset + 30),
        periodEnd: daysAgo(daysOffset),
        receivedDate: daysAgo(daysOffset - 1),
        dueDate: daysAgo(daysOffset - 30),
        financial: {
            currency: 'USD',
            subtotal: 10000 + (index * 1000),
            taxAmount: (10000 + (index * 1000)) * 0.1,
            totalAmount: (10000 + (index * 1000)) * 1.1,
            commissionAmount: (10000 + (index * 1000)) * 0.15,
            netAmount: (10000 + (index * 1000)) * 0.85
        },
        status: status,
        processingStatus: {
            stage: stage,
            progress: stage === 'COMPLETE' ? 100 : stage === 'VALIDATION' ? 60 : 30,
            startTime: daysAgo(daysOffset - 1),
            lastUpdateTime: daysAgo(daysOffset - 1),
            extraction: {
                status: 'COMPLETED',
                attempts: 1,
                confidence: 0.95,
                warnings: [],
                errors: []
            },
            validation: {
                status: status === 'VALIDATED' ? 'COMPLETED' : 'IN_PROGRESS',
                rulesApplied: 15,
                rulesPassed: status === 'VALIDATED' ? 15 : 12,
                rulesFailed: status === 'VALIDATED' ? 0 : 3,
                warnings: status === 'DISPUTED' ? 2 : 0
            }
        },
        files: {
            originalFile: {
                gcsPath: `invoices/raw/${vendorId}/invoice-${index}.pdf`,
                fileName: `${vendor.vendorCode}_Invoice_${index}.pdf`,
                fileType: 'application/pdf',
                fileSize: 1024 * (100 + index),
                uploadedAt: daysAgo(daysOffset - 1),
                uploadedBy: 'user@example.com'
            }
        },
        summary: {
            totalLineItems: 10 + (index % 5),
            validatedLineItems: status === 'VALIDATED' ? 10 + (index % 5) : 8 + (index % 3),
            disputedLineItems: status === 'DISPUTED' ? 2 : 0,
            totalBookings: 10 + (index % 5),
            uniqueProperties: 3 + (index % 3),
            dateRange: {
                earliest: daysAgo(daysOffset + 30),
                latest: daysAgo(daysOffset)
            }
        },
        audit: {
            createdAt: daysAgo(daysOffset - 1),
            createdBy: 'user@example.com',
            lastModified: daysAgo(daysOffset - 1),
            modifiedBy: 'system',
            history: []
        },
        metadata: {
            source: 'EMAIL',
            tags: ['monthly', vendor.vendorCode.toLowerCase()],
            customFields: {}
        }
    };
}

// Helper to generate sample line items
export function generateMockLineItems(invoiceId: string, count: number): LineItem[] {
    const items: LineItem[] = [];
    for (let i = 0; i < count; i++) {
        items.push({
            id: `li-${invoiceId}-${i}`,
            invoiceId: invoiceId,
            vendorId: invoiceId.split('-')[1],
            booking: {
                confirmationNumber: `CONF-${String(100000 + i).padStart(8, '0')}`,
                vendorBookingRef: `VBR-${String(200000 + i).padStart(8, '0')}`,
                omsBookingRef: `OMS-${String(300000 + i).padStart(8, '0')}`,
                guestName: `Guest ${i + 1}`,
                guestEmail: `guest${i + 1}@example.com`,
                propertyId: `PROP-${String(i % 5).padStart(3, '0')}`,
                propertyName: `Hotel Property ${i % 5 + 1}`,
                roomType: 'Standard Room',
                roomCount: 1,
                checkInDate: daysAgo(30 - i),
                checkOutDate: daysAgo(28 - i),
                bookingDate: daysAgo(60 - i),
                status: 'CONFIRMED'
            },
            financial: {
                currency: 'USD',
                roomRate: 150 + (i * 10),
                nights: 2,
                subtotal: (150 + (i * 10)) * 2,
                taxes: ((150 + (i * 10)) * 2) * 0.1,
                fees: 25,
                totalAmount: ((150 + (i * 10)) * 2 * 1.1) + 25,
                commissionPercentage: 15,
                commissionAmount: ((150 + (i * 10)) * 2) * 0.15,
                netAmount: ((150 + (i * 10)) * 2) * 0.85
            },
            validation: {
                status: i % 10 === 0 ? 'DISPUTED' : 'PASSED',
                rulesApplied: [],
                issues: [],
                matchConfidence: i % 10 === 0 ? 0.75 : 0.95
            },
            metadata: {
                lineNumber: i + 1,
                extractedAt: daysAgo(1),
                validatedAt: daysAgo(1),
                lastModified: daysAgo(1),
                manuallyReviewed: false
            }
        });
    }
    return items;
}

// Centralized mock data
export const mockData = {
    users: MOCK_USERS,
    vendors: MOCK_VENDORS,
    rules: MOCK_RULES,
    generateInvoice: generateMockInvoice,
    generateLineItems: generateMockLineItems
};