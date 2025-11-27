/**
 * Utilidades para procesamiento OCR y extracción de campos
 * Incluye regex patterns y funciones de parsing para documentos peruanos
 */

// =====================================================
// REGEX PATTERNS PARA PERÚ
// =====================================================

/**
 * RUC: 11 dígitos
 * Formato: 20123456789
 */
export const RUC_REGEX = /\b\d{11}\b/g;

/**
 * DNI: 8 dígitos
 * Formato: 12345678
 */
export const DNI_REGEX = /\b\d{8}\b/g;

/**
 * Número de Factura
 * Formato: F001-00001234 o F001-1234
 */
export const FACTURA_REGEX = /[FB]\d{3}-\d{5,8}/gi;

/**
 * Fechas en formato DD/MM/YYYY o DD-MM-YYYY
 */
export const FECHA_REGEX = /\b(\d{1,2})[/-](\d{1,2})[/-](\d{4})\b/g;

/**
 * Montos monetarios
 * Formato: S/ 1,234.56 o 1234.56 o 1,234.56
 */
export const MONTO_REGEX = /(?:S\/\s*)?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g;

/**
 * IGV (18%)
 */
export const IGV_REGEX =
  /(?:IGV|I\.G\.V\.?)\s*(?:18%?)?\s*:?\s*S?\/?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi;

/**
 * Total a pagar
 */
export const TOTAL_REGEX =
  /(?:TOTAL|IMPORTE\s*TOTAL)\s*:?\s*S?\/?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi;

/**
 * Subtotal / Base Imponible
 */
export const SUBTOTAL_REGEX =
  /(?:SUB\s*TOTAL|SUBTOTAL|BASE\s*IMPONIBLE)\s*:?\s*S?\/?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi;

/**
 * Razón Social (palabras en mayúsculas seguidas de SAC, S.A.C., SRL, etc.)
 */
export const RAZON_SOCIAL_REGEX =
  /([A-ZÁÉÍÓÚÑ\s&]{3,})\s+(S\.?A\.?C\.?|S\.?R\.?L\.?|E\.?I\.?R\.?L\.?|S\.?A\.?)/gi;

/**
 * Email
 */
export const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;

/**
 * Teléfono (9 dígitos, puede empezar con +51)
 */
export const TELEFONO_REGEX = /(?:\+51\s?)?(?:\(?\d{1,3}\)?\s?)?\d{3}[-\s]?\d{3}[-\s]?\d{3}/g;

// =====================================================
// FUNCIONES DE EXTRACCIÓN
// =====================================================

/**
 * Extrae RUC del texto
 */
export function extraerRUC(texto: string): string | null {
  const matches = texto.match(RUC_REGEX);
  if (!matches || matches.length === 0) return null;

  // Devolver el primer RUC encontrado (usualmente es el emisor)
  return matches[0];
}

/**
 * Extrae DNI del texto
 */
export function extraerDNI(texto: string): string | null {
  const matches = texto.match(DNI_REGEX);
  if (!matches || matches.length === 0) return null;

  return matches[0];
}

/**
 * Extrae número de documento (factura/boleta)
 */
export function extraerNumeroDocumento(texto: string): string | null {
  const matches = texto.match(FACTURA_REGEX);
  if (!matches || matches.length === 0) return null;

  return matches[0].toUpperCase();
}

/**
 * Extrae fecha del texto y la convierte a formato ISO
 */
export function extraerFecha(texto: string): string | null {
  const matches = texto.match(FECHA_REGEX);
  if (!matches || matches.length === 0) return null;

  const fechaStr = matches[0];
  const [, dia, mes, anio] = fechaStr.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{4})/) || [];

  if (!dia || !mes || !anio) return null;

  // Convertir a formato ISO (YYYY-MM-DD)
  const diaNum = dia.padStart(2, "0");
  const mesNum = mes.padStart(2, "0");

  return `${anio}-${mesNum}-${diaNum}`;
}

/**
 * Limpia y convierte string de monto a número
 */
export function limpiarMonto(montoStr: string): number {
  // Remover S/, espacios, y comas
  const limpio = montoStr
    .replace(/S\/?\s*/gi, "")
    .replace(/,/g, "")
    .trim();

  return parseFloat(limpio) || 0;
}

/**
 * Extrae subtotal del texto
 */
