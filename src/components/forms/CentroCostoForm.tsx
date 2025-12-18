import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// TODO: Migrate to new API service - import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/format';
import { AlertCircle, TrendingUp } from 'lucide-react';

const centroCostoSchema = z.object({
  codigo: z.string().min(1, 'El código es requerido'),
  nombre: z.string().min(1, 'El nombre es requerido'),
  descripcion: z.string().optional(),
  empresa_id: z.string().min(1, 'Selecciona una empresa'),
  presupuesto_asignado: z.string().min(1, 'El presupuesto es requerido'),
});

type CentroCostoFormValues = z.infer<typeof centroCostoSchema>;

interface CentroCostoFormProps {
  open: boolean;
  onClose: () => void;
  centroCosto?: any;
}

export function CentroCostoForm({ open, onClose, centroCosto }: CentroCostoFormProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: empresas } = useQuery({
    queryKey: ['empresas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('empresas')
        .select('id, razon_social, nombre_comercial')
        .eq('estado', 'activo')
        .order('razon_social');
      if (error) throw error;
      return data;
    },
  });

  const form = useForm<CentroCostoFormValues>({
    resolver: zodResolver(centroCostoSchema),
    defaultValues: {
      codigo: '',
      nombre: '',
      descripcion: '',
      empresa_id: '',
      presupuesto_asignado: '',
    },
  });

  // Actualizar form cuando cambia el centro de costo
  useEffect(() => {
    if (open) {
      form.reset({
        codigo: centroCosto?.codigo || '',
        nombre: centroCosto?.nombre || '',
        descripcion: centroCosto?.descripcion || '',
        empresa_id: centroCosto?.empresa_id || '',
        presupuesto_asignado: centroCosto?.presupuesto_asignado?.toString() || '',
      });
    }
  }, [centroCosto, open, form]);

  // Calcular métricas del presupuesto
  const presupuestoAsignadoValue = form.watch('presupuesto_asignado');
  const presupuestoAsignado = parseFloat(presupuestoAsignadoValue) || 0;
  const presupuestoConsumido = parseFloat(centroCosto?.presupuesto_consumido || 0);
  const presupuestoDisponible = presupuestoAsignado - presupuestoConsumido;
  const porcentajeConsumido = presupuestoAsignado > 0 ? (presupuestoConsumido / presupuestoAsignado) * 100 : 0;
  const tieneFondosInsuficientes = presupuestoAsignado < presupuestoConsumido;

  const mutation = useMutation({
    mutationFn: async (values: CentroCostoFormValues) => {
      const nuevoPresupuesto = parseFloat(values.presupuesto_asignado);
      const presupuestoConsumidoActual = parseFloat(centroCosto?.presupuesto_consumido || 0);

      // Validar que el nuevo presupuesto no sea menor al consumido
      if (centroCosto?.id && nuevoPresupuesto < presupuestoConsumidoActual) {
        throw new Error(
          `El presupuesto no puede ser menor al ya consumido (${formatCurrency(presupuestoConsumidoActual)})`
        );
      }

      const data = {
        ...values,
        presupuesto_asignado: nuevoPresupuesto,
        presupuesto_consumido: centroCosto?.presupuesto_consumido || 0,
        responsable_id: user?.id,
        estado: 'activo',
      };

      if (centroCosto?.id) {
        const { error } = await supabase
          .from('centros_costo')
          .update(data)
          .eq('id', centroCosto.id);
        if (error) throw error;

        // Registrar en auditoría si se modificó el presupuesto
        if (centroCosto.presupuesto_asignado !== nuevoPresupuesto) {
          await supabase.from('auditoria').insert([{
            tabla: 'centros_costo',
            registro_id: centroCosto.id,
            accion: 'editar',
            usuario_id: user?.id,
            datos_anteriores: {
              presupuesto_asignado: centroCosto.presupuesto_asignado,
            },
            datos_nuevos: {
              presupuesto_asignado: nuevoPresupuesto,
            },
            comentario: `Presupuesto modificado de ${formatCurrency(centroCosto.presupuesto_asignado)} a ${formatCurrency(nuevoPresupuesto)}`,
          }]);
        }
      } else {
        const { error } = await supabase.from('centros_costo').insert([data]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['centros-costo'] });
      toast.success(
        centroCosto?.id ? 'Centro de costo actualizado' : 'Centro de costo creado'
      );
      onClose();
      form.reset();
    },
    onError: (error: any) => {
      toast.error('Error: ' + error.message);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {centroCosto?.id ? 'Editar Centro de Costo' : 'Nuevo Centro de Costo'}
          </DialogTitle>
          <DialogDescription>
            Completa los datos del centro de costo
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="codigo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código</FormLabel>
                    <FormControl>
                      <Input placeholder="CC-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="empresa_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Empresa</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {empresas?.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.nombre_comercial || emp.razon_social}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Administración" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción (opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descripción del centro de costo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Mostrar estado del presupuesto si está editando */}
            {centroCosto?.id && presupuestoConsumido > 0 && (
              <div className="rounded-lg border p-4 space-y-3 bg-muted/50">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-sm">Estado del Presupuesto</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Presupuesto Original:</span>
                    <span className="font-medium">{formatCurrency(centroCosto.presupuesto_asignado)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Presupuesto Consumido:</span>
                    <span className="font-semibold text-destructive">{formatCurrency(presupuestoConsumido)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-muted-foreground">Nuevo Disponible:</span>
                    <span className={`font-semibold ${presupuestoDisponible < 0 ? 'text-destructive' : 'text-green-600'}`}>
                      {formatCurrency(presupuestoDisponible)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">% Consumido:</span>
                    <span className={`font-semibold ${
                      porcentajeConsumido > 90 ? 'text-destructive' :
                      porcentajeConsumido > 70 ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {porcentajeConsumido.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="presupuesto_asignado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Presupuesto Asignado</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="10000.00" {...field} />
                  </FormControl>
                  <FormDescription>
                    {centroCosto?.id && presupuestoConsumido > 0
                      ? `Mínimo permitido: ${formatCurrency(presupuestoConsumido)} (consumido)`
                      : 'Ingresa el presupuesto total asignado a este centro de costo'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Alerta si el presupuesto es insuficiente */}
            {tieneFondosInsuficientes && presupuestoAsignadoValue && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  El presupuesto asignado no puede ser menor al ya consumido ({formatCurrency(presupuestoConsumido)}).
                  Debes asignar al menos {formatCurrency(presupuestoConsumido)} para cubrir los gastos existentes.
                </AlertDescription>
              </Alert>
            )}

            {/* Alerta si el presupuesto está cerca del límite */}
            {!tieneFondosInsuficientes && porcentajeConsumido > 80 && porcentajeConsumido <= 100 && presupuestoAsignadoValue && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  El centro de costo ha consumido más del {porcentajeConsumido.toFixed(0)}% del presupuesto.
                  Solo quedan {formatCurrency(presupuestoDisponible)} disponibles.
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending || tieneFondosInsuficientes}
              >
                {mutation.isPending ? 'Guardando...' : centroCosto?.id ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
