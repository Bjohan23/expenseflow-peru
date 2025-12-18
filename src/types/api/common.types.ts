import { z } from 'zod';

// Generic API response wrapper
export const apiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
  errors: z.array(z.string()).optional(),
});

export type ApiResponse<T = any> = z.infer<typeof apiResponseSchema> & {
  data?: T;
};

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
  hasNextPage: z.boolean(),
  hasPreviousPage: z.boolean(),
});

export type Pagination = z.infer<typeof paginationSchema>;

// Paginated response schema
export const paginatedResponseSchema = <T>(itemSchema: z.ZodType<T>) =>
  z.object({
    data: z.array(itemSchema),
    pagination: paginationSchema,
  });

// Error response schema
export const errorResponseSchema = z.object({
  success: z.literal(false),
  message: z.string(),
  errors: z.array(z.string()).optional(),
  code: z.string().optional(),
  timestamp: z.string().datetime().optional(),
  correlationId: z.string().optional(),
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;

// File upload response schema
export const fileUploadResponseSchema = z.object({
  id: z.string().uuid(),
  fileName: z.string(),
  originalName: z.string(),
  fileUrl: z.string().url(),
  fileSize: z.number(),
  mimeType: z.string(),
  uploadedAt: z.string().datetime(),
});

export type FileUploadResponse = z.infer<typeof fileUploadResponseSchema>;

// Sort order enum
export const sortOrderEnum = z.enum(['asc', 'desc']);

export type SortOrder = z.infer<typeof sortOrderEnum>;

// Common date range schema
export const dateRangeSchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export type DateRange = z.infer<typeof dateRangeSchema>;

// Base entity schema (common fields)
export const baseEntitySchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type BaseEntity = z.infer<typeof baseEntitySchema>;

// Active status enum
export const activeStatusEnum = z.enum(['active', 'inactive']);

export type ActiveStatus = z.infer<typeof activeStatusEnum>;

// Company schema (simplified)
export const companySchema = baseEntitySchema.extend({
  name: z.string().min(1, 'Company name is required'),
  ruc: z.string().length(11, 'RUC must be 11 characters'),
  businessName: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  isActive: z.boolean(),
});

export type Company = z.infer<typeof companySchema>;

// Branch schema (simplified)
export const branchSchema = baseEntitySchema.extend({
  name: z.string().min(1, 'Branch name is required'),
  code: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  companyId: z.string().uuid(),
  isActive: z.boolean(),
});

export type Branch = z.infer<typeof branchSchema>;

// User schema (simplified)
export const userSchema = baseEntitySchema.extend({
  email: z.string().email(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  role: z.enum(['admin', 'responsable', 'aprobador', 'colaborador']),
  isActive: z.boolean(),
  lastLogin: z.string().datetime().nullable(),
});

export type User = z.infer<typeof userSchema>;