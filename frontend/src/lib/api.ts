import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('trustwork_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const userAPI = {
  connectWallet: (walletAddress: string, role?: string) =>
    api.post('/users/connect', { walletAddress, role }),
  
  getProfile: () => api.get('/users/me'),
  
  getBalance: () => api.get('/users/balance'),
};

export const taskAPI = {
  create: (data: { title: string; description: string; budget: number }) =>
    api.post('/tasks', data),
  
  list: (params?: { status?: string; role?: string }) =>
    api.get('/tasks', { params }),
  
  get: (id: string) => api.get(`/tasks/${id}`),
  
  assign: (id: string, freelancerId: string) =>
    api.post(`/tasks/${id}/assign`, { freelancerId }),
};

export const submissionAPI = {
  submit: (data: { taskId: string; content: string; attachmentUrls?: string[] }) =>
    api.post('/submissions', data),
  
  get: (id: string) => api.get(`/submissions/${id}`),
  
  validate: (id: string) => api.post(`/submissions/${id}/validate`),
};

export const escrowAPI = {
  lock: (taskId: string, clientPrivateKey: string) =>
    api.post('/escrow/lock', { taskId, clientPrivateKey }),
  
  release: (taskId: string) => api.post('/escrow/release', { taskId }),
  
  refund: (taskId: string) => api.post('/escrow/refund', { taskId }),
  
  getStatus: (taskId: string) => api.get(`/escrow/${taskId}`),
};

export const disputeAPI = {
  raise: (data: { taskId: string; reason: string }) =>
    api.post('/disputes', data),
  
  get: (id: string) => api.get(`/disputes/${id}`),
  
  respond: (id: string, response: string) =>
    api.post(`/disputes/${id}/respond`, { response }),
  
  resolve: (id: string) => api.post(`/disputes/${id}/resolve`),
};

export default api;
