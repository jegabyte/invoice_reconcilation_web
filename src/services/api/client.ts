import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_CONFIG } from './config';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.baseURL,
      timeout: API_CONFIG.timeout,
      headers: API_CONFIG.headers,
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
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
          // Request made but no response
          throw {
            code: 'NETWORK_ERROR',
            message: 'Unable to connect to server',
            details: {},
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