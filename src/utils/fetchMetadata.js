import api from './api.js';

export const fetchMetadata = async (url) => {
  try {
    const response = await api.get(`/metadata?url=${encodeURIComponent(url)}`);
    return response.data;
  } catch (error) {
    return { title: 'Untitled' };
  }
};
