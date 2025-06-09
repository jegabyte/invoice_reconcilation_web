import { Timestamp } from 'firebase/firestore';
import { ValidationResult, ValidationEvidence } from './validation';

// Re-export types
export type { ValidationResult, ValidationEvidence } from './validation';
export { Timestamp };

// ==========================================
// VENDOR MODEL
// ==========================================
export interface Vendor {
    id: string;
    vendorCode: string;
    vendorName: string;
    vendorType: 'OTA' | 'DIRECT' | 'CHANNEL_MANAGER' | 'GDS' | 'OTHER';
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

    businessModel: {
        type: BusinessModelType;
        defaultCommissionPercentage?: number;
        defaultMarkupPercentage?: number;
        profitSharePercentage?: number;
        paymentTermsDays: number;
        currency: string;
    };

    integration: {
        apiEnabled: boolean;
        apiEndpoint?: string;
        invoiceFormat: 'PDF' | 'EXCEL' | 'CSV' | 'XML' | 'JSON' | 'API';
        invoiceDelivery: 'EMAIL' | 'FTP' | 'API' | 'PORTAL' | 'MANUAL';
        fieldMappings: { [key: string]: string[] };
    };

    contract: {
        contractNumber: string;
        startDate: Timestamp;
        endDate: Timestamp;
        autoRenew: boolean;
        terms: string;
    };

    contacts: VendorContact[];

    processingConfig: {
        autoProcess: boolean;
        processingSchedule?: string;
        validationRuleSet: string;
        requiresManualApproval: boolean;
        approvalThreshold?: number;
        duplicateCheckDays: number;
        dateToleranceDays: number;
        amountTolerancePercentage: number;
    };

    statistics: {
        totalInvoices: number;
        totalAmount: number;
        lastInvoiceDate: Timestamp;
        averageProcessingTime: number;
        disputeRate: number;
        validationPassRate: number;
    };

    metadata: {
        createdAt: Timestamp;
        createdBy: string;
        lastModified: Timestamp;
        modifiedBy: string;
        tags: string[];
    };
}

export interface VendorContact {
    type: 'PRIMARY' | 'BILLING' | 'TECHNICAL' | 'ESCALATION';
    name: string;
    email: string;
    phone?: string;
    timezone?: string;
}

// ==========================================
// INVOICE MODEL
// ==========================================
export interface Invoice {
    id: string;
    invoiceNumber: string;
    vendorId: string;
    vendorName?: string; // Denormalized for display
    vendorInvoiceNumber: string;

    invoiceDate: Timestamp;
    periodStart: Timestamp;
    periodEnd: Timestamp;
    receivedDate: Timestamp;
    dueDate: Timestamp;

    financial: InvoiceFinancial;
    status: InvoiceStatus;
    processingStatus: ProcessingStatus;

    files: {
        originalFile: FileReference;
        processedFiles?: ProcessedFile[];
    };

    summary: InvoiceSummary;
    audit: AuditInfo;
    metadata: InvoiceMetadata;
}

export interface InvoiceFinancial {
    currency: string;
    subtotal: number;
    taxAmount: number;
    totalAmount: number;
    commissionAmount?: number;
    netAmount?: number;
    calculatedTotal?: number;
    variance?: number;
    variancePercentage?: number;
}

export interface ProcessingStatus {
    stage: ProcessingStage;
    progress: number;
    startTime: Timestamp;
    lastUpdateTime: Timestamp;
    estimatedCompletion?: Timestamp;

    extraction: {
        status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
        attempts: number;
        confidence: number;
        warnings: string[];
        errors: string[];
    };

    validation: {
        status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
        rulesApplied: number;
        rulesPassed: number;
        rulesFailed: number;
        warnings: number;
    };
}

export interface FileReference {
    gcsPath: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    uploadedAt: Timestamp;
    uploadedBy: string;
}

