import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { env } from '../config/env';
import { APP_CONFIG } from '../config/app-config';
import { secureStorage } from '../services/secureStore';
import { ApiErrorResponse } from '../types/auth';

import { Platform } from 'react-native';

// ──────────────────────────────────────────────────
// AbortController registry – every request gets a signal
// so we can cancel all in-flight requests on logout.
// ──────────────────────────────────────────────────
const activeControllers = new Set<AbortController>();

/**
 * Cancel every in-flight Axios request tracked by this module.
 * Called by the session-lifecycle service on logout.
 */
export function cancelAllPendingRequests(): void {
  activeControllers.forEach((controller) => {
    try {
      controller.abort();
    } catch {
      // already aborted – safe to ignore
    }
  });
  activeControllers.clear();
}

// Flag to prevent recursive 401 → logout → 401 loops
let isLoggingOut = false;
export function setLoggingOutFlag(value: boolean): void {
  isLoggingOut = value;
}

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
    // Request Interceptor: Attach JWT Bearer token from SecureStore + AbortController
    this.instance.interceptors.request.use(
      async (config) => {
        // Always read the freshest token (important after account switch)
        const token = await secureStorage.getAccessToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        } else if (!token && config.headers && config.headers.Authorization && !config.url?.includes('/auth/')) {
          delete config.headers.Authorization;
        }

        // Attach an AbortController signal so we can cancel mid-flight
        if (!config.signal) {
          const controller = new AbortController();
          config.signal = controller.signal;
          activeControllers.add(controller);

          // Automatically clean up once request settles
          const cleanup = () => activeControllers.delete(controller);
          config.signal.addEventListener('abort', cleanup, { once: true });
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
        // Remove controller from active set on success
        if (response.config.signal) {
          activeControllers.forEach((c) => {
            if (c.signal === response.config.signal) activeControllers.delete(c);
          });
        }
        console.log(`[ApiClient] Response <- ${response.status} ${response.config.url}`);
        return response;
      },
      async (error: AxiosError<ApiErrorResponse>) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
        console.log(`[ApiClient] Request failed: ${error.config?.baseURL || ''}${error.config?.url} | status: ${error.response?.status || 'NO_RESPONSE'}`);

        // ── 401 Auto-logout ────────────────────────────
        if (
          error.response?.status === 401 &&
          !isLoggingOut &&
          !originalRequest?._retry
        ) {
          // Lazy import to avoid circular dependency at module load time
          try {
            const { logoutAndResetSession } = require('../services/sessionLifecycle');
            logoutAndResetSession().catch(() => {});
          } catch {
            // sessionLifecycle not yet loaded – ignore
          }
        }

        // If network error occurred and not retried yet, try fallback candidates in development mode only
        if (env.IS_DEV && !error.response && originalRequest && !originalRequest._retry) {
          originalRequest._retry = true;
          const currentBase = this.instance.defaults.baseURL || '';

          const candidates = ['https://aisaconnectback-anaqbuapb6c6apgy.centralindia-01.azurewebsites.net'];

          for (const fallbackUrl of candidates) {
            if (fallbackUrl !== currentBase) {
              console.log(`[ApiClient] Retrying request with candidate: ${fallbackUrl}${originalRequest.url}...`);
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
