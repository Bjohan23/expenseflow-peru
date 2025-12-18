import { AuthService, createAuthService as createAuthServiceFn } from './auth.service';
import { ExpensesService, createExpensesService as createExpensesServiceFn } from './expenses.service';

// Re-export the create functions with consistent names
export const createAuthService = createAuthServiceFn;
export const createExpensesService = createExpensesServiceFn;

// Re-export the classes
export { AuthService, ExpensesService };

// Service factory for creating all services with the same HTTP client
export interface ServiceContainer {
  authService: AuthService;
  expensesService: ExpensesService;
}

export const createServices = (httpClient: import('axios').AxiosInstance): ServiceContainer => {
  return {
    authService: createAuthService(httpClient),
    expensesService: createExpensesService(httpClient),
  };
};

// Service registry to avoid circular dependencies
let servicesRegistry: ServiceContainer | null = null;

export const initializeServices = (httpClient: import('axios').AxiosInstance): void => {
  servicesRegistry = createServices(httpClient);
};

export const getAuthService = (): AuthService => {
  if (!servicesRegistry) {
    throw new Error('Services not initialized. Call initializeServices() first.');
  }
  return servicesRegistry.authService;
};

export const getExpensesService = (): ExpensesService => {
  if (!servicesRegistry) {
    throw new Error('Services not initialized. Call initializeServices() first.');
  }
  return servicesRegistry.expensesService;
};