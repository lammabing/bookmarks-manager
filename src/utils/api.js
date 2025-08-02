import axios from 'axios';

// Use relative path in development to go through Vite proxy
// Use absolute URL in production
const API_BASE_URL = import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_BASE_URL || '/api');

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log('🔍 [DEBUG] API interceptor - Token in localStorage:', token ? 'Present' : 'Missing');
  console.log('🔍 [DEBUG] API interceptor - Request URL:', config.url);
  if (token) {
    config.headers['x-auth-token'] = token;
    console.log('🔍 [DEBUG] API interceptor - Token added to headers');
  } else {
    console.log('🔍 [DEBUG] API interceptor - No token available, request may fail');
  }
  return config;
});

// Bookmark API
export const bookmarkApi = {
  getBookmarks: () => api.get('/bookmarks'),
  createBookmark: (data) => api.post('/bookmarks', data),
  updateBookmark: (id, data) => api.put(`/bookmarks/${id}`, data),
  deleteBookmark: (id) => api.delete(`/bookmarks/${id}`),
  getPublicBookmarks: async (page = 1, limit = 12) => {
    const response = await fetch(`${API_BASE_URL}/bookmarks/public?page=${page}&limit=${limit}`);
    if (!response.ok) {
      throw new Error('Failed to fetch public bookmarks');
    }
    return response.json();
  }
};

// Tag API
export const tagApi = {
  getTags: () => api.get('/tags'),
  createTag: (data) => api.post('/tags', data),
  updateTag: (id, data) => api.put(`/tags/${id}`, data),
  deleteTag: (id) => api.delete(`/tags/${id}`),
};

// Folder API
export const folderApi = {
  getFolders: () => api.get('/folders'),
  createFolder: (data) => api.post('/folders', data),
  updateFolder: (id, data) => api.put(`/folders/${id}`, data),
  deleteFolder: (id) => api.delete(`/folders/${id}`),
};

// Auth API
export const authApi = {
  login: (credentials) => api.post('/users/login', credentials),
  register: (userData) => api.post('/users/register', userData),
  getProfile: () => api.get('/users/me'),
};

export default api;
