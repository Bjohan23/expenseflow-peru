import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import { OCRUpload } from "@/components/ocr/OCRUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
// TODO: Migrate to new API service - import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import type { DatosOCRExtraidos } from "@/types/gastos-documentos";

export default function OCRUploadPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [datosExtraidos, setDatosExtraidos] = useState<DatosOCRExtraidos | null>(null);
  const [archivoSubido, setArchivoSubido] = useState<File | null>(null);
  const [guardando, setGuardando] = useState(false);

  const manejarExtraer = (datos: DatosOCRExtraidos, archivo: File) => {
    setDatosExtraidos(datos);
    setArchivoSubido(archivo);
  };

  const guardarDocumento = async () => {
    if (!datosExtraidos || !archivoSubido || !id) return;

    setGuardando(true);

    try {
      // 1. Obtener usuario actual
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuario no autenticado");
      }

      // 2. Subir archivo a Storage
      const archivoNombre = `${user.id}/${Date.now()}_${archivoSubido.name}`;
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from("gastos-documentos")
        .upload(archivoNombre, archivoSubido);

      if (uploadError) throw uploadError;

      // 3. Guardar solo el path del archivo (no URL pública porque el bucket es privado)
      // El path se usará luego para generar signed URLs cuando sea necesario
      const archivoPath = archivoNombre;

      // 4. Guardar datos en la tabla gastos_documentos
      const { error: insertError } = await supabase.from("gastos_documentos").insert({
        concepto_gasto_id: id,
        usuario_id: user.id,
        archivo_url: archivoPath,
        archivo_nombre: archivoSubido.name,
        archivo_tipo: archivoSubido.type,
        archivo_tamano: archivoSubido.size,
        tipo_documento: datosExtraidos.tipo_documento || "otro",
        numero_documento: datosExtraidos.numero_documento || "SIN-NUMERO",
        fecha_emision: datosExtraidos.fecha_emision || new Date().toISOString().split("T")[0],
        moneda: datosExtraidos.moneda || "PEN",
        emisor_ruc: datosExtraidos.emisor_ruc,
        emisor_razon_social: datosExtraidos.emisor_razon_social,
        emisor_email: datosExtraidos.emisor_email,
        emisor_telefono: datosExtraidos.emisor_telefono,
        subtotal: datosExtraidos.subtotal || 0,
        igv: datosExtraidos.igv || 0,
        total: datosExtraidos.total || 0,
        texto_raw: datosExtraidos.texto_raw,
        confianza_ocr: datosExtraidos.confianza_ocr,
        procesado_por: "tesseract",
        requiere_validacion: datosExtraidos.confianza_ocr < 85,
        estado: "pendiente",
      });

      if (insertError) throw insertError;

      toast({
        title: "✅ Documento guardado",
        description: "El documento ha sido procesado y guardado exitosamente",
      });

      navigate(`/conceptos-gasto/${id}/documentos`);
    } catch (error: unknown) {
      console.error("Error al guardar documento:", error);
      toast({
        title: "❌ Error al guardar",
        description: error instanceof Error ? error.message : "No se pudo guardar el documento",
        variant: "destructive",
      });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(`/conceptos-gasto/${id}/documentos`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Escanear Documento</h1>
          <p className="text-muted-foreground">
            Sube un documento para extraer información automáticamente con OCR
          </p>
        </div>
      </div>

      {/* Componente de carga OCR */}
      <OCRUpload onExtraerDatos={manejarExtraer} />

      {/* Resultados extraídos */}
      {datosExtraidos && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Datos Extraídos del Documento
            </CardTitle>
            <CardDescription>
              Revisa la información extraída. Nivel de confianza:{" "}
              {datosExtraidos.confianza_ocr.toFixed(1)}%
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Información del documento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Tipo de Documento</p>
                <p className="font-medium capitalize">
                  {datosExtraidos.tipo_documento || "No detectado"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Número de Documento</p>
                <p className="font-medium">{datosExtraidos.numero_documento || "No detectado"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fecha de Emisión</p>
                <p className="font-medium">{datosExtraidos.fecha_emision || "No detectada"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Moneda</p>
                <p className="font-medium">{datosExtraidos.moneda || "PEN"}</p>
              </div>
            </div>

            {/* Información del emisor */}
            {(datosExtraidos.emisor_ruc || datosExtraidos.emisor_razon_social) && (
              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-3">Información del Emisor</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {datosExtraidos.emisor_ruc && (
                    <div>
                      <p className="text-sm text-muted-foreground">RUC</p>
                      <p className="font-medium">{datosExtraidos.emisor_ruc}</p>
                    </div>
                  )}
                  {datosExtraidos.emisor_razon_social && (
                    <div>
                      <p className="text-sm text-muted-foreground">Razón Social</p>
                      <p className="font-medium">{datosExtraidos.emisor_razon_social}</p>
                    </div>
                  )}
                  {datosExtraidos.emisor_email && (
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{datosExtraidos.emisor_email}</p>
                    </div>
                  )}
                  {datosExtraidos.emisor_telefono && (
                    <div>
                      <p className="text-sm text-muted-foreground">Teléfono</p>
                      <p className="font-medium">{datosExtraidos.emisor_telefono}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Montos */}
            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-3">Montos</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Subtotal</p>
                  <p className="font-medium text-lg">
                    {datosExtraidos.subtotal
                      ? `S/ ${datosExtraidos.subtotal.toFixed(2)}`
                      : "No detectado"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">IGV (18%)</p>
                  <p className="font-medium text-lg">
                    {datosExtraidos.igv ? `S/ ${datosExtraidos.igv.toFixed(2)}` : "No detectado"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="font-bold text-xl text-primary">
                    {datosExtraidos.total
                      ? `S/ ${datosExtraidos.total.toFixed(2)}`
                      : "No detectado"}
                  </p>
                </div>
              </div>
            </div>

            {/* Alerta si la confianza es baja */}
            {datosExtraidos.confianza_ocr < 70 && (
              <Alert variant="destructive">
                <AlertDescription>
                  ⚠️ La confianza del OCR es baja ({datosExtraidos.confianza_ocr.toFixed(1)}%). Te
                  recomendamos verificar manualmente todos los datos extraídos.
                </AlertDescription>
              </Alert>
            )}

            {/* Botones de acción */}
            <div className="flex gap-2 pt-4">
              <Button className="flex-1" onClick={guardarDocumento} disabled={guardando}>
                {guardando ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar y Continuar"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(`/conceptos-gasto/${id}/documentos`)}
                disabled={guardando}
              >
                Cancelar
              </Button>
            </div>

            {/* Texto raw (debug) */}
            <details className="pt-4 border-t">
              <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                Ver texto extraído completo
              </summary>
              <pre className="mt-2 p-4 bg-muted rounded text-xs overflow-auto max-h-60">
                {datosExtraidos.texto_raw}
              </pre>
            </details>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
