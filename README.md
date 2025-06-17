# Invoice Reconciliation Web App

A React-based invoice reconciliation system with Google Cloud Firestore backend using Application Default Credentials.

## Project Structure

```
├── api/                          # Backend API server
│   ├── routes/                   # Express route handlers
│   │   ├── vendors.js           # Vendor CRUD operations
│   │   ├── extractions.js       # Invoice extraction data endpoints
│   │   ├── reconciliations.js   # Reconciliation summary endpoints
│   │   ├── rules.js             # Validation rules management
│   │   └── status.js            # Processing status tracking
│   └── services/
│       └── firestore.service.js # Google Cloud Firestore service layer
├── src/
│   ├── components/              # React components organized by feature
│   │   ├── auth/               # Authentication components
│   │   ├── common/             # Shared UI components
│   │   ├── dashboard/          # Dashboard widgets and stats
│   │   ├── invoices/           # Invoice management components
│   │   ├── layout/             # App layout components
│   │   ├── rules/              # Rule configuration components
│   │   └── vendors/            # Vendor management components
│   ├── config/                 # App configuration
│   │   ├── app.config.ts       # Main app configuration
│   │   ├── constants.ts        # App constants and enums
│   │   └── firebase.ts         # Firebase config (not used with backend)
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAuth.ts          # Authentication hook
│   │   ├── useInvoices.ts      # Invoice data management
│   │   ├── useRules.ts         # Rule management
│   │   └── useVendors.ts       # Vendor data management
│   ├── pages/                  # Route-based page components
│   │   ├── auth/               # Login page
│   │   ├── dashboard/          # Dashboard page
│   │   ├── invoices/           # Invoice list and detail pages
│   │   ├── rules/              # Rules management page
│   │   └── vendors/            # Vendor management pages
│   ├── services/               # API and data services
│   │   ├── api/                # REST API client services
│   │   └── data.service.ts     # Unified data service interface
│   ├── store/                  # Redux store configuration
│   │   └── slices/             # Redux feature slices
│   └── types/                  # TypeScript type definitions
│       └── api.types.ts        # API data types
├── server.js                   # Express server entry point
├── package.json                # Dependencies and scripts
├── vite.config.ts              # Vite configuration
└── .env                        # Environment configuration

```

## Configuration

### 1. Google Cloud Project Setup

Update the project ID in the `.env` file:

**.env:**
```
# Google Cloud Project Configuration
GOOGLE_CLOUD_PROJECT=your-project-id
VITE_FIREBASE_PROJECT_ID=your-project-id
```

The backend automatically reads the project ID from the `GOOGLE_CLOUD_PROJECT` environment variable.

### 2. Firestore Collections

The app uses these Firestore collections:

| Collection Name | Purpose | Key Fields |
|----------------|---------|------------|
| `vendorConfigurations` | Vendor/partner information | vendorCode, vendorName, vendorType, isActive |
| `extractionResults` | Extracted invoice data | invoiceId, vendorId, invoiceNumber, totalAmount, status |
| `invoiceReconciliationSummaries` | Reconciliation results | invoiceId, vendorId, status, variance, issues |
| `reconciliationRules` | Validation rules per vendor | vendorId, ruleName, ruleType, conditions, actions |
| `reconciliationStatus` | Processing status tracking | invoiceId, currentStage, progress, errors |

### 3. Collection Mapping

If your Firestore collections have different names, update them in:

**api/services/firestore.service.js:**
```javascript
const COLLECTIONS = {
  VENDORS: 'vendorConfigurations',        // Change to your vendors collection
  EXTRACTIONS: 'extractionResults',       // Change to your extractions collection
  RECONCILIATIONS: 'invoiceReconciliationSummaries', // Change to your reconciliations collection
  RULES: 'reconciliationRules',           // Change to your rules collection
  STATUS: 'reconciliationStatus'          // Change to your status collection
};
```

### 4. Running the Application

**Development Mode:**
```bash
# Install dependencies
npm install

# Run both frontend (port 3000) and backend (port 3001)
npm run dev
```

**Production Mode:**
```bash
# Build frontend and run server
npm run build
npm start
```

### 5. Authentication

- Frontend uses Google OAuth for user authentication (configured in .env)
- Backend uses Google Cloud Application Default Credentials (ADC)
- No Firebase API keys needed

### 6. Environment Variables

Key environment variables in `.env`:

```
# Google OAuth
VITE_GOOGLE_CLIENT_ID=your-oauth-client-id

# API Configuration  
VITE_API_BASE_URL=/api  # Points to backend API

# Feature Flags
VITE_ENABLE_FIREBASE=false  # Must be false to use backend
```

## Data Models

The app expects these document structures in Firestore:

### Vendor Configuration
```javascript
{
  vendorCode: string,
  vendorName: string,
  vendorType: 'OTA' | 'DIRECT' | 'CHANNEL_MANAGER' | 'GDS' | 'OTHER',
  isActive: boolean,
  // ... (see api.types.ts for full structure)
}
```

### Extraction Result
```javascript
{
  invoiceId: string,
  vendorId: string,
  invoiceNumber: string,
  totalAmount: number,
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REVIEW_REQUIRED',
  // ... (see api.types.ts for full structure)
}
```

## API Endpoints

All API endpoints are prefixed with `/api`:

- `GET/POST /api/vendors` - Vendor management
- `GET/POST /api/extractions` - Invoice extraction data
- `GET/POST /api/reconciliations` - Reconciliation summaries
- `GET/POST /api/rules` - Validation rules
- `GET/POST /api/status` - Processing status

## Notes

- The app uses Google Cloud Firestore directly, not Firebase SDK
- All Firestore timestamps are converted to ISO strings in API responses
- Frontend proxies API calls through Vite in development
- No CORS issues as everything runs on same origin in production