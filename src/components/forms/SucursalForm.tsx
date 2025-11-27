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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const sucursalSchema = z.object({
  codigo: z.string().min(1, 'El código es requerido'),
  nombre: z.string().min(1, 'El nombre es requerido'),
  empresa_id: z.string().min(1, 'Selecciona una empresa'),
  direccion: z.string().min(1, 'La dirección es requerida'),
  ciudad: z.string().min(1, 'La ciudad es requerida'),
  region: z.string().min(1, 'La región es requerida'),
  telefono: z.string().optional(),
  responsable_id: z.string().optional(),
});

type SucursalFormValues = z.infer<typeof sucursalSchema>;

interface SucursalFormProps {
  open: boolean;
  onClose: () => void;
  sucursal?: any;
}

export function SucursalForm({ open, onClose, sucursal }: SucursalFormProps) {
  const queryClient = useQueryClient();

  // Fetch empresas para el selector
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

  // Fetch usuarios activos para el selector de responsable
  const { data: usuarios } = useQuery({
    queryKey: ['profiles-activos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('is_active', true)
        .order('full_name');
      if (error) throw error;
      return data;
    },
  });

  const form = useForm<SucursalFormValues>({
    resolver: zodResolver(sucursalSchema),
    defaultValues: {
      codigo: '',
      nombre: '',
      empresa_id: '',
      direccion: '',
      ciudad: '',
      region: '',
      telefono: '',
      responsable_id: '',
    },
  });

  // Actualizar form cuando cambia la sucursal
  useEffect(() => {
    if (open) {
      form.reset({
        codigo: sucursal?.codigo || '',
        nombre: sucursal?.nombre || '',
        empresa_id: sucursal?.empresa_id || '',
        direccion: sucursal?.direccion || '',
        ciudad: sucursal?.ciudad || '',
        region: sucursal?.region || '',
        telefono: sucursal?.telefono || '',
        responsable_id: sucursal?.responsable_id || 'none',
      });
    }
  }, [sucursal, open, form]);

  const mutation = useMutation({
    mutationFn: async (values: SucursalFormValues) => {
      const data = {
        ...values,
        responsable_id: values.responsable_id === 'none' || !values.responsable_id ? null : values.responsable_id,
        estado: 'activa',
      };

      if (sucursal?.id) {
        const { error } = await supabase
          .from('sucursales')
          .update(data)
          .eq('id', sucursal.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('sucursales').insert([data]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sucursales'] });
      toast.success(
        sucursal?.id ? 'Sucursal actualizada correctamente' : 'Sucursal creada correctamente'
      );
      onClose();
      form.reset();
    },
    onError: (error: any) => {
      toast.error('Error al guardar la sucursal: ' + error.message);
    },
  });

  const onSubmit = (values: SucursalFormValues) => {
    mutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {sucursal?.id ? 'Editar Sucursal' : 'Nueva Sucursal'}
          </DialogTitle>
          <DialogDescription>
            {sucursal?.id
              ? 'Actualiza la información de la sucursal'
              : 'Completa los datos para registrar una nueva sucursal'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="codigo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código</FormLabel>
                    <FormControl>
                      <Input placeholder="SUC-001" {...field} />
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
                          <SelectValue placeholder="Seleccionar empresa" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {empresas?.map((empresa) => (
                          <SelectItem key={empresa.id} value={empresa.id}>
                            {empresa.nombre_comercial || empresa.razon_social}
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
                    <Input placeholder="Sede Central" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="direccion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección</FormLabel>
                  <FormControl>
                    <Input placeholder="Av. Principal 123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ciudad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ciudad</FormLabel>
                    <FormControl>
                      <Input placeholder="Lima" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Región</FormLabel>
                    <FormControl>
                      <Input placeholder="Lima" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="telefono"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="01-1234567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="responsable_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Responsable (opcional)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar responsable" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Sin responsable</SelectItem>
                      {usuarios?.map((usuario) => (
                        <SelectItem key={usuario.id} value={usuario.id}>
                          {usuario.full_name} ({usuario.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Guardando...' : sucursal?.id ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
