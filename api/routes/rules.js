const express = require('express');
const router = express.Router();
const { rulesService, BaseFirestoreService } = require('../services/firestore.service');

// GET all rules
router.get('/', async (req, res) => {
  try {
    const rules = await rulesService.getAll(req.query);
    const converted = rules.map(r => BaseFirestoreService.convertTimestamps(r));
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
    res.json(BaseFirestoreService.convertTimestamps(rule));
  } catch (error) {
    console.error('Error fetching rule:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET rules by vendor
router.get('/vendor/:vendorId', async (req, res) => {
  try {
    const rules = await rulesService.getAll({ vendorId: req.params.vendorId });
    const converted = rules.map(r => BaseFirestoreService.convertTimestamps(r));
    res.json(converted);
  } catch (error) {
    console.error('Error fetching vendor rules:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST create rule
router.post('/', async (req, res) => {
  try {
    const rule = await rulesService.create(req.body);
    res.status(201).json(BaseFirestoreService.convertTimestamps(rule));
  } catch (error) {
    console.error('Error creating rule:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT update rule
router.put('/:id', async (req, res) => {
  try {
    const rule = await rulesService.update(req.params.id, req.body);
    res.json(BaseFirestoreService.convertTimestamps(rule));
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

module.exports = router;