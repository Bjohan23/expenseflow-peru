import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ArrowLeft,
  Eye,
  Download,
  Trash2,
  Upload,
  FileText,
  DollarSign,
  Calendar,
  User,
  Building,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  CreditCard,
  Ban,
} from 'lucide-react';
import { treasuryService } from '@/services/treasury.service';
import { Gasto, Evidencia, EstadoGasto, PagadoPor } from '@/types/treasury';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { useAuth } from '@/contexts/AuthContext';

// Estado configuration
const ESTADO_CONFIG = {
  [EstadoGasto.BORRADOR]: { label: 'Borrador', color: 'bg-gray-100 text-gray-800' },
  [EstadoGasto.PENDIENTE]: { label: 'Pendiente de Aprobación', color: 'bg-yellow-100 text-yellow-800' },
  [EstadoGasto.APROBADO]: { label: 'Aprobado', color: 'bg-green-100 text-green-800' },
  [EstadoGasto.PAGADO]: { label: 'Pagado', color: 'bg-blue-100 text-blue-800' },
  [EstadoGasto.RECHAZADO]: { label: 'Rechazado', color: 'bg-red-100 text-red-800' },
  [EstadoGasto.ANULADO]: { label: 'Anulado', color: 'bg-gray-100 text-gray-600' },
};

