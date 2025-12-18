import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// TODO: Migrate to new API service - import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/common/SearchInput";
import { TablePagination } from "@/components/common/TablePagination";
import { KPICard } from "@/components/common/KPICard";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { UsuarioForm } from "@/components/forms/UsuarioForm";
import { useTableFilter } from "@/hooks/useTableFilter";
import { usePagination } from "@/hooks/usePagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Users, Plus, Pencil, UserX, UserCheck, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function UsuariosPage() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [usuarioToToggle, setUsuarioToToggle] = useState<any>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: usuarios, isLoading } = useQuery({
    queryKey: ["usuarios"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ is_active: !isActive })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
      toast.success("Estado del usuario actualizado");
      setDeleteDialogOpen(false);
      setUsuarioToToggle(null);
    },
    onError: (error: any) => {
      toast.error("Error: " + error.message);
    },
  });

  const updateUsuarioMutation = useMutation({
    mutationFn: async (values: any) => {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: values.full_name,
          phone: values.phone,
          role: values.role,
          is_active: values.is_active,
        })
        .eq("id", selectedUsuario.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
      toast.success("Usuario actualizado correctamente");
      setFormOpen(false);
      setSelectedUsuario(null);
    },
    onError: (error: any) => {
      toast.error("Error: " + error.message);
    },
  });

  const { searchTerm, setSearchTerm, filteredData } = useTableFilter({
    data: usuarios || [],
    searchFields: ["full_name", "email", "role"],
  });

  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedData,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination({
    data: filteredData,
    initialPageSize: 10,
  });

  const usuariosActivos = usuarios?.filter((u) => u.is_active).length || 0;
  const usuariosInactivos = usuarios?.filter((u) => !u.is_active).length || 0;

  const getRolBadgeVariant = (rol: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      superadmin: "destructive",
      administrador: "default",
      gerente: "secondary",
      colaborador: "outline",
      contador: "outline",
    };
    return variants[rol] || "outline";
  };

  const getRolLabel = (rol: string) => {
    const labels: Record<string, string> = {
      superadmin: "Super Admin",
      administrador: "Administrador",
      gerente: "Gerente",
      colaborador: "Colaborador",
      contador: "Contador",
    };
    return labels[rol] || rol;
  };

  const handleToggleActive = (usuario: any) => {
    setUsuarioToToggle(usuario);
    setDeleteDialogOpen(true);
  };

  const handleEdit = (usuario: any) => {
    setSelectedUsuario(usuario);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setSelectedUsuario(null);
  };

  const handleSubmitForm = (values: any) => {
    updateUsuarioMutation.mutate(values);
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">Administra los usuarios del sistema</p>
        </div>
        <Button onClick={() => toast.info("Los usuarios deben registrarse en /register")}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard
          title="Total Usuarios"
          value={usuarios?.length || 0}
          icon={Users}
          variant="primary"
        />
        <KPICard
          title="Usuarios Activos"
          value={usuariosActivos}
          icon={UserCheck}
          variant="success"
        />
        <KPICard
          title="Usuarios Inactivos"
          value={usuariosInactivos}
          icon={UserX}
          variant="destructive"
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Lista de Usuarios
              </CardTitle>
              <CardDescription>Total: {usuarios?.length || 0} usuarios registrados</CardDescription>
            </div>
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar por nombre, email..."
              className="w-[300px]"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre Completo</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol del Sistema</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Fecha Registro</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData?.map((usuario) => (
                <TableRow key={usuario.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                        {usuario.full_name?.charAt(0).toUpperCase()}
                      </div>
                      {usuario.full_name}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{usuario.email}</TableCell>
                  <TableCell>
                    <Badge variant={getRolBadgeVariant(usuario.role)}>
                      {getRolLabel(usuario.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>{usuario.phone || "-"}</TableCell>
                  <TableCell>
                    {usuario.created_at
                      ? format(new Date(usuario.created_at), "dd/MM/yyyy", { locale: es })
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={usuario.is_active ? "default" : "secondary"}>
                      {usuario.is_active ? (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Activo
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <XCircle className="h-3 w-3" />
                          Inactivo
                        </div>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(usuario)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleActive(usuario)}
                        title={usuario.is_active ? "Desactivar" : "Activar"}
                      >
                        {usuario.is_active ? (
                          <UserX className="h-4 w-4 text-destructive" />
                        ) : (
                          <UserCheck className="h-4 w-4 text-success" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredData.length > 0 && (
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={totalItems}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </CardContent>
      </Card>

      {filteredData.length === 0 && searchTerm && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Users className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No se encontraron usuarios</h3>
          <p className="text-muted-foreground mt-2 max-w-md">
            No hay usuarios que coincidan con "{searchTerm}"
          </p>
        </div>
      )}

      <UsuarioForm
        open={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmitForm}
        usuario={selectedUsuario}
        isLoading={updateUsuarioMutation.isPending}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {usuarioToToggle?.is_active ? "Desactivar Usuario" : "Activar Usuario"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {usuarioToToggle?.is_active ? (
                <>
                  ¿Estás seguro de desactivar a <strong>{usuarioToToggle?.full_name}</strong>? El
                  usuario no podrá acceder al sistema.
                </>
              ) : (
                <>
                  ¿Estás seguro de activar a <strong>{usuarioToToggle?.full_name}</strong>? El
                  usuario podrá acceder al sistema nuevamente.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                toggleActiveMutation.mutate({
                  id: usuarioToToggle?.id,
                  isActive: usuarioToToggle?.is_active,
                })
              }
            >
              {usuarioToToggle?.is_active ? "Desactivar" : "Activar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
