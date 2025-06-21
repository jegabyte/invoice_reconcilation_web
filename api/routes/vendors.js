const express = require('express');
const router = express.Router();
const { vendorService, BaseFirestoreService } = require('../services/firestore.service');
const { prepareForFirestore } = require('../utils/firestore-utils');

// Transform Firestore vendor data to match frontend API format
const mapFirestoreToApi = (vendor) => {
  if (!vendor) return null;
  
  return {
    id: vendor.id,
    vendorCode: vendor.vendor_id || vendor.vendor_code || vendor.id,
    vendorName: vendor.vendor_name || '',
    vendorType: vendor.vendor_type || 'OTHER',
    isActive: vendor.active !== false,
    businessModel: vendor.business_model || 'NET_RATE',
    integrationSettings: vendor.integration_settings ? {
      defaultTolerances: vendor.integration_settings.default_tolerances,
      bookingIdProcessing: vendor.integration_settings.booking_id_processing,
      idField: vendor.integration_settings.id_field,
      idPrefix: vendor.integration_settings.id_prefix,
      defaultRulePriority: vendor.integration_settings.default_rule_priority
    } : {
      defaultTolerances: null,
      bookingIdProcessing: null,
      idField: null,
      idPrefix: null,
      defaultRulePriority: null
    },
    invoiceSettings: vendor.invoice_settings ? {
      currencyCode: vendor.invoice_settings.currency_code,
      invoiceFrequency: vendor.invoice_settings.invoice_frequency,
      invoiceFormats: vendor.invoice_settings.invoice_formats
    } : {
      currencyCode: null,
      invoiceFrequency: null,
      invoiceFormats: null
    },
    extractionSettings: vendor.extraction_settings ? {
      templateId: vendor.extraction_settings.template_id,
      extractionModel: vendor.extraction_settings.extraction_model,
      confidenceThreshold: vendor.extraction_settings.confidence_threshold,
      manualReviewThreshold: vendor.extraction_settings.manual_review_threshold,
      autoReviewThreshold: vendor.extraction_settings.auto_review_threshold,
      requiredFields: vendor.extraction_settings.required_fields
    } : {
      templateId: null,
      extractionModel: null,
      confidenceThreshold: null,
      manualReviewThreshold: null,
      autoReviewThreshold: null,
      requiredFields: null
    },
    reconciliationSettings: vendor.reconciliation_settings ? {
      autoApprovalThreshold: vendor.reconciliation_settings.auto_approval_threshold,
      allowAutoApproval: vendor.reconciliation_settings.allow_auto_approval,
      holdThreshold: vendor.reconciliation_settings.hold_threshold,
      futureBookingThreshold: vendor.reconciliation_settings.future_booking_threshold,
      cancelledBookingRefundDays: vendor.reconciliation_settings.cancelled_booking_refund_days,
      cancellationHandling: vendor.reconciliation_settings.cancellation_handling,
      penaltyPercentageRange: vendor.reconciliation_settings.penalty_percentage_range
    } : {
      autoApprovalThreshold: null,
      allowAutoApproval: false,
      holdThreshold: null,
      futureBookingThreshold: null,
      cancelledBookingRefundDays: null,
      cancellationHandling: null,
      penaltyPercentageRange: null
    },
    contacts: vendor.contact_information ? [{
      name: 'Support',
      email: vendor.contact_information.support_email || '',
      phone: vendor.contact_information.support_phone || '',
      isPrimary: true
    }, {
      name: 'Finance',
      email: vendor.contact_information.pic_email || '',
      phone: vendor.contact_information.pic_phone || '',
      isPrimary: false
    }].filter(c => c.email || c.phone) : [],
    metadata: vendor.metadata,
    createdAt: vendor.created_at || vendor.createdAt,
    updatedAt: vendor.updated_at || vendor.updatedAt,
    createdBy: vendor.created_by,
    updatedBy: vendor.updated_by
  };
};

