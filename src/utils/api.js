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
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
});

// Bookmark API
export const bookmarkApi = {
  getBookmarks: async () => {
    const response = await api.get('/bookmarks');
    return response.data;
  },
  createBookmark: async (data) => {
    const response = await api.post('/bookmarks', data);
    return response.data;
  },
  updateBookmark: async (id, data) => {
    const response = await api.put(`/bookmarks/${id}`, data);
    return response.data;
  },
  deleteBookmark: async (id) => {
    const response = await api.delete(`/bookmarks/${id}`);
    return response.data;
  },
  shareBookmark: async (id, userIds) => {
    const response = await api.post(`/bookmarks/${id}/share`, { userIds });
    return response.data;
  },
  getSharedWithMeBookmarks: async (page = 1, limit = 12) => {
    const response = await fetch(`${API_BASE_URL}/bookmarks/shared-with-me?page=${page}&limit=${limit}`, {
      headers: {
        'x-auth-token': localStorage.getItem('token')
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch shared bookmarks');
    }
    return response.json();
  },
  getPublicBookmarks: async (page = 1, limit = 12) => {
    const response = await fetch(`${API_BASE_URL}/bookmarks/public?page=${page}&limit=${limit}`);
    if (!response.ok) {
      throw new Error('Failed to fetch public bookmarks');
    }
    return response.json();
  },
  // Bulk operations
  bulkEdit: async (bookmarkIds, operations) => {
    const response = await api.post('/bookmarks/bulk-edit', { bookmarkIds, operations });
    return response.data;
  },
  bulkTags: async (bookmarkIds, action, tags) => {
    const response = await api.post('/bookmarks/bulk-tags', { bookmarkIds, action, tags });
    return response.data;
  },
  bulkDelete: async (bookmarkIds) => {
    const response = await api.post('/bookmarks/bulk-delete', { bookmarkIds });
    return response.data;
  },
  bulkVisibility: async (bookmarkIds, visibility, sharedWith) => {
    const response = await api.post('/bookmarks/bulk-visibility', { bookmarkIds, visibility, sharedWith });
    return response.data;
  },
  bulkShare: async (bookmarkIds, userIds, message) => {
    const response = await api.post('/bookmarks/bulk-share', { bookmarkIds, userIds, message });
    return response.data;
  },
  bulkMove: async (bookmarkIds, targetFolder) => {
    const response = await api.post('/bookmarks/move', { bookmarkIds, targetFolder });
    return response.data;
  },
  deduplicate: async (remove = false) => {
    const response = await api.post('/bookmarks/deduplicate', { remove });
    return response.data;
  }
};

// Tag API
export const tagApi = {
  getTags: async () => {
    const response = await api.get('/tags');
    return response.data;
  },
};

// Folder API
export const folderApi = {
  getFolders: async () => {
    const response = await api.get('/folders');
    return response.data || response;
  },
  createFolder: async (data) => {
    const response = await api.post('/folders', data);
    return response.data || response;
  },
  updateFolder: async (id, data) => {
    const response = await api.put(`/folders/${id}`, data);
    return response.data || response;
  },
  deleteFolder: async (id) => {
    const response = await api.delete(`/folders/${id}`);
    return response.data || response;
  },
};

// Auth API
export const authApi = {
  login: async (credentials) => {
    const response = await api.post('/users/login', credentials);
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/users/register', userData);
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },
  getShareableUsers: async () => {
    const response = await api.get('/users/shareable');
    return response.data;
  },
};

export default api;
