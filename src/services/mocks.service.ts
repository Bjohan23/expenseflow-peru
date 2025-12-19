import { v4 as uuidv4 } from 'uuid';

// ===== TIPOS DE DOCUMENTO =====
export interface TipoDocumento {
  id: string;
  nombre: string;
  codigo: string;
  longitud_max_nro: number;
  longitud_max_ruc: number;
  created_at: string;
  isPredefined?: boolean;
}

// ===== CATEGORÍAS =====
export interface Categoria {
  id: string;
  nombre_categoria: string;
  descripcion_categoria: string;
  created_at: string;
  isPredefined?: boolean;
}

// ===== RESPONSABLES =====
export interface Responsable {
  id: string;
  nombre_completo: string;
  email: string;
  telefono: string;
  dni: string;
  cargo: string;
  empresa_id: string;
  empresa_nombre: string;
  created_at: string;
  isPredefined?: boolean;
}

// ===== EMPRESAS =====
export interface Empresa {
  id: string;
  nro_ruc: string;
  razon_social: string;
  direccion: string;
  acronimo: string;
  avatar?: string;
  created_at: string;
  isPredefined?: boolean;
}

// ===== FONDOS =====
export interface Fondo {
  id: string;
  nombre_fondo: string;
  descripcion: string;
  empresa_id: string;
  empresa_nombre: string;
  monto_asignado: number;
  monto_disponible: number;
  estado: string;
  fecha_asignacion: string;
  created_at: string;
  isPredefined?: boolean;
}

// ===== ASIGNACIONES DE FONDO =====
export interface MockAsignacionFondo {
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
  estado: number; // Para compatibilidad con EstadoAsignacionFondo
  estado_display?: string;
  observaciones?: string;
  created_at: string;
  updated_at: string;
}

// ===== GASTOS =====
export interface MockGasto {
  gastoId: string;
  empresa: string;
  sucursal: string;
  categoria: string;
  responsable: string;
  glosa: string;
  importe: number;
  pagado_por: number;
  reembolsable: boolean;
  fondo: string;
  tipo_documento: string;
  nro_documento: string;
  fecha_documento: string;
  ruc_emisor: string;
  nombre_emisor: string;
  items: any[]; // Usar any[] para que sea compatible con GastoItem[]
  imagenes: any[]; // Array de imágenes asociadas al gasto
  estado: string; // Para compatibilidad con GastoDetalle
  moneda: string; // Para compatibilidad con GastoDetalle
  created_at: string;
}

// ===== DATOS PREDEFINIDOS =====
export const EMPRESAS_PREDEFINIDAS: Omit<Empresa, 'created_at'>[] = [
  {
    id: '01',
    nro_ruc: '20100070970',
    razon_social: 'ANGELICA CHAVEZ HURTADO',
    direccion: 'Av. Principal 123 - Lima',
    acronimo: 'ACH',
    isPredefined: true
  },
  {
    id: '02',
    nro_ruc: '20560869770',
    razon_social: 'COMERCIAL LAVAGNA S.A.C.',
    direccion: 'Cal. Comercio 456 - Miraflores',
    acronimo: 'CLS',
    isPredefined: true
  },
  {
    id: '03',
    nro_ruc: '20481677536',
    razon_social: 'TEXTILES Y COSTURAS S.A.C.',
    direccion: 'Av. Industrial 789 - Surco',
    acronimo: 'TYC',
    isPredefined: true
  }
];

export const TIPOS_DOCUMENTO_PREDEFINIDOS: Omit<TipoDocumento, 'created_at'>[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    nombre: 'Factura',
    codigo: 'FACTURA',
    longitud_max_nro: 20,
    longitud_max_ruc: 11,
    isPredefined: true
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    nombre: 'Boleta',
    codigo: 'BOLETA',
    longitud_max_nro: 12,
    longitud_max_ruc: 11,
    isPredefined: true
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    nombre: 'Recibo por Honorarios',
    codigo: 'RECIBO_HONORARIOS',
    longitud_max_nro: 20,
    longitud_max_ruc: 11,
    isPredefined: true
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    nombre: 'Ticket',
    codigo: 'TICKET',
    longitud_max_nro: 20,
    longitud_max_ruc: 0,
    isPredefined: true
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    nombre: 'Nota de Crédito',
    codigo: 'NOTA_CREDITO',
    longitud_max_nro: 20,
    longitud_max_ruc: 11,
    isPredefined: true
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440006',
    nombre: 'Comprobante de Pago',
    codigo: 'COMPROBANTE_PAGO',
    longitud_max_nro: 20,
    longitud_max_ruc: 0,
    isPredefined: true
  }
];

