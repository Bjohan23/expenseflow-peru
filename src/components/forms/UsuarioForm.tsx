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
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

const usuarioSchema = z.object({
  full_name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  role: z.enum(["superadmin", "administrador", "gerente", "colaborador", "contador"]),
  is_active: z.boolean(),
});

type UsuarioFormValues = z.infer<typeof usuarioSchema>;

interface UsuarioFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: UsuarioFormValues) => void;
  usuario?: any;
  isLoading?: boolean;
}

export function UsuarioForm({ open, onClose, onSubmit, usuario, isLoading }: UsuarioFormProps) {
  const isEditing = !!usuario?.id;

  const form = useForm<UsuarioFormValues>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      role: "colaborador",
      is_active: true,
    },
  });

  useEffect(() => {
    if (open && usuario) {
      form.reset({
        full_name: usuario.full_name || "",
        email: usuario.email || "",
        phone: usuario.phone || "",
        role: usuario.role || "colaborador",
        is_active: usuario.is_active ?? true,
      });
    } else if (open && !usuario) {
      form.reset({
        full_name: "",
        email: "",
        phone: "",
        role: "colaborador",
        is_active: true,
      });
    }
  }, [usuario, open, form]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Usuario" : "Nuevo Usuario"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Actualiza la información del usuario"
              : "Los usuarios nuevos deben registrarse desde /register. Aquí solo puedes editar usuarios existentes."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Juan Pérez" {...field} />
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="juan@empresa.com"
                      {...field}
                      disabled={isEditing}
                    />
                  </FormControl>
                  {isEditing && (
                    <FormDescription>El email no se puede cambiar una vez creado</FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="999888777" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol del Sistema</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar rol" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="superadmin">Super Admin</SelectItem>
                      <SelectItem value="administrador">Administrador</SelectItem>
                      <SelectItem value="gerente">Gerente</SelectItem>
                      <SelectItem value="colaborador">Colaborador</SelectItem>
                      <SelectItem value="contador">Contador</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Define el nivel de acceso del usuario en el sistema
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Usuario Activo</FormLabel>
                    <FormDescription>
                      Los usuarios inactivos no pueden iniciar sesión
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Guardando..." : isEditing ? "Actualizar" : "Crear"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
