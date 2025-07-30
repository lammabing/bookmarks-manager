import { useState, useEffect, useCallback } from 'react';
import { getFolders, createFolder, updateFolder, deleteFolder, buildFolderTree } from '../utils/folderApi.js';

export const useFolders = () => {
  const [folders, setFolders] = useState([]);
  const [folderTree, setFolderTree] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [selectedFolder, setSelectedFolder] = useState(null);

  // Fetch folders from API
  const fetchFolders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getFolders();
      setFolders(data);
      setFolderTree(buildFolderTree(data));
    } catch (err) {
      setError(err.message || 'Failed to fetch folders');
      console.error('Error fetching folders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new folder
  const addFolder = useCallback(async (folderData) => {
    try {
      const newFolder = await createFolder(folderData);
      setFolders(prev => [...prev, newFolder]);
      setFolderTree(prev => buildFolderTree([...folders, newFolder]));
      return newFolder;
    } catch (err) {
      setError(err.message || 'Failed to create folder');
      throw err;
    }
  }, [folders]);

  // Update existing folder
  const editFolder = useCallback(async (folderId, folderData) => {
    try {
      const updatedFolder = await updateFolder(folderId, folderData);
      setFolders(prev =>
        prev.map(folder =>
          folder._id === folderId ? updatedFolder : folder
        )
      );
      setFolderTree(buildFolderTree(
        folders.map(folder =>
          folder._id === folderId ? updatedFolder : folder
        )
      ));
      return updatedFolder;
    } catch (err) {
      setError(err.message || 'Failed to update folder');
      throw err;
    }
  }, [folders]);

  // Delete folder
  const removeFolder = useCallback(async (folderId) => {
    try {
      await deleteFolder(folderId);
      const updatedFolders = folders.filter(folder => folder._id !== folderId);
      setFolders(updatedFolders);
      setFolderTree(buildFolderTree(updatedFolders));
    } catch (err) {
      setError(err.message || 'Failed to delete folder');
      throw err;
    }
  }, [folders]);

  // Get folder by ID
  const getFolderById = useCallback((folderId) => {
    return folders.find(folder => folder._id === folderId);
  }, [folders]);

  // Get children of a folder
  const getFolderChildren = useCallback((folderId) => {
    return folders.filter(folder => folder.parent === folderId);
  }, [folders]);

  // Toggle folder expansion
  const toggleFolderExpansion = useCallback((folderId) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  }, []);

  // Select folder
  const selectFolder = useCallback((folderId) => {
    setSelectedFolder(folderId);
    
    // Expand all parent folders
    if (folderId) {
      setExpandedFolders(prev => {
        const newSet = new Set(prev);
        let currentFolder = folders.find(f => f._id === folderId);
        
        while (currentFolder && currentFolder.parent) {
          newSet.add(currentFolder.parent);
          currentFolder = folders.find(f => f._id === currentFolder.parent);
        }
        
        return newSet;
      });
    }
  }, [folders]);

  // Clear folder selection
  const clearFolderSelection = useCallback(() => {
    setSelectedFolder(null);
  }, []);

  // Expand all folders
  const expandAllFolders = useCallback(() => {
    const allFolderIds = folders.map(folder => folder._id);
    setExpandedFolders(new Set(allFolderIds));
  }, [folders]);

  // Collapse all folders
  const collapseAllFolders = useCallback(() => {
    setExpandedFolders(new Set());
  }, []);

  // Initial load
  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  return {
    folders,
    folderTree,
    loading,
    error,
    fetchFolders,
    addFolder,
    editFolder,
    removeFolder,
    getFolderById,
    getFolderChildren,
    expandedFolders,
    toggleFolderExpansion,
    selectedFolder,
    selectFolder,
    clearFolderSelection,
    expandAllFolders,
    collapseAllFolders
  };
};