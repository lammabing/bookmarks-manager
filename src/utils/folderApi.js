import axios from 'axios';
import { getAuthHeader } from './api.js';

const API_URL = '/api/folders';

// Get all folders as tree structure
export const getFoldersTree = async () => {
  try {
    const response = await axios.get(API_URL, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching folders tree:', error);
    throw error;
  }
};

// Create a new folder
export const createFolder = async (folderData) => {
  try {
    const response = await axios.post(API_URL, folder极Data, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error creating folder:', error);
    throw error;
  }
};

// Get a specific folder by ID
export const getFolder = async (folderId) => {
  try {
    const response = await axios.get(`${API_URL}/${folderId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching folder:', error);
    throw error;
  }
};

// Update a folder
export const updateFolder = async (folderId, folderData) => {
  try {
    const response = await axios.put(`${API_URL}/${folderId}`, folderData, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error updating folder:', error);
    throw error;
  }
};

// Delete a folder
export const deleteFolder = async (folderId) => {
  try {
    const response = await axios.delete(`${API_URL}/${folderId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting folder:', error);
    throw error;
  }
};

// Get bookmarks in a folder
export const getFolderBookmarks = async (folderId) => {
  try {
    const response = await axios.get(`${API_URL}/${folderId}/bookmarks`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching folder bookmarks:', error);
    throw error;
  }
};