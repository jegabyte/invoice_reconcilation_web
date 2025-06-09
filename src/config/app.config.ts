// Application configuration
export const AppConfig = {
    // Environment
    environment: import.meta.env.VITE_ENVIRONMENT || 'development',
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
    
    // Feature flags
    features: {
        useMockData: import.meta.env.VITE_USE_MOCK_DATA === 'true',
        enableFirebase: import.meta.env.VITE_ENABLE_FIREBASE === 'true',
        enableRealtime: import.meta.env.VITE_ENABLE_REALTIME === 'true',
        enableFileUpload: import.meta.env.VITE_ENABLE_FILE_UPLOAD === 'true'
    },
    
    // Firebase configuration
    firebase: {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
        measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
    },
    
    // Storage configuration
    storage: {
        invoiceBucket: import.meta.env.VITE_INVOICE_BUCKET || 'invoices',
        documentBucket: import.meta.env.VITE_DOCUMENT_BUCKET || 'documents',
        maxFileSize: parseInt(import.meta.env.VITE_MAX_FILE_SIZE || '10485760'), // 10MB default
        allowedFileTypes: (import.meta.env.VITE_ALLOWED_FILE_TYPES || 'pdf,jpg,jpeg,png').split(',')
    },
    
    // API configuration
    api: {
        baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
        timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
        retryAttempts: parseInt(import.meta.env.VITE_API_RETRY_ATTEMPTS || '3')
    },
    
    // Business rules
    business: {
        invoiceProcessingTimeout: parseInt(import.meta.env.VITE_INVOICE_PROCESSING_TIMEOUT || '300000'), // 5 minutes
        validationBatchSize: parseInt(import.meta.env.VITE_VALIDATION_BATCH_SIZE || '100'),
        disputeResolutionDays: parseInt(import.meta.env.VITE_DISPUTE_RESOLUTION_DAYS || '30'),
        defaultCurrency: import.meta.env.VITE_DEFAULT_CURRENCY || 'USD'
    },
    
    // UI configuration
    ui: {
        itemsPerPage: parseInt(import.meta.env.VITE_ITEMS_PER_PAGE || '20'),
        refreshInterval: parseInt(import.meta.env.VITE_REFRESH_INTERVAL || '30000'), // 30 seconds
        toastDuration: parseInt(import.meta.env.VITE_TOAST_DURATION || '5000'), // 5 seconds
        dateFormat: import.meta.env.VITE_DATE_FORMAT || 'MMM dd, yyyy',
        timeFormat: import.meta.env.VITE_TIME_FORMAT || 'HH:mm:ss'
    }
};

// Validate required configuration
export function validateConfig(): string[] {
    const errors: string[] = [];
    
    if (AppConfig.features.enableFirebase && !AppConfig.features.useMockData) {
        if (!AppConfig.firebase.apiKey) errors.push('Firebase API key is required');
        if (!AppConfig.firebase.projectId) errors.push('Firebase project ID is required');
        if (!AppConfig.firebase.authDomain) errors.push('Firebase auth domain is required');
    }
    
    return errors;
}