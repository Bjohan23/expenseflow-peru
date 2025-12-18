import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";
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

const empresaSchema = z.object({
  nro_ruc: z.string().min(11, "El RUC debe tener 11 dígitos").max(11),
  razon_social: z.string().min(1, "La razón social es requerida"),
  direccion: z.string().min(1, "La dirección es requerida"),
  acronimo: z.string().min(1, "El acrónimo es requerido"),
  avatar: z.string().optional(),
});

type EmpresaFormValues = z.infer<typeof empresaSchema>;

interface EmpresaFormProps {
  open: boolean;
  onClose: () => void;
  empresa?: any;
  onSubmit?: (data: EmpresaFormValues) => void;
  isLoading?: boolean;
}

export function EmpresaForm({ open, onClose, empresa, onSubmit, isLoading = false }: EmpresaFormProps) {
  const form = useForm<EmpresaFormValues>({
    resolver: zodResolver(empresaSchema),
    defaultValues: {
      nro_ruc: "",
      razon_social: "",
      direccion: "",
      acronimo: "",
      avatar: "",
    },
  });

  // Actualizar form cuando cambia la empresa
  useEffect(() => {
    if (open) {
      form.reset({
        nro_ruc: empresa?.ruc || "",
        razon_social: empresa?.nombre || "",
        direccion: empresa?.direccion || "",
        acronimo: empresa?.acronimo || "",
        avatar: empresa?.avatar || "",
      });
    }
  }, [empresa, open, form]);

  const handleSubmit = (values: EmpresaFormValues) => {
    if (onSubmit) {
      onSubmit(values);
    }
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
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nro_ruc"
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
                name="acronimo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Acrónimo</FormLabel>
                    <FormControl>
                      <Input placeholder="EMP" {...field} />
                    </FormControl>
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

            <FormField
              control={form.control}
              name="avatar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avatar (URL opcional)</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://ejemplo.com/logo.png"
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
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Guardando..." : empresa?.id ? "Actualizar" : "Crear"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
