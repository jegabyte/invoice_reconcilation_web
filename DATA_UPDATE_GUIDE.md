# Data Update Guide

Quick reference for adding/modifying fields in different screens. Each section shows the files to update when changing Firestore data.

## Invoice Dashboard (List Page)

**To add/modify fields:**
1. `/src/types/api.types.ts` - Update `InvoiceReconciliationSummary` interface
2. `/src/pages/invoices/InvoicesPage.tsx` - Add column in table (line ~140-180)
3. `/api/services/reconciliation.service.js` - Update `transformSummary()` method
4. `/src/services/api/reconciliation.api.service.ts` - Update transformation if needed

## Invoice Details Page

**Extraction Results:**
1. `/src/types/api.types.ts` - Update extraction-related interfaces
2. `/src/pages/invoices/InvoiceDetailPage.tsx` - Update table columns (line ~420-480)
3. `/api/routes/extraction.js` - Modify data fetching/transformation
4. `/api/services/extraction.service.js` - Update service methods

**Reconciliation Results:**
1. `/src/types/api.types.ts` - Update `ReconciliationStatus` interface
2. `/src/pages/invoices/InvoiceDetailPage.tsx` - Update table columns (line ~520-580)
3. `/api/routes/status.js` - Modify endpoints
4. `/api/services/status.service.js` - Update `transformStatus()` method

## Vendors Page

**To add/modify fields:**
1. `/src/types/api.types.ts` - Update `VendorConfiguration` interface
2. `/src/pages/vendors/VendorsPage.tsx` - Add table column (line ~200-220)
3. `/src/pages/vendors/AddVendorModal.tsx` - Add form field
4. `/api/services/vendor.service.js` - Update `transformVendor()` method
5. `/api/routes/vendors.js` - Update validation if needed

## Rules Page

**To add/modify fields:**
1. `/src/types/api.types.ts` - Update `ReconciliationRule` interface
2. `/src/pages/rules/RulesPage.tsx` - Add table column (line ~180-210)
3. `/src/components/rules/AddRuleModal.tsx` - Add form field
4. `/api/services/rule.service.js` - Update `transformRule()` method
5. `/api/routes/rules.js` - Update validation

## Common Steps for All Updates

1. **Backend API:**
   - Update service transformation methods
   - Modify route handlers if needed
   - Update Firestore query fields

2. **Frontend:**
   - Update TypeScript interfaces
   - Add table columns
   - Update form fields in modals
   - Update API service methods

3. **Environment Variables:**
   - Collection names: `/api/config/constants.js`
   - Update `.env.local` if adding new collections

## Quick Examples

### Add Status Badge to Invoice List:
```typescript
// 1. In InvoicesPage.tsx table header:
<th>Processing Status</th>

// 2. In table body:
<td>
  <span className={`badge ${getStatusColor(invoice.processingStatus)}`}>
    {invoice.processingStatus}
  </span>
</td>

// 3. In api.types.ts:
processingStatus?: 'pending' | 'processing' | 'completed' | 'failed';
```

### Add Field to Vendor:
```typescript
// 1. In VendorConfiguration interface:
companyRegistration?: string;

// 2. In AddVendorModal.tsx:
<input
  type="text"
  value={formData.companyRegistration}
  onChange={(e) => handleChange('companyRegistration', e.target.value)}
/>

// 3. In vendor.service.js transformVendor():
companyRegistration: data.company_registration || data.companyRegistration
```

## Testing Checklist

- [ ] TypeScript interfaces updated
- [ ] Table displays new field
- [ ] Form can edit/save field
- [ ] API returns field data
- [ ] Firestore query includes field
- [ ] No console errors