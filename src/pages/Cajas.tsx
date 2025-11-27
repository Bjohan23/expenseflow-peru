import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Wallet, Plus, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatCurrency } from '@/lib/format';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CajaForm } from '@/components/forms/CajaForm';
import { CierreCajaDialog } from '@/components/forms/CierreCajaDialog';

export default function Cajas() {
  const [formOpen, setFormOpen] = useState(false);
  const [cierreOpen, setCierreOpen] = useState(false);
  const [selectedCaja, setSelectedCaja] = useState<any>(null);
  const { data: cajas, isLoading } = useQuery({
    queryKey: ['cajas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cajas')
        .select(`
          *,
          sucursal:sucursales(
            codigo,
            nombre,
            empresa:empresas(razon_social, nombre_comercial)
          ),
          responsable:profiles(full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Calcular totales
  const totales = cajas?.reduce(
    (acc, caja) => ({
      saldoInicial: acc.saldoInicial + Number(caja.saldo_inicial),
      saldoActual: acc.saldoActual + Number(caja.saldo_actual),
    }),
    { saldoInicial: 0, saldoActual: 0 }
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cajas Chicas</h1>
          <p className="text-muted-foreground mt-2">
            Gestión de cajas chicas y fondos
          </p>
        </div>
        <LoadingSkeleton type="table" count={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cajas Chicas</h1>
          <p className="text-muted-foreground mt-2">
            Gestión de cajas chicas y fondos
          </p>
        </div>
        <Button onClick={() => {
          setSelectedCaja(null);
          setFormOpen(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Caja
        </Button>
      </div>

      {/* Resumen de totales */}
      {totales && cajas && cajas.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Saldo Inicial Total</CardDescription>
              <CardTitle className="text-2xl">{formatCurrency(totales.saldoInicial)}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Saldo Actual Total</CardDescription>
              <CardTitle className="text-2xl">{formatCurrency(totales.saldoActual)}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Consumido</CardDescription>
              <CardTitle className="text-2xl text-destructive">
                {formatCurrency(totales.saldoInicial - totales.saldoActual)}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Lista de Cajas Chicas</CardTitle>
          <CardDescription>
            Total: {cajas?.length || 0} cajas registradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Sucursal / Empresa</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead>Saldo Inicial</TableHead>
                <TableHead>Saldo Actual</TableHead>
                <TableHead>Consumido</TableHead>
                <TableHead>Fecha Apertura</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cajas?.map((caja) => {
                const consumido = Number(caja.saldo_inicial) - Number(caja.saldo_actual);
                const porcentajeConsumido = (consumido / Number(caja.saldo_inicial)) * 100;

                return (
                  <TableRow key={caja.id}>
                    <TableCell className="font-medium">{caja.codigo}</TableCell>
                    <TableCell>{caja.nombre}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{caja.sucursal?.nombre}</div>
                        <div className="text-sm text-muted-foreground">
                          {caja.sucursal?.empresa?.nombre_comercial || caja.sucursal?.empresa?.razon_social}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{caja.responsable?.full_name || '-'}</TableCell>
                    <TableCell>{formatCurrency(caja.saldo_inicial)}</TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(caja.saldo_actual)}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className={porcentajeConsumido > 80 ? 'text-destructive' : ''}>
                          {formatCurrency(consumido)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {porcentajeConsumido.toFixed(1)}%
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {caja.fecha_apertura ? (
                        format(new Date(caja.fecha_apertura), 'dd/MM/yyyy', { locale: es })
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={caja.estado === 'abierta' ? 'default' : 'secondary'}
                        className={caja.estado === 'abierta' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {caja.estado === 'abierta' ? 'Abierta' : 'Cerrada'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedCaja(caja);
                            setFormOpen(true);
                          }}
                          disabled={caja.estado === 'cerrada'}
                        >
                          Editar
                        </Button>
                        {caja.estado === 'abierta' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedCaja(caja);
                              setCierreOpen(true);
                            }}
                          >
                            <Lock className="w-4 h-4 mr-1" />
                            Cerrar
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {cajas?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Wallet className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No hay cajas chicas registradas</h3>
          <p className="text-muted-foreground mt-2 max-w-md">
            Crea cajas chicas para gestionar fondos de gastos menores en tus sucursales
          </p>
          <Button
            className="mt-4"
            onClick={() => {
              setSelectedCaja(null);
              setFormOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Primera Caja
          </Button>
        </div>
      )}

      <CajaForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelectedCaja(null);
        }}
        caja={selectedCaja}
      />

      <CierreCajaDialog
        open={cierreOpen}
        onClose={() => {
          setCierreOpen(false);
          setSelectedCaja(null);
        }}
        caja={selectedCaja}
      />
    </div>
  );
}
