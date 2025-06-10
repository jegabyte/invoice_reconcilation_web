// Application Constants
export const APP_NAME = 'Invoice Reconciliation System';
export const APP_VERSION = '1.0.0';

// Collections
export const COLLECTIONS = {
    EXTRACTION_RESULTS: 'extractionResults',
    INVOICE_RECONCILIATION_SUMMARIES: 'invoiceReconciliationSummaries',
    RECONCILIATION_RULES: 'reconciliationRules',
    RECONCILIATION_STATUS: 'reconciliationStatus',
    VENDOR_CONFIGURATIONS: 'vendorConfigurations'
} as const;

// Invoice Status
export const INVOICE_STATUS = {
    PENDING: 'PENDING',
    EXTRACTING: 'EXTRACTING',
    EXTRACTED: 'EXTRACTED',
    VALIDATING: 'VALIDATING',
    VALIDATED: 'VALIDATED',
    DISPUTED: 'DISPUTED',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    PAID: 'PAID',
    CANCELLED: 'CANCELLED'
} as const;

// Processing Stages
export const PROCESSING_STAGE = {
    UPLOAD: 'UPLOAD',
    EXTRACTION: 'EXTRACTION',
    VALIDATION: 'VALIDATION',
    RECONCILIATION: 'RECONCILIATION',
    COMPLETE: 'COMPLETE'
} as const;

// Validation Status
export const VALIDATION_STATUS = {
    PENDING: 'PENDING',
    PASSED: 'PASSED',
    WARNING: 'WARNING',
    FAILED: 'FAILED',
    DISPUTED: 'DISPUTED'
} as const;

// Rule Types
export const RULE_TYPE = {
    HARD: 'HARD',
    SOFT: 'SOFT'
} as const;

// Business Models
export const BUSINESS_MODEL = {
    NET_RATE: 'NET_RATE',
    COMMISSION: 'COMMISSION',
    SELL_RATE: 'SELL_RATE',
    PROFIT_SHARING: 'PROFIT_SHARING',
    MIXED: 'MIXED'
} as const;

// Condition Types
export const CONDITION_TYPES = [
    'STRING_MATCH',
    'NUMERIC_COMPARISON',
    'DATE_COMPARISON',
    'BOOKING_MATCH',
    'PROPERTY_MAPPING',
    'DUPLICATE_CHECK',
    'COMMISSION_VALIDATION',
    'TAX_VALIDATION',
    'CUSTOM'
] as const;

// Operators
export const OPERATORS = [
    'EQUALS',
    'NOT_EQUALS',
    'GREATER_THAN',
    'LESS_THAN',
    'CONTAINS',
    'STARTS_WITH',
    'ENDS_WITH',
    'MATCHES_PATTERN',
    'IN_RANGE',
    'NOT_IN_RANGE'
] as const;

// Actions
export const RULE_ACTIONS = {
    ON_MATCH: [
        'CONTINUE',
        'DISPUTED',
        'FLAG_WARNING',
        'FLAG_AS_CANCELLED',
        'FLAG_FOR_REVIEW',
        'AUTO_APPROVE'
    ],
    ON_MISMATCH: [
        'CONTINUE',
        'DISPUTED',
        'FLAG_WARNING',
        'BLOCK_PROCESSING'
    ]
} as const;

// User Roles
export const USER_ROLES = {
    ADMIN: 'ADMIN',
    MANAGER: 'MANAGER',
    OPERATOR: 'OPERATOR',
    VIEWER: 'VIEWER',
    VENDOR: 'VENDOR'
} as const;

// File Types
export const ACCEPTED_FILE_TYPES = {
    PDF: '.pdf',
    EXCEL: '.xlsx,.xls',
    CSV: '.csv',
    XML: '.xml',
    JSON: '.json'
} as const;

// Pagination
export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 20,
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100]
} as const;

// Date Formats
export const DATE_FORMAT = {
    DISPLAY: 'MMM dd, yyyy',
    INPUT: 'yyyy-MM-dd',
    DATETIME: 'MMM dd, yyyy HH:mm',
    TIME: 'HH:mm:ss'
} as const;

// Currency
export const DEFAULT_CURRENCY = 'MYR';

// Status Colors
export const STATUS_COLORS = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    PROCESSING: 'bg-blue-100 text-blue-800',
    EXTRACTING: 'bg-blue-100 text-blue-800',
    VALIDATING: 'bg-blue-100 text-blue-800',
    VALIDATED: 'bg-green-100 text-green-800',
    APPROVED: 'bg-green-100 text-green-800',
    DISPUTED: 'bg-red-100 text-red-800',
    REJECTED: 'bg-red-100 text-red-800',
    COMPLETED: 'bg-green-100 text-green-800',
    PASSED: 'bg-green-100 text-green-800',
    WARNING: 'bg-yellow-100 text-yellow-800',
    FAILED: 'bg-red-100 text-red-800',
    ACTIVE: 'bg-green-100 text-green-800',
    INACTIVE: 'bg-gray-100 text-gray-800'
} as const;