export default function GastoDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Dialog states
  const [approveDialog, setApproveDialog] = useState(false);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [annulDialog, setAnnulDialog] = useState(false);
  const [approveObservations, setApproveObservations] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [annulReason, setAnnulReason] = useState('');

  // Queries
  const { data: gasto, isLoading, error } = useQuery({
    queryKey: ['gasto', id],
    queryFn: () => treasuryService.getGastoById(id!),
    enabled: !!id,
  });

  const { data: evidenciasData, isLoading: evidenciasLoading } = useQuery({
    queryKey: ['evidencias', id],
    queryFn: () => treasuryService.getEvidencias(id!),
    enabled: !!id,
  });

  // Mutations
  const approveMutation = useMutation({
    mutationFn: (data?: { observaciones?: string }) =>
      treasuryService.aprobarGasto(id!, data),
    onSuccess: () => {
      toast.success('Gasto aprobado exitosamente');
      queryClient.invalidateQueries(['gasto', id]);
      queryClient.invalidateQueries(['gastos']);
      setApproveDialog(false);
      setApproveObservations('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al aprobar gasto');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (data: { motivo: string }) =>
      treasuryService.rechazarGasto(id!, data),
    onSuccess: () => {
      toast.success('Gasto rechazado exitosamente');
      queryClient.invalidateQueries(['gasto', id]);
      queryClient.invalidateQueries(['gastos']);
      setRejectDialog(false);
      setRejectReason('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al rechazar gasto');
    },
  });

  const annulMutation = useMutation({
    mutationFn: (data: { motivo: string }) =>
      treasuryService.anularGasto(id!, data),
    onSuccess: () => {
      toast.success('Gasto anulado exitosamente');
      queryClient.invalidateQueries(['gasto', id]);
      queryClient.invalidateQueries(['gastos']);
      setAnnulDialog(false);
      setAnnulReason('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al anular gasto');
    },
  });

  const deleteEvidenciaMutation = useMutation({
    mutationFn: (evidenciaId: number) =>
      treasuryService.deleteEvidencia(id!, evidenciaId),
    onSuccess: () => {
      toast.success('Evidencia eliminada exitosamente');
      queryClient.invalidateQueries(['evidencias', id]);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al eliminar evidencia');
    },
  });

  const handleApprove = () => {
    approveMutation.mutate(approveObservations ? { observaciones: approveObservations } : undefined);
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      toast.error('Debe especificar el motivo del rechazo');
      return;
    }
    rejectMutation.mutate({ motivo: rejectReason });
  };

  const handleAnnul = () => {
    if (!annulReason.trim()) {
      toast.error('Debe especificar el motivo de anulación');
      return;
    }
    annulMutation.mutate({ motivo: annulReason });
  };

  const handleDeleteEvidencia = (evidenciaId: number) => {
    if (confirm('¿Está seguro de eliminar esta evidencia?')) {
      deleteEvidenciaMutation.mutate(evidenciaId);
    }
  };

  const downloadEvidencia = (evidencia: Evidencia) => {
    window.open(evidencia.archivo_url, '_blank');
  };

  const formatCurrency = (amount: string, currency: string) => {
    const num = parseFloat(amount);
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: currency === 'USD' ? 'USD' : currency === 'EUR' ? 'EUR' : 'PEN',
      minimumFractionDigits: 2,
    }).format(num);
  };

  const getFormaPagoLabel = (formaPago: string) => {
    const labels: { [key: string]: string } = {
      'EFECTIVO': 'Efectivo',
      'TARJETA_CREDITO': 'Tarjeta de Crédito',
      'TARJETA_DEBITO': 'Tarjeta de Débito',
      'TRANSFERENCIA': 'Transferencia Bancaria',
      'YAPE': 'Yape',
      'PLIN': 'Plin',
      'OTRO': 'Otro',
    };
    return labels[formaPago] || formaPago;
  };

  const getMonedaSymbol = (moneda: string) => {
    const symbols: { [key: string]: string } = {
      'PEN': 'S/',
      'USD': '$',
      'EUR': '€',
    };
    return symbols[moneda] || moneda;
  };

  // Check if user can approve based on permissions
  const canApprove = gasto?.estado === EstadoGasto.PENDIENTE &&
    user?.role && ['aprobador', 'responsable', 'admin'].includes(user.role);

  const canEdit = gasto?.estado === EstadoGasto.BORRADOR &&
    (gasto.usuario_id === user?.id || ['responsable', 'admin'].includes(user?.role || ''));

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton type="form" count={3} />
      </div>
    );
  }

  if (error || !gasto) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/gastos')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Gastos
        </Button>
        <Alert variant="destructive">
          <AlertDescription>
            No se pudo cargar el gasto. Puede que no exista o no tengas permisos para verlo.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const estadoConfig = ESTADO_CONFIG[gasto.estado as EstadoGasto];
  const evidencias = evidenciasData?.evidencias || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/gastos')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Gastos
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gasto #{gasto.codigo || gasto.gasto_id.slice(-8)}
            </h1>
            <p className="text-gray-600">Detalle completo del gasto</p>
          </div>
        </div>
        <Badge variant="outline" className={estadoConfig.color}>
          {estadoConfig.label}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información del gasto */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Información del Gasto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Fecha del Gasto</p>
                  <p className="font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(gasto.fecha_gasto), 'dd \'de\' MMMM \'de\' yyyy', { locale: es })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Categoría</p>
                  <p className="font-semibold">{gasto.categoria_gasto_nombre}</p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-gray-500">Descripción</p>
                <p className="text-gray-900 mt-1">{gasto.descripcion}</p>
              </div>

              {gasto.observaciones && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-gray-500">Observaciones</p>
                    <p className="text-gray-900 mt-1">{gasto.observaciones}</p>
                  </div>
                </>
              )}

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Monto</p>
                  <p className="text-2xl font-bold text-green-600">
                    {getMonedaSymbol(gasto.moneda)} {parseFloat(gasto.monto).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">{gasto.moneda}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Forma de Pago</p>
                  <p className="font-semibold flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    {getFormaPagoLabel(gasto.forma_pago)}
                  </p>
                </div>
              </div>

              {gasto.responsable_pago && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-gray-500">Responsable del Pago</p>
                    <p className="font-semibold flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {gasto.responsable_pago}
                    </p>
                  </div>
                </>
              )}

              {gasto.numero_operacion && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-gray-500">Número de Operación</p>
                    <p className="font-mono font-semibold">{gasto.numero_operacion}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Información de caja y empresa */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Información Operativa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Empresa</p>
                  <p className="font-semibold">{gasto.empresa_nombre}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Sucursal</p>
                  <p className="font-semibold">{gasto.sucursal_nombre || 'No asignada'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Caja</p>
                  <p className="font-semibold">{gasto.caja_nombre}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Centro de Costo</p>
                  <p className="font-semibold">{gasto.centro_costo_nombre || 'No asignado'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Evidencias */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Evidencias del Gasto
              </CardTitle>
            </CardHeader>
            <CardContent>
              {evidenciasLoading ? (
                <LoadingSkeleton type="table" count={2} />
              ) : evidencias.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No hay evidencias adjuntas</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {evidencias.map((evidencia) => (
                    <div
                      key={evidencia.evidencia_id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium">{evidencia.nombre_archivo}</p>
                          <p className="text-sm text-gray-500">
                            Subido el {format(new Date(evidencia.fecha_subida), 'dd/MM/yyyy HH:mm', { locale: es })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadEvidencia(evidencia)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadEvidencia(evidencia)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        {(canEdit || user?.role === 'admin') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteEvidencia(evidencia.evidencia_id)}
                            disabled={deleteEvidenciaMutation.isLoading}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Acciones */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {canEdit && (
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => navigate(`/gastos/${id}/edit`)}
                >
                  Editar Gasto
                </Button>
              )}

              {canApprove && (
                <>
                  <Button
                    className="w-full"
                    onClick={() => setApproveDialog(true)}
                    disabled={approveMutation.isLoading}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Aprobar Gasto
                  </Button>
                  <Button
                    className="w-full"
                    variant="destructive"
                    onClick={() => setRejectDialog(true)}
                    disabled={rejectMutation.isLoading}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Rechazar Gasto
                  </Button>
                </>
              )}

              {[EstadoGasto.BORRADOR, EstadoGasto.PENDIENTE, EstadoGasto.APROBADO].includes(gasto.estado as EstadoGasto) && (
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => setAnnulDialog(true)}
                  disabled={annulMutation.isLoading}
                >
                  <Ban className="h-4 w-4 mr-2" />
                  Anular Gasto
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Información del usuario */}
          <Card>
            <CardHeader>
              <CardTitle>Información del Registro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Creado por</p>
                <p className="font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {gasto.usuario_nombre || gasto.usuario_email}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Fecha de Creación</p>
                <p className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {format(new Date(gasto.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                </p>
              </div>
              {gasto.updated_at && gasto.updated_at !== gasto.created_at && (
                <div>
                  <p className="text-sm text-gray-500">Última Actualización</p>
                  <p className="text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {format(new Date(gasto.updated_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Alertas */}
          {gasto.estado === EstadoGasto.RECHAZADO && gasto.motivo_rechazo && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Motivo del rechazo:</strong> {gasto.motivo_rechazo}
              </AlertDescription>
            </Alert>
          )}

          {gasto.estado === EstadoGasto.ANULADO && gasto.motivo_anulacion && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Motivo de anulación:</strong> {gasto.motivo_anulacion}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={approveDialog} onOpenChange={setApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aprobar Gasto</DialogTitle>
            <DialogDescription>
              ¿Está seguro de aprobar este gasto por {getMonedaSymbol(gasto.moneda)} {parseFloat(gasto.monto).toFixed(2)}?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="approve-obs">Observaciones (opcional)</Label>
              <Textarea
                id="approve-obs"
                value={approveObservations}
                onChange={(e) => setApproveObservations(e.target.value)}
                placeholder="Agregar comentarios sobre la aprobación..."
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setApproveDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleApprove} disabled={approveMutation.isLoading}>
                {approveMutation.isLoading ? 'Aprobando...' : 'Aprobar Gasto'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectDialog} onOpenChange={setRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechazar Gasto</DialogTitle>
            <DialogDescription>
              Especifique el motivo por el cual rechaza este gasto.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reject-reason">Motivo del rechazo *</Label>
              <Textarea
                id="reject-reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Especifique el motivo del rechazo..."
                rows={4}
                required
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectDialog(false)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={rejectMutation.isLoading || !rejectReason.trim()}
              >
                {rejectMutation.isLoading ? 'Rechazando...' : 'Rechazar Gasto'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={annulDialog} onOpenChange={setAnnulDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Anular Gasto</DialogTitle>
            <DialogDescription>
              Especifique el motivo por el cual anula este gasto.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="annul-reason">Motivo de anulación *</Label>
              <Textarea
                id="annul-reason"
                value={annulReason}
                onChange={(e) => setAnnulReason(e.target.value)}
                placeholder="Especifique el motivo de la anulación..."
                rows={4}
                required
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAnnulDialog(false)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleAnnul}
                disabled={annulMutation.isLoading || !annulReason.trim()}
              >
                {annulMutation.isLoading ? 'Anulando...' : 'Anular Gasto'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}