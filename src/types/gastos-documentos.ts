/**
 * Tipos TypeScript para Documentos de Gastos con OCR
 * Generados desde la tabla gastos_documentos
 */

export type TipoDocumento =
  | "factura"
  | "boleta"
  | "recibo"
  | "ticket"
  | "orden_compra"
  | "contrato"
  | "otro";

export type Moneda = "PEN" | "USD" | "EUR";

export type FormaPago = "efectivo" | "tarjeta" | "transferencia" | "cheque" | "credito" | "otro";

export type EstadoDocumento =
  | "pendiente" // Subido, esperando validación
  | "validado" // Datos confirmados como correctos
  | "rechazado" // Documento no válido
  | "aprobado" // Aprobado para gasto
  | "observado"; // Tiene observaciones pendientes

export type ProcesadoPor = "tesseract" | "google-vision" | "aws-textract" | "manual";

export interface ItemDocumento {
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface GastoDocumento {
  // Identificadores
  id: string;
  concepto_gasto_id: string | null;
  caja_id: string | null;
  usuario_id: string | null;

  // Información del archivo
  archivo_url: string;
  archivo_nombre: string;
  archivo_tipo: string;
  archivo_tamano: number;

  // Tipo de documento
  tipo_documento: TipoDocumento;
  numero_documento: string;
  fecha_emision: string; // ISO date string
  fecha_vencimiento?: string | null;
  moneda: Moneda;

  // Información del emisor
  emisor_ruc?: string | null;
  emisor_razon_social?: string | null;
  emisor_direccion?: string | null;
  emisor_telefono?: string | null;
  emisor_email?: string | null;

  // Información del cliente
  cliente_documento?: string | null;
  cliente_nombre?: string | null;
  cliente_direccion?: string | null;

  // Montos
  subtotal: number;
  igv: number;
  total: number;
  tipo_cambio?: number | null;
  descuento?: number | null;
  detraccion?: number | null;

  // Detalle de items
  items?: ItemDocumento[] | null;

  // Validación SUNAT
  codigo_qr?: string | null;
  hash_validacion?: string | null;
  validado_sunat: boolean;

  // Información de pago
  forma_pago?: FormaPago | null;
  condiciones_pago?: string | null;

  // Metadatos OCR
  texto_raw?: string | null;
  confianza_ocr?: number | null;
  procesado_por: ProcesadoPor;
  requiere_validacion: boolean;
  validado_manualmente: boolean;
  validado_por?: string | null;
  validado_en?: string | null; // ISO timestamp

  // Observaciones
  observaciones?: string | null;
  glosa?: string | null;

  // Estado y auditoría
  estado: EstadoDocumento;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

// Tipo para crear un nuevo documento
export type NuevoGastoDocumento = Omit<
  GastoDocumento,
  "id" | "created_at" | "updated_at" | "validado_manualmente" | "validado_por" | "validado_en"
>;

// Tipo para actualizar un documento existente
export type ActualizarGastoDocumento = Partial<
  Omit<GastoDocumento, "id" | "created_at" | "updated_at">
>;

// Tipo para datos extraídos por OCR (antes de validar)
export interface DatosOCRExtraidos {
  // Tipo de documento
  tipo_documento?: TipoDocumento;
  numero_documento?: string;
  fecha_emision?: string;
  fecha_vencimiento?: string;
  moneda?: Moneda;

  // Emisor
  emisor_ruc?: string;
  emisor_razon_social?: string;
  emisor_direccion?: string;
  emisor_telefono?: string;
  emisor_email?: string;

  // Cliente
  cliente_documento?: string;
  cliente_nombre?: string;
  cliente_direccion?: string;

  // Montos
  subtotal?: number;
  igv?: number;
  total?: number;
  tipo_cambio?: number;
  descuento?: number;

  // Items
  items?: ItemDocumento[];

  // Validación
  codigo_qr?: string;

  // Pago
  forma_pago?: FormaPago;

  // Metadatos
  texto_raw: string;
  confianza_ocr: number;
}

// Tipo para la vista con información agregada
export interface VistaGastoDocumento extends GastoDocumento {
  concepto_nombre?: string | null;
  concepto_categoria?: string | null;
  caja_nombre?: string | null;
  usuario_email?: string | null;
  dias_desde_emision: number;
  esta_vencido: boolean;
  total_pen: number;
}

// Tipo para estadísticas de OCR
export interface EstadisticasOCR {
  total_documentos: number;
  documentos_validados: number;
  documentos_pendientes: number;
  confianza_promedio: number;
  total_monto_pen: number;
  documentos_por_tipo: Record<TipoDocumento, number>;
}

// Tipo para filtros de búsqueda
export interface FiltrosDocumentos {
  concepto_gasto_id?: string;
  caja_id?: string;
  tipo_documento?: TipoDocumento;
  estado?: EstadoDocumento;
  fecha_desde?: string;
  fecha_hasta?: string;
  emisor_ruc?: string;
  moneda?: Moneda;
}

// Tipo para configuración de OCR
export interface ConfiguracionOCR {
  idioma: "spa" | "eng" | "spa+eng";
  confianzaMinima: number; // 0-100
  procesarPDF: boolean;
  extraerQR: boolean;
  validarSUNAT: boolean;
  paginacion?: {
    pagina: number;
    porPagina: number;
  };
}
