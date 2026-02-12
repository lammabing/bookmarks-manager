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
      // The server returns bookmarks directly, not in a data property
      const bookmarkData = response.data || response;
      setBookmarks(bookmarkData);
    } catch (error) {
      console.error('Error loading bookmarks:', error);
      setBookmarks([]);
    } finally {
      setLoading(false);
    }
  };

  const addBookmark = async (bookmarkData) => {
    try {
      console.log('Adding bookmark with data:', bookmarkData);
      console.log('Bookmark data tags type:', typeof bookmarkData.tags, 'value:', bookmarkData.tags);

      // Generate favicon if not provided
      const processedTags = Array.isArray(bookmarkData.tags) ? bookmarkData.tags : [];
      console.log('Processed tags for API call:', processedTags);

      const bookmarkDataWithFavicon = {
        ...bookmarkData,
        favicon: bookmarkData.favicon || `https://www.google.com/s2/favicons?domain=${new URL(bookmarkData.url).hostname}`,
        // Ensure tags is always an array
        tags: processedTags,
        // Ensure notes field is included
        notes: bookmarkData.notes || ''
      };

      const response = await bookmarkApi.createBookmark(bookmarkDataWithFavicon);
      // The server returns the bookmark directly, not in a data property
      const newBookmark = response.data || response;
      setBookmarks(prev => [newBookmark, ...prev]);
      return newBookmark;
    } catch (error) {
      console.error('Error adding bookmark:', error);
      throw error;
    }
  };

  const updateBookmark = async (id, bookmarkData) => {
    try {
      console.log('Updating bookmark with data:', bookmarkData);
      console.log('Bookmark data tags type:', typeof bookmarkData.tags, 'value:', bookmarkData.tags);

      // Ensure tags is always an array
      const processedTags = Array.isArray(bookmarkData.tags) ? bookmarkData.tags : [];
      console.log('Processed tags for API call:', processedTags);

      const updatedData = {
        ...bookmarkData,
        // Ensure tags is always an array
        tags: processedTags,
        // Ensure notes field is included
        notes: bookmarkData.notes || ''
      };

      const response = await bookmarkApi.updateBookmark(id, updatedData);
      // The server returns the bookmark directly, not in a data property
      const updatedBookmark = response.data || response;
      setBookmarks(prev => prev.map(bookmark =>
        bookmark._id === id ? updatedBookmark : bookmark
      ));
      return updatedBookmark;
    } catch (error) {
      console.error('Error updating bookmark:', error);
      throw error;
    }
  };

  const shareBookmark = async (id, userIds) => {
    try {
      const response = await bookmarkApi.shareBookmark(id, userIds);
      // The server returns the bookmark directly, not in a data property
      const sharedBookmark = response.data?.bookmark || response;
      setBookmarks(prev => prev.map(bookmark =>
        bookmark._id === id ? sharedBookmark : bookmark
      ));
      return sharedBookmark;
    } catch (error) {
      console.error('Error sharing bookmark:', error);
      throw error;
    }
  };

  const getSharedWithMeBookmarks = async (page = 1, limit = 12) => {
    try {
      const response = await bookmarkApi.getSharedWithMeBookmarks(page, limit);
      // The server returns data directly, not in a data property
      const sharedBookmarksData = response.data || response;
      return sharedBookmarksData;
    } catch (error) {
      console.error('Error fetching shared bookmarks:', error);
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
    updateBookmark,
    shareBookmark,
    getSharedWithMeBookmarks
  };

  return (
    <BookmarkContext.Provider value={value}>
      {children}
    </BookmarkContext.Provider>
  );
};
