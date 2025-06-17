const express = require('express');
const router = express.Router();
const { vendorService, BaseFirestoreService } = require('../services/firestore.service');

// GET all vendors
router.get('/', async (req, res) => {
  try {
    const vendors = await vendorService.getAll(req.query);
    const converted = vendors.map(v => BaseFirestoreService.convertTimestamps(v));
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
    res.json(BaseFirestoreService.convertTimestamps(vendor));
  } catch (error) {
    console.error('Error fetching vendor:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST create vendor
router.post('/', async (req, res) => {
  try {
    const vendor = await vendorService.create(req.body);
    res.status(201).json(BaseFirestoreService.convertTimestamps(vendor));
  } catch (error) {
    console.error('Error creating vendor:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT update vendor
router.put('/:id', async (req, res) => {
  try {
    const vendor = await vendorService.update(req.params.id, req.body);
    res.json(BaseFirestoreService.convertTimestamps(vendor));
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