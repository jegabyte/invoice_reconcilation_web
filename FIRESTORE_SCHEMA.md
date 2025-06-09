# Firestore Database Schema

This document describes the Firestore database structure for the Invoice Reconciliation System.

## Collections

### 1. `users`
User profiles and authentication data.

```typescript
{
  id: string,
  email: string,
  displayName: string,
  photoURL?: string,
  phoneNumber?: string,
  role: 'ADMIN' | 'MANAGER' | 'OPERATOR' | 'VIEWER' | 'VENDOR',
  permissions: {
    invoices: { create, read, update, delete, approve },
    rules: { create, read, update, delete },
    vendors: { create, read, update, delete },
    disputes: { create, read, update, delete, resolve },
    reports: { view, export, schedule },
    system: { configureSettings, manageUsers, viewAuditLogs }
  },
  vendorAccess?: {
    vendorIds: string[],
    restrictToVendor: boolean
  },
  preferences: { /* user preferences */ },
  activity: { /* login and action history */ },
  metadata: {
    createdAt: Timestamp,
    lastModified: Timestamp,
    isActive: boolean
  }
}
```

### 2. `vendors`
Vendor/partner information and configuration.

```typescript
{
  id: string,
  vendorCode: string, // Unique identifier (e.g., 'EXPEDIA')
  vendorName: string,
  vendorType: 'OTA' | 'DIRECT' | 'CHANNEL_MANAGER' | 'GDS' | 'OTHER',
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED',
  businessModel: {
    type: 'NET_RATE' | 'COMMISSION' | 'SELL_RATE' | 'PROFIT_SHARING' | 'MIXED',
    defaultCommissionPercentage?: number,
    defaultMarkupPercentage?: number,
    profitSharePercentage?: number,
    paymentTermsDays: number,
    currency: string
  },
  integration: {
    apiEnabled: boolean,
    apiEndpoint?: string,
    invoiceFormat: 'PDF' | 'EXCEL' | 'CSV' | 'XML' | 'JSON' | 'API',
    invoiceDelivery: 'EMAIL' | 'FTP' | 'API' | 'PORTAL' | 'MANUAL',
    fieldMappings: { [key: string]: string[] }
  },
  contract: {
    contractNumber: string,
    startDate: Timestamp,
    endDate: Timestamp,
    autoRenew: boolean,
    terms: string
  },
  contacts: [{
    type: 'PRIMARY' | 'BILLING' | 'TECHNICAL' | 'ESCALATION',
    name: string,
    email: string,
    phone?: string,
    timezone?: string
  }],
  processingConfig: {
    autoProcess: boolean,
    processingSchedule?: string,
    validationRuleSet: string,
    requiresManualApproval: boolean,
    approvalThreshold?: number,
    duplicateCheckDays: number,
    dateToleranceDays: number,
    amountTolerancePercentage: number
  },
  statistics: {
    totalInvoices: number,
    totalAmount: number,
    lastInvoiceDate: Timestamp,
    averageProcessingTime: number,
    disputeRate: number,
    validationPassRate: number
  },
  metadata: {
    createdAt: Timestamp,
    createdBy: string,
    lastModified: Timestamp,
    modifiedBy: string,
    tags: string[]
  }
}
```

### 3. `invoices`
Invoice header information.

