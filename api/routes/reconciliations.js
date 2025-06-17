const express = require('express');
const router = express.Router();
const { reconciliationService, BaseFirestoreService } = require('../services/firestore.service');

// GET all reconciliations
router.get('/', async (req, res) => {
  try {
    const reconciliations = await reconciliationService.getAll(req.query);
    const converted = reconciliations.map(r => BaseFirestoreService.convertTimestamps(r));
    res.json(converted);
  } catch (error) {
    console.error('Error fetching reconciliations:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET reconciliation by ID
router.get('/:id', async (req, res) => {
  try {
    const reconciliation = await reconciliationService.getById(req.params.id);
    if (!reconciliation) {
      return res.status(404).json({ error: 'Reconciliation not found' });
    }
    res.json(BaseFirestoreService.convertTimestamps(reconciliation));
  } catch (error) {
    console.error('Error fetching reconciliation:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET reconciliation by invoice ID
router.get('/invoice/:invoiceId', async (req, res) => {
  try {
    const reconciliations = await reconciliationService.getAll({ invoiceId: req.params.invoiceId });
    const reconciliation = reconciliations[0] || null;
    res.json(reconciliation ? BaseFirestoreService.convertTimestamps(reconciliation) : null);
  } catch (error) {
    console.error('Error fetching reconciliation by invoice:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST create reconciliation
router.post('/', async (req, res) => {
  try {
    const reconciliation = await reconciliationService.create(req.body);
    res.status(201).json(BaseFirestoreService.convertTimestamps(reconciliation));
  } catch (error) {
    console.error('Error creating reconciliation:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT update reconciliation
router.put('/:id', async (req, res) => {
  try {
    const reconciliation = await reconciliationService.update(req.params.id, req.body);
    res.json(BaseFirestoreService.convertTimestamps(reconciliation));
  } catch (error) {
    console.error('Error updating reconciliation:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST approve reconciliation
router.post('/:id/approve', async (req, res) => {
  try {
    const { approvedBy, notes } = req.body;
    const reconciliation = await reconciliationService.update(req.params.id, {
      approvalStatus: 'APPROVED',
      approvedBy,
      approvalDate: new Date().toISOString(),
      notes
    });
    res.json(BaseFirestoreService.convertTimestamps(reconciliation));
  } catch (error) {
    console.error('Error approving reconciliation:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST reject reconciliation
router.post('/:id/reject', async (req, res) => {
  try {
    const { rejectedBy, notes } = req.body;
    const reconciliation = await reconciliationService.update(req.params.id, {
      approvalStatus: 'REJECTED',
      approvedBy: rejectedBy,
      approvalDate: new Date().toISOString(),
      notes
    });
    res.json(BaseFirestoreService.convertTimestamps(reconciliation));
  } catch (error) {
    console.error('Error rejecting reconciliation:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE reconciliation
router.delete('/:id', async (req, res) => {
  try {
    await reconciliationService.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting reconciliation:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;