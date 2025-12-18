import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AxiosInstance } from 'axios';
import { AuthService } from '../auth.service';
import { LoginCredentials, AuthResponse, UserProfile } from '@/types/api';

// Mock de la dependencia axios
vi.mock('axios', () => ({
  default: vi.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let mockHttpClient: AxiosInstance;

  beforeEach(() => {
    // Limpiar todos los mocks antes de cada test
    vi.clearAllMocks();

    // Crear mock del cliente HTTP
    mockHttpClient = {
      post: vi.fn(),
      get: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    } as any;

    authService = new AuthService(mockHttpClient);
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      // Arrange
      const credentials: LoginCredentials = {
        username: 'testuser',
        password: 'password123'
      };

      const mockResponse: AuthResponse = {
        access: 'mock-access-token',
        refresh: 'mock-refresh-token',
        user: {
          id: 'user-123',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'colaborador',
          isActive: true,
        }
      };

      (mockHttpClient.post as any).mockResolvedValue({
        data: mockResponse
      });

      // Act
      const result = await authService.login(credentials);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/api/v1/auth/token/',
        credentials
      );
    });

    it('should handle login failure with invalid credentials', async () => {
      // Arrange
      const credentials: LoginCredentials = {
        username: 'testuser',
        password: 'wrong-password'
      };

      const error = new Error('Invalid credentials');
      (mockHttpClient.post as any).mockRejectedValue(error);

      // Act
      const result = await authService.login(credentials);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials');
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/api/v1/auth/token/',
        credentials
      );
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      // Arrange
      const refreshToken = 'mock-refresh-token';
      const mockResponse = {
        access: 'new-access-token',
        refresh: 'new-refresh-token'
      };

      (mockHttpClient.post as any).mockResolvedValue({
        data: mockResponse
      });

      // Act
      const result = await authService.refreshToken(refreshToken);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/api/v1/auth/token/refresh/',
        { refresh: refreshToken }
      );
    });

    it('should handle refresh token failure', async () => {
      // Arrange
      const refreshToken = 'invalid-refresh-token';
      const error = new Error('Invalid refresh token');
      (mockHttpClient.post as any).mockRejectedValue(error);

      // Act
      const result = await authService.refreshToken(refreshToken);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid refresh token');
    });
  });

  describe('getUserProfile', () => {
    it('should get user profile successfully', async () => {
      // Arrange
      const mockProfile: UserProfile = {
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'colaborador',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        companies: [
          {
            id: 'company-123',
            name: 'Test Company',
            ruc: '20123456789'
          }
        ]
      };

      (mockHttpClient.get as any).mockResolvedValue({
        data: mockProfile
      });

      // Act
      const result = await authService.getUserProfile();

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockProfile);
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/auth/profile/');
    });
  });

  describe('logout', () => {
    it('should logout successfully even if API call fails', async () => {
      // Arrange
      (mockHttpClient.post as any).mockRejectedValue(new Error('Logout API failed'));

      // Act
      const result = await authService.logout();

      // Assert
      expect(result.success).toBe(true);
      expect(mockHttpClient.post).toHaveBeenCalledWith('/api/v1/auth/logout/');
    });

    it('should call logout endpoint when available', async () => {
      // Arrange
      (mockHttpClient.post as any).mockResolvedValue({});

      // Act
      const result = await authService.logout();

      // Assert
      expect(result.success).toBe(true);
      expect(mockHttpClient.post).toHaveBeenCalledWith('/api/v1/auth/logout/');
    });
  });
});