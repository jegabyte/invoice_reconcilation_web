# Invoice Reconciliation System

A React-based invoice reconciliation system designed to manage invoice extractions, vendor configurations, and reconciliation processes.

## Overview

This application provides a comprehensive interface for:
- Managing vendor configurations
- Processing invoice extractions
- Handling reconciliation workflows
- Applying validation rules
- Monitoring reconciliation status

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite (configured to run on port 3000)
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Date Handling**: date-fns
- **Icons**: Lucide React
- **Routing**: React Router v6

## Current Architecture

The application has been architected to work with a backend API. Currently, it uses a comprehensive mock data layer for development and demonstration purposes.

## Project Structure

```
src/
├── components/        # Feature-based UI components
│   ├── auth/         # Authentication components
│   ├── common/       # Shared components (Button, Card, Modal, etc.)
│   ├── invoices/     # Invoice-related components
│   ├── layout/       # Layout components (AppLayout, Sidebar, etc.)
│   ├── rules/        # Rule management components
│   └── vendors/      # Vendor components
├── config/           # Configuration files
│   ├── app.config.ts # Central application configuration
│   ├── constants.ts  # App constants
│   ├── environment.ts # Environment settings
│   └── firebase.ts   # Firebase configuration
├── hooks/            # Custom React hooks
│   ├── useAuth.ts    # Authentication hook
│   ├── useFirestore.ts # Firestore operations
│   ├── useInvoices.ts  # Invoice operations
│   ├── useRealtime.ts  # Real-time updates
│   ├── useRules.ts     # Rule management
│   └── useVendors.ts   # Vendor operations
├── pages/            # Page components
│   ├── auth/         # Login, Register, Forgot Password
│   ├── invoices/     # Invoice pages (list, detail, modals)
│   │   ├── InvoicesPage.tsx
│   │   ├── InvoiceDetailPage.tsx
│   │   ├── AddInvoiceModal.tsx
│   │   └── InvoiceDetailsModal.tsx
│   ├── rules/        # Rules page
│   │   └── RulesPage.tsx
│   ├── settings/     # Settings page
│   │   └── SettingsPage.tsx
│   └── vendors/      # Vendors page
│       ├── VendorsPage.tsx
│       ├── AddVendorModal.tsx
│       └── ViewVendorModal.tsx
├── services/         # Service layer
│   ├── api/          # API service implementations
│   │   ├── client.ts # Axios HTTP client
│   │   ├── config.ts # API configuration
│   │   ├── vendor.api.service.ts
│   │   ├── extraction.api.service.ts
│   │   ├── reconciliation.api.service.ts
│   │   ├── rules.api.service.ts
│   │   └── statistics.api.service.ts
│   ├── api.data.service.ts # Unified data service
│   ├── auth.service.ts     # Authentication service
│   └── firebase.backup/    # Firebase backup (deprecated)
├── store/            # Redux store
│   ├── index.ts      # Store configuration
│   └── slices/       # Redux slices
│       ├── auth.slice.ts
│       ├── invoice.slice.ts
│       ├── ui.slice.ts
│       └── vendor.slice.ts
├── types/            # TypeScript definitions
│   ├── api.types.ts  # API data types
│   ├── firestore.ts  # Firestore types
│   ├── jspdf-autotable.d.ts # PDF types
│   └── models/       # Domain models
└── utils/            # Utility functions
    ├── formatters.ts # Currency, date formatting
    └── validators.ts # Validation utilities
```

## API Integration

The application is integrated with REST APIs hosted on Firebase Functions. The base URL is configurable through environment variables.

### Current API Endpoints

- **Base URL**: `https://us-central1-ava-staging-4a9e1.cloudfunctions.net/invoice-api-stub`
- **Rules**: `/rules`
- **Vendors**: `/vendors`  
- **Invoice Summaries**: `/invoice_summaries`

### Current Mock Implementation

