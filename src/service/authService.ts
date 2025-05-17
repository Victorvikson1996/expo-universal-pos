import { mockApiCall } from '@/utils/mockApi';
import type { ApiResponse } from '@/utils/types';

class AuthService {
  private authToken: string | null = null;

  setAuthToken(token: string) {
    this.authToken = token;
  }

  clearAuthToken() {
    this.authToken = null;
  }

  getAuthToken() {
    return this.authToken;
  }

  async login(username: string, password: string): Promise<ApiResponse> {
    // In a real app, this would be an API call to your backend
    return mockApiCall({
      endpoint: '/auth/login',
      method: 'POST',
      data: { username, password },
      mockResponse: (data) => {
        // For demo purposes, accept any username/password
        if (data.username && data.password) {
          return {
            success: true,
            data: {
              user: {
                id: 'usr_123456',
                username: data.username,
                name: 'Demo Merchant',
                role: 'admin',
                merchantId: 'merch_123456',
                terminalId: 'term_123456'
              },
              token: 'mock_jwt_token_' + Math.random().toString(36).substring(2)
            }
          };
        }
        return { success: false, error: 'Invalid credentials' };
      }
    });
  }
}

export const authService = new AuthService();
