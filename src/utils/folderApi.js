import api from './api.js';

// Get all folders for the current user (tree structure)
export const getFolders = async () => {
  try {
    const response = await api.get('/folders');
    // The server returns folders directly, not in a data property
    return response.data || response;
  } catch (error) {
    console.error('Error fetching folders:', error);
    throw error;
  }
};

// Get specific folder with details
export const getFolder = async (folderId) => {
  try {
    const response = await api.get(`/folders/${folderId}`);
    // The server returns folder directly, not in a data property
    return response.data || response;
  } catch (error) {
    console.error('Error fetching folder:', error);
    throw error;
  }
};

// Create new folder
export const createFolder = async (folderData) => {
  try {
    const response = await api.post('/folders', folderData);
    // The server returns folder directly, not in a data property
    return response.data || response;
  } catch (error) {
    console.error('Error creating folder:', error);
    throw error;
  }
};

// Update folder
export const updateFolder = async (folderId, folderData) => {
  try {
    const response = await api.put(`/folders/${folderId}`, folderData);
    // The server returns folder directly, not in a data property
    return response.data || response;
  } catch (error) {
    console.error('Error updating folder:', error);
    throw error;
  }
};

// Delete folder
export const deleteFolder = async (folderId) => {
  try {
    const response = await api.delete(`/folders/${folderId}`);
    // The server returns response directly, not in a data property
    return response.data || response;
  } catch (error) {
    console.error('Error deleting folder:', error);
    throw error;
  }
};

// Get bookmarks in a specific folder
export const getFolderBookmarks = async (folderId) => {
  try {
    const response = await api.get(`/folders/${folderId}/bookmarks`);
    // The server returns bookmarks directly, not in a data property
    return response.data || response;
  } catch (error) {
    console.error('Error fetching folder bookmarks:', error);
    throw error;
  }
};

// Move folder to new parent
export const moveFolder = async (folderId, newParentId) => {
  try {
    const response = await api.post(`/folders/${folderId}/move`, {
      newParent: newParentId
    });
    // The server returns response directly, not in a data property
    return response.data || response;
  } catch (error) {
    console.error('Error moving folder:', error);
    throw error;
  }
};

// Build folder tree from flat array
export const buildFolderTree = (folders) => {
  const folderMap = {};
  const rootFolders = [];

  // Create a map of all folders
  folders.forEach(folder => {
    folderMap[folder._id] = { ...folder, children: [] };
  });

  // Build the tree structure
  folders.forEach(folder => {
    if (folder.parent) {
      // Add to parent's children
      if (folderMap[folder.parent]) {
        folderMap[folder.parent].children.push(folderMap[folder._id]);
      }
    } else {
      // Root level folder
      rootFolders.push(folderMap[folder._id]);
    }
  });

  return rootFolders;
};

// Get folder path (breadcrumb)
export const getFolderPath = (folderId, folders) => {
  const path = [];
  let currentFolder = folders.find(f => f._id === folderId);

  while (currentFolder) {
    path.unshift(currentFolder);
    currentFolder = folders.find(f => f._id === currentFolder.parent);
  }

  return path;
};
