import React, { createContext, useContext, useState, useEffect } from 'react';
import { tagApi } from '../utils/api';
import { useAuth } from './AuthContext';

const TagContext = createContext();

export const useTags = () => {
  const context = useContext(TagContext);
  if (!context) {
    throw new Error('useTags must be used within a TagProvider');
  }
  return context;
};

export const TagProvider = ({ children }) => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const loadTags = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const response = await tagApi.getTags();
      setTags(response.data);
    } catch (error) {
      console.error('Error loading tags:', error);
      setTags([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadTags();
    } else {
      setTags([]);
    }
  }, [isAuthenticated]);

  const value = {
    tags,
    loading,
    loadTags,
    setTags
  };

  return (
    <TagContext.Provider value={value}>
      {children}
    </TagContext.Provider>
  );
};
