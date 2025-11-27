import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface GastoDocumento {
  id: string;
  concepto_gasto_id: string;
  archivo_url: string;
  tipo_documento: string;
  numero_documento: string | null;
  fecha_emision: string | null;
  fecha_documento: string | null;
  emisor_ruc: string | null;
  emisor_razon_social: string | null;
  emisor_email: string | null;
  emisor_telefono: string | null;
  subtotal: number | null;
  igv: number | null;
  total: number | null;
  moneda: string;
  confianza_ocr: number | null;
  estado: string;
  texto_raw: string | null;
  observaciones: string | null;
  created_at: string;
}

interface EditarDocumentoDialogProps {
  open: boolean;
  onClose: () => void;
  documento: GastoDocumento | null;
}

export function EditarDocumentoDialog({ open, onClose, documento }: EditarDocumentoDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Partial<GastoDocumento>>({});

  // Sincronizar formData cuando cambia el documento
  useEffect(() => {
    if (documento) {
      setFormData({
        tipo_documento: documento.tipo_documento,
        numero_documento: documento.numero_documento || "",
        fecha_emision: documento.fecha_emision || documento.fecha_documento || "",
        emisor_ruc: documento.emisor_ruc || "",
        emisor_razon_social: documento.emisor_razon_social || "",
        emisor_email: documento.emisor_email || "",
        emisor_telefono: documento.emisor_telefono || "",
        subtotal: documento.subtotal || 0,
        igv: documento.igv || 0,
        total: documento.total || 0,
        moneda: documento.moneda,
        estado: documento.estado,
        observaciones: (documento as any).observaciones || "",
      });
    }
  }, [documento]);

  const mutation = useMutation({
    mutationFn: async (data: Partial<GastoDocumento>) => {
      if (!documento?.id) throw new Error("ID de documento no proporcionado");

      // Eliminar campos que no deben actualizarse
      const {
        id,
        created_at,
        archivo_url,
        archivo_nombre,
        archivo_tipo,
        archivo_tamano,
        texto_raw,
        confianza_ocr,
        ...updateData
      } = data as any;

      const { error } = await supabase
        .from("gastos_documentos")
        .update(updateData)
        .eq("id", documento.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gastos-documentos"] });
      toast({
        title: "✅ Documento actualizado",
        description: "Los cambios se han guardado correctamente",
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Error al actualizar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (!documento) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Documento</DialogTitle>
          <DialogDescription>
            Modifica los campos extraídos del documento escaneado
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Tipo de Documento */}
            <div className="space-y-2">
              <Label htmlFor="tipo_documento">Tipo de Documento</Label>
              <Select
                value={formData.tipo_documento}
                onValueChange={(value) => setFormData({ ...formData, tipo_documento: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="factura">Factura</SelectItem>
                  <SelectItem value="boleta">Boleta</SelectItem>
                  <SelectItem value="recibo">Recibo</SelectItem>
                  <SelectItem value="ticket">Ticket</SelectItem>
                  <SelectItem value="orden_compra">Orden de Compra</SelectItem>
                  <SelectItem value="contrato">Contrato</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Número de Documento */}
            <div className="space-y-2">
              <Label htmlFor="numero_documento">N° Documento</Label>
              <Input
                id="numero_documento"
                value={formData.numero_documento || ""}
                onChange={(e) => setFormData({ ...formData, numero_documento: e.target.value })}
                placeholder="F001-00001234"
              />
            </div>

            {/* Fecha de Emisión */}
            <div className="space-y-2">
              <Label htmlFor="fecha_emision">Fecha de Emisión</Label>
              <Input
                id="fecha_emision"
                type="date"
                value={formData.fecha_emision || ""}
                onChange={(e) => setFormData({ ...formData, fecha_emision: e.target.value })}
              />
            </div>

            {/* Moneda */}
            <div className="space-y-2">
              <Label htmlFor="moneda">Moneda</Label>
              <Select
                value={formData.moneda}
                onValueChange={(value) => setFormData({ ...formData, moneda: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PEN">Soles (S/)</SelectItem>
                  <SelectItem value="USD">Dólares ($)</SelectItem>
                  <SelectItem value="EUR">Euros (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* RUC */}
            <div className="space-y-2">
              <Label htmlFor="emisor_ruc">RUC Emisor</Label>
              <Input
                id="emisor_ruc"
                value={formData.emisor_ruc || ""}
                onChange={(e) => setFormData({ ...formData, emisor_ruc: e.target.value })}
                placeholder="20123456789"
                maxLength={11}
              />
            </div>

            {/* Estado */}
            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select
                value={formData.estado}
                onValueChange={(value) => setFormData({ ...formData, estado: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="aprobado">Aprobado</SelectItem>
                  <SelectItem value="rechazado">Rechazado</SelectItem>
                  <SelectItem value="revision">En Revisión</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Razón Social */}
          <div className="space-y-2">
            <Label htmlFor="emisor_razon_social">Razón Social</Label>
            <Input
              id="emisor_razon_social"
              value={formData.emisor_razon_social || ""}
              onChange={(e) => setFormData({ ...formData, emisor_razon_social: e.target.value })}
              placeholder="EMPRESA S.A.C."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="emisor_email">Email</Label>
              <Input
                id="emisor_email"
                type="email"
                value={formData.emisor_email || ""}
                onChange={(e) => setFormData({ ...formData, emisor_email: e.target.value })}
                placeholder="contacto@empresa.com"
              />
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
              <Label htmlFor="emisor_telefono">Teléfono</Label>
              <Input
                id="emisor_telefono"
                value={formData.emisor_telefono || ""}
                onChange={(e) => setFormData({ ...formData, emisor_telefono: e.target.value })}
                placeholder="999 888 777"
              />
            </div>
          </div>

          {/* Montos */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subtotal">Subtotal</Label>
              <Input
                id="subtotal"
                type="number"
                step="0.01"
                value={formData.subtotal || 0}
                onChange={(e) =>
                  setFormData({ ...formData, subtotal: Number.parseFloat(e.target.value) })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="igv">IGV (18%)</Label>
              <Input
                id="igv"
                type="number"
                step="0.01"
                value={formData.igv || 0}
                onChange={(e) =>
                  setFormData({ ...formData, igv: Number.parseFloat(e.target.value) })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="total">Total</Label>
              <Input
                id="total"
                type="number"
                step="0.01"
                value={formData.total || 0}
                onChange={(e) =>
                  setFormData({ ...formData, total: Number.parseFloat(e.target.value) })
                }
              />
            </div>
          </div>

          {/* Observaciones */}
          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              value={(formData as any).observaciones || ""}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value } as any)}
              placeholder="Agregar observaciones o comentarios..."
              rows={3}
            />
          </div>

          {/* Confianza OCR */}
          {documento.confianza_ocr && (
            <div className="flex items-center gap-2">
              <Label>Confianza OCR:</Label>
              <Badge
                variant={
                  documento.confianza_ocr >= 90
                    ? "default"
                    : documento.confianza_ocr >= 70
                    ? "secondary"
                    : "destructive"
                }
              >
                {documento.confianza_ocr}%
              </Badge>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