export interface ProcessedFile {
    type: 'EXTRACTED_JSON' | 'VALIDATION_REPORT' | 'RECONCILIATION_REPORT';
    gcsPath: string;
    createdAt: Timestamp;
}

export interface InvoiceSummary {
    totalLineItems: number;
    validatedLineItems: number;
    disputedLineItems: number;
    totalBookings: number;
    uniqueProperties: number;
    dateRange: {
        earliest: Timestamp;
        latest: Timestamp;
    };
}

export interface AuditInfo {
    createdAt: Timestamp;
    createdBy: string;
    lastModified: Timestamp;
    modifiedBy: string;
    approvedAt?: Timestamp;
    approvedBy?: string;
    rejectedAt?: Timestamp;
    rejectedBy?: string;
    history: AuditHistoryEntry[];
}

export interface AuditHistoryEntry {
    timestamp: Timestamp;
    userId: string;
    action: string;
    details?: any;
}

export interface InvoiceMetadata {
    source: 'MANUAL_UPLOAD' | 'EMAIL' | 'API' | 'FTP' | 'AUTO_FETCH' | 'PORTAL';
    ipAddress?: string;
    userAgent?: string;
    processingJobId?: string;
    tags: string[];
    customFields?: { [key: string]: any };
}

// ==========================================
// LINE ITEM MODEL
// ==========================================
export interface LineItem {
    id: string;
    invoiceId: string;
    vendorId: string;

    booking: BookingInfo;
    financial: LineItemFinancial;
    validation: LineItemValidation;
    omsData?: OMSData;

    metadata: {
        lineNumber: number;
        extractedAt: Timestamp;
        validatedAt?: Timestamp;
        lastModified: Timestamp;
        manuallyReviewed: boolean;
        reviewedBy?: string;
        reviewNotes?: string;
    };
}

export interface BookingInfo {
    confirmationNumber: string;
    vendorBookingRef: string;
    omsBookingRef?: string;
    guestName: string;
    guestEmail?: string;

    propertyId: string;
    propertyName: string;
    roomType: string;
    roomCount: number;

    checkInDate: Timestamp;
    checkOutDate: Timestamp;
    bookingDate: Timestamp;
    cancellationDate?: Timestamp;

    status: 'CONFIRMED' | 'CANCELLED' | 'NO_SHOW' | 'MODIFIED';
}

export interface LineItemFinancial {
    currency: string;
    roomRate: number;
    nights: number;
    subtotal: number;
    taxes: number;
    fees: number;
    totalAmount: number;

    commissionPercentage?: number;
    commissionAmount?: number;
    netAmount?: number;

    omsAmount?: number;
    variance?: number;
    variancePercentage?: number;
}

export interface LineItemValidation {
    status: ValidationStatus;
    rulesApplied: RuleResult[];
    issues: ValidationIssue[];
    matchConfidence: number;
    validationResults?: ValidationResult[];
    overallStatus?: 'PASSED' | 'WARNING' | 'FAILED';
    totalRules?: number;
    passedRules?: number;
    failedRules?: number;
    warnings?: number;
    hardErrors?: number;
    softErrors?: number;
    validatedAt?: Date;
}

export interface RuleResult {
    ruleId: string;
    ruleName: string;
    ruleType: 'HARD' | 'SOFT';
    result: 'PASSED' | 'FAILED' | 'WARNING' | 'SKIPPED';
    message?: string;
    evidence?: ValidationEvidence;
    field?: string;
    operator?: string;
    expectedValue?: any;
    actualValue?: any;
    details?: string;
}

export interface ValidationIssue {
    type: 'AMOUNT_MISMATCH' | 'BOOKING_NOT_FOUND' | 'DATE_MISMATCH' |
    'DUPLICATE' | 'RATE_VARIANCE' | 'MISSING_DATA' | 'OTHER';
    severity: 'ERROR' | 'WARNING' | 'INFO';
    description: string;
    field?: string;
    expectedValue?: any;
    actualValue?: any;
}

