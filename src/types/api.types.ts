// API types without Firebase dependencies

// Extraction Results - Data extracted from invoices
export interface ExtractionResult {
    id?: string;
    invoiceId: string;
    vendorId: string;
    vendorName: string;
    invoiceNumber: string;
    invoiceDate: string; // ISO string
    dueDate?: string; // ISO string
    totalAmount: number;
    currency: string;
    extractedData: {
        headerInfo: Record<string, any>;
        lineItems: ExtractedLineItem[];
        summary: {
            subtotal: number;
            tax: number;
            fees: number;
            total: number;
        };
    };
    extractionMethod: 'OCR' | 'MANUAL' | 'API';
    confidence: number;
    status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REVIEW_REQUIRED';
    errors: string[];
    createdAt: string;
    updatedAt: string;
}

export interface ExtractedLineItem {
    lineNumber: number;
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    bookingReference?: string;
    checkInDate?: string;
    checkOutDate?: string;
    guestName?: string;
    propertyName?: string;
    roomType?: string;
    metadata?: Record<string, any>;
}

// Invoice Reconciliation Summaries
export interface InvoiceReconciliationSummary {
    id?: string;
    invoiceId: string;
    vendorId: string;
    reconciliationDate: string;
    totalInvoiceAmount: number;
    totalReconciledAmount: number;
    variance: number;
    variancePercentage: number;
    status: 'MATCHED' | 'MISMATCHED' | 'PARTIAL_MATCH' | 'PENDING' | 'DISPUTED';
    matchedLineItems: number;
    unmatchedLineItems: number;
    totalLineItems: number;
    issues: ReconciliationIssue[];
    approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
    approvedBy: string | null;
    approvalDate: string | null;
    notes: string;
    createdAt: string;
    updatedAt: string;
}

export interface ReconciliationIssue {
    type: 'AMOUNT_MISMATCH' | 'MISSING_BOOKING' | 'DUPLICATE_BOOKING' | 'DATE_MISMATCH' | 'OTHER';
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    description: string;
    lineItemRef?: string;
    expectedValue?: any;
    actualValue?: any;
    variance?: number;
}

// Reconciliation Rules
export interface ReconciliationRule {
    id?: string;
    vendorId: string;
    ruleName: string;
    description: string;
    ruleType: 'MATCHING' | 'VALIDATION' | 'CALCULATION' | 'CUSTOM';
    category: 'FINANCIAL' | 'BOOKING' | 'DATE' | 'PROPERTY' | 'CUSTOM';
    isActive: boolean;
    priority: number;
    conditions: RuleCondition[];
    actions: RuleAction[];
    tolerance: {
        type: 'PERCENTAGE' | 'AMOUNT';
        value: number;
    } | null;
    effectiveFrom: string;
    effectiveTo: string | null;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    lastUsed: string | null;
    usageCount: number;
}

export interface RuleCondition {
    field: string;
    operator: 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'CONTAINS' | 'STARTS_WITH' | 'ENDS_WITH' | 'REGEX' | 'IN' | 'NOT_IN';
    value: any;
    dataType: 'STRING' | 'NUMBER' | 'DATE' | 'BOOLEAN';
    caseSensitive?: boolean;
}

export interface RuleAction {
    type: 'FLAG' | 'AUTO_APPROVE' | 'REJECT' | 'REQUIRE_REVIEW' | 'CALCULATE' | 'TRANSFORM';
    parameters: Record<string, any>;
}

// Reconciliation Status
export interface ReconciliationStatus {
    id?: string;
    invoiceId: string;
    vendorId: string;
    currentStage: 'UPLOADED' | 'EXTRACTING' | 'EXTRACTED' | 'RECONCILING' | 'RECONCILED' | 'COMPLETED' | 'FAILED';
    overallStatus: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'REQUIRES_REVIEW';
    startedAt: string;
    completedAt: string | null;
    progress: {
        extraction: ProgressInfo;
        validation: ProgressInfo;
        reconciliation: ProgressInfo;
    };
    errors: ProcessingError[];
    warnings: ProcessingWarning[];
    metadata: Record<string, any>;
    lastUpdated: string;
}

export interface ProgressInfo {
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
    percentage: number;
    startTime: string | null;
    endTime: string | null;
    message: string;
}

export interface ProcessingError {
    code: string;
    message: string;
    timestamp: string;
    details?: Record<string, any>;
}

export interface ProcessingWarning {
    code: string;
    message: string;
    timestamp: string;
    details: Record<string, any>;
}

// Vendor Configurations
export interface VendorConfiguration {
    id?: string;
    vendorCode: string;
    vendorName: string;
    vendorType: 'OTA' | 'DIRECT' | 'CHANNEL_MANAGER' | 'GDS' | 'OTHER';
    isActive: boolean;
    businessModel: 'NET_RATE' | 'COMMISSION' | 'SELL_RATE' | 'PROFIT_SHARING' | 'MIXED';
    integrationSettings: {
        apiEndpoint: string | null;
        apiKey: string | null;
        ftpDetails: {
            host: string;
            port: number;
            username: string;
            directory: string;
        } | null;
        emailSettings: {
            incomingEmail: string;
            supportEmail: string;
        } | null;
    };
    invoiceSettings: {
        defaultCurrency: string;
        invoicePrefix: string;
        dueDays: number;
        paymentTerms: string;
        taxRate: number;
    };
    extractionSettings: {
        templateId: string;
        customFields: ExtractorField[];
        dateFormat: string;
        numberFormat: string;
    };
    reconciliationSettings: {
        autoReconcile: boolean;
        matchingThreshold: number;
        defaultRules: string[];
        bookingSourceField: string;
        amountTolerancePercentage: number;
    };
    contacts: VendorContact[];
    createdAt: string;
    updatedAt: string;
}

export interface ExtractorField {
    fieldName: string;
    fieldType: 'STRING' | 'NUMBER' | 'DATE' | 'BOOLEAN';
    required: boolean;
    pattern?: string;
}

export interface VendorContact {
    name: string;
    email: string;
    phone?: string;
    role: string;
    isPrimary: boolean;
}