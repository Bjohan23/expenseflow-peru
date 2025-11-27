import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, Plus, Tag } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { StatusBadge } from '@/components/common/StatusBadge';
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
import { Badge } from '@/components/ui/badge';
import { ConceptoGastoForm } from '@/components/forms/ConceptoGastoForm';

const categoriaLabels = {
  viaticos: 'Viáticos',
  transporte: 'Transporte',
  alimentacion: 'Alimentación',
  hospedaje: 'Hospedaje',
  otros: 'Otros',
};

const categoriaColors = {
  viaticos: 'bg-blue-100 text-blue-800',
  transporte: 'bg-green-100 text-green-800',
  alimentacion: 'bg-orange-100 text-orange-800',
  hospedaje: 'bg-purple-100 text-purple-800',
  otros: 'bg-gray-100 text-gray-800',
};

export default function ConceptosGasto() {
  const [formOpen, setFormOpen] = useState(false);
  const [selectedConcepto, setSelectedConcepto] = useState<any>(null);

  const { data: conceptos, isLoading } = useQuery({
    queryKey: ['conceptos-gasto'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conceptos_gasto')
        .select(`
          *,
          centro_costo:centros_costo(codigo, nombre)
        `)
        .order('categoria', { ascending: true })
        .order('codigo', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Conceptos de Gasto</h1>
          <p className="text-muted-foreground mt-2">
            Gestión de conceptos y categorías de gastos
          </p>
        </div>
        <LoadingSkeleton type="table" count={5} />
      </div>
    );
  }

  // Agrupar conceptos por categoría
  const conceptosPorCategoria = conceptos?.reduce((acc, concepto) => {
    const categoria = concepto.categoria;
    if (!acc[categoria]) {
      acc[categoria] = [];
    }
    acc[categoria].push(concepto);
    return acc;
  }, {} as Record<string, typeof conceptos>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Conceptos de Gasto</h1>
          <p className="text-muted-foreground mt-2">
            Gestión de conceptos y categorías de gastos
          </p>
        </div>
        <Button onClick={() => {
          setSelectedConcepto(null);
          setFormOpen(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Concepto
        </Button>
      </div>

      {conceptosPorCategoria && Object.keys(conceptosPorCategoria).length > 0 ? (
        Object.entries(conceptosPorCategoria).map(([categoria, items]) => (
          <Card key={categoria}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Tag className="w-5 h-5" />
                  <div>
                    <CardTitle>{categoriaLabels[categoria as keyof typeof categoriaLabels]}</CardTitle>
                    <CardDescription>{items.length} conceptos</CardDescription>
                  </div>
                </div>
                <Badge className={categoriaColors[categoria as keyof typeof categoriaColors]}>
                  {categoria}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Centro de Costo</TableHead>
                    <TableHead>Límite Máximo</TableHead>
                    <TableHead>Requiere Aprobación</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((concepto) => (
                    <TableRow key={concepto.id}>
                      <TableCell className="font-medium">{concepto.codigo}</TableCell>
                      <TableCell>{concepto.nombre}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {concepto.descripcion || '-'}
                      </TableCell>
                      <TableCell>
                        {concepto.centro_costo ? (
                          <div>
                            <div className="font-medium">{concepto.centro_costo.codigo}</div>
                            <div className="text-sm text-muted-foreground">{concepto.centro_costo.nombre}</div>
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {concepto.limite_maximo ? formatCurrency(concepto.limite_maximo) : 'Sin límite'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={concepto.requiere_aprobacion ? 'default' : 'secondary'}>
                          {concepto.requiere_aprobacion ? 'Sí' : 'No'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={concepto.estado} />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedConcepto(concepto);
                            setFormOpen(true);
                          }}
                        >
                          Editar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <DollarSign className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No hay conceptos de gasto registrados</h3>
          <p className="text-muted-foreground mt-2 max-w-md">
            Define conceptos de gasto para categorizar y controlar los gastos de la empresa
          </p>
          <Button
            className="mt-4"
            onClick={() => {
              setSelectedConcepto(null);
              setFormOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Primer Concepto
          </Button>
        </div>
      )}

      <ConceptoGastoForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelectedConcepto(null);
        }}
        concepto={selectedConcepto}
      />
    </div>
  );
}