```typescript
{
  id: string,
  invoiceNumber: string, // Internal invoice number
  vendorId: string,
  vendorName?: string, // Denormalized for display
  vendorInvoiceNumber: string, // Vendor's invoice number
  invoiceDate: Timestamp,
  periodStart: Timestamp,
  periodEnd: Timestamp,
  receivedDate: Timestamp,
  dueDate: Timestamp,
  financial: {
    currency: string,
    subtotal: number,
    taxAmount: number,
    totalAmount: number,
    commissionAmount?: number,
    netAmount?: number,
    calculatedTotal?: number,
    variance?: number,
    variancePercentage?: number
  },
  status: 'PENDING' | 'EXTRACTING' | 'EXTRACTED' | 'VALIDATING' | 
          'VALIDATED' | 'DISPUTED' | 'APPROVED' | 'REJECTED' | 'PAID' | 'CANCELLED',
  processingStatus: {
    stage: 'UPLOAD' | 'EXTRACTION' | 'VALIDATION' | 'RECONCILIATION' | 'COMPLETE',
    progress: number,
    startTime: Timestamp,
    lastUpdateTime: Timestamp,
    estimatedCompletion?: Timestamp,
    extraction: {
      status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED',
      attempts: number,
      confidence: number,
      warnings: string[],
      errors: string[]
    },
    validation: {
      status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED',
      rulesApplied: number,
      rulesPassed: number,
      rulesFailed: number,
      warnings: number
    }
  },
  files: {
    originalFile: {
      gcsPath: string,
      fileName: string,
      fileType: string,
      fileSize: number,
      uploadedAt: Timestamp,
      uploadedBy: string
    },
    processedFiles?: [{
      type: 'EXTRACTED_JSON' | 'VALIDATION_REPORT' | 'RECONCILIATION_REPORT',
      gcsPath: string,
      createdAt: Timestamp
    }]
  },
  summary: {
    totalLineItems: number,
    validatedLineItems: number,
    disputedLineItems: number,
    totalBookings: number,
    uniqueProperties: number,
    dateRange: {
      earliest: Timestamp,
      latest: Timestamp
    }
  },
  audit: {
    createdAt: Timestamp,
    createdBy: string,
    lastModified: Timestamp,
    modifiedBy: string,
    approvedAt?: Timestamp,
    approvedBy?: string,
    rejectedAt?: Timestamp,
    rejectedBy?: string,
    history: [{
      timestamp: Timestamp,
      userId: string,
      action: string,
      details?: any
    }]
  },
  metadata: {
    source: 'MANUAL_UPLOAD' | 'EMAIL' | 'API' | 'FTP' | 'AUTO_FETCH' | 'PORTAL',
    ipAddress?: string,
    userAgent?: string,
    processingJobId?: string,
    tags: string[],
    customFields?: { [key: string]: any }
  }
}
```

### 4. `line_items`
Individual invoice line items (bookings).

```typescript
{
  id: string,
  invoiceId: string,
  vendorId: string,
  booking: {
    confirmationNumber: string,
    vendorBookingRef: string,
    omsBookingRef?: string,
    guestName: string,
    guestEmail?: string,
    propertyId: string,
    propertyName: string,
    roomType: string,
    roomCount: number,
    checkInDate: Timestamp,
    checkOutDate: Timestamp,
    bookingDate: Timestamp,
    cancellationDate?: Timestamp,
    status: 'CONFIRMED' | 'CANCELLED' | 'NO_SHOW' | 'MODIFIED'
  },
  financial: {
    currency: string,
    roomRate: number,
    nights: number,
    subtotal: number,
    taxes: number,
    fees: number,
    totalAmount: number,
    commissionPercentage?: number,
    commissionAmount?: number,
    netAmount?: number,
    omsAmount?: number,
    variance?: number,
    variancePercentage?: number
  },
  validation: {
    status: 'PENDING' | 'PASSED' | 'WARNING' | 'FAILED' | 'DISPUTED',
    rulesApplied: [{
      ruleId: string,
      ruleName: string,
      ruleType: 'HARD' | 'SOFT',
      result: 'PASSED' | 'FAILED' | 'WARNING' | 'SKIPPED',
      message?: string,
      evidence?: { /* validation details */ }
    }],
    issues: [{
      type: string,
      severity: 'ERROR' | 'WARNING' | 'INFO',
      description: string,
      field?: string,
      expectedValue?: any,
      actualValue?: any
    }],
    matchConfidence: number,
    omsData?: {
      found: boolean,
      reservationId?: string,
      matchedAt?: Timestamp,
      data?: { /* OMS booking data */ }
    }
  },
  metadata: {
    lineNumber: number,
    extractedAt: Timestamp,
    validatedAt?: Timestamp,
    lastModified: Timestamp,
    manuallyReviewed: boolean,
    reviewedBy?: string,
    reviewNotes?: string
  }
}
```

### 5. `validation_rules`
Configurable validation rules.