The application includes a complete mock data layer with:
- **5 Vendors**: Booking.com, Expedia, Hotels.com, Agoda (EUR), TripAdvisor (inactive)
- **6 Invoice Extractions**: Various statuses (COMPLETED, FAILED, REVIEW_REQUIRED)
- **6 Reconciliation Summaries**: Matched, partial matches, and failed reconciliations
- **10 Validation Rules**: Financial, booking, property, and transformation rules
- **Comprehensive Statistics**: Dashboard metrics, vendor performance, issue tracking

### API Structure

The API service layer is located in `src/services/api/` and includes:

1. **Vendor Service** (`vendor.api.service.ts`)
   - GET `/api/vendors` - List all vendors
   - GET `/api/vendors/:id` - Get vendor by ID
   - POST `/api/vendors` - Create vendor
   - PUT `/api/vendors/:id` - Update vendor
   - DELETE `/api/vendors/:id` - Delete vendor

2. **Extraction Service** (`extraction.api.service.ts`)
   - GET `/api/extractions` - List extractions with filters
   - GET `/api/extractions/:id` - Get extraction by ID
   - POST `/api/extractions` - Create extraction
   - PUT `/api/extractions/:id` - Update extraction
   - POST `/api/extractions/upload` - Upload invoice file

3. **Reconciliation Service** (`reconciliation.api.service.ts`)
   - GET `/api/reconciliation-summaries` - List summaries
   - GET `/api/reconciliation-summaries/:id` - Get summary by ID
   - POST `/api/reconciliation-summaries` - Create summary
   - PUT `/api/reconciliation-summaries/:id/approve` - Approve reconciliation
   - PUT `/api/reconciliation-summaries/:id/reject` - Reject reconciliation
   - GET `/api/reconciliation-status/:invoiceId` - Get status by invoice
   - PUT `/api/reconciliation-status/:invoiceId` - Update status

4. **Rules Service** (`rules.api.service.ts`)
   - GET `/api/rules` - List rules with filters
   - GET `/api/rules/:id` - Get rule by ID
   - POST `/api/rules` - Create rule
   - PUT `/api/rules/:id` - Update rule
   - DELETE `/api/rules/:id` - Delete rule

5. **Statistics Service** (`statistics.api.service.ts`)
   - GET `/api/statistics` - Get dashboard statistics
   - GET `/api/statistics/vendor/:id` - Get vendor statistics
   - GET `/api/statistics/reconciliation` - Get reconciliation metrics

### Switching from Mock to Real API

To connect the application to your backend API:

1. **Update API Base URL**
   ```bash
   # In your .env file
   VITE_API_BASE_URL=https://your-api-domain.com/api
   ```

2. **Remove Mock Data Delays**
   
   Each service in `src/services/api/` currently includes artificial delays and returns mock data. Here's what needs to be changed:

   ```typescript
   // Current Mock Implementation (vendor.api.service.ts):
   async getVendors() {
     await delay(500); // Remove this line
     return { success: true, data: mockVendors, total: mockVendors.length };
   }
   
   // Change to Real API:
   async getVendors() {
     return apiClient.get(API_ENDPOINTS.vendors);
   }
   ```

3. **Service Files to Update**
   
   Replace mock implementations in these files:
   - `vendor.api.service.ts` - Remove mockVendors references
   - `extraction.api.service.ts` - Remove mockExtractions references
   - `reconciliation.api.service.ts` - Remove mockReconciliationSummaries references
   - `rules.api.service.ts` - Remove mockRules references
   - `statistics.api.service.ts` - Remove mockStatistics references

4. **Mock Data Location**
   
   All mock data is centralized in `src/services/api/mock-data.ts`. This file can be removed once real API is connected.

5. **API Response Format**
   
   The application expects responses in this format:
   ```json
   {
     "success": true,
     "data": { /* actual data */ },
     "message": "Optional message",
     "error": { /* only on error */ }
   }
   ```

6. **Authentication**
   
   The API client (`src/services/api/client.ts`) automatically adds Bearer token from localStorage:
   ```typescript
   Authorization: Bearer <token>
   ```

