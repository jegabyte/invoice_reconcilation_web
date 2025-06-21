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
    processing_completed: boolean;
    timestamp: string;
    failed_pages: number;
    total_pages: number;
    status_summary: Record<string, number>;
    processing_version: string;
    vendor_name: string;
    total_invoice_amount: number;
    total_line_items: number;
    extraction_id: string;
    dispute_type_summary: Record<string, number>;
    total_oms_amount: number;
    difference_amount: number;
    run_id?: string;
    // Invoice metadata fields from extraction_metadata
    invoiceNumber?: string;
    invoiceDate?: string;
    invoiceCurrency?: string;
    paymentDueDate?: string;
    invoiceType?: string;
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
// Frontend-friendly ReconciliationRule interface (camelCase)
export interface ReconciliationRule {
    id?: string;
    vendorId: string;
    vendorCode?: string;
    ruleName: string;
    ruleId?: string;
    description?: string;
    ruleType: 'VALIDATION' | 'MATCHING' | 'CUSTOM' | 'SOFT' | 'HARD';
    category: 'FINANCIAL' | 'BOOKING' | 'CUSTOM';
    isActive: boolean;
    priority: number;
    conditions: RuleCondition[];
    actions: RuleAction[] | {
        onMatch?: string;
        onMismatch?: string;
        disputeType?: string;
        warningType?: string;
    };
    tolerance?: {
        type: 'PERCENTAGE' | 'ABSOLUTE';
        value: number;
    } | null;
    effectiveFrom: string;
    effectiveTo?: string | null;
    version?: string;
    entityType?: string;
    createdBy?: string;
    createdAt?: string;
    updatedAt?: string;
    lastUsed?: string | null;
    usageCount?: number;
    metadata?: any;
    reprocessConfig?: any;
}

export interface RuleCondition {
    field: string;
    operator: string;
    value: any;
    dataType?: string;
}

export interface RuleAction {
    type: string;
    parameters?: Record<string, any>;
}

// Raw Firestore rule (snake_case) - for backend use
export interface FirestoreReconciliationRule {
    id?: string;
    priority: number;
    rule_name: string;
    rule_id: string;
    vendor_code: string;
    conditions: Record<string, {
        value_type?: string;
        operator: string;
        value?: string;
        type: string;
        days_threshold?: number;
        field?: string;
        oms_field?: string;
        invoice_field?: string;
        configuration?: {
            fuzzy_match_config?: {
                algorithms: string[];
                threshold: number;
            };
        };
    }>;
    effective_from: string;
    version: string;
    entity_type: string;
    actions: {
        on_mismatch: string;
        on_match: string;
        warning_type?: string;
        dispute_type?: string;
    };
    is_active: boolean;
    reprocess_config?: {
        days_before_check_in?: number;
    };
    metadata: {
        source: string;
        created_by: string;
        created_at: string;
    };
    effective_to: string | null;
    description: string;
    rule_type: 'SOFT' | 'HARD';
    always_use_latest?: boolean;
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
    dispute_type?: string;
    invoice_data: {
        amount: number;
        guest_name: string | null;
        check_in_date: string;
        check_out_date: string;
    };
    vendor_name: string;
    line_item_id: string;
    oms_data: {
        amount: number;
    };
    extraction_id: string;
    reconciliation_id: string;
    hotel_name: string;
    updated_at: string;
    days_in_current_status: number;
    cancellation_date?: string;
    status: string;
    rules_applied: Record<string, {
        type: string;
        rule_id: string;
        version: string;
    }>;
    booking_id: string;
    run_id: string;
    status_history: Record<string, {
        notes: string;
        timestamp: string;
        status: string;
        evidence: Record<string, any>;
        changed_by: string;
    }>;
    invoice_number: string;
    is_cancelled_booking?: boolean;
    expected_refund_date?: string;
    created_at: string;
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
    vendorType?: 'OTA' | 'DIRECT' | 'CHANNEL_MANAGER' | 'GDS' | 'OTHER';
    isActive?: boolean;
    businessModel?: 'NET_RATE' | 'COMMISSION' | 'SELL_RATE' | 'PROFIT_SHARING' | 'MIXED';
    integrationSettings?: {
        apiEndpoint?: string | null;
        apiKey?: string | null;
        ftpDetails?: {
            host: string;
            port: number;
            username: string;
            directory: string;
        } | null;
        emailSettings?: {
            incomingEmail?: string;
            supportEmail?: string;
        } | null;
        defaultTolerances?: any;
        bookingIdProcessing?: any;
        idField?: string;
        idPrefix?: string;
        defaultRulePriority?: number;
    };
    invoiceSettings?: {
        defaultCurrency?: string;
        invoicePrefix?: string;
        dueDays?: number;
        paymentTerms?: string;
        taxRate?: number;
        currencyCode?: string;
        invoiceFrequency?: string;
        invoiceFormats?: string[];
    };
    extractionSettings?: {
        templateId?: string;
        customFields?: ExtractorField[];
        dateFormat?: string;
        numberFormat?: string;
        extractionModel?: string;
        confidenceThreshold?: number;
        manualReviewThreshold?: number;
        autoReviewThreshold?: number;
        requiredFields?: string[];
    };
    reconciliationSettings?: {
        autoReconcile?: boolean;
        matchingThreshold?: number;
        defaultRules?: string[];
        bookingSourceField?: string;
        amountTolerancePercentage?: number;
        autoApprovalThreshold?: number;
        allowAutoApproval?: boolean;
        holdThreshold?: number;
        futureBookingThreshold?: number;
        cancelledBookingRefundDays?: number;
        cancellationHandling?: any;
        penaltyPercentageRange?: any;
    };
    contacts?: VendorContact[];
    metadata?: any;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
    updatedBy?: string;

    // Include snake_case properties for backward compatibility
    vendor_code?: string;
    vendor_name?: string;
    vendor_type?: 'OTA' | 'DIRECT' | 'CHANNEL_MANAGER' | 'GDS' | 'OTHER';
    is_active?: boolean;
    business_model?: 'NET_RATE' | 'COMMISSION' | 'SELL_RATE' | 'PROFIT_SHARING' | 'MIXED';
    created_at?: string;
    updated_at?: string;
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