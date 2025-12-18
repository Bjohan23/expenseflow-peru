import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, FileText, ScanLine, FolderOpen } from "lucide-react";
// TODO: Migrate to new API service - import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DocumentosRequeridosList } from "@/components/forms/DocumentosRequeridosList";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";

export default function ConceptoDocumentos() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch concepto de gasto
  const { data: concepto, isLoading } = useQuery({
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

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!concepto) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/conceptos-gasto")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Concepto no encontrado</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getCategoriaColor = (categoria: string) => {
    const colors: Record<string, string> = {
      viaticos: "bg-purple-500",
      transporte: "bg-blue-500",
      alimentacion: "bg-green-500",
      hospedaje: "bg-orange-500",
      otros: "bg-gray-500",
    };
    return colors[categoria] || "bg-gray-500";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/conceptos-gasto")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Documentos Requeridos</h1>
            <p className="text-muted-foreground">
              Gestiona los documentos necesarios para este concepto
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/conceptos-gasto/${id}/documentos/escaneados`)}
          >
            <FolderOpen className="h-4 w-4 mr-2" />
            Ver Documentos Escaneados
          </Button>
          <Button onClick={() => navigate(`/conceptos-gasto/${id}/documentos/upload`)}>
            <ScanLine className="h-4 w-4 mr-2" />
            Escanear Documento
          </Button>
        </div>
      </div>

      {/* Concepto Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle>{concepto.nombre}</CardTitle>
              </div>
              <CardDescription>{concepto.descripcion || "Sin descripción"}</CardDescription>
            </div>
            <Badge className={getCategoriaColor(concepto.categoria)}>
              {concepto.categoria.charAt(0).toUpperCase() + concepto.categoria.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Código</p>
              <p className="font-medium">{concepto.codigo}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Requiere Aprobación</p>
              <Badge variant={concepto.requiere_aprobacion ? "default" : "secondary"}>
                {concepto.requiere_aprobacion ? "Sí" : "No"}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Límite Máximo</p>
              <p className="font-medium">
                {concepto.limite_maximo
                  ? `S/ ${Number(concepto.limite_maximo).toFixed(2)}`
                  : "Sin límite"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estado</p>
              <Badge variant={concepto.estado === "activo" ? "default" : "secondary"}>
                {concepto.estado === "activo" ? "Activo" : "Inactivo"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documentos Requeridos List */}
      <DocumentosRequeridosList conceptoGastoId={concepto.id} conceptoNombre={concepto.nombre} />
    </div>
  );
}
