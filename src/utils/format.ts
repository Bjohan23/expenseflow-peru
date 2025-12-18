/**
 * Utilidades de formato para el sistema
 */

/**
 * Formatea un valor numérico como moneda
 */
export const formatCurrency = (amount: string | number): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return 'S/ 0.00';
  }

  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount);
};

/**
 * Formatea una fecha en formato español
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';

  try {
    const date = new Date(dateString);

    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
      return 'N/A';
    }

    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return 'N/A';
  }
};

/**
 * Formatea una fecha con hora
 */
export const formatDateTime = (dateString: string): string => {
  if (!dateString) return 'N/A';

  try {
    const date = new Date(dateString);

    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
      return 'N/A';
    }

    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch (error) {
    console.error('Error formateando fecha y hora:', error);
    return 'N/A';
  }
};

/**
 * Formatea un número con separadores de miles
 */
export const formatNumber = (value: string | number): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numValue)) {
    return '0';
  }

  return new Intl.NumberFormat('es-PE').format(numValue);
};

/**
 * Trunca un texto a una longitud específica
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) {
    return text;
  }

  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Formatea un RUC peruano
 */
export const formatRUC = (ruc: string): string => {
  if (!ruc) return '';

  // Remover cualquier caracter no numérico
  const cleanRUC = ruc.replace(/\D/g, '');

  // Formato: XXXXXXXXXX (11 dígitos)
  if (cleanRUC.length === 11) {
    return cleanRUC;
  }

  return cleanRUC;
};

/**
 * Formatea un número de documento peruano
 */
export const formatDocumentNumber = (type: string, number: string): string => {
  if (!number) return '';

  const cleanNumber = number.replace(/\D/g, '');

  switch (type?.toUpperCase()) {
    case 'FACTURA':
      // Formato: FXXX-YYYYYYY
      if (cleanNumber.length <= 10) {
        return `F${cleanNumber.padStart(10, '0').replace(/(\d{3})(\d{7})/, '$1-$2')}`;
      }
      break;

    case 'BOLETA':
      // Formato: BXXX-YYYYYYY
      if (cleanNumber.length <= 10) {
        return `B${cleanNumber.padStart(10, '0').replace(/(\d{3})(\d{7})/, '$1-$2')}`;
      }
      break;

    default:
      return cleanNumber;
  }

  return number;
};

/**
 * Obtiene el color de estado para gastos
 */
export const getExpenseStatusColor = (status: number): string => {
  switch (status) {
    case 1: // BORRADOR
      return 'bg-gray-100 text-gray-800';
    case 2: // PENDIENTE
      return 'bg-yellow-100 text-yellow-800';
    case 3: // APROBADO
      return 'bg-blue-100 text-blue-800';
    case 4: // PAGADO
      return 'bg-green-100 text-green-800';
    case 5: // RECHAZADO
      return 'bg-red-100 text-red-800';
    case 9: // ANULADO
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Obtiene el color de estado para asignaciones de fondo
 */
export const getFundStatusColor = (status: number): string => {
  switch (status) {
    case 1: // ASIGNADO
      return 'bg-blue-100 text-blue-800';
    case 2: // POR_RENDIR
      return 'bg-orange-100 text-orange-800';
    case 3: // RENDIDO
      return 'bg-green-100 text-green-800';
    case 9: // ANULADO
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Convierte bytes a un formato legible
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Valida si un string es un número válido
 */
export const isValidNumber = (value: string): boolean => {
  return !isNaN(parseFloat(value)) && isFinite(parseFloat(value));
};

/**
 * Redondea un número a 2 decimales
 */
export const roundToTwo = (value: number | string): number => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return Math.round((num + Number.EPSILON) * 100) / 100;
};