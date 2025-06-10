# Invoice Reconciliation API Documentation

## Base URL
```
Development: http://localhost:3001/api
Production: https://your-api-domain.com/api
```

## Authentication
All API requests should include:
```
Authorization: Bearer <token>
Content-Type: application/json
```

## API Endpoints

### 1. Vendor Configurations

#### GET /vendors
Get all vendor configurations
```json
Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "vendor_001",
      "vendorCode": "VEN001",
      "vendorName": "Example Vendor",
      "vendorType": "OTA",
      "isActive": true,
      "businessModel": "COMMISSION",
      "integrationSettings": {
        "apiEndpoint": "https://api.vendor.com",
        "apiKey": "encrypted_key",
        "ftpDetails": null,
        "emailSettings": {
          "incomingEmail": "invoices@vendor.com",
          "supportEmail": "support@vendor.com"
        }
      },
      "invoiceSettings": {
        "defaultCurrency": "USD",
        "invoicePrefix": "INV",
        "dueDays": 30,
        "paymentTerms": "Net 30",
        "taxRate": 10
      },
      "extractionSettings": {
        "templateId": "template_001",
        "dateFormat": "MM/DD/YYYY",
        "numberFormat": "en-US",
        "customFields": []
      },
      "reconciliationSettings": {
        "autoReconcile": true,
        "matchingThreshold": 95,
        "defaultRules": ["rule_001", "rule_002"],
        "bookingSourceField": "booking_reference",
        "amountTolerancePercentage": 1
      },
      "contacts": [
        {
          "name": "John Doe",
          "email": "john@vendor.com",
          "phone": "+1234567890",
          "role": "Finance Manager",
          "isPrimary": true
        }
      ],
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-20T15:30:00Z"
    }
  ],
  "total": 1
}
```

#### GET /vendors/:id
Get vendor by ID

#### POST /vendors
Create new vendor
```json
Request Body:
{
  "vendorCode": "VEN002",
  "vendorName": "New Vendor",
  "vendorType": "DIRECT",
  "businessModel": "NET_RATE",
  // ... other fields
}

Response: 201 Created
{
  "success": true,
  "data": { /* vendor object */ },
  "message": "Vendor created successfully"
}
```

#### PUT /vendors/:id
Update vendor

#### DELETE /vendors/:id
Delete vendor

### 2. Extraction Results

#### GET /extractions
Get extraction results with filters
```
Query Parameters:
- vendorId: string
- status: PENDING | COMPLETED | FAILED | REVIEW_REQUIRED
- startDate: ISO date string
- endDate: ISO date string
- page: number (default: 1)
- limit: number (default: 20)
```

```json
Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "ext_001",
      "invoiceId": "inv_001",
      "vendorId": "vendor_001",
      "vendorName": "Example Vendor",
      "invoiceNumber": "INV-2024-001",
      "invoiceDate": "2024-01-15T00:00:00Z",
      "dueDate": "2024-02-14T00:00:00Z",
      "totalAmount": 5000.00,
      "currency": "USD",
      "extractedData": {
        "headerInfo": {
          "invoiceNumber": "INV-2024-001",
          "vendorAddress": "123 Vendor St",
          "customerName": "Your Company"
        },
        "lineItems": [
          {
            "lineNumber": 1,
            "description": "Hotel Booking - Hilton NYC",
            "quantity": 2,
            "unitPrice": 250.00,
            "amount": 500.00,
            "bookingReference": "BK123456",
            "checkInDate": "2024-01-20T00:00:00Z",
            "checkOutDate": "2024-01-22T00:00:00Z",
            "guestName": "John Smith",
            "propertyName": "Hilton New York",
            "roomType": "Deluxe Double"
          }
        ],
        "summary": {
          "subtotal": 4500.00,
          "tax": 450.00,
          "fees": 50.00,
          "total": 5000.00
        }
      },
      "extractionMethod": "OCR",
      "confidence": 0.95,
      "status": "COMPLETED",
      "errors": [],
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:05:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

#### GET /extractions/:id
Get extraction by ID

#### POST /extractions
Create new extraction (for manual entry or file upload)

#### PUT /extractions/:id
Update extraction result

### 3. Reconciliation Summaries

#### GET /reconciliation-summaries
Get reconciliation summaries
```json
Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "recon_001",
      "invoiceId": "inv_001",
      "vendorId": "vendor_001",
      "reconciliationDate": "2024-01-16T00:00:00Z",
      "totalInvoiceAmount": 5000.00,
      "totalReconciledAmount": 4950.00,
      "variance": 50.00,
      "variancePercentage": 1.0,
      "status": "PARTIAL_MATCH",
      "matchedLineItems": 9,
      "unmatchedLineItems": 1,
      "totalLineItems": 10,
      "issues": [
        {
          "type": "AMOUNT_MISMATCH",
          "severity": "LOW",
          "description": "Invoice amount differs from system amount by $50",
          "lineItemRef": "line_005",
          "expectedValue": 500.00,
          "actualValue": 450.00,
          "variance": 50.00
        }
      ],
      "approvalStatus": "PENDING",
      "approvedBy": null,
      "approvalDate": null,
      "notes": "Minor variance within acceptable threshold",
      "createdAt": "2024-01-16T10:00:00Z",
      "updatedAt": "2024-01-16T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

