import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Upload, X, FileText, AlertCircle, DollarSign, Calendar, User, Building, CreditCard } from 'lucide-react';
import { treasuryService } from '@/services/treasury.service';
import { CreateGastoRequest, CategoriaGastoSelector, Caja } from '@/types/treasury';
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
    categoria_gasto: '',
    caja: '',
    monto: '',
    moneda: 'PEN',
    descripcion: '',
    fecha_gasto: new Date().toISOString().split('T')[0],
    forma_pago: 'EFECTIVO',
    responsable_pago: '',
    numero_operacion: '',
    observaciones: '',
  });

  // Files state
  const [evidenciaFiles, setEvidenciaFiles] = useState<EvidenciaFile[]>([]);

  // Queries
  const { data: categoriasData, isLoading: categoriasLoading } = useQuery({
    queryKey: ['categorias-selector'],
    queryFn: () => treasuryService.getCategoriasSelector(),
  });

  const { data: cajasData, isLoading: cajasLoading } = useQuery({
    queryKey: ['cajas-activas'],
    queryFn: () => treasuryService.getCajas({ estado: 1 }),
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
    if (!formData.categoria_gasto || !formData.caja || !formData.monto || !formData.descripcion) {
      toast.error('Por favor completa todos los campos requeridos');
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

  if (categoriasLoading || cajasLoading) {
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
              <div className="grid gap-2">
                <Label htmlFor="categoria_gasto">Categoría de Gasto *</Label>
                <Select
                  value={formData.categoria_gasto}
                  onValueChange={(value) => setFormData({ ...formData, categoria_gasto: value })}
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
                <Label htmlFor="descripcion">Descripción del Gasto *</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Describe detalladamente el gasto realizado"
                  rows={3}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="observaciones">Observaciones Adicionales</Label>
                <Textarea
                  id="observaciones"
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  placeholder="Información adicional importante (opcional)"
                  rows={2}
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
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="monto">Monto *</Label>
                  <Input
                    id="monto"
                    type="number"
                    step="0.01"
                    value={formData.monto}
                    onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="moneda">Moneda</Label>
                  <Select
                    value={formData.moneda}
                    onValueChange={(value: 'PEN' | 'USD' | 'EUR') =>
                      setFormData({ ...formData, moneda: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PEN">PEN - Soles</SelectItem>
                      <SelectItem value="USD">USD - Dólares</SelectItem>
                      <SelectItem value="EUR">EUR - Euros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="forma_pago">Forma de Pago *</Label>
                <Select
                  value={formData.forma_pago}
                  onValueChange={(value) => setFormData({ ...formData, forma_pago: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona forma de pago" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EFECTIVO">Efectivo</SelectItem>
                    <SelectItem value="TARJETA_CREDITO">Tarjeta de Crédito</SelectItem>
                    <SelectItem value="TARJETA_DEBITO">Tarjeta de Débito</SelectItem>
                    <SelectItem value="TRANSFERENCIA">Transferencia Bancaria</SelectItem>
                    <SelectItem value="YAPE">Yape</SelectItem>
                    <SelectItem value="PLIN">Plin</SelectItem>
                    <SelectItem value="OTRO">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="responsable_pago">Responsable del Pago</Label>
                <Input
                  id="responsable_pago"
                  value={formData.responsable_pago}
                  onChange={(e) => setFormData({ ...formData, responsable_pago: e.target.value })}
                  placeholder="Persona que realizó el pago"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="numero_operacion">Número de Operación</Label>
                <Input
                  id="numero_operacion"
                  value={formData.numero_operacion}
                  onChange={(e) => setFormData({ ...formData, numero_operacion: e.target.value })}
                  placeholder="Número de transacción (opcional)"
                />
              </div>
            </CardContent>
          </Card>

          {/* Información Operativa */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Información Operativa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="caja">Caja *</Label>
                <Select
                  value={formData.caja}
                  onValueChange={(value) => setFormData({ ...formData, caja: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una caja" />
                  </SelectTrigger>
                  <SelectContent>
                    {cajasData?.data?.map((caja) => (
                      <SelectItem key={caja.caja_id} value={caja.caja_id}>
                        {caja.nombre_caja} - {caja.empresa_nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="fecha_gasto">Fecha del Gasto *</Label>
                <Input
                  id="fecha_gasto"
                  type="date"
                  value={formData.fecha_gasto}
                  onChange={(e) => setFormData({ ...formData, fecha_gasto: e.target.value })}
                  max={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
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