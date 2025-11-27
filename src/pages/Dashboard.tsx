import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  MapPin,
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  Users,
} from "lucide-react";
import { KPICard } from "@/components/common/KPICard";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/format";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function Dashboard() {
  // Colores para gráficos
  const COLORS = ["#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#ec4899"];

  // Fetch empresas count
  const { data: empresasCount, isLoading: loadingEmpresas } = useQuery({
    queryKey: ["empresas-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("empresas")
        .select("*", { count: "exact", head: true })
        .eq("estado", "activo");
      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch sucursales count
  const { data: sucursalesCount, isLoading: loadingSucursales } = useQuery({
    queryKey: ["sucursales-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("sucursales")
        .select("*", { count: "exact", head: true })
        .eq("estado", "activa");
      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch centros costo count and budget
  const { data: centrosData, isLoading: loadingCentros } = useQuery({
    queryKey: ["centros-costo-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("centros_costo")
        .select("presupuesto_asignado, presupuesto_consumido")
        .eq("estado", "activo");

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
    queryKey: ["conceptos-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("conceptos_gasto")
        .select("*", { count: "exact", head: true })
        .eq("estado", "activo");
      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch conceptos por categoría
  const { data: conceptosPorCategoria } = useQuery({
    queryKey: ["conceptos-por-categoria"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conceptos_gasto")
        .select("categoria")
        .eq("estado", "activo");

      if (error) throw error;

      const categorias: Record<string, number> = {};
      if (data) {
        for (const c of data) {
          categorias[c.categoria] = (categorias[c.categoria] || 0) + 1;
        }
      }

      return Object.entries(categorias).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }));
    },
  });

  // Fetch cajas stats
  const { data: cajasStats } = useQuery({
    queryKey: ["cajas-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cajas")
        .select("saldo_inicial, saldo_actual, estado");

      if (error) throw error;

      const abiertas = data?.filter((c) => c.estado === "abierta").length || 0;
      const cerradas = data?.filter((c) => c.estado === "cerrada").length || 0;
      const totalInicial = data?.reduce((acc, c) => acc + Number(c.saldo_inicial), 0) || 0;
      const totalActual = data?.reduce((acc, c) => acc + Number(c.saldo_actual), 0) || 0;

      return {
        abiertas,
        cerradas,
        totalInicial,
        totalActual,
        totalConsumido: totalInicial - totalActual,
      };
    },
  });

  // Fetch empresas con presupuesto
  const { data: empresasPresupuesto } = useQuery({
    queryKey: ["empresas-presupuesto"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("empresas")
        .select("nombre_comercial, razon_social, limite_gasto_mensual")
        .eq("estado", "activo")
        .order("limite_gasto_mensual", { ascending: false })
        .limit(5);

      if (error) throw error;

      return data?.map((e) => ({
        name: (e.nombre_comercial || e.razon_social).substring(0, 15),
        presupuesto: Number(e.limite_gasto_mensual),
      }));
    },
  });

  // Fetch centros de costo con mayor consumo
  const { data: centrosConsumo } = useQuery({
    queryKey: ["centros-consumo"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("centros_costo")
        .select("nombre, presupuesto_asignado, presupuesto_consumido")
        .eq("estado", "activo")
        .order("presupuesto_consumido", { ascending: false })
        .limit(6);

      if (error) throw error;

      return data?.map((c) => ({
        name: c.nombre.substring(0, 15),
        asignado: Number(c.presupuesto_asignado),
        consumido: Number(c.presupuesto_consumido),
        disponible: Number(c.presupuesto_asignado) - Number(c.presupuesto_consumido),
      }));
    },
  });

  // Fetch usuarios stats
  const { data: usuariosStats } = useQuery({
    queryKey: ["usuarios-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("is_active, role");

      if (error) throw error;

      const activos = data?.filter((u) => u.is_active).length || 0;
      const inactivos = data?.filter((u) => !u.is_active).length || 0;

      const rolesCounts: Record<string, number> = {};
      if (data) {
        for (const u of data) {
          rolesCounts[u.role] = (rolesCounts[u.role] || 0) + 1;
        }
      }

      return {
        total: data?.length || 0,
        activos,
        inactivos,
        porRol: Object.entries(rolesCounts).map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value,
        })),
      };
    },
  });

  const isLoading = loadingEmpresas || loadingSucursales || loadingCentros || loadingConceptos;

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Vista general del sistema de gestión de gastos</p>
      </div>

      {/* KPIs Principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Empresas Activas"
          value={empresasCount || 0}
          icon={Building2}
          variant="primary"
        />
        <KPICard title="Sucursales" value={sucursalesCount || 0} icon={MapPin} variant="success" />
        <KPICard
          title="Centros de Costo"
          value={centrosData?.count || 0}
          icon={DollarSign}
          variant="default"
        />
        <KPICard
          title="Conceptos de Gasto"
          value={conceptosCount || 0}
          icon={CreditCard}
          variant="default"
        />
      </div>

      {/* Estadísticas de Cajas y Usuarios */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cajas Abiertas</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cajasStats?.abiertas || 0}</div>
            <p className="text-xs text-muted-foreground">{cajasStats?.cerradas || 0} cerradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Total Cajas</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(cajasStats?.totalActual || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Inicial: {formatCurrency(cajasStats?.totalInicial || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usuariosStats?.activos || 0}</div>
            <p className="text-xs text-muted-foreground">Total: {usuariosStats?.total || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos - Primera Fila */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Gráfico de Presupuesto por Centro de Costo */}
        <Card>
          <CardHeader>
            <CardTitle>Top Centros de Costo</CardTitle>
            <CardDescription>Presupuesto asignado vs consumido</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={centrosConsumo || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                  }}
                />
                <Legend />
                <Bar dataKey="asignado" fill="#8b5cf6" name="Asignado" />
                <Bar dataKey="consumido" fill="#ef4444" name="Consumido" />
                <Bar dataKey="disponible" fill="#10b981" name="Disponible" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Conceptos por Categoría */}
        <Card>
          <CardHeader>
            <CardTitle>Conceptos por Categoría</CardTitle>
            <CardDescription>Distribución de conceptos de gasto</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={conceptosPorCategoria || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {(conceptosPorCategoria || []).map((entry, index) => (
                    <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos - Segunda Fila */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Gráfico de Presupuesto por Empresa */}
        <Card>
          <CardHeader>
            <CardTitle>Top Empresas</CardTitle>
            <CardDescription>Límite de gasto mensual por empresa</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={empresasPresupuesto || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                  }}
                />
                <Bar dataKey="presupuesto" fill="#3b82f6" name="Presupuesto Mensual" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Usuarios por Rol */}
        <Card>
          <CardHeader>
            <CardTitle>Usuarios por Rol</CardTitle>
            <CardDescription>Distribución de roles en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={usuariosStats?.porRol || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {(usuariosStats?.porRol || []).map((entry, index) => (
                    <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Resumen de Consumo Total */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Consumo</CardTitle>
          <CardDescription>Análisis financiero general del sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Total en Cajas</p>
              <p className="text-2xl font-bold">{formatCurrency(cajasStats?.totalActual || 0)}</p>
              <div className="flex items-center text-xs">
                <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                <span className="text-red-500">
                  {formatCurrency(cajasStats?.totalConsumido || 0)} consumido
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Presupuesto Centros</p>
              <p className="text-2xl font-bold">
                {formatCurrency((centrosConsumo || []).reduce((acc, c) => acc + c.asignado, 0))}
              </p>
              <div className="flex items-center text-xs">
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                <span className="text-green-500">
                  {formatCurrency((centrosConsumo || []).reduce((acc, c) => acc + c.disponible, 0))}{" "}
                  disponible
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Eficiencia</p>
              <p className="text-2xl font-bold">
                {cajasStats?.totalInicial
                  ? Math.round((cajasStats.totalActual / cajasStats.totalInicial) * 100)
                  : 0}
                %
              </p>
              <p className="text-xs text-muted-foreground">Saldo remanente en cajas</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
