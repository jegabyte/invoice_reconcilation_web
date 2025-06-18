// Central Application Configuration
// This file contains all configurable settings for the application

export const APP_CONFIG = {
  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || '/api/invoice-api-stub',
    timeout: 30000,
    retryAttempts: 3,
  },

  // UI Configuration
  ui: {
    // Table Settings
    tables: {
      fontSize: 'text-xs',
      headerPadding: 'px-2 py-1.5',
      cellPadding: 'px-2 py-1.5',
      compactMode: true,
      stripedRows: true,
      hoverEffect: 'hover:bg-gray-50',
    },

    // Filter Settings
    filters: {
      backgroundColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      inputSize: 'text-xs',
      inputPadding: 'px-2 py-1',
      minWidths: {
        search: 'min-w-[150px] max-w-[200px]',
        select: 'min-w-[100px]',
        selectLarge: 'min-w-[120px]',
      },
    },

    // Card Settings
    cards: {
      padding: {
        compact: 'p-3',
        normal: 'p-4',
        large: 'p-6',
      },
      shadow: 'shadow-sm',
      borderRadius: 'rounded-lg',
    },

    // Button Settings
    buttons: {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white',
      secondary: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300',
      danger: 'bg-red-600 hover:bg-red-700 text-white',
      sizes: {
        xs: 'px-2 py-1 text-xs',
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
      },
    },

    // Status Colors
    statusColors: {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      review: 'bg-yellow-100 text-yellow-800',
    },

    // Icons
    icons: {
      size: {
        xs: 'h-3 w-3',
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
      },
    },
  },

  // Date Formats
  dateFormats: {
    display: 'MMM dd, yy', // Jan 15, 24
    full: 'MMMM dd, yyyy', // January 15, 2024
    input: 'yyyy-MM-dd', // 2024-01-15
  },

  // Pagination
  pagination: {
    defaultPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
  },

  // Feature Flags
  features: {
    enablePdfDownload: true,
    enableBulkOperations: false,
    enableAdvancedFilters: false,
    enableExport: true,
  },

  // Validation Rules
  validation: {
    vendor: {
      codeMinLength: 3,
      codeMaxLength: 20,
      nameMinLength: 2,
      nameMaxLength: 100,
    },
    invoice: {
      numberMinLength: 5,
      numberMaxLength: 50,
      minAmount: 0,
      maxAmount: 999999999,
    },
    rule: {
      nameMinLength: 3,
      nameMaxLength: 100,
      priorityMin: 1,
      priorityMax: 100,
    },
  },

  // Default Values
  defaults: {
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    numberFormat: 'en-US',
    matchingThreshold: 95,
    amountTolerance: 1,
  },

  // Filter Options
  filterOptions: {
    // Invoice Filters
    invoice: {
      status: [
        { value: '', label: 'All Status' },
        { value: 'PENDING', label: 'Pending' },
        { value: 'MATCHED', label: 'Matched' },
        { value: 'MISMATCHED', label: 'Mismatched' },
        { value: 'PARTIAL_MATCH', label: 'Partial Match' },
        { value: 'DISPUTED', label: 'Disputed' },
      ],
    },

    // Vendor Filters
    vendor: {
      type: [
        { value: '', label: 'All Types' },
        { value: 'OTA', label: 'OTA' },
        { value: 'DIRECT', label: 'Direct' },
        { value: 'CHANNEL_MANAGER', label: 'Channel Manager' },
        { value: 'GDS', label: 'GDS' },
        { value: 'OTHER', label: 'Other' },
      ],
      status: [
        { value: 'ALL', label: 'All Status' },
        { value: 'ACTIVE', label: 'Active' },
        { value: 'INACTIVE', label: 'Inactive' },
      ],
      sortBy: [
        { value: 'name', label: 'Sort: Name' },
        { value: 'code', label: 'Sort: Code' },
        { value: 'type', label: 'Sort: Type' },
        { value: 'status', label: 'Sort: Status' },
      ],
    },

    // Rule Filters
    rule: {
      sortBy: [
        { value: 'priority', label: 'Sort: Priority' },
        { value: 'name', label: 'Sort: Name' },
        { value: 'status', label: 'Sort: Status' },
      ],
    },
  },
};
