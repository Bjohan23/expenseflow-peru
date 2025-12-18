import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Upload, X, FileText, AlertCircle, DollarSign, Calendar, User, Building, CreditCard } from 'lucide-react';
import { treasuryService } from '@/services/treasury.service';
import { CreateGastoRequest, CategoriaGastoSelector, Caja, GastoItem } from '@/types/treasury';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';

interface EvidenciaFile {
  id: string;
  file: File;
  preview: string;
  uploading: boolean;
  progress: number;
}

export default function NuevoGasto() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState<CreateGastoRequest>({
    empresa: '',
    sucursal: '',
    categoria: 0,
    responsable: '',
    glosa: '',
    importe: '',
    pagado_por: 1,
    reembolsable: false,
    fondo: 'none',
    tipo_documento: 'BOLETA',
    nro_documento: '',
    fecha_documento: new Date().toISOString().split('T')[0],
    ruc_emisor: '',
    nombre_emisor: '',
    items: [{
      nro_item: 1,
      descripcion_item: '',
      cantidad: 1,
      precio_unitario: '0.00',
      total_item: '0.00',
    }],
  });

  // Files state
  const [evidenciaFiles, setEvidenciaFiles] = useState<EvidenciaFile[]>([]);

  // Queries
  const { data: categoriasData, isLoading: categoriasLoading } = useQuery({
    queryKey: ['categorias-selector'],
    queryFn: () => treasuryService.getCategoriasSelector(),
  });

  const { data: empresasData, isLoading: empresasLoading } = useQuery({
    queryKey: ['empresas'],
    queryFn: () => treasuryService.getEmpresas(),
  });

  const { data: sucursalesData, isLoading: sucursalesLoading } = useQuery({
    queryKey: ['sucursales', formData.empresa],
    queryFn: () => treasuryService.getSucursales(formData.empresa),
    enabled: !!formData.empresa,
  });

  const { data: cajasData, isLoading: cajasLoading } = useQuery({
    queryKey: ['aperturas-cajas'],
    queryFn: () => treasuryService.getAperturasCajas(),
  });

  // Mutations
  const createGastoMutation = useMutation({
    mutationFn: (data: CreateGastoRequest) => treasuryService.createGasto(data),
    onSuccess: (gasto) => {
      toast.success('Gasto creado exitosamente');
      queryClient.invalidateQueries(['gastos']);
      navigate(`/gastos/${gasto.gasto_id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear gasto');
    },
  });

  const addEvidenciaMutation = useMutation({
    mutationFn: ({ gastoId, file }: { gastoId: string; file: FormData }) =>
      treasuryService.addEvidencia(gastoId, file),
    onSuccess: (_, variables) => {
      // Update file state
      setEvidenciaFiles(prev =>
        prev.map(f =>
          f.id === variables.gastoId
            ? { ...f, uploading: false, progress: 100 }
            : f
        )
      );
    },
    onError: (error: any, variables) => {
      setEvidenciaFiles(prev =>
        prev.map(f =>
          f.id === variables.gastoId
            ? { ...f, uploading: false, progress: 0 }
            : f
        )
      );
      toast.error('Error al subir evidencia');
    },
  });

  // Handlers
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.empresa || !formData.sucursal || !formData.categoria || !formData.responsable ||
        !formData.glosa || !formData.importe || !formData.tipo_documento || !formData.fecha_documento) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    // Validate items
    if (!formData.items || formData.items.length === 0) {
      toast.error('Debes agregar al menos un ítem al gasto');
      return;
    }

    const hasValidItems = formData.items.every(item =>
      item.descripcion_item && item.cantidad > 0 && item.precio_unitario && parseFloat(item.precio_unitario) > 0
    );

    if (!hasValidItems) {
      toast.error('Todos los ítems deben tener descripción, cantidad y precio unitario válido');
      return;
    }

    createGastoMutation.mutate(formData);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    files.forEach(file => {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error(`El archivo ${file.name} excede el límite de 10MB`);
        return;
      }

      const fileId = Math.random().toString(36).substr(2, 9);
      const preview = file.type.startsWith('image/')
        ? URL.createObjectURL(file)
        : null;

      setEvidenciaFiles(prev => [...prev, {
        id: fileId,
        file,
        preview: preview || '',
        uploading: false,
        progress: 0,
      }]);
    });

    // Clear input
    e.target.value = '';
  };

  const removeFile = (fileId: string) => {
    setEvidenciaFiles(prev => {
      const file = prev.find(f => f.id === fileId);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  const uploadEvidencias = async (gastoId: string) => {
    const uploadPromises = evidenciaFiles.map(async (evidenciaFile) => {
      setEvidenciaFiles(prev =>
        prev.map(f =>
          f.id === evidenciaFile.id
            ? { ...f, uploading: true, progress: 0 }
            : f
        )
      );

      const formData = new FormData();
      formData.append('evidencia', evidenciaFile.file);

      return addEvidenciaMutation.mutateAsync({ gastoId, file: formData });
    });

    try {
      await Promise.all(uploadPromises);
      toast.success('Todas las evidencias se subieron correctamente');
    } catch (error) {
      toast.error('Error al subir algunas evidencias');
    }
  };

  // Auto-upload evidencias after gasto is created
  React.useEffect(() => {
    if (createGastoMutation.isSuccess && createGastoMutation.data && evidenciaFiles.length > 0) {
      uploadEvidencias(createGastoMutation.data.gasto_id);
    }
  }, [createGastoMutation.isSuccess, createGastoMutation.data]);

  if (categoriasLoading || empresasLoading || sucursalesLoading || cajasLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Registrar Nuevo Gasto</h1>
          <p className="text-muted-foreground mt-2">Completa el formulario para registrar un nuevo gasto</p>
        </div>
        <LoadingSkeleton type="form" count={4} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/gastos')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Gastos
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Registrar Nuevo Gasto</h1>
          <p className="text-gray-600 mt-1">
            Completa el formulario para registrar un nuevo gasto
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Información Básica */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Información Básica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="empresa">Empresa *</Label>
                  <Select
                    value={formData.empresa}
                    onValueChange={(value) => {
                      setFormData({ ...formData, empresa: value, sucursal: '' });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      {empresasData?.map((empresa) => (
                        <SelectItem key={empresa.id} value={empresa.id}>
                          {empresa.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="sucursal">Sucursal *</Label>
                  <Select
                    value={formData.sucursal}
                    onValueChange={(value) => setFormData({ ...formData, sucursal: value })}
                    disabled={!formData.empresa}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una sucursal" />
                    </SelectTrigger>
                    <SelectContent>
                      {sucursalesData?.map((sucursal) => (
                        <SelectItem key={sucursal.sucursal_id} value={sucursal.sucursal_id}>
                          {sucursal.nombre_sucursal}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="categoria">Categoría de Gasto *</Label>
                <Select
                  value={formData.categoria ? formData.categoria.toString() : ''}
                  onValueChange={(value) => setFormData({ ...formData, categoria: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriasData?.map((categoria) => (
                      <SelectItem key={categoria.categoria_id} value={categoria.categoria_id}>
                        {categoria.nombre_categoria}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="responsable">Responsable del Gasto *</Label>
                <Input
                  id="responsable"
                  value={formData.responsable}
                  onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
                  placeholder="ID del responsable"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Información Financiera */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Información Financiera
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="glosa">Descripción del Gasto *</Label>
                <Textarea
                  id="glosa"
                  value={formData.glosa}
                  onChange={(e) => setFormData({ ...formData, glosa: e.target.value })}
                  placeholder="Describe detalladamente el gasto realizado"
                  rows={3}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="importe">Importe Total *</Label>
                <Input
                  id="importe"
                  type="number"
                  step="0.01"
                  value={formData.importe}
                  onChange={(e) => setFormData({ ...formData, importe: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="pagado_por">Pagado Por *</Label>
                  <Select
                    value={formData.pagado_por ? formData.pagado_por.toString() : '1'}
                    onValueChange={(value) => setFormData({ ...formData, pagado_por: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona quién pagó" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Caja Chica</SelectItem>
                      <SelectItem value="2">Caja Grande</SelectItem>
                      <SelectItem value="3">Proveedor</SelectItem>
                      <SelectItem value="4">Personal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="reembolsable">¿Reembolsable?</Label>
                  <Select
                    value={formData.reembolsable.toString()}
                    onValueChange={(value) => setFormData({ ...formData, reembolsable: value === 'true' })}
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
              </div>

              <div className="grid gap-2">
                <Label htmlFor="fondo">Caja Asignada (Opcional)</Label>
                <Select
                  value={formData.fondo}
                  onValueChange={(value) => setFormData({ ...formData, fondo: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una caja" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin caja asignada</SelectItem>
                    {cajasData?.map((caja) => (
                      <SelectItem key={caja.id} value={caja.id}>
                        {caja.caja_nombre} - {caja.estado_display}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Información Operativa */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Información del Documento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="tipo_documento">Tipo de Documento *</Label>
                  <Select
                    value={formData.tipo_documento}
                    onValueChange={(value) => setFormData({ ...formData, tipo_documento: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BOLETA">Boleta</SelectItem>
                      <SelectItem value="FACTURA">Factura</SelectItem>
                      <SelectItem value="RECIBO">Recibo</SelectItem>
                      <SelectItem value="TICKET">Ticket</SelectItem>
                      <SelectItem value="OTRO">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="nro_documento">Número de Documento</Label>
                  <Input
                    id="nro_documento"
                    value={formData.nro_documento}
                    onChange={(e) => setFormData({ ...formData, nro_documento: e.target.value })}
                    placeholder="Ej: B001-123456"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="fecha_documento">Fecha del Documento *</Label>
                <Input
                  id="fecha_documento"
                  type="date"
                  value={formData.fecha_documento}
                  onChange={(e) => setFormData({ ...formData, fecha_documento: e.target.value })}
                  max={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="ruc_emisor">RUC del Emisor</Label>
                  <Input
                    id="ruc_emisor"
                    value={formData.ruc_emisor}
                    onChange={(e) => setFormData({ ...formData, ruc_emisor: e.target.value })}
                    placeholder="RUC de quien emitió el documento"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="nombre_emisor">Nombre del Emisor</Label>
                  <Input
                    id="nombre_emisor"
                    value={formData.nombre_emisor}
                    onChange={(e) => setFormData({ ...formData, nombre_emisor: e.target.value })}
                    placeholder="Nombre del proveedor/emisor"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items del Gasto */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Items del Gasto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.items?.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-6">
                    <Label htmlFor={`item-desc-${index}`}>Descripción *</Label>
                    <Input
                      id={`item-desc-${index}`}
                      value={item.descripcion_item}
                      onChange={(e) => {
                        const newItems = [...formData.items];
                        newItems[index].descripcion_item = e.target.value;
                        setFormData({ ...formData, items: newItems });
                      }}
                      placeholder="Descripción del item"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor={`item-cant-${index}`}>Cantidad *</Label>
                    <Input
                      id={`item-cant-${index}`}
                      type="number"
                      min="1"
                      value={item.cantidad}
                      onChange={(e) => {
                        const newItems = [...formData.items];
                        newItems[index].cantidad = parseInt(e.target.value) || 1;
                        newItems[index].total_item = (newItems[index].cantidad * parseFloat(newItems[index].precio_unitario || '0')).toFixed(2);
                        setFormData({ ...formData, items: newItems });
                      }}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor={`item-precio-${index}`}>Precio Unit. *</Label>
                    <Input
                      id={`item-precio-${index}`}
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.precio_unitario}
                      onChange={(e) => {
                        const newItems = [...formData.items];
                        newItems[index].precio_unitario = e.target.value;
                        newItems[index].total_item = (newItems[index].cantidad * parseFloat(e.target.value || '0')).toFixed(2);
                        setFormData({ ...formData, items: newItems });
                      }}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="col-span-1">
                    <Label>Total</Label>
                    <div className="h-10 px-3 py-2 bg-gray-100 rounded-md text-sm">
                      {item.total_item}
                    </div>
                  </div>
                  <div className="col-span-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (formData.items.length > 1) {
                          const newItems = formData.items.filter((_, i) => i !== index);
                          setFormData({ ...formData, items: newItems });
                        }
                      }}
                      disabled={formData.items.length === 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const newItem: GastoItem = {
                    nro_item: formData.items.length + 1,
                    descripcion_item: '',
                    cantidad: 1,
                    precio_unitario: '0.00',
                    total_item: '0.00',
                  };
                  setFormData({ ...formData, items: [...formData.items, newItem] });
                }}
              >
                Agregar Item
              </Button>
            </CardContent>
          </Card>

          {/* Evidencias */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Evidencias del Gasto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  id="evidencias"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <label htmlFor="evidencias" className="cursor-pointer">
                  <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-sm font-medium text-gray-900">
                    Haz clic para subir evidencias
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Formatos: JPG, PNG, PDF, DOC, DOCX (máx. 10MB por archivo)
                  </p>
                </label>
              </div>

              {/* Files list */}
              {evidenciaFiles.length > 0 && (
                <div className="space-y-2">
                  <Label>Evidencias Seleccionadas</Label>
                  <div className="grid gap-2">
                    {evidenciaFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {file.file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(file.file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {file.uploading && (
                            <div className="w-24">
                              <Progress value={file.progress} className="h-2" />
                            </div>
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(file.id)}
                            disabled={file.uploading}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload status message */}
              {createGastoMutation.isSuccess && evidenciaFiles.length > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    El gasto se creó correctamente. Subiendo evidencias...
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Submit button */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/gastos')}
            disabled={createGastoMutation.isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={createGastoMutation.isLoading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {createGastoMutation.isLoading ? 'Creando Gasto...' : 'Crear Gasto'}
          </Button>
        </div>
      </form>
    </div>
  );
}