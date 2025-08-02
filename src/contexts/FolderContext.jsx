import React, { createContext, useContext } from 'react';
import { useFolders as useFoldersHook } from '../hooks/useFolders';
import { useAuth } from './AuthContext';

const FolderContext = createContext();

export const useFolders = () => {
  const context = useContext(FolderContext);
  if (!context) {
    throw new Error('useFolders must be used within a FolderProvider');
  }
  return context;
};

export const FolderProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  console.log('🔍 [DEBUG] FolderProvider - isAuthenticated:', isAuthenticated);
  const foldersData = useFoldersHook();

  // We only want to expose the data and functions that are relevant to the context
  const value = {
    ...foldersData
  };

  return (
    <FolderContext.Provider value={value}>
      {children}
    </FolderContext.Provider>
  );
};
