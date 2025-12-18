import { z } from 'zod';

// Login credentials schema
export const loginCredentialsSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginCredentials = z.infer<typeof loginCredentialsSchema>;

// Authentication response schema
export const authResponseSchema = z.object({
  access: z.string().min(1, 'Access token is required'),
  refresh: z.string().min(1, 'Refresh token is required'),
});

export type AuthResponse = z.infer<typeof authResponseSchema>;

// Token refresh response schema
export const tokenRefreshSchema = z.object({
  access: z.string().min(1, 'Access token is required'),
  refresh: z.string().optional(),
});

export type TokenRefreshResponse = z.infer<typeof tokenRefreshSchema>;

// User profile schema
export const userProfileSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().email(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  groups: z.array(z.string()),
  isActive: z.boolean(),
  lastLogin: z.string().datetime().nullable().optional(),
  companies: z.array(z.object({
    id: z.number(),
    name: z.string(),
    ruc: z.string(),
  })).optional(),
});

export type UserProfile = z.infer<typeof userProfileSchema>;

// JWT Claims (for token decoding)
export interface JWTPayload {
  sub: string; // user ID
  email: string;
  role: string;
  exp: number; // expiration timestamp
  iat: number; // issued at timestamp
  jti: string; // JWT ID
  type: 'access' | 'refresh';
}

// Authentication state
export interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

// Authentication context value
export interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<string>;
  clearError: () => void;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
}