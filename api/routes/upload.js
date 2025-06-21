const express = require('express');
const router = express.Router();
const multer = require('multer');
// Lazy load storage service to ensure env vars are loaded
let storageService;

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Lazy load storage service
    if (!storageService) {
      storageService = require('../services/storage.service');
    }
    // Check if file type is allowed
    if (!storageService.isAllowedFileType(file.originalname)) {
      return cb(new Error('Invalid file type. Allowed types: PDF, Excel, CSV, Word'));
    }
    cb(null, true);
  },
});

// POST /api/upload/invoice
router.post('/invoice', upload.single('file'), async (req, res) => {
  try {
    // Lazy load storage service
    if (!storageService) {
      storageService = require('../services/storage.service');
    }
    // Check if file is provided
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file provided',
      });
    }

    // Get vendor ID from request body
    const { vendorId, invoiceData } = req.body;
    
    if (!vendorId) {
      return res.status(400).json({
        success: false,
        error: 'Vendor ID is required',
      });
    }

    // Parse invoiceData if it's a string
    let parsedInvoiceData = {};
    if (invoiceData) {
      try {
        parsedInvoiceData = typeof invoiceData === 'string' ? JSON.parse(invoiceData) : invoiceData;
      } catch (e) {
        console.error('Error parsing invoice data:', e);
      }
    }

    console.log('Uploading invoice:', {
      fileName: req.file.originalname,
      size: req.file.size,
      vendorId,
      invoiceData: parsedInvoiceData,
    });

    // Upload file to Google Cloud Storage
    const uploadResult = await storageService.uploadInvoice(
      req.file.buffer,
      req.file.originalname,
      vendorId,
      {
        mimeType: req.file.mimetype,
        size: req.file.size,
        ...parsedInvoiceData,
      }
    );

    console.log('Upload successful:', uploadResult);

    // Return success response
    res.json({
      success: true,
      message: 'Invoice uploaded successfully',
      data: {
        fileName: uploadResult.fileName,
        gcsUri: uploadResult.gcsUri,
        size: uploadResult.size,
        uploadedAt: uploadResult.uploadedAt,
      },
    });
  } catch (error) {
    console.error('Error uploading invoice:', error);
    
    // Handle multer errors
    if (error.message && error.message.includes('Invalid file type')) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
    
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File size exceeds the limit of 50MB',
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to upload invoice',
      details: error.message,
    });
  }
});

// GET /api/upload/signed-url/:filePath
router.get('/signed-url/:filePath(*)', async (req, res) => {
  try {
    // Lazy load storage service
    if (!storageService) {
      storageService = require('../services/storage.service');
    }
    const { filePath } = req.params;
    const { expiresInMinutes = 60 } = req.query;

    const signedUrl = await storageService.getSignedUrl(
      filePath,
      parseInt(expiresInMinutes)
    );

    res.json({
      success: true,
      url: signedUrl,
    });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate signed URL',
    });
  }
});

module.exports = router;