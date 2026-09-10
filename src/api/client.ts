import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { env } from '../config/env';
import { APP_CONFIG } from '../config/app-config';
import { secureStorage } from '../services/secureStore';
import { ApiErrorResponse } from '../types/auth';

import { Platform } from 'react-native';

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
        console.log(`[ApiClient] Request -> ${config.method?.toUpperCase()} ${config.baseURL || ''}${config.url}`);
        return config;
      },
      (error) => {
        console.log(`[ApiClient] Request setup error:`, error);
        return Promise.reject(error);
      }
    );

    // Response Interceptor: Standardized Error Handling with ADB / LAN Tunnel Fallback
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(`[ApiClient] Response <- ${response.status} ${response.config.url}`);
        return response;
      },
      async (error: AxiosError<ApiErrorResponse>) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
        console.log(`[ApiClient] Request failed: ${error.config?.baseURL || ''}${error.config?.url} | status: ${error.response?.status || 'NO_RESPONSE'}`);

        // If network error occurred and not retried yet, try fallback candidates
        if (!error.response && originalRequest && !originalRequest._retry) {
          originalRequest._retry = true;
          const currentBase = this.instance.defaults.baseURL || '';

          const candidates = Platform.OS === 'android'
            ? ['http://10.0.2.2:8000', 'http://10.0.2.2:8080', 'http://127.0.0.1:8000', 'http://192.168.29.183:8000']
            : ['http://127.0.0.1:8000', 'http://127.0.0.1:8080', 'http://192.168.29.183:8000'];

          for (const fallbackUrl of candidates) {
            if (fallbackUrl !== currentBase) {
              console.log(`[ApiClient] Retrying request with candidate: ${fallbackUrl}${originalRequest.url}...`);
              this.instance.defaults.baseURL = fallbackUrl;
              originalRequest.baseURL = fallbackUrl;
              try {
                const res = await this.instance(originalRequest);
                console.log(`[ApiClient] Retried successfully with: ${fallbackUrl}`);
                return res;
              } catch (retryErr: any) {
                // Try next
              }
            }
          }
        }

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
        } else if (typeof data.message === 'string') {
          message = data.message;
        } else if (typeof data.error === 'string') {
          message = data.error;
        } else if (typeof data === 'object' && !Array.isArray(data)) {
          // DRF validation errors dictionary e.g. { field: ["Error 1"], field2: ["Error 2"] }
          const fieldErrors = Object.entries(data)
            .map(([field, errs]) => {
              const errText = Array.isArray(errs) ? errs.join(', ') : String(errs);
              return `${field.replace(/_/g, ' ')}: ${errText}`;
            })
            .filter(Boolean);
          if (fieldErrors.length > 0) {
            message = fieldErrors.join('\n');
          }
        }
      }

      // Friendly fallback messages based on status codes if message is still default
      if (message === 'An unexpected error occurred. Please try again.') {
        switch (status) {
          case 400:
            message = 'Invalid request. Please check your inputs.';
            break;
          case 401:
            message = 'Session expired. Please sign in again.';
            break;
          case 403:
            message = 'Access denied. You do not have permission.';
            break;
          case 404:
            message = 'Resource not found.';
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
export const client = apiClient;

