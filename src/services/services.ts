import { createServices } from './index';
import { createApiClient } from '@/lib/api-client';

// Create API client instance
const apiClient = createApiClient();

// Initialize services with the API client
const services = createServices(apiClient);

// Get instances for direct use
export const authService = services.authService;
export const expensesService = services.expensesService;

// Re-export the create functions for backward compatibility
export { createAuthService, createExpensesService } from './index';