import { Navigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useLogin } from '@/hooks/useAuth';
import { loginCredentialsSchema, type LoginCredentials, AuthResponse } from '@/types/api';

export default function Login() {
  const { user } = useAuth();
  const login = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>({
    resolver: zodResolver(loginCredentialsSchema),
  });

  const onSubmit = async (data: LoginCredentials) => {
    try {
      const result = await login.mutateAsync(data);

      // After successful login, store tokens and navigate
      if (result) {
        const authData = result as AuthResponse;
        const { access, refresh } = authData;

        // Store tokens
        localStorage.setItem('auth_token', access);
        localStorage.setItem('refresh_token', refresh);

        // Navigate to dashboard - user profile will be fetched by AuthContext
        window.location.href = '/dashboard';
      }
    } catch (error) {
      // Error handling is done by the mutation hook
      console.error('Login error:', error);
    }
  };

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="flex justify-center">
          <Building2 className="h-12 w-12 text-blue-600" />
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Iniciar Sesión</CardTitle>
            <CardDescription>
              Ingresa tus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="username">Usuario</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Ingresa tu usuario"
                  {...register('username')}
                  className="mt-1"
                />
                {errors.username && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.username.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  {...register('password')}
                  className="mt-1"
                />
                {errors.password && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={login.isPending}
              >
                {login.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>
            </form>

            {login.error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">
                  {login.error.message || 'Login failed'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            ¿No tienes una cuenta?{' '}
            <Link
              to="/register"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}