import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Filter, Calendar, User, DollarSign, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { KPICard } from '@/components/common/KPICard';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { treasuryService } from '@/services/treasury.service';
import {
  AsignacionFondo,
  AsignacionesFilters,
  EstadoAsignacionFondo,
  PaginatedResponse,
  ApiResponse
} from '@/types/treasury';
import { formatCurrency, formatDate } from '@/utils/format';

interface AsignacionFormData {
  empresa: string;
  sucursal: string;
  responsable: string;
  tipo_fondo: string;
  monto_asignado: string;
  fecha_vencimiento: string;
  observaciones?: string;
}

export const AsignacionesFondos: React.FC = () => {
  const [filters, setFilters] = useState<AsignacionesFilters>({
    page: 1,
    page_size: 20,
    ordering: '-fecha_asignacion'
  });

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEstado, setSelectedEstado] = useState<string>('all');

  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState<AsignacionFormData>({
    empresa: '',
    sucursal: '',
    responsable: '',
    tipo_fondo: 'caja_chica',
    monto_asignado: '',
    fecha_vencimiento: '',
    observaciones: ''
  });

  // Queries
  const { data: asignaciones, isLoading, error } = useQuery({
    queryKey: ['asignaciones-fondo', filters],
    queryFn: () => treasuryService.getAsignacionesFondo(filters),
  });

  const { data: empresas } = useQuery({
    queryKey: ['empresas'],
    queryFn: () => treasuryService.getEmpresas(),
  });

  const { data: sucursales } = useQuery({
    queryKey: ['sucursales', formData.empresa],
    queryFn: () => treasuryService.getSucursales(formData.empresa),
    enabled: !!formData.empresa,
  });

  const { data: statistics } = useQuery({
    queryKey: ['asignaciones-statistics'],
    queryFn: () => treasuryService.getAsignacionesStatistics(),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: AsignacionFormData) =>
      treasuryService.createAsignacionFondo(data),
    onSuccess: () => {
      toast.success('Asignación de fondo creada exitosamente');
      setShowCreateDialog(false);
      queryClient.invalidateQueries({ queryKey: ['asignaciones-fondo'] });
      queryClient.invalidateQueries({ queryKey: ['asignaciones-statistics'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear asignación de fondo');
    },
  });

  const anularMutation = useMutation({
    mutationFn: (fondoId: string) =>
      treasuryService.anularAsignacionFondo(fondoId),
    onSuccess: () => {
      toast.success('Asignación de fondo anulada exitosamente');
      queryClient.invalidateQueries({ queryKey: ['asignaciones-fondo'] });
      queryClient.invalidateQueries({ queryKey: ['asignaciones-statistics'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al anular asignación de fondo');
    },
  });

  // Handle filters
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setFilters(prev => ({
      ...prev,
      search: value || undefined,
      page: 1
    }));
  };

  const handleEstadoFilter = (estado: string) => {
    setSelectedEstado(estado);
    setFilters(prev => ({
      ...prev,
      estado: estado === 'all' ? undefined : parseInt(estado),
      page: 1
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  // Handle empresa change to reset sucursal
  const handleEmpresaChange = (empresaId: string) => {
    setFormData(prev => ({
      ...prev,
      empresa: empresaId,
      sucursal: '' // Reset sucursal when empresa changes
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  // Loading and error states
  if (isLoading && !asignaciones) return <LoadingSkeleton />;
  if (error) {
    toast.error('Error al cargar las asignaciones de fondo');
    return <div>Error al cargar los datos</div>;
  }

  const asignacionesData = asignaciones as PaginatedResponse<AsignacionFondo>;
  const items = asignacionesData?.data || [];
  const pagination = asignacionesData?.pagination;

  // Calculate statistics for cards
  const totalAsignado = statistics?.total_asignado || '0';
  const totalRendido = statistics?.total_rendido || '0';
  const saldoPendiente = statistics?.saldo_pendiente || '0';
  const fondosPendientes = statistics?.fondos_pendientes || 0;

  const getEstadoVariant = (estado: number) => {
    switch (estado) {
      case EstadoAsignacionFondo.ASIGNADO:
        return 'default';
      case EstadoAsignacionFondo.POR_RENDIR:
        return 'secondary';
      case EstadoAsignacionFondo.RENDIDO:
        return 'success';
      case EstadoAsignacionFondo.ANULADO:
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getEstadoIcon = (estado: number) => {
    switch (estado) {
      case EstadoAsignacionFondo.ASIGNADO:
        return <DollarSign className="h-4 w-4" />;
      case EstadoAsignacionFondo.POR_RENDIR:
        return <Clock className="h-4 w-4" />;
      case EstadoAsignacionFondo.RENDIDO:
        return <CheckCircle className="h-4 w-4" />;
      case EstadoAsignacionFondo.ANULADO:
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Asignaciones de Fondo</h1>
          <p className="text-gray-600 mt-2">Gestiona las asignaciones de fondo a los responsables</p>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Asignación
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Crear Nueva Asignación de Fondo</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Empresa</label>
                <Select
                  value={formData.empresa}
                  onValueChange={handleEmpresaChange}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {empresas?.map((empresa: any) => (
                      <SelectItem key={empresa.id} value={empresa.id}>
                        {empresa.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Sucursal</label>
                <Select
                  value={formData.sucursal}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, sucursal: value }))}
                  required
                  disabled={!formData.empresa}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={formData.empresa ? "Seleccionar sucursal" : "Seleccione primero una empresa"} />
                  </SelectTrigger>
                  <SelectContent>
                    {sucursales?.map((sucursal: any) => (
                      <SelectItem key={sucursal.sucursal_id} value={sucursal.sucursal_id}>
                        {sucursal.nombre_sucursal}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Monto Asignado</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.monto_asignado}
                  onChange={(e) => setFormData(prev => ({ ...prev, monto_asignado: e.target.value }))}
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Fecha de Vencimiento</label>
                <Input
                  type="date"
                  value={formData.fecha_vencimiento}
                  onChange={(e) => setFormData(prev => ({ ...prev, fecha_vencimiento: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Observaciones</label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  value={formData.observaciones}
                  onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
                  placeholder="Observaciones opcionales"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creando...' : 'Crear Asignación'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Asignado"
          value={formatCurrency(totalAsignado)}
          icon={DollarSign}
          variant="primary"
        />
        <KPICard
          title="Total Rendido"
          value={formatCurrency(totalRendido)}
          icon={CheckCircle}
          variant="success"
        />
        <KPICard
          title="Saldo Pendiente"
          value={formatCurrency(saldoPendiente)}
          icon={AlertCircle}
          variant="warning"
        />
        <KPICard
          title="Fondos por Rendir"
          value={fondosPendientes}
          icon={Clock}
          variant="default"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar asignación..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedEstado} onValueChange={handleEstadoFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem key="all" value="all">Todos los estados</SelectItem>
                <SelectItem key="asignado" value={String(EstadoAsignacionFondo.ASIGNADO)}>Asignado</SelectItem>
                <SelectItem key="por-rendir" value={String(EstadoAsignacionFondo.POR_RENDIR)}>Por Rendir</SelectItem>
                <SelectItem key="rendido" value={String(EstadoAsignacionFondo.RENDIDO)}>Rendido</SelectItem>
                <SelectItem key="anulado" value={String(EstadoAsignacionFondo.ANULADO)}>Anulado</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setSelectedEstado('all');
              setFilters({
                page: 1,
                page_size: 20,
                ordering: '-fecha_asignacion'
              });
            }}>
              <Filter className="h-4 w-4 mr-2" />
              Limpiar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>Resultados ({pagination?.count || 0} asignaciones)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingSkeleton />
          ) : items.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No se encontraron asignaciones de fondo</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((asignacion) => (
                <div
                  key={asignacion.fondo_id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">
                          {asignacion.empresa_nombre} - {asignacion.sucursal_nombre}
                        </h3>
                        <Badge variant={getEstadoVariant(asignacion.estado)} className="flex items-center gap-1">
                          {getEstadoIcon(asignacion.estado)}
                          {asignacion.estado_display}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Responsable:</span>
                          <p>{asignacion.responsable_nombre}</p>
                        </div>
                        <div>
                          <span className="font-medium">Tipo Fondo:</span>
                          <p>{asignacion.tipo_fondo_display}</p>
                        </div>
                        <div>
                          <span className="font-medium">Monto Asignado:</span>
                          <p className="font-semibold">{formatCurrency(asignacion.monto_asignado)}</p>
                        </div>
                        <div>
                          <span className="font-medium">Fecha Asignación:</span>
                          <p>{formatDate(asignacion.fecha_asignacion)}</p>
                        </div>
                      </div>

                      {asignacion.monto_rendido && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Monto Rendido:</span>
                              <p className="font-semibold text-green-600">{formatCurrency(asignacion.monto_rendido)}</p>
                            </div>
                            <div>
                              <span className="font-medium">Saldo Pendiente:</span>
                              <p className="font-semibold text-orange-600">{formatCurrency(asignacion.saldo_pendiente || '0')}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {asignacion.observaciones && (
                        <div className="mt-3 pt-3 border-t">
                          <span className="font-medium text-sm">Observaciones:</span>
                          <p className="text-sm text-gray-600">{asignacion.observaciones}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Navigate to fund details
                          window.location.href = `/asignaciones-fondo/${asignacion.fondo_id}`;
                        }}
                      >
                        Ver Detalle
                      </Button>

                      {asignacion.estado !== EstadoAsignacionFondo.ANULADO &&
                       asignacion.estado !== EstadoAsignacionFondo.RENDIDO && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              Anular
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Anular asignación de fondo?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. La asignación de fondo será anulada y no podrá ser utilizada.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => anularMutation.mutate(asignacion.fondo_id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Anular
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {pagination && pagination.total_pages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-6 pt-4 border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.current_page - 1)}
                    disabled={!pagination.has_previous}
                  >
                    Anterior
                  </Button>

                  <span className="text-sm text-gray-600">
                    Página {pagination.current_page} de {pagination.total_pages}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.current_page + 1)}
                    disabled={!pagination.has_next}
                  >
                    Siguiente
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};