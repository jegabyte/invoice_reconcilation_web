const express = require('express');
const router = express.Router();
const { extractionService, BaseFirestoreService } = require('../services/firestore.service');

// GET all extractions
router.get('/', async (req, res) => {
  try {
    const extractions = await extractionService.getAll(req.query);
    const converted = extractions.map(e => BaseFirestoreService.convertTimestamps(e));
    res.json(converted);
  } catch (error) {
    console.error('Error fetching extractions:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET extraction by ID
router.get('/:id', async (req, res) => {
  try {
    const extraction = await extractionService.getById(req.params.id);
    if (!extraction) {
      return res.status(404).json({ error: 'Extraction not found' });
    }
    res.json(BaseFirestoreService.convertTimestamps(extraction));
  } catch (error) {
    console.error('Error fetching extraction:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET extraction by invoice ID
router.get('/invoice/:invoiceId', async (req, res) => {
  try {
    const extractions = await extractionService.getAll({ invoiceId: req.params.invoiceId });
    const extraction = extractions[0] || null;
    res.json(extraction ? BaseFirestoreService.convertTimestamps(extraction) : null);
  } catch (error) {
    console.error('Error fetching extraction by invoice:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST create extraction
router.post('/', async (req, res) => {
  try {
    const extraction = await extractionService.create(req.body);
    res.status(201).json(BaseFirestoreService.convertTimestamps(extraction));
  } catch (error) {
    console.error('Error creating extraction:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT update extraction
router.put('/:id', async (req, res) => {
  try {
    const extraction = await extractionService.update(req.params.id, req.body);
    res.json(BaseFirestoreService.convertTimestamps(extraction));
  } catch (error) {
    console.error('Error updating extraction:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE extraction
router.delete('/:id', async (req, res) => {
  try {
    await extractionService.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting extraction:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;