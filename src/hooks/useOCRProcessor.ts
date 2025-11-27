/**
 * Hook personalizado para procesamiento OCR
 * Maneja la extracción de texto de imágenes y PDFs usando Tesseract.js
 */

import { useState, useCallback } from "react";
import { createWorker, PSM } from "tesseract.js";
import { extraerCamposCompletos, calcularNivelConfianza } from "@/lib/ocr-utils";
import type { DatosOCRExtraidos } from "@/types/gastos-documentos";

interface UseOCRProcessorOptions {
  idioma?: "spa" | "eng" | "spa+eng";
  onProgress?: (progreso: number) => void;
  onComplete?: (datos: DatosOCRExtraidos) => void;
  onError?: (error: Error) => void;
}

interface UseOCRProcessorReturn {
  procesando: boolean;
  progreso: number;
  error: Error | null;
  datosExtraidos: DatosOCRExtraidos | null;
  procesarImagen: (archivo: File) => Promise<DatosOCRExtraidos>;
  procesarPDF: (archivo: File) => Promise<DatosOCRExtraidos>;
  reiniciar: () => void;
}

export function useOCRProcessor(options: UseOCRProcessorOptions = {}): UseOCRProcessorReturn {
  const { idioma = "spa+eng", onProgress, onComplete, onError } = options;

  const [procesando, setProcesando] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const [datosExtraidos, setDatosExtraidos] = useState<DatosOCRExtraidos | null>(null);

  /**
   * Actualiza el progreso del OCR
   */
  const actualizarProgreso = useCallback(
    (nuevoProgreso: number) => {
      setProgreso(nuevoProgreso);
      if (onProgress) {
        onProgress(nuevoProgreso);
      }
    },
    [onProgress]
  );

  /**
   * Procesa una imagen con Tesseract.js
   */
  const procesarImagen = useCallback(
    async (archivo: File): Promise<DatosOCRExtraidos> => {
      setProcesando(true);
      setError(null);
      setProgreso(0);

      try {
        // Validar tipo de archivo
        if (!archivo.type.startsWith("image/")) {
          throw new Error("El archivo debe ser una imagen (JPG, PNG, WEBP)");
        }

        // Validar tamaño (máximo 10MB)
        if (archivo.size > 10 * 1024 * 1024) {
          throw new Error("La imagen no debe superar los 10MB");
        }

        actualizarProgreso(10);

        // Crear worker de Tesseract
        const worker = await createWorker(idioma, 1, {
          logger: (m) => {
            if (m.status === "recognizing text") {
              const progresoParcial = 10 + m.progress * 70; // 10-80%
              actualizarProgreso(Math.round(progresoParcial));
            }
          },
        });

        actualizarProgreso(15);

        // Configurar parámetros de Tesseract
        await worker.setParameters({
          tessedit_pageseg_mode: PSM.AUTO,
          preserve_interword_spaces: "1",
        });

        actualizarProgreso(20);

        // Procesar imagen
        const { data } = await worker.recognize(archivo);

        actualizarProgreso(85);

        // Extraer campos del texto OCR
        const textoLimpio = data.text.trim();

        if (!textoLimpio) {
          throw new Error(
            "No se pudo extraer texto de la imagen. Intenta con una imagen más clara."
          );
        }

        const campos = extraerCamposCompletos(textoLimpio);
        const confianza = calcularNivelConfianza(campos);

        actualizarProgreso(95);

        const resultado: DatosOCRExtraidos = {
          ...campos,
          texto_raw: textoLimpio,
          confianza_ocr: confianza,
        };

        setDatosExtraidos(resultado);
        actualizarProgreso(100);

        // Cleanup
        await worker.terminate();

        if (onComplete) {
          onComplete(resultado);
        }
        setProcesando(false);
        return resultado;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Error desconocido al procesar imagen");
        setError(error);
        onError?.(error);
        setProcesando(false);
        throw error;
      }
    },
    [idioma, actualizarProgreso, onComplete, onError]
  );

  /**
   * Procesa un PDF (convierte primera página a imagen y procesa)
   */
  const procesarPDF = useCallback(
    async (archivo: File): Promise<DatosOCRExtraidos> => {
      setProcesando(true);
      setError(null);
      setProgreso(0);

      try {
        // Validar tipo de archivo
        if (archivo.type !== "application/pdf") {
          throw new Error("El archivo debe ser un PDF");
        }

        // Validar tamaño (máximo 10MB)
        if (archivo.size > 10 * 1024 * 1024) {
          throw new Error("El PDF no debe superar los 10MB");
        }

        actualizarProgreso(5);

        // Importar dinámicamente pdfjs para reducir bundle inicial
        const pdfjsLib = await import("pdfjs-dist");

        // Configurar worker de PDF.js
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

        actualizarProgreso(10);

        // Cargar PDF
        const arrayBuffer = await archivo.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        actualizarProgreso(20);

        // Obtener primera página
        const pagina = await pdf.getPage(1);
        const viewport = pagina.getViewport({ scale: 2 }); // Escala 2x para mejor calidad

        actualizarProgreso(30);

        // Crear canvas para renderizar página
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) {
          throw new Error("No se pudo crear contexto de canvas");
        }

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // Renderizar página en canvas
        await pagina.render({
          canvasContext: context,
          viewport: viewport,
          canvas: canvas,
        }).promise;

        actualizarProgreso(45);

        // Convertir canvas a Blob
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (b) => {
              if (b) resolve(b);
              else reject(new Error("No se pudo convertir canvas a blob"));
            },
            "image/png",
            0.95
          );
        });

        actualizarProgreso(50);

        // Crear File desde Blob
        const imagenFile = new File([blob], "pdf-page-1.png", { type: "image/png" });

        // Procesar imagen extraída con OCR
        const resultado = await procesarImagen(imagenFile);

        return resultado;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Error desconocido al procesar PDF");
        setError(error);
        if (onError) {
          onError(error);
        }
        setProcesando(false);
        throw error;
      }
    },
    [procesarImagen, actualizarProgreso, onError]
  );

  /**
   * Reinicia el estado del hook
   */
  const reiniciar = useCallback(() => {
    setProcesando(false);
    setProgreso(0);
    setError(null);
    setDatosExtraidos(null);
  }, []);

  return {
    procesando,
    progreso,
    error,
    datosExtraidos,
    procesarImagen,
    procesarPDF,
    reiniciar,
  };
}
