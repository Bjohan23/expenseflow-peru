import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { config } from './config';

// Configuration constants
const REQUEST_TIMEOUT = config.apiTimeout;
const MAX_RETRIES = 3;
const BASE_URL = config.apiUrl;

// Storage keys
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Interface for token storage
interface TokenStorage {
  getAccessToken(): string | null;
  getRefreshToken(): string | null;
  setTokens(accessToken: string, refreshToken: string): void;
  clearTokens(): void;
}

// Implementation of token storage using localStorage
class LocalStorageTokenStorage implements TokenStorage {
  getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  clearTokens(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

// Utility for generating correlation IDs
const generateCorrelationId = (): string => {
  return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Retry configuration with exponential backoff
const getRetryDelay = (retryCount: number): number => {
  const baseDelay = 1000; // 1 second
  return baseDelay * Math.pow(2, retryCount) + Math.random() * 1000;
};

// Determine if request should be retried
const shouldRetry = (error: AxiosError): boolean => {
  if (!error.config) return false;

  // Don't retry if it's a POST/PUT/DELETE request
  const method = error.config.method?.toUpperCase();
  if (method && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    return false;
  }

  // Retry on network errors or 5xx server errors
  return (
    !error.response ||
    error.response.status >= 500 ||
    error.code === 'NETWORK_ERROR' ||
    error.code === 'TIMEOUT'
  );
};

// Create and configure Axios instance
export const createApiClient = (
  tokenStorage: TokenStorage = new LocalStorageTokenStorage()
): AxiosInstance => {
  const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 30000, // 30 segundos para desarrollo
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    // Configuración para CORS
    withCredentials: false,
  });

  // Request interceptor for adding auth token and correlation ID
  apiClient.interceptors.request.use(
    (config: AxiosRequestConfig) => {
      // Add correlation ID for tracking
      config.headers = config.headers || {};
      config.headers['X-Correlation-ID'] = generateCorrelationId();

      // Add authorization token if available
      const token = tokenStorage.getAccessToken();
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }

      // Log request details for debugging
      if (import.meta.env.DEV) {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
          headers: config.headers,
          data: config.data,
          correlationId: config.headers['X-Correlation-ID'],
        });
      }

      return config;
    },
    (error: AxiosError) => {
      console.error('❌ Request interceptor error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor for error handling and token refresh
  apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
      // Log successful response for debugging
      if (import.meta.env.DEV) {
        console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
          status: response.status,
          data: response.data,
          correlationId: response.config.headers?.['X-Correlation-ID'],
        });
      }

      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as AxiosRequestConfig & { _retryCount?: number };

      // Log error with correlation ID
      const correlationId = originalRequest?.headers?.['X-Correlation-ID'] as string;
      console.error(`❌ API Error: ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`, {
        status: error.response?.status,
        message: error.message,
        correlationId,
        data: error.response?.data,
      });

      // Handle 401 Unauthorized - try to refresh token
      if (error.response?.status === 401 && !originalRequest?._retryCount) {
        try {
          const refreshToken = tokenStorage.getRefreshToken();
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          // Attempt to refresh the token
          const refreshResponse = await axios.post(`${BASE_URL}/api/v1/auth/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = refreshResponse.data;
          const newRefreshToken = refreshResponse.data.refresh || refreshToken;

          tokenStorage.setTokens(access, newRefreshToken);

          // Update the authorization header and retry the original request
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers['Authorization'] = `Bearer ${access}`;
          originalRequest._retryCount = 0; // Reset retry count for token refresh

          return apiClient(originalRequest);
        } catch (refreshError) {
          // Token refresh failed, clear tokens and redirect to login
          tokenStorage.clearTokens();

          // Use window.location for redirect to ensure full page reload
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }

          return Promise.reject(refreshError);
        }
      }

      // Handle 403 Forbidden
      if (error.response?.status === 403) {
        const errorMessage = 'Access denied. You do not have permission to perform this action.';
        // You could dispatch a toast notification here
        console.error('🚫 Access denied:', errorMessage);
        return Promise.reject(new Error(errorMessage));
      }

      // Handle server errors with retry logic
      if (shouldRetry(error)) {
        const retryCount = originalRequest?._retryCount || 0;

        if (retryCount < MAX_RETRIES) {
          // Increment retry count
          originalRequest._retryCount = retryCount + 1;

          // Calculate delay with exponential backoff
          const delay = getRetryDelay(retryCount);

          console.log(`🔄 Retrying request (${retryCount + 1}/${MAX_RETRIES}) after ${delay}ms:`, originalRequest?.url);

          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, delay));

          return apiClient(originalRequest);
        }
      }

      // Handle other HTTP errors
      let errorMessage = 'An unexpected error occurred';

      if (error.response?.status && error.response.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.code === 'TIMEOUT') {
        errorMessage = 'Request timed out. Please try again.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      return Promise.reject(new Error(errorMessage));
    }
  );

  return apiClient;
};

// Export default instance
export const apiClient = createApiClient();

// Export types for dependency injection
export type { TokenStorage, LocalStorageTokenStorage };
export { BASE_URL, REQUEST_TIMEOUT, MAX_RETRIES };