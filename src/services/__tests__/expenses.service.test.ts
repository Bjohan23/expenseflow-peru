import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AxiosInstance } from 'axios';
import { ExpensesService } from '../expenses.service';
import { Expense, CreateExpensePayload, ExpenseFilters, ExpenseCategory } from '@/types/api';

// Mock de la dependencia axios
vi.mock('axios', () => ({
  default: vi.fn(),
}));

describe('ExpensesService', () => {
  let expensesService: ExpensesService;
  let mockHttpClient: AxiosInstance;

  beforeEach(() => {
    vi.clearAllMocks();

    mockHttpClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    } as any;

    expensesService = new ExpensesService(mockHttpClient);
  });

  describe('getExpenses', () => {
    it('should get expenses list successfully', async () => {
      // Arrange
      const filters: ExpenseFilters = {
        page: 1,
        limit: 20,
        status: 'borrador'
      };

      const mockResponse = {
        data: [
          {
            id: 'expense-1',
            title: 'Test Expense',
            amount: 100.50,
            currency: 'PEN',
            date: '2024-01-01T00:00:00Z',
            status: 'borrador',
            categoryId: 'category-1',
            companyId: 'company-1',
            createdBy: {
              id: 'user-1',
              firstName: 'Test',
              lastName: 'User',
              email: 'test@example.com'
            },
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          }
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false
        }
      };

      (mockHttpClient.get as any).mockResolvedValue({
        data: mockResponse
      });

      // Act
      const result = await expensesService.getExpenses(filters);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/api/v1/treasury/gastos/',
        { params: filters }
      );
    });

    it('should handle get expenses failure', async () => {
      // Arrange
      const error = new Error('Failed to fetch expenses');
      (mockHttpClient.get as any).mockRejectedValue(error);

      // Act
      const result = await expensesService.getExpenses();

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch expenses');
    });
  });

  describe('getExpenseById', () => {
    it('should get expense by ID successfully', async () => {
      // Arrange
      const expenseId = 'expense-1';
      const mockExpense: Expense = {
        id: expenseId,
        title: 'Test Expense',
        amount: 100.50,
        currency: 'PEN',
        date: '2024-01-01T00:00:00Z',
        status: 'borrador',
        categoryId: 'category-1',
        companyId: 'company-1',
        createdBy: {
          id: 'user-1',
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com'
        },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      };

      (mockHttpClient.get as any).mockResolvedValue({
        data: mockExpense
      });

      // Act
      const result = await expensesService.getExpenseById(expenseId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockExpense);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        `/api/v1/treasury/gastos/${expenseId}/`
      );
    });
  });

  describe('createExpense', () => {
    it('should create expense successfully', async () => {
      // Arrange
      const payload: CreateExpensePayload = {
        title: 'New Expense',
        amount: 150.00,
        currency: 'PEN',
        date: '2024-01-01T00:00:00Z',
        categoryId: 'category-1',
        companyId: 'company-1'
      };

      const mockExpense: Expense = {
        id: 'new-expense-1',
        ...payload,
        date: payload.date,
        status: 'borrador',
        createdBy: {
          id: 'user-1',
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com'
        },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      };

      (mockHttpClient.post as any).mockResolvedValue({
        data: mockExpense
      });

      // Act
      const result = await expensesService.createExpense(payload);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockExpense);
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/api/v1/treasury/gastos/',
        payload
      );
    });
  });

  describe('performExpenseAction', () => {
    it('should approve expense successfully', async () => {
      // Arrange
      const expenseId = 'expense-1';
      const actionPayload = {
        action: 'approve' as const,
        observations: 'Approved expense'
      };

      const mockExpense: Expense = {
        id: expenseId,
        title: 'Test Expense',
        amount: 100.50,
        currency: 'PEN',
        date: '2024-01-01T00:00:00Z',
        status: 'aprobado',
        categoryId: 'category-1',
        companyId: 'company-1',
        createdBy: {
          id: 'user-1',
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com'
        },
        approvedBy: {
          id: 'user-2',
          firstName: 'Approver',
          lastName: 'User',
          email: 'approver@example.com'
        },
        approvedAt: '2024-01-01T12:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T12:00:00Z'
      };

      (mockHttpClient.post as any).mockResolvedValue({
        data: mockExpense
      });

      // Act
      const result = await expensesService.performExpenseAction(expenseId, actionPayload);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockExpense);
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        `/api/v1/treasury/gastos/${expenseId}/approve/`,
        actionPayload
      );
    });
  });

  describe('uploadExpenseEvidence', () => {
    it('should upload file successfully', async () => {
      // Arrange
      const expenseId = 'expense-1';
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });

      const mockResponse = {
        id: 'evidence-1',
        fileName: 'test.pdf',
        fileUrl: 'https://example.com/files/test.pdf',
        fileSize: file.size,
        mimeType: file.type,
        uploadedAt: '2024-01-01T00:00:00Z'
      };

      (mockHttpClient.post as any).mockResolvedValue({
        data: mockResponse
      });

      // Act
      const result = await expensesService.uploadExpenseEvidence(expenseId, file);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        `/api/v1/treasury/gastos/${expenseId}/evidencias/add/`,
        expect.any(FormData),
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 60000
        }
      );

      // Verify FormData content
      const formDataCall = (mockHttpClient.post as any).mock.calls[0];
      const formData = formDataCall[1];
      expect(formData instanceof FormData).toBe(true);
    });
  });

  describe('getExpenseCategoriesSelector', () => {
    it('should get expense categories for selector successfully', async () => {
      // Arrange
      const mockCategories: ExpenseCategory[] = [
        {
          id: 'category-1',
          name: 'Viáticos',
          code: 'VIA',
          requiresEvidence: true,
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 'category-2',
          name: 'Transporte',
          code: 'TRA',
          requiresEvidence: true,
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ];

      (mockHttpClient.get as any).mockResolvedValue({
        data: mockCategories
      });

      // Act
      const result = await expensesService.getExpenseCategoriesSelector();

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/treasury/categorias-gasto/selector/');
    });
  });
});