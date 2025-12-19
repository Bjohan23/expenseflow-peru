import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  FileText,
  User,
  Building2,
  Search,
  Filter,
  Eye,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KPICard } from '@/components/common/KPICard';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { treasuryService } from '@/services/treasury.service';
import {
  Gasto,
  AsignacionFondo,
  EstadoGasto,
  EstadoAsignacionFondo,
  PaginatedResponse,
  ApiResponse
} from '@/types/treasury';
import { formatCurrency, formatDate } from '@/utils/format';

interface RejectionDialogData {
  isOpen: boolean;
  type: 'gasto' | 'fondo';
  id: string;
  motivo: string;
}

export const Aprobaciones: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('gastos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEstado, setSelectedEstado] = useState<string>('all');
  const [rejectionDialog, setRejectionDialog] = useState<RejectionDialogData>({
    isOpen: false,
    type: 'gasto',
    id: '',
    motivo: ''
  });

  const queryClient = useQueryClient();
  
  // Queries
  const { data: gastosPendientes, isLoading: gastosLoading } = useQuery({
    queryKey: ['gastos-pendientes-aprobacion'],
    queryFn: () => treasuryService.getGastos({
      estado: EstadoGasto.PENDIENTE,
      page: 1,
      page_size: 50,
      ordering: '-created_at'
    }),
  });

  const { data: fondosPendientes, isLoading: fondosLoading } = useQuery({
    queryKey: ['asignaciones-pendientes-aprobacion'],
    queryFn: () => treasuryService.getAsignacionesFondo({
      estado: EstadoAsignacionFondo.ASIGNADO,
      page: 1,
      page_size: 50,
      ordering: '-fecha_asignacion'
    }),
  });

  const { data: statistics } = useQuery({
    queryKey: ['aprobaciones-statistics'],
    queryFn: () => treasuryService.getAprobacionesStatistics(),
  });

  // Mutations
  const approveGastoMutation = useMutation({
    mutationFn: (gastoId: string) =>
      treasuryService.aprobarGasto(gastoId),
    onSuccess: () => {
      toast.success('Gasto aprobado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['gastos-pendientes-aprobacion'] });
      queryClient.invalidateQueries({ queryKey: ['aprobaciones-statistics'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al aprobar gasto');
    },
  });

  const rejectGastoMutation = useMutation({
    mutationFn: ({ id, motivo }: { id: string; motivo: string }) =>
      treasuryService.rechazarGasto(id, { motivo }),
    onSuccess: () => {
      toast.success('Gasto rechazado exitosamente');
      setRejectionDialog({ isOpen: false, type: 'gasto', id: '', motivo: '' });
      queryClient.invalidateQueries({ queryKey: ['gastos-pendientes-aprobacion'] });
      queryClient.invalidateQueries({ queryKey: ['aprobaciones-statistics'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al rechazar gasto');
    },
  });

  const approveFondoMutation = useMutation({
    mutationFn: (fondoId: string) =>
      treasuryService.marcarPorRendir(fondoId),
    onSuccess: () => {
      toast.success('Fondo marcado para rendir exitosamente');
      queryClient.invalidateQueries({ queryKey: ['asignaciones-pendientes-aprobacion'] });
      queryClient.invalidateQueries({ queryKey: ['aprobaciones-statistics'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al procesar fondo');
    },
  });

  // Filter data
  const filteredGastos = gastosPendientes?.data?.filter((gasto: Gasto) =>
    gasto.glosa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    gasto.responsable_nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredFondos = fondosPendientes?.data?.filter((fondo: AsignacionFondo) =>
    fondo.empresa_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fondo.responsable_nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Handlers
  const handleRejection = () => {
    if (!rejectionDialog.motivo.trim()) {
      toast.error('Debe ingresar un motivo para el rechazo');
      return;
    }

    if (rejectionDialog.type === 'gasto') {
      rejectGastoMutation.mutate({
        id: rejectionDialog.id,
        motivo: rejectionDialog.motivo
      });
    }
  };

  const openRejectionDialog = (type: 'gasto' | 'fondo', id: string) => {
    setRejectionDialog({
      isOpen: true,
      type,
      id,
      motivo: ''
    });
  };

  if (gastosLoading && fondosLoading) return <LoadingSkeleton />;

  // Statistics
  const gastosPorAprobar = statistics?.gastos_por_aprobar || 0;
  const fondosPorAprobar = statistics?.fondos_por_aprobar || 0;
  const totalMontoPendiente = statistics?.monto_pendiente_aprobacion || '0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Aprobaciones</h1>
          <p className="text-gray-600 mt-2">Gestiona la aprobación de gastos y asignaciones de fondo</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard
          title="Gastos por Aprobar"
          value={gastosPorAprobar}
          icon={Clock}
          variant="warning"
        />
        <KPICard
          title="Fondos por Aprobar"
          value={fondosPorAprobar}
          icon={DollarSign}
          variant="primary"
        />
        <KPICard
          title="Monto Total Pendiente"
          value={formatCurrency(totalMontoPendiente)}
          icon={AlertCircle}
          variant="destructive"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedEstado('all');
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              Limpiar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="gastos">
            <FileText className="h-4 w-4 mr-2" />
            Gastos ({filteredGastos.length})
          </TabsTrigger>
          <TabsTrigger value="fondos">
            <DollarSign className="h-4 w-4 mr-2" />
            Fondos ({filteredFondos.length})
          </TabsTrigger>
        </TabsList>

        {/* Gastos Tab */}
        <TabsContent value="gastos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gastos Pendientes de Aprobación</CardTitle>
            </CardHeader>
            <CardContent>
              {gastosLoading ? (
                <LoadingSkeleton />
              ) : filteredGastos.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No hay gastos pendientes de aprobación</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredGastos.map((gasto: Gasto) => (
                    <div
                      key={gasto.gasto_id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{gasto.glosa}</h3>
                            <Badge variant="secondary">
                              <Clock className="h-3 w-3 mr-1" />
                              Pendiente
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div key="empresa">
                              <span className="font-medium">Empresa:</span>
                              <p>{gasto.empresa_nombre}</p>
                            </div>
                            <div key="sucursal">
                              <span className="font-medium">Sucursal:</span>
                              <p>{gasto.sucursal_nombre}</p>
                            </div>
                            <div key="responsable">
                              <span className="font-medium">Responsable:</span>
                              <p>{gasto.responsable_nombre}</p>
                            </div>
                            <div key="importe">
                              <span className="font-medium">Importe:</span>
                              <p className="font-semibold text-lg">{formatCurrency(gasto.importe)}</p>
                            </div>
                            <div key="fecha-gasto">
                              <span className="font-medium">Fecha Gasto:</span>
                              <p>{formatDate(gasto.fecha_gasto)}</p>
                            </div>
                            <div key="documento">
                              <span className="font-medium">Documento:</span>
                              <p>{gasto.tipo_documento_nombre} - {gasto.nro_documento}</p>
                            </div>
                            <div key="categoria">
                              <span className="font-medium">Categoría:</span>
                              <p>{gasto.categoria_nombre}</p>
                            </div>
                            <div key="items">
                              <span className="font-medium">Items:</span>
                              <p>{gasto.items_count || 0}</p>
                            </div>
                          </div>

                          {gasto.evidencias_count && gasto.evidencias_count > 0 && (
                            <div className="mt-3 pt-3 border-t">
                              <Badge variant="outline" className="text-xs">
                                📎 {gasto.evidencias_count} evidencia(s)
                              </Badge>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/gastos/${gasto.gasto_id}`)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalle
                          </Button>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => approveGastoMutation.mutate(gasto.gasto_id)}
                              disabled={approveGastoMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Aprobar
                            </Button>

                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => openRejectionDialog('gasto', gasto.gasto_id)}
                              disabled={rejectGastoMutation.isPending}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Rechazar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fondos Tab */}
        <TabsContent value="fondos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Asignaciones de Fondo Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              {fondosLoading ? (
                <LoadingSkeleton />
              ) : filteredFondos.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No hay asignaciones de fondo pendientes</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredFondos.map((fondo: AsignacionFondo) => (
                    <div
                      key={fondo.fondo_id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">
                              {fondo.empresa_nombre} - {fondo.sucursal_nombre}
                            </h3>
                            <Badge variant="secondary">
                              <Clock className="h-3 w-3 mr-1" />
                              Asignado
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div key="responsable">
                              <span className="font-medium">Responsable:</span>
                              <p>{fondo.responsable_nombre}</p>
                            </div>
                            <div key="tipo-fondo">
                              <span className="font-medium">Tipo Fondo:</span>
                              <p>{fondo.tipo_fondo_display}</p>
                            </div>
                            <div key="monto-asignado">
                              <span className="font-medium">Monto Asignado:</span>
                              <p className="font-semibold text-lg">{formatCurrency(fondo.monto_asignado)}</p>
                            </div>
                            <div key="fecha-asignacion">
                              <span className="font-medium">Fecha Asignación:</span>
                              <p>{formatDate(fondo.fecha_asignacion)}</p>
                            </div>
                            {fondo.fecha_vencimiento && (
                              <div key="fecha-vencimiento">
                                <span className="font-medium">Fecha Vencimiento:</span>
                                <p>{formatDate(fondo.fecha_vencimiento)}</p>
                              </div>
                            )}
                          </div>

                          {fondo.observaciones && (
                            <div className="mt-3 pt-3 border-t">
                              <span className="font-medium text-sm">Observaciones:</span>
                              <p className="text-sm text-gray-600">{fondo.observaciones}</p>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/asignaciones-fondo/${fondo.fondo_id}`)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalle
                          </Button>

                          <Button
                            size="sm"
                            onClick={() => approveFondoMutation.mutate(fondo.fondo_id)}
                            disabled={approveFondoMutation.isPending}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Marcar por Rendir
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Rejection Dialog */}
      <Dialog open={rejectionDialog.isOpen} onOpenChange={(open) => setRejectionDialog(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechazar {rejectionDialog.type === 'gasto' ? 'Gasto' : 'Fondo'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="motivo">Motivo del rechazo</Label>
              <Textarea
                id="motivo"
                placeholder="Ingrese el motivo del rechazo..."
                value={rejectionDialog.motivo}
                onChange={(e) => setRejectionDialog(prev => ({ ...prev, motivo: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setRejectionDialog({ isOpen: false, type: 'gasto', id: '', motivo: '' })}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleRejection}
                disabled={rejectGastoMutation.isPending}
              >
                {rejectGastoMutation.isPending ? 'Rechazando...' : 'Confirmar Rechazo'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};