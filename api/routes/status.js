const express = require('express');
const router = express.Router();
const { statusService, BaseFirestoreService } = require('../services/firestore.service');

// GET API status
router.get('/api-status', async (req, res) => {
  res.json({
    status: 'ok',
    backend: 'Google Cloud Firestore',
    authentication: 'Application Default Credentials',
    timestamp: new Date().toISOString()
  });
});

// GET all statuses
router.get('/', async (req, res) => {
  try {
    const statuses = await statusService.getAll(req.query);
    const converted = statuses.map(s => BaseFirestoreService.convertTimestamps(s));
    res.json(converted);
  } catch (error) {
    console.error('Error fetching statuses:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET status by ID
router.get('/:id', async (req, res) => {
  try {
    const status = await statusService.getById(req.params.id);
    if (!status) {
      return res.status(404).json({ error: 'Status not found' });
    }
    res.json(BaseFirestoreService.convertTimestamps(status));
  } catch (error) {
    console.error('Error fetching status:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET status by invoice ID
router.get('/invoice/:invoiceId', async (req, res) => {
  try {
    const statuses = await statusService.getAll({ invoiceId: req.params.invoiceId });
    const status = statuses[0] || null;
    res.json(status ? BaseFirestoreService.convertTimestamps(status) : null);
  } catch (error) {
    console.error('Error fetching status by invoice:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST create status
router.post('/', async (req, res) => {
  try {
    const status = await statusService.create(req.body);
    res.status(201).json(BaseFirestoreService.convertTimestamps(status));
  } catch (error) {
    console.error('Error creating status:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT update status
router.put('/:id', async (req, res) => {
  try {
    const status = await statusService.update(req.params.id, req.body);
    res.json(BaseFirestoreService.convertTimestamps(status));
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE status
router.delete('/:id', async (req, res) => {
  try {
    await statusService.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting status:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;