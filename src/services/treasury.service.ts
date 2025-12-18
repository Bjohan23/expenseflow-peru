import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  ApiResponse,
  PaginatedResponse,
  CategoriaGasto,
  CategoriaGastoSelector,
  Caja,
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
    return response.data.data;
  }

  private extractPaginatedData<T>(response: AxiosResponse<PaginatedResponse<T>>): {
    data: T[];
    pagination: PaginatedResponse<T>['pagination'];
  } {
    return {
      data: response.data.data,
      pagination: response.data.pagination
    };
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
    const response = await this.api.post<ApiResponse<CategoriaGasto>>('/categorias-gasto/', data);
    return this.extractData(response);
  }

  async updateCategoria(id: string, data: Partial<CategoriaGasto>) {
    const response = await this.api.put<ApiResponse<CategoriaGasto>>(`/categorias-gasto/${id}/`, data);
    return this.extractData(response);
  }

  async deleteCategoria(id: string) {
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
  async getAsignaciones(filters?: AsignacionesFilters) {
    const response = await this.api.get<PaginatedResponse<AsignacionFondo>>('/asignaciones-fondo/', { params: filters });
    return this.extractPaginatedData(response);
  }

  async getAsignacionesPendientes(filters?: AsignacionesFilters) {
    const response = await this.api.get<PaginatedResponse<AsignacionFondo>>('/asignaciones-fondo/pendientes/', { params: filters });
    return this.extractPaginatedData(response);
  }

  async getAsignacionesVencidas(filters?: AsignacionesFilters) {
    const response = await this.api.get<PaginatedResponse<AsignacionFondo>>('/asignaciones-fondo/vencidos/', { params: filters });
    return this.extractPaginatedData(response);
  }

  async createAsignacion(data: Partial<AsignacionFondo>) {
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

  async rendirFondo(fondoId: string, data: {
    gastos: string[]; // Array de gasto_ids
    observaciones?: string;
  }) {
    const response = await this.api.post<ApiResponse<AsignacionFondo>>(`/asignaciones-fondo/${fondoId}/rendir/`, data);
    return this.extractData(response);
  }

  async anularAsignacion(fondoId: string, data: { motivo: string }) {
    const response = await this.api.post<ApiResponse<AsignacionFondo>>(`/asignaciones-fondo/${fondoId}/anular/`, data);
    return this.extractData(response);
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
}

// Crear instancia del servicio
export const treasuryService = new TreasuryService();
export default treasuryService;