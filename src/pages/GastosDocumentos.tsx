import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, FileText, Eye, Edit, Trash2, ScanLine, Search, Filter } from "lucide-react";
// TODO: Migrate to new API service - import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { EditarDocumentoDialog } from "@/components/forms/EditarDocumentoDialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/format";
import { formatDate } from "date-fns";
import { es } from "date-fns/locale";

interface GastoDocumento {
  id: string;
  concepto_gasto_id: string;
  archivo_url: string;
  tipo_documento: string;
  numero_documento: string | null;
  fecha_documento: string | null;
  fecha_emision: string | null;
  emisor_ruc: string | null;
  emisor_razon_social: string | null;
  emisor_email: string | null;
  emisor_telefono: string | null;
  subtotal: number | null;
  igv: number | null;
  total: number | null;
  moneda: string;
  confianza_ocr: number | null;
  estado: string;
  observaciones: string | null;
  created_at: string;
}

export default function GastosDocumentos() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [documentoAEditar, setDocumentoAEditar] = useState<GastoDocumento | null>(null);
  const [dialogEditarOpen, setDialogEditarOpen] = useState(false);
  const [documentoAEliminar, setDocumentoAEliminar] = useState<GastoDocumento | null>(null);
  const [dialogEliminarOpen, setDialogEliminarOpen] = useState(false);

  // Estados para filtros
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");

  // Función para obtener URL firmada (signed URL) para archivos privados
  const obtenerUrlFirmada = async (path: string) => {
    try {
      const { data, error } = await supabase.storage
        .from("gastos-documentos")
        .createSignedUrl(path, 3600); // URL válida por 1 hora

      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      console.error("Error al obtener URL firmada:", error);
      return null;
    }
  };

  // Fetch concepto de gasto
  const { data: concepto } = useQuery({
    queryKey: ["concepto-gasto", id],
    queryFn: async () => {
      if (!id) throw new Error("ID no proporcionado");
      const { data, error } = await supabase
        .from("conceptos_gasto")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch documentos escaneados
  const { data: documentos, isLoading } = useQuery({
    queryKey: ["gastos-documentos", id],
    queryFn: async () => {
      if (!id) throw new Error("ID no proporcionado");

      const { data, error } = await supabase
        .from("gastos_documentos")
        .select("*")
        .eq("concepto_gasto_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as GastoDocumento[];
    },
    enabled: !!id,
  });

  // Mutación para eliminar documento
  const eliminarMutation = useMutation({
    mutationFn: async (documentoId: string) => {
      // 1. Obtener documento para eliminar archivo de Storage
      const { data: doc, error: fetchError } = await supabase
        .from("gastos_documentos")
        .select("archivo_url")
        .eq("id", documentoId)
        .single();

      if (fetchError) throw fetchError;

      // 2. Eliminar archivo de Storage
      const { error: storageError } = await supabase.storage
        .from("gastos-documentos")
        .remove([doc.archivo_url]);

      if (storageError) throw storageError;

      // 3. Eliminar registro de base de datos
      const { error: deleteError } = await supabase
        .from("gastos_documentos")
        .delete()
        .eq("id", documentoId);

      if (deleteError) throw deleteError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gastos-documentos"] });
      toast({
        title: "✅ Documento eliminado",
        description: "El documento ha sido eliminado correctamente",
      });
      setDialogEliminarOpen(false);
      setDocumentoAEliminar(null);
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Error al eliminar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filtrar documentos
  const documentosFiltrados = documentos?.filter((doc) => {
    const coincideBusqueda =
      busqueda === "" ||
      doc.numero_documento?.toLowerCase().includes(busqueda.toLowerCase()) ||
      doc.emisor_razon_social?.toLowerCase().includes(busqueda.toLowerCase()) ||
      doc.emisor_ruc?.includes(busqueda);

    const coincideTipo = filtroTipo === "todos" || doc.tipo_documento === filtroTipo;
    const coincideEstado = filtroEstado === "todos" || doc.estado === filtroEstado;

    return coincideBusqueda && coincideTipo && coincideEstado;
  });

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const getTipoDocColor = (tipo: string) => {
    const colors: Record<string, string> = {
      factura: "bg-blue-500",
      boleta: "bg-green-500",
      recibo: "bg-yellow-500",
      ticket: "bg-orange-500",
      comprobante: "bg-purple-500",
      otro: "bg-gray-500",
    };
    return colors[tipo] || "bg-gray-500";
  };

  const getEstadoColor = (estado: string) => {
    const colors: Record<string, string> = {
      pendiente: "bg-yellow-500",
      aprobado: "bg-green-500",
      rechazado: "bg-red-500",
      revision: "bg-orange-500",
    };
    return colors[estado] || "bg-gray-500";
  };

  const getConfianzaColor = (confianza: number) => {
    if (confianza >= 90) return "text-green-600 font-semibold";
    if (confianza >= 70) return "text-yellow-600 font-semibold";
    return "text-red-600 font-semibold";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(`/conceptos-gasto/${id}/documentos`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Documentos Escaneados</h1>
            <p className="text-muted-foreground">
              Gastos registrados para: <strong>{concepto?.nombre}</strong>
            </p>
          </div>
        </div>
        <Button onClick={() => navigate(`/conceptos-gasto/${id}/documentos/upload`)}>
          <ScanLine className="h-4 w-4 mr-2" />
          Escanear Nuevo Documento
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Documentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documentosFiltrados?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monto Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                documentosFiltrados?.reduce((acc, doc) => acc + (doc.total || 0), 0) || 0
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {documentosFiltrados?.filter((d) => d.estado === "pendiente").length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Aprobados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {documentosFiltrados?.filter((d) => d.estado === "aprobado").length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y Búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por número, RUC o razón social..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Filtro por Tipo */}
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los tipos</SelectItem>
                <SelectItem value="factura">Factura</SelectItem>
                <SelectItem value="boleta">Boleta</SelectItem>
                <SelectItem value="recibo">Recibo</SelectItem>
                <SelectItem value="ticket">Ticket</SelectItem>
                <SelectItem value="comprobante">Comprobante</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtro por Estado */}
            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="aprobado">Aprobado</SelectItem>
                <SelectItem value="rechazado">Rechazado</SelectItem>
                <SelectItem value="revision">En Revisión</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Documentos Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Documentos</CardTitle>
          <CardDescription>Todos los gastos escaneados con OCR para este concepto</CardDescription>
        </CardHeader>
        <CardContent>
          {documentosFiltrados && documentosFiltrados.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>N° Documento</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Emisor</TableHead>
                  <TableHead>RUC</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                  <TableHead className="text-right">IGV</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Confianza</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documentosFiltrados.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <Badge className={getTipoDocColor(doc.tipo_documento)}>
                        {doc.tipo_documento.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{doc.numero_documento || "N/A"}</TableCell>
                    <TableCell>
                      {doc.fecha_emision
                        ? formatDate(new Date(doc.fecha_emision), "dd/MM/yyyy", { locale: es })
                        : doc.fecha_documento
                        ? formatDate(new Date(doc.fecha_documento), "dd/MM/yyyy", { locale: es })
                        : "N/A"}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {doc.emisor_razon_social || "N/A"}
                    </TableCell>
                    <TableCell>{doc.emisor_ruc || "N/A"}</TableCell>
                    <TableCell className="text-right">
                      {doc.subtotal ? formatCurrency(doc.subtotal) : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {doc.igv ? formatCurrency(doc.igv) : "-"}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {doc.total ? formatCurrency(doc.total) : "N/A"}
                    </TableCell>
                    <TableCell>
                      {doc.confianza_ocr ? (
                        <span className={getConfianzaColor(doc.confianza_ocr)}>
                          {doc.confianza_ocr}%
                        </span>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={getEstadoColor(doc.estado)}>
                        {doc.estado.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={async () => {
                            const url = await obtenerUrlFirmada(doc.archivo_url);
                            if (url) {
                              window.open(url, "_blank");
                            } else {
                              alert("Error al obtener URL del documento");
                            }
                          }}
                          title="Ver documento"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setDocumentoAEditar(doc);
                            setDialogEditarOpen(true);
                          }}
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => {
                            setDocumentoAEliminar(doc);
                            setDialogEliminarOpen(true);
                          }}
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No hay documentos escaneados</h3>
              <p className="text-muted-foreground mt-2 max-w-md">
                Comienza escaneando tu primer documento para registrar gastos con OCR
              </p>
              <Button
                className="mt-4"
                onClick={() => navigate(`/conceptos-gasto/${id}/documentos/upload`)}
              >
                <ScanLine className="w-4 h-4 mr-2" />
                Escanear Primer Documento
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Edición */}
      <EditarDocumentoDialog
        open={dialogEditarOpen}
        onClose={() => {
          setDialogEditarOpen(false);
          setDocumentoAEditar(null);
        }}
        documento={documentoAEditar}
      />

      {/* Dialog de Confirmación de Eliminación */}
      <AlertDialog open={dialogEliminarOpen} onOpenChange={setDialogEliminarOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar documento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El documento y el archivo se eliminarán
              permanentemente del sistema.
              {documentoAEliminar && (
                <div className="mt-4 p-4 bg-muted rounded-md">
                  <p className="font-medium">
                    Tipo: {documentoAEliminar.tipo_documento.toUpperCase()}
                  </p>
                  <p>N°: {documentoAEliminar.numero_documento || "SIN-NUMERO"}</p>
                  <p>Emisor: {documentoAEliminar.emisor_razon_social || "N/A"}</p>
                  <p>Total: {formatCurrency(documentoAEliminar.total || 0)}</p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (documentoAEliminar) {
                  eliminarMutation.mutate(documentoAEliminar.id);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
              disabled={eliminarMutation.isPending}
            >
              {eliminarMutation.isPending ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
