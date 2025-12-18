import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  DollarSign,
  Receipt,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Building2,
  Eye,
  ArrowRight,
  Activity,
  Calendar,
  FileText
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KPICard } from '@/components/common/KPICard';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { Badge } from '@/components/ui/badge';
import { treasuryService } from '@/services/treasury.service';
import { Gasto, AsignacionFondo, EstadoGasto } from '@/types/treasury';
import { formatCurrency, formatDate } from '@/utils/format';

interface DashboardStats {
  total_mes: string;
  gastos_pendientes: number;
  gastos_aprobados: number;
  total_por_aprobar: string;
  fondos_pendientes: number;
  gastos_por_categoria: Array<{
    categoria: string;
    total: string;
    cantidad: number;
  }>;
  ultimos_gastos: Gasto[];
}

export default function Dashboard() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-statistics'],
    queryFn: () => treasuryService.getGastosStatistics(),
  });

  const { data: asignacionesStats } = useQuery({
    queryKey: ['asignaciones-statistics'],
    queryFn: () => treasuryService.getAsignacionesStatistics(),
  });

  // Additional statistics
  const { data: cajasStats } = useQuery({
    queryKey: ['cajas-statistics'],
    queryFn: () => treasuryService.getCajasStatistics(),
  });

  const { data: aperturasStats } = useQuery({
    queryKey: ['aperturas-cajas-statistics'],
    queryFn: () => treasuryService.getAperturasCajasStatistics(),
  });

  const { data: movimientosStats } = useQuery({
    queryKey: ['movimientos-statistics'],
    queryFn: () => treasuryService.getMovimientosStatistics(),
  });

  const { data: retirosStats } = useQuery({
    queryKey: ['retiros-statistics'],
    queryFn: () => treasuryService.getRetirosStatistics(),
  });

  const { data: categoriasStats } = useQuery({
    queryKey: ['categorias-gasto-statistics'],
    queryFn: () => treasuryService.getCategoriasGastoStatistics(),
  });

  const { data: transferenciasStats } = useQuery({
    queryKey: ['transferencias-statistics'],
    queryFn: () => treasuryService.getTransferenciasStatistics(),
  });

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p>No estás autenticado</p>
          <Button onClick={() => navigate('/login')} className="mt-4">
            Ir al Login
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const dashboardStats = stats as DashboardStats;
  const ultimosGastos = dashboardStats?.ultimos_gastos || [];

  // Calculate additional statistics from real endpoints
  const totalAsignado = asignacionesStats?.total_asignado || '0';
  const totalRendido = asignacionesStats?.total_rendido || '0';
  const saldoPendiente = asignacionesStats?.saldo_pendiente || '0';
  const fondosPendientes = asignacionesStats?.fondos_pendientes || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Bienvenido, {user?.email || 'Usuario'} | Sistema de Gestión Treasury
          </p>
        </div>
      </div>

      {/* Main KPI Cards - First Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total del Mes"
          value={formatCurrency(dashboardStats?.total_mes || '0')}
          icon={TrendingUp}
          variant="success"
        />
        <KPICard
          title="Gastos Pendientes"
          value={dashboardStats?.gastos_pendientes || 0}
          icon={Clock}
          variant="warning"
        />
        <KPICard
          title="Total Fondos Asignados"
          value={formatCurrency(totalAsignado)}
          icon={DollarSign}
          variant="primary"
        />
        <KPICard
          title="Fondos por Rendir"
          value={fondosPendientes}
          icon={AlertTriangle}
          variant="secondary"
        />
      </div>

      {/* Additional KPI Cards - Second Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Cajas"
          value={cajasStats?.total_cajas || 0}
          icon={Building2}
          variant="default"
        />
        <KPICard
          title="Aperturas de Caja (24h)"
          value={aperturasStats?.aperturas_caja_last_24h || 0}
          icon={Calendar}
          variant="success"
        />
        <KPICard
          title="Movimientos (24h)"
          value={movimientosStats?.movimientos_caja_last_24h || 0}
          icon={Activity}
          variant="primary"
        />
        <KPICard
          title="Categorías de Gasto"
          value={categoriasStats?.total_categorias_gasto || 0}
          icon={FileText}
          variant="outline"
        />
      </div>

      {/* Financial Summary KPIs - Third Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard
          title="Total Retiros"
          value={retirosStats?.total_withdrawals || 0}
          icon={DollarSign}
          variant="warning"
        />
        <KPICard
          title="Monto Total Retiros"
          value={formatCurrency(retirosStats?.total_amount?.toString() || '0')}
          icon={TrendingUp}
          variant="destructive"
        />
        <KPICard
          title="Transferencias (24h)"
          value={transferenciasStats?.transferencias_efectivo_last_24h || 0}
          icon={ArrowRight}
          variant="secondary"
        />
      </div>

      {/* Detailed Statistics by Time Period */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Last 24 Hours Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Actividad Últimas 24h
            </CardTitle>
            <CardDescription>
              Actividad reciente del sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Aperturas de caja:</span>
              <Badge variant="secondary">{aperturasStats?.aperturas_caja_last_24h || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Movimientos:</span>
              <Badge variant="primary">{movimientosStats?.movimientos_caja_last_24h || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Transferencias:</span>
              <Badge variant="outline">{transferenciasStats?.transferencias_efectivo_last_24h || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Retiros autorizados:</span>
              <Badge variant="success">{retirosStats?.by_status?.autorizado || 0}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Resumen Semanal
            </CardTitle>
            <CardDescription>
              Actividad de los últimos 7 días
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Cajas agregadas:</span>
              <Badge variant="default">{cajasStats?.cajas_last_week || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Aperturas:</span>
              <Badge variant="secondary">{aperturasStats?.aperturas_caja_last_week || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Movimientos:</span>
              <Badge variant="primary">{movimientosStats?.movimientos_caja_last_week || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Transferencias:</span>
              <Badge variant="outline">{transferenciasStats?.transferencias_efectivo_last_week || 0}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* System Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Estado General del Sistema
            </CardTitle>
            <CardDescription>
              Totales acumulados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Total cajas:</span>
              <Badge variant="default">{cajasStats?.total_cajas || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Total movimientos:</span>
              <Badge variant="primary">{movimientosStats?.total_movimientos_caja || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Categorías de gasto:</span>
              <Badge variant="outline">{categoriasStats?.total_categorias_gasto || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Promedio retiros:</span>
              <Badge variant="warning">{formatCurrency(retirosStats?.average_amount?.toString() || '0')}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expense Categories and Funds Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Gastos por Categoría
            </CardTitle>
            <CardDescription>
              Distribución de gastos del mes actual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardStats?.gastos_por_categoria?.slice(0, 5).map((cat, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{cat.categoria}</p>
                    <p className="text-sm text-gray-600">{cat.cantidad} transacciones</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(cat.total)}</p>
                    <p className="text-xs text-gray-500">
                      {((parseFloat(cat.total) / parseFloat(dashboardStats.total_mes || '0')) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Funds Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Estado de Fondos
            </CardTitle>
            <CardDescription>
              Resumen de asignaciones y rendiciones
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Asignado:</span>
              <span className="font-semibold text-primary">{formatCurrency(totalAsignado)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Rendido:</span>
              <span className="font-semibold text-green-600">{formatCurrency(totalRendido)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Saldo Pendiente:</span>
              <span className="font-semibold text-orange-600">{formatCurrency(saldoPendiente)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Fondos por Rendir:</span>
              <Badge variant={fondosPendientes > 0 ? "secondary" : "success"}>
                {fondosPendientes}
              </Badge>
            </div>
            <div className="pt-3 border-t">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/asignaciones-fondo')}
              >
                <Eye className="h-4 w-4 mr-2" />
                Ver Asignaciones
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Expenses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Últimos Gastos
            </CardTitle>
            <CardDescription>
              Transacciones más recientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ultimosGastos.slice(0, 5).map((gasto) => (
                <div key={gasto.gasto_id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-sm">{gasto.glosa}</p>
                    <p className="text-xs text-gray-500">
                      {gasto.responsable_nombre} • {formatDate(gasto.fecha_gasto)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{formatCurrency(gasto.importe)}</p>
                    <Badge variant="outline" className="text-xs">
                      {gasto.estado_display}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/gastos')}
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Ver Todos los Gastos
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Acciones Rápidas
            </CardTitle>
            <CardDescription>
              Acciones más comunes del sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => navigate('/gastos/nuevo')}
            >
              <Receipt className="h-4 w-4 mr-2" />
              Registrar Nuevo Gasto
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => navigate('/asignaciones-fondo')}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Ver Asignaciones de Fondo
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => navigate('/conceptos-gasto')}
            >
              <FileText className="h-4 w-4 mr-2" />
              Gestionar Categorías
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => navigate('/cajas')}
            >
              <Building2 className="h-4 w-4 mr-2" />
              Administrar Cajas
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle>Información de Sesión</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Usuario:</span>
              <p className="text-gray-600">{user?.email}</p>
            </div>
            <div>
              <span className="font-medium">Estado:</span>
              <p className="text-green-600">Autenticado ✅</p>
            </div>
            <div>
              <span className="font-medium">Último acceso:</span>
              <p className="text-gray-600">{formatDate(new Date().toISOString())}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}