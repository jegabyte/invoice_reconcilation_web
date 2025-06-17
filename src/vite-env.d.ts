/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_ENVIRONMENT: string
    readonly VITE_USE_MOCK_DATA: string
    readonly VITE_ENABLE_FIREBASE: string
    readonly VITE_ENABLE_REALTIME: string
    readonly VITE_ENABLE_FILE_UPLOAD: string
    readonly VITE_GOOGLE_CLIENT_ID: string
    readonly VITE_GCLOUD_TOKEN?: string
    readonly VITE_API_BASE_URL: string
    readonly VITE_API_TIMEOUT: string
    readonly VITE_API_RETRY_ATTEMPTS: string
    readonly VITE_INVOICE_BUCKET: string
    readonly VITE_DOCUMENT_BUCKET: string
    readonly VITE_MAX_FILE_SIZE: string
    readonly VITE_ALLOWED_FILE_TYPES: string
    readonly VITE_INVOICE_PROCESSING_TIMEOUT: string
    readonly VITE_VALIDATION_BATCH_SIZE: string
    readonly VITE_DISPUTE_RESOLUTION_DAYS: string
    readonly VITE_DEFAULT_CURRENCY: string
    readonly VITE_ITEMS_PER_PAGE: string
    readonly VITE_REFRESH_INTERVAL: string
    readonly VITE_TOAST_DURATION: string
    readonly VITE_DATE_FORMAT: string
    readonly VITE_TIME_FORMAT: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}