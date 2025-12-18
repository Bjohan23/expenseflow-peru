import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Upload,
  X,
  FileText,
  AlertCircle,
  DollarSign,
  Calendar,
  User,
  Building,
  CreditCard,
  Plus,
  Trash2
} from 'lucide-react';

// Importar servicios mock
import { categoriasService } from '@/services/categorias.service';
import { treasuryService } from '@/services/treasury.service';
import { imageStorageService } from '@/services/images.service';
import { ImageUploader } from '@/components/common/ImageUploader';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';

// Tipos
interface GastoItem {
  nro_item: number;
  descripcion_item: string;
  cantidad: number;
  precio_unitario: number;
  total_item: number;
}

interface CreateGastoRequest {
  empresa: string;
  sucursal: string;
  categoria: string;
  responsable: string;
  glosa: string;
  importe: number;
  pagado_por: number;
  reembolsable: boolean;
  fondo: string;
  tipo_documento: string;
  nro_documento: string;
  fecha_documento: string;
  ruc_emisor: string;
  nombre_emisor: string;
  items: GastoItem[];
}

export default function NuevoGasto() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState<CreateGastoRequest>({
    empresa: '',
    sucursal: '',
    categoria: '',
    responsable: '',
    glosa: '',
    importe: 0,
    pagado_por: 1,
    reembolsable: false,
    fondo: 'none',
    tipo_documento: '',
    nro_documento: '',
    fecha_documento: new Date().toISOString().split('T')[0],
    ruc_emisor: '',
    nombre_emisor: '',
    items: [{
      nro_item: 1,
      descripcion_item: '',
      cantidad: 1,
      precio_unitario: 0,
      total_item: 0,
    }],
  });

  // Imágenes
  const [selectedImages, setSelectedImages] = useState<any[]>([]);

  // Queries usando servicios mock
  const { data: categorias, isLoading: categoriasLoading } = useQuery({
    queryKey: ['categorias'],
    queryFn: () => categoriasService.getCategorias(),
  });

  const { data: empresas, isLoading: empresasLoading } = useQuery({
    queryKey: ['empresas'],
    queryFn: () => treasuryService.getEmpresas(),
  });

  const { data: responsables, isLoading: responsablesLoading } = useQuery({
    queryKey: ['responsables'],
    queryFn: () => mocksService.getResponsables(),
    enabled: !!formData.empresa,
  });

  const { data: sucursales, isLoading: sucursalesLoading } = useQuery({
    queryKey: ['sucursales'],
    queryFn: () => treasuryService.getSucursales(formData.empresa),
    enabled: !!formData.empresa,
  });

  const { data: fondos, isLoading: fondosLoading } = useQuery({
    queryKey: ['fondos'],
    queryFn: () => mocksService.getFondosActivosByEmpresa(formData.empresa),
    enabled: !!formData.empresa,
  });

  const { data: tiposDocumento } = useQuery({
    queryKey: ['tipos-documento'],
    queryFn: () => mocksService.getTiposDocumento(),
  });

  // Mock mutation para crear gasto (simulado)
  const createGastoMutation = useMutation({
    mutationFn: async (data: CreateGastoRequest) => {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generar ID de gasto simulado
      const gastoId = 'gasto_' + Date.now().toString(36);

      // Simular error de validación
      if (!data.empresa) throw new Error('La empresa es requerida');
      if (!data.categoria) throw new Error('La categoría es requerida');
      if (!data.responsable) throw new Error('El responsable es requerido');

      return { gastoId, ...data };
    },
    onSuccess: (gasto) => {
      toast.success('Gasto creado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['gastos'] });
      navigate(`/gastos/${gasto.gastoId}`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear gasto');
    },
  });

  // Event handlers
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validar campos requeridos
    if (!formData.empresa) {
      toast.error('Seleccione una empresa');
      return;
    }
    if (!formData.categoria) {
      toast.error('Seleccione una categoría');
      return;
    }
    if (!formData.responsable) {
      toast.error('Seleccione un responsable');
      return;
    }
    if (!formData.tipo_documento) {
      toast.error('Seleccione un tipo de documento');
      return;
    }
    if (!formData.nro_documento) {
      toast.error('Ingrese el número de documento');
      return;
    }
    if (formData.importe <= 0) {
      toast.error('El importe debe ser mayor a 0');
      return;
    }

    // Validar items
    const itemsValidos = formData.items.every(
      item => item.descripcion_item.trim() && item.cantidad > 0 && item.precio_unitario > 0
    );

    if (!itemsValidos) {
      toast.error('Complete los datos de todos los items correctamente');
      return;
    }

    createGastoMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof CreateGastoRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index: number, field: keyof GastoItem, value: any) => {
    const items = [...formData.items];
    items[index] = { ...items[index], [field]: value };

    // Recalcular total_item si cambian cantidad o precio
    if (field === 'cantidad' || field === 'precio_unitario') {
      items[index].total_item = items[index].cantidad * items[index].precio_unitario;
    }

    // Recalcular total del gasto
    const nuevoImporte = items.reduce((total, item) => total + item.total_item, 0);
    setFormData(prev => ({
      ...prev,
      items,
      importe: nuevoImporte
    }));
  };

  const addItem = () => {
    const nuevoItem: GastoItem = {
      nro_item: formData.items.length + 1,
      descripcion_item: '',
      cantidad: 1,
      precio_unitario: 0,
      total_item: 0,
    };

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, nuevoItem],
    }));
  };

  const removeItem = (index: number) => {
    const items = formData.items.filter((_, i) => i !== index);

    // Reasignar números de item
    const itemsRenumerados = items.map((item, idx) => ({
      ...item,
      nro_item: idx + 1,
    }));

    const nuevoImporte = itemsRenumerados.reduce((total, item) => total + item.total_item, 0);

    setFormData(prev => ({
      ...prev,
      items: itemsRenumerados,
      importe: nuevoImporte,
    }));
  };

  const handleImageSelect = (image: any) => {
    setSelectedImages(prev => [...prev, image]);
  };

  const formatDateForInput = (date: string): string => {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  if (categoriasLoading || empresasLoading) {
    return <LoadingSkeleton type="form" count={10} />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          onClick={() => navigate('/gastos')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold">Nuevo Gasto</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información Principal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Información del Gasto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Empresa */}
              <div>
                <Label htmlFor="empresa">Empresa *</Label>
                <Select
                  value={formData.empresa}
                  onValueChange={(value) => {
                    handleInputChange('empresa', value);
                    // Limpiar campos dependientes
                    setFormData(prev => ({
                      ...prev,
                      sucursal: '',
                      responsable: '',
                      fondo: 'none'
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {empresas?.map((empresa) => (
                      <SelectItem key={empresa.id} value={empresa.id}>
                        {empresa.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sucursal */}
              <div>
                <Label htmlFor="sucursal">Sucursal</Label>
                <Select
                  value={formData.sucursal}
                  onValueChange={(value) => handleInputChange('sucursal', value)}
                  disabled={!formData.empresa}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar sucursal" />
                  </SelectTrigger>
                  <SelectContent>
                    {sucursales?.map((sucursal) => (
                      <SelectItem key={sucursal.sucursal_id} value={sucursal.sucursal_id}>
                        {sucursal.nombre_sucursal}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Categoría */}
              <div>
                <Label htmlFor="categoria">Categoría *</Label>
                <Select
                  value={formData.categoria}
                  onValueChange={(value) => handleInputChange('categoria', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias?.map((categoria) => (
                      <SelectItem key={categoria.categoria_id} value={categoria.categoria_id}>
                        {categoria.nombre_categoria}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Responsable */}
              <div>
                <Label htmlFor="responsable">Responsable *</Label>
                <Select
                  value={formData.responsable}
                  onValueChange={(value) => handleInputChange('responsable', value)}
                  disabled={!formData.empresa}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar responsable" />
                  </SelectTrigger>
                  <SelectContent>
                    {responsables?.map((responsable) => (
                      <SelectItem key={responsable.id} value={responsable.id}>
                        {responsable.nombre_completo} - {responsable.cargo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Glosa */}
              <div>
                <Label htmlFor="glosa">Glosa</Label>
                <Textarea
                  id="glosa"
                  value={formData.glosa}
                  onChange={(e) => handleInputChange('glosa', e.target.value)}
                  placeholder="Descripción del gasto"
                  rows={2}
                />
              </div>

              {/* Importe */}
              <div>
                <Label htmlFor="importe">Importe *</Label>
                <Input
                  id="importe"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.importe}
                  onChange={(e) => handleInputChange('importe', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>

              {/* Pagado Por */}
              <div>
                <Label htmlFor="pagado_por">Pagado Por</Label>
                <Select
                  value={formData.pagado_por.toString()}
                  onValueChange={(value) => handleInputChange('pagado_por', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Efectivo</SelectItem>
                    <SelectItem value="2">Tarjeta de Crédito</SelectItem>
                    <SelectItem value="3">Transferencia</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Reembolsable */}
              <div>
                <Label>¿Es reembolsable?</Label>
                <Select
                  value={formData.reembolsable ? 'true' : 'false'}
                  onValueChange={(value) => handleInputChange('reembolsable', value === 'true')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Sí</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Fondo */}
              <div>
                <Label htmlFor="fondo">Fondo Asociado</Label>
                <Select
                  value={formData.fondo}
                  onValueChange={(value) => handleInputChange('fondo', value)}
                  disabled={!formData.empresa}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar fondo (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin fondo</SelectItem>
                    {fondos?.map((fondo) => (
                      <SelectItem key={fondo.id} value={fondo.id}>
                        {fondo.nombre_fondo} - S/. {fondo.monto_disponible.toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información del Documento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Información del Documento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tipo de Documento */}
              <div>
                <Label htmlFor="tipo_documento">Tipo de Documento *</Label>
                <Select
                  value={formData.tipo_documento}
                  onValueChange={(value) => handleInputChange('tipo_documento', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposDocumento?.map((tipo) => (
                      <SelectItem key={tipo.id} value={tipo.codigo}>
                        {tipo.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Número de Documento */}
              <div>
                <Label htmlFor="nro_documento">Número de Documento *</Label>
                <Input
                  id="nro_documento"
                  value={formData.nro_documento}
                  onChange={(e) => handleInputChange('nro_documento', e.target.value)}
                  placeholder="001-123456"
                  maxLength={12}
                />
              </div>

              {/* Fecha del Documento */}
              <div>
                <Label htmlFor="fecha_documento">Fecha del Documento *</Label>
                <Input
                  id="fecha_documento"
                  type="date"
                  value={formatDateForInput(formData.fecha_documento)}
                  onChange={(e) => handleInputChange('fecha_documento', e.target.value)}
                />
              </div>

              {/* RUC del Emisor */}
              <div>
                <Label htmlFor="ruc_emisor">RUC del Emisor</Label>
                <Input
                  id="ruc_emisor"
                  value={formData.ruc_emisor}
                  onChange={(e) => handleInputChange('ruc_emisor', e.target.value)}
                  placeholder="12345678901"
                  maxLength={11}
                />
              </div>

              {/* Nombre del Emisor */}
              <div className="md:col-span-2">
                <Label htmlFor="nombre_emisor">Nombre del Emisor</Label>
                <Input
                  id="nombre_emisor"
                  value={formData.nombre_emisor}
                  onChange={(e) => handleInputChange('nombre_emisor', e.target.value)}
                  placeholder="Nombre del emisor"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Detalle del Gasto
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
                className="flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Agregar Item
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <Card key={index} className="p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium">Item #{item.nro_item}</span>
                    {formData.items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <Label>Descripción</Label>
                      <Input
                        value={item.descripcion_item}
                        onChange={(e) => handleItemChange(index, 'descripcion_item', e.target.value)}
                        placeholder="Descripción del item"
                      />
                    </div>
                    <div>
                      <Label>Cantidad</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.cantidad}
                        onChange={(e) => handleItemChange(index, 'cantidad', parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div>
                      <Label>Precio Unitario</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.precio_unitario}
                        onChange={(e) => handleItemChange(index, 'precio_unitario', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label>Total</Label>
                      <Input
                        value={item.total_item.toFixed(2)}
                        readOnly
                        className="bg-gray-50"
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Total General */}
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total del Gasto:</span>
                <span className="text-xl font-bold text-blue-600">
                  S/ {formData.importe.toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Evidencia */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Evidencia (Opcional)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUploader
              onImagesChange={setSelectedImages}
              maxImages={3}
              maxSizeMB={5}
              categoria="gastos"
              multiple={true}
            />
            {selectedImages.length > 0 && (
              <div className="mt-2 text-sm text-green-600">
                <Badge variant="outline" className="mr-2">
                  <Upload className="w-3 h-3 mr-1" />
                  {selectedImages.length} imagen(es) subida(s)
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alerta informativa */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Nota:</strong> Este es un sistema simulado para demostración.
            Los datos se almacenan localmente y no se envían a un servidor real.
          </AlertDescription>
        </Alert>

        {/* Botones de acción */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/gastos')}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={createGastoMutation.isPending}
          >
            {createGastoMutation.isPending ? 'Guardando...' : 'Guardar Gasto'}
          </Button>
        </div>
      </form>
    </div>
  );
}