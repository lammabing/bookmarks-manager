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
  getBookmarks: async () => {
    const response = await api.get('/bookmarks');
    return response.data || response;
  },
  createBookmark: async (data) => {
    const response = await api.post('/bookmarks', data);
    return response.data || response;
  },
  updateBookmark: async (id, data) => {
    const response = await api.put(`/bookmarks/${id}`, data);
    return response.data || response;
  },
  deleteBookmark: async (id) => {
    const response = await api.delete(`/bookmarks/${id}`);
    return response.data || response;
  },
  shareBookmark: async (id, userIds) => {
    const response = await api.post(`/bookmarks/${id}/share`, { userIds });
    return response.data || response;
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
    return response.data || response;
  },
  bulkTags: async (bookmarkIds, action, tags) => {
    const response = await api.post('/bookmarks/bulk-tags', { bookmarkIds, action, tags });
    return response.data || response;
  },
  bulkDelete: async (bookmarkIds) => {
    const response = await api.post('/bookmarks/bulk-delete', { bookmarkIds });
    return response.data || response;
  },
  bulkVisibility: async (bookmarkIds, visibility, sharedWith) => {
    const response = await api.post('/bookmarks/bulk-visibility', { bookmarkIds, visibility, sharedWith });
    return response.data || response;
  },
  bulkShare: async (bookmarkIds, userIds, message) => {
    const response = await api.post('/bookmarks/bulk-share', { bookmarkIds, userIds, message });
    return response.data || response;
  },
  bulkMove: async (bookmarkIds, targetFolder) => {
    const response = await api.post('/bookmarks/move', { bookmarkIds, targetFolder });
    return response.data || response;
  }
};

// Tag API
export const tagApi = {
  getTags: async () => {
    const response = await api.get('/tags');
    return response.data || response;
  },
  createTag: async (data) => {
    const response = await api.post('/tags', data);
    return response.data || response;
  },
  updateTag: async (id, data) => {
    const response = await api.put(`/tags/${id}`, data);
    return response.data || response;
  },
  deleteTag: async (id) => {
    const response = await api.delete(`/tags/${id}`);
    return response.data || response;
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
    return response.data || response;
  },
  register: async (userData) => {
    const response = await api.post('/users/register', userData);
    return response.data || response;
  },
  getProfile: async () => {
    const response = await api.get('/users/me');
    return response.data || response;
  },
  getShareableUsers: async () => {
    const response = await api.get('/users/shareable');
    return response.data || response;
  },
};

export default api;
