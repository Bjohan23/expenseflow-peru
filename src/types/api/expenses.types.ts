import { z } from 'zod';

// Expense category schema
export const expenseCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Category name is required'),
  code: z.string().optional(),
  description: z.string().nullable().optional(),
  isActive: z.boolean(),
  requiresEvidence: z.boolean().default(true),
  maxAmount: z.number().positive().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type ExpenseCategory = z.infer<typeof expenseCategorySchema>;

// Expense status enum
export const expenseStatusEnum = z.enum([
  'borrador', // draft
  'pendiente', // pending approval
  'aprobado', // approved
  'pagado', // paid
  'rechazado', // rejected
  'anulado', // cancelled
]);

export type ExpenseStatus = z.infer<typeof expenseStatusEnum>;

// Currency enum
export const currencyEnum = z.enum(['PEN', 'USD', 'EUR']);

export type Currency = z.infer<typeof currencyEnum>;

// Expense schema
export const expenseSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().nullable().optional(),
  amount: z.number().positive('Amount must be positive'),
  currency: currencyEnum.default('PEN'),
  exchangeRate: z.number().positive().optional(),
  amountInPEN: z.number().positive().optional(),
  date: z.string().datetime(), // ISO datetime string
  category: expenseCategorySchema.optional(),
  categoryId: z.string().uuid().optional(),
  status: expenseStatusEnum.default('borrador'),
  evidence: z.array(z.object({
    id: z.string().uuid(),
    fileName: z.string(),
    fileUrl: z.string().url(),
    fileSize: z.number(),
    mimeType: z.string(),
    uploadedAt: z.string().datetime(),
  })).optional(),
  company: z.object({
    id: z.string().uuid(),
    name: z.string(),
    ruc: z.string(),
  }).optional(),
  companyId: z.string().uuid(),
  branch: z.object({
    id: z.string().uuid(),
    name: z.string(),
  }).optional(),
  branchId: z.string().uuid().optional(),
  createdBy: z.object({
    id: z.string().uuid(),
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
    email: z.string().email(),
  }),
  approvedBy: z.object({
    id: z.string().uuid(),
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
    email: z.string().email(),
  }).nullable().optional(),
  approvedAt: z.string().datetime().nullable().optional(),
  paidAt: z.string().datetime().nullable().optional(),
  observations: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Expense = z.infer<typeof expenseSchema>;

// Create expense payload schema
export const createExpenseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  amount: z.number().positive('Amount must be positive'),
  currency: currencyEnum.default('PEN'),
  exchangeRate: z.number().positive().optional(),
  date: z.string().datetime(), // ISO datetime string
  categoryId: z.string().uuid('Category is required'),
  companyId: z.string().uuid('Company is required'),
  branchId: z.string().uuid().optional(),
  evidence: z.array(z.instanceof(File)).optional(),
  observations: z.string().optional(),
});

export type CreateExpensePayload = z.infer<typeof createExpenseSchema>;

// Update expense payload schema
export const updateExpenseSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().optional(),
  amount: z.number().positive('Amount must be positive').optional(),
  currency: currencyEnum.optional(),
  exchangeRate: z.number().positive().optional(),
  date: z.string().datetime().optional(),
  categoryId: z.string().uuid().optional(),
  branchId: z.string().uuid().optional(),
  observations: z.string().optional(),
});

export type UpdateExpensePayload = z.infer<typeof updateExpenseSchema>;

// Expense evidence file schema
export const expenseEvidenceSchema = z.object({
  id: z.string().uuid(),
  fileName: z.string(),
  fileUrl: z.string().url(),
  fileSize: z.number(),
  mimeType: z.string(),
  uploadedAt: z.string().datetime(),
});

export type ExpenseEvidence = z.infer<typeof expenseEvidenceSchema>;

// Expense filters schema
export const expenseFiltersSchema = z.object({
  status: expenseStatusEnum.optional(),
  categoryId: z.string().uuid().optional(),
  companyId: z.string().uuid().optional(),
  branchId: z.string().uuid().optional(),
  currency: currencyEnum.optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  amountMin: z.number().positive().optional(),
  amountMax: z.number().positive().optional(),
  search: z.string().optional(),
  createdBy: z.string().uuid().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'date', 'amount', 'title']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type ExpenseFilters = z.infer<typeof expenseFiltersSchema>;

// Expense list response schema
export const expenseListResponseSchema = z.object({
  data: z.array(expenseSchema),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
    hasNextPage: z.boolean(),
    hasPreviousPage: z.boolean(),
  }),
  summary: z.object({
    totalAmount: z.number(),
    totalAmountInPEN: z.number(),
    count: z.number().int().nonnegative(),
    averageAmount: z.number(),
  }).optional(),
});

export type ExpenseListResponse = z.infer<typeof expenseListResponseSchema>;

// Expense action types
export type ExpenseAction = 'approve' | 'reject' | 'pay' | 'cancel';

// Expense action payload schema
export const expenseActionSchema = z.object({
  action: z.enum(['approve', 'reject', 'pay', 'cancel']),
  observations: z.string().optional(),
  paymentMethod: z.string().optional(),
});

export type ExpenseActionPayload = z.infer<typeof expenseActionSchema>;

// Category selector response (simplified version for dropdowns)
export const categorySelectorSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  code: z.string().optional(),
  requiresEvidence: z.boolean(),
});

export type CategorySelector = z.infer<typeof categorySelectorSchema>;