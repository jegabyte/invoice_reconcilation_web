# Technical Appendix

This document consolidates technical information about the invoice reconciliation system.

## Table of Contents

1. [API Documentation](#api-documentation)
2. [Firestore Schema](#firestore-schema)
3. [Field Mapping Guide](#field-mapping-guide)
4. [Date/Timestamp Conversion](#datetimestamp-conversion)

---

## API Documentation

### Base URL
- Development: `http://localhost:3001/api`
- Production: `/api`

### Authentication
The API uses Google Application Default Credentials (ADC) for backend authentication. No API keys are required.

### Endpoints

#### Vendors API

**List Vendors**
```http
GET /api/vendors
```
Response:
```json
[
  {
    "id": "vendor123",
    "vendorCode": "AGO",
    "vendorName": "Agoda",
    "vendorType": "OTA",
    "isActive": true
  }
]
```

**Get Vendor by ID**
```http
GET /api/vendors/:id
```

**Create Vendor**
```http
POST /api/vendors
Content-Type: application/json

{
  "vendorCode": "NEW",
  "vendorName": "New Vendor",
  "vendorType": "OTA",
  "isActive": true
}
```

#### Reconciliations API

**List Reconciliations**
```http
GET /api/reconciliations
```

**Get Reconciliation by ID**
```http
GET /api/reconciliations/:id
```

**Approve Reconciliation**
```http
POST /api/reconciliations/:id/approve
Content-Type: application/json

{
  "approvedBy": "user@example.com",
  "notes": "Approved after review"
}
```

#### Extraction API

**Get Extraction Parts**
```http
GET /api/extraction/parts/:extractionId
```
Response:
```json
{
  "extraction_id": "EXT-20250619184548",
  "line_items": [
    {
      "line_item_id": "LI-001",
      "booking_id": "1128135680133033",
      "hotel_name": "Hotel Name",
      "amount": 1137.87,
      "currency": "USD"
    }
  ],
  "total_items": 100
}
```

#### Status API

**Get Status by Extraction ID**
```http
GET /api/status/extraction/:extractionId
```

---

## Firestore Schema

### Collections Overview

| Collection | Document ID | Purpose |
|------------|------------|---------|
| `vendor_configurations` | Auto-generated | Vendor settings and configuration |
| `extractionResults` | Extraction ID | Raw extraction data |
| `invoice_reconciliation_summaries` | Run ID | Reconciliation summary data |
| `reconciliation_rules` | Auto-generated | Vendor-specific validation rules |
| `reconciliation_status` | Auto-generated | Line item reconciliation status |
| `extraction_metadata` | Extraction ID | Invoice metadata |
| `extraction_parts` | Auto-generated | Extracted line items |

### Document Structures

#### vendor_configurations
```json
{
  "vendorCode": "AGO",
  "vendorName": "Agoda",
  "vendorType": "OTA",
  "isActive": true,
  "contactEmail": "contact@vendor.com",
  "apiEndpoint": "https://api.vendor.com",
  "settings": {
    "autoApprove": false,
    "approvalThreshold": 0.05
  },
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

#### invoice_reconciliation_summaries
```json
{
  "extraction_id": "EXT-20250619184548",
  "vendor_name": "Ctrip",
  "invoice_number": "202501271305599",
  "invoice_date": "2025-01-27",
  "payment_due_date": "2025-02-05",
  "total_invoice_amount": 50000.00,
  "total_oms_amount": 49500.00,
  "difference_amount": 500.00,
  "total_line_items": 100,
  "status_summary": {
    "MATCHED": 85,
    "DISPUTED": 10,
    "HOLD_PENDING_REVIEW": 5
  },
  "dispute_type_summary": {
    "BOOKING_NOT_FOUND": 5,
    "AMOUNT_MISMATCH": 3,
    "DATE_MISMATCH": 2
  },
  "processing_status": "COMPLETED",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### extraction_parts
```json
{
  "extraction_id": "EXT-20250619184548",
  "invoice": {
    "line_items": [
      {
        "line_item_id": "LI-001",
        "booking_id": "1128135680133033",
        "vendor_booking_id": "173332666107030452",
        "hotel_name": "Hotel Name",
        "check_in_date": "2025-01-17",
        "check_out_date": "2025-01-20",
        "room_nights": "3",
        "amount": 1137.87,
        "commission": 85.65,
        "currency": "USD",
        "country": "Thailand",
        "booking_date": "2024-12-04",
        "description": "Accommodation"
      }
    ]
  },
  "created_at": "2024-01-15T10:30:00Z"
}
```

#### reconciliation_status
```json
{
  "extraction_id": "EXT-20250619184548",
  "run_id": "RUN-123456",
  "line_item_id": "LI-001",
  "booking_id": "1128135680133033",
  "vendor_name": "Ctrip",
  "invoice_number": "202501271305599",
  "hotel_name": "Hotel Name",
  "status": "MATCHED",
  "dispute_type": null,
  "invoice_data": {
    "amount": 1137.87,
    "check_in_date": "2025-01-17",
    "check_out_date": "2025-01-20"
  },
  "oms_data": {
    "amount": 1137.87,
    "check_in_date": "2025-01-17",
    "check_out_date": "2025-01-20"
  },
  "rules_applied": [
    {
      "rule_id": "amount_match",
      "passed": true
    }
  ],
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

## Field Mapping Guide

### When to Update Field Mappings

Field mappings need to be updated when:
1. Firestore collection field names change
2. UI display requirements change
3. New fields are added to collections

### Key Mapping Locations

#### 1. Backend API Mappings

**File**: `/api/routes/reconciliations.js`
- `mapFirestoreToApi()` function - Maps Firestore document fields to API response format

**File**: `/api/routes/status.js`
- Maps reconciliation_status collection fields to API format

#### 2. Frontend Type Definitions

**File**: `/src/types/api.types.ts`
- Define TypeScript interfaces for all data structures
- Keep in sync with backend mappings

#### 3. Frontend Components

**File**: `/src/pages/invoices/InvoiceDetailPage.tsx`
- Maps API response fields to UI display
- Handles both camelCase and snake_case field names

### Common Field Mapping Patterns

1. **Snake_case to camelCase**:
   ```javascript
   invoiceNumber: data.invoice_number
   ```

2. **Nested field access**:
   ```javascript
   amount: data.invoice_data?.amount || 0
   ```

3. **Field renaming**:
   ```javascript
   vendorId: data.vendor_name?.toLowerCase().replace(/\s+/g, '_')
   ```

---

## Date/Timestamp Conversion

### Firestore Timestamp Handling

Firestore uses its own Timestamp type. The application automatically converts these to ISO strings in API responses.

**Backend Conversion** (in `BaseFirestoreService`):
```javascript
static convertTimestamps(data) {
  Object.keys(data).forEach(key => {
    if (data[key] && data[key]._seconds !== undefined) {
      data[key] = new Date(data[key]._seconds * 1000).toISOString();
    }
  });
  return data;
}
```

**Frontend Display**:
```javascript
// Format date for display
new Date(dateString).toLocaleDateString('en-US', { 
  month: 'short', 
  day: 'numeric', 
  year: 'numeric' 
})
```

### Best Practices

1. Always store dates as Firestore Timestamps in the database
2. Convert to ISO strings in API responses
3. Use consistent date formatting in the UI
4. Handle timezone considerations based on business requirements