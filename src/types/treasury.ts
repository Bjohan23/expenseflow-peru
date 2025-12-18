// Tipos base para API de Treasury
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    count: number;
    page_size: number;
    current_page: number;
    total_pages: number;
    start_index: number;
    end_index: number;
    next: string | null;
    previous: string | null;
    has_next: boolean;
    has_previous: boolean;
    links: {
      first: string | null;
      last: string | null;
    };
  };
}

// Categoría de Gasto
export interface CategoriaGasto {
  categoria_id: string;
  nombre_categoria: string;
  descripcion_categoria: string;
  concepto?: string | null;
  created_at?: string;
  updated_at?: string;
}

// Selector para dropdowns
export interface CategoriaGastoSelector {
  id: string;
  value: string;
  label: string;
  categoria_id: string;
  nombre_categoria: string;
  concepto?: string | null;
}

// Caja
export interface Caja {
  caja_id: string;
  codigo_caja: string;
  nombre_caja: string;
  empresa_nombre: string;
  sucursal_nombre: string;
  tipo_caja: string;
  tipo_caja_display: string;
  estado: number;
}

// Apertura de Caja
export interface AperturaCaja {
  id: string;
  caja: string;
  caja_nombre?: string;
  fecha_apertura: string;
  monto_inicial: string;
  saldo_actual: string;
  estado: number;
  responsable: string;
  responsable_nombre?: string;
  observaciones?: string;
}

// Cierre de Caja
export interface CierreCajaRequest {
  saldo_final: string;
  observaciones: string;
}

// Items de Gasto
export interface GastoItem {
  item_id?: string;
  gasto?: string;
  nro_item: number;
  descripcion_item: string;
  cantidad: number;
  precio_unitario: string;
  total_item: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

// Evidencia de Gasto
export interface Evidencia {
  id: number;
  gasto: string;
  comprobante: string;
  comprobante_url: string;
  created_at: string;
  created_by: string;
}

// Gasto completo con relaciones
export interface Gasto {
  gasto_id: string;
  empresa?: string;
  empresa_nombre?: string;
  sucursal?: string;
  sucursal_nombre?: string;
  nro_transaccion?: number;
  categoria: number;
  categoria_nombre?: string;
  glosa: string;
  fecha_gasto: string;
  responsable: string;
  responsable_nombre?: string;
  importe: string;
  pagado_por: number;
  pagado_por_display?: string;
  reembolsable: boolean;
  fondo?: string;
  fondo_nombre?: string;
  tipo_documento: string;
  tipo_documento_nombre?: string;
  nro_documento?: string;
  fecha_documento?: string;
  ruc_emisor?: string;
  nombre_emisor?: string;
  estado: number;
  estado_display?: string;
  items?: GastoItem[];
  evidencias?: Evidencia[];
  items_count?: number;
  evidencias_count?: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

// Formulario para crear/editar gasto
export interface CreateGastoRequest {
  empresa: string;
  sucursal: string;
  categoria: number;
  responsable: string;
  glosa: string;
  importe: string;
  pagado_por: number;
  reembolsable: boolean;
  fondo?: string;
  tipo_documento: string;
  nro_documento?: string;
  fecha_documento: string;
  ruc_emisor?: string;
  nombre_emisor?: string;
  items: GastoItem[];
}

// Asignación de Fondo
export interface AsignacionFondo {
  fondo_id: string;
  empresa: string;
  empresa_nombre?: string;
  sucursal: string;
  sucursal_nombre?: string;
  responsable: string;
  responsable_nombre?: string;
  tipo_fondo: string;
  tipo_fondo_display?: string;
  monto_asignado: string;
  monto_rendido?: string;
  saldo_pendiente?: string;
  fecha_asignacion: string;
  fecha_vencimiento?: string;
  estado: number;
  estado_display?: string;
  observaciones?: string;
  created_at: string;
  updated_at: string;
}

// Estados
export enum EstadoGasto {
  BORRADOR = 1,
  PENDIENTE = 2,
  APROBADO = 3,
  PAGADO = 4,
  RECHAZADO = 5,
  ANULADO = 9
}

export enum EstadoAsignacionFondo {
  ASIGNADO = 1,
  POR_RENDIR = 2,
  RENDIDO = 3,
  ANULADO = 9
}

export enum PagadoPor {
  CAJA_CHICA = 1,
  CAJA_GRANDE = 2,
  PROVEEDOR = 3,
  PERSONAL = 4
}

// Parámetros de búsqueda y filtrado
export interface GastosFilters {
  empresa?: string;
  sucursal?: string;
  categoria?: number;
  responsable?: string;
  estado?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  search?: string;
  page?: number;
  page_size?: number;
  ordering?: string;
}

export interface AsignacionesFilters {
  empresa?: string;
  sucursal?: string;
  responsable?: string;
  tipo_fondo?: string;
  estado?: number;
  search?: string;
  page?: number;
  page_size?: number;
  ordering?: string;
}

// Estadísticas
export interface GastosStatistics {
  total_mes: string;
  gastos_pendientes: number;
  gastos_aprobados: number;
  total_por_aprobar: string;
  fondos_pendientes: number;
  gastos_por_categoria: {
    categoria: string;
    total: string;
    cantidad: number;
  }[];
  ultimos_gastos: Gasto[];
}

// Validación de responsable
export interface ValidateResponsableResponse {
  success: boolean;
  message: string;
  data: {
    can_receive_fund: boolean;
    pending_funds_count: number;
    pending_funds: Array<{
      fondo_id: string;
      monto_asignado: string;
      fecha_vencimiento: string;
      estado_display: string;
    }>;
  };
}