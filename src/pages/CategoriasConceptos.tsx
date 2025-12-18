import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FolderPlus, Plus, Edit2, Trash2, Tag, FileText, Search, X } from 'lucide-react';
import { toast } from 'sonner';

import { categoriasService, CategoriaGasto, ConceptoGasto } from '@/services/categorias.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Input } from '@/components/ui/input';

export default function CategoriasConceptos() {
  const [activeTab, setActiveTab] = useState<'categorias' | 'conceptos'>('categorias');
  const [categoriaFormOpen, setCategoriaFormOpen] = useState(false);
  const [conceptoFormOpen, setConceptoFormOpen] = useState(false);
  const [searchTermCategorias, setSearchTermCategorias] = useState('');
  const [searchTermConceptos, setSearchTermConceptos] = useState('');

  const queryClient = useQueryClient();

  // Queries
  const { data: categorias, isLoading: categoriasLoading } = useQuery({
    queryKey: ['categorias'],
    queryFn: () => categoriasService.getCategorias(),
  });

  const { data: conceptos, isLoading: conceptosLoading } = useQuery({
    queryKey: ['conceptos'],
    queryFn: () => categoriasService.getConceptos(),
  });

  const { data: categoriasConConceptos } = useQuery({
    queryKey: ['categorias-conceptos'],
    queryFn: () => categoriasService.getCategoriasConConceptos(),
  });

  // Mutations for deleting only (since we only show lists)
  const deleteCategoriaMutation = useMutation({
    mutationFn: (id: string) => categoriasService.deleteCategoria(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      queryClient.invalidateQueries({ queryKey: ['categorias-conceptos'] });
      toast.success('Categoría eliminada exitosamente');
    },
    onError: (error: any) => {
      toast.error('Error al eliminar categoría: ' + error.message);
    },
  });

  const deleteConceptoMutation = useMutation({
    mutationFn: (id: string) => categoriasService.deleteConcepto(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conceptos'] });
      queryClient.invalidateQueries({ queryKey: ['categorias-conceptos'] });
      toast.success('Concepto eliminado exitosamente');
    },
    onError: (error: any) => {
      toast.error('Error al eliminar concepto: ' + error.message);
    },
  });

  const handleDeleteCategoria = (categoria: CategoriaGasto) => {
    if (categoria.isPredefined) {
      toast.error('No se pueden eliminar categorías predefinidas');
      return;
    }
    deleteCategoriaMutation.mutate(categoria.categoria_id);
  };

  const handleDeleteConcepto = (concepto: ConceptoGasto) => {
    if (concepto.isPredefined) {
      toast.error('No se pueden eliminar conceptos predefinidos');
      return;
    }
    deleteConceptoMutation.mutate(concepto.concepto_id);
  };

  const handleOpenCategoriaForm = () => {
    setCategoriaFormOpen(true);
  };

  const handleOpenConceptoForm = () => {
    setConceptoFormOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Categorías y Conceptos</h1>
        <p className="text-muted-foreground mt-2">Gestiona las categorías de gastos y sus conceptos</p>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex space-x-8">
          <button
            className={`py-2 px-4 border-b-2 font-medium text-sm ${
              activeTab === 'categorias'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('categorias')}
          >
            <FolderPlus className="inline w-4 h-4 mr-2" />
            Categorías
          </button>
          <button
            className={`py-2 px-4 border-b-2 font-medium text-sm ${
              activeTab === 'conceptos'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('conceptos')}
          >
            <Tag className="inline w-4 h-4 mr-2" />
            Conceptos
          </button>
        </div>
      </div>

      {/* Categorías Tab */}
      {activeTab === 'categorias' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Categorías de Gasto</h2>
              <p className="text-gray-600">Gestiona las categorías principales para clasificar tus gastos</p>
            </div>
            <Button onClick={handleOpenCategoriaForm}>
              <FolderPlus className="w-4 h-4 mr-2" />
              Ver Categorías y Conceptos
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoriasConConceptos?.map((categoria) => (
              <Card key={categoria.categoria_id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FolderPlus className="w-5 h-5" />
                        {categoria.nombre_categoria}
                        {categoria.isPredefined && (
                          <Badge variant="secondary" className="text-xs">
                            Sistema
                          </Badge>
                        )}
                      </CardTitle>
                      {categoria.descripcion_categoria && (
                        <CardDescription className="mt-1">
                          {categoria.descripcion_categoria}
                        </CardDescription>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {!categoria.isPredefined && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción eliminará la categoría "{categoria.nombre_categoria}".
                                {categoria.conceptos.length > 0 && (
                                  <span className="text-red-600 font-semibold">
                                    {' '}Tiene {categoria.conceptos.length} conceptos asociados.
                                  </span>
                                )}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteCategoria(categoria)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600">
                    <strong>Conceptos:</strong> {categoria.conceptos.length}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Conceptos Tab */}
      {activeTab === 'conceptos' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Conceptos de Gasto</h2>
              <p className="text-gray-600">Gestiona los conceptos específicos dentro de cada categoría</p>
            </div>
            <Button onClick={handleOpenConceptoForm}>
              <Tag className="w-4 h-4 mr-2" />
              Ver Lista Completa de Conceptos
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {conceptos?.map((concepto) => {
              const categoria = categorias?.find(c => c.categoria_id === concepto.categoria_id);
              return (
                <Card key={concepto.concepto_id} className="relative">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-4 h-4" />
                          <span className="font-medium">{concepto.concepto}</span>
                          {concepto.isPredefined && (
                            <Badge variant="secondary" className="text-xs">
                              Sistema
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          <strong>Categoría:</strong> {categoria?.nombre_categoria || 'N/A'}
                        </div>
                      </div>
                      {!concepto.isPredefined && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción eliminará el concepto "{concepto.concepto}" permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteConcepto(concepto)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Lista de Categorías y Conceptos Dialog */}
      <Dialog open={categoriaFormOpen} onOpenChange={setCategoriaFormOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl">Categorías y Conceptos Registrados</DialogTitle>
                <DialogDescription>
                  Lista completa de categorías y conceptos disponibles en el sistema
                </DialogDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCategoriaFormOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>

          {/* Search Bar */}
          <div className="flex-shrink-0 px-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar categorías o conceptos..."
                value={searchTermCategorias}
                onChange={(e) => setSearchTermCategorias(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto px-1 py-4 space-y-6">
            {categoriasConConceptos
              ?.filter((categoria) => {
                const searchLower = searchTermCategorias.toLowerCase();
                const matchesCategoria = categoria.nombre_categoria.toLowerCase().includes(searchLower) ||
                  (categoria.descripcion_categoria?.toLowerCase().includes(searchLower) || false);
                const matchesConceptos = categoria.conceptos.some(concepto =>
                  concepto.concepto.toLowerCase().includes(searchLower)
                );
                return matchesCategoria || matchesConceptos;
              })
              .map((categoria) => (
                <Card key={categoria.categoria_id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <FolderPlus className="w-5 h-5 text-blue-600" />
                      <CardTitle className="text-lg">{categoria.nombre_categoria}</CardTitle>
                      {categoria.isPredefined && (
                        <Badge variant="secondary" className="text-xs">
                          Sistema
                        </Badge>
                      )}
                    </div>
                    {categoria.descripcion_categoria && (
                      <CardDescription className="text-sm">
                        {categoria.descripcion_categoria}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <FileText className="w-4 h-4" />
                        Conceptos ({categoria.conceptos.length})
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {categoria.conceptos
                          .filter((concepto) =>
                            searchTermCategorias === '' ||
                            concepto.concepto.toLowerCase().includes(searchTermCategorias.toLowerCase())
                          )
                          .map((concepto) => (
                            <div
                              key={concepto.concepto_id}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                            >
                              <div className="flex items-center gap-2">
                                <Tag className="w-3 h-3 text-gray-500" />
                                <span className="text-sm">{concepto.concepto}</span>
                                {concepto.isPredefined && (
                                  <Badge variant="outline" className="text-xs">
                                    Sistema
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>

          <DialogFooter className="flex-shrink-0 pt-4">
            <Button variant="outline" onClick={() => setCategoriaFormOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lista de Conceptos Dialog */}
      <Dialog open={conceptoFormOpen} onOpenChange={setConceptoFormOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl">Todos los Conceptos de Gasto</DialogTitle>
                <DialogDescription>
                  Lista completa de todos los conceptos registrados en el sistema
                </DialogDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConceptoFormOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>

          {/* Search Bar */}
          <div className="flex-shrink-0 px-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar conceptos..."
                value={searchTermConceptos}
                onChange={(e) => setSearchTermConceptos(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto px-1 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {conceptos
                ?.filter((concepto) =>
                  searchTermConceptos === '' ||
                  concepto.concepto.toLowerCase().includes(searchTermConceptos.toLowerCase()) ||
                  categorias?.find(c => c.categoria_id === concepto.categoria_id)?.nombre_categoria.toLowerCase().includes(searchTermConceptos.toLowerCase())
                )
                .map((concepto) => {
                  const categoria = categorias?.find(c => c.categoria_id === concepto.categoria_id);
                  return (
                    <Card key={concepto.concepto_id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Tag className="w-4 h-4 text-green-600" />
                              <span className="font-medium text-sm">{concepto.concepto}</span>
                              {concepto.isPredefined && (
                                <Badge variant="secondary" className="text-xs">
                                  Sistema
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-gray-600 space-y-1">
                              <div className="flex items-center gap-1">
                                <FolderPlus className="w-3 h-3" />
                                <span>{categoria?.nombre_categoria || 'Categoría no encontrada'}</span>
                              </div>
                              <div className="text-xs text-gray-400">
                                ID: {concepto.concepto_id.slice(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </div>

          <DialogFooter className="flex-shrink-0 pt-4">
            <div className="flex items-center justify-between w-full">
              <div className="text-sm text-gray-600">
                Total: {conceptos?.length || 0} conceptos
              </div>
              <Button variant="outline" onClick={() => setConceptoFormOpen(false)}>
                Cerrar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}