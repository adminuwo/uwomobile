import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { env } from '../config/env';
import { APP_CONFIG } from '../config/app-config';
import { secureStorage } from '../services/secureStore';
import { ApiErrorResponse } from '../types/auth';

class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: env.API_BASE_URL,
      timeout: APP_CONFIG.apiTimeout,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request Interceptor: Attach JWT Bearer token from SecureStore
    this.instance.interceptors.request.use(
      async (config) => {
        const token = await secureStorage.getAccessToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response Interceptor: Standardized Error Handling
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError<ApiErrorResponse>) => {
        const formattedError = this.handleApiError(error);
        return Promise.reject(formattedError);
      }
    );
  }

  private handleApiError(error: AxiosError<ApiErrorResponse>): {
    status: number;
    message: string;
    code: string;
    originalError: AxiosError;
  } {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      let message = 'An unexpected error occurred. Please try again.';

      if (data) {
        if (typeof data.detail === 'string') {
          message = data.detail;
        } else if (Array.isArray(data.detail)) {
          message = data.detail.map((d) => (typeof d === 'string' ? d : d.msg || d.detail || '')).join(', ');
        } else if (data.message) {
          message = data.message;
        } else if (data.error) {
          message = data.error;
        }
      }

      // Friendly messages based on status codes
      switch (status) {
        case 400:
          message = message || 'Invalid request. Please check input values.';
          break;
        case 401:
          message = message || 'Session expired. Please sign in again.';
          break;
        case 403:
          message = message || 'Access denied. You do not have permission.';
          break;
        case 404:
          message = message || 'Resource not found.';
          break;
        case 429:
          message = 'Too many requests. Please slow down and try again.';
          break;
        case 500:
        case 502:
        case 503:
          message = 'Server is currently undergoing maintenance. Please try again later.';
          break;
      }

      return {
        status,
        message,
        code: `HTTP_${status}`,
        originalError: error,
      };
    }

    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return {
        status: 408,
        message: 'Request timed out. Please check your network connection.',
        code: 'TIMEOUT',
        originalError: error,
      };
    }

    // Network / Offline Error
    return {
      status: 0,
      message: 'Network connection lost. Please check your internet connection.',
      code: 'NETWORK_ERROR',
      originalError: error,
    };
  }

  public get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.get<T, AxiosResponse<T>>(url, config).then((res) => res.data);
  }

  public post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.post<T, AxiosResponse<T>>(url, data, config).then((res) => res.data);
  }

  public put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.put<T, AxiosResponse<T>>(url, data, config).then((res) => res.data);
  }

  public patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.patch<T, AxiosResponse<T>>(url, data, config).then((res) => res.data);
  }

  public delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.delete<T, AxiosResponse<T>>(url, config).then((res) => res.data);
  }
}

export const apiClient = new ApiClient();
