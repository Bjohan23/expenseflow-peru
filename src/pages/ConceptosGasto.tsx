import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit, Trash2, Tag } from 'lucide-react';
import { treasuryService } from '@/services/treasury.service';
import { CategoriaGasto } from '@/types/treasury';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';

interface ConceptoFormData {
  nombre_categoria: string;
  descripcion_categoria: string;
  concepto?: string;
}

export default function ConceptosGasto() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedConcepto, setSelectedConcepto] = useState<CategoriaGasto | null>(null);
  const [formData, setFormData] = useState<ConceptoFormData>({
    nombre_categoria: '',
    descripcion_categoria: '',
    concepto: '',
  });

  const queryClient = useQueryClient();

  // Query para obtener categorías
  const {
    data: categoriasData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['categorias-gasto', currentPage, searchTerm],
    queryFn: () =>
      treasuryService.getCategorias({
        page: currentPage,
        page_size: 15,
        search: searchTerm || undefined,
      }),
    keepPreviousData: true,
  });

  // Mutation para crear
  const createMutation = useMutation({
    mutationFn: (data: ConceptoFormData) => treasuryService.createCategoria(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['categorias-gasto']);
      setIsCreateDialogOpen(false);
      resetForm();
      toast.success('Categoría creada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear categoría');
    },
  });

  // Mutation para actualizar
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ConceptoFormData }) =>
      treasuryService.updateCategoria(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['categorias-gasto']);
      setIsEditDialogOpen(false);
      setSelectedConcepto(null);
      resetForm();
      toast.success('Categoría actualizada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar categoría');
    },
  });

  // Mutation para eliminar
  const deleteMutation = useMutation({
    mutationFn: (id: string) => treasuryService.deleteCategoria(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['categorias-gasto']);
      toast.success('Categoría eliminada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al eliminar categoría');
    },
  });

  const resetForm = () => {
    setFormData({
      nombre_categoria: '',
      descripcion_categoria: '',
      concepto: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedConcepto) {
      updateMutation.mutate({
        id: selectedConcepto.categoria_id,
        data: formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (concepto: CategoriaGasto) => {
    setSelectedConcepto(concepto);
    setFormData({
      nombre_categoria: concepto.nombre_categoria,
      descripcion_categoria: concepto.descripcion_categoria,
      concepto: concepto.concepto || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Conceptos de Gasto</h1>
          <p className="text-muted-foreground mt-2">Gestión de conceptos y categorías de gastos</p>
        </div>
        <LoadingSkeleton type="table" count={5} />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Error al cargar las categorías de gasto
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Conceptos de Gasto</h1>
          <p className="text-gray-600 mt-1">
            Gestiona las categorías para clasificar los gastos
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Categoría
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nueva Categoría</DialogTitle>
              <DialogDescription>
                Ingresa los datos para crear una nueva categoría de gasto
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="nombre_categoria">Nombre de Categoría</Label>
                  <Input
                    id="nombre_categoria"
                    value={formData.nombre_categoria}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre_categoria: e.target.value })
                    }
                    placeholder="Ej: Viáticos"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="descripcion_categoria">Descripción</Label>
                  <Input
                    id="descripcion_categoria"
                    value={formData.descripcion_categoria}
                    onChange={(e) =>
                      setFormData({ ...formData, descripcion_categoria: e.target.value })
                    }
                    placeholder="Ej: Gastos de transporte y alimentación"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="concepto">Concepto (opcional)</Label>
                  <Input
                    id="concepto"
                    value={formData.concepto}
                    onChange={(e) =>
                      setFormData({ ...formData, concepto: e.target.value })
                    }
                    placeholder="Código o referencia interna"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isLoading}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {createMutation.isLoading ? 'Creando...' : 'Crear'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtrar Categorías</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar categorías..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lista de Categorías</CardTitle>
        </CardHeader>
        <CardContent>
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Concepto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoriasData?.data?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Tag className="w-12 h-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold">
                          {searchTerm
                            ? 'No se encontraron categorías que coincidan con la búsqueda'
                            : 'No hay categorías registradas'}
                        </h3>
                        <p className="text-muted-foreground mt-2 max-w-md">
                          Define categorías de gasto para clasificar y controlar los gastos de la empresa
                        </p>
                        {!searchTerm && (
                          <Button
                            className="mt-4 bg-purple-600 hover:bg-purple-700"
                            onClick={() => setIsCreateDialogOpen(true)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Agregar Primera Categoría
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  categoriasData?.data?.map((categoria) => (
                    <TableRow key={categoria.categoria_id}>
                      <TableCell className="font-medium">
                        {categoria.nombre_categoria}
                      </TableCell>
                      <TableCell>{categoria.descripcion_categoria}</TableCell>
                      <TableCell>
                        {categoria.concepto ? (
                          <Badge variant="secondary">{categoria.concepto}</Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Activa
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(categoria)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar Categoría?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción eliminará permanentemente la categoría "
                                  {categoria.nombre_categoria}". Esta acción no se puede deshacer.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(categoria.categoria_id)}
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
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {categoriasData?.pagination && categoriasData.pagination.total_pages > 1 && (
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-600">
                  Mostrando {categoriasData.pagination.start_index}-
                  {categoriasData.pagination.end_index} de{' '}
                  {categoriasData.pagination.count} resultados
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!categoriasData.pagination.has_previous}
                  >
                    Anterior
                  </Button>
                  <span className="px-3 py-1 text-sm">
                    Página {categoriasData.pagination.current_page} de{' '}
                    {categoriasData.pagination.total_pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!categoriasData.pagination.has_next}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Categoría</DialogTitle>
            <DialogDescription>
              Actualiza los datos de la categoría seleccionada
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit_nombre_categoria">Nombre de Categoría</Label>
                <Input
                  id="edit_nombre_categoria"
                  value={formData.nombre_categoria}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre_categoria: e.target.value })
                  }
                  placeholder="Ej: Viáticos"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit_descripcion_categoria">Descripción</Label>
                <Input
                  id="edit_descripcion_categoria"
                  value={formData.descripcion_categoria}
                  onChange={(e) =>
                    setFormData({ ...formData, descripcion_categoria: e.target.value })
                  }
                  placeholder="Ej: Gastos de transporte y alimentación"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit_concepto">Concepto (opcional)</Label>
                <Input
                  id="edit_concepto"
                  value={formData.concepto}
                  onChange={(e) =>
                    setFormData({ ...formData, concepto: e.target.value })
                  }
                  placeholder="Código o referencia interna"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setSelectedConcepto(null);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isLoading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {updateMutation.isLoading ? 'Actualizando...' : 'Actualizar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
