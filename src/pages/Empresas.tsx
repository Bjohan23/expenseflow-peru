import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, Plus, Pencil, DollarSign, CheckCircle, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { treasuryService } from "@/services/treasury.service";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { StatusBadge } from "@/components/common/StatusBadge";
import { SearchInput } from "@/components/common/SearchInput";
import { TablePagination } from "@/components/common/TablePagination";
import { KPICard } from "@/components/common/KPICard";
import { EmpresaForm } from "@/components/forms/EmpresaForm";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Empresas() {
  const [formOpen, setFormOpen] = useState(false);
  const [selectedEmpresa, setSelectedEmpresa] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: empresas, isLoading } = useQuery({
    queryKey: ["empresas"],
    queryFn: () => treasuryService.getEmpresas(),
  });

  // CREATE mutation
  const createEmpresaMutation = useMutation({
    mutationFn: (data: any) => treasuryService.createEmpresa(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["empresas"] });
      setFormOpen(false);
      setSelectedEmpresa(null);
      toast.success("Empresa creada exitosamente");
    },
    onError: (error: any) => {
      console.error("Error creating empresa:", error);
      if (error.response?.status === 403) {
        toast.error("No tienes permisos para crear empresas");
      } else {
        toast.error("Error al crear la empresa");
      }
    },
  });

  // UPDATE mutation
  const updateEmpresaMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      treasuryService.updateEmpresa(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["empresas"] });
      setFormOpen(false);
      setSelectedEmpresa(null);
      toast.success("Empresa actualizada exitosamente");
    },
    onError: (error: any) => {
      console.error("Error updating empresa:", error);
      if (error.response?.status === 403) {
        toast.error("No tienes permisos para actualizar empresas");
      } else {
        toast.error("Error al actualizar la empresa");
      }
    },
  });

  // DELETE mutation
  const deleteEmpresaMutation = useMutation({
    mutationFn: (id: string) => treasuryService.deleteEmpresa(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["empresas"] });
      toast.success("Empresa eliminada exitosamente");
    },
    onError: (error: any) => {
      console.error("Error deleting empresa:", error);
      if (error.response?.status === 403) {
        toast.error("No tienes permisos para eliminar empresas");
      } else {
        toast.error("Error al eliminar la empresa");
      }
    },
  });

  // Handle form submission
  const handleSubmit = (data: any) => {
    if (selectedEmpresa) {
      // Update existing empresa
      updateEmpresaMutation.mutate({ id: selectedEmpresa.id, data });
    } else {
      // Create new empresa
      createEmpresaMutation.mutate(data);
    }
  };

  // Handle delete
  const handleDelete = (id: string) => {
    deleteEmpresaMutation.mutate(id);
  };

  const { searchTerm, setSearchTerm, filteredData } = useTableFilter({
    data: empresas || [],
    searchFields: ["ruc", "nombre", "acronimo"],
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

  // Calcular KPIs
  const empresasActivas = empresas?.filter((e) => e.estado === 1).length || 0;
  const empresasInactivas = empresas?.filter((e) => e.estado !== 1).length || 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Empresas</h1>
          <p className="text-muted-foreground mt-2">Gestión de empresas del sistema</p>
        </div>
        <LoadingSkeleton type="table" count={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Empresas</h1>
          <p className="text-muted-foreground mt-2">Gestión de empresas del sistema</p>
        </div>
        <Button
          onClick={() => {
            setSelectedEmpresa(null);
            setFormOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Empresa
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard
          title="Total Empresas"
          value={empresas?.length || 0}
          icon={Building2}
          variant="primary"
        />
        <KPICard
          title="Empresas Activas"
          value={empresasActivas}
          icon={CheckCircle}
          variant="success"
        />
        <KPICard
          title="Empresas Inactivas"
          value={empresasInactivas}
          icon={Building2}
          variant="warning"
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Empresas</CardTitle>
              <CardDescription>Total: {empresas?.length || 0} empresas registradas</CardDescription>
            </div>
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar por RUC, razón social..."
              className="w-[300px]"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>RUC</TableHead>
                <TableHead>Razón Social</TableHead>
                <TableHead>Acrónimo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData?.map((empresa) => (
                <TableRow key={empresa.id}>
                  <TableCell className="font-medium">{empresa.ruc}</TableCell>
                  <TableCell>{empresa.nombre}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium">
                      {empresa.acronimo}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={empresa.estado} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedEmpresa(empresa);
                          setFormOpen(true);
                        }}
                      >
                        <Pencil className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción eliminará permanentemente la empresa "{empresa.nombre}" y no se puede deshacer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(empresa.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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

      {empresas?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Building2 className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No hay empresas registradas</h3>
          <p className="text-muted-foreground mt-2 max-w-md">
            Comienza agregando tu primera empresa para gestionar gastos
          </p>
          <Button
            className="mt-4"
            onClick={() => {
              setSelectedEmpresa(null);
              setFormOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Primera Empresa
          </Button>
        </div>
      )}

      <EmpresaForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelectedEmpresa(null);
        }}
        empresa={selectedEmpresa}
        onSubmit={handleSubmit}
        isLoading={createEmpresaMutation.isPending || updateEmpresaMutation.isPending}
      />
    </div>
  );
}
