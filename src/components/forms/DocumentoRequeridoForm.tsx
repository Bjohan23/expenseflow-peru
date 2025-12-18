import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
// TODO: Migrate to new API service - import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const documentoSchema = z.object({
  nombre_documento: z.string().min(1, "El nombre es requerido"),
  descripcion: z.string().optional(),
  tipo_documento: z.enum(["factura", "boleta", "recibo", "comprobante", "ticket", "otro"]),
  es_obligatorio: z.boolean(),
  orden: z.string().optional(),
});

type DocumentoFormValues = z.infer<typeof documentoSchema>;

interface DocumentoRequeridoFormProps {
  open: boolean;
  onClose: () => void;
  conceptoGastoId: string;
  documento?: any;
}

export function DocumentoRequeridoForm({
  open,
  onClose,
  conceptoGastoId,
  documento,
}: DocumentoRequeridoFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<DocumentoFormValues>({
    resolver: zodResolver(documentoSchema),
    defaultValues: {
      nombre_documento: "",
      descripcion: "",
      tipo_documento: "otro",
      es_obligatorio: true,
      orden: "0",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        nombre_documento: documento?.nombre_documento || "",
        descripcion: documento?.descripcion || "",
        tipo_documento: documento?.tipo_documento || "otro",
        es_obligatorio: documento?.es_obligatorio ?? true,
        orden: documento?.orden?.toString() || "0",
      });
    }
  }, [documento, open, form]);

  const mutation = useMutation({
    mutationFn: async (values: DocumentoFormValues) => {
      const data = {
        nombre_documento: values.nombre_documento,
        descripcion: values.descripcion || null,
        tipo_documento: values.tipo_documento,
        es_obligatorio: values.es_obligatorio,
        concepto_gasto_id: conceptoGastoId,
        orden: values.orden ? parseInt(values.orden) : 0,
        estado: "activo",
      };

      if (documento?.id) {
        const { error } = await supabase
          .from("concepto_documentos_requeridos")
          .update(data)
          .eq("id", documento.id);
        if (error) throw error;
      } else {
        // NO enviar el campo 'id', Supabase lo genera automáticamente
        const { error } = await supabase.from("concepto_documentos_requeridos").insert([data]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["concepto-documentos", conceptoGastoId] });
      toast.success(
        documento?.id ? "Documento actualizado correctamente" : "Documento agregado correctamente"
      );
      onClose();
      form.reset();
    },
    onError: (error: any) => {
      toast.error("Error al guardar: " + error.message);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {documento?.id ? "Editar Documento Requerido" : "Nuevo Documento Requerido"}
          </DialogTitle>
          <DialogDescription>
            Define qué documentos deben presentarse para este concepto de gasto
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="nombre_documento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Documento</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Factura Electrónica" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tipo_documento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Documento</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="factura">Factura</SelectItem>
                      <SelectItem value="boleta">Boleta</SelectItem>
                      <SelectItem value="recibo">Recibo</SelectItem>
                      <SelectItem value="comprobante">Comprobante</SelectItem>
                      <SelectItem value="ticket">Ticket</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
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
                    <Textarea
                      placeholder="Descripción del documento y requisitos específicos"
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="orden"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Orden</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" placeholder="0" {...field} />
                    </FormControl>
                    <FormDescription>Posición en la lista</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="es_obligatorio"
                render={({ field }) => (
                  <FormItem className="flex flex-col justify-between">
                    <FormLabel>¿Es Obligatorio?</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Guardando..." : documento?.id ? "Actualizar" : "Crear"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