export function extraerSubtotal(texto: string): number | null {
  const matches = texto.match(SUBTOTAL_REGEX);
  if (!matches || matches.length === 0) return null;

  const montoMatch = matches[0].match(/(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
  if (!montoMatch) return null;

  return limpiarMonto(montoMatch[0]);
}

/**
 * Extrae IGV del texto
 */
export function extraerIGV(texto: string): number | null {
  const matches = texto.match(IGV_REGEX);
  if (!matches || matches.length === 0) return null;

  const montoMatch = matches[0].match(/(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
  if (!montoMatch) return null;

  return limpiarMonto(montoMatch[0]);
}

/**
 * Extrae total del texto
 */
export function extraerTotal(texto: string): number | null {
  const matches = texto.match(TOTAL_REGEX);
  if (!matches || matches.length === 0) return null;

  const montoMatch = matches[0].match(/(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
  if (!montoMatch) return null;

  return limpiarMonto(montoMatch[0]);
}

/**
 * Extrae razón social del texto
 */
export function extraerRazonSocial(texto: string): string | null {
  const matches = texto.match(RAZON_SOCIAL_REGEX);
  if (!matches || matches.length === 0) return null;

  return matches[0].trim();
}

/**
 * Extrae email del texto
 */
export function extraerEmail(texto: string): string | null {
  const matches = texto.match(EMAIL_REGEX);
  if (!matches || matches.length === 0) return null;

  return matches[0].toLowerCase();
}

/**
 * Extrae teléfono del texto
 */
export function extraerTelefono(texto: string): string | null {
  const matches = texto.match(TELEFONO_REGEX);
  if (!matches || matches.length === 0) return null;

  return matches[0];
}

/**
 * Detecta tipo de documento basado en el texto
 */
export function detectarTipoDocumento(
  texto: string
): "factura" | "boleta" | "recibo" | "ticket" | "otro" {
  const textoUpper = texto.toUpperCase();

  if (textoUpper.includes("FACTURA ELECTRÓNICA") || textoUpper.includes("FACTURA")) {
    return "factura";
  }
  if (textoUpper.includes("BOLETA DE VENTA") || textoUpper.includes("BOLETA")) {
    return "boleta";
  }
  if (textoUpper.includes("RECIBO")) {
    return "recibo";
  }
  if (textoUpper.includes("TICKET")) {
    return "ticket";
  }

  return "otro";
}

/**
 * Detecta moneda del documento
 */
export function detectarMoneda(texto: string): "PEN" | "USD" | "EUR" {
  const textoUpper = texto.toUpperCase();

  if (textoUpper.includes("USD") || textoUpper.includes("DÓLARES") || textoUpper.includes("US$")) {
    return "USD";
  }
  if (textoUpper.includes("EUR") || textoUpper.includes("EUROS") || textoUpper.includes("€")) {
    return "EUR";
  }

  // Por defecto, moneda peruana
  return "PEN";
}

/**
 * Valida formato de RUC (11 dígitos)
 */
export function validarRUC(ruc: string): boolean {
  return /^\d{11}$/.test(ruc);
}

/**
 * Valida formato de DNI (8 dígitos)
 */
export function validarDNI(dni: string): boolean {
  return /^\d{8}$/.test(dni);
}

/**
 * Calcula IGV (18%) desde subtotal
 */
export function calcularIGV(subtotal: number): number {
  return Math.round(subtotal * 0.18 * 100) / 100;
}

/**
 * Calcula total desde subtotal e IGV
 */
export function calcularTotal(subtotal: number, igv: number, descuento: number = 0): number {
  return Math.round((subtotal + igv - descuento) * 100) / 100;
}

/**
 * Extrae todos los campos posibles del texto OCR
 */
export function extraerCamposCompletos(textoOCR: string) {
  const ruc = extraerRUC(textoOCR);
  const fecha = extraerFecha(textoOCR);
  const numeroDocumento = extraerNumeroDocumento(textoOCR);
  const subtotal = extraerSubtotal(textoOCR);
  const igv = extraerIGV(textoOCR);
  const total = extraerTotal(textoOCR);
  const razonSocial = extraerRazonSocial(textoOCR);
  const email = extraerEmail(textoOCR);
  const telefono = extraerTelefono(textoOCR);
  const tipoDocumento = detectarTipoDocumento(textoOCR);
  const moneda = detectarMoneda(textoOCR);

  return {
    tipo_documento: tipoDocumento,
    numero_documento: numeroDocumento,
    fecha_emision: fecha,
    moneda,
    emisor_ruc: ruc,
    emisor_razon_social: razonSocial,
    emisor_email: email,
    emisor_telefono: telefono,
    subtotal,
    igv,
    total,
    texto_raw: textoOCR,
  };
}

/**
 * Calcula nivel de confianza basado en campos extraídos
 */
export function calcularNivelConfianza(campos: ReturnType<typeof extraerCamposCompletos>): number {
  let puntos = 0;
  let total = 0;

  // Campos críticos (20 puntos cada uno)
  if (campos.numero_documento) {
    puntos += 20;
    total += 20;
  }
  if (campos.fecha_emision) {
    puntos += 20;
    total += 20;
  }
  if (campos.total) {
    puntos += 20;
    total += 20;
  }

  // Campos importantes (15 puntos cada uno)
  if (campos.emisor_ruc && validarRUC(campos.emisor_ruc)) {
    puntos += 15;
    total += 15;
  }
  if (campos.emisor_razon_social) {
    puntos += 15;
    total += 15;
  }

  // Campos opcionales (10 puntos cada uno)
  if (campos.subtotal) {
    puntos += 10;
    total += 10;
  }
  if (campos.igv) {
    puntos += 10;
    total += 10;
  }
  if (campos.emisor_email) {
    puntos += 10;
    total += 10;
  }
  if (campos.emisor_telefono) {
    puntos += 10;
    total += 10;
  }

  total += 40; // Total máximo posible

  return Math.round((puntos / total) * 100);
}

/**
 * Formatea número a moneda peruana
 */
export function formatearMoneda(monto: number, moneda: "PEN" | "USD" | "EUR" = "PEN"): string {
  const simbolo = moneda === "PEN" ? "S/" : moneda === "USD" ? "US$" : "€";
  return `${simbolo} ${monto.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

/**
 * Limpia texto OCR de caracteres extraños
 */
export function limpiarTextoOCR(texto: string): string {
  return texto
    .replace(/[^\w\s\.\,\-\+\@\(\)\/]/gi, "") // Remover caracteres especiales
    .replace(/\s+/g, " ") // Normalizar espacios
    .trim();
}