#### GET /reconciliation-summaries/:id
Get reconciliation summary by ID

#### POST /reconciliation-summaries
Create reconciliation summary

#### PUT /reconciliation-summaries/:id/approve
Approve reconciliation

#### PUT /reconciliation-summaries/:id/reject
Reject reconciliation

### 4. Reconciliation Rules

#### GET /rules
Get all reconciliation rules
```json
Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "rule_001",
      "vendorId": "vendor_001",
      "ruleName": "Amount Tolerance Check",
      "description": "Check if invoice amount is within 1% tolerance",
      "ruleType": "VALIDATION",
      "category": "FINANCIAL",
      "isActive": true,
      "priority": 1,
      "conditions": [
        {
          "field": "amount_variance_percentage",
          "operator": "LESS_THAN",
          "value": 1,
          "dataType": "NUMBER"
        }
      ],
      "actions": [
        {
          "type": "AUTO_APPROVE",
          "parameters": {
            "reason": "Within tolerance"
          }
        }
      ],
      "tolerance": {
        "type": "PERCENTAGE",
        "value": 1
      },
      "effectiveFrom": "2024-01-01T00:00:00Z",
      "effectiveTo": null,
      "createdBy": "admin",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z",
      "lastUsed": "2024-01-16T10:00:00Z",
      "usageCount": 150
    }
  ],
  "total": 10
}
```

#### GET /rules/:id
Get rule by ID

#### POST /rules
Create new rule

#### PUT /rules/:id
Update rule

#### DELETE /rules/:id
Delete rule

### 5. Reconciliation Status

#### GET /reconciliation-status/:invoiceId
Get reconciliation status for an invoice
```json
Response: 200 OK
{
  "success": true,
  "data": {
    "id": "status_001",
    "invoiceId": "inv_001",
    "vendorId": "vendor_001",
    "currentStage": "RECONCILING",
    "overallStatus": "IN_PROGRESS",
    "startedAt": "2024-01-16T10:00:00Z",
    "completedAt": null,
    "progress": {
      "extraction": {
        "status": "COMPLETED",
        "percentage": 100,
        "startTime": "2024-01-16T10:00:00Z",
        "endTime": "2024-01-16T10:05:00Z",
        "message": "Extraction completed successfully"
      },
      "validation": {
        "status": "COMPLETED",
        "percentage": 100,
        "startTime": "2024-01-16T10:05:00Z",
        "endTime": "2024-01-16T10:10:00Z",
        "message": "Validation passed"
      },
      "reconciliation": {
        "status": "IN_PROGRESS",
        "percentage": 60,
        "startTime": "2024-01-16T10:10:00Z",
        "endTime": null,
        "message": "Matching line items..."
      }
    },
    "errors": [],
    "warnings": [
      {
        "code": "W001",
        "message": "Minor amount variance detected",
        "timestamp": "2024-01-16T10:12:00Z",
        "details": {
          "variance": 50.00
        }
      }
    ],
    "metadata": {
      "processedBy": "system",
      "rulesApplied": ["rule_001", "rule_002"]
    },
    "lastUpdated": "2024-01-16T10:12:00Z"
  }
}
```

#### PUT /reconciliation-status/:invoiceId
Update reconciliation status

### 6. Statistics & Dashboard

#### GET /statistics
Get dashboard statistics
```json
Response: 200 OK
{
  "success": true,
  "data": {
    "activeVendors": 15,
    "totalExtractions": 1250,
    "totalReconciliations": 1200,
    "totalInvoiceAmount": 2500000.00,
    "totalReconciledAmount": 2450000.00,
    "averageVariance": 0.5,
    "pendingInvoices": 50,
    "disputedInvoices": 10,
    "successRate": 96.5,
    "monthlyTrend": [
      {
        "month": "2024-01",
        "invoices": 150,
        "amount": 300000,
        "reconciled": 145
      }
    ]
  }
}
```

### Error Responses

All endpoints return consistent error responses:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Vendor code already exists",
    "details": {
      "field": "vendorCode",
      "value": "VEN001"
    }
  }
}
```

Error Codes:
- VALIDATION_ERROR
- NOT_FOUND
- UNAUTHORIZED
- FORBIDDEN
- INTERNAL_ERROR
- DUPLICATE_ENTRY