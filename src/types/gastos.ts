/**
 * Sistema de Gestión de Gastos
 * Tipos y interfaces para gastos con flujo de aprobación
 */

// TODO: Migrate to new API service - import { Database } from "@/integrations/supabase/types";

// =====================================================
// TIPOS BASE DE LA BASE DE DATOS
// =====================================================

export type Gasto = Database["public"]["Tables"]["gastos"]["Row"];
export type NuevoGasto = Database["public"]["Tables"]["gastos"]["Insert"];
export type ActualizarGasto = Database["public"]["Tables"]["gastos"]["Update"];

export type GastoHistorial = Database["public"]["Tables"]["gastos_historial"]["Row"];

// =====================================================
// ENUMS Y CONSTANTES
// =====================================================

export type EstadoGasto =
  | "borrador" // Guardado pero no enviado
  | "pendiente" // Enviado, esperando aprobación
  | "aprobado" // Aprobado por supervisor
  | "rechazado" // Rechazado
  | "pagado" // Pago realizado
  | "anulado"; // Anulado

export type TipoBeneficiario = "proveedor" | "empleado" | "otro";

export type FormaPago = "efectivo" | "tarjeta" | "transferencia" | "cheque" | "otro";

export type Moneda = "PEN" | "USD" | "EUR";

export type AccionHistorial =
  | "creado"
  | "modificado"
  | "enviado"
  | "aprobado"
  | "rechazado"
  | "pagado"
  | "anulado";

// =====================================================
// MAPEO DE ESTADOS A ESPAÑOL
// =====================================================

export const ESTADOS_GASTO: Record<EstadoGasto, { label: string; color: string }> = {
  borrador: {
    label: "Borrador",
    color: "bg-gray-100 text-gray-800 border-gray-300",
  },
  pendiente: {
    label: "Pendiente",
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
  },
  aprobado: {
    label: "Aprobado",
    color: "bg-green-100 text-green-800 border-green-300",
  },
  rechazado: {
    label: "Rechazado",
    color: "bg-red-100 text-red-800 border-red-300",
  },
  pagado: {
    label: "Pagado",
    color: "bg-blue-100 text-blue-800 border-blue-300",
  },
  anulado: {
    label: "Anulado",
    color: "bg-gray-100 text-gray-800 border-gray-300",
  },
};

export const FORMAS_PAGO: Record<FormaPago, string> = {
  efectivo: "Efectivo",
  tarjeta: "Tarjeta",
  transferencia: "Transferencia",
  cheque: "Cheque",
  otro: "Otro",
};

export const TIPOS_BENEFICIARIO: Record<TipoBeneficiario, string> = {
  proveedor: "Proveedor",
  empleado: "Empleado",
  otro: "Otro",
};

export const MONEDAS: Record<Moneda, { simbolo: string; nombre: string }> = {
  PEN: { simbolo: "S/", nombre: "Soles" },
  USD: { simbolo: "$", nombre: "Dólares" },
  EUR: { simbolo: "€", nombre: "Euros" },
};

// =====================================================
// INTERFACES EXTENDIDAS
// =====================================================

/**
 * Gasto con información relacionada (JOIN)
 */
export interface GastoConDetalles extends Gasto {
  concepto_nombre?: string;
  concepto_categoria?: string;
  concepto_limite?: number;
  caja_nombre?: string;
  centro_costo_nombre?: string;
  documento_numero?: string;
  documento_tipo?: string;
  documento_url?: string;
  usuario_email?: string;
  aprobado_por_email?: string;
  pagado_por_email?: string;
  dias_desde_gasto?: number;
  excede_limite?: boolean;
}

/**
 * Datos para crear un gasto desde formulario
 */
export interface FormularioGasto {
  concepto_gasto_id: string;
  centro_costo_id?: string;
  caja_id?: string;
  documento_id?: string;

  descripcion: string;
  fecha_gasto: string; // formato YYYY-MM-DD
  monto: number;
  moneda: Moneda;
  tipo_cambio?: number;

  beneficiario_tipo?: TipoBeneficiario;
  beneficiario_documento?: string;
  beneficiario_nombre?: string;

  observaciones?: string;
  tags?: string[];

  estado?: EstadoGasto; // Por defecto 'borrador'
}

/**
 * Datos para aprobar un gasto
 */
export interface AprobarGastoRequest {
  gasto_id: string;
  observaciones?: string;
}

/**
 * Datos para rechazar un gasto
 */
export interface RechazarGastoRequest {
  gasto_id: string;
  motivo_rechazo: string;
}

/**
 * Datos para registrar pago
 */
export interface RegistrarPagoRequest {
  gasto_id: string;
  forma_pago: FormaPago;
  numero_operacion?: string;
  observaciones?: string;
}

/**
 * Filtros para listado de gastos
 */
export interface FiltrosGastos {
  estado?: EstadoGasto | EstadoGasto[];
  concepto_gasto_id?: string;
  caja_id?: string;
  centro_costo_id?: string;
  usuario_id?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  monto_min?: number;
  monto_max?: number;
  moneda?: Moneda;
  busqueda?: string; // Búsqueda en descripción, código, beneficiario
  tags?: string[];
  excede_limite?: boolean;
}

/**
 * Estadísticas de gastos
 */