// Datos predefinidos de gastos
export const GASTOS_PREDEFINIDOS: Omit<MockGasto, 'created_at'>[] = [
  {
    gastoId: 'gasto_001',
    empresa: '01',
    sucursal: '0101',
    categoria: '550e8400-e29b-41d4-a716-446655440001', // Viáticos y Transporte
    responsable: '660e8400-e29b-41d4-a716-446655440001', // Juan Carlos Pérez
    glosa: 'Viáticos para viaje de negocios a Piura',
    importe: 850.50,
    pagado_por: 1,
    reembolsable: true,
    fondo: 'fondo_001',
    tipo_documento: 'FACTURA',
    nro_documento: 'F001-001234',
    fecha_documento: '2024-12-15',
    ruc_emisor: '20555555555',
    nombre_emisor: 'Transportes速 S.A.C.',
    items: [
      {
        nro_item: 1,
        descripcion_item: 'Pasajes terrestres Lima-Piura',
        cantidad: 2,
        precio_unitario: 280.00,
        total_item: 560.00
      },
      {
        nro_item: 2,
        descripcion_item: 'Alimentación durante viaje',
        cantidad: 3,
        precio_unitario: 96.83,
        total_item: 290.50
      }
    ],
    imagenes: [],
    estado: 'aprobado',
    moneda: 'PEN'
  },
  {
    gastoId: 'gasto_002',
    empresa: '02',
    sucursal: '0201',
    categoria: '550e8400-e29b-41d4-a716-446655440004', // Suministros y Materiales
    responsable: '660e8400-e29b-41d4-a716-446655440002', // María López
    glosa: 'Compra de útiles de oficina',
    importe: 375.80,
    pagado_por: 2,
    reembolsable: false,
    fondo: 'none',
    tipo_documento: 'BOLETA',
    nro_documento: 'B001-000567',
    fecha_documento: '2024-12-10',
    ruc_emisor: '20123456789',
    nombre_emisor: 'Office Depot Perú S.A.',
    items: [
      {
        nro_item: 1,
        descripcion_item: 'Resmas de papel A4',
        cantidad: 5,
        precio_unitario: 45.00,
        total_item: 225.00
      },
      {
        nro_item: 2,
        descripcion_item: 'Cartuchos de tinta negra',
        cantidad: 2,
        precio_unitario: 75.40,
        total_item: 150.80
      }
    ],
    imagenes: [],
    estado: 'pagado',
    moneda: 'PEN'
  },
  {
    gastoId: 'gasto_003',
    empresa: '01',
    sucursal: '0105',
    categoria: '550e8400-e29b-41d4-a716-446655440003', // Hospedaje
    responsable: '660e8400-e29b-41d4-a716-446655440003', // Carlos Rodríguez
    glosa: 'Alojamiento en hotel para capacitación',
    importe: 580.00,
    pagado_por: 1,
    reembolsable: true,
    fondo: 'fondo_002',
    tipo_documento: 'FACTURA',
    nro_documento: 'F001-001235',
    fecha_documento: '2024-12-08',
    ruc_emisor: '20387654321',
    nombre_emisor: 'Hotel Comfort Inn S.A.',
    items: [
      {
        nro_item: 1,
        descripcion_item: 'Habitación doble - 2 noches',
        cantidad: 2,
        precio_unitario: 290.00,
        total_item: 580.00
      }
    ],
    imagenes: [],
    estado: 'pendiente',
    moneda: 'PEN'
  },
  {
    gastoId: 'gasto_004',
    empresa: '03',
    sucursal: '0301',
    categoria: '550e8400-e29b-41d4-a716-446655440004', // Suministros y Materiales
    responsable: '660e8400-e29b-41d4-a716-446655440001', // Juan Carlos Pérez
    glosa: 'Servicios de mantenimiento de equipos',
    importe: 1200.00,
    pagado_por: 3,
    reembolsable: false,
    fondo: 'none',
    tipo_documento: 'FACTURA',
    nro_documento: 'F001-001236',
    fecha_documento: '2024-12-05',
    ruc_emisor: '20456789012',
    nombre_emisor: 'Mantenimiento Pro S.A.C.',
    items: [
      {
        nro_item: 1,
        descripcion_item: 'Mantenimiento preventivo equipos de cómputo',
        cantidad: 1,
        precio_unitario: 1200.00,
        total_item: 1200.00
      }
    ],
    imagenes: [],
    estado: 'borrador',
    moneda: 'PEN'
  },
  {
    gastoId: 'gasto_005',
    empresa: '02',
    sucursal: '0203',
    categoria: '550e8400-e29b-41d4-a716-446655440005', // Comunicaciones
    responsable: '660e8400-e29b-41d4-a716-446655440004', // Ana Martínez
    glosa: 'Servicios de internet y telefonía',
    importe: 450.30,
    pagado_por: 3,
    reembolsable: false,
    fondo: 'none',
    tipo_documento: 'RECIBO_HONORARIOS',
    nro_documento: 'R-001-12345',
    fecha_documento: '2024-12-01',
    ruc_emisor: '20567890123',
    nombre_emisor: 'Claro Perú S.A.',
    items: [
      {
        nro_item: 1,
        descripcion_item: 'Servicios de internet - Diciembre 2024',
        cantidad: 1,
        precio_unitario: 280.00,
        total_item: 280.00
      },
      {
        nro_item: 2,
        descripcion_item: 'Plan celular empresarial',
        cantidad: 2,
        precio_unitario: 85.15,
        total_item: 170.30
      }
    ],
    imagenes: [],
    estado: 'pagado',
    moneda: 'PEN'
  }
];

