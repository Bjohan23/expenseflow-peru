import { v4 as uuidv4 } from 'uuid';

// Tipos
export interface CategoriaGasto {
  categoria_id: string;
  nombre_categoria: string;
  descripcion_categoria?: string;
  created_at: string;
  updated_at: string;
  isPredefined?: boolean; // Para diferenciar los predefinidos de los creados por usuario
}

export interface ConceptoGasto {
  concepto_id: string;
  concepto: string;
  categoria_id: string;
  created_at: string;
  updated_at: string;
  isPredefined?: boolean;
}

// Datos predefinidos
export const CATEGORIAS_PREDEFINIDAS: Omit<CategoriaGasto, 'created_at' | 'updated_at'>[] = [
  {
    categoria_id: '550e8400-e29b-41d4-a716-446655440001',
    nombre_categoria: 'Viáticos y Transporte',
    descripcion_categoria: 'Gastos de transporte, viáticos y movilidad',
    isPredefined: true
  },
  {
    categoria_id: '550e8400-e29b-41d4-a716-446655440002',
    nombre_categoria: 'Alimentación',
    descripcion_categoria: 'Gastos de comida y alimentación',
    isPredefined: true
  },
  {
    categoria_id: '550e8400-e29b-41d4-a716-446655440003',
    nombre_categoria: 'Hospedaje',
    descripcion_categoria: 'Gastos de alojamiento y hospedaje',
    isPredefined: true
  },
  {
    categoria_id: '550e8400-e29b-41d4-a716-446655440004',
    nombre_categoria: 'Suministros y Materiales',
    descripcion_categoria: 'Compras de insumos y materiales de oficina',
    isPredefined: true
  },
  {
    categoria_id: '550e8400-e29b-41d4-a716-446655440005',
    nombre_categoria: 'Comunicaciones',
    descripcion_categoria: 'Gastos de teléfono, internet y comunicaciones',
    isPredefined: true
  },
  {
    categoria_id: '550e8400-e29b-41d4-a716-446655440006',
    nombre_categoria: 'Servicios Profesionales',
    descripcion_categoria: 'Honorarios y servicios profesionales',
    isPredefined: true
  },
  {
    categoria_id: '550e8400-e29b-41d4-a716-446655440007',
    nombre_categoria: 'Gastos Administrativos',
    descripcion_categoria: 'Gastos operativos y administrativos',
    isPredefined: true
  },
  {
    categoria_id: '550e8400-e29b-41d4-a716-446655440008',
    nombre_categoria: 'Capacitación y Eventos',
    descripcion_categoria: 'Gastos de capacitación y eventos',
    isPredefined: true
  }
];

