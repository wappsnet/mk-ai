import React, { createContext, useState, useContext, useEffect, useMemo, ReactNode } from 'react';
import { authAPI, tokenService, User } from '../services/api';
import { AxiosError } from 'axios';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (name: string, email: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  checkAuth: () => Promise<void>;
}

interface AuthResult {
  success: boolean;
  error?: string;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuth = async (): Promise<void> => {
    const accessToken = tokenService.getAccessToken();

    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.getProfile();
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      // Auth check failed, clear tokens
      tokenService.clearTokens();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const response = await authAPI.login({ email, password });
      const { user, accessToken, refreshToken } = response.data;

      tokenService.setTokens(accessToken, refreshToken);
      setUser(user);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }>;
      return {
        success: false,
        error: axiosError.response?.data?.error || 'Login failed'
      };
    }
  };

  const register = async (name: string, email: string, password: string): Promise<AuthResult> => {
    try {
      const response = await authAPI.register({ name, email, password });
      const { user, accessToken, refreshToken } = response.data;

      tokenService.setTokens(accessToken, refreshToken);
      setUser(user);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }>;
      return {
        success: false,
        error: axiosError.response?.data?.error || 'Registration failed'
      };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authAPI.logout();
    } catch {
      // Logout error, but still clear local tokens
    } finally {
      tokenService.clearTokens();
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateUser = (updatedUser: User): void => {
    setUser(updatedUser);
  };

  // Check if user is logged in on mount
  useEffect(() => {
    void checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value: AuthContextType = useMemo(() => ({
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    checkAuth
  }), [user, loading, isAuthenticated]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
