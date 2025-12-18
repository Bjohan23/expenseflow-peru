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

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    this.initializeEmpresas();
    this.initializeTiposDocumento();
    this.initializeResponsables();
    this.initializeFondos();
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