7. **Error Handling**
   
   Errors should follow this format:
   ```json
   {
     "success": false,
     "error": {
       "code": "ERROR_CODE",
       "message": "Human readable message",
       "details": { /* additional info */ }
     }
   }
   ```

### Example: Converting Mock to Real API

Here's a complete example of converting the vendor service:

```typescript
// src/services/api/vendor.api.service.ts

// BEFORE (Mock Implementation):
import { delay } from '@/utils/helpers';
import { mockVendors } from './mock-data';

class VendorApiService {
  async getVendors() {
    await delay(500);
    return { success: true, data: mockVendors, total: mockVendors.length };
  }
  
  async getVendorById(id: string) {
    await delay(300);
    const vendor = mockVendors.find(v => v.id === id);
    if (!vendor) {
      return { success: false, error: { code: 'NOT_FOUND', message: 'Vendor not found' } };
    }
    return { success: true, data: vendor };
  }
}

// AFTER (Real API Implementation):
import { apiClient } from './client';
import { API_ENDPOINTS } from './config';

class VendorApiService {
  async getVendors() {
    return apiClient.get(API_ENDPOINTS.vendors);
  }
  
  async getVendorById(id: string) {
    return apiClient.get(`${API_ENDPOINTS.vendors}/${id}`);
  }
}
```

### Data Models

The application uses these main data models (defined in `src/types/api.types.ts`):

1. **VendorConfiguration**
   - Vendor details, business model, integration settings
   - Invoice settings including currency configuration
   - Extraction and reconciliation settings

2. **ExtractionResult**
   - Invoice metadata and financial details
   - Extracted line items with booking information
   - Processing status and confidence scores

3. **InvoiceReconciliationSummary**
   - Reconciliation results and variances
   - Issues found during reconciliation
   - Approval status and notes

4. **ReconciliationRule**
   - Rule conditions and actions
   - Priority and effectiveness settings
   - Usage statistics

5. **ReconciliationStatus**
   - Real-time processing status
   - Progress tracking for each stage
   - Errors and warnings

## Currency Configuration

The system supports multiple currencies with a flexible configuration:

### Current Implementation
- **System Default**: MYR (defined in `src/config/constants.ts` line 139)
- **Business Default**: Can be overridden via `VITE_DEFAULT_CURRENCY` environment variable
- **Vendor-specific**: Each vendor configuration includes `defaultCurrency`
- **Invoice-specific**: Each invoice stores its own `currency` field

### Currency Support Status
- ✅ Data structure supports multi-currency
- ✅ Mock data includes both USD and EUR invoices
- ⚠️ UI currently displays all amounts without currency parameter
- ⚠️ `formatCurrency` function defaults to system currency

### To Enable Full Multi-Currency Display
```typescript
// Current Implementation:
formatCurrency(invoice.totalAmount) // Uses default currency

// Required Change:
formatCurrency(invoice.totalAmount, invoice.currency) // Uses invoice-specific currency
```

Files that need updating for full multi-currency support:
- `src/pages/invoices/InvoicesPage.tsx` - Lines 230, 292
- `src/pages/invoices/InvoiceDetailPage.tsx` - All currency displays
- `src/components/invoices/LineItemDetail.tsx` - Line item amounts
- Any other component displaying monetary values

## UI Customization Guide

### Central Configuration

All UI configurations are centralized in `src/config/app.config.ts`. This file contains settings for:

#### 1. Table Configuration
```typescript
tables: {
  fontSize: 'text-xs',           // Change to 'text-sm' for larger text
  headerPadding: 'px-2 py-1.5',  // Adjust padding as needed
  cellPadding: 'px-2 py-1.5',    // Adjust cell spacing
  compactMode: true,             // Set to false for spacious layout
  stripedRows: true,             // Alternating row colors
  hoverEffect: 'hover:bg-gray-50'
}
```

