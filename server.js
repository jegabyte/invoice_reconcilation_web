require('dotenv').config();
const express = require('express');
const path = require('path');
const { Firestore } = require('@google-cloud/firestore');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Firestore with ADC (no API key needed)
const firestore = new Firestore({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  // ADC will be used automatically
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes - These run on the server with ADC
app.use('/api/vendors', require('./api/routes/vendors'));
app.use('/api/extractions', require('./api/routes/extractions'));
app.use('/api/reconciliations', require('./api/routes/reconciliations'));
app.use('/api/rules', require('./api/routes/rules'));
app.use('/api/status', require('./api/routes/status'));

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'dist')));

// Handle React routing - serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Using Firestore project: ${firestore.projectId}`);
});

// Export for use in API routes
module.exports = { firestore };