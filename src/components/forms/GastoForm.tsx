/**
 * Formulario para crear y editar gastos
 * Incluye validación, cálculos automáticos y vinculación con documentos OCR
 */

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
// TODO: Migrate to new API service - import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, FileText, Calculator, Save, Send, Loader2 } from "lucide-react";
import type { FormularioGasto, Moneda, TipoBeneficiario, Gasto } from "@/types/gastos";
import type { ConceptoGasto } from "@/types";
import { validarGastoBasico, formatearMonto, MONEDAS, TIPOS_BENEFICIARIO } from "@/types/gastos";

interface GastoFormProps {
  gasto?: Gasto;
  open: boolean;
  onClose: () => void;
  onSubmit: (datos: FormularioGasto, enviar: boolean) => void;
  isLoading?: boolean;
}

export function GastoForm({ gasto, open, onClose, onSubmit, isLoading }: GastoFormProps) {
  const { user } = useAuth();

  // Estado del formulario
  const [formData, setFormData] = useState<FormularioGasto>({
    concepto_gasto_id: "",
    descripcion: "",
    fecha_gasto: new Date().toISOString().split("T")[0],
    monto: 0,
    moneda: "PEN",
    estado: "borrador",
  });

  const [mostrarAdvertencias, setMostrarAdvertencias] = useState(false);

  // Cargar conceptos de gasto
  const { data: conceptos = [] } = useQuery({
    queryKey: ["conceptos_gasto"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conceptos_gasto")
        .select("*")
        .eq("estado", "activo")
        .order("nombre");

      if (error) throw error;
      return data as ConceptoGasto[];
    },
  });

  // Cargar cajas
  const { data: cajas = [] } = useQuery({
    queryKey: ["cajas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cajas")
        .select("*")
        .eq("estado", "abierta")
        .order("nombre");

      if (error) throw error;
      return data;
    },
  });

  // Cargar centros de costo
  const { data: centrosCosto = [] } = useQuery({
    queryKey: ["centros_costo"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("centros_costo")
        .select("*")
        .eq("estado", "activo")
        .order("nombre");

      if (error) throw error;
      return data;
    },
  });

  // Cargar documentos OCR disponibles
  const { data: documentosOCR = [] } = useQuery({
    queryKey: ["gastos_documentos_disponibles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gastos_documentos")
        .select("*")
        .eq("usuario_id", user?.id)
        .eq("estado", "pendiente")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Concepto seleccionado
  const conceptoSeleccionado = conceptos.find((c) => c.id === formData.concepto_gasto_id);

  // Validación
  const validacion = validarGastoBasico(formData);

  // Verificar si excede límite
  const excedeLimite = conceptoSeleccionado?.limite_maximo
    ? formData.monto > conceptoSeleccionado.limite_maximo
    : false;

  // Cargar datos del gasto existente
  useEffect(() => {
    if (gasto) {
      setFormData({
        concepto_gasto_id: gasto.concepto_gasto_id,
        centro_costo_id: gasto.centro_costo_id || undefined,
        caja_id: gasto.caja_id || undefined,
        documento_id: gasto.documento_id || undefined,
        descripcion: gasto.descripcion,
        fecha_gasto: gasto.fecha_gasto,
        monto: gasto.monto,
        moneda: gasto.moneda as Moneda,
        tipo_cambio: gasto.tipo_cambio || undefined,
        beneficiario_tipo: (gasto.beneficiario_tipo as TipoBeneficiario) || undefined,
        beneficiario_documento: gasto.beneficiario_documento || undefined,
        beneficiario_nombre: gasto.beneficiario_nombre || undefined,
        observaciones: gasto.observaciones || undefined,
        tags: gasto.tags || undefined,
        estado: gasto.estado,
      });
    }
  }, [gasto]);

  // Autocompletar desde documento OCR
  const vincularDocumentoOCR = (documentoId: string) => {
    const doc = documentosOCR.find((d) => d.id === documentoId);
    if (!doc) return;

    setFormData((prev) => ({
      ...prev,
      documento_id: doc.id,
      monto: doc.total || prev.monto,
      moneda: (doc.moneda || "PEN") as Moneda,
      beneficiario_nombre: doc.emisor_razon_social || prev.beneficiario_nombre,
      beneficiario_documento: doc.emisor_ruc || prev.beneficiario_documento,
      beneficiario_tipo: doc.emisor_ruc ? "proveedor" : prev.beneficiario_tipo,
      observaciones: `Documento: ${doc.tipo_documento} ${doc.numero_documento}`,
    }));
  };

  const handleSubmit = (enviar: boolean) => {
    setMostrarAdvertencias(true);

    if (!validacion.valido) return;

    onSubmit(formData, enviar);
  };

  const handleClose = () => {
    setFormData({
      concepto_gasto_id: "",
      descripcion: "",
      fecha_gasto: new Date().toISOString().split("T")[0],
      monto: 0,
      moneda: "PEN",
      estado: "borrador",
    });
    setMostrarAdvertencias(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{gasto ? "Editar Gasto" : "Nuevo Gasto"}</DialogTitle>
          <DialogDescription>
            {gasto
              ? "Modifica los datos del gasto"
              : "Completa la información del gasto a registrar"}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Documento OCR */}
            {!gasto && documentosOCR.length > 0 && (
              <div className="space-y-2">
                <Label>Vincular con Documento Escaneado (Opcional)</Label>
                <Select
                  value={formData.documento_id || "_none"}
                  onValueChange={(value) => vincularDocumentoOCR(value === "_none" ? "" : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar documento..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">Sin vincular</SelectItem>
                    {documentosOCR.map((doc) => (
                      <SelectItem key={doc.id} value={doc.id}>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span>
                            {doc.tipo_documento} {doc.numero_documento} - {doc.emisor_razon_social}
                          </span>
                          <Badge variant="secondary">
                            {formatearMonto(doc.total || 0, doc.moneda as Moneda)}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Separator />

            {/* Concepto */}
            <div className="space-y-2">
              <Label htmlFor="concepto">Concepto de Gasto *</Label>
              <Select
                value={formData.concepto_gasto_id}
                onValueChange={(value) => setFormData({ ...formData, concepto_gasto_id: value })}
                disabled={!!gasto}
              >
                <SelectTrigger id="concepto">
                  <SelectValue placeholder="Seleccionar concepto..." />
                </SelectTrigger>
                <SelectContent>
                  {conceptos.map((concepto) => (
                    <SelectItem key={concepto.id} value={concepto.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{concepto.nombre}</span>
                        <span className="text-xs text-gray-500">
                          {concepto.categoria}
                          {concepto.limite_maximo && (
                            <> · Límite: {formatearMonto(concepto.limite_maximo, "PEN")}</>
                          )}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {mostrarAdvertencias && !formData.concepto_gasto_id && (
                <p className="text-sm text-red-600">Selecciona un concepto</p>
              )}
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción *</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Describe el motivo del gasto..."
                rows={3}
              />
              {mostrarAdvertencias && !formData.descripcion && (
                <p className="text-sm text-red-600">La descripción es obligatoria</p>
              )}
            </div>

            {/* Monto y Moneda */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monto">Monto *</Label>
                <div className="flex gap-2">
                  <Input
                    id="monto"
                    type="number"
                    step="0.01"
                    value={formData.monto || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, monto: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="0.00"
                  />
                  <Select
                    value={formData.moneda}
                    onValueChange={(value: Moneda) => setFormData({ ...formData, moneda: value })}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(MONEDAS).map(([codigo, config]) => (
                        <SelectItem key={codigo} value={codigo}>
                          {config.simbolo} {codigo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {excedeLimite && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Excede el límite de{" "}
                      {formatearMonto(conceptoSeleccionado!.limite_maximo!, "PEN")}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha del Gasto *</Label>
                <Input
                  id="fecha"
                  type="date"
                  value={formData.fecha_gasto}
                  onChange={(e) => setFormData({ ...formData, fecha_gasto: e.target.value })}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>

            {/* Tipo de cambio */}
            {formData.moneda !== "PEN" && (
              <div className="space-y-2">
                <Label htmlFor="tipo_cambio">Tipo de Cambio</Label>
                <div className="flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-gray-400" />
                  <Input
                    id="tipo_cambio"
                    type="number"
                    step="0.0001"
                    value={formData.tipo_cambio || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tipo_cambio: parseFloat(e.target.value) || undefined,
                      })
                    }
                    placeholder="Ej: 3.7500"
                  />
                  {formData.tipo_cambio && (
                    <span className="text-sm text-gray-600">
                      ≈ {formatearMonto(formData.monto * formData.tipo_cambio, "PEN")}
                    </span>
                  )}
                </div>
              </div>
            )}

            <Separator />

            {/* Beneficiario */}
            <div className="space-y-4">
              <h4 className="font-medium">Beneficiario</h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="beneficiario_tipo">Tipo</Label>
                  <Select
                    value={formData.beneficiario_tipo || "_none"}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        beneficiario_tipo:
                          value === "_none" ? undefined : (value as TipoBeneficiario),
                      })
                    }
                  >
                    <SelectTrigger id="beneficiario_tipo">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">Seleccionar...</SelectItem>
                      {Object.entries(TIPOS_BENEFICIARIO).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="beneficiario_documento">RUC/DNI</Label>
                  <Input
                    id="beneficiario_documento"
                    value={formData.beneficiario_documento || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, beneficiario_documento: e.target.value })
                    }
                    placeholder="20123456789"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="beneficiario_nombre">Nombre/Razón Social</Label>
                <Input
                  id="beneficiario_nombre"
                  value={formData.beneficiario_nombre || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, beneficiario_nombre: e.target.value })
                  }
                  placeholder="Nombre del beneficiario..."
                />
              </div>
            </div>

            <Separator />

            {/* Asignación */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="centro_costo">Centro de Costo</Label>
                <Select
                  value={formData.centro_costo_id || "_none"}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      centro_costo_id: value === "_none" ? undefined : value,
                    })
                  }
                >
                  <SelectTrigger id="centro_costo">
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">Sin asignar</SelectItem>
                    {centrosCosto.map((cc) => (
                      <SelectItem key={cc.id} value={cc.id}>
                        {cc.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="caja">Caja</Label>
                <Select
                  value={formData.caja_id || "_none"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, caja_id: value === "_none" ? undefined : value })
                  }
                >
                  <SelectTrigger id="caja">
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">Sin asignar</SelectItem>
                    {cajas.map((caja) => (
                      <SelectItem key={caja.id} value={caja.id}>
                        {caja.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Observaciones */}
            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea
                id="observaciones"
                value={formData.observaciones || ""}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                placeholder="Notas adicionales..."
                rows={3}
              />
            </div>

            {/* Advertencias */}
            {mostrarAdvertencias && validacion.advertencias.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {validacion.advertencias.map((adv, i) => (
                      <li key={i} className="text-sm">
                        {adv}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleSubmit(false)}
            disabled={isLoading || !validacion.valido}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Guardar Borrador
          </Button>
          <Button onClick={() => handleSubmit(true)} disabled={isLoading || !validacion.valido}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Enviar para Aprobación
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