export interface OMSData {
    found: boolean;
    reservationId?: string;
    matchedAt?: Timestamp;
    data?: {
        guestName: string;
        amount: number;
        checkIn: string;
        checkOut: string;
        status: string;
        [key: string]: any;
};
}

// ==========================================
// VALIDATION RULE MODEL
// ==========================================
export interface ValidationRule {
    id: string;
    ruleId: string;
    ruleName: string;
    description: string;
    category: 'FINANCIAL' | 'BOOKING' | 'DATE' | 'DUPLICATE' | 'PROPERTY' | 'CUSTOM';

    vendorCode: string;
    entityType: 'INVOICE' | 'LINE_ITEM';
    ruleType: RuleType;

    priority: number;
    version: string;
    isActive: boolean;

    businessModel?: {
        type: BusinessModelType | '*';
        commissionPercentage?: number;
        markupPercentage?: number;
        profitPercentage?: number;
        calculationBase?: 'GROSS' | 'NET' | 'ROOM_RATE';
    };

    effectiveFrom: Timestamp;
    effectiveTo?: Timestamp;

    conditions: RuleCondition[];
    actions: RuleActions;

    metrics: {
        executionCount: number;
        passCount: number;
        failCount: number;
        averageExecutionTimeMs: number;
        lastExecuted?: Timestamp;
        errorRate: number;
    };

    metadata: {
        createdAt: Timestamp;
        createdBy: string;
        lastModified: Timestamp;
        modifiedBy: string;
        tags: string[];
        documentation?: string;
    };
}

export interface RuleCondition {
    type: ConditionType;
    operator: OperatorType;
    invoiceField: string;
    omsField?: string;
    value?: any;
    configuration?: ConditionConfiguration;
}

export interface ConditionConfiguration {
    tolerance?: {
        percentage?: number;
        absoluteValue?: number;
        currency?: string;
        mode?: 'HIGHER_OF' | 'LOWER_OF' | 'PERCENTAGE_ONLY' | 'ABSOLUTE_ONLY';
    };

    caseSensitive?: boolean;
    trimWhitespace?: boolean;

    prefixHandling?: {
        enabled: boolean;
        strips: string[];
        caseInsensitive: boolean;
        prefixes?: string[];
    };

    matchingStrategies?: Array<{
        type: 'DIRECT_OMS' | 'PROPERTY_MAPPING' | 'FUZZY_MATCH' | 'REGEX';
        fields: string[];
        threshold?: number;
    }>;

    duplicateCheck?: {
        lookbackDays: number;
        fields: string[];
        exactMatch: boolean;
    };

    dateConfig?: {
        format?: string;
        timezone?: string;
        toleranceDays?: number;
    };

    // For STRING_MATCH with patterns
    pattern?: string;
    substring?: string;

    // For FUZZY_MATCH
    algorithms?: string[];
    threshold?: number;
    abbreviationMappings?: Array<{ from: string; to: string }>;

    // For STATUS_CHECK
    allowedValues?: string[];

    // For DATE_COMPARISON
    referenceDate?: string;
    specificDate?: string;
    thresholdDays?: number;

    // For custom strategies
    strategies?: Array<{
        type: string;
        fields: string[];
        threshold?: number;
    }>;

    // Generic key-value storage for condition types
    [key: string]: any;
}

export interface RuleActions {
    onMatch: RuleActionType;
    onMismatch: RuleActionType;
    onMatchConfig?: {
        disputeType?: string;
        warningType?: string;
        [key: string]: any;
    };
    onMismatchConfig?: {
        disputeType?: string;
        warningType?: string;
        [key: string]: any;
    };
    disputeType?: string;
    warningType?: string;
    notificationTemplate?: string;
    customAction?: {
        type: string;
        parameters: { [key: string]: any };
};
}

