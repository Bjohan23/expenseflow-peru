import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Download, RefreshCw, Eye, Calendar, DollarSign, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { treasuryService } from '@/services/treasury.service';
import { Gasto, GastosFilters, EstadoGasto, GastosStatistics } from '@/types/treasury';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { useAuth } from '@/contexts/AuthContext';

// Constantes para estados
const ESTADOS_GASTO = {
  [EstadoGasto.BORRADOR]: { label: 'Borrador', color: 'bg-gray-100 text-gray-800' },
  [EstadoGasto.PENDIENTE]: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  [EstadoGasto.APROBADO]: { label: 'Aprobado', color: 'bg-green-100 text-green-800' },
  [EstadoGasto.PAGADO]: { label: 'Pagado', color: 'bg-blue-100 text-blue-800' },
  [EstadoGasto.RECHAZADO]: { label: 'Rechazado', color: 'bg-red-100 text-red-800' },
  [EstadoGasto.ANULADO]: { label: 'Anulado', color: 'bg-gray-100 text-gray-600' },
};

export default function Gastos() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Estado local
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<GastosFilters>({
    page: 1,
    page_size: 15,
  });
  const [activeTab, setActiveTab] = useState('todos');

  // Queries
  const {
    data: gastosData,
    isLoading: isLoadingGastos,
    refetch: refetchGastos,
  } = useQuery({
    queryKey: ['gastos', filters],
    queryFn: () => treasuryService.getGastos(filters),
    keepPreviousData: true,
  });

  const {
    data: statisticsData,
    isLoading: isLoadingStatistics,
  } = useQuery({
    queryKey: ['gastos-statistics', filters],
    queryFn: () => treasuryService.getGastosStatistics({
      empresa: filters.empresa,
      sucursal: filters.sucursal,
      fecha_inicio: filters.fecha_inicio,
      fecha_fin: filters.fecha_fin,
    }),
  });

  // Query para categorías (usado en filtros)
  const { data: categoriasData } = useQuery({
    queryKey: ['categorias-gasto-selector'],
    queryFn: () => treasuryService.getCategoriasSelector(),
  });

  // Mutations
  const aprobarMutation = useMutation({
    mutationFn: (gastoId: string) => treasuryService.aprobarGasto(gastoId),
    onSuccess: () => {
      queryClient.invalidateQueries(['gastos']);
      queryClient.invalidateQueries(['gastos-statistics']);
      toast.success('Gasto aprobado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al aprobar gasto');
    },
  });

  const rechazarMutation = useMutation({
    mutationFn: ({ gastoId, motivo }: { gastoId: string; motivo: string }) =>
      treasuryService.rechazarGasto(gastoId, { motivo }),
    onSuccess: () => {
      queryClient.invalidateQueries(['gastos']);
      queryClient.invalidateQueries(['gastos-statistics']);
      setRechazoDialog({ open: false, gastoId: '', motivo: '' });
      toast.success('Gasto rechazado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al rechazar gasto');
    },
  });

  // Estado para diálogo de rechazo
  const [rechazoDialog, setRechazoDialog] = useState({
    open: false,
    gastoId: '',
    motivo: '',
  });

  // Manejar cambios en filtros
  const updateFilters = (newFilters: Partial<GastosFilters>) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 };
    setFilters(updatedFilters);
    setCurrentPage(1);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (value.trim()) {
      updateFilters({ search: value.trim() });
    } else {
      const { search, ...rest } = filters;
      setFilters(rest);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    switch (tab) {
      case 'pendientes':
        updateFilters({ estado: EstadoGasto.PENDIENTE });
        break;
      case 'aprobados':
        updateFilters({ estado: EstadoGasto.APROBADO });
        break;
      case 'pagados':
        updateFilters({ estado: EstadoGasto.PAGADO });
        break;
      default:
        const { estado, ...rest } = filters;
        setFilters({ ...rest, page: currentPage });
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setFilters({ ...filters, page });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({ page: 1, page_size: 15 });
    setCurrentPage(1);
    setActiveTab('todos');
  };

  const handleAprobar = (gastoId: string) => {
    aprobarMutation.mutate(gastoId);
  };

  const handleRechazar = (gastoId: string) => {
    setRechazoDialog({ open: true, gastoId, motivo: '' });
  };

  const confirmarRechazo = () => {
    if (rechazoDialog.motivo.trim()) {
      rechazarMutation.mutate({
        gastoId: rechazoDialog.gastoId,
        motivo: rechazoDialog.motivo,
      });
    }
  };

  const verDetalle = (gastoId: string) => {
    navigate(`/gastos/${gastoId}`);
  };

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (isLoadingGastos) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Gastos</h1>
          <p className="text-muted-foreground mt-2">Registro, control y aprobación de gastos</p>
        </div>
        <LoadingSkeleton type="table" count={5} />
      </div>
    );
  }

  const gastos = gastosData?.data || [];
  const pagination = gastosData?.pagination;
  const statistics = statisticsData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Gastos</h1>
          <p className="text-gray-600 mt-1">
            Registro, control y aprobación de gastos empresariales
          </p>
        </div>
        <Button
          className="bg-purple-600 hover:bg-purple-700"
          onClick={() => navigate('/gastos/nuevo')}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Gasto
        </Button>
      </div>

      {/* Estadísticas */}
      {statistics && !isLoadingStatistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total del Mes</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(statistics.total_mes)}</div>
              <p className="text-xs text-gray-500 mt-1">Acumulado este mes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pendientes</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{statistics.gastos_pendientes}</div>
              <p className="text-xs text-gray-500 mt-1">Por aprobar</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Aprobados</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{statistics.gastos_aprobados}</div>
              <p className="text-xs text-gray-500 mt-1">Esperando pago</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Fondos Pendientes</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{statistics.fondos_pendientes}</div>
              <p className="text-xs text-gray-500 mt-1">Por rendir</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por concepto, descripción, responsable..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select
              value={filters.estado?.toString() || 'todos'}
              onValueChange={(value) => {
                if (value === 'todos') {
                  const { estado, ...rest } = filters;
                  setFilters(rest);
                } else {
                  updateFilters({ estado: parseInt(value) });
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                {Object.entries(ESTADOS_GASTO).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Limpiar
              </Button>
              <Button variant="outline" size="sm" disabled>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>

          {/* Filtros adicionales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <Select
              value={filters.categoria?.toString() || ''}
              onValueChange={(value) => updateFilters({ categoria: parseInt(value) || undefined })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                {categoriasData?.map((categoria) => (
                  <SelectItem key={categoria.id} value={categoria.value}>
                    {categoria.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={filters.fecha_inicio || ''}
              onChange={(e) => updateFilters({ fecha_inicio: e.target.value || undefined })}
              placeholder="Fecha inicio"
            />

            <Input
              type="date"
              value={filters.fecha_fin || ''}
              onChange={(e) => updateFilters({ fecha_fin: e.target.value || undefined })}
              placeholder="Fecha fin"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs y Tabla */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="todos">Todos ({pagination?.count || 0})</TabsTrigger>
          <TabsTrigger value="pendientes">Pendientes</TabsTrigger>
          <TabsTrigger value="aprobados">Aprobados</TabsTrigger>
          <TabsTrigger value="pagados">Pagados</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Listado de Gastos</CardTitle>
                <Button variant="outline" size="sm" onClick={() => refetchGastos()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualizar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {gastos.length === 0 ? (
                <div className="text-center py-8">
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <DollarSign className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">
                      {searchTerm || filters.estado
                        ? 'No se encontraron gastos con los filtros aplicados'
                        : 'No hay gastos registrados'}
                    </h3>
                    <p className="text-muted-foreground mt-2 max-w-md">
                      {searchTerm || filters.estado
                        ? 'Intenta ajustar los filtros o la búsqueda'
                        : 'Comienza registrando tu primer gasto'}
                    </p>
                    {!searchTerm && !filters.estado && (
                      <Button
                        className="mt-4 bg-purple-600 hover:bg-purple-700"
                        onClick={() => navigate('/gastos/nuevo')}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Registrar Primer Gasto
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Concepto</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Responsable</TableHead>
                        <TableHead className="text-right">Importe</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {gastos.map((gasto) => (
                        <TableRow key={gasto.gasto_id} className="hover:bg-gray-50">
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              {formatDate(gasto.fecha_gasto)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{gasto.categoria_nombre}</div>
                              <div className="text-sm text-gray-500">{gasto.tipo_documento_nombre}</div>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {gasto.glosa}
                          </TableCell>
                          <TableCell>{gasto.responsable_nombre}</TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(gasto.importe)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={ESTADOS_GASTO[gasto.estado as EstadoGasto]?.color}
                            >
                              {ESTADOS_GASTO[gasto.estado as EstadoGasto]?.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => verDetalle(gasto.gasto_id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {gasto.estado === EstadoGasto.PENDIENTE && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleAprobar(gasto.gasto_id)}
                                    className="text-green-600 hover:text-green-700"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRechazar(gasto.gasto_id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <AlertTriangle className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Paginación */}
                  {pagination && pagination.total_pages > 1 && (
                    <div className="flex justify-between items-center mt-4">
                      <div className="text-sm text-gray-600">
                        Mostrando {pagination.start_index}-{pagination.end_index} de{' '}
                        {pagination.count} resultados
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={!pagination.has_previous}
                        >
                          Anterior
                        </Button>
                        <span className="px-3 py-1 text-sm">
                          Página {pagination.current_page} de {pagination.total_pages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={!pagination.has_next}
                        >
                          Siguiente
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Diálogo de Rechazo */}
      <Dialog open={rechazoDialog.open} onOpenChange={(open) => setRechazoDialog({ ...rechazoDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechazar Gasto</DialogTitle>
            <DialogDescription>
              Ingresa el motivo por el cual se rechaza este gasto
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium">Motivo del rechazo</label>
            <textarea
              className="w-full mt-1 p-2 border rounded-md"
              rows={3}
              placeholder="Describe el motivo del rechazo..."
              value={rechazoDialog.motivo}
              onChange={(e) => setRechazoDialog({ ...rechazoDialog, motivo: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRechazoDialog({ open: false, gastoId: '', motivo: '' })}
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmarRechazo}
              disabled={!rechazoDialog.motivo.trim() || rechazarMutation.isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {rechazarMutation.isLoading ? 'Rechazando...' : 'Rechazar Gasto'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
