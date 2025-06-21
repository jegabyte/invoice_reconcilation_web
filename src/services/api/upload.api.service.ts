import { apiClient } from './client';

interface UploadResponse {
  success: boolean;
  message: string;
  data?: {
    fileName: string;
    gcsUri: string;
    size: number;
    uploadedAt: string;
  };
  error?: string;
}

class UploadApiService {
  /**
   * Upload an invoice file
   * @param file - The file to upload
   * @param vendorId - The vendor ID
   * @param invoiceData - Additional invoice metadata
   * @returns Upload response
   */
  async uploadInvoice(
    file: File, 
    vendorId: string, 
    invoiceData?: any
  ): Promise<UploadResponse> {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('vendorId', vendorId);
      
      if (invoiceData) {
        formData.append('invoiceData', JSON.stringify(invoiceData));
      }

      // Make the upload request
      const response = await fetch('/api/upload/invoice', {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - browser will set it with boundary
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      return result;
    } catch (error) {
      console.error('Error uploading invoice:', error);
      throw error;
    }
  }

  /**
   * Get a signed URL for a file
   * @param filePath - The file path in storage
   * @param expiresInMinutes - URL expiration time (default: 60)
   * @returns Signed URL
   */
  async getSignedUrl(
    filePath: string, 
    expiresInMinutes: number = 60
  ): Promise<string> {
    try {
      const response = await apiClient.get<{ success: boolean; url: string }>(
        `/upload/signed-url/${encodeURIComponent(filePath)}`,
        {
          params: { expiresInMinutes }
        }
      );

      return response.url;
    } catch (error) {
      console.error('Error getting signed URL:', error);
      throw error;
    }
  }
}

export const uploadApiService = new UploadApiService();