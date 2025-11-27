import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Eye, Edit, Trash2, ScanLine } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
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
  emisor_ruc: string | null;
  emisor_razon_social: string | null;
  subtotal: number | null;
  igv: number | null;
  total: number | null;
  moneda: string;
  confianza_ocr: number | null;
  estado: string;
  created_at: string;
}

export default function GastosDocumentos() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

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
  const {
    data: documentos,
    isLoading,
    refetch,
  } = useQuery({
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
            <div className="text-2xl font-bold">{documentos?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monto Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(documentos?.reduce((acc, doc) => acc + (doc.total || 0), 0) || 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {documentos?.filter((d) => d.estado === "pendiente").length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Aprobados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {documentos?.filter((d) => d.estado === "aprobado").length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documentos Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Documentos</CardTitle>
          <CardDescription>Todos los gastos escaneados con OCR para este concepto</CardDescription>
        </CardHeader>
        <CardContent>
          {documentos && documentos.length > 0 ? (
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
                {documentos.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <Badge className={getTipoDocColor(doc.tipo_documento)}>
                        {doc.tipo_documento.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{doc.numero_documento || "N/A"}</TableCell>
                    <TableCell>
                      {doc.fecha_documento
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
                          onClick={() => window.open(doc.archivo_url, "_blank")}
                          title="Ver documento"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            // TODO: Implementar edición
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
                            // TODO: Implementar eliminación
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
    </div>
  );
}
