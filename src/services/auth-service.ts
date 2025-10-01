import Api from '@/services/Api'

export interface LoginResponse {
  success: boolean;
  token?: string;
  needsPasswordReset?: boolean;
  user?: {
    id: string;
    email: string;
    role: string;
    displayName?: string;
  };
}

export interface User {
  id: string;
  email: string;
  role: string;
  displayName?: string;
}

class AuthService {
  private TOKEN_KEY = 'authToken';
  private USER_KEY = 'user';

  /**
   * Login and store token
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (data.needsPasswordReset) {
        // Redirect to password reset page
        window.location.href = '/reset-password?email=' + email;
        return data;
      }
      
      if (data.success && data.token) {
        // Store token and user data for future requests
        localStorage.setItem(this.TOKEN_KEY, data.token);
        if (data.user) {
          localStorage.setItem(this.USER_KEY, JSON.stringify(data.user));
        }
      }
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Logout and clear stored data
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  /**
   * Get stored authentication token
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Get stored user data
   */
  getUser(): User | null {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Make authenticated requests
   */
  async makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const token = this.getToken();
    
    if (!token) {
      throw new Error('No authentication token available');
    }

    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Check user permissions
   */
  canUserCreateVideos(userRole?: string): boolean {
    const user = this.getUser();
    const role = userRole || (user ? user.role : '');
    return ['admin', 'user'].includes(role || '');
  }

  /**
   * Check if user has admin role
   */
  isAdmin(userRole?: string): boolean {
    const user = this.getUser();
    const role = userRole || (user ? user.role : '');
    return role === 'admin';
  }

  /**
   * Check if user has specific role
   */
  hasRole(requiredRole: string, userRole?: string): boolean {
    const user = this.getUser();
    const role = userRole || (user ? user.role : '');
    return role === requiredRole;
  }

  /**
   * Refresh token (if your backend supports it)
   */
  async refreshToken(): Promise<boolean> {
    try {
      const response = await this.makeAuthenticatedRequest('/auth/refresh', {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          localStorage.setItem(this.TOKEN_KEY, data.token);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }

  /**
   * Initialize authentication state on app startup
   */
  initializeAuth(): void {
    const token = this.getToken();
    const user = this.getUser();
    
    if (token && user) {
      // You might want to validate the token with the backend here
      console.log('User authenticated:', user);
    }
  }
}

export default new AuthService();