#### 2. Filter Component Styling
```typescript
filters: {
  backgroundColor: 'bg-gray-50',  // Change filter section background
  borderColor: 'border-gray-200', // Change border color
  inputSize: 'text-xs',          // Input text size
  inputPadding: 'px-2 py-1',     // Input padding
  minWidths: {
    search: 'min-w-[150px] max-w-[200px]',
    select: 'min-w-[100px]',
    selectLarge: 'min-w-[120px]'
  }
}
```

#### 3. Card/Metric Components
```typescript
cards: {
  padding: {
    compact: 'p-3',    // For metric cards
    normal: 'p-4',     // Standard cards
    large: 'p-6'       // Detail cards
  },
  shadow: 'shadow-sm',
  borderRadius: 'rounded-lg'
}
```

#### 4. Status Colors
```typescript
statusColors: {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  pending: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  review: 'bg-yellow-100 text-yellow-800'
}
```

### Making UI Changes

#### To Change Table Font Size Globally:
1. Open `src/config/app.config.ts`
2. Change `tables.fontSize` from `'text-xs'` to `'text-sm'` or `'text-base'`
3. All tables will automatically update

#### To Change Filter Appearance:
1. Modify `filters.backgroundColor` for different background
2. Adjust `filters.inputSize` for larger/smaller inputs
3. Change `filters.minWidths` to control dropdown sizes

#### To Adjust Card Spacing:
1. Update `cards.padding` values
2. For tighter layout: change `compact: 'p-2'`
3. For spacious layout: change `normal: 'p-6'`

#### To Modify Status Badge Colors:
1. Update color classes in `statusColors`
2. Use Tailwind color classes (e.g., 'bg-purple-100 text-purple-800')

#### To Modify Filter Options:
All dropdown filter options are centralized in `filterOptions`:

1. **Invoice Status Options**:
   ```typescript
   filterOptions.invoice.status: [
     { value: '', label: 'All Status' },
     { value: 'PENDING', label: 'Pending' },
     // Add or modify status options
   ]
   ```

2. **Vendor Type Options**:
   ```typescript
   filterOptions.vendor.type: [
     { value: 'OTA', label: 'OTA' },
     { value: 'DIRECT', label: 'Direct' },
     // Add or modify vendor types
   ]
   ```

3. **Sort Options**:
   - Vendor sort: `filterOptions.vendor.sortBy`
   - Rule sort: `filterOptions.rule.sortBy`

To add a new filter option:
```typescript
// In app.config.ts
filterOptions.vendor.type.push({ value: 'NEW_TYPE', label: 'New Type' })
```

### Component-Specific Customization

#### Invoice Page Metrics:
- Location: `src/pages/invoices/InvoicesPage.tsx`
- Line 193-249: Metric cards layout
- Change grid: `grid-cols-2 md:grid-cols-5` to adjust layout

#### Table Columns:
- Rules: `src/pages/rules/RulesPage.tsx` (line 194-221)
- Invoices: `src/pages/invoices/InvoicesPage.tsx` (line 257-275)
- Vendors: `src/pages/vendors/VendorsPage.tsx` (line 215-233)

#### Icons:
- Invoice metrics: Lines 200, 210, 220, 230, 246
- Import new icons from 'lucide-react' as needed

### Quick Style Changes

1. **Make tables less compact**:
   ```typescript
   // In app.config.ts
   tables: {
     fontSize: 'text-sm',
     headerPadding: 'px-4 py-3',
     cellPadding: 'px-4 py-3'
   }
   ```

2. **Change primary color scheme**:
   ```typescript
   // In app.config.ts
   buttons: {
     primary: 'bg-indigo-600 hover:bg-indigo-700 text-white'
   }
   ```

3. **Make filters more prominent**:
   ```typescript
   // In app.config.ts
   filters: {
     backgroundColor: 'bg-white',
     borderColor: 'border-gray-300',
     inputSize: 'text-sm'
   }
   ```

## Recent Updates

### API Integration (Latest)
- Replaced all Firestore/dummy implementations with REST API calls
- Integrated with Firebase Functions endpoints
- API responses are mapped to existing TypeScript interfaces
- Create/Update/Delete operations show success messages without actual API calls (as requested)