// Datos predefinidos de asignaciones de fondos
export const ASIGNACIONES_FONDOS_PREDEFINIDAS: Omit<MockAsignacionFondo, 'created_at' | 'updated_at'>[] = [
  {
    fondo_id: 'fondo_001',
    empresa: '01',
    sucursal: '0101',
    responsable: '660e8400-e29b-41d4-a716-446655440001', // Juan Carlos Pérez
    tipo_fondo: 'caja_chica',
    tipo_fondo_display: 'Caja Chica',
    monto_asignado: '5000.00',
    monto_rendido: '2150.50',
    saldo_pendiente: '2849.50',
    fecha_asignacion: '2024-12-01',
    fecha_vencimiento: '2024-12-31',
    estado: 2, // POR_RENDIR
    estado_display: 'Por Rendir',
    observaciones: 'Fondo para gastos operativos del mes de diciembre',
    created_at: new Date('2024-12-01T09:00:00').toISOString(),
    updated_at: new Date('2024-12-15T14:30:00').toISOString()
  },
  {
    fondo_id: 'fondo_002',
    empresa: '02',
    sucursal: '0201',
    responsable: '660e8400-e29b-41d4-a716-446655440002', // María López
    tipo_fondo: 'caja_grande',
    tipo_fondo_display: 'Caja Grande',
    monto_asignado: '15000.00',
    monto_rendido: '12300.00',
    saldo_pendiente: '2700.00',
    fecha_asignacion: '2024-11-15',
    fecha_vencimiento: '2024-12-15',
    estado: 3, // RENDIDO
    estado_display: 'Rendido',
    observaciones: 'Fondo para proyecto de remodelación de oficinas',
    created_at: new Date('2024-11-15T10:00:00').toISOString(),
    updated_at: new Date('2024-12-10T16:45:00').toISOString()
  },
  {
    fondo_id: 'fondo_003',
    empresa: '01',
    sucursal: '0105',
    responsable: '660e8400-e29b-41d4-a716-446655440003', // Carlos Rodríguez
    tipo_fondo: 'viaticos',
    tipo_fondo_display: 'Viáticos',
    monto_asignado: '8000.00',
    monto_rendido: '0.00',
    saldo_pendiente: '8000.00',
    fecha_asignacion: '2024-12-10',
    fecha_vencimiento: '2024-12-20',
    estado: 1, // ASIGNADO
    estado_display: 'Asignado',
    observaciones: 'Viáticos para viaje de capacitación a Arequipa',
    created_at: new Date('2024-12-10T11:30:00').toISOString(),
    updated_at: new Date('2024-12-10T11:30:00').toISOString()
  },
  {
    fondo_id: 'fondo_004',
    empresa: '03',
    sucursal: '0301',
    responsable: '660e8400-e29b-41d4-a716-446655440004', // Ana Martínez
    tipo_fondo: 'proyectos_especiales',
    tipo_fondo_display: 'Proyectos Especiales',
    monto_asignado: '25000.00',
    monto_rendido: '18750.00',
    saldo_pendiente: '6250.00',
    fecha_asignacion: '2024-11-01',
    fecha_vencimiento: '2025-01-31',
    estado: 2, // POR_RENDIR
    estado_display: 'Por Rendir',
    observaciones: 'Fondo para implementación de nuevo sistema ERP',
    created_at: new Date('2024-11-01T08:00:00').toISOString(),
    updated_at: new Date('2024-12-05T17:20:00').toISOString()
  },
  {
    fondo_id: 'fondo_005',
    empresa: '02',
    sucursal: '0203',
    responsable: '660e8400-e29b-41d4-a716-446655440005', // Luis González
    tipo_fondo: 'caja_chica',
    tipo_fondo_display: 'Caja Chica',
    monto_asignado: '3000.00',
    monto_rendido: '3000.00',
    saldo_pendiente: '0.00',
    fecha_asignacion: '2024-11-20',
    fecha_vencimiento: '2024-12-20',
    estado: 3, // RENDIDO
    estado_display: 'Rendido',
    observaciones: 'Fondo para gastos de mantenimiento de almacén',
    created_at: new Date('2024-11-20T09:15:00').toISOString(),
    updated_at: new Date('2024-12-18T12:00:00').toISOString()
  },
  {
    fondo_id: 'fondo_006',
    empresa: '01',
    sucursal: '0101',
    responsable: '660e8400-e29b-41d4-a716-446655440006', // Patricia Silva
    tipo_fondo: 'eventos',
    tipo_fondo_display: 'Eventos',
    monto_asignado: '12000.00',
    monto_rendido: '0.00',
    saldo_pendiente: '12000.00',
    fecha_asignacion: '2024-12-16',
    fecha_vencimiento: '2025-01-15',
    estado: 1, // ASIGNADO
    estado_display: 'Asignado',
    observaciones: 'Fondo para evento corporativo de fin de año',
    created_at: new Date('2024-12-16T10:45:00').toISOString(),
    updated_at: new Date('2024-12-16T10:45:00').toISOString()
  },
  {
    fondo_id: 'fondo_007',
    empresa: '03',
    sucursal: '0304',
    responsable: '660e8400-e29b-41d4-a716-446655440007', // Roberto Vargas
    tipo_fondo: 'caja_chica',
    tipo_fondo_display: 'Caja Chica',
    monto_asignado: '4500.00',
    monto_rendido: '1200.80',
    saldo_pendiente: '3299.20',
    fecha_asignacion: '2024-12-05',
    fecha_vencimiento: '2025-01-05',
    estado: 9, // ANULADO
    estado_display: 'Anulado',
    observaciones: 'Anulado por cambio de responsable - fondos transferidos a nueva asignación',
    created_at: new Date('2024-12-05T14:20:00').toISOString(),
    updated_at: new Date('2024-12-14T09:30:00').toISOString()
  }
];

