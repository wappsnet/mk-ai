import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Token management
const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const tokenService = {
  getAccessToken: (): string | null => localStorage.getItem(TOKEN_KEY),
  getRefreshToken: (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY),
  setTokens: (accessToken: string, refreshToken: string): void => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  clearTokens: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
};

// Request interceptor - add access token to requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle token refresh
let isRefreshing = false;
interface QueueItem {
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
}
let failedQueue: QueueItem[] = [];

const processQueue = (error: unknown, token: string | null = null): void => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const queueRequest = (originalRequest: InternalAxiosRequestConfig & { _retry?: boolean }) => {
  return new Promise<string | null>((resolve, reject) => {
    failedQueue.push({ resolve, reject });
  }).then(token => {
    originalRequest.headers.Authorization = `Bearer ${token}`;
    return api(originalRequest);
  });
};

const redirectToLogin = (): void => {
  tokenService.clearTokens();
  window.location.href = '/login';
};

const refreshAccessToken = async (refreshToken: string): Promise<string> => {
  const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
    refreshToken
  });
  const { accessToken, refreshToken: newRefreshToken } = response.data;
  tokenService.setTokens(accessToken, newRefreshToken);
  return accessToken;
};

const shouldRetryWithTokenRefresh = (error: AxiosError, originalRequest: InternalAxiosRequestConfig & { _retry?: boolean }): boolean => {
  if (error.response?.status !== 401 || originalRequest._retry) {
    return false;
  }
  const errorData = error.response?.data as { code?: string };
  return errorData?.code === 'INVALID_TOKEN' || errorData?.code === 'NO_TOKEN';
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (!shouldRetryWithTokenRefresh(error, originalRequest)) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return queueRequest(originalRequest);
    }

    const refreshToken = tokenService.getRefreshToken();
    if (!refreshToken) {
      redirectToLogin();
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const accessToken = await refreshAccessToken(refreshToken);
      processQueue(null, accessToken);
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      redirectToLogin();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// Type definitions
export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface AIProvider {
  id: number;
  user_id: number;
  name: string;
  provider_type: string;
  provider_name: string;
  api_key: string;
  model?: string;
  base_url?: string;
  is_verifier: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Chat {
  id: number;
  user_id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface AIResponse {
  id: number;
  provider: {
    id: number;
    name: string;
    provider_type: string;
    is_verifier: boolean;
  };
  status: 'success' | 'error';
  text?: string;
  error_message?: string;
  response_time: number;
}

export interface Verification {
  summary: string;
  best_response_id?: number;
  reasoning?: string;
}

export interface Message {
  id: number;
  chat_id: number;
  role: 'user' | 'assistant';
  content: string;
  provider_name?: string;
  created_at: string;
  responses?: AIResponse[];
  verification?: Verification;
}

// Authentication API
export const authAPI = {
  register: (data: RegisterData) => api.post('/auth/register', data),
  login: (data: LoginData) => api.post('/auth/login', data),
  logout: () => {
    const refreshToken = tokenService.getRefreshToken();
    return api.post('/auth/logout', { refreshToken });
  },
  getProfile: () => api.get<User>('/auth/profile'),
  updateProfile: (data: Partial<User>) => api.put('/auth/profile', data),
  refreshToken: (refreshToken: string) => api.post('/auth/refresh', { refreshToken })
};

// AI Providers API
export const aiProvidersAPI = {
  getAll: () => api.get<AIProvider[]>('/ai-providers'),
  getActive: () => api.get<AIProvider[]>('/ai-providers/active'),
  create: (data: Partial<AIProvider>) => api.post('/ai-providers', data),
  update: (id: number, data: Partial<AIProvider>) => api.put(`/ai-providers/${id}`, data),
  delete: (id: number) => api.delete(`/ai-providers/${id}`),
  setActive: (id: number, isActive: boolean) => api.patch(`/ai-providers/${id}/active`, { is_active: isActive }),
};

// Chats API
export const chatsAPI = {
  getAll: () => api.get<Chat[]>('/chats'),
  getById: (id: number) => api.get<Chat>(`/chats/${id}`),
  getMessages: (id: number) => api.get<Message[]>(`/chats/${id}/messages`),
  create: (title: string) => api.post('/chats', { title }),
  update: (id: number, title: string) => api.put(`/chats/${id}`, { title }),
  delete: (id: number) => api.delete(`/chats/${id}`),
  sendMessage: (id: number, content: string) => api.post(`/chats/${id}/messages`, { content }),
};

export default api;
