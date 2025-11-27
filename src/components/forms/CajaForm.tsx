import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
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

const cajaSchema = z.object({
  codigo: z.string().min(1, 'El código es requerido'),
  nombre: z.string().min(1, 'El nombre es requerido'),
  sucursal_id: z.string().min(1, 'Selecciona una sucursal'),
  saldo_inicial: z.string().min(1, 'El saldo inicial es requerido'),
});

type CajaFormValues = z.infer<typeof cajaSchema>;

interface CajaFormProps {
  open: boolean;
  onClose: () => void;
  caja?: any;
}

export function CajaForm({ open, onClose, caja }: CajaFormProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: sucursales } = useQuery({
    queryKey: ['sucursales'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sucursales')
        .select('id, codigo, nombre')
        .eq('estado', 'activa')
        .order('codigo');
      if (error) throw error;
      return data;
    },
  });

  const form = useForm<CajaFormValues>({
    resolver: zodResolver(cajaSchema),
    defaultValues: {
      codigo: caja?.codigo || '',
      nombre: caja?.nombre || '',
      sucursal_id: caja?.sucursal_id || '',
      saldo_inicial: caja?.saldo_inicial?.toString() || '',
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: CajaFormValues) => {
      const saldoInicial = parseFloat(values.saldo_inicial);
      const data = {
        ...values,
        saldo_inicial: saldoInicial,
        saldo_actual: caja?.saldo_actual ?? saldoInicial,
        responsable_id: user?.id,
        estado: 'abierta',
        fecha_apertura: caja?.fecha_apertura || new Date().toISOString(),
      };

      if (caja?.id) {
        const { error } = await supabase
          .from('cajas')
          .update(data)
          .eq('id', caja.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('cajas').insert([data]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cajas'] });
      toast.success(caja?.id ? 'Caja actualizada' : 'Caja creada');
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
            {caja?.id ? 'Editar Caja' : 'Nueva Caja Chica'}
          </DialogTitle>
          <DialogDescription>
            Configura una caja chica para gestionar gastos menores
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-4">
            <FormField
              control={form.control}
              name="codigo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código</FormLabel>
                  <FormControl>
                    <Input placeholder="CJ-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Caja Chica Sede Central" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sucursal_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sucursal</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar sucursal" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sucursales?.map((suc) => (
                        <SelectItem key={suc.id} value={suc.id}>
                          {suc.codigo} - {suc.nombre}
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
              name="saldo_inicial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Saldo Inicial</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="1000.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Guardando...' : caja?.id ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
