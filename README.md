# Invoice Reconciliation Web Application

A web application for automated invoice reconciliation using Google Cloud Firestore and Application Default Credentials (ADC).

## Overview

This application provides an intuitive interface for managing and reconciling invoices with automated extraction and validation capabilities. It uses Google Cloud Firestore as the backend database and supports multi-environment deployment through configurable collection names.

## Features

- **Invoice Management**: Upload, view, and manage invoices
- **Automated Extraction**: Extract line items and metadata from uploaded invoices
- **Reconciliation Engine**: Automated matching and validation of invoice line items
- **Multi-vendor Support**: Configure different validation rules per vendor
- **Real-time Status Tracking**: Monitor reconciliation progress and status
- **Detailed Reporting**: View extraction results and reconciliation details

## Prerequisites

- Node.js 18+ and npm
- Google Cloud Project with Firestore enabled
- Google Cloud CLI (`gcloud`) installed and configured
- Application Default Credentials (ADC) set up

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd invoice_reconcilation_web
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Google Cloud Authentication

Set up Application Default Credentials (ADC):

```bash
gcloud auth application-default login
```

Select your Google Cloud project:

```bash
gcloud config set project YOUR_PROJECT_ID
```

### 4. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and update the following required variables:

```bash
# Required: Your Google Cloud Project ID
GOOGLE_CLOUD_PROJECT=your-project-id
GCP_PROJECT_ID=your-project-id

# Required: Storage bucket for file uploads
STORAGE_BUCKET_NAME=your-storage-bucket
GCS_BUCKET_NAME=your-storage-bucket
```

### 5. Firestore Collections

The application uses the following Firestore collections (customizable via environment variables):

| Collection | Default Name | Environment Variable | Purpose |
|------------|--------------|---------------------|---------|
| Vendors | `vendor_configurations` | `COLLECTION_VENDORS` | Vendor/partner configurations |
| Extractions | `extractionResults` | `COLLECTION_EXTRACTIONS` | Raw extraction results |
| Reconciliations | `invoice_reconciliation_summaries` | `COLLECTION_RECONCILIATIONS` | Reconciliation summaries |
| Rules | `reconciliation_rules` | `COLLECTION_RULES` | Validation rules per vendor |
| Status | `reconciliation_status` | `COLLECTION_STATUS` | Line item reconciliation status |
| Metadata | `extraction_metadata` | `COLLECTION_EXTRACTION_METADATA` | Invoice metadata |
| Parts | `extraction_parts` | `COLLECTION_EXTRACTION_PARTS` | Extracted line items |

### 6. Run the Application

Development mode:

```bash
npm run dev
```

This starts:
- Backend server on http://localhost:3001
- Frontend development server on http://localhost:3000

Production build:

```bash
npm run build
npm start
```

## Project Structure

```
invoice_reconcilation_web/
├── api/                    # Backend API
│   ├── config/            # Configuration and constants
│   ├── routes/            # Express route handlers
│   ├── services/          # Business logic and Firestore services
│   └── utils/             # Utility functions
├── src/                    # Frontend React application
│   ├── components/        # React components
│   ├── pages/            # Page components
│   ├── services/         # API client services
│   ├── store/            # Redux store and slices
│   ├── hooks/            # Custom React hooks
│   └── types/            # TypeScript type definitions
├── server.js              # Express server entry point
└── vite.config.ts         # Vite configuration
```

## Multi-Environment Deployment

To deploy to different customer environments:

1. **Create environment-specific `.env` file**:
   ```bash
   cp .env.example .env.customer1
   ```

2. **Update collection names** (if different):
   ```bash
   COLLECTION_VENDORS=customer1_vendors
   COLLECTION_RECONCILIATIONS=customer1_reconciliations
   # ... etc
   ```

3. **Update project configuration**:
   ```bash
   GOOGLE_CLOUD_PROJECT=customer1-project-id
   GCP_PROJECT_ID=customer1-project-id
   STORAGE_BUCKET_NAME=customer1-invoices
   ```

4. **Run with specific environment**:
   ```bash
   # Load specific environment file
   cp .env.customer1 .env.local
   npm run dev
   ```

## API Endpoints

### Vendors
- `GET /api/vendors` - List all vendors
- `GET /api/vendors/:id` - Get vendor by ID
- `POST /api/vendors` - Create vendor
- `PUT /api/vendors/:id` - Update vendor
- `DELETE /api/vendors/:id` - Delete vendor

### Reconciliations
- `GET /api/reconciliations` - List reconciliations
- `GET /api/reconciliations/:id` - Get reconciliation by ID
- `GET /api/reconciliations/invoice/:invoiceId` - Get by invoice ID
- `POST /api/reconciliations/:id/approve` - Approve reconciliation
- `POST /api/reconciliations/:id/reject` - Reject reconciliation

### Extraction
- `GET /api/extraction/parts/:extractionId` - Get extracted line items

### Status
- `GET /api/status/extraction/:extractionId` - Get reconciliation status by extraction ID
- `GET /api/status/run/:runId` - Get status by run ID

### Upload
- `POST /api/upload` - Upload invoice file

## Development

### Commands

```bash
# Development with hot reload
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Type checking
npm run type-check

# Linting
npm run lint

# Run specific servers
npm run dev:server    # Backend only
npm run dev:client    # Frontend only
```

### Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Redux Toolkit, Tailwind CSS
- **Backend**: Node.js, Express, Google Cloud Firestore
- **Authentication**: Google Application Default Credentials (ADC)
- **Build Tools**: Vite, TypeScript

## Troubleshooting

### Authentication Issues

If you encounter authentication errors:

1. Ensure ADC is set up:
   ```bash
   gcloud auth application-default login
   ```

2. Verify project is set:
   ```bash
   gcloud config get-value project
   ```

3. Check Firestore API is enabled:
   ```bash
   gcloud services enable firestore.googleapis.com
   ```

### Collection Not Found

If collections are not found:

1. Verify collection names in Firestore Console
2. Check environment variables are loaded correctly
3. Ensure `.env.local` exists and contains correct values

### Port Conflicts

If port 3000 or 3001 is in use:

1. Change port in `.env.local`:
   ```bash
   PORT=3002
   ```

2. For Vite dev server, update `vite.config.ts`



## Additional Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture and design principles
- [APPENDIX.md](./APPENDIX.md) - Technical reference including API docs, Firestore schema, and field mappings

