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

class TreasuryService {
  private api: AxiosInstance;

  constructor() {
    // Usar la URL correcta del .env o fallback a la producción
    const baseUrl = import.meta.env.VITE_API_URL || 'https://comercial.devsbee.com';

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
    const response = await this.api.get<PaginatedResponse<AsignacionFondo>>('/asignaciones-fondo/', { params: filters });
    return this.extractPaginatedData(response);
  }

  async getAsignacionFondo(id: string) {
    const response = await this.api.get<ApiResponse<AsignacionFondo>>(`/asignaciones-fondo/${id}/`);
    return this.extractData(response);
  }

  async getAsignacionesPendientes(filters?: AsignacionesFilters) {
    const response = await this.api.get<PaginatedResponse<AsignacionFondo>>('/asignaciones-fondo/pendientes/', { params: filters });
    return this.extractPaginatedData(response);
  }

  async getAsignacionesVencidas(filters?: AsignacionesFilters) {
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
    const response = await this.api.post<ApiResponse<AsignacionFondo>>(`/asignaciones-fondo/${fondoId}/marcar-por-rendir/`);
    return this.extractData(response);
  }

  async rendirAsignacionFondo(fondoId: string, data: {
    gastos_ids: string[]; // Array de gasto_ids
    comprobante_url?: string;
    observaciones?: string;
  }) {
    const response = await this.api.post<ApiResponse<AsignacionFondo>>(`/asignaciones-fondo/${fondoId}/rendir/`, data);
    return this.extractData(response);
  }

  async anularAsignacionFondo(fondoId: string) {
    const response = await this.api.post<ApiResponse<AsignacionFondo>>(`/asignaciones-fondo/${fondoId}/anular/`, {});
    return this.extractData(response);
  }

  async getGastosByAsignacionFondo(fondoId: string) {
    const response = await this.api.get<ApiResponse<Gasto[]>>(`/asignaciones-fondo/${fondoId}/gastos/`);
    return this.extractData(response);
  }

  async getAsignacionesStatistics(params?: {
    empresa?: string;
    sucursal?: string;
    responsable?: string;
  }) {
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
      id: string;
      value: string;
      label: string;
      acronimo: string;
    }>>>('/core/empresas/selector/', {
      baseURL: `${this.api.defaults.baseURL.replace('/treasury', '')}`
    });

    const empresas = this.extractData(response);

    // Transformar al formato esperado por los componentes
    return empresas.map(empresa => ({
      id: empresa.id,
      nombre: empresa.label,
      acronimo: empresa.acronimo,
      value: empresa.value
    }));
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