export const CONCEPTOS_PREDEFINIDOS: Omit<ConceptoGasto, 'created_at' | 'updated_at'>[] = [
  // Viáticos y Transporte
  { concepto_id: '660e8400-e29b-41d4-a716-446655440001', concepto: 'Pasajes Aéreos', categoria_id: '550e8400-e29b-41d4-a716-446655440001', isPredefined: true },
  { concepto_id: '660e8400-e29b-41d4-a716-446655440002', concepto: 'Pasajes Terrestres', categoria_id: '550e8400-e29b-41d4-a716-446655440001', isPredefined: true },
  { concepto_id: '660e8400-e29b-41d4-a716-446655440003', concepto: 'Taxi', categoria_id: '550e8400-e29b-41d4-a716-446655440001', isPredefined: true },
  { concepto_id: '660e8400-e29b-41d4-a716-446655440004', concepto: 'Viáticos', categoria_id: '550e8400-e29b-41d4-a716-446655440001', isPredefined: true },
  { concepto_id: '660e8400-e29b-41d4-a716-446655440005', concepto: 'Movilidad Local', categoria_id: '550e8400-e29b-41d4-a716-446655440001', isPredefined: true },

  // Alimentación
  { concepto_id: '660e8400-e29b-41d4-a716-446655440006', concepto: 'Almuerzos de Negocios', categoria_id: '550e8400-e29b-41d4-a716-446655440002', isPredefined: true },
  { concepto_id: '660e8400-e29b-41d4-a716-446655440007', concepto: 'Cenas de Negocios', categoria_id: '550e8400-e29b-41d4-a716-446655440002', isPredefined: true },
  { concepto_id: '660e8400-e29b-41d4-a716-446655440008', concepto: 'Refrigerios', categoria_id: '550e8400-e29b-41d4-a716-446655440002', isPredefined: true },

  // Hospedaje
  { concepto_id: '660e8400-e29b-41d4-a716-446655440009', concepto: 'Hoteles', categoria_id: '550e8400-e29b-41d4-a716-446655440003', isPredefined: true },
  { concepto_id: '660e8400-e29b-41d4-a716-446655440010', concepto: 'Alojamientos', categoria_id: '550e8400-e29b-41d4-a716-446655440003', isPredefined: true },

  // Suministros y Materiales
  { concepto_id: '660e8400-e29b-41d4-a716-446655440011', concepto: 'Papelería', categoria_id: '550e8400-e29b-41d4-a716-446655440004', isPredefined: true },
  { concepto_id: '660e8400-e29b-41d4-a716-446655440012', concepto: 'Material de Oficina', categoria_id: '550e8400-e29b-41d4-a716-446655440004', isPredefined: true },
  { concepto_id: '660e8400-e29b-41d4-a716-446655440013', concepto: 'Impresiones y Fotocopias', categoria_id: '550e8400-e29b-41d4-a716-446655440004', isPredefined: true },

  // Comunicaciones
  { concepto_id: '660e8400-e29b-41d4-a716-446655440014', concepto: 'Teléfono Móvil', categoria_id: '550e8400-e29b-41d4-a716-446655440005', isPredefined: true },
  { concepto_id: '660e8400-e29b-41d4-a716-446655440015', concepto: 'Internet', categoria_id: '550e8400-e29b-41d4-a716-446655440005', isPredefined: true },
  { concepto_id: '660e8400-e29b-41d4-a716-446655440016', concepto: 'Llamadas Telefónicas', categoria_id: '550e8400-e29b-41d4-a716-446655440005', isPredefined: true },

  // Servicios Profesionales
  { concepto_id: '660e8400-e29b-41d4-a716-446655440017', concepto: 'Asesoría Legal', categoria_id: '550e8400-e29b-41d4-a716-446655440006', isPredefined: true },
  { concepto_id: '660e8400-e29b-41d4-a716-446655440018', concepto: 'Consultoría', categoria_id: '550e8400-e29b-41d4-a716-446655440006', isPredefined: true },
  { concepto_id: '660e8400-e29b-41d4-a716-446655440019', concepto: 'Servicios Contables', categoria_id: '550e8400-e29b-41d4-a716-446655440006', isPredefined: true },

  // Gastos Administrativos
  { concepto_id: '660e8400-e29b-41d4-a716-446655440020', concepto: 'Arrendamiento', categoria_id: '550e8400-e29b-41d4-a716-446655440007', isPredefined: true },
  { concepto_id: '660e8400-e29b-41d4-a716-446655440021', concepto: 'Servicios Básicos', categoria_id: '550e8400-e29b-41d4-a716-446655440007', isPredefined: true },
  { concepto_id: '660e8400-e29b-41d4-a716-446655440022', concepto: 'Mantenimiento', categoria_id: '550e8400-e29b-41d4-a716-446655440007', isPredefined: true },

  // Capacitación y Eventos
  { concepto_id: '660e8400-e29b-41d4-a716-446655440023', concepto: 'Cursos de Capacitación', categoria_id: '550e8400-e29b-41d4-a716-446655440008', isPredefined: true },
  { concepto_id: '660e8400-e29b-41d4-a716-446655440024', concepto: 'Eventos Corporativos', categoria_id: '550e8400-e29b-41d4-a716-446655440008', isPredefined: true },
  { concepto_id: '660e8400-e29b-41d4-a716-446655440025', concepto: 'Congresos y Seminarios', categoria_id: '550e8400-e29b-41d4-a716-446655440008', isPredefined: true }
];

