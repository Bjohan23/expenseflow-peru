/**
 * Página principal de Gastos
 * Lista, filtra y gestiona todos los gastos del sistema
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Filter, Download, Search, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, TrendingUp, Clock, CheckCircle2, DollarSign } from "lucide-react";
import { GastoForm } from "@/components/forms/GastoForm";
import { useGastos, useCrearGasto, useEstadisticasGastos, useEnviarGasto } from "@/hooks/useGastos";
import type { FiltrosGastos, EstadoGasto, FormularioGasto } from "@/types/gastos";
import { ESTADOS_GASTO, formatearMonto } from "@/types/gastos";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function Gastos() {
  const navigate = useNavigate();

  // Estado
  const [filtros, setFiltros] = useState<FiltrosGastos>({});
  const [busqueda, setBusqueda] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);

  // Queries y mutations
  const { data: gastos = [], isLoading, refetch } = useGastos(filtros);
  const { data: estadisticas } = useEstadisticasGastos(filtros);
  const crearGasto = useCrearGasto();
  const enviarGasto = useEnviarGasto();

  // Manejar cambios en filtros
  const actualizarFiltro = (key: keyof FiltrosGastos, value: any) => {
    setFiltros((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  // Manejar búsqueda
  const handleBuscar = () => {
    setFiltros((prev) => ({
      ...prev,
      busqueda: busqueda.trim() || undefined,
    }));
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltros({});
    setBusqueda("");
  };

  // Crear gasto
  const handleCrearGasto = async (datos: FormularioGasto, enviar: boolean) => {
    try {
      const gasto = await crearGasto.mutateAsync(datos);

      if (enviar && gasto.estado === "borrador") {
        await enviarGasto.mutateAsync(gasto.id);
      }

      setModalAbierto(false);
    } catch (error) {
      console.error("Error al crear gasto:", error);
    }
  };

  // Ver detalle
  const verDetalle = (id: string) => {
    navigate(`/gastos/${id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gastos</h1>
          <p className="text-gray-500">Gestiona y aprueba los gastos de la empresa</p>
        </div>
        <Button onClick={() => setModalAbierto(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Gasto
        </Button>
      </div>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Gastos</CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estadisticas.total_gastos}</div>
              <p className="text-xs text-gray-500 mt-1">
                {formatearMonto(estadisticas.monto_total_pen, "PEN")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pendientes</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {estadisticas.gastos_pendientes}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {formatearMonto(estadisticas.monto_pendiente_pen, "PEN")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Aprobados</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {estadisticas.gastos_aprobados}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {formatearMonto(estadisticas.monto_aprobado_pen, "PEN")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pagados</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{estadisticas.gastos_pagados}</div>
              <p className="text-xs text-gray-500 mt-1">Completados</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros y búsqueda */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <CardTitle>Filtros</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Búsqueda */}
            <div className="md:col-span-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Buscar por código, descripción, beneficiario..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleBuscar()}
                />
                <Button onClick={handleBuscar} size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Estado */}
            <Select
              value={(filtros.estado as string) || "todos"}
              onValueChange={(value) =>
                actualizarFiltro("estado", value === "todos" ? undefined : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                {Object.entries(ESTADOS_GASTO).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Acciones */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={limpiarFiltros}
                title="Limpiar filtros"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" title="Exportar" disabled>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de gastos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Listado de Gastos</CardTitle>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : gastos.length === 0 ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                No se encontraron gastos con los filtros seleccionados.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Concepto</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Beneficiario</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gastos.map((gasto) => {
                    const estadoConfig = ESTADOS_GASTO[gasto.estado as EstadoGasto];

                    return (
                      <TableRow
                        key={gasto.id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => verDetalle(gasto.id)}
                      >
                        <TableCell className="font-mono text-sm">{gasto.codigo}</TableCell>
                        <TableCell>
                          {format(new Date(gasto.fecha_gasto), "dd MMM yyyy", {
                            locale: es,
                          })}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{gasto.concepto_nombre}</div>
                            {gasto.concepto_categoria && (
                              <div className="text-xs text-gray-500">
                                {gasto.concepto_categoria}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{gasto.descripcion}</TableCell>
                        <TableCell>
                          {gasto.beneficiario_nombre || <span className="text-gray-400">-</span>}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatearMonto(gasto.monto, gasto.moneda)}
                          {gasto.excede_limite && (
                            <AlertTriangle className="h-4 w-4 text-orange-500 inline ml-2" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={estadoConfig.color}>
                            {estadoConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              verDetalle(gasto.id);
                            }}
                          >
                            Ver
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal crear gasto */}
      <GastoForm
        open={modalAbierto}
        onClose={() => setModalAbierto(false)}
        onSubmit={handleCrearGasto}
        isLoading={crearGasto.isPending || enviarGasto.isPending}
      />
    </div>
  );
}
