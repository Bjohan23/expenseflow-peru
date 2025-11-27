/**
 * Página de detalle de un gasto
 * Muestra información completa, historial y permite aprobar/rechazar
 */

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Ban,
  CheckCircle2,
  XCircle,
  DollarSign,
  FileText,
  Clock,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { GastoForm } from "@/components/forms/GastoForm";
import {
  useGasto,
  useHistorialGasto,
  useEnviarGasto,
  useAprobarGasto,
  useRechazarGasto,
  useAnularGasto,
  useActualizarGasto,
} from "@/hooks/useGastos";
import { ESTADOS_GASTO, formatearMonto } from "@/types/gastos";
import type { EstadoGasto, FormularioGasto, Moneda } from "@/types/gastos";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function GastoDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Estado de diálogos
  const [modalEditar, setModalEditar] = useState(false);
  const [modalAprobar, setModalAprobar] = useState(false);
  const [modalRechazar, setModalRechazar] = useState(false);
  const [modalAnular, setModalAnular] = useState(false);
  const [dialogEnviar, setDialogEnviar] = useState(false);

  const [observaciones, setObservaciones] = useState("");
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [motivoAnular, setMotivoAnular] = useState("");

  // Queries y mutations
  const { data: gasto, isLoading, error } = useGasto(id!);
  const { data: historial = [] } = useHistorialGasto(id!);

  const enviarGasto = useEnviarGasto();
  const aprobarGasto = useAprobarGasto();
  const rechazarGasto = useRechazarGasto();
  const anularGasto = useAnularGasto();
  const actualizarGasto = useActualizarGasto();

  // Handlers
  const handleEnviar = async () => {
    await enviarGasto.mutateAsync(id!);
    setDialogEnviar(false);
  };

  const handleAprobar = async () => {
    await aprobarGasto.mutateAsync({
      gasto_id: id!,
      observaciones: observaciones || undefined,
    });
    setModalAprobar(false);
    setObservaciones("");
  };

  const handleRechazar = async () => {
    if (!motivoRechazo.trim()) return;

    await rechazarGasto.mutateAsync({
      gasto_id: id!,
      motivo_rechazo: motivoRechazo,
    });
    setModalRechazar(false);
    setMotivoRechazo("");
  };

  const handleAnular = async () => {
    if (!motivoAnular.trim()) return;

    await anularGasto.mutateAsync({
      id: id!,
      motivo: motivoAnular,
    });
    setModalAnular(false);
    setMotivoAnular("");
  };

  const handleEditar = async (datos: FormularioGasto) => {
    await actualizarGasto.mutateAsync({
      id: id!,
      datos,
    });
    setModalEditar(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !gasto) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate("/gastos")}>
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

  const estadoConfig = ESTADOS_GASTO[gasto.estado as EstadoGasto];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/gastos")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Gasto {gasto.codigo}</h1>
            <p className="text-gray-500">Detalle completo del gasto</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={estadoConfig.color}>
            {estadoConfig.label}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información básica */}
          <Card>
            <CardHeader>
              <CardTitle>Información del Gasto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Código</p>
                  <p className="font-mono font-semibold">{gasto.codigo}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fecha</p>
                  <p className="font-semibold">
                    {format(new Date(gasto.fecha_gasto), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-gray-500">Concepto</p>
                <p className="font-semibold">{gasto.concepto_nombre}</p>
                {gasto.concepto_categoria && (
                  <p className="text-sm text-gray-500">{gasto.concepto_categoria}</p>
                )}
              </div>

              <div>
                <p className="text-sm text-gray-500">Descripción</p>
                <p className="text-gray-900">{gasto.descripcion}</p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Monto</p>
                  <p className="text-2xl font-bold">
                    {formatearMonto(gasto.monto, gasto.moneda as Moneda)}
                  </p>
                  {Boolean(gasto.tipo_cambio && gasto.moneda !== "PEN") && (
                    <p className="text-sm text-gray-500">
                      T.C: {gasto.tipo_cambio} ≈{" "}
                      {formatearMonto((gasto.monto || 0) * (gasto.tipo_cambio || 0), "PEN")}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Estado</p>
                  <Badge variant="outline" className={`${estadoConfig.color} text-base`}>
                    {estadoConfig.label}
                  </Badge>
                </div>
              </div>

              {gasto.excede_limite && (
                <Alert variant="destructive">
                  <AlertDescription>
                    Este gasto excede el límite máximo del concepto (
                    {formatearMonto(gasto.concepto_limite || 0, "PEN")})
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Beneficiario */}
          {gasto.beneficiario_nombre && (
            <Card>
              <CardHeader>
                <CardTitle>Beneficiario</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {gasto.beneficiario_tipo && (
                    <div>
                      <p className="text-sm text-gray-500">Tipo</p>
                      <p className="font-semibold capitalize">{gasto.beneficiario_tipo}</p>
                    </div>
                  )}
                  {gasto.beneficiario_documento && (
                    <div>
                      <p className="text-sm text-gray-500">Documento</p>
                      <p className="font-mono font-semibold">{gasto.beneficiario_documento}</p>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Nombre/Razón Social</p>
                  <p className="font-semibold">{gasto.beneficiario_nombre}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Asignaciones */}
          <Card>
            <CardHeader>
              <CardTitle>Asignaciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Centro de Costo</p>
                  <p className="font-semibold">{gasto.centro_costo_nombre || "No asignado"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Caja</p>
                  <p className="font-semibold">{gasto.caja_nombre || "No asignado"}</p>
                </div>
              </div>
              {gasto.observaciones && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-gray-500">Observaciones</p>
                    <p className="text-gray-900">{gasto.observaciones}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Historial */}
          {historial.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Historial de Cambios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {historial.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <Clock className="h-5 w-5 text-purple-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold capitalize">{item.accion}</p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(item.created_at), "dd/MM/yyyy HH:mm", { locale: es })}
                          </p>
                        </div>
                        {item.estado_anterior && item.estado_nuevo && (
                          <p className="text-sm text-gray-600">
                            {ESTADOS_GASTO[item.estado_anterior as EstadoGasto]?.label} →{" "}
                            {ESTADOS_GASTO[item.estado_nuevo as EstadoGasto]?.label}
                          </p>
                        )}
                        {item.comentario && (
                          <p className="text-sm text-gray-600 mt-1">{item.comentario}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Columna lateral */}
        <div className="space-y-6">
          {/* Acciones */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {gasto.estado === "borrador" && (
                <>
                  <Button className="w-full" variant="default" onClick={() => setModalEditar(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Gasto
                  </Button>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => setDialogEnviar(true)}
                  >
                    Enviar para Aprobación
                  </Button>
                </>
              )}

              {gasto.estado === "pendiente" && (
                <>
                  <Button
                    className="w-full"
                    variant="default"
                    onClick={() => setModalAprobar(true)}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Aprobar Gasto
                  </Button>
                  <Button
                    className="w-full"
                    variant="destructive"
                    onClick={() => setModalRechazar(true)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Rechazar Gasto
                  </Button>
                </>
              )}

              {gasto.estado === "aprobado" && (
                <Button className="w-full" variant="default">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Registrar Pago
                </Button>
              )}

              {["borrador", "pendiente", "aprobado"].includes(gasto.estado) && (
                <Button className="w-full" variant="outline" onClick={() => setModalAnular(true)}>
                  <Ban className="h-4 w-4 mr-2" />
                  Anular Gasto
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Documento vinculado */}
          {gasto.documento_id && (
            <Card>
              <CardHeader>
                <CardTitle>Documento Vinculado</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="font-semibold">{gasto.documento_tipo}</p>
                    <p className="text-sm text-gray-500">{gasto.documento_numero}</p>
                  </div>
                </div>
                <Button className="w-full" variant="outline" size="sm">
                  Ver Documento
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Usuario */}
          <Card>
            <CardHeader>
              <CardTitle>Información del Registro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Creado por</p>
                <div className="flex items-center gap-2 mt-1">
                  <User className="h-4 w-4 text-gray-400" />
                  <p className="font-semibold">{gasto.usuario_email}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Fecha de creación</p>
                <p className="text-sm">
                  {format(new Date(gasto.created_at), "dd/MM/yyyy HH:mm", { locale: es })}
                </p>
              </div>
              {gasto.aprobado_por_email && (
                <div>
                  <p className="text-sm text-gray-500">Aprobado por</p>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="h-4 w-4 text-gray-400" />
                    <p className="font-semibold">{gasto.aprobado_por_email}</p>
                  </div>
                  {gasto.aprobado_en && (
                    <p className="text-sm text-gray-500">
                      {format(new Date(gasto.aprobado_en), "dd/MM/yyyy HH:mm", { locale: es })}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Diálogos */}
      {/* Dialog Editar Gasto */}
      <GastoForm
        open={modalEditar}
        onClose={() => setModalEditar(false)}
        gasto={gasto}
        onSubmit={handleEditar}
      />

      {/* AlertDialog Enviar para Aprobación */}
      <AlertDialog open={dialogEnviar} onOpenChange={setDialogEnviar}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Enviar gasto para aprobación?</AlertDialogTitle>
            <AlertDialogDescription>
              El gasto {gasto.codigo} será enviado para su aprobación. Esta acción no se puede
              deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleEnviar}>Enviar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog Aprobar Gasto */}
      <Dialog open={modalAprobar} onOpenChange={setModalAprobar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aprobar Gasto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="observaciones">Observaciones (opcional)</Label>
              <Textarea
                id="observaciones"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Agregar comentarios sobre la aprobación..."
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setModalAprobar(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAprobar} disabled={aprobarGasto.isPending}>
                {aprobarGasto.isPending ? "Aprobando..." : "Aprobar Gasto"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Rechazar Gasto */}
      <Dialog open={modalRechazar} onOpenChange={setModalRechazar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechazar Gasto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="motivo-rechazo">
                Motivo del rechazo <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="motivo-rechazo"
                value={motivoRechazo}
                onChange={(e) => setMotivoRechazo(e.target.value)}
                placeholder="Especificar el motivo del rechazo..."
                rows={4}
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setModalRechazar(false)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleRechazar}
                disabled={rechazarGasto.isPending || !motivoRechazo.trim()}
              >
                {rechazarGasto.isPending ? "Rechazando..." : "Rechazar Gasto"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AlertDialog Anular Gasto */}
      <Dialog open={modalAnular} onOpenChange={setModalAnular}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Anular Gasto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="motivo-anular">
                Motivo de anulación <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="motivo-anular"
                value={motivoAnular}
                onChange={(e) => setMotivoAnular(e.target.value)}
                placeholder="Especificar el motivo de la anulación..."
                rows={4}
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setModalAnular(false)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleAnular}
                disabled={anularGasto.isPending || !motivoAnular.trim()}
              >
                {anularGasto.isPending ? "Anulando..." : "Anular Gasto"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