// ==========================================
// USER MODEL
// ==========================================
export interface User {
    id: string;
    email: string;
    displayName: string;
    photoURL?: string;
    phoneNumber?: string;

    role: UserRole;
    permissions: UserPermissions;

    vendorAccess?: {
        vendorIds: string[];
        restrictToVendor: boolean;
    };

    preferences: UserPreferences;
    activity: UserActivity;

    metadata: {
        createdAt: Timestamp;
        createdBy?: string;
        lastModified: Timestamp;
        isActive: boolean;
        deactivatedAt?: Timestamp;
        deactivatedBy?: string;
        deactivationReason?: string;
    };
}

export interface UserPermissions {
    invoices: CRUDPermissions & { approve: boolean };
    rules: CRUDPermissions;
    vendors: CRUDPermissions;
    disputes: CRUDPermissions & { resolve: boolean };
    reports: {
        view: boolean;
    export: boolean;
        schedule: boolean;
    };
    system: {
        configureSettings: boolean;
        manageUsers: boolean;
        viewAuditLogs: boolean;
    };
}

export interface CRUDPermissions {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
}

export interface UserPreferences {
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
    dateFormat: string;
    numberFormat: string;

    notifications: {
        email: {
            enabled: boolean;
            frequency: 'IMMEDIATE' | 'DAILY' | 'WEEKLY';
            types: string[];
        };
        inApp: {
            enabled: boolean;
            types: string[];
        };
    };

    dashboard: {
        defaultView: string;
        widgets: Array<{
            type: string;
            position: number;
            config: any;
        }>;
    };
}

export interface UserActivity {
    lastLogin: Timestamp;
    lastActivity: Timestamp;
    loginCount: number;
    recentActions: Array<{
        timestamp: Timestamp;
        action: string;
        resourceType: string;
        resourceId: string;
    }>;
}

// ==========================================
// TYPE DEFINITIONS
// ==========================================
export type InvoiceStatus =
    'PENDING' | 'EXTRACTING' | 'EXTRACTED' | 'VALIDATING' |
    'VALIDATED' | 'DISPUTED' | 'APPROVED' | 'REJECTED' | 'PAID' | 'CANCELLED';

export type ProcessingStage =
    'UPLOAD' | 'EXTRACTION' | 'VALIDATION' | 'RECONCILIATION' | 'COMPLETE';

export type ValidationStatus =
    'PENDING' | 'PASSED' | 'WARNING' | 'FAILED' | 'DISPUTED';

export type BusinessModelType =
    'NET_RATE' | 'COMMISSION' | 'SELL_RATE' | 'PROFIT_SHARING' | 'MIXED';

export type RuleType = 'HARD' | 'SOFT';

export type UserRole = 'ADMIN' | 'MANAGER' | 'OPERATOR' | 'VIEWER' | 'VENDOR';

export type ConditionType =
    'STRING_MATCH' | 'NUMERIC_COMPARISON' | 'DATE_COMPARISON' |
    'BOOKING_MATCH' | 'PROPERTY_MAPPING' | 'DUPLICATE_CHECK' |
    'COMMISSION_VALIDATION' | 'TAX_VALIDATION' | 'CUSTOM' |
    'EXACT_MATCH' | 'FUZZY_MATCH' | 'STATUS_CHECK';

export type OperatorType =
    'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' |
    'CONTAINS' | 'STARTS_WITH' | 'ENDS_WITH' | 'MATCHES_PATTERN' |
    'IN_RANGE' | 'NOT_IN_RANGE' | 'WITHIN_DAYS';

export type RuleActionType =
    'CONTINUE' | 'DISPUTED' | 'FLAG_WARNING' | 'FLAG_AS_CANCELLED' |
    'FLAG_FOR_REVIEW' | 'AUTO_APPROVE' | 'BLOCK_PROCESSING' | 'CUSTOM' |
    'FLAG_AS_CANCELLED_PENDING_REFUND' | 'FLAG_FOR_FUTURE_PROCESSING';
