import { z } from 'zod';

// Validación de RUC peruano (11 dígitos)
const rucRegex = /^\d{11}$/;

export const empresaSchema = z.object({
  ruc: z.string()
    .regex(rucRegex, 'RUC debe tener exactamente 11 dígitos numéricos')
    .refine((val) => val.length === 11, 'RUC debe tener 11 dígitos'),
  razon_social: z.string()
    .min(3, 'Razón social debe tener al menos 3 caracteres')
    .max(200, 'Razón social no puede exceder 200 caracteres'),
  nombre_comercial: z.string().max(200).optional(),
  direccion: z.string().min(5, 'Dirección debe tener al menos 5 caracteres').optional(),
  telefono: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  moneda: z.enum(['PEN', 'USD']),
  limite_gasto_mensual: z.number()
    .min(0, 'El límite debe ser mayor o igual a 0')
    .optional()
    .or(z.nan()),
  logo_url: z.string().url().optional().or(z.literal('')),
});

export const centroCostoSchema = z.object({
  codigo: z.string()
    .min(2, 'Código debe tener al menos 2 caracteres')
    .max(20, 'Código no puede exceder 20 caracteres'),
  nombre: z.string()
    .min(3, 'Nombre debe tener al menos 3 caracteres')
    .max(100, 'Nombre no puede exceder 100 caracteres'),
  descripcion: z.string().max(500).optional(),
  empresa_id: z.string().uuid('Debe seleccionar una empresa'),
  responsable_id: z.string().uuid('Debe seleccionar un responsable'),
  presupuesto_asignado: z.number()
    .min(0, 'El presupuesto debe ser mayor o igual a 0'),
});

export const conceptoGastoSchema = z.object({
  codigo: z.string()
    .min(2, 'Código debe tener al menos 2 caracteres')
    .max(20, 'Código no puede exceder 20 caracteres'),
  nombre: z.string()
    .min(3, 'Nombre debe tener al menos 3 caracteres')
    .max(100, 'Nombre no puede exceder 100 caracteres'),
  descripcion: z.string().max(500).optional(),
  categoria: z.enum(['viaticos', 'transporte', 'alimentacion', 'hospedaje', 'otros']),
  centro_costo_id: z.string().uuid().optional().or(z.literal('')),
  requiere_aprobacion: z.boolean(),
  limite_maximo: z.number()
    .min(0, 'El límite debe ser mayor o igual a 0')
    .optional()
    .or(z.nan()),
});

export const sucursalSchema = z.object({
  codigo: z.string()
    .min(2, 'Código debe tener al menos 2 caracteres')
    .max(20, 'Código no puede exceder 20 caracteres'),
  nombre: z.string()
    .min(3, 'Nombre debe tener al menos 3 caracteres')
    .max(100, 'Nombre no puede exceder 100 caracteres'),
  empresa_id: z.string().uuid('Debe seleccionar una empresa'),
  direccion: z.string().min(5, 'Dirección debe tener al menos 5 caracteres'),
  ciudad: z.string().min(2, 'Ciudad debe tener al menos 2 caracteres'),
  region: z.string().min(2, 'Región debe tener al menos 2 caracteres'),
  telefono: z.string().optional(),
  responsable_id: z.string().uuid().optional().or(z.literal('')),
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  full_name: z.string().min(3, 'Nombre completo debe tener al menos 3 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

export type EmpresaFormData = z.infer<typeof empresaSchema>;
export type CentroCostoFormData = z.infer<typeof centroCostoSchema>;
export type ConceptoGastoFormData = z.infer<typeof conceptoGastoSchema>;
export type SucursalFormData = z.infer<typeof sucursalSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
