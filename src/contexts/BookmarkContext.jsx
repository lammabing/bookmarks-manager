import React, { createContext, useContext, useState, useEffect } from 'react';
import { bookmarkApi } from '../utils/api';
import { useAuth } from './AuthContext';

const BookmarkContext = createContext();

export const useBookmarks = () => {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error('useBookmarks must be used within a BookmarkProvider');
  }
  return context;
};

export const BookmarkProvider = ({ children }) => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const loadBookmarks = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const response = await bookmarkApi.getBookmarks();
      setBookmarks(response.data);
    } catch (error) {
      console.error('Error loading bookmarks:', error);
      setBookmarks([]);
    } finally {
      setLoading(false);
    }
  };

  const addBookmark = async (bookmarkData) => {
    try {
      // Generate favicon if not provided
      const bookmarkDataWithFavicon = {
        ...bookmarkData,
        favicon: bookmarkData.favicon || `https://www.google.com/s2/favicons?domain=${new URL(bookmarkData.url).hostname}`
      };
      
      const response = await bookmarkApi.createBookmark(bookmarkDataWithFavicon);
      setBookmarks(prev => [response.data, ...prev]);
      return response.data;
    } catch (error) {
      console.error('Error adding bookmark:', error);
      throw error;
    }
  };

  const updateBookmark = async (id, bookmarkData) => {
    try {
      const response = await bookmarkApi.updateBookmark(id, bookmarkData);
      setBookmarks(prev => prev.map(bookmark => bookmark._id === id ? response.data : bookmark));
      return response.data;
    } catch (error) {
      console.error('Error updating bookmark:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadBookmarks();
    } else {
      setBookmarks([]);
    }
  }, [isAuthenticated]);

  const value = {
    bookmarks,
    loading,
    loadBookmarks,
    setBookmarks,
    addBookmark,
    updateBookmark
  };

  return (
    <BookmarkContext.Provider value={value}>
      {children}
    </BookmarkContext.Provider>
  );
};
