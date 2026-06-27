import { useState, useEffect, useCallback } from 'react';
import { getFolders, createFolder, updateFolder, deleteFolder, buildFolderTree } from '../utils/folderApi.js';
import { useAuth } from '../contexts/AuthContext';

export const useFolders = () => {
  const { isAuthenticated } = useAuth();
  const [folders, setFolders] = useState([]);
  const [folderTree, setFolderTree] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [selectedFolder, setSelectedFolder] = useState(null);

  // Fetch folders from API
  const fetchFolders = useCallback(async () => {
    console.log('🔍 [DEBUG] fetchFolders called');
    console.log('🔍 [DEBUG] isAuthenticated:', isAuthenticated);
    console.log('🔍 [DEBUG] Token in localStorage:', localStorage.getItem('token') ? 'Present' : 'Missing');
    
    // Only fetch folders if user is authenticated
    if (!isAuthenticated) {
      console.log('🔍 [DEBUG] User not authenticated, skipping folder fetch');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      console.log('🔍 [DEBUG] Making API call to getFolders...');
      const data = await getFolders();
      console.log('🔍 [DEBUG] API response received, folders count:', data?.length || 0);
      setFolders(data);
      setFolderTree(buildFolderTree(data));
    } catch (err) {
      console.error('🔍 [DEBUG] Error fetching folders:', err);
      console.error('🔍 [DEBUG] Error response status:', err.response?.status);
      console.error('🔍 [DEBUG] Error response data:', err.response?.data);
      setError(err.message || 'Failed to fetch folders');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Create new folder
  const addFolder = useCallback(async (folderData) => {
    if (!isAuthenticated) {
      setError('User not authenticated');
      throw new Error('User not authenticated');
    }
    
    try {
      const newFolder = await createFolder(folderData);
      const updatedFolders = [...folders, newFolder];
      setFolders(updatedFolders);
      setFolderTree(buildFolderTree(updatedFolders));
      return newFolder;
    } catch (err) {
      setError(err.message || 'Failed to create folder');
      throw err;
    }
  }, [folders, isAuthenticated]);

  // Update existing folder
  const editFolder = useCallback(async (folderId, folderData) => {
    if (!isAuthenticated) {
      setError('User not authenticated');
      throw new Error('User not authenticated');
    }
    
    try {
      const updatedFolder = await updateFolder(folderId, folderData);
      const updatedFolders = folders.map(folder =>
        folder._id === folderId ? updatedFolder : folder
      );
      setFolders(updatedFolders);
      setFolderTree(buildFolderTree(updatedFolders));
      return updatedFolder;
    } catch (err) {
      setError(err.message || 'Failed to update folder');
      throw err;
    }
  }, [folders, isAuthenticated]);

  // Delete folder
  const removeFolder = useCallback(async (folderId) => {
    if (!isAuthenticated) {
      setError('User not authenticated');
      throw new Error('User not authenticated');
    }
    
    try {
      await deleteFolder(folderId);
      const updatedFolders = folders.filter(folder => folder._id !== folderId);
      setFolders(updatedFolders);
      setFolderTree(buildFolderTree(updatedFolders));
    } catch (err) {
      setError(err.message || 'Failed to delete folder');
      throw err;
    }
  }, [folders, isAuthenticated]);

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

  // Initial load and re-fetch when authentication changes
  useEffect(() => {
    console.log('🔍 [DEBUG] useFolders useEffect running');
    console.log('🔍 [DEBUG] isAuthenticated:', isAuthenticated);
    console.log('🔍 [DEBUG] Current folders state:', folders.length);
    fetchFolders();
  }, [fetchFolders, isAuthenticated]);

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