// Constantes del sistema

export const MONEDAS = [
  { value: 'PEN', label: 'Soles (PEN)' },
  { value: 'USD', label: 'Dólares (USD)' },
] as const;

export const ROLES = [
  { value: 'admin', label: 'Administrador' },
  { value: 'responsable', label: 'Responsable' },
  { value: 'aprobador', label: 'Aprobador' },
  { value: 'colaborador', label: 'Colaborador' },
] as const;

export const CATEGORIAS_GASTO = [
  { value: 'viaticos', label: 'Viáticos', color: 'bg-blue-500' },
  { value: 'transporte', label: 'Transporte', color: 'bg-green-500' },
  { value: 'alimentacion', label: 'Alimentación', color: 'bg-orange-500' },
  { value: 'hospedaje', label: 'Hospedaje', color: 'bg-purple-500' },
  { value: 'otros', label: 'Otros', color: 'bg-gray-500' },
] as const;

export const ESTADOS = [
  { value: 'activo', label: 'Activo' },
  { value: 'inactivo', label: 'Inactivo' },
] as const;

export const ESTADOS_SUCURSAL = [
  { value: 'activa', label: 'Activa' },
  { value: 'inactiva', label: 'Inactiva' },
] as const;

export const ESTADOS_CAJA = [
  { value: 'abierta', label: 'Abierta' },
  { value: 'cerrada', label: 'Cerrada' },
] as const;

export const REGIONES_PERU = [
  'Amazonas', 'Áncash', 'Apurímac', 'Arequipa', 'Ayacucho',
  'Cajamarca', 'Callao', 'Cusco', 'Huancavelica', 'Huánuco',
  'Ica', 'Junín', 'La Libertad', 'Lambayeque', 'Lima',
  'Loreto', 'Madre de Dios', 'Moquegua', 'Pasco', 'Piura',
  'Puno', 'San Martín', 'Tacna', 'Tumbes', 'Ucayali'
] as const;

export const FORMATO_MONEDA: Record<string, Intl.NumberFormatOptions> = {
  PEN: {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  },
  USD: {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  },
};

// Colores para progress bar según porcentaje
export const getPresupuestoColor = (porcentaje: number): string => {
  if (porcentaje < 70) return 'bg-success';
  if (porcentaje >= 70 && porcentaje < 90) return 'bg-warning';
  return 'bg-destructive';
};

export const getPresupuestoTextColor = (porcentaje: number): string => {
  if (porcentaje < 70) return 'text-success';
  if (porcentaje >= 70 && porcentaje < 90) return 'text-warning';
  return 'text-destructive';
};