export const CATEGORIAS_PREDEFINIDAS: Omit<Categoria, 'created_at'>[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    nombre_categoria: 'Viáticos y Movilidad',
    descripcion_categoria: 'Gastos de transporte, alimentación y alojamiento por viajes de trabajo',
    isPredefined: true
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    nombre_categoria: 'Suministros y Materiales',
    descripcion_categoria: 'Compras de insumos, materiales de oficina y herramientas',
    isPredefined: true
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    nombre_categoria: 'Servicios Profesionales',
    descripcion_categoria: 'Honorarios de consultores, asesores y servicios profesionales',
    isPredefined: true
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    nombre_categoria: 'Gastos Administrativos',
    descripcion_categoria: 'Alquiler, servicios básicos, mantenimiento y otros gastos administrativos',
    isPredefined: true
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    nombre_categoria: 'Marketing y Publicidad',
    descripcion_categoria: 'Publicidad, promoción, eventos y actividades de marketing',
    isPredefined: true
  }
];

export const RESPONSABLES_PREDEFINIDOS: Omit<Responsable, 'created_at'>[] = [
  {
    id: '660e8400-e29b-41d4-a716-446655440001',
    nombre_completo: 'Juan Carlos Pérez Gómez',
    email: 'juan.perez@empresa.com',
    telefono: '987654321',
    dni: '12345678',
    cargo: 'Gerente General',
    empresa_id: '02',
    empresa_nombre: 'COMERCIAL LAVAGNA S.A.C.',
    isPredefined: true
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440002',
    nombre_completo: 'María Fernanda López Torres',
    email: 'maria.lopez@empresa.com',
    telefono: '987654322',
    dni: '87654321',
    cargo: 'Jefa de Administración',
    empresa_id: '02',
    empresa_nombre: 'COMERCIAL LAVAGNA S.A.C.',
    isPredefined: true
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440003',
    nombre_completo: 'Carlos Alberto Ramírez Silva',
    email: 'carlos.ramirez@empresa.com',
    telefono: '987654323',
    dni: '23456789',
    cargo: 'Supervisor de Ventas',
    empresa_id: '01',
    empresa_nombre: 'ANGELICA CHAVEZ HURTADO',
    isPredefined: true
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440004',
    nombre_completo: 'Ana Patricia Mendoza Castro',
    email: 'ana.mendoza@empresa.com',
    telefono: '987654324',
    dni: '34567890',
    cargo: 'Contadora General',
    empresa_id: '03',
    empresa_nombre: 'TEXTILES Y COSTURAS S.A.C.',
    isPredefined: true
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440005',
    nombre_completo: 'Luis Alberto Vargas Morales',
    email: 'luis.vargas@empresa.com',
    telefono: '987654325',
    dni: '45678901',
    cargo: 'Jefe de Logística',
    empresa_id: '02',
    empresa_nombre: 'COMERCIAL LAVAGNA S.A.C.',
    isPredefined: true
  }
];

export const FONDOS_PREDEFINIDOS: Omit<Fondo, 'created_at'>[] = [
  {
    id: '770e8400-e29b-41d4-a716-446655440001',
    nombre_fondo: 'Fondo de Viáticos',
    descripcion: 'Fondo asignado para gastos de viáticos y transporte',
    empresa_id: '02',
    empresa_nombre: 'COMERCIAL LAVAGNA S.A.C.',
    monto_asignado: 5000.00,
    monto_disponible: 4500.00,
    estado: 'ACTIVO',
    fecha_asignacion: '2025-01-01',
    isPredefined: true
  },
  {
    id: '770e8400-e29b-41d4-a716-446655440002',
    nombre_fondo: 'Fondo de Gastos Menores',
    descripcion: 'Fondo para gastos operativos menores',
    empresa_id: '02',
    empresa_nombre: 'COMERCIAL LAVAGNA S.A.C.',
    monto_asignado: 3000.00,
    monto_disponible: 2800.00,
    estado: 'ACTIVO',
    fecha_asignacion: '2025-01-15',
    isPredefined: true
  },
  {
    id: '770e8400-e29b-41d4-a716-446655440003',
    nombre_fondo: 'Fondo de Representación',
    descripcion: 'Fondo para gastos de representación y clientes',
    empresa_id: '01',
    empresa_nombre: 'ANGELICA CHAVEZ HURTADO',
    monto_asignado: 8000.00,
    monto_disponible: 7500.00,
    estado: 'ACTIVO',
    fecha_asignacion: '2025-01-10',
    isPredefined: true
  },
  {
    id: '770e8400-e29b-41d4-a716-446655440004',
    nombre_fondo: 'Fondo de Capacitación',
    descripcion: 'Fondo para gastos de capacitación y entrenamiento',
    empresa_id: '03',
    empresa_nombre: 'TEXTILES Y COSTURAS S.A.C.',
    monto_asignado: 4000.00,
    monto_disponible: 3500.00,
    estado: 'ACTIVO',
    fecha_asignacion: '2025-01-20',
    isPredefined: true
  }
];