// Clase de servicio para gestionar categorías y conceptos
class CategoriasService {
  private readonly CATEGORIAS_KEY = 'expenseflow_categorias';
  private readonly CONCEPTOS_KEY = 'expenseflow_conceptos';

  constructor() {
    this.initializeData();
  }

  // Inicializar datos predefinidos si no existen
  private initializeData() {
    const categoriasGuardadas = this.getCategoriasFromStorage();
    const conceptosGuardados = this.getConceptosFromStorage();

    // Solo inicializar si no hay datos
    if (categoriasGuardadas.length === 0) {
      const categoriasConTimestamp = CATEGORIAS_PREDEFINIDAS.map(cat => ({
        ...cat,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      localStorage.setItem(this.CATEGORIAS_KEY, JSON.stringify(categoriasConTimestamp));
    }

    if (conceptosGuardados.length === 0) {
      const conceptosConTimestamp = CONCEPTOS_PREDEFINIDOS.map(conc => ({
        ...conc,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      localStorage.setItem(this.CONCEPTOS_KEY, JSON.stringify(conceptosConTimestamp));
    }
  }

  private getCategoriasFromStorage(): CategoriaGasto[] {
    try {
      const data = localStorage.getItem(this.CATEGORIAS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error al obtener categorías del localStorage:', error);
      return [];
    }
  }

  private getConceptosFromStorage(): ConceptoGasto[] {
    try {
      const data = localStorage.getItem(this.CONCEPTOS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error al obtener conceptos del localStorage:', error);
      return [];
    }
  }

  private saveCategoriasToStorage(categorias: CategoriaGasto[]) {
    try {
      localStorage.setItem(this.CATEGORIAS_KEY, JSON.stringify(categorias));
    } catch (error) {
      console.error('Error al guardar categorías en localStorage:', error);
      throw new Error('No se pudieron guardar las categorías');
    }
  }

  private saveConceptosToStorage(conceptos: ConceptoGasto[]) {
    try {
      localStorage.setItem(this.CONCEPTOS_KEY, JSON.stringify(conceptos));
    } catch (error) {
      console.error('Error al guardar conceptos en localStorage:', error);
      throw new Error('No se pudieron guardar los conceptos');
    }
  }

  // ===== CATEGORÍAS =====
  getCategorias(): CategoriaGasto[] {
    return this.getCategoriasFromStorage();
  }

  getCategoriaById(id: string): CategoriaGasto | null {
    const categorias = this.getCategoriasFromStorage();
    return categorias.find(cat => cat.categoria_id === id) || null;
  }

  createCategoria(data: Omit<CategoriaGasto, 'categoria_id' | 'created_at' | 'updated_at'>): CategoriaGasto {
    const categorias = this.getCategoriasFromStorage();

    const nuevaCategoria: CategoriaGasto = {
      categoria_id: uuidv4(),
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      isPredefined: false // Las creadas por usuario no son predefinidas
    };

    categorias.push(nuevaCategoria);
    this.saveCategoriasToStorage(categorias);

    return nuevaCategoria;
  }

  updateCategoria(id: string, data: Partial<Omit<CategoriaGasto, 'categoria_id' | 'created_at'>>): CategoriaGasto | null {
    const categorias = this.getCategoriasFromStorage();
    const index = categorias.findIndex(cat => cat.categoria_id === id);

    if (index === -1) return null;

    // No permitir editar categorías predefinidas
    if (categorias[index].isPredefined) {
      throw new Error('No se pueden editar categorías predefinidas');
    }

    categorias[index] = {
      ...categorias[index],
      ...data,
      updated_at: new Date().toISOString()
    };

    this.saveCategoriasToStorage(categorias);
    return categorias[index];
  }

  deleteCategoria(id: string): boolean {
    const categorias = this.getCategoriasFromStorage();
    const categoria = categorias.find(cat => cat.categoria_id === id);

    if (!categoria) return false;

    // No permitir eliminar categorías predefinidas
    if (categoria.isPredefined) {
      throw new Error('No se pueden eliminar categorías predefinidas');
    }

    // Verificar si hay conceptos asociados
    const conceptos = this.getConceptosFromStorage();
    const tieneConceptosAsociados = conceptos.some(conc => conc.categoria_id === id);

    if (tieneConceptosAsociados) {
      throw new Error('No se puede eliminar una categoría con conceptos asociados');
    }

    const categoriasFiltradas = categorias.filter(cat => cat.categoria_id !== id);
    this.saveCategoriasToStorage(categoriasFiltradas);

    return true;
  }

  // ===== CONCEPTOS =====
  getConceptos(): ConceptoGasto[] {
    return this.getConceptosFromStorage();
  }

  getConceptosByCategoria(categoriaId: string): ConceptoGasto[] {
    const conceptos = this.getConceptosFromStorage();
    return conceptos.filter(conc => conc.categoria_id === categoriaId);
  }

  getConceptoById(id: string): ConceptoGasto | null {
    const conceptos = this.getConceptosFromStorage();
    return conceptos.find(conc => conc.concepto_id === id) || null;
  }

  createConcepto(data: Omit<ConceptoGasto, 'concepto_id' | 'created_at' | 'updated_at'>): ConceptoGasto {
    const conceptos = this.getConceptosFromStorage();

    // Verificar que la categoría exista
    const categoria = this.getCategoriaById(data.categoria_id);
    if (!categoria) {
      throw new Error('La categoría especificada no existe');
    }

    const nuevoConcepto: ConceptoGasto = {
      concepto_id: uuidv4(),
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      isPredefined: false
    };

    conceptos.push(nuevoConcepto);
    this.saveConceptosToStorage(conceptos);

    return nuevoConcepto;
  }

  updateConcepto(id: string, data: Partial<Omit<ConceptoGasto, 'concepto_id' | 'created_at'>>): ConceptoGasto | null {
    const conceptos = this.getConceptosFromStorage();
    const index = conceptos.findIndex(conc => conc.concepto_id === id);

    if (index === -1) return null;

    // No permitir editar conceptos predefinidos
    if (conceptos[index].isPredefined) {
      throw new Error('No se pueden editar conceptos predefinidos');
    }

    // Si se cambia la categoría, verificar que exista
    if (data.categoria_id) {
      const categoria = this.getCategoriaById(data.categoria_id);
      if (!categoria) {
        throw new Error('La categoría especificada no existe');
      }
    }

    conceptos[index] = {
      ...conceptos[index],
      ...data,
      updated_at: new Date().toISOString()
    };

    this.saveConceptosToStorage(conceptos);
    return conceptos[index];
  }

  deleteConcepto(id: string): boolean {
    const conceptos = this.getConceptosFromStorage();
    const concepto = conceptos.find(conc => conc.concepto_id === id);

    if (!concepto) return false;

    // No permitir eliminar conceptos predefinidos
    if (concepto.isPredefined) {
      throw new Error('No se pueden eliminar conceptos predefinidos');
    }

    const conceptosFiltrados = conceptos.filter(conc => conc.concepto_id !== id);
    this.saveConceptosToStorage(conceptosFiltrados);

    return true;
  }

  // ===== UTILIDADES =====
  getCategoriasConConceptos(): (CategoriaGasto & { conceptos: ConceptoGasto[] })[] {
    const categorias = this.getCategorias();
    const conceptos = this.getConceptos();

    return categorias.map(categoria => ({
      ...categoria,
      conceptos: conceptos.filter(conc => conc.categoria_id === categoria.categoria_id)
    }));
  }

  exportData() {
    return {
      categorias: this.getCategorias(),
      conceptos: this.getConceptos()
    };
  }

  importData(data: { categorias: CategoriaGasto[], conceptos: ConceptoGasto[] }) {
    this.saveCategoriasToStorage(data.categorias);
    this.saveConceptosToStorage(data.conceptos);
  }

  // Limpiar todos los datos (solo los creados por usuario)
  limpiarDatosUsuario() {
    const categorias = this.getCategorias().filter(cat => !cat.isPredefined);
    const conceptos = this.getConceptos().filter(conc => !conc.isPredefined);

    this.saveCategoriasToStorage(categorias);
    this.saveConceptosToStorage(conceptos);
  }
}

// Exportar instancia única del servicio
export const categoriasService = new CategoriasService();