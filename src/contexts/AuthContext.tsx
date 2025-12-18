import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import {
  AuthContextValue,
  AuthState,
  LoginCredentials,
  UserProfile,
  JWTPayload
} from '@/types/api';
import { authService } from '@/services/services';

// Token storage keys
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_profile';

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

// Map groups to role
const mapGroupsToRole = (groups: string[]): string => {
  if (groups.includes('Administrador')) return 'admin';
  if (groups.includes('Responsable')) return 'responsable';
  if (groups.includes('Aprobador')) return 'aprobador';
  return 'colaborador';
};

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

  const [refreshTimer, setRefreshTimer] = useState<NodeJS.Timeout | null>(null);

  // Check if current route requires authentication
  const requiresAuth = PROTECTED_ROUTES.some(route =>
    location.pathname.startsWith(route)
  );

  // Token management utilities
  const getTokens = useCallback(() => {
    const accessToken = localStorage.getItem(TOKEN_KEY);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    return { accessToken, refreshToken };
  }, []);

  const setTokens = useCallback((accessToken: string, refreshToken: string) => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }, []);

  const clearTokens = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }, []);

  const getUserFromStorage = useCallback((): UserProfile | null => {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }, []);

  const setUserInStorage = useCallback((user: UserProfile) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }, []);

  // Check if token is expired
  const isTokenExpired = useCallback((token: string): boolean => {
    try {
      const decoded = jwtDecode<JWTPayload>(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch {
      return true; // If token can't be decoded, consider it expired
    }
  }, []);

  // Auto-refresh token mechanism
  const setupTokenRefresh = useCallback((accessToken: string) => {
    try {
      const decoded = jwtDecode<JWTPayload>(accessToken);
      const currentTime = Date.now() / 1000;
      const timeUntilExpiry = decoded.exp - currentTime;

      // Refresh token 5 minutes before it expires
      const refreshTime = Math.max(timeUntilExpiry - 300, 60) * 1000; // Convert to milliseconds

      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }

      const timer = setTimeout(() => {
        refreshToken();
      }, refreshTime);

      setRefreshTimer(timer);
    } catch (error) {
      console.error('Error setting up token refresh:', error);
    }
  }, [refreshTimer]);

  // Refresh token
  const refreshToken = useCallback(async () => {
    const { refreshToken: token } = getTokens();

    if (!token) {
      console.warn('No refresh token available');
      // Clear tokens and redirect manually to avoid circular dependency
      clearTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return;
    }

    try {
      const result = await authService.refreshToken(token);

      if (result.success && result.data) {
        setTokens(result.data.access, result.data.refresh || token);
        setupTokenRefresh(result.data.access);
      } else {
        console.error('Token refresh failed:', result.error);
        // Clear tokens and redirect manually to avoid circular dependency
        clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      // Clear tokens and redirect manually to avoid circular dependency
      clearTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }, [getTokens, setTokens, setupTokenRefresh, clearTokens]);

  // Initialize authentication state
  const initializeAuth = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { accessToken } = getTokens();

      if (accessToken && !isTokenExpired(accessToken)) {
        setState({
          isAuthenticated: true,
          user: null, // No user profile for now
          isLoading: false,
          error: null,
        });
        setupTokenRefresh(accessToken);
      } else if (accessToken) {
        // Token exists but is expired, try to refresh
        const { refreshToken: token } = getTokens();

        if (!token) {
          clearTokens();
          setState({
            isAuthenticated: false,
            user: null,
            isLoading: false,
            error: null,
          });
          return;
        }

        try {
          const result = await authService.refreshToken(token);

          if (result.success && result.data) {
            setTokens(result.data.access, result.data.refresh || token);
            setupTokenRefresh(result.data.access);
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
        } catch (refreshError) {
          console.error('Token refresh error during init:', refreshError);
          clearTokens();
          setState({
            isAuthenticated: false,
            user: null,
            isLoading: false,
            error: null,
          });
        }
      } else {
        // No token, user is not authenticated
        setState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: 'Authentication initialization failed',
      });
      clearTokens();
    }
  }, [getTokens, isTokenExpired, setupTokenRefresh, clearTokens, setTokens]);

  
  // Login function (legacy, for backward compatibility)
  const login = useCallback(async (credentials: LoginCredentials) => {
    // This function should not be used anymore
    // Use useLogin hook instead
    setState(prev => ({ ...prev, error: 'Please use useLogin hook instead of login function' }));
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      // Call logout endpoint (optional, doesn't affect local state)
      await authService.logout();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear local state regardless of API call success
      clearTokens();

      if (refreshTimer) {
        clearTimeout(refreshTimer);
        setRefreshTimer(null);
      }

      setState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: null,
      });

      // Redirect to login page
      navigate('/login', { replace: true });
    }
  }, [clearTokens, refreshTimer, navigate]);

  // Clear error function
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Check if user has specific role/permission
  const hasRole = useCallback((role: string): boolean => {
    return state.user?.role === role;
  }, [state.user]);

  const hasAnyRole = useCallback((roles: string[]): boolean => {
    return state.user ? roles.includes(state.user.role) : false;
  }, [state.user]);

  // Redirect logic for protected routes
  useEffect(() => {
    if (!state.isLoading && requiresAuth && !state.isAuthenticated) {
      // Redirect to login with return URL
      navigate('/login', {
        state: { from: location },
        replace: true
      });
    } else if (!state.isLoading && state.isAuthenticated && location.pathname === '/login') {
      // Redirect authenticated users away from login page
      navigate('/dashboard', { replace: true });
    }
  }, [state.isLoading, state.isAuthenticated, requiresAuth, navigate, location]);

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Cleanup refresh timer on unmount
  useEffect(() => {
    return () => {
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }
    };
  }, [refreshTimer]);

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

// Convenience hooks for role checking
export const useAuthRoles = () => {
  const { user } = useAuth();

  return {
    isAdmin: user?.role === 'admin',
    isResponsable: user?.role === 'responsable',
    isAprobador: user?.role === 'aprobador',
    isColaborador: user?.role === 'colaborador',
    canApproveExpenses: user?.role === 'aprobador' || user?.role === 'responsable' || user?.role === 'admin',
    canManageUsers: user?.role === 'admin',
    canManageCompanies: user?.role === 'responsable' || user?.role === 'admin',
  };
};