### UI Improvements (Latest)
1. **Compact Table Design**
   - Reduced font sizes from `text-sm` to `text-xs`
   - Reduced padding for headers and cells
   - Added responsive column hiding for smaller screens
   - Improved date formatting (e.g., "Jan 15, 24")

2. **Sleek Filter Components**
   - Replaced Card wrapper with lightweight gray background
   - Added filter icon for better visual identification
   - Reduced input sizes and removed labels
   - Smart clear button that only shows when filters are active

3. **Enhanced Metric Cards**
   - Reduced size with `p-3` padding instead of `p-4`
   - Better icons: CheckCircle for processed, Clock for pending
   - 5-column layout for better space utilization

4. **Invoice Detail Page**
   - Restructured to show only essential components
   - Added PDF download functionality with jsPDF
   - New Reconciliation Outcome component
   - Updated Line Items with API data fields

5. **Vendor Management**
   - Fixed matchingThreshold conversion (decimal to percentage)
   - Proper handling of vendor editing
   - Consistent table design across all pages

### Dependencies Added
- `jspdf`: ^3.0.1 - PDF generation
- `jspdf-autotable`: ^5.0.2 - Table support for PDFs
- `@types/jspdf`: ^1.3.3 - TypeScript definitions

## Development Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   # Create .env file with these variables:
   VITE_API_BASE_URL=http://localhost:3001/api
   VITE_DEFAULT_CURRENCY=MYR
   VITE_ENABLE_FILE_UPLOAD=true
   VITE_MAX_FILE_SIZE=10485760
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   The app runs on http://localhost:3000

4. **Build for production**
   ```bash
   npm run build
   npm run preview  # To test production build
   ```

5. **Type checking and linting**
   ```bash
   npm run type-check  # Run TypeScript checks
   npm run lint        # Run ESLint
   ```


## Features

### Current Features
- ✅ Vendor management with CRUD operations
- ✅ Invoice listing with advanced filtering (search, vendor, status, date range)
- ✅ Invoice detail view with line items and reconciliation summary
- ✅ Multi-currency support (data structure supports it, UI needs currency parameter)
- ✅ Status tracking with color-coded indicators
- ✅ Confidence scoring with visual progress bars
- ✅ Add invoice modal (UI ready, needs backend integration)
- ✅ Validation rules management with conditions and actions
- ✅ Responsive design with Tailwind CSS
- ✅ Mock authentication system

### Backend Integration Required
- 🔄 Real-time status updates via WebSocket
- 🔄 File upload processing (PDF, Excel, CSV)
- 🔄 Actual reconciliation processing engine
- 🔄 Rule execution engine with condition evaluation
- 🔄 Email notifications for approvals and alerts
- 🔄 Export functionality (Excel, PDF reports)
- 🔄 Currency conversion for multi-currency invoices
- 🔄 OCR integration for invoice extraction
- 🔄 Booking system integration for validation

## Implementation Guide for Backend

### 1. API Endpoints Implementation

Your backend should implement all endpoints listed in the API Structure section above. Each endpoint should:
- Follow RESTful conventions
- Return responses in the expected format
- Include proper error handling
- Support pagination where applicable

### 2. Database Schema

Based on the data models, your database should include:

**Vendors Table/Collection**
- id, vendorCode, vendorName, vendorType
- businessModel, isActive
- integrationSettings (JSON)
- invoiceSettings (JSON)
- extractionSettings (JSON)
- reconciliationSettings (JSON)
- contacts (JSON array)
- createdAt, updatedAt

**Extractions Table/Collection**
- id, invoiceId, vendorId, vendorName
- invoiceNumber, invoiceDate, dueDate
- totalAmount, currency
- extractedData (JSON)
- extractionMethod, confidence, status
- errors (JSON array)
- createdAt, updatedAt

