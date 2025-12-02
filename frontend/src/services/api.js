import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// AI Providers API
export const aiProvidersAPI = {
  getAll: () => api.get('/ai-providers'),
  getActive: () => api.get('/ai-providers/active'),
  create: (data) => api.post('/ai-providers', data),
  update: (id, data) => api.put(`/ai-providers/${id}`, data),
  delete: (id) => api.delete(`/ai-providers/${id}`),
  setActive: (id, isActive) => api.patch(`/ai-providers/${id}/active`, { is_active: isActive }),
};

// Chats API
export const chatsAPI = {
  getAll: () => api.get('/chats'),
  getById: (id) => api.get(`/chats/${id}`),
  getMessages: (id) => api.get(`/chats/${id}/messages`),
  create: (title) => api.post('/chats', { title }),
  update: (id, title) => api.put(`/chats/${id}`, { title }),
  delete: (id) => api.delete(`/chats/${id}`),
  sendMessage: (id, content) => api.post(`/chats/${id}/messages`, { content }),
};

export default api;
