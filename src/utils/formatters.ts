import { format, formatDistance, formatRelative, isValid } from 'date-fns';
import { Timestamp } from 'firebase/firestore';

// ==========================================
// CURRENCY FORMATTING
// ==========================================

export function formatCurrency(
    amount: number,
    currency: string = 'USD',
    locale: string = 'en-US'
): string {
    try {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    } catch (error) {
        // Fallback for unsupported currencies
        return `${currency} ${formatNumber(amount)}`;
    }
}

export function formatCompactCurrency(
    amount: number,
    currency: string = 'USD',
    locale: string = 'en-US'
): string {
    try {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            notation: 'compact',
            maximumFractionDigits: 1
        }).format(amount);
    } catch (error) {
        return formatCurrency(amount, currency, locale);
    }
}

// ==========================================
// NUMBER FORMATTING
// ==========================================

export function formatNumber(
    value: number,
    decimals: number = 2,
    locale: string = 'en-US'
): string {
    return new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(value);
}

export function formatPercentage(
    value: number,
    decimals: number = 1,
    locale: string = 'en-US'
): string {
    return new Intl.NumberFormat(locale, {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(value / 100);
}

export function formatCompactNumber(
    value: number,
    locale: string = 'en-US'
): string {
    return new Intl.NumberFormat(locale, {
        notation: 'compact',
        maximumFractionDigits: 1
    }).format(value);
}

// ==========================================
// DATE FORMATTING
// ==========================================

export function formatDate(
    date: Date | Timestamp | string | null | undefined,
    formatString: string = 'MMM dd, yyyy'
): string {
    if (!date) return '-';

    let dateObj: Date;

    if (date instanceof Timestamp) {
        dateObj = date.toDate();
    } else if (typeof date === 'string') {
        dateObj = new Date(date);
    } else {
        dateObj = date;
    }

    if (!isValid(dateObj)) return '-';

    return format(dateObj, formatString);
}

export function formatDateTime(
    date: Date | Timestamp | string | null | undefined,
    formatString: string = 'MMM dd, yyyy HH:mm'
): string {
    return formatDate(date, formatString);
}

export function formatTime(
    date: Date | Timestamp | string | null | undefined,
    formatString: string = 'HH:mm:ss'
): string {
    return formatDate(date, formatString);
}

export function formatDateRange(
    start: Date | Timestamp | string,
    end: Date | Timestamp | string,
    formatString: string = 'MMM dd'
): string {
    const startStr = formatDate(start, formatString);
    const endStr = formatDate(end, `${formatString}, yyyy`);
    return `${startStr} - ${endStr}`;
}

export function formatRelativeTime(
    date: Date | Timestamp | string,
    baseDate: Date = new Date()
): string {
    let dateObj: Date;

    if (date instanceof Timestamp) {
        dateObj = date.toDate();
    } else if (typeof date === 'string') {
        dateObj = new Date(date);
    } else {
        dateObj = date;
    }

    return formatDistance(dateObj, baseDate, { addSuffix: true });
}

export function formatRelativeDate(
    date: Date | Timestamp | string,
    baseDate: Date = new Date()
): string {
    let dateObj: Date;

    if (date instanceof Timestamp) {
        dateObj = date.toDate();
    } else if (typeof date === 'string') {
        dateObj = new Date(date);
    } else {
        dateObj = date;
    }

    return formatRelative(dateObj, baseDate);
}

// ==========================================
// FILE SIZE FORMATTING
// ==========================================

export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// ==========================================
// DURATION FORMATTING
// ==========================================

export function formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
        return `${days}d ${hours % 24}h`;
    } else if (hours > 0) {
        return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    } else {
        return `${seconds}s`;
    }
}

export function formatProcessingTime(milliseconds: number): string {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);

    if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    } else {
        return `${seconds}s`;
    }
}

// ==========================================
// STATUS FORMATTING
// ==========================================