**ReconciliationSummaries Table/Collection**
- id, invoiceId, vendorId
- reconciliationDate
- totalInvoiceAmount, totalReconciledAmount
- variance, variancePercentage
- status, matchedLineItems, unmatchedLineItems
- issues (JSON array)
- approvalStatus, approvedBy, approvalDate
- notes, createdAt, updatedAt

**Rules Table/Collection**
- id, vendorId, ruleName, description
- ruleType, category, isActive, priority
- conditions (JSON array)
- actions (JSON array)
- tolerance (JSON)
- effectiveFrom, effectiveTo
- createdBy, createdAt, updatedAt
- lastUsed, usageCount

### 3. Business Logic Implementation

**Invoice Processing Flow**
1. File upload/creation → Create extraction record
2. Process extraction → Update status and confidence
3. Apply validation rules → Create reconciliation summary
4. Manual review if needed → Update approval status

**Rule Engine**
- Evaluate conditions based on field, operator, and value
- Support multiple condition types (STRING, NUMBER, DATE, etc.)
- Execute actions based on rule results
- Track rule usage and effectiveness

**Multi-Currency Support**
- Store currency with each invoice
- Support currency conversion if needed
- Display amounts in invoice currency

### 4. Real-time Updates (Optional)

For real-time functionality:
- Implement WebSocket connections
- Send updates when invoice status changes
- Update reconciliation progress in real-time

### 5. File Processing

For invoice file uploads:
- Support PDF, Excel, CSV formats
- Extract data using OCR or parsing libraries
- Store original files in cloud storage
- Return extraction results with confidence scores

## API Endpoints Reference

### Quick Reference for Backend Implementation

Each endpoint should return data in the standardized format:
```json
{
  "success": true,
  "data": { /* response data */ },
  "total": 100, // for list endpoints
  "message": "Success message"
}
```

### Required Headers
```
Content-Type: application/json
Authorization: Bearer <token>
```

### Pagination Parameters (for list endpoints)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `sort`: Sort field (e.g., "createdAt")
- `order`: Sort order ("asc" or "desc")

### Filter Parameters
Most list endpoints support filtering:
- Vendors: `?isActive=true&vendorType=OTA`
- Extractions: `?vendorId=xxx&status=COMPLETED&dateFrom=2024-01-01`
- Rules: `?vendorId=xxx&isActive=true&category=FINANCIAL`

## Deployment

The application is a static SPA that can be deployed to:
- AWS S3 + CloudFront
- Netlify
- Vercel
- Any static hosting service

Build the production bundle:
```bash
npm run build
# Output in dist/ directory
```

## Environment Variables

Complete list of environment variables:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:3001/api
VITE_API_TIMEOUT=30000
VITE_API_RETRY_ATTEMPTS=3

# Feature Flags
VITE_USE_MOCK_DATA=true              # Set to false when using real API
VITE_ENABLE_FIREBASE=false           # Firebase is removed, keep false
VITE_ENABLE_REALTIME=false           # For WebSocket support
VITE_ENABLE_FILE_UPLOAD=true         # Enable file upload UI

# Storage Configuration
VITE_MAX_FILE_SIZE=10485760          # 10MB in bytes
VITE_ALLOWED_FILE_TYPES=pdf,jpg,jpeg,png,xlsx,xls,csv

# Business Configuration
VITE_DEFAULT_CURRENCY=MYR            # System default currency
VITE_INVOICE_PROCESSING_TIMEOUT=300000  # 5 minutes
VITE_VALIDATION_BATCH_SIZE=100
VITE_DISPUTE_RESOLUTION_DAYS=30

# UI Configuration
VITE_ITEMS_PER_PAGE=20
VITE_REFRESH_INTERVAL=30000          # 30 seconds
VITE_TOAST_DURATION=5000             # 5 seconds
VITE_DATE_FORMAT=MMM dd, yyyy
VITE_TIME_FORMAT=HH:mm:ss
```

### Production Environment
For production deployment, ensure:
- Set `VITE_USE_MOCK_DATA=false`
- Update `VITE_API_BASE_URL` to production API endpoint
- Configure proper CORS settings on your API server

