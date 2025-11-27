import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { EmpresaUsuarioForm } from '@/components/forms/EmpresaUsuarioForm';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';

export default function EmpresaUsuarios() {
  const [formOpen, setFormOpen] = useState(false);
  const [selectedEmpresaUsuario, setSelectedEmpresaUsuario] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [empresaUsuarioToDelete, setEmpresaUsuarioToDelete] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: empresaUsuarios, isLoading } = useQuery({
    queryKey: ['empresa-usuarios'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('empresa_usuarios')
        .select(`
          *,
          empresa:empresas(razon_social, nombre_comercial),
          usuario:profiles(full_name, email)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('empresa_usuarios')
        .update({ estado: 'inactivo' })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empresa-usuarios'] });
      toast.success('Asignación eliminada correctamente');
      setDeleteDialogOpen(false);
      setEmpresaUsuarioToDelete(null);
    },
    onError: (error: any) => {
      toast.error('Error al eliminar: ' + error.message);
    },
  });

  const handleEdit = (empresaUsuario: any) => {
    setSelectedEmpresaUsuario(empresaUsuario);
    setFormOpen(true);
  };

  const handleDelete = (empresaUsuario: any) => {
    setEmpresaUsuarioToDelete(empresaUsuario);
    setDeleteDialogOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setSelectedEmpresaUsuario(null);
  };

  const getRolBadgeVariant = (rol: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      administrador: 'destructive',
      gerente: 'default',
      aprobador: 'secondary',
      contador: 'outline',
      empleado: 'outline',
    };
    return variants[rol] || 'outline';
  };

  const getRolLabel = (rol: string) => {
    const labels: Record<string, string> = {
      administrador: 'Administrador',
      gerente: 'Gerente',
      aprobador: 'Aprobador',
      contador: 'Contador',
      empleado: 'Empleado',
    };
    return labels[rol] || rol;
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usuarios por Empresa</h1>
          <p className="text-muted-foreground">
            Gestiona el acceso de usuarios a diferentes empresas
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Asignar Usuario
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Asignaciones Activas
          </CardTitle>
          <CardDescription>
            {empresaUsuarios?.filter(eu => eu.estado === 'activo').length || 0} asignaciones activas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {empresaUsuarios?.map((eu) => (
                <TableRow key={eu.id}>
                  <TableCell className="font-medium">
                    {eu.empresa?.nombre_comercial || eu.empresa?.razon_social}
                  </TableCell>
                  <TableCell>{eu.usuario?.full_name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {eu.usuario?.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRolBadgeVariant(eu.rol)}>
                      {getRolLabel(eu.rol)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={eu.estado === 'activo' ? 'default' : 'secondary'}>
                      {eu.estado === 'activo' ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(eu)}
                        disabled={eu.estado !== 'activo'}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(eu)}
                        disabled={eu.estado !== 'activo'}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <EmpresaUsuarioForm
        open={formOpen}
        onClose={handleCloseForm}
        empresaUsuario={selectedEmpresaUsuario}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el acceso de{' '}
              <strong>{empresaUsuarioToDelete?.usuario?.full_name}</strong> a{' '}
              <strong>
                {empresaUsuarioToDelete?.empresa?.nombre_comercial ||
                  empresaUsuarioToDelete?.empresa?.razon_social}
              </strong>
              . El registro se marcará como inactivo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(empresaUsuarioToDelete?.id)}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