export function formatStatus(status: string): string {
    return status
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getStatusColor(status: string): string {
    const statusColors: Record<string, string> = {
        // Invoice Status
        PENDING: 'bg-yellow-100 text-yellow-800',
        EXTRACTING: 'bg-blue-100 text-blue-800',
        EXTRACTED: 'bg-blue-100 text-blue-800',
        VALIDATING: 'bg-blue-100 text-blue-800',
        VALIDATED: 'bg-green-100 text-green-800',
        DISPUTED: 'bg-red-100 text-red-800',
        APPROVED: 'bg-green-100 text-green-800',
        REJECTED: 'bg-red-100 text-red-800',
        PAID: 'bg-green-100 text-green-800',
        CANCELLED: 'bg-gray-100 text-gray-800',

        // Processing Status
        PROCESSING: 'bg-blue-100 text-blue-800',
        COMPLETED: 'bg-green-100 text-green-800',
        FAILED: 'bg-red-100 text-red-800',

        // Validation Status
        PASSED: 'bg-green-100 text-green-800',
        WARNING: 'bg-yellow-100 text-yellow-800',

        // General Status
        ACTIVE: 'bg-green-100 text-green-800',
        INACTIVE: 'bg-gray-100 text-gray-800',

        // Default
        DEFAULT: 'bg-gray-100 text-gray-800'
    };

    return statusColors[status] || statusColors.DEFAULT;
}

export function getStatusIcon(status: string): string {
    const statusIcons: Record<string, string> = {
        PENDING: '⏳',
        EXTRACTING: '📄',
        VALIDATING: '🔍',
        VALIDATED: '✅',
        APPROVED: '✅',
        DISPUTED: '⚠️',
        REJECTED: '❌',
        FAILED: '❌',
        PASSED: '✓',
        WARNING: '⚠',
        ACTIVE: '🟢',
        INACTIVE: '⚫'
    };

    return statusIcons[status] || '•';
}

// ==========================================
// NAME FORMATTING
// ==========================================

export function formatName(firstName: string, lastName: string): string {
    return `${firstName} ${lastName}`.trim();
}

export function formatInitials(name: string): string {
    return name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

// ==========================================
// VENDOR FORMATTING
// ==========================================

export function formatVendorCode(code: string): string {
    return code.toUpperCase().replace(/_/g, ' ');
}

// ==========================================
// INVOICE FORMATTING
// ==========================================

export function formatInvoiceNumber(number: string): string {
    // Add any specific formatting logic for invoice numbers
    return number;
}

export function formatBookingReference(reference: string): string {
    // Add # prefix if not present
    return reference.startsWith('#') ? reference : `#${reference}`;
}

// ==========================================
// VALIDATION FORMATTING
// ==========================================

export function formatRuleType(type: 'HARD' | 'SOFT'): string {
    return type === 'HARD' ? 'Hard Stop' : 'Warning';
}

export function formatConditionType(type: string): string {
    const typeMap: Record<string, string> = {
        STRING_MATCH: 'String Match',
        NUMERIC_COMPARISON: 'Numeric Comparison',
        DATE_COMPARISON: 'Date Comparison',
        BOOKING_MATCH: 'Booking Match',
        PROPERTY_MAPPING: 'Property Mapping',
        DUPLICATE_CHECK: 'Duplicate Check',
        COMMISSION_VALIDATION: 'Commission Validation',
        TAX_VALIDATION: 'Tax Validation',
        CUSTOM: 'Custom'
    };

    return typeMap[type] || type;
}

export function formatOperator(operator: string): string {
    const operatorMap: Record<string, string> = {
        EQUALS: '=',
        NOT_EQUALS: '≠',
        GREATER_THAN: '>',
        LESS_THAN: '<',
        CONTAINS: 'contains',
        STARTS_WITH: 'starts with',
        ENDS_WITH: 'ends with',
        MATCHES_PATTERN: 'matches pattern',
        IN_RANGE: 'in range',
        NOT_IN_RANGE: 'not in range'
    };

    return operatorMap[operator] || operator;
}

// ==========================================
// PLURALIZATION
// ==========================================

export function pluralize(count: number, singular: string, plural?: string): string {
    if (count === 1) return `${count} ${singular}`;
    return `${count} ${plural || singular + 's'}`;
}

// ==========================================
// TRUNCATION
// ==========================================

export function truncate(text: string, maxLength: number = 50): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
}

export function truncateMiddle(text: string, maxLength: number = 20): string {
    if (text.length <= maxLength) return text;

    const start = Math.ceil(maxLength / 2) - 2;
    const end = Math.floor(maxLength / 2) - 1;

    return `${text.substring(0, start)}...${text.substring(text.length - end)}`;
}
