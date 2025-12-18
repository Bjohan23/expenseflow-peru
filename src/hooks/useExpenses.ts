import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import {
  Expense,
  ExpenseListResponse,
  ExpenseFilters,
  CreateExpensePayload,
  UpdateExpensePayload,
  ExpenseActionPayload,
  ExpenseCategory,
  CategorySelector,
  API_ENDPOINTS,
} from '@/types/api';
import { expensesService } from '@/services/services';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

// Query keys for expenses
export const expensesKeys = {
  all: ['expenses'] as const,
  lists: () => [...expensesKeys.all, 'list'] as const,
  list: (filters?: ExpenseFilters) => [...expensesKeys.lists(), filters] as const,
  details: () => [...expensesKeys.all, 'detail'] as const,
  detail: (id: string) => [...expensesKeys.details(), id] as const,
  categories: () => [...expensesKeys.all, 'categories'] as const,
  categorySelector: () => [...expensesKeys.categories(), 'selector'] as const,
  statistics: (filters?: ExpenseFilters) => [...expensesKeys.all, 'statistics', filters] as const,
} as const;

// Types for mutation responses
type ExpenseMutationResult = Expense;
type ExpenseListResult = ExpenseListResponse;
type ExpenseCategoryResult = ExpenseCategory;
type CategorySelectorResult = CategorySelector[];
type FileUploadResult = File;

// Default query options
const defaultQueryOptions = {
  staleTime: 1000 * 60 * 5, // 5 minutes
  gcTime: 1000 * 60 * 10, // 10 minutes (was cacheTime)
  retry: 3,
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
};

// Default mutation options
const defaultMutationOptions = {
  onError: (error: Error) => {
    console.error('Mutation error:', error);
    toast.error(error.message || 'An error occurred');
  },
};

// Get expenses list hook
export const useExpenses = (
  filters?: ExpenseFilters,
  options?: Omit<UseQueryOptions<ExpenseListResult>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: expensesKeys.list(filters),
    queryFn: async () => {
      const result = await expensesService.getExpenses(filters);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch expenses');
      }
      return result.data;
    },
    ...defaultQueryOptions,
    ...options,
  });
};

// Get expense by ID hook
export const useExpense = (
  id: string,
  options?: Omit<UseQueryOptions<ExpenseMutationResult>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: expensesKeys.detail(id),
    queryFn: async () => {
      const result = await expensesService.getExpenseById(id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch expense');
      }
      return result.data;
    },
    enabled: !!id,
    ...defaultQueryOptions,
    ...options,
  });
};

// Create expense mutation hook
export const useCreateExpense = (
  options?: UseMutationOptions<
    ExpenseMutationResult,
    Error,
    CreateExpensePayload
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateExpensePayload) => {
      const result = await expensesService.createExpense(payload);
      if (!result.success) {
        throw new Error(result.error || 'Failed to create expense');
      }
      return result.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch expenses list
      queryClient.invalidateQueries({ queryKey: expensesKeys.lists() });

      // Optionally pre-populate the new expense in cache
      queryClient.setQueryData(
        expensesKeys.detail(data.id),
        data
      );

      toast.success('Expense created successfully');
    },
    ...defaultMutationOptions,
    ...options,
  });
};

// Update expense mutation hook
export const useUpdateExpense = (
  options?: UseMutationOptions<
    ExpenseMutationResult,
    Error,
    { id: string; payload: UpdateExpensePayload }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }) => {
      const result = await expensesService.updateExpense(id, payload);
      if (!result.success) {
        throw new Error(result.error || 'Failed to update expense');
      }
      return result.data;
    },
    onSuccess: (data, variables) => {
      // Update the specific expense in cache
      queryClient.setQueryData(
        expensesKeys.detail(variables.id),
        data
      );

      // Invalidate and refetch expenses list
      queryClient.invalidateQueries({ queryKey: expensesKeys.lists() });

      toast.success('Expense updated successfully');
    },
    ...defaultMutationOptions,
    ...options,
  });
};

// Delete expense mutation hook
export const useDeleteExpense = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await expensesService.deleteExpense(id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete expense');
      }
    },
    onSuccess: (_, id) => {
      // Remove the specific expense from cache
      queryClient.removeQueries({ queryKey: expensesKeys.detail(id) });

      // Invalidate and refetch expenses list
      queryClient.invalidateQueries({ queryKey: expensesKeys.lists() });

      toast.success('Expense deleted successfully');
    },
    ...defaultMutationOptions,
    ...options,
  });
};

// Perform expense action mutation hook
export const useExpenseAction = (
  options?: UseMutationOptions<
    ExpenseMutationResult,
    Error,
    { id: string; actionPayload: ExpenseActionPayload }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, actionPayload }) => {
      const result = await expensesService.performExpenseAction(id, actionPayload);
      if (!result.success) {
        throw new Error(result.error || 'Failed to perform action on expense');
      }
      return result.data;
    },
    onSuccess: (data, variables) => {
      // Update the specific expense in cache
      queryClient.setQueryData(
        expensesKeys.detail(variables.id),
        data
      );

      // Invalidate and refetch expenses list
      queryClient.invalidateQueries({ queryKey: expensesKeys.lists() });

      // Show success message based on action
      const actionMessages = {
        approve: 'Expense approved successfully',
        reject: 'Expense rejected',
        pay: 'Expense marked as paid',
        cancel: 'Expense cancelled',
      };

      toast.success(actionMessages[variables.actionPayload.action] || 'Action completed successfully');
    },
    ...defaultMutationOptions,
    ...options,
  });
};

