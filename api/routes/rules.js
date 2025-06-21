const express = require('express');
const router = express.Router();
const { rulesService, BaseFirestoreService } = require('../services/firestore.service');

// Transform Firestore rule data to match frontend API format
const mapFirestoreToApi = (rule) => {
  if (!rule) return null;
  
  return {
    id: rule.id,
    ruleId: rule.rule_id,
    ruleName: rule.rule_name,
    vendorCode: rule.vendor_code,
    description: rule.description,
    ruleType: rule.rule_type,
    entityType: rule.entity_type,
    priority: rule.priority,
    isActive: rule.is_active,
    version: rule.version,
    effectiveFrom: rule.effective_from,
    effectiveTo: rule.effective_to,
    conditions: rule.conditions,
    actions: rule.actions,
    reprocessConfig: rule.reprocess_config,
    metadata: rule.metadata,
    createdAt: rule.metadata?.created_at || rule.created_at,
    createdBy: rule.metadata?.created_by || rule.created_by,
    updatedAt: rule.updated_at,
    updatedBy: rule.updated_by
  };
};

// Transform API format back to Firestore format
const mapApiToFirestore = (apiRule) => {
  const firestoreRule = {
    rule_id: apiRule.ruleId,
    rule_name: apiRule.ruleName,
    vendor_code: apiRule.vendorCode,
    description: apiRule.description,
    rule_type: apiRule.ruleType,
    entity_type: apiRule.entityType,
    priority: apiRule.priority,
    is_active: apiRule.isActive !== false,
    version: apiRule.version,
    effective_from: apiRule.effectiveFrom,
    effective_to: apiRule.effectiveTo,
    conditions: apiRule.conditions,
    actions: apiRule.actions
  };

  if (apiRule.reprocessConfig) {
    firestoreRule.reprocess_config = apiRule.reprocessConfig;
  }

  if (apiRule.metadata) {
    firestoreRule.metadata = apiRule.metadata;
  }

  return firestoreRule;
};

// GET all rules with optional filters
router.get('/', async (req, res) => {
  try {
    const filters = {};
    
    // Apply filters from query params
    if (req.query.vendorCode) {
      filters.vendor_code = req.query.vendorCode;
    }
    if (req.query.isActive !== undefined) {
      filters.is_active = req.query.isActive === 'true';
    }
    if (req.query.ruleType) {
      filters.rule_type = req.query.ruleType;
    }
    if (req.query.entityType) {
      filters.entity_type = req.query.entityType;
    }
    
    const rules = await rulesService.getAll(filters);
    const converted = rules
      .map(r => {
        const timestampConverted = BaseFirestoreService.convertTimestamps(r);
        return mapFirestoreToApi(timestampConverted);
      })
      .sort((a, b) => a.priority - b.priority); // Sort by priority
      
    res.json(converted);
  } catch (error) {
    console.error('Error fetching rules:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET rule by ID
router.get('/:id', async (req, res) => {
  try {
    const rule = await rulesService.getById(req.params.id);
    if (!rule) {
      return res.status(404).json({ error: 'Rule not found' });
    }
    const timestampConverted = BaseFirestoreService.convertTimestamps(rule);
    res.json(mapFirestoreToApi(timestampConverted));
  } catch (error) {
    console.error('Error fetching rule:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST create rule
router.post('/', async (req, res) => {
  try {
    const firestoreData = mapApiToFirestore(req.body);
    // Add metadata for creation
    firestoreData.metadata = {
      ...firestoreData.metadata,
      created_at: new Date().toISOString(),
      created_by: req.user?.email || 'system'
    };
    
    const rule = await rulesService.create(firestoreData);
    const timestampConverted = BaseFirestoreService.convertTimestamps(rule);
    res.status(201).json(mapFirestoreToApi(timestampConverted));
  } catch (error) {
    console.error('Error creating rule:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT update rule
router.put('/:id', async (req, res) => {
  try {
    const firestoreData = mapApiToFirestore(req.body);
    // Add metadata for update
    firestoreData.metadata = {
      ...firestoreData.metadata,
      updated_at: new Date().toISOString(),
      updated_by: req.user?.email || 'system'
    };
    
    const rule = await rulesService.update(req.params.id, firestoreData);
    const timestampConverted = BaseFirestoreService.convertTimestamps(rule);
    res.json(mapFirestoreToApi(timestampConverted));
  } catch (error) {
    console.error('Error updating rule:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE rule
router.delete('/:id', async (req, res) => {
  try {
    await rulesService.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting rule:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET rules by vendor
router.get('/vendor/:vendorCode', async (req, res) => {
  try {
    const rules = await rulesService.getAll({ 
      vendor_code: req.params.vendorCode 
    });
    const converted = rules
      .map(r => {
        const timestampConverted = BaseFirestoreService.convertTimestamps(r);
        return mapFirestoreToApi(timestampConverted);
      })
      .sort((a, b) => a.priority - b.priority);
      
    res.json(converted);
  } catch (error) {
    console.error('Error fetching vendor rules:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;