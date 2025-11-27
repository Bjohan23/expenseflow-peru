import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
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
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const conceptoGastoSchema = z.object({
  codigo: z.string().min(1, 'El código es requerido'),
  nombre: z.string().min(1, 'El nombre es requerido'),
  descripcion: z.string().optional(),
  categoria: z.enum(['viaticos', 'transporte', 'alimentacion', 'hospedaje', 'otros']),
  requiere_aprobacion: z.boolean(),
  limite_maximo: z.string().optional(),
  centro_costo_id: z.string().optional(),
});

type ConceptoGastoFormValues = z.infer<typeof conceptoGastoSchema>;

interface ConceptoGastoFormProps {
  open: boolean;
  onClose: () => void;
  concepto?: any;
}

export function ConceptoGastoForm({ open, onClose, concepto }: ConceptoGastoFormProps) {
  const queryClient = useQueryClient();

  const { data: centrosCosto } = useQuery({
    queryKey: ['centros-costo'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('centros_costo')
        .select('id, codigo, nombre')
        .eq('estado', 'activo')
        .order('codigo');
      if (error) throw error;
      return data;
    },
  });

  const form = useForm<ConceptoGastoFormValues>({
    resolver: zodResolver(conceptoGastoSchema),
    defaultValues: {
      codigo: '',
      nombre: '',
      descripcion: '',
      categoria: 'otros',
      requiere_aprobacion: false,
      limite_maximo: '',
      centro_costo_id: '',
    },
  });

  // Actualizar form cuando cambia el concepto
  useEffect(() => {
    if (open) {
      form.reset({
        codigo: concepto?.codigo || '',
        nombre: concepto?.nombre || '',
        descripcion: concepto?.descripcion || '',
        categoria: concepto?.categoria || 'otros',
        requiere_aprobacion: concepto?.requiere_aprobacion || false,
        limite_maximo: concepto?.limite_maximo?.toString() || '',
        centro_costo_id: concepto?.centro_costo_id || 'none',
      });
    }
  }, [concepto, open, form]);

  const mutation = useMutation({
    mutationFn: async (values: ConceptoGastoFormValues) => {
      const data = {
        ...values,
        limite_maximo: values.limite_maximo ? parseFloat(values.limite_maximo) : null,
        centro_costo_id: values.centro_costo_id === 'none' || !values.centro_costo_id ? null : values.centro_costo_id,
        estado: 'activo',
      };

      if (concepto?.id) {
        const { error } = await supabase
          .from('conceptos_gasto')
          .update(data)
          .eq('id', concepto.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('conceptos_gasto').insert([data]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conceptos-gasto'] });
      toast.success(concepto?.id ? 'Concepto actualizado' : 'Concepto creado');
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
            {concepto?.id ? 'Editar Concepto de Gasto' : 'Nuevo Concepto de Gasto'}
          </DialogTitle>
          <DialogDescription>
            Define un concepto de gasto para categorizar gastos
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
                      <Input placeholder="VIA-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="viaticos">Viáticos</SelectItem>
                        <SelectItem value="transporte">Transporte</SelectItem>
                        <SelectItem value="alimentacion">Alimentación</SelectItem>
                        <SelectItem value="hospedaje">Hospedaje</SelectItem>
                        <SelectItem value="otros">Otros</SelectItem>
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
                    <Input placeholder="Viáticos Nacionales" {...field} />
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
                    <Textarea placeholder="Descripción del concepto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="limite_maximo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Límite Máximo (opcional)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="1000.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="centro_costo_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Centro de Costo (opcional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Ninguno" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Ninguno</SelectItem>
                        {centrosCosto?.map((cc) => (
                          <SelectItem key={cc.id} value={cc.id}>
                            {cc.codigo} - {cc.nombre}
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
              name="requiere_aprobacion"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Requiere Aprobación</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Los gastos de este concepto necesitarán aprobación
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Guardando...' : concepto?.id ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
