const { Storage } = require('@google-cloud/storage');
const path = require('path');

// Initialize Google Cloud Storage
const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
});

class StorageService {
  constructor() {
    // Get configuration dynamically when service is instantiated
    this.updateConfiguration();
  }

  updateConfiguration() {
    // Get bucket name from environment variables - try multiple possible env var names
    this.BUCKET_NAME = process.env.STORAGE_BUCKET_NAME || 
                       process.env.GCS_BUCKET_NAME || 
                       'aiva-invoice-recon-demo'; // Fallback to known bucket name
    
    this.UPLOAD_PATH = process.env.STORAGE_UPLOAD_PATH || 'invoices/uploads';
    
    console.log('Storage Service Configuration:', {
      projectId: process.env.GCP_PROJECT_ID,
      bucketName: this.BUCKET_NAME,
      uploadPath: this.UPLOAD_PATH,
      allEnvVars: {
        STORAGE_BUCKET_NAME: process.env.STORAGE_BUCKET_NAME,
        GCS_BUCKET_NAME: process.env.GCS_BUCKET_NAME,
        GCP_PROJECT_ID: process.env.GCP_PROJECT_ID
      }
    });
    
    this.bucket = storage.bucket(this.BUCKET_NAME);
  }

  /**
   * Upload a file to Google Cloud Storage
   * @param {Buffer} fileBuffer - The file buffer
   * @param {string} fileName - The original file name
   * @param {string} vendorId - The vendor ID
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} - Upload result with public URL
   */
  async uploadInvoice(fileBuffer, fileName, vendorId, metadata = {}) {
    try {
      // Refresh configuration in case env vars changed
      this.updateConfiguration();
      
      // Validate bucket configuration
      if (!this.BUCKET_NAME) {
        throw new Error('Storage bucket name not configured. Please set STORAGE_BUCKET_NAME in environment variables.');
      }

      // Generate a timestamp folder structure (YYYY/MM/DD/HH-MM-SS)
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hour = String(now.getHours()).padStart(2, '0');
      const minute = String(now.getMinutes()).padStart(2, '0');
      const second = String(now.getSeconds()).padStart(2, '0');
      
      // Convert vendorId to lowercase for folder name consistency
      const vendorFolder = vendorId.toLowerCase();
      // Keep original filename as-is
      const filePath = `${this.UPLOAD_PATH}/${vendorFolder}/${year}/${month}/${day}/${hour}-${minute}-${second}/${fileName}`;

      console.log('Uploading file:', {
        bucket: this.BUCKET_NAME,
        filePath,
        fileSize: fileBuffer.length,
        vendorId
      });

      // Create a file object in the bucket
      const file = this.bucket.file(filePath);

      // Get the file extension to set the correct content type
      const ext = path.extname(fileName).toLowerCase();
      const contentType = this.getContentType(ext);

      // Upload the file
      await file.save(fileBuffer, {
        metadata: {
          contentType,
          metadata: {
            ...metadata,
            originalFileName: fileName,
            vendorId,
            uploadedAt: new Date().toISOString(),
          },
        },
      });

      // Generate the GCS URI
      const gcsUri = `gs://${this.BUCKET_NAME}/${filePath}`;

      console.log('Upload successful:', gcsUri);

      return {
        success: true,
        fileName: filePath,
        gcsUri,
        bucket: this.BUCKET_NAME,
        size: fileBuffer.length,
        contentType,
        uploadedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error uploading file to storage:', error);
      
      // Provide more specific error messages
      if (error.code === 404) {
        throw new Error(`Storage bucket '${this.BUCKET_NAME}' not found. Please check your bucket configuration.`);
      } else if (error.code === 403) {
        throw new Error('Permission denied. Please check that the service account has write access to the storage bucket.');
      } else if (error.message?.includes('Could not load the default credentials')) {
        throw new Error('Google Cloud credentials not configured. Please set up Application Default Credentials.');
      }
      
      throw error;
    }
  }

  /**
   * Get content type based on file extension
   * @param {string} ext - File extension
   * @returns {string} - Content type
   */
  getContentType(ext) {
    const contentTypes = {
      '.pdf': 'application/pdf',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.xls': 'application/vnd.ms-excel',
      '.csv': 'text/csv',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
    };

    return contentTypes[ext] || 'application/octet-stream';
  }

  /**
   * Check if a file type is allowed
   * @param {string} fileName - The file name
   * @returns {boolean} - Whether the file type is allowed
   */
  isAllowedFileType(fileName) {
    const allowedExtensions = ['.pdf', '.xlsx', '.xls', '.csv', '.doc', '.docx'];
    const ext = path.extname(fileName).toLowerCase();
    return allowedExtensions.includes(ext);
  }

  /**
   * Delete a file from storage
   * @param {string} filePath - The file path in the bucket
   * @returns {Promise<void>}
   */
  async deleteFile(filePath) {
    try {
      await this.bucket.file(filePath).delete();
    } catch (error) {
      console.error('Error deleting file from storage:', error);
      throw error;
    }
  }

  /**
   * Get a signed URL for temporary access
   * @param {string} filePath - The file path in the bucket
   * @param {number} expiresInMinutes - URL expiration time in minutes
   * @returns {Promise<string>} - Signed URL
   */
  async getSignedUrl(filePath, expiresInMinutes = 60) {
    try {
      const [url] = await this.bucket.file(filePath).getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + expiresInMinutes * 60 * 1000,
      });
      return url;
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw error;
    }
  }
}

// Export a singleton instance
module.exports = new StorageService();