import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  FileText,
  Plus,
  Search,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  Upload,
  Eye
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KPICard } from '@/components/common/KPICard';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { treasuryService } from '@/services/treasury.service';
import {
  AsignacionFondo,
  Gasto,
  EstadoAsignacionFondo,
  EstadoGasto,
  ApiResponse
} from '@/types/treasury';
import { formatCurrency, formatDate } from '@/utils/format';

interface RendicionFormData {
  gastos_ids: string[];
  comprobante_url?: string;
  observaciones?: string;
}

export const AsignacionDetalle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showRendirDialog, setShowRendirDialog] = useState(false);
  const [selectedGastos, setSelectedGastos] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const queryClient = useQueryClient();
  
  // Queries
  const { data: asignacion, isLoading, error } = useQuery({
    queryKey: ['asignacion-fondo', id],
    queryFn: () => treasuryService.getAsignacionFondo(id!),
    enabled: !!id,
  });

  const { data: gastosData, isLoading: gastosLoading } = useQuery({
    queryKey: ['gastos-asignacion', id],
    queryFn: () => treasuryService.getGastosByAsignacionFondo(id!),
    enabled: !!id,
  });

  // Mutations
  const rendirMutation = useMutation({
    mutationFn: (data: RendicionFormData) =>
      treasuryService.rendirAsignacionFondo(id!, data),
    onSuccess: () => {
      toast.success('Rendición realizada exitosamente');
      setShowRendirDialog(false);
      setSelectedGastos([]);
      queryClient.invalidateQueries({ queryKey: ['asignacion-fondo', id] });
      queryClient.invalidateQueries({ queryKey: ['gastos-asignacion', id] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al realizar rendición');
    },
  });

  const anularMutation = useMutation({
    mutationFn: () => treasuryService.anularAsignacionFondo(id!),
    onSuccess: () => {
      toast.success('Asignación de fondo anulada exitosamente');
      navigate('/asignaciones-fondo');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al anular asignación de fondo');
    },
  });

  const handleGastoSelection = (gastoId: string) => {
    setSelectedGastos(prev =>
      prev.includes(gastoId)
        ? prev.filter(id => id !== gastoId)
        : [...prev, gastoId]
    );
  };

  const handleRendir = () => {
    if (selectedGastos.length === 0) {
      toast.error('Debe seleccionar al menos un gasto para rendir');
      return;
    }

    rendirMutation.mutate({
      gastos_ids: selectedGastos,
      observaciones: ''
    });
  };

  const filteredGastos = gastosData?.filter((gasto: Gasto) =>
    gasto.glosa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    gasto.tipo_documento_nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const totalSeleccionado = filteredGastos
    .filter(gasto => selectedGastos.includes(gasto.gasto_id))
    .reduce((sum, gasto) => sum + parseFloat(gasto.importe), 0);

  if (isLoading && !asignacion) return <LoadingSkeleton />;
  if (error || !asignacion) {
    toast.error('Error al cargar la asignación de fondo');
    return <div>Error al cargar los datos</div>;
  }

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

  const getGastoEstadoVariant = (estado: number) => {
    switch (estado) {
      case EstadoGasto.BORRADOR:
        return 'outline';
      case EstadoGasto.PENDIENTE:
        return 'secondary';
      case EstadoGasto.APROBADO:
        return 'default';
      case EstadoGasto.PAGADO:
        return 'success';
      case EstadoGasto.RECHAZADO:
        return 'destructive';
      case EstadoGasto.ANULADO:
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate('/asignaciones-fondo')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Detalle de Asignación
            </h1>
            <p className="text-gray-600">
              {asignacion.empresa_nombre} - {asignacion.sucursal_nombre}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Badge variant={getEstadoVariant(asignacion.estado)} className="text-sm">
            {asignacion.estado_display}
          </Badge>

          {asignacion.estado === EstadoAsignacionFondo.ASIGNADO && (
            <Dialog open={showRendirDialog} onOpenChange={setShowRendirDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Rendir Fondo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Rendir Fondo - Seleccionar Gastos</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar gastos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Gastos Selection */}
                  {gastosLoading ? (
                    <LoadingSkeleton />
                  ) : filteredGastos.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No hay gastos disponibles para rendir</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {filteredGastos.map((gasto: Gasto) => (
                        <div
                          key={gasto.gasto_id}
                          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                            selectedGastos.includes(gasto.gasto_id)
                              ? 'border-blue-500 bg-blue-50'
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => handleGastoSelection(gasto.gasto_id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              <input
                                type="checkbox"
                                checked={selectedGastos.includes(gasto.gasto_id)}
                                onChange={() => handleGastoSelection(gasto.gasto_id)}
                                className="mt-1"
                              />
                              <div>
                                <h4 className="font-medium">{gasto.glosa}</h4>
                                <p className="text-sm text-gray-600">
                                  {gasto.tipo_documento_nombre} - {gasto.nro_documento}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {formatDate(gasto.fecha_gasto)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{formatCurrency(gasto.importe)}</p>
                              <Badge variant={getGastoEstadoVariant(gasto.estado)} className="text-xs mt-1">
                                {gasto.estado_display}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Summary */}
                  {selectedGastos.length > 0 && (
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">
                          Total Seleccionado ({selectedGastos.length} gastos):
                        </span>
                        <span className="font-bold text-lg">
                          {formatCurrency(totalSeleccionado.toString())}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end space-x-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowRendirDialog(false);
                        setSelectedGastos([]);
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleRendir}
                      disabled={selectedGastos.length === 0 || rendirMutation.isPending}
                    >
                      {rendirMutation.isPending ? 'Rendiendo...' : 'Confirmar Rendición'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {asignacion.estado !== EstadoAsignacionFondo.ANULADO &&
           asignacion.estado !== EstadoAsignacionFondo.RENDIDO && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <XCircle className="h-4 w-4 mr-2" />
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
                    onClick={() => anularMutation.mutate()}
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

      {/* Fund Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Monto Asignado"
          value={formatCurrency(asignacion.monto_asignado)}
          icon={DollarSign}
          variant="primary"
        />
        <KPICard
          title="Monto Rendido"
          value={formatCurrency(asignacion.monto_rendido || '0')}
          icon={CheckCircle}
          variant="success"
        />
        <KPICard
          title="Saldo Pendiente"
          value={formatCurrency(asignacion.saldo_pendiente || '0')}
          icon={AlertCircle}
          variant="warning"
        />
        <KPICard
          title="Tipo de Fondo"
          value={asignacion.tipo_fondo_display}
          icon={FileText}
          variant="default"
        />
      </div>

      {/* Detailed Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Información General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium">Empresa:</span>
                <p className="text-gray-600">{asignacion.empresa_nombre}</p>
              </div>
              <div>
                <span className="font-medium">Sucursal:</span>
                <p className="text-gray-600">{asignacion.sucursal_nombre}</p>
              </div>
              <div>
                <span className="font-medium">Responsable:</span>
                <p className="text-gray-600">{asignacion.responsable_nombre}</p>
              </div>
              <div>
                <span className="font-medium">Tipo Fondo:</span>
                <p className="text-gray-600">{asignacion.tipo_fondo_display}</p>
              </div>
              <div>
                <span className="font-medium">Fecha Asignación:</span>
                <p className="text-gray-600">{formatDate(asignacion.fecha_asignacion)}</p>
              </div>
              {asignacion.fecha_vencimiento && (
                <div>
                  <span className="font-medium">Fecha Vencimiento:</span>
                  <p className="text-gray-600">{formatDate(asignacion.fecha_vencimiento)}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumen Financiero</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Monto Asignado:</span>
                <span className="font-bold">{formatCurrency(asignacion.monto_asignado)}</span>
              </div>
              {asignacion.monto_rendido && (
                <div className="flex justify-between">
                  <span className="font-medium">Monto Rendido:</span>
                  <span className="font-bold text-green-600">{formatCurrency(asignacion.monto_rendido)}</span>
                </div>
              )}
              {asignacion.saldo_pendiente && (
                <div className="flex justify-between">
                  <span className="font-medium">Saldo Pendiente:</span>
                  <span className="font-bold text-orange-600">{formatCurrency(asignacion.saldo_pendiente)}</span>
                </div>
              )}
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="font-medium">% Rendido:</span>
                  <span className="font-bold">
                    {asignacion.monto_rendido
                      ? `${((parseFloat(asignacion.monto_rendido) / parseFloat(asignacion.monto_asignado)) * 100).toFixed(1)}%`
                      : '0%'
                    }
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {asignacion.observaciones && (
        <Card>
          <CardHeader>
            <CardTitle>Observaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">{asignacion.observaciones}</p>
          </CardContent>
        </Card>
      )}

      {/* Associated Expenses */}
      <Card>
        <CardHeader>
          <CardTitle>Gastos Asociados</CardTitle>
        </CardHeader>
        <CardContent>
          {gastosLoading ? (
            <LoadingSkeleton />
          ) : filteredGastos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No hay gastos asociados a esta asignación</p>
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
                        <h3 className="font-semibold">{gasto.glosa}</h3>
                        <Badge variant={getGastoEstadoVariant(gasto.estado)}>
                          {gasto.estado_display}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Documento:</span>
                          <p>{gasto.tipo_documento_nombre} - {gasto.nro_documento}</p>
                        </div>
                        <div>
                          <span className="font-medium">Fecha:</span>
                          <p>{formatDate(gasto.fecha_gasto)}</p>
                        </div>
                        <div>
                          <span className="font-medium">Importe:</span>
                          <p className="font-semibold">{formatCurrency(gasto.importe)}</p>
                        </div>
                        <div>
                          <span className="font-medium">Responsable:</span>
                          <p>{gasto.responsable_nombre}</p>
                        </div>
                      </div>

                      {gasto.evidencias_count > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <Badge variant="outline" className="text-xs">
                            📎 {gasto.evidencias_count} evidencia(s)
                          </Badge>
                        </div>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/gastos/${gasto.gasto_id}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};