// Upload expense evidence mutation hook
export const useUploadExpenseEvidence = (
  options?: UseMutationOptions<
    any, // FileUploadResponse
    Error,
    { id: string; file: File }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, file }) => {
      const result = await expensesService.uploadExpenseEvidence(id, file);
      if (!result.success) {
        throw new Error(result.error || 'Failed to upload evidence');
      }
      return result.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch the specific expense to show updated evidence
      queryClient.invalidateQueries({ queryKey: expensesKeys.detail(variables.id) });

      toast.success('Evidence uploaded successfully');
    },
    ...defaultMutationOptions,
    ...options,
  });
};

// Delete expense evidence mutation hook
export const useDeleteExpenseEvidence = (
  options?: UseMutationOptions<
    void,
    Error,
    { id: string; evidenceId: string }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, evidenceId }) => {
      const result = await expensesService.deleteExpenseEvidence(id, evidenceId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete evidence');
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch the specific expense to show updated evidence
      queryClient.invalidateQueries({ queryKey: expensesKeys.detail(variables.id) });

      toast.success('Evidence deleted successfully');
    },
    ...defaultMutationOptions,
    ...options,
  });
};

// Get expense categories hook
export const useExpenseCategories = (
  options?: Omit<UseQueryOptions<ExpenseCategoryResult[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: expensesKeys.categories(),
    queryFn: async () => {
      const result = await expensesService.getExpenseCategories();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch expense categories');
      }
      return result.data;
    },
    ...defaultQueryOptions,
    ...options,
  });
};

// Get expense categories selector hook (simplified for dropdowns)
export const useExpenseCategoriesSelector = (
  options?: Omit<UseQueryOptions<CategorySelectorResult>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: expensesKeys.categorySelector(),
    queryFn: async () => {
      const result = await expensesService.getExpenseCategoriesSelector();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch expense categories');
      }
      return result.data;
    },
    staleTime: 1000 * 60 * 30, // Categories change rarely, cache for 30 minutes
    ...defaultQueryOptions,
    ...options,
  });
};

// Get expense statistics hook
export const useExpenseStatistics = (
  filters?: ExpenseFilters,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: expensesKeys.statistics(filters),
    queryFn: async () => {
      const result = await expensesService.getExpenseStatistics(filters);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch expense statistics');
      }
      return result.data;
    },
    ...defaultQueryOptions,
    ...options,
  });
};

// Export expenses hook
export const useExportExpenses = (
  options?: UseMutationOptions<
    Blob,
    Error,
    { filters?: ExpenseFilters; format?: 'excel' | 'pdf' }
  >
) => {
  return useMutation({
    mutationFn: async ({ filters, format = 'excel' }) => {
      const result = await expensesService.exportExpenses(filters, format);
      if (!result.success) {
        throw new Error(result.error || 'Failed to export expenses');
      }
      return result.data;
    },
    onSuccess: (blob, variables) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `expenses.${variables.format || 'excel'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Expenses exported successfully');
    },
    ...defaultMutationOptions,
    ...options,
  });
};

// Custom hook for expense operations with role-based permissions
export const useExpenseOperations = () => {
  const { hasAnyRole } = useAuth();

  const canCreate = hasAnyRole(['colaborador', 'responsable', 'admin']);
  const canEdit = hasAnyRole(['colaborador', 'responsable', 'admin']);
  const canDelete = hasAnyRole(['responsable', 'admin']);
  const canApprove = hasAnyRole(['aprobador', 'responsable', 'admin']);
  const canPay = hasAnyRole(['aprobador', 'responsable', 'admin']);
  const canCancel = hasAnyRole(['colaborador', 'aprobador', 'responsable', 'admin']);

  return {
    canCreate,
    canEdit,
    canDelete,
    canApprove,
    canPay,
    canCancel,
    create: useCreateExpense(),
    update: useUpdateExpense(),
    delete: useDeleteExpense(),
    approve: (id: string, observations?: string) =>
      useExpenseAction().mutateAsync({
        id,
        actionPayload: { action: 'approve', observations },
      }),
    reject: (id: string, observations?: string) =>
      useExpenseAction().mutateAsync({
        id,
        actionPayload: { action: 'reject', observations },
      }),
    pay: (id: string, observations?: string, paymentMethod?: string) =>
      useExpenseAction().mutateAsync({
        id,
        actionPayload: { action: 'pay', observations, paymentMethod },
      }),
    cancel: (id: string, observations?: string) =>
      useExpenseAction().mutateAsync({
        id,
        actionPayload: { action: 'cancel', observations },
      }),
    uploadEvidence: useUploadExpenseEvidence(),
    deleteEvidence: useDeleteExpenseEvidence(),
    export: useExportExpenses(),
  };
};