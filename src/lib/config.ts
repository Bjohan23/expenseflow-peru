// Application configuration from environment variables
export const config = {
  // API Configuration
  apiUrl: import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:8000'),
  apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000'),

  // Feature flags
  enableRequestLogging: import.meta.env.VITE_ENABLE_REQUEST_LOGGING === 'true',
  enableMockData: import.meta.env.VITE_ENABLE_MOCK_DATA === 'true',

  // App info
  appName: 'ExpenseFlow Peru',
  version: '2.0.0', // New version for API migration
  environment: import.meta.env.MODE,

  // File upload limits
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedFileTypes: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
  ],

  // Token settings
  tokenRefreshThreshold: 300, // 5 minutes before expiry
  maxLoginAttempts: 3,

  // Pagination defaults
  defaultPageSize: 20,
  maxPageSize: 100,

  // Cache settings (in milliseconds)
  cacheStaleTime: 5 * 60 * 1000, // 5 minutes
  cacheGarbageCollectionTime: 10 * 60 * 1000, // 10 minutes
};

// Type guards for configuration
export const isConfigValid = (): boolean => {
  return !!(
    config.apiUrl &&
    config.apiTimeout > 0 &&
    config.maxFileSize > 0 &&
    config.defaultPageSize > 0 &&
    config.maxPageSize > 0
  );
};

// Development/Production helpers
export const isDevelopment = (): boolean => {
  return import.meta.env.DEV;
};

export const isProduction = (): boolean => {
  return import.meta.env.PROD;
};

export const isTest = (): boolean => {
  return import.meta.env.MODE === 'test';
};

// Log configuration in development
if (isDevelopment()) {
  console.log('🔧 Application Configuration:', {
    ...config,
    // Don't log sensitive data
  });
}

export default config;