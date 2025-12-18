import { AxiosInstance } from 'axios';
import {
  LoginCredentials,
  AuthResponse,
  TokenRefreshResponse,
  UserProfile,
  authResponseSchema,
  tokenRefreshSchema,
  userProfileSchema,
  API_ENDPOINTS
} from '@/types/api';
import { ApiServiceResponse } from '@/types/api';

export class AuthService {
  constructor(private readonly http: AxiosInstance) {}

  /**
   * Authenticate user with email and password
   */
  async login(credentials: LoginCredentials): Promise<ApiServiceResponse<AuthResponse>> {
    try {
      const response = await this.http.post<AuthResponse>(
        '/api/v1/auth/token/',
        {
          username: credentials.username,
          password: credentials.password
        }
      );

      // Validate response data with Zod schema
      const validatedData = authResponseSchema.parse(response.data);

      return {
        success: true,
        data: validatedData,
      };
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Login failed',
      };
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<ApiServiceResponse<TokenRefreshResponse>> {
    try {
      const response = await this.http.post<TokenRefreshResponse>(
        '/api/v1/auth/token/refresh/',
        { refresh: refreshToken }
      );

      // Validate response data with Zod schema
      const validatedData = tokenRefreshSchema.parse(response.data);

      return {
        success: true,
        data: validatedData,
      };
    } catch (error: any) {
      console.error('Token refresh error:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Token refresh failed',
      };
    }
  }

  /**
   * Get current user profile
   */
  async getUserProfile(): Promise<ApiServiceResponse<UserProfile>> {
    try {
      const response = await this.http.get<UserProfile>(
        '/api/v1/auth/users/profile/'
      );

      // Validate response data with Zod schema
      const validatedData = userProfileSchema.parse(response.data);

      return {
        success: true,
        data: validatedData,
      };
    } catch (error: any) {
      console.error('Get user profile error:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Failed to get user profile',
      };
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<ApiServiceResponse<void>> {
    try {
      await this.http.post('/api/v1/auth/users/logout/');

      return {
        success: true,
      };
    } catch (error: any) {
      console.error('Logout error:', error);
      // Even if logout fails on server, we should succeed locally
      return {
        success: true,
      };
    }
  }

  /**
   * Change user password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<ApiServiceResponse<void>> {
    try {
      await this.http.post('/api/v1/auth/users/change_password/', {
        current_password: currentPassword,
        new_password: newPassword,
      });

      return {
        success: true,
      };
    } catch (error: any) {
      console.error('Change password error:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Failed to change password',
      };
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<ApiServiceResponse<void>> {
    try {
      await this.http.post('/api/v1/auth/password-reset/', { email });

      return {
        success: true,
      };
    } catch (error: any) {
      console.error('Password reset request error:', error);
      return {
        success: false,
        error: error.message || 'Failed to request password reset',
      };
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<ApiServiceResponse<void>> {
    try {
      await this.http.post('/api/v1/auth/password-reset-confirm/', {
        token,
        new_password: newPassword,
      });

      return {
        success: true,
      };
    } catch (error: any) {
      console.error('Password reset error:', error);
      return {
        success: false,
        error: error.message || 'Failed to reset password',
      };
    }
  }

  /**
   * Verify JWT token validity
   */
  async verifyToken(): Promise<ApiServiceResponse<boolean>> {
    try {
      // Try to get user profile to verify token
      const result = await this.getUserProfile();
      return {
        success: true,
        data: result.success,
      };
    } catch (error: any) {
      return {
        success: true,
        data: false,
      };
    }
  }
}

// Factory function for creating auth service with dependency injection
export const createAuthService = (http: AxiosInstance): AuthService => {
  return new AuthService(http);
};

// Default export for convenience
export default AuthService;