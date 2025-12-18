import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, DollarSign, Calendar, Eye, ToggleLeft, ToggleRight } from 'lucide-react';
import { treasuryService } from '@/services/treasury.service';
import { Caja, AperturaCaja } from '@/types/treasury';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { useAuth } from '@/contexts/AuthContext';

interface AperturaCajaFormData {
  caja: string;
  monto_inicial: string;
  observaciones?: string;
}

interface CierreCajaFormData {
  saldo_final: string;
  observaciones: string;
}

export default function Cajas() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAperturaDialogOpen, setIsAperturaDialogOpen] = useState(false);
  const [isCierreDialogOpen, setIsCierreDialogOpen] = useState(false);
  const [selectedCaja, setSelectedCaja] = useState<Caja | null>(null);
  const [selectedApertura, setSelectedApertura] = useState<AperturaCaja | null>(null);
  const [aperturaForm, setAperturaForm] = useState<AperturaCajaFormData>({
    caja: '',
    monto_inicial: '',
    observaciones: '',
  });
  const [cierreForm, setCierreForm] = useState<CierreCajaFormData>({
    saldo_final: '',
    observaciones: '',
  });

  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Query para obtener cajas
  const {
    data: cajasData,
    isLoading: isLoadingCajas,
    error: cajasError,
  } = useQuery({
    queryKey: ['cajas', searchTerm],
    queryFn: () =>
      treasuryService.getCajas({
        search: searchTerm || undefined,
      }),
  });

  // Query para obtener aperturas de caja activas
  const {
    data: aperturasData,
    isLoading: isLoadingAperturas,
    refetch: refetchAperturas,
  } = useQuery({
    queryKey: ['aperturas-cajas-activas'],
    queryFn: async () => {
      // Necesitamos consultar las aperturas activas para cada caja
      const aperturasPromises = cajasData?.data?.map((caja) =>
        treasuryService.getCurrentAperturaCaja(caja.caja_id).catch(() => null)
      );
      if (aperturasPromises) {
        const aperturas = await Promise.all(aperturasPromises);
        return aperturas.filter(Boolean);
      }
      return [];
    },
    enabled: !!cajasData?.data,
  });

  // Mutation para abrir caja
  const abrirCajaMutation = useMutation({
    mutationFn: (data: AperturaCajaFormData) => treasuryService.abrirCaja(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['cajas']);
      queryClient.invalidateQueries(['aperturas-cajas-activas']);
      setIsAperturaDialogOpen(false);
      resetAperturaForm();
      toast.success('Caja abierta exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al abrir caja');
    },
  });

  // Mutation para cerrar caja
  const cerrarCajaMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CierreCajaFormData }) =>
      treasuryService.cerrarCaja(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['cajas']);
      queryClient.invalidateQueries(['aperturas-cajas-activas']);
      setIsCierreDialogOpen(false);
      resetCierreForm();
      toast.success('Caja cerrada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al cerrar caja');
    },
  });

  const resetAperturaForm = () => {
    setAperturaForm({
      caja: '',
      monto_inicial: '',
      observaciones: '',
    });
  };

  const resetCierreForm = () => {
    setCierreForm({
      saldo_final: '',
      observaciones: '',
    });
  };

  const handleAbrirCaja = (e: React.FormEvent) => {
    e.preventDefault();
    abrirCajaMutation.mutate(aperturaForm);
  };

  const handleCerrarCaja = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedApertura) {
      cerrarCajaMutation.mutate({
        id: selectedApertura.id,
        data: cierreForm,
      });
    }
  };

  const handleSelectCajaParaAbrir = (caja: Caja) => {
    setSelectedCaja(caja);
    setAperturaForm({
      caja: caja.caja_id,
      monto_inicial: '',
      observaciones: '',
    });
    setIsAperturaDialogOpen(true);
  };

  const handleSelectCajaParaCerrar = (apertura: AperturaCaja) => {
    setSelectedApertura(apertura);
    setCierreForm({
      saldo_final: apertura.saldo_actual,
      observaciones: '',
    });
    setIsCierreDialogOpen(true);
  };

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-PE', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  if (isLoadingCajas) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Cajas</h1>
          <p className="text-muted-foreground mt-2">Apertura y cierre de cajas chica</p>
        </div>
        <LoadingSkeleton type="table" count={5} />
      </div>
    );
  }

  if (cajasError) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Error al cargar las cajas
          </div>
        </CardContent>
      </Card>
    );
  }

  // Agrupar cajas por estado
  const cajasAbiertas = aperturasData?.map((apertura) => {
    const caja = cajasData?.data?.find((c) => c.caja_id === apertura.caja);
    return { ...apertura, caja };
  }) || [];

  const cajasCerradas = cajasData?.data?.filter((caja) =>
    !cajasAbiertas.some((apertura) => apertura.caja === caja.caja_id)
  ) || [];

  // Calcular totales
  const totales = cajasAbiertas.reduce(
    (acc, apertura) => ({
      saldoInicial: acc.saldoInicial + parseFloat(apertura.monto_inicial),
      saldoActual: acc.saldoActual + parseFloat(apertura.saldo_actual),
    }),
    { saldoInicial: 0, saldoActual: 0 }
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Cajas</h1>
          <p className="text-gray-600 mt-1">
            Apertura, cierre y control de cajas chicas
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar cajas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-64"
          />
        </div>
      </div>

      {/* Resumen de totales */}
      {cajasAbiertas.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Saldo Inicial Total</CardTitle>
              <div className="text-2xl font-bold">{formatCurrency(totales.saldoInicial.toString())}</div>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Saldo Actual Total</CardTitle>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totales.saldoActual.toString())}</div>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Consumido</CardTitle>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency((totales.saldoInicial - totales.saldoActual).toString())}
              </div>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="abiertas" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="abiertas" className="flex items-center gap-2">
            <ToggleRight className="h-4 w-4" />
            Cajas Abiertas ({cajasAbiertas.length})
          </TabsTrigger>
          <TabsTrigger value="cerradas" className="flex items-center gap-2">
            <ToggleLeft className="h-4 w-4" />
            Cajas Cerradas ({cajasCerradas.length})
          </TabsTrigger>
        </TabsList>

        {/* Cajas Abiertas */}
        <TabsContent value="abiertas">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Cajas Actualmente Abiertas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingAperturas ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Verificando aperturas de caja...</p>
                </div>
              ) : cajasAbiertas.length === 0 ? (
                <div className="text-center py-8">
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <ToggleLeft className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">No hay cajas abiertas</h3>
                    <p className="text-muted-foreground mt-2 max-w-md">
                      No hay cajas actualmente abiertas. Revisa la pestaña de cajas cerradas para abrir una nueva.
                    </p>
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Caja</TableHead>
                      <TableHead>Empresa</TableHead>
                      <TableHead>Fecha Apertura</TableHead>
                      <TableHead>Monto Inicial</TableHead>
                      <TableHead>Saldo Actual</TableHead>
                      <TableHead>Responsable</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cajasAbiertas.map((apertura: any) => (
                      <TableRow key={apertura.id}>
                        <TableCell className="font-medium">
                          {apertura.caja_nombre || apertura.caja}
                        </TableCell>
                        <TableCell>{apertura.empresa_nombre}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(apertura.fecha_apertura)}
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(apertura.monto_inicial)}
                        </TableCell>
                        <TableCell className="font-semibold text-green-600">
                          {formatCurrency(apertura.saldo_actual)}
                        </TableCell>
                        <TableCell>{apertura.responsable_nombre || 'N/A'}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSelectCajaParaCerrar(apertura)}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            Cerrar Caja
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cajas Cerradas */}
        <TabsContent value="cerradas">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cajas Disponibles para Apertura</CardTitle>
            </CardHeader>
            <CardContent>
              {cajasCerradas.length === 0 ? (
                <div className="text-center py-8">
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <DollarSign className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">No hay cajas disponibles</h3>
                    <p className="text-muted-foreground mt-2 max-w-md">
                      Todas las cajas están actualmente abiertas o no hay cajas registradas.
                    </p>
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Empresa</TableHead>
                      <TableHead>Sucursal</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cajasCerradas.map((caja) => (
                      <TableRow key={caja.caja_id}>
                        <TableCell className="font-medium">{caja.codigo_caja}</TableCell>
                        <TableCell>{caja.nombre_caja}</TableCell>
                        <TableCell>{caja.empresa_nombre}</TableCell>
                        <TableCell>{caja.sucursal_nombre}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{caja.tipo_caja_display}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            Activa
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSelectCajaParaAbrir(caja)}
                            className="text-green-600 border-green-200 hover:bg-green-50"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Abrir Caja
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog Apertura de Caja */}
      <Dialog open={isAperturaDialogOpen} onOpenChange={setIsAperturaDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Abrir Caja</DialogTitle>
            <DialogDescription>
              Apertura de caja: {selectedCaja?.nombre_caja}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAbrirCaja}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="monto_inicial">Monto Inicial</Label>
                <Input
                  id="monto_inicial"
                  type="number"
                  step="0.01"
                  min="0"
                  value={aperturaForm.monto_inicial}
                  onChange={(e) =>
                    setAperturaForm({ ...aperturaForm, monto_inicial: e.target.value })
                  }
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="observaciones_apertura">Observaciones (opcional)</Label>
                <Textarea
                  id="observaciones_apertura"
                  value={aperturaForm.observaciones}
                  onChange={(e) =>
                    setAperturaForm({ ...aperturaForm, observaciones: e.target.value })
                  }
                  placeholder="Notas sobre la apertura de caja..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAperturaDialogOpen(false);
                  resetAperturaForm();
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={abrirCajaMutation.isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {abrirCajaMutation.isLoading ? 'Abriendo...' : 'Abrir Caja'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Cierre de Caja */}
      <Dialog open={isCierreDialogOpen} onOpenChange={setIsCierreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cerrar Caja</DialogTitle>
            <DialogDescription>
              Cierre de caja: {selectedApertura?.caja_nombre}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCerrarCaja}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="saldo_final">Saldo Final</Label>
                <Input
                  id="saldo_final"
                  type="number"
                  step="0.01"
                  min="0"
                  value={cierreForm.saldo_final}
                  onChange={(e) =>
                    setCierreForm({ ...cierreForm, saldo_final: e.target.value })
                  }
                  placeholder="0.00"
                  required
                />
                <p className="text-sm text-gray-500">
                  Saldo inicial: {selectedApertura && formatCurrency(selectedApertura.monto_inicial)}
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="observaciones_cierre">Observaciones</Label>
                <Textarea
                  id="observaciones_cierre"
                  value={cierreForm.observaciones}
                  onChange={(e) =>
                    setCierreForm({ ...cierreForm, observaciones: e.target.value })
                  }
                  placeholder="Notas sobre el cierre de caja..."
                  rows={3}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCierreDialogOpen(false);
                  resetCierreForm();
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={cerrarCajaMutation.isLoading}
                className="bg-red-600 hover:bg-red-700"
              >
                {cerrarCajaMutation.isLoading ? 'Cerrando...' : 'Cerrar Caja'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
