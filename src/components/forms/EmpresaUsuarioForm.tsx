import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// TODO: Migrate to new API service - import { supabase } from '@/lib/supabase';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const empresaUsuarioSchema = z.object({
  empresa_id: z.string().min(1, 'Selecciona una empresa'),
  usuario_id: z.string().min(1, 'Selecciona un usuario'),
  rol: z.enum(['administrador', 'gerente', 'empleado', 'aprobador', 'contador']),
});

type EmpresaUsuarioFormValues = z.infer<typeof empresaUsuarioSchema>;

interface EmpresaUsuarioFormProps {
  open: boolean;
  onClose: () => void;
  empresaUsuario?: any;
}

export function EmpresaUsuarioForm({ open, onClose, empresaUsuario }: EmpresaUsuarioFormProps) {
  const queryClient = useQueryClient();

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

  const form = useForm<EmpresaUsuarioFormValues>({
    resolver: zodResolver(empresaUsuarioSchema),
    defaultValues: {
      empresa_id: '',
      usuario_id: '',
      rol: 'empleado',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        empresa_id: empresaUsuario?.empresa_id || '',
        usuario_id: empresaUsuario?.usuario_id || '',
        rol: empresaUsuario?.rol || 'empleado',
      });
    }
  }, [empresaUsuario, open, form]);

  const mutation = useMutation({
    mutationFn: async (values: EmpresaUsuarioFormValues) => {
      const data = {
        ...values,
        estado: 'activo',
      };

      if (empresaUsuario?.id) {
        const { error } = await supabase
          .from('empresa_usuarios')
          .update(data)
          .eq('id', empresaUsuario.id);
        if (error) throw error;
      } else {
        // Verificar si la relación ya existe
        const { data: existing } = await supabase
          .from('empresa_usuarios')
          .select('id')
          .eq('empresa_id', values.empresa_id)
          .eq('usuario_id', values.usuario_id)
          .single();

        if (existing) {
          throw new Error('Este usuario ya está asignado a esta empresa');
        }

        const { error } = await supabase.from('empresa_usuarios').insert([data]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empresa-usuarios'] });
      toast.success(
        empresaUsuario?.id ? 'Asignación actualizada' : 'Usuario asignado correctamente'
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {empresaUsuario?.id ? 'Editar Asignación' : 'Asignar Usuario a Empresa'}
          </DialogTitle>
          <DialogDescription>
            Asigna un usuario a una empresa con un rol específico
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-4">
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

            <FormField
              control={form.control}
              name="usuario_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Usuario</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar usuario" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
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

            <FormField
              control={form.control}
              name="rol"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar rol" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="administrador">Administrador</SelectItem>
                      <SelectItem value="gerente">Gerente</SelectItem>
                      <SelectItem value="empleado">Empleado</SelectItem>
                      <SelectItem value="aprobador">Aprobador</SelectItem>
                      <SelectItem value="contador">Contador</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Define el nivel de acceso del usuario en esta empresa
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Guardando...' : empresaUsuario?.id ? 'Actualizar' : 'Asignar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
