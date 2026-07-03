import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// 案例相关
export const caseApi = {
  getList: (params = {}) => api.get('/api/cases/', { params }),
  getById: (id) => api.get(`/api/cases/${id}`),
  create: (data) => api.post('/api/cases/', data),
  update: (id, data) => api.put(`/api/cases/${id}`, data),
  delete: (id) => api.delete(`/api/cases/${id}`),
};

// 预警相关
export const warningApi = {
  analyze: (content) => api.post('/api/warnings/analyze', { content }),
  getList: (params = {}) => api.get('/api/warnings/', { params }),
  getById: (id) => api.get(`/api/warnings/${id}`),
};

// AI问答相关
export const chatApi = {
  ask: (question, sessionId = null) => api.post('/api/chat/ask', { question, session_id: sessionId }),
  getHistory: (sessionId = null) => api.get('/api/chat/history', { params: { session_id: sessionId } }),
};

// 文章相关
export const articleApi = {
  getList: (params = {}) => api.get('/api/articles/', { params }),
  getById: (id) => api.get(`/api/articles/${id}`),
  create: (data) => api.post('/api/articles/', data),
  update: (id, data) => api.put(`/api/articles/${id}`, data),
  delete: (id) => api.delete(`/api/articles/${id}`),
};

// 管理后台
export const adminApi = {
  getDashboard: () => api.get('/api/admin/dashboard'),
  getCases: (params = {}) => api.get('/api/admin/cases', { params }),
  getWarnings: (params = {}) => api.get('/api/admin/warnings', { params }),
  getArticles: (params = {}) => api.get('/api/admin/articles', { params }),
};

export default api;
