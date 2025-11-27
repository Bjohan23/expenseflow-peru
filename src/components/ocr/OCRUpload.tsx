/**
 * Componente OCRUpload
 * Permite subir documentos (imágenes y PDFs) y procesarlos con OCR
 */

import { useCallback, useState } from "react";
import {
  Upload,
  FileText,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useOCRProcessor } from "@/hooks/useOCRProcessor";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { DatosOCRExtraidos } from "@/types/gastos-documentos";

interface OCRUploadProps {
  onExtraerDatos: (datos: DatosOCRExtraidos, archivo: File) => void;
  idiomaOCR?: "spa" | "eng" | "spa+eng";
  disabled?: boolean;
}

export function OCRUpload({
  onExtraerDatos,
  idiomaOCR = "spa+eng",
  disabled = false,
}: OCRUploadProps) {
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [arrastrando, setArrastrando] = useState(false);

  const { procesando, progreso, error, datosExtraidos, procesarImagen, procesarPDF, reiniciar } =
    useOCRProcessor({
      idioma: idiomaOCR,
    });

  /**
   * Maneja la selección de archivo
   */
  const manejarSeleccion = useCallback(
    (archivo: File) => {
      if (disabled || procesando) return;

      // Validar tipo de archivo
      const esImagen = archivo.type.startsWith("image/");
      const esPDF = archivo.type === "application/pdf";

      if (!esImagen && !esPDF) {
        return;
      }

      // Validar tamaño (máximo 10MB)
      if (archivo.size > 10 * 1024 * 1024) {
        return;
      }

      setArchivoSeleccionado(archivo);

      // Crear preview si es imagen
      if (esImagen) {
        const url = URL.createObjectURL(archivo);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }

      reiniciar();
    },
    [disabled, procesando, reiniciar]
  );

  /**
   * Maneja el drag over
   */
  const manejarDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled && !procesando) {
        setArrastrando(true);
      }
    },
    [disabled, procesando]
  );

  /**
   * Maneja el drag leave
   */
  const manejarDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setArrastrando(false);
  }, []);

  /**
   * Maneja el drop
   */
  const manejarDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setArrastrando(false);

      if (disabled || procesando) return;

      const archivos = e.dataTransfer.files;
      if (archivos.length > 0) {
        manejarSeleccion(archivos[0]);
      }
    },
    [disabled, procesando, manejarSeleccion]
  );

  /**
   * Maneja el cambio de input
   */
  const manejarInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const archivos = e.target.files;
      if (archivos && archivos.length > 0) {
        manejarSeleccion(archivos[0]);
      }
    },
    [manejarSeleccion]
  );

  /**
   * Procesa el archivo seleccionado
   */
  const procesarArchivo = useCallback(async () => {
    if (!archivoSeleccionado) return;

    try {
      let datos: DatosOCRExtraidos;

      if (archivoSeleccionado.type === "application/pdf") {
        datos = await procesarPDF(archivoSeleccionado);
      } else {
        datos = await procesarImagen(archivoSeleccionado);
      }

      onExtraerDatos(datos, archivoSeleccionado);
    } catch (err) {
      // Error ya manejado por el hook
      console.error("Error al procesar archivo:", err);
    }
  }, [archivoSeleccionado, procesarImagen, procesarPDF, onExtraerDatos]);

  /**
   * Cancela y reinicia
   */
  const cancelar = useCallback(() => {
    setArchivoSeleccionado(null);
    setPreviewUrl(null);
    reiniciar();
  }, [reiniciar]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Escanear Documento con OCR
        </CardTitle>
        <CardDescription>
          Sube una imagen (JPG, PNG, WEBP) o PDF del documento para extraer información
          automáticamente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Área de drag & drop */}
        {!archivoSeleccionado && (
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              arrastrando
                ? "border-primary bg-primary/5"
                : "border-gray-300 hover:border-primary/50"
            } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            onDragOver={manejarDragOver}
            onDragLeave={manejarDragLeave}
            onDrop={manejarDrop}
            onClick={() => {
              if (!disabled && !procesando) {
                document.getElementById("file-input")?.click();
              }
            }}
          >
            <input
              id="file-input"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
              onChange={manejarInputChange}
              className="hidden"
              disabled={disabled || procesando}
            />
            <div className="space-y-2">
              <div className="flex justify-center gap-2">
                <ImageIcon className="h-10 w-10 text-gray-400" />
                <FileText className="h-10 w-10 text-gray-400" />
              </div>
              <p className="text-sm font-medium">
                {arrastrando
                  ? "Suelta el archivo aquí"
                  : "Arrastra un archivo o haz clic para seleccionar"}
              </p>
              <p className="text-xs text-muted-foreground">
                Imágenes (JPG, PNG, WEBP) o PDF • Máximo 10MB
              </p>
            </div>
          </div>
        )}

        {/* Preview y procesamiento */}
        {archivoSeleccionado && (
          <div className="space-y-4">
            {/* Información del archivo */}
            <div className="flex items-start gap-4 p-4 border rounded-lg">
              <div className="flex-shrink-0">
                {archivoSeleccionado.type === "application/pdf" ? (
                  <FileText className="h-12 w-12 text-red-500" />
                ) : (
                  <ImageIcon className="h-12 w-12 text-blue-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{archivoSeleccionado.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(archivoSeleccionado.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              {!procesando && !datosExtraidos && (
                <Button variant="ghost" size="sm" onClick={cancelar}>
                  Cambiar
                </Button>
              )}
            </div>

            {/* Preview de imagen */}
            {previewUrl && (
              <div className="relative overflow-hidden rounded-lg border">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-auto max-h-96 object-contain"
                />
              </div>
            )}

            {/* Progreso de procesamiento */}
            {procesando && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Procesando documento...
                  </span>
                  <span className="font-medium">{progreso}%</span>
                </div>
                <Progress value={progreso} />
              </div>
            )}

            {/* Error */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error.message}</AlertDescription>
              </Alert>
            )}

            {/* Éxito */}
            {datosExtraidos && !procesando && (
              <Alert className="border-green-500 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  ¡Documento procesado exitosamente! Confianza:{" "}
                  {datosExtraidos.confianza_ocr.toFixed(1)}%
                </AlertDescription>
              </Alert>
            )}

            {/* Botones de acción */}
            {!procesando && !datosExtraidos && (
              <div className="flex gap-2">
                <Button onClick={procesarArchivo} className="flex-1">
                  <Loader2 className="h-4 w-4 mr-2" />
                  Procesar con OCR
                </Button>
                <Button variant="outline" onClick={cancelar}>
                  Cancelar
                </Button>
              </div>
            )}

            {datosExtraidos && !procesando && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={cancelar} className="flex-1">
                  Subir otro documento
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Información adicional */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>💡 Para mejores resultados:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Usa imágenes claras y bien iluminadas</li>
            <li>Asegúrate que el texto sea legible</li>
            <li>Evita sombras o reflejos en el documento</li>
            <li>Los PDFs digitales dan mejores resultados que escaneos</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
