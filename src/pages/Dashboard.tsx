import { useQuery } from '@tanstack/react-query';
import { Building2, MapPin, CreditCard, DollarSign } from 'lucide-react';
import { KPICard } from '@/components/common/KPICard';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/format';

export default function Dashboard() {
  // Fetch empresas count
  const { data: empresasCount, isLoading: loadingEmpresas } = useQuery({
    queryKey: ['empresas-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('empresas')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'activo');
      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch sucursales count
  const { data: sucursalesCount, isLoading: loadingSucursales } = useQuery({
    queryKey: ['sucursales-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('sucursales')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'activa');
      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch centros costo count and budget
  const { data: centrosData, isLoading: loadingCentros } = useQuery({
    queryKey: ['centros-costo-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('centros_costo')
        .select('presupuesto_asignado, presupuesto_consumido')
        .eq('estado', 'activo');
      
      if (error) throw error;
      
      const total = data?.reduce((acc, c) => acc + Number(c.presupuesto_asignado), 0) || 0;
      const consumido = data?.reduce((acc, c) => acc + Number(c.presupuesto_consumido), 0) || 0;
      
      return {
        count: data?.length || 0,
        total,
        consumido,
      };
    },
  });

  // Fetch conceptos count
  const { data: conceptosCount, isLoading: loadingConceptos } = useQuery({
    queryKey: ['conceptos-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('conceptos_gasto')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'activo');
      if (error) throw error;
      return count || 0;
    },
  });

  const isLoading = loadingEmpresas || loadingSucursales || loadingCentros || loadingConceptos;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Resumen general del sistema de gastos
          </p>
        </div>
        <LoadingSkeleton type="card" count={4} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Resumen general del sistema de gastos
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Empresas Activas"
          value={empresasCount || 0}
          icon={Building2}
          variant="primary"
        />
        
        <KPICard
          title="Sucursales Activas"
          value={sucursalesCount || 0}
          icon={MapPin}
          variant="success"
        />
        
        <KPICard
          title="Centros de Costo"
          value={centrosData?.count || 0}
          icon={CreditCard}
          variant="default"
        />
        
        <KPICard
          title="Conceptos de Gasto"
          value={conceptosCount || 0}
          icon={DollarSign}
          variant="default"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border-2 rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold">Presupuesto Global</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Total Asignado</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(centrosData?.total || 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Consumido</p>
              <p className="text-2xl font-bold">
                {formatCurrency(centrosData?.consumido || 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Disponible</p>
              <p className="text-2xl font-bold text-success">
                {formatCurrency((centrosData?.total || 0) - (centrosData?.consumido || 0))}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card border-2 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Accesos Rápidos</h3>
          <div className="grid grid-cols-2 gap-3">
            <a
              href="/empresas"
              className="p-4 bg-primary-light rounded-lg hover:bg-primary-light/80 transition-colors"
            >
              <Building2 className="w-6 h-6 text-primary mb-2" />
              <p className="text-sm font-medium">Empresas</p>
            </a>
            <a
              href="/sucursales"
              className="p-4 bg-success-light rounded-lg hover:bg-success-light/80 transition-colors"
            >
              <MapPin className="w-6 h-6 text-success mb-2" />
              <p className="text-sm font-medium">Sucursales</p>
            </a>
            <a
              href="/centros-costo"
              className="p-4 bg-secondary-light rounded-lg hover:bg-secondary-light/80 transition-colors"
            >
              <CreditCard className="w-6 h-6 text-secondary mb-2" />
              <p className="text-sm font-medium">Centros de Costo</p>
            </a>
            <a
              href="/conceptos-gasto"
              className="p-4 bg-warning-light rounded-lg hover:bg-warning-light/80 transition-colors"
            >
              <DollarSign className="w-6 h-6 text-warning mb-2" />
              <p className="text-sm font-medium">Conceptos</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
