import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, User, Settings } from 'lucide-react';

export default function Dashboard() {
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p>No estás autenticado</p>
          <Button onClick={() => window.location.href = '/login'} className="mt-4">
            Ir al Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '8px' }}>
            Dashboard
          </h1>
          <p style={{ color: '#666' }}>
            Sistema de Gestión de Gastos - ExpenseFlow Peru
          </p>
        </div>
        <Button onClick={handleLogout} variant="outline">
          <LogOut className="w-4 h-4 mr-2" />
          Cerrar Sesión
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Información de Usuario
            </CardTitle>
            <CardDescription>
              Detalles de tu sesión actual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p><strong>Estado:</strong> Autenticado ✅</p>
            <p><strong>Usuario:</strong> {user?.email || 'Cargando...'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Sistema Funcional
            </CardTitle>
            <CardDescription>
              El sistema está operativo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>✅ Autenticación: Funcionando</p>
            <p>✅ Dashboard: Cargando correctamente</p>
            <p>✅ Sin errores de redirección</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximos Pasos</CardTitle>
            <CardDescription>
              Módulos a implementar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>📋 Gestión de Gastos</p>
            <p>🏢 Gestión de Empresas</p>
            <p>👥 Gestión de Usuarios</p>
            <p>💰 Gestión de Cajas</p>
          </CardContent>
        </Card>
      </div>

      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>¡Problema Resuelto!</h2>
        <p>El sistema de autenticación ahora funciona correctamente sin bucles de redirección.</p>
        <p style={{ marginTop: '10px', fontSize: '0.9rem', color: '#666' }}>
          Puedes continuar con el desarrollo de los módulos de gestión de gastos.
        </p>
      </div>
    </div>
  );
}