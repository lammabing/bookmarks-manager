import axios from 'axios';

const API_BASE = '/api';

export async function fetchExtensions(bookmarkId) {
  const res = await axios.get(`${API_BASE}/bookmarks/${bookmarkId}/extensions`);
  return res.data;
}

export async function addExtension(bookmarkId, data) {
  const res = await axios.post(`${API_BASE}/bookmarks/${bookmarkId}/extensions`, data);
  return res.data;
}

export async function updateExtension(extensionId, data) {
  const res = await axios.put(`${API_BASE}/extensions/${extensionId}`, data);
  return res.data;
}

export async function deleteExtension(extensionId) {
  const res = await axios.delete(`${API_BASE}/extensions/${extensionId}`);
  return res.data;
}
