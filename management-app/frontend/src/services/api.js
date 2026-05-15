import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001/api'
});

export const authAPI = {
  me: () => api.get('/auth/me'),
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data)
};

export const workspaceAPI = {
  getAll: () => api.get('/workspaces'),
  create: (data) => api.post('/workspaces', data),
  get: (id) => api.get(`/workspaces/${id}`)
};

export const projectAPI = {
  getAll: (workspaceId) => api.get(`/workspaces/${workspaceId}/projects`),
  create: (workspaceId, data) => api.post(`/workspaces/${workspaceId}/projects`, data),
  get: (workspaceId, id) => api.get(`/workspaces/${workspaceId}/projects/${id}`),
  update: (workspaceId, id, data) => api.put(`/workspaces/${workspaceId}/projects/${id}`, data)
};

export const taskAPI = {
  getAll: (workspaceId, projectId) => api.get(`/workspaces/${workspaceId}/projects/${projectId}/tasks`),
  create: (workspaceId, projectId, data) => api.post(`/workspaces/${workspaceId}/projects/${projectId}/tasks`, data),
  update: (workspaceId, projectId, taskId, data) => api.put(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`, data),
  delete: (workspaceId, projectId, taskId) => api.delete(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`)
};

export const issueAPI = {
  getAll: (workspaceId, projectId) => api.get(`/workspaces/${workspaceId}/projects/${projectId}/issues`),
  create: (workspaceId, projectId, data) => api.post(`/workspaces/${workspaceId}/projects/${projectId}/issues`, data)
};

export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`)
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

