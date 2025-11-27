import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ImageUpload } from "@/components/common/ImageUpload";

const empresaSchema = z.object({
  ruc: z.string().min(11, "El RUC debe tener 11 dígitos").max(11),
  razon_social: z.string().min(1, "La razón social es requerida"),
  nombre_comercial: z.string().optional(),
  direccion: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  moneda: z.enum(["PEN", "USD"]),
  limite_gasto_mensual: z.string().optional(),
  logo_url: z.string().optional(),
});

type EmpresaFormValues = z.infer<typeof empresaSchema>;

interface EmpresaFormProps {
  open: boolean;
  onClose: () => void;
  empresa?: any;
}

export function EmpresaForm({ open, onClose, empresa }: EmpresaFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<EmpresaFormValues>({
    resolver: zodResolver(empresaSchema),
    defaultValues: {
      ruc: "",
      razon_social: "",
      nombre_comercial: "",
      direccion: "",
      telefono: "",
      email: "",
      moneda: "PEN",
      limite_gasto_mensual: "",
      logo_url: "",
    },
  });

  // Actualizar form cuando cambia la empresa
  useEffect(() => {
    if (open) {
      form.reset({
        ruc: empresa?.ruc || "",
        razon_social: empresa?.razon_social || "",
        nombre_comercial: empresa?.nombre_comercial || "",
        direccion: empresa?.direccion || "",
        telefono: empresa?.telefono || "",
        email: empresa?.email || "",
        moneda: empresa?.moneda || "PEN",
        limite_gasto_mensual: empresa?.limite_gasto_mensual?.toString() || "",
        logo_url: empresa?.logo_url || "",
      });
    }
  }, [empresa, open, form]);

  const mutation = useMutation({
    mutationFn: async (values: EmpresaFormValues) => {
      const data = {
        ...values,
        limite_gasto_mensual: values.limite_gasto_mensual
          ? parseFloat(values.limite_gasto_mensual)
          : null,
        estado: "activo",
      };

      if (empresa?.id) {
        const { error } = await supabase.from("empresas").update(data).eq("id", empresa.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("empresas").insert([data]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["empresas"] });
      toast.success(
        empresa?.id ? "Empresa actualizada correctamente" : "Empresa creada correctamente"
      );
      onClose();
      form.reset();
    },
    onError: (error: any) => {
      toast.error("Error al guardar la empresa: " + error.message);
    },
  });

  const onSubmit = (values: EmpresaFormValues) => {
    mutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{empresa?.id ? "Editar Empresa" : "Nueva Empresa"}</DialogTitle>
          <DialogDescription>
            {empresa?.id
              ? "Actualiza la información de la empresa"
              : "Completa los datos para registrar una nueva empresa"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ruc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RUC</FormLabel>
                    <FormControl>
                      <Input placeholder="20123456789" {...field} maxLength={11} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="moneda"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Moneda</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar moneda" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PEN">PEN - Soles</SelectItem>
                        <SelectItem value="USD">USD - Dólares</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="razon_social"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Razón Social</FormLabel>
                  <FormControl>
                    <Input placeholder="EMPRESA SAC" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nombre_comercial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Comercial (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Mi Empresa" {...field} />
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
                  <FormLabel>Dirección (opcional)</FormLabel>
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (opcional)</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="empresa@ejemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="logo_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo de la Empresa (opcional)</FormLabel>
                  <FormControl>
                    <ImageUpload
                      currentImageUrl={field.value}
                      onImageUploaded={(url) => field.onChange(url)}
                      onImageRemoved={() => field.onChange("")}
                      bucket="company-logos"
                      folder={empresa?.ruc || "temp"}
                      maxSizeMB={5}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="limite_gasto_mensual"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Límite de Gasto Mensual (opcional)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="50000.00" {...field} />
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
                {mutation.isPending ? "Guardando..." : empresa?.id ? "Actualizar" : "Crear"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
