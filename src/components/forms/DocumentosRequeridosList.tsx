import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Edit, FileText, CheckCircle, XCircle } from "lucide-react";
// TODO: Migrate to new API service - import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { DocumentoRequeridoForm } from "./DocumentoRequeridoForm";
import { toast } from "sonner";

interface DocumentosRequeridosListProps {
  conceptoGastoId: string;
  conceptoNombre: string;
}

export function DocumentosRequeridosList({
  conceptoGastoId,
  conceptoNombre,
}: DocumentosRequeridosListProps) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingDoc, setEditingDoc] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<string | null>(null);

  // Fetch documentos requeridos
  const { data: documentos, isLoading } = useQuery({
    queryKey: ["concepto-documentos", conceptoGastoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("concepto_documentos_requeridos")
        .select("*")
        .eq("concepto_gasto_id", conceptoGastoId)
        .eq("estado", "activo")
        .order("orden");

      if (error) throw error;
      return data;
    },
  });

  // Mutation para eliminar
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("concepto_documentos_requeridos")
        .update({ estado: "inactivo" })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["concepto-documentos", conceptoGastoId] });
      toast.success("Documento eliminado correctamente");
      setDeleteDialogOpen(false);
      setDocToDelete(null);
    },
    onError: (error: any) => {
      toast.error("Error al eliminar: " + error.message);
    },
  });

  const handleEdit = (doc: any) => {
    setEditingDoc(doc);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setDocToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingDoc(null);
  };

  const getTipoDocumentoBadge = (tipo: string) => {
    const colors: Record<string, string> = {
      factura: "bg-blue-500",
      boleta: "bg-green-500",
      recibo: "bg-yellow-500",
      comprobante: "bg-purple-500",
      ticket: "bg-orange-500",
      otro: "bg-gray-500",
    };

    return (
      <Badge className={colors[tipo] || "bg-gray-500"}>
        {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Documentos Requeridos</CardTitle>
          <CardDescription>Cargando documentos...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documentos Requeridos
              </CardTitle>
              <CardDescription>
                Documentos necesarios para el concepto: <strong>{conceptoNombre}</strong>
              </CardDescription>
            </div>
            <Button onClick={() => setShowForm(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Documento
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!documentos || documentos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay documentos requeridos para este concepto</p>
              <Button variant="outline" onClick={() => setShowForm(true)} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Agregar primer documento
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-center">Obligatorio</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documentos.map((doc, index) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell className="font-medium">{doc.nombre_documento}</TableCell>
                    <TableCell className="text-muted-foreground max-w-xs truncate">
                      {doc.descripcion || "-"}
                    </TableCell>
                    <TableCell>{getTipoDocumentoBadge(doc.tipo_documento)}</TableCell>
                    <TableCell className="text-center">
                      {doc.es_obligatorio ? (
                        <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                      ) : (
                        <XCircle className="h-5 w-5 text-gray-400 mx-auto" />
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(doc)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(doc.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <DocumentoRequeridoForm
        open={showForm}
        onClose={handleFormClose}
        conceptoGastoId={conceptoGastoId}
        documento={editingDoc}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar documento requerido?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El documento será marcado como inactivo pero no se
              eliminará del historial.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => docToDelete && deleteMutation.mutate(docToDelete)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
