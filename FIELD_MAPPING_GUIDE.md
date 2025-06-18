# Field Mapping Guide

This guide explains how to update field mappings when there are changes to Firestore collection fields or UI display requirements.

## Overview

The application has a clean separation between backend (Firestore) and frontend (React), making field changes straightforward to implement.

## Architecture Flow

```
Firestore Collections → Backend API (server.js) → Frontend Services → React Components
```

## Step-by-Step Guide for Field Changes

### 1. Backend: Update Firestore Collection Mapping

**File:** `api/services/firestore.service.js`

First, ensure the collection names match your Firestore:

```javascript
const COLLECTIONS = {
  VENDORS: 'vendorConfigurations',        // Your vendors collection
  EXTRACTIONS: 'extractionResults',       // Your extractions collection  
  RECONCILIATIONS: 'invoiceReconciliationSummaries', // Your reconciliations collection
  RULES: 'reconciliationRules',           // Your rules collection
  STATUS: 'reconciliationStatus'          // Your status collection
};
```

### 2. Update TypeScript Types

**File:** `src/types/api.types.ts`

Update the interfaces to match your Firestore document structure:

```typescript
// Example: Adding a new field to InvoiceReconciliationSummary
export interface InvoiceReconciliationSummary {
    id?: string;
    invoiceId: string;
    vendorId: string;
    reconciliationDate: string;
    totalInvoiceAmount: number;
    totalReconciledAmount: number;
    variance: number;
    variancePercentage: number;
    status: 'MATCHED' | 'MISMATCHED' | 'PARTIAL_MATCH' | 'PENDING' | 'DISPUTED';
    // Add new fields here
    newFieldName?: string;  // Add your new field
    // ... rest of the fields
}
```

### 3. Update API Routes (if needed)

**Files:** `api/routes/*.js`

If you need to add special handling for new fields:

```javascript
// Example in api/routes/reconciliations.js
router.get('/', async (req, res) => {
    try {
        const data = await firestoreService.getAll('RECONCILIATIONS');
        // Add any field transformations here
        const transformed = data.map(item => ({
            ...item,
            // Transform fields if needed
            displayName: item.vendorName || 'Unknown'
        }));
        res.json(transformed);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
```

### 4. Update React Components

**Files to check:**
- `src/pages/invoices/InvoicesPage.tsx` - Main invoice list
- `src/pages/invoices/InvoiceDetailPage.tsx` - Invoice details
- `src/components/invoices/*.tsx` - Invoice-related components

Example of displaying a new field:

```typescript
// In InvoicesPage.tsx
<td className="px-2 py-1.5 whitespace-nowrap">
    <div className="text-xs text-gray-900">
        {invoice.newFieldName || 'N/A'}
    </div>
</td>
```

## Common Field Change Scenarios

### Scenario 1: Renaming a Field

If Firestore field name changes from `invoiceNumber` to `invoiceCode`:

1. **Update TypeScript types** (`src/types/api.types.ts`):
   ```typescript
   export interface ExtractionResult {
       invoiceCode: string;  // Changed from invoiceNumber
       // ... other fields
   }
   ```

2. **Update component references**:
   ```typescript
   // Before
   {extraction.invoiceNumber}
   // After
   {extraction.invoiceCode}
   ```

### Scenario 2: Adding a New Field

To add a `priority` field to invoices:

1. **Update TypeScript interface**:
   ```typescript
   export interface InvoiceReconciliationSummary {
       // ... existing fields
       priority?: 'HIGH' | 'MEDIUM' | 'LOW';
   }
   ```

2. **Add to display table**:
   ```typescript
   <th>Priority</th>
   // ...
   <td>{invoice.priority || 'MEDIUM'}</td>
   ```

### Scenario 3: Changing Field Type

If `totalAmount` changes from number to object with currency:

1. **Update type**:
   ```typescript
   totalAmount: {
       value: number;
       currency: string;
   };
   ```

2. **Update display logic**:
   ```typescript
   {formatCurrency(invoice.totalAmount.value, invoice.totalAmount.currency)}
   ```

## Field Mapping Reference

### Invoice Fields

| UI Display | Firestore Field | Type | Location |
|------------|----------------|------|----------|
| Invoice ID | invoiceId | string | InvoiceReconciliationSummary |
| Vendor | vendorId → vendorName (lookup) | string | Joined from vendors |
| Date | reconciliationDate | string (ISO) | InvoiceReconciliationSummary |
| Amount | totalInvoiceAmount | number | InvoiceReconciliationSummary |
| Variance | variance | number | InvoiceReconciliationSummary |
| Status | status | enum | InvoiceReconciliationSummary |

### Vendor Fields

| UI Display | Firestore Field | Type | Location |
|------------|----------------|------|----------|
| Vendor Code | vendorCode | string | VendorConfiguration |
| Vendor Name | vendorName | string | VendorConfiguration |
| Type | vendorType | enum | VendorConfiguration |
| Active | isActive | boolean | VendorConfiguration |

## Testing Field Changes

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Check the browser console** for any TypeScript errors

3. **Verify API responses** in Network tab match expected structure

4. **Test CRUD operations** to ensure new fields are saved/loaded correctly

## Troubleshooting

### Common Issues

1. **Field not displaying**: Check if the field exists in TypeScript types
2. **Type errors**: Ensure TypeScript interfaces match API response
3. **Data not saving**: Verify backend route handles the new field
4. **Empty values**: Add default values in component display logic

### Debug Steps

1. Check browser console for errors
2. Inspect API responses in Network tab
3. Verify Firestore document structure in Google Cloud Console
4. Check server logs: `npm run dev` shows backend errors

## Environment-Specific Changes

When deploying to different environments:

1. Update `.env` with correct project ID:
   ```
   GOOGLE_CLOUD_PROJECT=your-project-id
   ```

2. Ensure Firestore collections exist in the target project

3. Verify field names match across environments