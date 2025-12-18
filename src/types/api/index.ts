// Re-export all API types for easy importing
export * from './auth.types';
export * from './expenses.types';
export * from './common.types';

// Utility type for API service responses
export type ApiServiceResponse<T> = Promise<{
  success: boolean;
  data?: T;
  error?: string;
}>;

// Utility type for mutation responses
export type MutationResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

// HTTP status codes
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

// API endpoints constants
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/v1/auth/token/',
    REFRESH: '/api/v1/auth/token/refresh/',
    LOGOUT: '/api/v1/auth/users/logout/',
    PROFILE: '/api/v1/auth/users/profile/',
    ME: '/api/v1/auth/token/claims/',
  },
  EXPENSES: {
    LIST: '/api/v1/treasury/gastos/',
    CREATE: '/api/v1/treasury/gastos/',
    DETAIL: (id: string) => `/api/v1/treasury/gastos/${id}/`,
    UPDATE: (id: string) => `/api/v1/treasury/gastos/${id}/`,
    DELETE: (id: string) => `/api/v1/treasury/gastos/${id}/`,
    ACTION: (id: string, action: string) => `/api/v1/treasury/gastos/${id}/${action}/`,
    EVIDENCE: {
      UPLOAD: (id: string) => `/api/v1/treasury/gastos/${id}/evidencias/add/`,
      DELETE: (id: string, evidenceId: string) => `/api/v1/treasury/gastos/${id}/evidencias/${evidenceId}/`,
    },
  },
  CATEGORIES: {
    LIST: '/api/v1/treasury/categorias-gasto/',
    SELECTOR: '/api/v1/treasury/categorias-gasto/selector/',
    CREATE: '/api/v1/treasury/categorias-gasto/',
    UPDATE: (id: string) => `/api/v1/treasury/categorias-gasto/${id}/`,
    DELETE: (id: string) => `/api/v1/treasury/categorias-gasto/${id}/`,
  },
  COMPANIES: {
    LIST: '/api/v1/companies/',
    CREATE: '/api/v1/companies/',
    UPDATE: (id: string) => `/api/v1/companies/${id}/`,
    DELETE: (id: string) => `/api/v1/companies/${id}/`,
  },
  BRANCHES: {
    LIST: '/api/v1/branches/',
    CREATE: '/api/v1/branches/',
    UPDATE: (id: string) => `/api/v1/branches/${id}/`,
    DELETE: (id: string) => `/api/v1/branches/${id}/`,
  },
  USERS: {
    LIST: '/api/v1/users/',
    CREATE: '/api/v1/users/',
    UPDATE: (id: string) => `/api/v1/users/${id}/`,
    DELETE: (id: string) => `/api/v1/users/${id}/`,
  },
} as const;