import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_CONFIG } from './config';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    console.log('API_CONFIG.baseURL:', API_CONFIG.baseURL);
    this.client = axios.create({
      baseURL: API_CONFIG.baseURL,
      timeout: API_CONFIG.timeout,
      headers: API_CONFIG.headers,
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        console.log('Request URL:', config.baseURL, config.url);
        console.log('Full URL:', (config.baseURL || '') + (config.url || ''));
        // Add auth token if available
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        return response.data;
      },
      (error: AxiosError) => {
        if (error.response) {
          // Server responded with error
          const errorData = error.response.data as any;
          throw {
            code: errorData?.error?.code || 'UNKNOWN_ERROR',
            message: errorData?.error?.message || error.message,
            details: errorData?.error?.details || {},
          };
        } else if (error.request) {
          // Request made but no response - likely CORS issue
          console.error('Network error - likely CORS issue:', error);
          throw {
            code: 'NETWORK_ERROR',
            message: 'Unable to connect to server. This may be a CORS issue with the Firebase Functions.',
            details: {
              hint: 'The Firebase Functions need to have CORS enabled, or you can use a proxy for development.',
              originalError: error.message
            },
          };
        } else {
          // Something else happened
          throw {
            code: 'REQUEST_ERROR',
            message: error.message,
            details: {},
          };
        }
      }
    );
  }

  async get<T>(url: string, params?: any): Promise<T> {
    return this.client.get(url, { params });
  }

  async post<T>(url: string, data?: any): Promise<T> {
    return this.client.post(url, data);
  }

  async put<T>(url: string, data?: any): Promise<T> {
    return this.client.put(url, data);
  }

  async delete<T>(url: string): Promise<T> {
    return this.client.delete(url);
  }

  async upload<T>(url: string, formData: FormData): Promise<T> {
    return this.client.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}

export const apiClient = new ApiClient();