// ===== SERVICIO UNIFICADO DE MOCKS =====
class MocksService {
  private readonly EMPRESAS_KEY = 'expenseflow_empresas';
  private readonly TIPOS_DOCUMENTO_KEY = 'expenseflow_tipos_documento';
  private readonly RESPONSABLES_KEY = 'expenseflow_responsables';
  private readonly FONDOS_KEY = 'expenseflow_fondos';
  private readonly GASTOS_KEY = 'expenseflow_gastos';
  private readonly CATEGORIAS_KEY = 'expenseflow_categorias';
  private readonly ASIGNACIONES_FONDOS_KEY = 'expenseflow_asignaciones_fondos';

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    this.initializeEmpresas();
    this.initializeTiposDocumento();
    this.initializeCategorias();
    this.initializeResponsables();
    this.initializeFondos();
    this.initializeGastos();
    this.initializeAsignacionesFondo();
  }

  private initializeEmpresas() {
    const empresasGuardadas = this.getEmpresasFromStorage();
    if (empresasGuardadas.length === 0) {
      const empresasConTimestamp = EMPRESAS_PREDEFINIDAS.map(empresa => ({
        ...empresa,
        created_at: new Date().toISOString()
      }));
      localStorage.setItem(this.EMPRESAS_KEY, JSON.stringify(empresasConTimestamp));
    }
  }

  private initializeTiposDocumento() {
    const tiposGuardados = this.getTiposDocumentoFromStorage();
    if (tiposGuardados.length === 0) {
      const tiposConTimestamp = TIPOS_DOCUMENTO_PREDEFINIDOS.map(tipo => ({
        ...tipo,
        created_at: new Date().toISOString()
      }));
      localStorage.setItem(this.TIPOS_DOCUMENTO_KEY, JSON.stringify(tiposConTimestamp));
    }
  }

  private initializeCategorias() {
    const categoriasGuardadas = this.getCategoriasFromStorage();
    if (categoriasGuardadas.length === 0) {
      const categoriasConTimestamp = CATEGORIAS_PREDEFINIDAS.map(categoria => ({
        ...categoria,
        created_at: new Date().toISOString()
      }));
      localStorage.setItem(this.CATEGORIAS_KEY, JSON.stringify(categoriasConTimestamp));
    }
  }

  private initializeResponsables() {
    const responsablesGuardados = this.getResponsablesFromStorage();
    if (responsablesGuardados.length === 0) {
      const responsablesConTimestamp = RESPONSABLES_PREDEFINIDOS.map(responsable => ({
        ...responsable,
        created_at: new Date().toISOString()
      }));
      localStorage.setItem(this.RESPONSABLES_KEY, JSON.stringify(responsablesConTimestamp));
    }
  }

  private initializeFondos() {
    const fondosGuardados = this.getFondosFromStorage();
    if (fondosGuardados.length === 0) {
      const fondosConTimestamp = FONDOS_PREDEFINIDOS.map(fondo => ({
        ...fondo,
        created_at: new Date().toISOString()
      }));
      localStorage.setItem(this.FONDOS_KEY, JSON.stringify(fondosConTimestamp));
    }
  }

  private initializeGastos() {
    const gastosGuardados = this.getGastosFromStorage();
    if (gastosGuardados.length === 0) {
      const gastosConTimestamp = GASTOS_PREDEFINIDOS.map(gasto => ({
        ...gasto,
        created_at: new Date().toISOString()
      }));
      localStorage.setItem(this.GASTOS_KEY, JSON.stringify(gastosConTimestamp));
    }
  }

  private initializeAsignacionesFondo() {
    const asignacionesGuardadas = this.getAsignacionesFondoFromStorage();
    if (asignacionesGuardadas.length === 0) {
      const asignacionesConTimestamp = ASIGNACIONES_FONDOS_PREDEFINIDAS.map(asignacion => ({
        ...asignacion,
        created_at: asignacion.created_at,
        updated_at: asignacion.updated_at
      }));
      localStorage.setItem(this.ASIGNACIONES_FONDOS_KEY, JSON.stringify(asignacionesConTimestamp));
    }
  }

  private getEmpresasFromStorage(): Empresa[] {
    try {
      const data = localStorage.getItem(this.EMPRESAS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error al obtener empresas:', error);
      return [];
    }
  }

  private getTiposDocumentoFromStorage(): TipoDocumento[] {
    try {
      const data = localStorage.getItem(this.TIPOS_DOCUMENTO_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error al obtener tipos de documento:', error);
      return [];
    }
  }

  private getCategoriasFromStorage(): Categoria[] {
    try {
      const data = localStorage.getItem(this.CATEGORIAS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      return [];
    }
  }

  private getResponsablesFromStorage(): Responsable[] {
    try {
      const data = localStorage.getItem(this.RESPONSABLES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error al obtener responsables:', error);
      return [];
    }
  }

  private getFondosFromStorage(): Fondo[] {
    try {
      const data = localStorage.getItem(this.FONDOS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error al obtener fondos:', error);
      return [];
    }
  }

  private getGastosFromStorage(): MockGasto[] {
    try {
      const data = localStorage.getItem(this.GASTOS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error al obtener gastos:', error);
      return [];
    }
  }

  // ===== EMPRESAS =====
  getEmpresas(): Empresa[] {
    return this.getEmpresasFromStorage();
  }

  getEmpresaById(id: string): Empresa | null {
    const empresas = this.getEmpresasFromStorage();
    return empresas.find(empresa => empresa.id === id) || null;
  }

  createEmpresa(data: Omit<Empresa, 'id' | 'created_at'>): Empresa {
    const empresas = this.getEmpresasFromStorage();

    const nuevaEmpresa: Empresa = {
      id: uuidv4(),
      ...data,
      created_at: new Date().toISOString(),
      isPredefined: false
    };

    empresas.push(nuevaEmpresa);
    this.saveEmpresasToStorage(empresas);

    return nuevaEmpresa;
  }

  updateEmpresa(id: string, data: Partial<Omit<Empresa, 'id' | 'created_at'>>): Empresa | null {
    const empresas = this.getEmpresasFromStorage();
    const index = empresas.findIndex(empresa => empresa.id === id);

    if (index === -1) return null;

    // No permitir editar empresas predefinidas
    if (empresas[index].isPredefined) {
      throw new Error('No se pueden editar empresas predefinidas');
    }

    empresas[index] = {
      ...empresas[index],
      ...data,
      updated_at: new Date().toISOString()
    } as any;

    this.saveEmpresasToStorage(empresas);
    return empresas[index];
  }

  deleteEmpresa(id: string): boolean {
    const empresas = this.getEmpresasFromStorage();
    const empresa = empresas.find(empresa => empresa.id === id);

    if (!empresa) return false;

    // No permitir eliminar empresas predefinidas
    if (empresa.isPredefined) {
      throw new Error('No se pueden eliminar empresas predefinidas');
    }

    const empresasFiltradas = empresas.filter(empresa => empresa.id !== id);
    this.saveEmpresasToStorage(empresasFiltradas);

    return true;
  }

  private saveEmpresasToStorage(empresas: Empresa[]) {
    try {
      localStorage.setItem(this.EMPRESAS_KEY, JSON.stringify(empresas));
    } catch (error) {
      console.error('Error al guardar empresas:', error);
      throw new Error('No se pudieron guardar las empresas');
    }
  }

  // ===== TIPOS DE DOCUMENTO =====
  getTiposDocumento(): TipoDocumento[] {
    return this.getTiposDocumentoFromStorage();
  }

  getTipoDocumentoById(id: string): TipoDocumento | null {
    const tipos = this.getTiposDocumentoFromStorage();
    return tipos.find(tipo => tipo.id === id) || null;
  }

  getTipoDocumentoByCodigo(codigo: string): TipoDocumento | null {
    const tipos = this.getTiposDocumentoFromStorage();
    return tipos.find(tipo => tipo.codigo === codigo) || null;
  }

  // ===== CATEGORÍAS =====
  getCategorias(): Categoria[] {
    return this.getCategoriasFromStorage();
  }

  getCategoriaById(id: string): Categoria | null {
    const categorias = this.getCategoriasFromStorage();
    return categorias.find(categoria => categoria.id === id) || null;
  }

  createTipoDocumento(data: Omit<TipoDocumento, 'id' | 'created_at'>): TipoDocumento {
    const tipos = this.getTiposDocumentoFromStorage();

    const nuevoTipo: TipoDocumento = {
      id: uuidv4(),
      ...data,
      created_at: new Date().toISOString(),
      isPredefined: false
    };

    tipos.push(nuevoTipo);
    this.saveTiposDocumentoToStorage(tipos);

    return nuevoTipo;
  }

  private saveTiposDocumentoToStorage(tipos: TipoDocumento[]) {
    try {
      localStorage.setItem(this.TIPOS_DOCUMENTO_KEY, JSON.stringify(tipos));
    } catch (error) {
      console.error('Error al guardar tipos de documento:', error);
      throw new Error('No se pudieron guardar los tipos de documento');
    }
  }

  // ===== RESPONSABLES =====
  getResponsables(): Responsable[] {
    return this.getResponsablesFromStorage();
  }

  getResponsableById(id: string): Responsable | null {
    const responsables = this.getResponsablesFromStorage();
    return responsables.find(resp => resp.id === id) || null;
  }

  getResponsablesByEmpresa(empresaId: string): Responsable[] {
    const responsables = this.getResponsablesFromStorage();
    return responsables.filter(resp => resp.empresa_id === empresaId);
  }

  createResponsable(data: Omit<Responsable, 'id' | 'created_at'>): Responsable {
    const responsables = this.getResponsablesFromStorage();

    const nuevoResponsable: Responsable = {
      id: uuidv4(),
      ...data,
      created_at: new Date().toISOString(),
      isPredefined: false
    };

    responsables.push(nuevoResponsable);
    this.saveResponsablesToStorage(responsables);

    return nuevoResponsable;
  }

  updateResponsable(id: string, data: Partial<Omit<Responsable, 'id' | 'created_at'>>): Responsable | null {
    const responsables = this.getResponsablesFromStorage();
    const index = responsables.findIndex(resp => resp.id === id);

    if (index === -1) return null;

    // No permitir editar responsables predefinidos
    if (responsables[index].isPredefined) {
      throw new Error('No se pueden editar responsables predefinidos');
    }

    responsables[index] = {
      ...responsables[index],
      ...data,
      updated_at: new Date().toISOString()
    } as any;

    this.saveResponsablesToStorage(responsables);
    return responsables[index];
  }

  deleteResponsable(id: string): boolean {
    const responsables = this.getResponsablesFromStorage();
    const responsable = responsables.find(resp => resp.id === id);

    if (!responsable) return false;

    // No permitir eliminar responsables predefinidos
    if (responsable.isPredefined) {
      throw new Error('No se pueden eliminar responsables predefinidos');
    }

    const responsablesFiltrados = responsables.filter(resp => resp.id !== id);
    this.saveResponsablesToStorage(responsablesFiltrados);

    return true;
  }

  private saveResponsablesToStorage(responsables: Responsable[]) {
    try {
      localStorage.setItem(this.RESPONSABLES_KEY, JSON.stringify(responsables));
    } catch (error) {
      console.error('Error al guardar responsables:', error);
      throw new Error('No se pudieron guardar los responsables');
    }
  }

  // ===== FONDOS =====
  getFondos(): Fondo[] {
    return this.getFondosFromStorage();
  }

  getFondoById(id: string): Fondo | null {
    const fondos = this.getFondosFromStorage();
    return fondos.find(fondo => fondo.id === id) || null;
  }

  getFondosByEmpresa(empresaId: string): Fondo[] {
    const fondos = this.getFondosFromStorage();
    return fondos.filter(fondo => fondo.empresa_id === empresaId);
  }

  getFondosActivosByEmpresa(empresaId: string): Fondo[] {
    const fondos = this.getFondosByEmpresa(empresaId);
    return fondos.filter(fondo => fondo.estado === 'ACTIVO' && fondo.monto_disponible > 0);
  }

  createFondo(data: Omit<Fondo, 'id' | 'created_at'>): Fondo {
    const fondos = this.getFondosFromStorage();

    const nuevoFondo: Fondo = {
      id: uuidv4(),
      ...data,
      created_at: new Date().toISOString(),
      isPredefined: false
    };

    fondos.push(nuevoFondo);
    this.saveFondosToStorage(fondos);

    return nuevoFondo;
  }

  updateFondo(id: string, data: Partial<Omit<Fondo, 'id' | 'created_at'>>): Fondo | null {
    const fondos = this.getFondosFromStorage();
    const index = fondos.findIndex(fondo => fondo.id === id);

    if (index === -1) return null;

    // No permitir editar fondos predefinidos
    if (fondos[index].isPredefined) {
      throw new Error('No se pueden editar fondos predefinidos');
    }

    fondos[index] = {
      ...fondos[index],
      ...data,
      updated_at: new Date().toISOString()
    } as any;

    this.saveFondosToStorage(fondos);
    return fondos[index];
  }

  deleteFondo(id: string): boolean {
    const fondos = this.getFondosFromStorage();
    const fondo = fondos.find(fondo => fondo.id === id);

    if (!fondo) return false;

    // No permitir eliminar fondos predefinidos
    if (fondo.isPredefined) {
      throw new Error('No se pueden eliminar fondos predefinidos');
    }

    const fondosFiltrados = fondos.filter(fondo => fondo.id !== id);
    this.saveFondosToStorage(fondosFiltrados);

    return true;
  }

  // Método para descontar monto de un fondo (usado en gastos)
  descontarMontoFondo(fondoId: string, monto: number): Fondo | null {
    const fondo = this.getFondoById(fondoId);
    if (!fondo) return null;

    if (fondo.monto_disponible < monto) {
      throw new Error('Saldo insuficiente en el fondo');
    }

    const nuevoMontoDisponible = fondo.monto_disponible - monto;
    return this.updateFondo(fondoId, { monto_disponible: nuevoMontoDisponible });
  }

  private saveFondosToStorage(fondos: Fondo[]) {
    try {
      localStorage.setItem(this.FONDOS_KEY, JSON.stringify(fondos));
    } catch (error) {
      console.error('Error al guardar fondos:', error);
      throw new Error('No se pudieron guardar los fondos');
    }
  }

  private saveGastosToStorage(gastos: MockGasto[]) {
    try {
      localStorage.setItem(this.GASTOS_KEY, JSON.stringify(gastos));
    } catch (error) {
      console.error('Error al guardar gastos:', error);
      throw new Error('No se pudieron guardar los gastos');
    }
  }

  // ===== ASIGNACIONES DE FONDO =====
  private getAsignacionesFondoFromStorage(): MockAsignacionFondo[] {
    try {
      const data = localStorage.getItem(this.ASIGNACIONES_FONDOS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error al obtener asignaciones de fondos:', error);
      return [];
    }
  }

  private saveAsignacionesFondoToStorage(asignaciones: MockAsignacionFondo[]) {
    try {
      localStorage.setItem(this.ASIGNACIONES_FONDOS_KEY, JSON.stringify(asignaciones));
    } catch (error) {
      console.error('Error al guardar asignaciones de fondos:', error);
      throw new Error('No se pudieron guardar las asignaciones de fondos');
    }
  }

  // Métodos públicos para asignaciones de fondo
  getAsignacionesFondo(): MockAsignacionFondo[] {
    return this.getAsignacionesFondoFromStorage();
  }

  getAsignacionFondoById(fondoId: string): MockAsignacionFondo | null {
    const asignaciones = this.getAsignacionesFondoFromStorage();
    return asignaciones.find(fondo => fondo.fondo_id === fondoId) || null;
  }

  createAsignacionFondo(data: {
    empresa: string;
    sucursal: string;
    responsable: string;
    tipo_fondo: string;
    monto_asignado: string;
    fecha_vencimiento: string;
    observaciones?: string;
  }): MockAsignacionFondo {
    const asignaciones = this.getAsignacionesFondoFromStorage();

    const nuevaAsignacion: MockAsignacionFondo = {
      fondo_id: 'fondo_' + Date.now().toString(36),
      ...data,
      tipo_fondo_display: this.getTipoFondoDisplay(data.tipo_fondo),
      monto_rendido: '0.00',
      saldo_pendiente: data.monto_asignado,
      fecha_asignacion: new Date().toISOString().split('T')[0],
      estado: 1, // ASIGNADO
      estado_display: 'Asignado',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    asignaciones.push(nuevaAsignacion);
    this.saveAsignacionesFondoToStorage(asignaciones);

    return nuevaAsignacion;
  }

  updateAsignacionFondo(fondoId: string, data: Partial<MockAsignacionFondo>): MockAsignacionFondo | null {
    const asignaciones = this.getAsignacionesFondoFromStorage();
    const index = asignaciones.findIndex(a => a.fondo_id === fondoId);

    if (index === -1) return null;

    // Actualizar datos
    const asignacionActualizada = {
      ...asignaciones[index],
      ...data,
      updated_at: new Date().toISOString()
    };

    asignaciones[index] = asignacionActualizada;
    this.saveAsignacionesFondoToStorage(asignaciones);

    return asignacionActualizada;
  }

  anularAsignacionFondo(fondoId: string): boolean {
    const asignaciones = this.getAsignacionesFondoFromStorage();
    const index = asignaciones.findIndex(fondo => fondo.fondo_id === fondoId);

    if (index === -1) return false;

    asignaciones[index] = {
      ...asignaciones[index],
      estado: 9, // ANULADO
      estado_display: 'Anulado',
      updated_at: new Date().toISOString()
    };

    this.saveAsignacionesFondoToStorage(asignaciones);
    return true;
  }

  getAsignacionesStatistics(): {
    total_asignado: string;
    total_rendido: string;
    saldo_pendiente: string;
    fondos_pendientes: number;
  } {
    const asignaciones = this.getAsignacionesFondoFromStorage();

    const total_asignado = asignaciones.reduce((total, fondo) =>
      total + parseFloat(fondo.monto_asignado), 0
    ).toFixed(2);

    const total_rendido = asignaciones.reduce((total, fondo) =>
      total + parseFloat(fondo.monto_rendido || '0'), 0
    ).toFixed(2);

    const saldo_pendiente = (parseFloat(total_asignado) - parseFloat(total_rendido)).toFixed(2);

    const fondos_pendientes = asignaciones.filter(fondo =>
      fondo.estado === 1 || fondo.estado === 2 // ASIGNADO o POR_RENDIR
    ).length;

    return {
      total_asignado,
      total_rendido,
      saldo_pendiente,
      fondos_pendientes
    };
  }

  private getTipoFondoDisplay(tipo_fondo: string): string {
    const tipos: { [key: string]: string } = {
      'caja_chica': 'Caja Chica',
      'caja_grande': 'Caja Grande',
      'viaticos': 'Viáticos',
      'proyectos_especiales': 'Proyectos Especiales',
      'eventos': 'Eventos',
      'mantenimiento': 'Mantenimiento',
      'otros': 'Otros'
    };
    return tipos[tipo_fondo] || tipo_fondo;
  }

  // ===== GASTOS =====
  getGastos(): MockGasto[] {
    return this.getGastosFromStorage();
  }

  getGastoById(gastoId: string): MockGasto | null {
    const gastos = this.getGastosFromStorage();
    return gastos.find(gasto => gasto.gastoId === gastoId) || null;
  }

  createGasto(data: Omit<MockGasto, 'gastoId' | 'created_at'>): MockGasto {
    const gastos = this.getGastosFromStorage();

    const nuevoGasto: MockGasto = {
      gastoId: 'gasto_' + Date.now().toString(36),
      ...data,
      estado: data.estado || 'borrador', // Usar el estado del data o el por defecto
      moneda: data.moneda || 'PEN', // Usar la moneda del data o la por defecto
      imagenes: data.imagenes || [], // Inicializar array de imágenes
      created_at: new Date().toISOString()
    };

    gastos.push(nuevoGasto);
    this.saveGastosToStorage(gastos);

    return nuevoGasto;
  }

  getEvidencias(gastoId: string): { gasto_id: string; evidencias: any[] } {
    const gasto = this.getGastoById(gastoId);
    if (!gasto) {
      throw new Error('Gasto no encontrado');
    }

    // Por ahora, devolver un array vacío de evidencias
    // Esto se puede implementar más tarde si se necesita
    return {
      gasto_id: gastoId,
      evidencias: []
    };
  }

  // ===== UTILIDADES =====
  exportData() {
    return {
      empresas: this.getEmpresas(),
      tipos_documento: this.getTiposDocumento(),
      responsables: this.getResponsables(),
      fondos: this.getFondos()
    };
  }

  importData(data: { empresas?: Empresa[], tipos_documento?: TipoDocumento[], responsables?: Responsable[], fondos?: Fondo[] }) {
    if (data.empresas) {
      this.saveEmpresasToStorage(data.empresas);
    }
    if (data.tipos_documento) {
      this.saveTiposDocumentoToStorage(data.tipos_documento);
    }
    if (data.responsables) {
      this.saveResponsablesToStorage(data.responsables);
    }
    if (data.fondos) {
      this.saveFondosToStorage(data.fondos);
    }
  }

  // Limpiar todos los datos (solo los creados por usuario)
  limpiarDatosUsuario() {
    const empresas = this.getEmpresas().filter(empresa => !empresa.isPredefined);
    const tiposDoc = this.getTiposDocumento().filter(tipo => !tipo.isPredefined);
    const responsables = this.getResponsables().filter(resp => !resp.isPredefined);
    const fondos = this.getFondos().filter(fondo => !fondo.isPredefined);

    this.saveEmpresasToStorage(empresas);
    this.saveTiposDocumentoToStorage(tiposDoc);
    this.saveResponsablesToStorage(responsables);
    this.saveFondosToStorage(fondos);
  }
}

// Exportar instancia única del servicio
export const mocksService = new MocksService();