export interface EstadisticasGastos {
  total_gastos: number;
  gastos_pendientes: number;
  gastos_aprobados: number;
  gastos_rechazados: number;
  gastos_pagados: number;
  monto_total_pen: number | null;
  monto_pendiente_pen: number | null;
  monto_aprobado_pen: number | null;
}

/**
 * Resumen de gasto para listados
 */
export interface GastoResumen {
  id: string;
  codigo: string;
  concepto_nombre: string;
  descripcion: string;
  monto: number;
  moneda: Moneda;
  fecha_gasto: string;
  estado: EstadoGasto;
  usuario_email?: string;
  excede_limite: boolean;
}

/**
 * Opciones para exportar gastos
 */
export interface OpcionesExportacion {
  formato: "excel" | "pdf" | "csv";
  filtros?: FiltrosGastos;
  incluir_detalles?: boolean;
  incluir_documentos?: boolean;
  agrupar_por?: "concepto" | "centro_costo" | "usuario" | "mes";
}

/**
 * Resultado de validación de gasto
 */
export interface ValidacionGasto {
  valido: boolean;
  errores: string[];
  advertencias: string[];
  excede_limite: boolean;
  requiere_documentos: boolean;
  documentos_faltantes: string[];
}

// =====================================================
// FUNCIONES DE UTILIDAD
// =====================================================

/**
 * Obtiene el color y etiqueta para un estado
 */
export function obtenerEstiloEstado(estado: EstadoGasto) {
  return ESTADOS_GASTO[estado] || ESTADOS_GASTO.pendiente;
}

/**
 * Formatea monto con moneda
 */
export function formatearMonto(monto: number | null | undefined, moneda: Moneda): string {
  if (monto === null || monto === undefined || isNaN(monto)) {
    return `${MONEDAS[moneda]?.simbolo || "S/"} 0.00`;
  }
  const config = MONEDAS[moneda] || MONEDAS.PEN;
  return `${config.simbolo} ${monto.toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Calcula el monto en soles (conversión si es necesario)
 */
export function calcularMontoEnSoles(
  monto: number | null | undefined,
  moneda: Moneda,
  tipoCambio?: number
): number {
  if (monto === null || monto === undefined || isNaN(monto)) return 0;
  if (moneda === "PEN") return monto;
  if (moneda === "USD" && tipoCambio) return monto * tipoCambio;
  if (moneda === "EUR" && tipoCambio) return monto * tipoCambio;
  return monto; // Sin conversión si falta tipo de cambio
}

/**
 * Verifica si un gasto puede ser editado
 */
export function puedeEditarGasto(gasto: Gasto, usuarioId: string): boolean {
  // Solo el creador puede editar
  if (gasto.usuario_id !== usuarioId) return false;

  // Solo estados borrador y rechazado pueden editarse
  return gasto.estado === "borrador" || gasto.estado === "rechazado";
}

/**
 * Verifica si un gasto puede ser aprobado
 */
export function puedeAprobarGasto(gasto: Gasto, usuarioId: string): boolean {
  // No puede aprobar su propio gasto
  if (gasto.usuario_id === usuarioId) return false;

  // Solo gastos pendientes pueden aprobarse
  return gasto.estado === "pendiente" && gasto.requiere_aprobacion;
}

/**
 * Verifica si un gasto puede ser pagado
 */
export function puedePagarGasto(gasto: Gasto): boolean {
  // Solo gastos aprobados pueden pagarse
  return gasto.estado === "aprobado";
}

/**
 * Verifica si un gasto puede ser anulado
 */
export function puedeAnularGasto(gasto: Gasto, usuarioId: string): boolean {
  // Solo el creador puede anular
  if (gasto.usuario_id !== usuarioId) return false;

  // No se pueden anular gastos pagados
  return gasto.estado !== "pagado" && gasto.estado !== "anulado";
}

/**
 * Obtiene el siguiente estado válido
 */
export function obtenerSiguienteEstado(estadoActual: EstadoGasto): EstadoGasto | null {
  const flujo: Record<EstadoGasto, EstadoGasto | null> = {
    borrador: "pendiente",
    pendiente: "aprobado",
    aprobado: "pagado",
    rechazado: null,
    pagado: null,
    anulado: null,
  };

  return flujo[estadoActual];
}

/**
 * Valida que un gasto tenga los datos mínimos
 */
export function validarGastoBasico(gasto: Partial<FormularioGasto>): ValidacionGasto {
  const errores: string[] = [];
  const advertencias: string[] = [];

  if (!gasto.concepto_gasto_id) {
    errores.push("Debe seleccionar un concepto de gasto");
  }

  if (!gasto.descripcion || gasto.descripcion.trim() === "") {
    errores.push("La descripción es obligatoria");
  }

  if (!gasto.fecha_gasto) {
    errores.push("La fecha del gasto es obligatoria");
  }

  if (!gasto.monto || gasto.monto <= 0) {
    errores.push("El monto debe ser mayor a 0");
  }

  if (!gasto.moneda) {
    errores.push("Debe seleccionar una moneda");
  }

  if (gasto.moneda !== "PEN" && !gasto.tipo_cambio) {
    advertencias.push("Se recomienda ingresar el tipo de cambio para moneda extranjera");
  }

  if (!gasto.beneficiario_nombre) {
    advertencias.push("Se recomienda ingresar el beneficiario del pago");
  }

  return {
    valido: errores.length === 0,
    errores,
    advertencias,
    excede_limite: false,
    requiere_documentos: false,
    documentos_faltantes: [],
  };
}
