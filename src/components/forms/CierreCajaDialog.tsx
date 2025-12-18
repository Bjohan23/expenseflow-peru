import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/format';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const cierreSchema = z.object({
  saldo_fisico: z.string().min(1, 'El saldo físico es requerido'),
  comentario: z.string().optional(),
});

type CierreFormValues = z.infer<typeof cierreSchema>;

interface CierreCajaDialogProps {
  open: boolean;
  onClose: () => void;
  caja: any;
}

export function CierreCajaDialog({ open, onClose, caja }: CierreCajaDialogProps) {
  const queryClient = useQueryClient();

  const form = useForm<CierreFormValues>({
    resolver: zodResolver(cierreSchema),
    defaultValues: {
      saldo_fisico: caja?.saldo_actual?.toString() || '',
      comentario: '',
    },
  });

  const saldoFisicoValue = form.watch('saldo_fisico');
  const saldoFisico = parseFloat(saldoFisicoValue) || 0;
  const saldoTeorico = parseFloat(caja?.saldo_actual || 0);
  const diferencia = saldoFisico - saldoTeorico;

  const mutation = useMutation({
    mutationFn: async (values: CierreFormValues) => {
      const saldoFisico = parseFloat(values.saldo_fisico);

      // Actualizar la caja con el estado cerrado
      const { error } = await supabase
        .from('cajas')
        .update({
          estado: 'cerrada',
          fecha_cierre: new Date().toISOString(),
          saldo_actual: saldoFisico, // Actualizar con el saldo físico real
          updated_at: new Date().toISOString(),
        })
        .eq('id', caja.id);

      if (error) throw error;

      // Registrar en auditoría
      await supabase.from('auditoria').insert([{
        tabla: 'cajas',
        registro_id: caja.id,
        accion: 'editar',
        usuario_id: (await supabase.auth.getUser()).data.user?.id,
        datos_anteriores: {
          estado: caja.estado,
          saldo_actual: caja.saldo_actual,
        },
        datos_nuevos: {
          estado: 'cerrada',
          saldo_actual: saldoFisico,
          fecha_cierre: new Date().toISOString(),
        },
        comentario: `Cierre de caja. ${values.comentario ? `Observación: ${values.comentario}` : ''}${
          diferencia !== 0 ? ` Diferencia: ${formatCurrency(diferencia)}` : ''
        }`,
      }]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cajas'] });
      toast.success('Caja cerrada exitosamente');
      onClose();
      form.reset();
    },
    onError: (error: any) => {
      toast.error('Error al cerrar la caja: ' + error.message);
    },
  });

  if (!caja) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Cerrar Caja Chica</DialogTitle>
          <DialogDescription>
            Realiza el arqueo de caja y cierra el período
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Información de la caja */}
          <div className="rounded-lg border p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Código:</span>
              <span className="font-medium">{caja.codigo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Nombre:</span>
              <span className="font-medium">{caja.nombre}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Saldo Inicial:</span>
              <span className="font-medium">{formatCurrency(caja.saldo_inicial)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Saldo Teórico:</span>
              <span className="font-semibold text-lg">{formatCurrency(saldoTeorico)}</span>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-4">
              <FormField
                control={form.control}
                name="saldo_fisico"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Saldo Físico (Conteo Real)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Ingresa el saldo contado físicamente en la caja
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Mostrar diferencia */}
              {saldoFisicoValue && (
                <div className={`rounded-lg border p-4 ${
                  diferencia === 0 ? 'bg-green-50 border-green-200' :
                  Math.abs(diferencia) > 0 && Math.abs(diferencia) <= 10 ? 'bg-yellow-50 border-yellow-200' :
                  'bg-red-50 border-red-200'
                }`}>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Diferencia:</span>
                    <span className={`text-xl font-bold ${
                      diferencia === 0 ? 'text-green-700' :
                      diferencia > 0 ? 'text-blue-700' :
                      'text-red-700'
                    }`}>
                      {diferencia > 0 ? '+' : ''}{formatCurrency(diferencia)}
                    </span>
                  </div>
                  {diferencia !== 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {diferencia > 0 ? 'Sobrante en caja' : 'Faltante en caja'}
                    </p>
                  )}
                </div>
              )}

              {Math.abs(diferencia) > 10 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    La diferencia supera los S/ 10.00. Por favor verifica el conteo y agrega un comentario explicando la diferencia.
                  </AlertDescription>
                </Alert>
              )}

              <FormField
                control={form.control}
                name="comentario"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Comentarios {Math.abs(diferencia) > 10 && <span className="text-red-500">*</span>}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Agrega observaciones sobre el cierre o explica diferencias encontradas..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={mutation.isPending || (Math.abs(diferencia) > 10 && !form.watch('comentario'))}
                  variant={diferencia === 0 ? 'default' : 'destructive'}
                >
                  {mutation.isPending ? 'Cerrando...' : 'Confirmar Cierre'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
