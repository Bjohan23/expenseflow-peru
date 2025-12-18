import { AxiosInstance } from 'axios';
import {
  Expense,
  ExpenseListResponse,
  CreateExpensePayload,
  UpdateExpensePayload,
  ExpenseFilters,
  ExpenseActionPayload,
  ExpenseCategory,
  CategorySelector,
  expenseSchema,
  expenseListResponseSchema,
  createExpenseSchema,
  updateExpenseSchema,
  expenseActionSchema,
  expenseCategorySchema,
  categorySelectorSchema,
  API_ENDPOINTS,
  ApiServiceResponse,
} from '@/types/api';
import { FileUploadResponse } from '@/types/api';

export class ExpensesService {
  constructor(private readonly http: AxiosInstance) {}

  /**
   * Get paginated list of expenses with optional filters
   */
  async getExpenses(filters: ExpenseFilters = {}): Promise<ApiServiceResponse<ExpenseListResponse>> {
    try {
      const response = await this.http.get<ExpenseListResponse>(
        API_ENDPOINTS.EXPENSES.LIST,
        { params: filters }
      );

      // Validate response data with Zod schema
      const validatedData = expenseListResponseSchema.parse(response.data);

      return {
        success: true,
        data: validatedData,
      };
    } catch (error: any) {
      console.error('Get expenses error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get expenses',
      };
    }
  }

  /**
   * Get expense by ID
   */
  async getExpenseById(id: string): Promise<ApiServiceResponse<Expense>> {
    try {
      const response = await this.http.get<Expense>(
        API_ENDPOINTS.EXPENSES.DETAIL(id)
      );

      // Validate response data with Zod schema
      const validatedData = expenseSchema.parse(response.data);

      return {
        success: true,
        data: validatedData,
      };
    } catch (error: any) {
      console.error(`Get expense ${id} error:`, error);
      return {
        success: false,
        error: error.message || 'Failed to get expense',
      };
    }
  }

  /**
   * Create a new expense
   */
  async createExpense(payload: CreateExpensePayload): Promise<ApiServiceResponse<Expense>> {
    try {
      // Validate payload with Zod schema
      const validatedPayload = createExpenseSchema.parse(payload);

      const response = await this.http.post<Expense>(
        API_ENDPOINTS.EXPENSES.CREATE,
        validatedPayload
      );

      // Validate response data with Zod schema
      const validatedData = expenseSchema.parse(response.data);

      return {
        success: true,
        data: validatedData,
      };
    } catch (error: any) {
      console.error('Create expense error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create expense',
      };
    }
  }

  /**
   * Update an existing expense
   */
  async updateExpense(id: string, payload: UpdateExpensePayload): Promise<ApiServiceResponse<Expense>> {
    try {
      // Validate payload with Zod schema
      const validatedPayload = updateExpenseSchema.parse(payload);

      const response = await this.http.put<Expense>(
        API_ENDPOINTS.EXPENSES.UPDATE(id),
        validatedPayload
      );

      // Validate response data with Zod schema
      const validatedData = expenseSchema.parse(response.data);

      return {
        success: true,
        data: validatedData,
      };
    } catch (error: any) {
      console.error(`Update expense ${id} error:`, error);
      return {
        success: false,
        error: error.message || 'Failed to update expense',
      };
    }
  }

  /**
   * Delete an expense
   */
  async deleteExpense(id: string): Promise<ApiServiceResponse<void>> {
    try {
      await this.http.delete(API_ENDPOINTS.EXPENSES.DELETE(id));

      return {
        success: true,
      };
    } catch (error: any) {
      console.error(`Delete expense ${id} error:`, error);
      return {
        success: false,
        error: error.message || 'Failed to delete expense',
      };
    }
  }

  /**
   * Perform action on expense (approve, reject, pay, cancel)
   */
  async performExpenseAction(id: string, actionPayload: ExpenseActionPayload): Promise<ApiServiceResponse<Expense>> {
    try {
      // Validate payload with Zod schema
      const validatedPayload = expenseActionSchema.parse(actionPayload);

      const response = await this.http.post<Expense>(
        API_ENDPOINTS.EXPENSES.ACTION(id, validatedPayload.action),
        validatedPayload
      );

      // Validate response data with Zod schema
      const validatedData = expenseSchema.parse(response.data);

      return {
        success: true,
        data: validatedData,
      };
    } catch (error: any) {
      console.error(`Perform action ${actionPayload.action} on expense ${id} error:`, error);
      return {
        success: false,
        error: error.message || 'Failed to perform action on expense',
      };
    }
  }

