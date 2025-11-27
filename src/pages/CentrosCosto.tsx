import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CreditCard, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ProgressBar } from '@/components/common/ProgressBar';
import { formatCurrency } from '@/lib/format';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CentroCostoForm } from '@/components/forms/CentroCostoForm';

export default function CentrosCosto() {
  const [formOpen, setFormOpen] = useState(false);
  const [selectedCentroCosto, setSelectedCentroCosto] = useState<any>(null);
  const { data: centros, isLoading } = useQuery({
    queryKey: ['centros-costo'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('centros_costo')
        .select(`
          *,
          empresa:empresas(razon_social, nombre_comercial),
          responsable:profiles(full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Centros de Costo</h1>
          <p className="text-muted-foreground mt-2">
            Gestión de centros de costo y presupuestos
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
          <h1 className="text-3xl font-bold tracking-tight">Centros de Costo</h1>
          <p className="text-muted-foreground mt-2">
            Gestión de centros de costo y presupuestos
          </p>
        </div>
        <Button onClick={() => {
          setSelectedCentroCosto(null);
          setFormOpen(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Centro de Costo
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Centros de Costo</CardTitle>
          <CardDescription>
            Total: {centros?.length || 0} centros de costo registrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead>Presupuesto</TableHead>
                <TableHead>Consumido</TableHead>
                <TableHead>Disponible</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {centros?.map((centro) => {
                const presupuesto = Number(centro.presupuesto_asignado);
                const consumido = Number(centro.presupuesto_consumido);
                const disponible = presupuesto - consumido;
                const porcentajeUsado = presupuesto > 0 ? (consumido / presupuesto) * 100 : 0;

                return (
                  <TableRow key={centro.id}>
                    <TableCell className="font-medium">{centro.codigo}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{centro.nombre}</div>
                        {centro.descripcion && (
                          <div className="text-sm text-muted-foreground">{centro.descripcion}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {centro.empresa?.nombre_comercial || centro.empresa?.razon_social || '-'}
                    </TableCell>
                    <TableCell>{centro.responsable?.full_name || '-'}</TableCell>
                    <TableCell>{formatCurrency(presupuesto)}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div>{formatCurrency(consumido)}</div>
                        <ProgressBar value={porcentajeUsado} max={100} />
                      </div>
                    </TableCell>
                    <TableCell className={disponible < presupuesto * 0.2 ? 'text-destructive font-semibold' : ''}>
                      {formatCurrency(disponible)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={centro.estado} />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedCentroCosto(centro);
                          setFormOpen(true);
                        }}
                      >
                        Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {centros?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <CreditCard className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No hay centros de costo registrados</h3>
          <p className="text-muted-foreground mt-2 max-w-md">
            Crea centros de costo para asignar y controlar presupuestos
          </p>
          <Button
            className="mt-4"
            onClick={() => {
              setSelectedCentroCosto(null);
              setFormOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Primer Centro de Costo
          </Button>
        </div>
      )}

      <CentroCostoForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelectedCentroCosto(null);
        }}
        centroCosto={selectedCentroCosto}
      />
    </div>
  );
}
