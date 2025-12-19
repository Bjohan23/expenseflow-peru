import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  ApiResponse,
  PaginatedResponse,
  CategoriaGasto,
  CategoriaGastoSelector,
  Caja,
  Sucursal,
  AperturaCaja,
  CierreCajaRequest,
  Gasto,
  CreateGastoRequest,
  Evidencia,
  AsignacionFondo,
  GastosFilters,
  AsignacionesFilters,
  GastosStatistics,
  ValidateResponsableResponse
} from '@/types/treasury';
import { mocksService } from './mocks.service';

class TreasuryService {
  private api: AxiosInstance;
  public useMocks: boolean = false;

  constructor() {
    // Usar la URL correcta del .env o fallback a la producción
    const baseUrl = import.meta.env.VITE_API_URL || 'https://comercial.devsbee.com';

    // Detectar si estamos en desarrollo o la URL no responde
    this.useMocks = import.meta.env.DEV || !baseUrl || baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1');

    this.api = axios.create({
      baseURL: `${baseUrl}/api/v1/treasury`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Interceptor para añadir token JWT en todas las peticiones
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          // Debug en desarrollo
          if (import.meta.env.DEV) {
            console.log(`🔑 Treasury API Request: ${config.method?.toUpperCase()} ${config.url}`, {
              headers: {
                ...config.headers,
                Authorization: config.headers.Authorization ? 'Bearer [TOKEN]' : 'No Token'
              },
              baseURL: config.baseURL
            });
          }
        }
        return config;
      },
      (error) => {
        console.error('❌ Treasury Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Interceptor para manejar refresh automático de token
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        // Debug en desarrollo
        if (import.meta.env.DEV) {
          console.log(`✅ Treasury API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
            status: response.status,
            data: response.data
          });
        }
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Solo intentar refresh si es error 401 y no se ha intentado antes
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refresh_token');
            const accessToken = localStorage.getItem('auth_token');

            if (refreshToken && accessToken) {
              console.log('🔄 Refreshing treasury token...');

              // Usar una instancia directa de axios para evitar recursión
              const refreshResponse = await axios.post(
                `${baseUrl}/api/v1/auth/token/refresh/`,
                { refresh: refreshToken },
                {
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                  }
                }
              );

              const newAccessToken = refreshResponse.data.access;
              const newRefreshToken = refreshResponse.data.refresh || refreshToken;

              // Actualizar tokens en localStorage
              localStorage.setItem('auth_token', newAccessToken);
              localStorage.setItem('refresh_token', newRefreshToken);

              console.log('✅ Token refreshed successfully');

              // Reintentar la petición original con el nuevo token
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            console.error('❌ Token refresh failed:', refreshError);

            // Limpiar tokens y redirigir a login
            localStorage.removeItem('auth_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
          }
        }

        // Log del error completo en desarrollo
        if (import.meta.env.DEV) {
          console.error(`❌ Treasury API Error: ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`, {
            status: error.response?.status,
            message: error.message,
            data: error.response?.data,
            baseURL: originalRequest?.baseURL
          });
        }

        return Promise.reject(error);
      }
    );
  }

  // Helper para extraer data de respuestas
  private extractData<T>(response: AxiosResponse<ApiResponse<T>>): T {
    if (!response.data.success) {
      throw new Error(response.data.message || 'Error en la respuesta del servidor');
    }
    return response.data.data;
  }

  private extractPaginatedData<T>(response: AxiosResponse<PaginatedResponse<T>>): {
    data: T[];
    pagination: PaginatedResponse<T>['pagination'];
  } {
    if (!response.data.success) {
      throw new Error(response.data.message || 'Error en la respuesta del servidor');
    }
    return {
      data: response.data.data,
      pagination: response.data.pagination
    };
  }

  // Validaciones comunes
  private validateUUID(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }

  private validatePositiveNumber(value: string | number): boolean {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return !isNaN(num) && num > 0;
  }

  private validateRequiredFields(obj: Record<string, any>, requiredFields: string[]): void {
    const missing = requiredFields.filter(field => !obj[field]);
    if (missing.length > 0) {
      throw new Error(`Campos requeridos faltantes: ${missing.join(', ')}`);
    }
  }

  // Helper methods para obtener nombres de entidades relacionadas
  private getEmpresaNombre(empresaId: string): string {
    const empresa = mocksService.getEmpresaById(empresaId);
    return empresa?.razon_social || 'Empresa Desconocida';
  }

  private getSucursalNombre(sucursalId: string): string {
    // Para las sucursales, usamos los datos predefinidos basados en el código
    const sucursales: { [key: string]: string } = {
      '0101': 'Matriz',
      '0102': 'Sucursal 2',
      '0103': 'Sucursal 3',
      '0104': 'Sucursal 4',
      '0105': 'Sucursal 5',
      '0201': 'Sucursal A',
      '0202': 'Sucursal B',
      '0203': 'Sucursal C',
      '0204': 'Sucursal D',
      '0301': 'Sucursal X',
      '0302': 'Sucursal Y',
      '0303': 'Sucursal Z',
      '0304': 'Sucursal W'
    };
    return sucursales[sucursalId] || 'Sucursal Desconocida';
  }

  private getResponsableNombre(responsableId: string): string {
    const responsable = mocksService.getResponsableById(responsableId);
    return responsable?.nombre_completo || 'Responsable Desconocido';
  }

  // ===== CATEGORÍAS DE GASTO =====
  async getCategorias(params?: {
    page?: number;
    page_size?: number;
    search?: string;
  }) {
    const response = await this.api.get<PaginatedResponse<CategoriaGasto>>('/categorias-gasto/', { params });
    return this.extractPaginatedData(response);
  }

  async getCategoriasSelector() {
    const response = await this.api.get<ApiResponse<CategoriaGastoSelector[]>>('/categorias-gasto/selector/');
    return this.extractData(response);
  }

  async getCategoriaById(id: string) {
    const response = await this.api.get<ApiResponse<CategoriaGasto>>(`/categorias-gasto/${id}/`);
    return this.extractData(response);
  }

  async createCategoria(data: Partial<CategoriaGasto>) {
    // Validar datos
    this.validateRequiredFields(data, ['nombre_categoria']);

    const response = await this.api.post<ApiResponse<CategoriaGasto>>('/categorias-gasto/', data);
    return this.extractData(response);
  }

  async updateCategoria(id: string, data: Partial<CategoriaGasto>) {
    if (!this.validateUUID(id)) {
      throw new Error('ID de categoría inválido');
    }
    this.validateRequiredFields(data, ['nombre_categoria']);

    const response = await this.api.put<ApiResponse<CategoriaGasto>>(`/categorias-gasto/${id}/`, data);
    return this.extractData(response);
  }

  async deleteCategoria(id: string) {
    if (!this.validateUUID(id)) {
      throw new Error('ID de categoría inválido');
    }
    await this.api.delete(`/categorias-gasto/${id}/`);
  }

  // ===== CAJAS =====
  async getCajas(params?: {
    empresa?: string;
    sucursal?: string;
    estado?: number;
  }) {
    const response = await this.api.get<PaginatedResponse<Caja>>('/cajas/', { params });
    return this.extractPaginatedData(response);
  }

  async getCajaById(id: string) {
    const response = await this.api.get<ApiResponse<Caja>>(`/cajas/${id}/`);
    return this.extractData(response);
  }

  async getCajasBySucursal(sucursalId: string) {
    const response = await this.api.get<ApiResponse<Caja[]>>(`/cajas/by-sucursal/${sucursalId}/`);
    return this.extractData(response);
  }

  // ===== APERTURA Y CIERRE DE CAJA =====
  async abrirCaja(data: {
    caja: string;
    monto_inicial: string;
    observaciones?: string;
  }) {
    const response = await this.api.post<ApiResponse<AperturaCaja>>('/apertura-cajas/', data);
    return this.extractData(response);
  }

  async getCurrentAperturaCaja(cajaId: string) {
    const response = await this.api.get<ApiResponse<AperturaCaja>>(`/apertura-cajas/current/${cajaId}/`);
    return this.extractData(response);
  }

  async cerrarCaja(id: string, data: CierreCajaRequest) {
    const response = await this.api.post<ApiResponse<any>>(`/apertura-cajas/${id}/close/`, data);
    return this.extractData(response);
  }

  async getAperturasCajas() {
    const response = await this.api.get<ApiResponse<AperturaCaja[]>>('/apertura-cajas/');
    return this.extractData(response);
  }

  // ===== GASTOS =====
  async getGastos(filters?: GastosFilters) {
    // Usar mock service para gastos
    if (this.useMocks) {
      const gastos = mocksService.getGastos();

      // Mapeo de estados (number -> string)
      const estadoMap: { [key: number]: string } = {
        1: 'borrador',
        2: 'pendiente',
        3: 'aprobado',
        4: 'pagado',
        5: 'rechazado',
        6: 'anulado'
      };

      // Aplicar filtros si se proporcionan
      let gastosFiltrados = gastos;
      if (filters) {
        if (filters.empresa) {
          gastosFiltrados = gastosFiltrados.filter(g => g.empresa === filters.empresa);
        }
        if (filters.responsable) {
          gastosFiltrados = gastosFiltrados.filter(g => g.responsable === filters.responsable);
        }
        if (filters.estado !== undefined) {
          const estadoString = estadoMap[filters.estado];
          if (estadoString) {
            gastosFiltrados = gastosFiltrados.filter(g => g.estado === estadoString);
          } else {
            gastosFiltrados = []; // Si el estado no existe, no retornar resultados
          }
        }
        if (filters.fecha_inicio) {
          gastosFiltrados = gastosFiltrados.filter(g => g.fecha_documento >= filters.fecha_inicio!);
        }
        if (filters.fecha_fin) {
          gastosFiltrados = gastosFiltrados.filter(g => g.fecha_documento <= filters.fecha_fin!);
        }
      }

      return {
        data: gastosFiltrados,
        pagination: null
      };
    }

    const response = await this.api.get<PaginatedResponse<Gasto>>('/gastos/', { params: filters });
    return this.extractPaginatedData(response);
  }

  async getGastoById(id: string) {
    const response = await this.api.get<ApiResponse<Gasto>>(`/gastos/${id}/`);
    return this.extractData(response);
  }

  async createGasto(data: CreateGastoRequest) {
    // Validaciones básicas
    this.validateRequiredFields(data, ['empresa', 'sucursal', 'categoria', 'responsable', 'glosa', 'importe', 'fecha_documento']);

    if (!this.validatePositiveNumber(data.importe)) {
      throw new Error('El importe debe ser un número positivo');
    }

    const response = await this.api.post<ApiResponse<Gasto>>('/gastos/', data);
    return this.extractData(response);
  }

  async updateGasto(id: string, data: Partial<CreateGastoRequest>) {
    const response = await this.api.put<ApiResponse<Gasto>>(`/gastos/${id}/`, data);
    return this.extractData(response);
  }

  async deleteGasto(id: string) {
    await this.api.delete(`/gastos/${id}/`);
  }

  async searchGastos(query: string, filters?: Partial<GastosFilters>) {
    const params = { q: query, ...filters };
    const response = await this.api.get<PaginatedResponse<Gasto>>('/gastos/search/', { params });
    return this.extractPaginatedData(response);
  }

  // ===== EVIDENCIAS DE GASTO =====
  async getEvidencias(gastoId: string) {
    const response = await this.api.get<ApiResponse<{
      gasto_id: string;
      evidencias: Evidencia[];
    }>>(`/gastos/${gastoId}/evidencias/`);
    return this.extractData(response);
  }

  async addEvidencia(gastoId: string, data: FormData) {
    const response = await this.api.post<ApiResponse<Evidencia>>(
      `/gastos/${gastoId}/evidencias/add/`,
      data,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return this.extractData(response);
  }

  async deleteEvidencia(gastoId: string, evidenciaId: number) {
    await this.api.delete(`/gastos/${gastoId}/evidencias/${evidenciaId}/`);
  }

  async searchAsignaciones(query: string, filters?: Partial<AsignacionesFilters>) {
    // Usar mock service
    if (this.useMocks) {
      const asignaciones = mocksService.getAsignacionesFondo();

      // Filtrar por query (buscar en empresa_nombre, sucursal_nombre, responsable_nombre)
      let asignacionesFiltradas = asignaciones.filter(fondo => {
        const searchLower = query.toLowerCase();
        return (
          fondo.empresa_nombre?.toLowerCase().includes(searchLower) ||
          fondo.sucursal_nombre?.toLowerCase().includes(searchLower) ||
          fondo.responsable_nombre?.toLowerCase().includes(searchLower) ||
          fondo.tipo_fondo_display?.toLowerCase().includes(searchLower) ||
          fondo.fondo_id.toLowerCase().includes(searchLower)
        );
      });

      // Aplicar filtros adicionales
      if (filters) {
        if (filters.empresa) {
          asignacionesFiltradas = asignacionesFiltradas.filter(f => f.empresa === filters.empresa);
        }
        if (filters.responsable) {
          asignacionesFiltradas = asignacionesFiltradas.filter(f => f.responsable === filters.responsable);
        }
        if (filters.estado !== undefined) {
          asignacionesFiltradas = asignacionesFiltradas.filter(f => f.estado === filters.estado);
        }
      }

      return {
        data: asignacionesFiltradas,
        pagination: null
      };
    }

    const params = { q: query, ...filters };
    const response = await this.api.get<PaginatedResponse<AsignacionFondo>>('/asignaciones-fondo/search/', { params });
    return this.extractPaginatedData(response);
  }

  // ===== APROBACIÓN DE GASTOS =====
  async aprobarGasto(gastoId: string, data?: { observaciones?: string }) {
    const response = await this.api.post<ApiResponse<Gasto>>(`/gastos/${gastoId}/approve/`, data);
    return this.extractData(response);
  }

  async rechazarGasto(gastoId: string, data: { motivo: string }) {
    const response = await this.api.post<ApiResponse<Gasto>>(`/gastos/${gastoId}/reject/`, data);
    return this.extractData(response);
  }

  async anularGasto(gastoId: string, data: { motivo: string }) {
    const response = await this.api.post<ApiResponse<Gasto>>(`/gastos/${gastoId}/anular/`, data);
    return this.extractData(response);
  }

  // ===== ASIGNACIONES DE FONDO =====
  async getAsignacionesFondo(filters?: AsignacionesFilters) {
    // Usar mock service para asignaciones de fondos
    if (this.useMocks) {
      const asignaciones = mocksService.getAsignacionesFondo();

      // Transformar datos para que coincidan con el tipo esperado
      return {
        data: asignaciones.map(fondo => ({
          ...fondo,
          empresa_nombre: this.getEmpresaNombre(fondo.empresa),
          sucursal_nombre: this.getSucursalNombre(fondo.sucursal),
          responsable_nombre: this.getResponsableNombre(fondo.responsable)
        })),
        pagination: null
      };
    }

    const response = await this.api.get<PaginatedResponse<AsignacionFondo>>('/asignaciones-fondo/', { params: filters });
    return this.extractPaginatedData(response);
  }

  async getAsignacionFondo(id: string) {
    // Usar mock service
    if (this.useMocks) {
      const fondo = mocksService.getAsignacionFondoById(id);
      if (!fondo) {
        throw new Error('Asignación de fondo no encontrada');
      }
      return {
        ...fondo,
        empresa_nombre: this.getEmpresaNombre(fondo.empresa),
        sucursal_nombre: this.getSucursalNombre(fondo.sucursal),
        responsable_nombre: this.getResponsableNombre(fondo.responsable)
      };
    }

    const response = await this.api.get<ApiResponse<AsignacionFondo>>(`/asignaciones-fondo/${id}/`);
    return this.extractData(response);
  }

  async getAsignacionesPendientes(filters?: AsignacionesFilters) {
    // Usar mock service
    if (this.useMocks) {
      const asignaciones = mocksService.getAsignacionesFondo();
      const pendientes = asignaciones.filter(fondo => fondo.estado === 1 || fondo.estado === 2); // ASIGNADO o POR_RENDIR

      return {
        data: pendientes.map(fondo => ({
          ...fondo,
          empresa_nombre: this.getEmpresaNombre(fondo.empresa),
          sucursal_nombre: this.getSucursalNombre(fondo.sucursal),
          responsable_nombre: this.getResponsableNombre(fondo.responsable)
        })),
        pagination: null
      };
    }

    const response = await this.api.get<PaginatedResponse<AsignacionFondo>>('/asignaciones-fondo/pendientes/', { params: filters });
    return this.extractPaginatedData(response);
  }

  async getAsignacionesVencidas(filters?: AsignacionesFilters) {
    // Usar mock service
    if (this.useMocks) {
      const asignaciones = mocksService.getAsignacionesFondo();
      const hoy = new Date().toISOString().split('T')[0];
      const vencidas = asignaciones.filter(fondo =>
        fondo.fecha_vencimiento && fondo.fecha_vencimiento < hoy && fondo.estado !== 9 && fondo.estado !== 3
      );

      return {
        data: vencidas.map(fondo => ({
          ...fondo,
          empresa_nombre: this.getEmpresaNombre(fondo.empresa),
          sucursal_nombre: this.getSucursalNombre(fondo.sucursal),
          responsable_nombre: this.getResponsableNombre(fondo.responsable)
        })),
        pagination: null
      };
    }

    const response = await this.api.get<PaginatedResponse<AsignacionFondo>>('/asignaciones-fondo/vencidos/', { params: filters });
    return this.extractPaginatedData(response);
  }

  async createAsignacionFondo(data: {
    empresa: string;
    sucursal: string;
    responsable: string;
    tipo_fondo: string;
    monto_asignado: string;
    fecha_vencimiento: string;
    observaciones?: string;
  }) {
    // Validaciones
    this.validateRequiredFields(data, ['empresa', 'sucursal', 'responsable', 'tipo_fondo', 'monto_asignado', 'fecha_vencimiento']);

    if (!this.validatePositiveNumber(data.monto_asignado)) {
      throw new Error('El monto asignado debe ser un número positivo');
    }

    // Usar mock service
    if (this.useMocks) {
      return mocksService.createAsignacionFondo(data);
    }

    const response = await this.api.post<ApiResponse<AsignacionFondo>>('/asignaciones-fondo/', data);
    return this.extractData(response);
  }

  async validateResponsable(responsableId: string) {
    const response = await this.api.post<ValidateResponsableResponse>(
      '/asignaciones-fondo/validate-responsable/',
      { responsable_id: responsableId }
    );
    return response.data;
  }

  async marcarPorRendir(fondoId: string) {
    // Usar mock service
    if (this.useMocks) {
      const fondo = mocksService.getAsignacionFondoById(fondoId);
      if (!fondo) {
        throw new Error('Asignación de fondo no encontrada');
      }

      // Actualizar estado a POR_RENDIR (2)
      const fondoActualizado = mocksService.updateAsignacionFondo(fondoId, {
        estado: 2,
        estado_display: 'Por Rendir'
      });

      if (!fondoActualizado) {
        throw new Error('No se pudo actualizar el estado de la asignación');
      }

      return {
        ...fondoActualizado,
        empresa_nombre: this.getEmpresaNombre(fondoActualizado.empresa),
        sucursal_nombre: this.getSucursalNombre(fondoActualizado.sucursal),
        responsable_nombre: this.getResponsableNombre(fondoActualizado.responsable)
      };
    }

    const response = await this.api.post<ApiResponse<AsignacionFondo>>(`/asignaciones-fondo/${fondoId}/marcar-por-rendir/`);
    return this.extractData(response);
  }

  async rendirAsignacionFondo(fondoId: string, data: {
    gastos_ids: string[]; // Array de gasto_ids
    comprobante_url?: string;
    observaciones?: string;
  }) {
    // Usar mock service
    if (this.useMocks) {
      const fondo = mocksService.getAsignacionFondoById(fondoId);
      if (!fondo) {
        throw new Error('Asignación de fondo no encontrada');
      }

      // Calcular monto rendido sumando los gastos
      let montoRendido = 0;
      for (const gastoId of data.gastos_ids) {
        const gasto = mocksService.getGastoById(gastoId);
        if (gasto) {
          montoRendido += parseFloat(gasto.importe);
        }
      }

      // Actualizar fondo como rendido
      const fondoActualizado = mocksService.updateAsignacionFondo(fondoId, {
        estado: 3, // RENDIDO
        estado_display: 'Rendido',
        monto_rendido: montoRendido.toFixed(2),
        saldo_pendiente: (parseFloat(fondo.monto_asignado) - montoRendido).toFixed(2),
        observaciones: data.observaciones || fondo.observaciones
      });

      if (!fondoActualizado) {
        throw new Error('No se pudo rendir la asignación');
      }

      return {
        ...fondoActualizado,
        empresa_nombre: this.getEmpresaNombre(fondoActualizado.empresa),
        sucursal_nombre: this.getSucursalNombre(fondoActualizado.sucursal),
        responsable_nombre: this.getResponsableNombre(fondoActualizado.responsable)
      };
    }

    const response = await this.api.post<ApiResponse<AsignacionFondo>>(`/asignaciones-fondo/${fondoId}/rendir/`, data);
    return this.extractData(response);
  }

  async anularAsignacionFondo(fondoId: string) {
    // Usar mock service
    if (this.useMocks) {
      const fondo = mocksService.getAsignacionFondoById(fondoId);
      if (!fondo) {
        throw new Error('Asignación de fondo no encontrada');
      }

      // Intentar anular usando el método del mock service
      const resultado = mocksService.anularAsignacionFondo(fondoId);
      if (!resultado) {
        throw new Error('No se pudo anular la asignación');
      }

      // Retornar el fondo actualizado
      const fondoActualizado = mocksService.getAsignacionFondoById(fondoId);
      if (!fondoActualizado) {
        throw new Error('Error al recuperar la asignación actualizada');
      }

      return {
        ...fondoActualizado,
        empresa_nombre: this.getEmpresaNombre(fondoActualizado.empresa),
        sucursal_nombre: this.getSucursalNombre(fondoActualizado.sucursal),
        responsable_nombre: this.getResponsableNombre(fondoActualizado.responsable)
      };
    }

    const response = await this.api.post<ApiResponse<AsignacionFondo>>(`/asignaciones-fondo/${fondoId}/anular/`, {});
    return this.extractData(response);
  }

  async getGastosByAsignacionFondo(fondoId: string) {
    // Usar mock service
    if (this.useMocks) {
      const gastos = mocksService.getGastos();
      // Filtrar gastos que pertenezcan a esta asignación de fondo
      const gastosAsignacion = gastos.filter(gasto => gasto.fondo === fondoId);
      return gastosAsignacion;
    }

    const response = await this.api.get<ApiResponse<Gasto[]>>(`/asignaciones-fondo/${fondoId}/gastos/`);
    return this.extractData(response);
  }

  async getAsignacionesStatistics(params?: {
    empresa?: string;
    sucursal?: string;
    responsable?: string;
  }) {
    // Usar mock service
    if (this.useMocks) {
      return mocksService.getAsignacionesStatistics();
    }

    const response = await this.api.get<ApiResponse<{
      total_asignado: string;
      total_rendido: string;
      saldo_pendiente: string;
      fondos_pendientes: number;
    }>>('/asignaciones-fondo/statistics/', { params });
    return this.extractData(response);
  }

  // ===== EMPRESAS Y SUCURSALES =====
  async getEmpresas() {
    const response = await this.api.get<ApiResponse<Array<{
      empresa_id: string;
      nro_ruc: string;
      razon_social: string;
      direccion: string;
      acronimo: string;
      avatar: string;
      estado: number;
      created_at?: string;
      updated_at?: string;
    }>>>('/core/empresas/', {
      baseURL: `${this.api.defaults.baseURL.replace('/treasury', '')}`
    });

    const empresas = this.extractData(response);

    // Transformar al formato esperado por los componentes
    return empresas.map(empresa => ({
      id: empresa.empresa_id,
      nombre: empresa.razon_social,
      acronimo: empresa.acronimo,
      ruc: empresa.nro_ruc,
      direccion: empresa.direccion,
      avatar: empresa.avatar,
      estado: empresa.estado,
      created_at: empresa.created_at,
      updated_at: empresa.updated_at
    }));
  }

  // ===== CRUD EMPRESAS =====
  async createEmpresa(data: {
    nro_ruc: string;
    razon_social: string;
    direccion: string;
    acronimo: string;
    avatar?: string;
  }) {
    const response = await this.api.post<ApiResponse<any>>('/core/empresas/', data, {
      baseURL: `${this.api.defaults.baseURL.replace('/treasury', '')}`
    });
    return this.extractData(response);
  }

  async updateEmpresa(empresaId: string, data: {
    empresa_id?: string;
    nro_ruc?: string;
    razon_social?: string;
    direccion?: string;
    acronimo?: string;
    avatar?: string;
    estado?: number;
  }) {
    const response = await this.api.put<ApiResponse<any>>(`/core/empresas/${empresaId}/`, data, {
      baseURL: `${this.api.defaults.baseURL.replace('/treasury', '')}`
    });
    return this.extractData(response);
  }

  async patchEmpresa(empresaId: string, data: Partial<{
    empresa_id?: string;
    nro_ruc?: string;
    razon_social?: string;
    direccion?: string;
    acronimo?: string;
    avatar?: string;
    estado?: number;
  }>) {
    const response = await this.api.patch<ApiResponse<any>>(`/core/empresas/${empresaId}/`, data, {
      baseURL: `${this.api.defaults.baseURL.replace('/treasury', '')}`
    });
    return this.extractData(response);
  }

  async deleteEmpresa(empresaId: string) {
    const response = await this.api.delete<ApiResponse<any>>(`/core/empresas/${empresaId}/`, {
      baseURL: `${this.api.defaults.baseURL.replace('/treasury', '')}`
    });
    return this.extractData(response);
  }

  async getSucursales(empresaId?: string): Promise<Sucursal[]> {
    // Si no hay empresaId, devolver todas las sucursales sin filtrar
    if (!empresaId) {
      const response = await this.api.get<PaginatedResponse<Sucursal>>('/core/sucursales/', {
        baseURL: `${this.api.defaults.baseURL.replace('/treasury', '')}`
      });
      const result = this.extractPaginatedData(response);
      return result.data;
    }

    // Si hay empresaId, filtrar por el nombre exacto de la empresa
    const response = await this.api.get<PaginatedResponse<Sucursal>>('/core/sucursales/', {
      baseURL: `${this.api.defaults.baseURL.replace('/treasury', '')}`
    });

    const result = this.extractPaginatedData(response);
    const sucursales = result.data;

    // Filtrar sucursales por el nombre exacto de la empresa
    const sucursalesFiltradas = sucursales.filter((s: Sucursal) => {
      // Extraer el ID de la empresa del sucursal_id (primeros 2 caracteres)
      const sucursalEmpresaId = s.sucursal_id.substring(0, 2);
      console.log('Sucursal:', s.nombre_sucursal, 'sucursal_id:', s.sucursal_id, 'empresa_id:', sucursalEmpresaId, 'filtrando por:', empresaId);
      return sucursalEmpresaId === empresaId;
    });

    console.log('Sucursales encontradas para empresa', empresaId, ':', sucursalesFiltradas.length);
    return sucursalesFiltradas;
  }

  // ===== ESTADÍSTICAS =====
  async getGastosStatistics(params?: {
    empresa?: string;
    sucursal?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
  }) {
    const response = await this.api.get<ApiResponse<GastosStatistics>>('/gastos/statistics/', { params });
    return this.extractData(response);
  }

  // ===== ESTADÍSTICAS ADICIONALES =====
  async getCajasStatistics() {
    const response = await this.api.get<ApiResponse<{
      total_cajas: number;
      cajas_last_24h: number;
      cajas_last_week: number;
      cajas_last_month: number;
    }>>('/cajas/statistics/');
    return this.extractData(response);
  }

  async getAperturasCajasStatistics() {
    const response = await this.api.get<{
      total_aperturas_caja: number;
      aperturas_caja_last_24h: number;
      aperturas_caja_last_week: number;
      aperturas_caja_last_month: number;
    }>('/apertura-cajas/statistics/');
    return response.data;
  }

  async getMovimientosStatistics() {
    const response = await this.api.get<ApiResponse<{
      total_movimientos_caja: number;
      movimientos_caja_last_24h: number;
      movimientos_caja_last_week: number;
      movimientos_caja_last_month: number;
    }>>('/movimientos/statistics/');
    return this.extractData(response);
  }

  async getRetirosStatistics() {
    const response = await this.api.get<ApiResponse<{
      total_withdrawals: number;
      total_amount: number;
      total_bills: number;
      total_coins: number;
      average_amount: number;
      by_status: {
        registrado: number;
        autorizado: number;
        rechazado: number;
      };
    }>>('/retiros/statistics/');
    return this.extractData(response);
  }

  async getCategoriasGastoStatistics() {
    const response = await this.api.get<ApiResponse<{
      total_categorias_gasto: number;
      categorias_gasto_last_24h: number;
      categorias_gasto_last_week: number;
      categorias_gasto_last_month: number;
    }>>('/categorias-gasto/statistics/');
    return this.extractData(response);
  }

  async getTransferenciasStatistics() {
    const response = await this.api.get<ApiResponse<{
      total_transferencias_efectivo: number;
      transferencias_efectivo_last_24h: number;
      transferencias_efectivo_last_week: number;
      transferencias_efectivo_last_month: number;
    }>>('/transferencias/statistics/');
    return this.extractData(response);
  }

  async getConceptosCajaStatistics() {
    const response = await this.api.get<ApiResponse<{
      total_conceptos_caja: number;
      conceptos_caja_last_24h: number;
      conceptos_caja_last_week: number;
      conceptos_caja_last_month: number;
    }>>('/conceptos-caja/statistics/');
    return this.extractData(response);
  }

  // ===== UTILIDADES ADICIONALES =====
  async getResponsablesDisponibles() {
    const response = await this.api.get<ApiResponse<Array<{
      id: string;
      nombre: string;
      email?: string;
      departamento?: string;
      tiene_asignacion_pendiente: boolean;
    }>>>('/responsables/disponibles/');
    return this.extractData(response);
  }

  async getTiposDocumento() {
    const response = await this.api.get<ApiResponse<Array<{
      id: string;
      nombre: string;
      codigo: string;
      activo: boolean;
    }>>>('/tipos-documento/');
    return this.extractData(response);
  }

  async getTiposFondo() {
    const response = await this.api.get<ApiResponse<Array<{
      id: string;
      nombre: string;
      codigo: string;
      descripcion?: string;
      activo: boolean;
    }>>>('/tipos-fondo/');
    return this.extractData(response);
  }

  // ===== EXPORTACIÓN DE DATOS =====
  async exportarGastos(filters?: GastosFilters) {
    const response = await this.api.get('/gastos/export/', {
      params: filters,
      responseType: 'blob'
    });

    // Crear URL para descarga
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `gastos_${new Date().toISOString().split('T')[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  async exportarAsignaciones(filters?: AsignacionesFilters) {
    const response = await this.api.get('/asignaciones-fondo/export/', {
      params: filters,
      responseType: 'blob'
    });

    // Crear URL para descarga
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `asignaciones_${new Date().toISOString().split('T')[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
}

// Crear instancia del servicio
export const treasuryService = new TreasuryService();
export default treasuryService;