  /**
   * Upload evidence file for expense
   */
  async uploadExpenseEvidence(id: string, file: File): Promise<ApiServiceResponse<FileUploadResponse>> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await this.http.post<FileUploadResponse>(
        API_ENDPOINTS.EXPENSES.EVIDENCE.UPLOAD(id),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          // Override timeout for file uploads (longer timeout)
          timeout: 60000, // 60 seconds
        }
      );

      // Validate response data with Zod schema
      const validatedData = response.data; // FileUploadResponse schema should be defined

      return {
        success: true,
        data: validatedData,
      };
    } catch (error: any) {
      console.error(`Upload evidence for expense ${id} error:`, error);
      return {
        success: false,
        error: error.message || 'Failed to upload evidence',
      };
    }
  }

  /**
   * Delete evidence file from expense
   */
  async deleteExpenseEvidence(id: string, evidenceId: string): Promise<ApiServiceResponse<void>> {
    try {
      await this.http.delete(
        API_ENDPOINTS.EXPENSES.EVIDENCE.DELETE(id, evidenceId)
      );

      return {
        success: true,
      };
    } catch (error: any) {
      console.error(`Delete evidence ${evidenceId} from expense ${id} error:`, error);
      return {
        success: false,
        error: error.message || 'Failed to delete evidence',
      };
    }
  }

  /**
   * Get expense categories (full details)
   */
  async getExpenseCategories(): Promise<ApiServiceResponse<ExpenseCategory[]>> {
    try {
      const response = await this.http.get<ExpenseCategory[]>(
        API_ENDPOINTS.CATEGORIES.LIST
      );

      // Validate response data with Zod schema
      const validatedData = response.data.map(category =>
        expenseCategorySchema.parse(category)
      );

      return {
        success: true,
        data: validatedData,
      };
    } catch (error: any) {
      console.error('Get expense categories error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get expense categories',
      };
    }
  }

  /**
   * Get expense categories (simplified for dropdowns/selectors)
   */
  async getExpenseCategoriesSelector(): Promise<ApiServiceResponse<CategorySelector[]>> {
    try {
      const response = await this.http.get<CategorySelector[]>(
        API_ENDPOINTS.CATEGORIES.SELECTOR
      );

      // Validate response data with Zod schema
      const validatedData = response.data.map(category =>
        categorySelectorSchema.parse(category)
      );

      return {
        success: true,
        data: validatedData,
      };
    } catch (error: any) {
      console.error('Get expense categories selector error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get expense categories',
      };
    }
  }

  /**
   * Create expense category
   */
  async createExpenseCategory(payload: Partial<ExpenseCategory>): Promise<ApiServiceResponse<ExpenseCategory>> {
    try {
      const response = await this.http.post<ExpenseCategory>(
        API_ENDPOINTS.CATEGORIES.CREATE,
        payload
      );

      // Validate response data with Zod schema
      const validatedData = expenseCategorySchema.parse(response.data);

      return {
        success: true,
        data: validatedData,
      };
    } catch (error: any) {
      console.error('Create expense category error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create expense category',
      };
    }
  }

  /**
   * Get expense statistics
   */
  async getExpenseStatistics(filters: ExpenseFilters = {}): Promise<ApiServiceResponse<any>> {
    try {
      const response = await this.http.get('/api/v1/treasury/gastos/statistics/', {
        params: filters,
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('Get expense statistics error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get expense statistics',
      };
    }
  }

  /**
   * Export expenses to Excel/PDF
   */
  async exportExpenses(filters: ExpenseFilters = {}, format: 'excel' | 'pdf' = 'excel'): Promise<ApiServiceResponse<Blob>> {
    try {
      const response = await this.http.get('/api/v1/treasury/gastos/export/', {
        params: { ...filters, format },
        responseType: 'blob',
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('Export expenses error:', error);
      return {
        success: false,
        error: error.message || 'Failed to export expenses',
      };
    }
  }
}

// Factory function for creating expenses service with dependency injection
export const createExpensesService = (http: AxiosInstance): ExpensesService => {
  return new ExpensesService(http);
};

// Default export for convenience
export default ExpensesService;