import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { initializeServices, getAuthService } from '@/services';
import { apiClient } from '@/lib/api-client';
import {
  AuthContextValue,
  AuthState,
  LoginCredentials,
  JWTPayload
} from '@/types/api';

// Token storage keys
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Protected routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/empresas',
  '/sucursales',
  '/centros-costo',
  '/conceptos-gasto',
  '/gastos',
  '/cajas',
  '/usuarios',
  '/empresa-usuarios',
];

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
    error: null,
  });

  // Check if current route requires authentication
  const requiresAuth = PROTECTED_ROUTES.some(route =>
    location.pathname.startsWith(route)
  );

  // Check if token is expired
  const isTokenExpired = (token: string): boolean => {
    try {
      const decoded = jwtDecode<JWTPayload>(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch {
      return true;
    }
  };

  // Get tokens from storage
  const getTokens = () => {
    const accessToken = localStorage.getItem(TOKEN_KEY);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    return { accessToken, refreshToken };
  };

  // Set tokens to storage
  const setTokens = (accessToken: string, refreshToken: string) => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  };

  // Clear tokens from storage
  const clearTokens = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  };

  // Initialize services
  useEffect(() => {
    initializeServices(apiClient);
  }, []);

  // Initialize authentication
  useEffect(() => {
    const initAuth = async () => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const { accessToken } = getTokens();

        if (accessToken && !isTokenExpired(accessToken)) {
          setState({
            isAuthenticated: true,
            user: null,
            isLoading: false,
            error: null,
          });
        } else {
          clearTokens();
          setState({
            isAuthenticated: false,
            user: null,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        clearTokens();
        setState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
          error: 'Authentication initialization failed',
        });
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials) => {
    try {
      const authService = getAuthService();
      const result = await authService.login(credentials);

      if (result.success && result.data) {
        setTokens(result.data.access, result.data.refresh);

        setState({
          isAuthenticated: true,
          user: null,
          isLoading: false,
          error: null,
        });

        return { success: true };
      } else {
        setState(prev => ({
          ...prev,
          error: result.error || 'Login failed'
        }));
        return { success: false, error: result.error };
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || error.message || 'Login failed';
      setState(prev => ({
        ...prev,
        error: errorMsg
      }));
      return { success: false, error: errorMsg };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      const authService = getAuthService();
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearTokens();
      setState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: null,
      });
      navigate('/login', { replace: true });
    }
  };

  // Refresh token function
  const refreshToken = async () => {
    const { refreshToken: token } = getTokens();

    if (!token) {
      throw new Error('No refresh token available');
    }

    const authService = getAuthService();
    const result = await authService.refreshToken(token);

    if (result.success && result.data) {
      setTokens(result.data.access, result.data.refresh || token);
      return result.data.access;
    } else {
      throw new Error(result.error || 'Token refresh failed');
    }
  };

  // Clear error function
  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  // Role checking functions
  const hasRole = (role: string): boolean => {
    return state.user?.groups?.includes(role) || false;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return state.user ? roles.some(r => state.user.groups?.includes(r)) : false;
  };

  // Redirect logic - simplified to prevent infinite loops
  useEffect(() => {
    // Only redirect when not loading and authentication state is clear
    if (!state.isLoading) {
      // If user is not authenticated and tries to access protected route
      if (!state.isAuthenticated && requiresAuth && location.pathname !== '/login') {
        navigate('/login', {
          state: { from: location },
          replace: true
        });
      }
      // If user is authenticated and tries to access login page
      else if (state.isAuthenticated && location.pathname === '/login') {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [state.isLoading, state.isAuthenticated, requiresAuth, location.pathname, navigate]);

  const contextValue: AuthContextValue = {
    ...state,
    login,
    logout,
    refreshToken,
    clearError,
    hasRole,
    hasAnyRole,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};