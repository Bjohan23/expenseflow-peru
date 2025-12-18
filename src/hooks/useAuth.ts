import {
  useQuery,
  useMutation,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import { LoginCredentials } from '@/types/api';
import { authService } from '@/services/services';
import { useAuth as useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Query keys for authentication
export const authKeys = {
  all: ['auth'] as const,
  profile: () => [...authKeys.all, 'profile'] as const,
  token: () => [...authKeys.all, 'token'] as const,
} as const;

// Default query options
const defaultQueryOptions = {
  staleTime: 1000 * 60 * 5, // 5 minutes
  gcTime: 1000 * 60 * 10, // 10 minutes
  retry: 1, // Only retry auth requests once
};

// Default mutation options
const defaultMutationOptions = {
  onError: (error: Error) => {
    console.error('Auth mutation error:', error);
    toast.error(error.message || 'Authentication failed');
  },
};

// Get user profile hook
export const useUserProfile = (
  options?: Omit<UseQueryOptions<any, Error, any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: async () => {
      const result = await authService.getUserProfile();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch user profile');
      }
      return result.data;
    },
    enabled: false, // Don't automatically fetch profile
    ...defaultQueryOptions,
    ...options,
  });
};

// Login mutation hook
export const useLogin = (
  options?: UseMutationOptions<
    any,
    Error,
    LoginCredentials
  >
) => {
  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      // Use the auth service directly for HTTP request
      const result = await authService.login(credentials);

      if (!result.success) {
        throw new Error(result.error || 'Login failed');
      }

      return result.data;
    },
    onSuccess: (data) => {
      toast.success('Login successful');
    },
    ...defaultMutationOptions,
    ...options,
  });
};

// Logout mutation hook
export const useLogout = (
  options?: UseMutationOptions<void, Error, void>
) => {
  const { logout } = useAuthContext();

  return useMutation({
    mutationFn: async () => {
      await logout();
    },
    onSuccess: () => {
      toast.success('Logged out successfully');
    },
    ...defaultMutationOptions,
    ...options,
  });
};

// Token refresh mutation hook (internal use)
export const useTokenRefresh = (
  options?: UseMutationOptions<
    any,
    Error,
    string
  >
) => {
  return useMutation({
    mutationFn: async (refreshToken: string) => {
      const result = await authService.refreshToken(refreshToken);
      if (!result.success) {
        throw new Error(result.error || 'Failed to refresh token');
      }
      return result.data;
    },
    ...defaultMutationOptions,
    ...options,
  });
};

// Change password mutation hook
export const useChangePassword = (
  options?: UseMutationOptions<
    void,
    Error,
    { currentPassword: string; newPassword: string }
  >
) => {
  return useMutation({
    mutationFn: async ({ currentPassword, newPassword }) => {
      const result = await authService.changePassword(currentPassword, newPassword);
      if (!result.success) {
        throw new Error(result.error || 'Failed to change password');
      }
    },
    onSuccess: () => {
      toast.success('Password changed successfully');
    },
    ...defaultMutationOptions,
    ...options,
  });
};

// Request password reset mutation hook
export const useRequestPasswordReset = (
  options?: UseMutationOptions<void, Error, string>
) => {
  return useMutation({
    mutationFn: async (email: string) => {
      const result = await authService.requestPasswordReset(email);
      if (!result.success) {
        throw new Error(result.error || 'Failed to request password reset');
      }
    },
    onSuccess: (_, email) => {
      toast.success(`Password reset instructions sent to ${email}`);
    },
    ...defaultMutationOptions,
    ...options,
  });
};

// Reset password mutation hook
export const useResetPassword = (
  options?: UseMutationOptions<
    void,
    Error,
    { token: string; newPassword: string }
  >
) => {
  return useMutation({
    mutationFn: async ({ token, newPassword }) => {
      const result = await authService.resetPassword(token, newPassword);
      if (!result.success) {
        throw new Error(result.error || 'Failed to reset password');
      }
    },
    onSuccess: () => {
      toast.success('Password reset successfully');
    },
    ...defaultMutationOptions,
    ...options,
  });
};

// Verify token mutation hook
export const useVerifyToken = (
  options?: UseMutationOptions<boolean, Error, void>
) => {
  return useMutation({
    mutationFn: async () => {
      const result = await authService.verifyToken();
      if (!result.success) {
        throw new Error(result.error || 'Failed to verify token');
      }
      return result.data;
    },
    ...defaultQueryOptions,
    ...options,
  });
};

// Combined auth operations hook
export const useAuthOperations = () => {
  const login = useLogin();
  const logout = useLogout();
  const changePassword = useChangePassword();
  const requestPasswordReset = useRequestPasswordReset();
  const resetPassword = useResetPassword();
  const verifyToken = useVerifyToken();

  return {
    login,
    logout,
    changePassword,
    requestPasswordReset,
    resetPassword,
    verifyToken,
    // Compound operations
    authenticate: (credentials: LoginCredentials) => login.mutateAsync(credentials),
    signOut: () => logout.mutateAsync(),
    updatePassword: (currentPassword: string, newPassword: string) =>
      changePassword.mutateAsync({ currentPassword, newPassword }),
    initiatePasswordReset: (email: string) => requestPasswordReset.mutateAsync(email),
    completePasswordReset: (token: string, newPassword: string) =>
      resetPassword.mutateAsync({ token, newPassword }),
    checkAuth: () => verifyToken.mutateAsync(),
  };
};