import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Building2, Plus, Pencil, DollarSign, CheckCircle } from "lucide-react";
// TODO: Migrate to new API service - import { supabase } from "@/lib/supabase";
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

export default function Empresas() {
  const [formOpen, setFormOpen] = useState(false);
  const [selectedEmpresa, setSelectedEmpresa] = useState<any>(null);
  const { data: empresas, isLoading } = useQuery({
    queryKey: ["empresas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("empresas")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { searchTerm, setSearchTerm, filteredData } = useTableFilter({
    data: empresas || [],
    searchFields: ["ruc", "razon_social", "nombre_comercial"],
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
  const empresasActivas = empresas?.filter((e) => e.estado === "activo").length || 0;
  const limiteTotal =
    empresas?.reduce((sum, e) => sum + Number(e.limite_gasto_mensual || 0), 0) || 0;

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
          title="Límite Total Mensual"
          value={`S/ ${limiteTotal.toLocaleString("es-PE", { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          variant="default"
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
                <TableHead>Nombre Comercial</TableHead>
                <TableHead>Moneda</TableHead>
                <TableHead>Límite Mensual</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData?.map((empresa) => (
                <TableRow key={empresa.id}>
                  <TableCell className="font-medium">{empresa.ruc}</TableCell>
                  <TableCell>{empresa.razon_social}</TableCell>
                  <TableCell>{empresa.nombre_comercial || "-"}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium">
                      {empresa.moneda}
                    </span>
                  </TableCell>
                  <TableCell>
                    {empresa.moneda}{" "}
                    {Number(empresa.limite_gasto_mensual).toLocaleString("es-PE", {
                      minimumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={empresa.estado} />
                  </TableCell>
                  <TableCell>
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
      />
    </div>
  );
}
