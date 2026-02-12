import axios from 'axios';

const API_BASE = '/api';

export async function fetchExtensions(bookmarkId) {
  const res = await axios.get(`${API_BASE}/bookmarks/${bookmarkId}/extensions`);
  // The server returns data directly, not in a data property
  return res.data || res;
}

export async function addExtension(bookmarkId, data) {
  const res = await axios.post(`${API_BASE}/bookmarks/${bookmarkId}/extensions`, data);
  // The server returns data directly, not in a data property
  return res.data || res;
}

export async function updateExtension(extensionId, data) {
  const res = await axios.put(`${API_BASE}/extensions/${extensionId}`, data);
  // The server returns data directly, not in a data property
  return res.data || res;
}

export async function deleteExtension(extensionId) {
  const res = await axios.delete(`${API_BASE}/extensions/${extensionId}`);
  // The server returns data directly, not in a data property
  return res.data || res;
}
