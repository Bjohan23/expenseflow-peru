// Tipos del sistema de gestión de gastos

export type UserRole = 'admin' | 'responsable' | 'aprobador' | 'colaborador';
export type Moneda = 'PEN' | 'USD';
export type EstadoGeneral = 'activo' | 'inactivo';
export type EstadoSucursal = 'activa' | 'inactiva';
export type EstadoCaja = 'abierta' | 'cerrada';
export type CategoriaGasto = 'viaticos' | 'transporte' | 'alimentacion' | 'hospedaje' | 'otros';
export type AccionAuditoria = 'crear' | 'editar' | 'eliminar' | 'aprobar' | 'rechazar';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Empresa {
  id: string;
  ruc: string;
  razon_social: string;
  nombre_comercial?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  moneda: Moneda;
  limite_gasto_mensual?: number;
  logo_url?: string;
  estado: EstadoGeneral;
  created_at: string;
  updated_at: string;
}

export interface EmpresaUsuario {
  id: string;
  empresa_id: string;
  user_id: string;
  rol_en_empresa: string;
  fecha_asignacion: string;
  created_at: string;
  empresa?: Empresa;
  user?: Profile;
}

export interface Sucursal {
  id: string;
  codigo: string;
  nombre: string;
  empresa_id: string;
  direccion: string;
  ciudad: string;
  region: string;
  telefono?: string;
  responsable_id?: string;
  estado: EstadoSucursal;
  created_at: string;
  updated_at: string;
  empresa?: Empresa;
  responsable?: Profile;
}

export interface Caja {
  id: string;
  codigo: string;
  nombre: string;
  sucursal_id: string;
  responsable_id: string;
  saldo_inicial: number;
  saldo_actual: number;
  estado: EstadoCaja;
  fecha_apertura: string;
  fecha_cierre?: string;
  created_at: string;
  updated_at: string;
  sucursal?: Sucursal;
  responsable?: Profile;
}

export interface CentroCosto {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  empresa_id: string;
  responsable_id: string;
  presupuesto_asignado: number;
  presupuesto_consumido: number;
  estado: EstadoGeneral;
  created_at: string;
  updated_at: string;
  empresa?: Empresa;
  responsable?: Profile;
}

export interface ConceptoGasto {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoria: CategoriaGasto;
  centro_costo_id?: string;
  requiere_aprobacion: boolean;
  limite_maximo?: number;
  estado: EstadoGeneral;
  created_at: string;
  updated_at: string;
  centro_costo?: CentroCosto;
}

export interface Auditoria {
  id: string;
  tabla: string;
  registro_id: string;
  accion: AccionAuditoria;
  usuario_id: string;
  datos_anteriores?: any;
  datos_nuevos?: any;
  comentario?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  usuario?: Profile;
}

// DTOs para formularios
export interface EmpresaFormData {
  ruc: string;
  razon_social: string;
  nombre_comercial?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  moneda: Moneda;
  limite_gasto_mensual?: number;
  logo_url?: string;
}

export interface CentroCostoFormData {
  codigo: string;
  nombre: string;
  descripcion?: string;
  empresa_id: string;
  responsable_id: string;
  presupuesto_asignado: number;
}

export interface ConceptoGastoFormData {
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoria: CategoriaGasto;
  centro_costo_id?: string;
  requiere_aprobacion: boolean;
  limite_maximo?: number;
}

export interface SucursalFormData {
  codigo: string;
  nombre: string;
  empresa_id: string;
  direccion: string;
  ciudad: string;
  region: string;
  telefono?: string;
  responsable_id?: string;
}