```typescript
{
  id: string,
  ruleId: string, // Unique rule identifier
  ruleName: string,
  description: string,
  category: 'FINANCIAL' | 'BOOKING' | 'DATE' | 'DUPLICATE' | 'PROPERTY' | 'CUSTOM',
  vendorCode: string, // Specific vendor or '*' for global
  entityType: 'INVOICE' | 'LINE_ITEM',
  ruleType: 'HARD' | 'SOFT',
  priority: number, // 1-100, lower number = higher priority
  version: string,
  isActive: boolean,
  businessModel?: {
    type: 'NET_RATE' | 'COMMISSION' | 'SELL_RATE' | 'PROFIT_SHARING' | '*',
    commissionPercentage?: number,
    markupPercentage?: number,
    profitPercentage?: number,
    calculationBase?: 'GROSS' | 'NET' | 'ROOM_RATE'
  },
  effectiveFrom: Timestamp,
  effectiveTo?: Timestamp,
  conditions: [{
    type: 'STRING_MATCH' | 'NUMERIC_COMPARISON' | 'DATE_COMPARISON' | 
          'BOOKING_MATCH' | 'PROPERTY_MAPPING' | 'DUPLICATE_CHECK' | 
          'COMMISSION_VALIDATION' | 'TAX_VALIDATION' | 'CUSTOM' |
          'EXACT_MATCH' | 'FUZZY_MATCH' | 'STATUS_CHECK',
    operator: 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' |
              'CONTAINS' | 'STARTS_WITH' | 'ENDS_WITH' | 'MATCHES_PATTERN' |
              'IN_RANGE' | 'NOT_IN_RANGE' | 'WITHIN_DAYS',
    invoiceField: string,
    omsField?: string,
    value?: any,
    configuration?: {
      /* Various configuration options based on condition type */
    }
  }],
  actions: {
    onMatch: string, // Action type
    onMismatch: string,
    onMatchConfig?: { /* Action configuration */ },
    onMismatchConfig?: { /* Action configuration */ }
  },
  metrics: {
    executionCount: number,
    passCount: number,
    failCount: number,
    averageExecutionTimeMs: number,
    lastExecuted?: Timestamp,
    errorRate: number
  },
  metadata: {
    createdAt: Timestamp,
    createdBy: string,
    lastModified: Timestamp,
    modifiedBy: string,
    tags: string[],
    documentation?: string
  }
}
```

### 6. `validation_results`
Detailed validation results for line items.

```typescript
{
  id: string,
  lineItemId: string,
  invoiceId: string,
  ruleId: string,
  ruleName: string,
  ruleType: 'HARD' | 'SOFT',
  passed: boolean,
  evidence: {
    ruleId: string,
    ruleName: string,
    ruleType: 'HARD' | 'SOFT',
    field: string,
    operator: string,
    expectedValue: any,
    actualValue: any,
    passed: boolean,
    severity: 'ERROR' | 'WARNING' | 'INFO',
    message: string,
    details?: string,
    timestamp: Timestamp
  },
  createdAt: Timestamp
}
```

## Indexes

### Recommended Composite Indexes

1. **invoices**
   - `vendorId` + `status` + `invoiceDate` (DESC)
   - `status` + `processingStatus.stage` + `createdAt` (DESC)

2. **line_items**
   - `invoiceId` + `validation.status`
   - `vendorId` + `booking.checkInDate` (DESC)

3. **validation_rules**
   - `vendorCode` + `entityType` + `isActive` + `priority` (ASC)
   - `category` + `isActive` + `priority` (ASC)

4. **validation_results**
   - `lineItemId` + `passed` + `createdAt` (DESC)
   - `invoiceId` + `ruleType` + `passed`

## Security Rules

```javascript
// Example security rules structure
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read their own profile
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && 
                      request.auth.uid == userId && 
                      request.resource.data.role == resource.data.role; // Can't change own role
    }
    
    // Vendors - based on permissions
    match /vendors/{vendorId} {
      allow read: if request.auth != null && 
                     (hasPermission('vendors', 'read') || 
                      canAccessVendor(vendorId));
      allow write: if request.auth != null && 
                      hasPermission('vendors', request.method);
    }
    
    // Invoices - based on vendor access
    match /invoices/{invoiceId} {
      allow read: if request.auth != null && 
                     (hasPermission('invoices', 'read') && 
                      canAccessInvoiceVendor(invoiceId));
      allow write: if request.auth != null && 
                      hasPermission('invoices', request.method);
    }
    
    // Helper functions
    function hasPermission(resource, action) {
      return request.auth.token.permissions[resource][action] == true;
    }
    
    function canAccessVendor(vendorId) {
      return !request.auth.token.vendorAccess.restrictToVendor || 
             vendorId in request.auth.token.vendorAccess.vendorIds;
    }
  }
}
```

## Migration from Mock to Firestore

To migrate from the mock data service to Firestore:

1. **Update ServiceFactory**: Change `AppConfig.features.useMockData` to `false`
2. **Initialize Collections**: Run migration scripts to populate initial data
3. **Update Environment**: Add Firebase configuration to environment variables
4. **Test Permissions**: Verify security rules work as expected
5. **Monitor Performance**: Check query performance and add indexes as needed