// Transform API format back to Firestore format
const mapApiToFirestore = (apiVendor) => {
  const firestoreVendor = {
    vendor_id: apiVendor.vendorCode,
    vendor_code: apiVendor.vendorCode,
    vendor_name: apiVendor.vendorName,
    vendor_type: apiVendor.vendorType,
    active: apiVendor.isActive !== false,
    business_model: apiVendor.businessModel
  };

  if (apiVendor.integrationSettings) {
    firestoreVendor.integration_settings = {
      default_tolerances: apiVendor.integrationSettings.defaultTolerances,
      booking_id_processing: apiVendor.integrationSettings.bookingIdProcessing,
      id_field: apiVendor.integrationSettings.idField,
      id_prefix: apiVendor.integrationSettings.idPrefix,
      default_rule_priority: apiVendor.integrationSettings.defaultRulePriority
    };
  }

  if (apiVendor.invoiceSettings) {
    firestoreVendor.invoice_settings = {
      currency_code: apiVendor.invoiceSettings.currencyCode,
      invoice_frequency: apiVendor.invoiceSettings.invoiceFrequency,
      invoice_formats: apiVendor.invoiceSettings.invoiceFormats
    };
  }

  if (apiVendor.extractionSettings) {
    firestoreVendor.extraction_settings = {
      template_id: apiVendor.extractionSettings.templateId,
      extraction_model: apiVendor.extractionSettings.extractionModel,
      confidence_threshold: apiVendor.extractionSettings.confidenceThreshold,
      manual_review_threshold: apiVendor.extractionSettings.manualReviewThreshold,
      auto_review_threshold: apiVendor.extractionSettings.autoReviewThreshold,
      required_fields: apiVendor.extractionSettings.requiredFields
    };
  }

  if (apiVendor.reconciliationSettings) {
    firestoreVendor.reconciliation_settings = {
      auto_approval_threshold: apiVendor.reconciliationSettings.autoApprovalThreshold,
      allow_auto_approval: apiVendor.reconciliationSettings.allowAutoApproval,
      hold_threshold: apiVendor.reconciliationSettings.holdThreshold,
      future_booking_threshold: apiVendor.reconciliationSettings.futureBookingThreshold,
      cancelled_booking_refund_days: apiVendor.reconciliationSettings.cancelledBookingRefundDays,
      cancellation_handling: apiVendor.reconciliationSettings.cancellationHandling,
      penalty_percentage_range: apiVendor.reconciliationSettings.penaltyPercentageRange
    };
  }

  if (apiVendor.contacts && apiVendor.contacts.length > 0) {
    firestoreVendor.contact_information = {};
    const primaryContact = apiVendor.contacts.find(c => c.isPrimary);
    const financeContact = apiVendor.contacts.find(c => c.name === 'Finance' || !c.isPrimary);
    
    if (primaryContact) {
      firestoreVendor.contact_information.support_email = primaryContact.email;
      firestoreVendor.contact_information.support_phone = primaryContact.phone;
    }
    if (financeContact) {
      firestoreVendor.contact_information.pic_email = financeContact.email;
      firestoreVendor.contact_information.pic_phone = financeContact.phone;
    }
  }

  if (apiVendor.metadata) {
    firestoreVendor.metadata = apiVendor.metadata;
  }

  return firestoreVendor;
};

// GET all vendors
router.get('/', async (req, res) => {
  try {
    const vendors = await vendorService.getAll(req.query);
    const converted = vendors.map(v => {
      const timestampConverted = BaseFirestoreService.convertTimestamps(v);
      return mapFirestoreToApi(timestampConverted);
    });
    res.json(converted);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET vendor by ID
router.get('/:id', async (req, res) => {
  try {
    const vendor = await vendorService.getById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    const timestampConverted = BaseFirestoreService.convertTimestamps(vendor);
    res.json(mapFirestoreToApi(timestampConverted));
  } catch (error) {
    console.error('Error fetching vendor:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST create vendor
router.post('/', async (req, res) => {
  try {
    const firestoreData = mapApiToFirestore(req.body);
    // Clean undefined values before sending to Firestore
    const cleanedData = prepareForFirestore(firestoreData);
    const vendor = await vendorService.create(cleanedData);
    const timestampConverted = BaseFirestoreService.convertTimestamps(vendor);
    res.status(201).json(mapFirestoreToApi(timestampConverted));
  } catch (error) {
    console.error('Error creating vendor:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT update vendor
router.put('/:id', async (req, res) => {
  try {
    const firestoreData = mapApiToFirestore(req.body);
    // Clean undefined values before sending to Firestore
    const cleanedData = prepareForFirestore(firestoreData);
    const vendor = await vendorService.update(req.params.id, cleanedData);
    const timestampConverted = BaseFirestoreService.convertTimestamps(vendor);
    res.json(mapFirestoreToApi(timestampConverted));
  } catch (error) {
    console.error('Error updating vendor:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE vendor
router.delete('/:id', async (req, res) => {
  try {
    await vendorService.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting vendor:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;