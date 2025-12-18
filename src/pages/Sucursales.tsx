import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Plus, Pencil, CheckCircle, Building2, Users } from "lucide-react";
// TODO: Migrate to new API service - import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { StatusBadge } from "@/components/common/StatusBadge";
import { SearchInput } from "@/components/common/SearchInput";
import { TablePagination } from "@/components/common/TablePagination";
import { KPICard } from "@/components/common/KPICard";
import { SucursalForm } from "@/components/forms/SucursalForm";
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

export default function Sucursales() {
  const [formOpen, setFormOpen] = useState(false);
  const [selectedSucursal, setSelectedSucursal] = useState<any>(null);
  const { data: sucursales, isLoading } = useQuery({
    queryKey: ["sucursales"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sucursales")
        .select(
          `
          *,
          empresa:empresas(razon_social, nombre_comercial),
          responsable:profiles(full_name, email)
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { searchTerm, setSearchTerm, filteredData } = useTableFilter({
    data: sucursales || [],
    searchFields: ["codigo", "nombre", "ciudad", "region", "empresa"],
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
  const sucursalesActivas = sucursales?.filter((s) => s.estado === "activo").length || 0;
  const sucursalesConResponsable = sucursales?.filter((s) => s.responsable_id).length || 0;
  const empresasUnicas = new Set(sucursales?.map((s) => s.empresa_id)).size;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sucursales</h1>
          <p className="text-muted-foreground mt-2">Gestión de sucursales y puntos de venta</p>
        </div>
        <LoadingSkeleton type="table" count={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sucursales</h1>
          <p className="text-muted-foreground mt-2">Gestión de sucursales y puntos de venta</p>
        </div>
        <Button
          onClick={() => {
            setSelectedSucursal(null);
            setFormOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Sucursal
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard
          title="Total Sucursales"
          value={sucursales?.length || 0}
          icon={MapPin}
          variant="primary"
        />
        <KPICard
          title="Sucursales Activas"
          value={sucursalesActivas}
          icon={CheckCircle}
          variant="success"
        />
        <KPICard
          title="Con Responsable"
          value={sucursalesConResponsable}
          icon={Users}
          variant="default"
        />
        <KPICard title="Empresas" value={empresasUnicas} icon={Building2} variant="default" />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Sucursales</CardTitle>
              <CardDescription>
                Total: {sucursales?.length || 0} sucursales registradas
              </CardDescription>
            </div>
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar por código, nombre, ciudad..."
              className="w-[300px]"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Ciudad</TableHead>
                <TableHead>Región</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData?.map((sucursal) => (
                <TableRow key={sucursal.id}>
                  <TableCell className="font-medium">{sucursal.codigo}</TableCell>
                  <TableCell>{sucursal.nombre}</TableCell>
                  <TableCell>
                    {sucursal.empresa?.nombre_comercial || sucursal.empresa?.razon_social || "-"}
                  </TableCell>
                  <TableCell>{sucursal.ciudad}</TableCell>
                  <TableCell>{sucursal.region}</TableCell>
                  <TableCell>
                    {sucursal.responsable ? (
                      <div>
                        <div className="font-medium">{sucursal.responsable.full_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {sucursal.responsable.email}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Sin asignar</span>
                    )}
                  </TableCell>
                  <TableCell>{sucursal.telefono || "-"}</TableCell>
                  <TableCell>
                    <StatusBadge status={sucursal.estado} />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedSucursal(sucursal);
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

      {sucursales?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <MapPin className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No hay sucursales registradas</h3>
          <p className="text-muted-foreground mt-2 max-w-md">
            Agrega sucursales para gestionar puntos de venta en diferentes ubicaciones
          </p>
          <Button
            className="mt-4"
            onClick={() => {
              setSelectedSucursal(null);
              setFormOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Primera Sucursal
          </Button>
        </div>
      )}

      <SucursalForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelectedSucursal(null);
        }}
        sucursal={selectedSucursal}
      />
    </div>
  );
}
