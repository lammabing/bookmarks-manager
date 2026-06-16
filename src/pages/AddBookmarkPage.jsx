import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AddBookmarkForm from '../components/AddBookmarkForm';

const AddBookmarkPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      const queryParams = new URLSearchParams(window.location.search);
      const urlParam = queryParams.get('url');
      if (urlParam) {
        sessionStorage.setItem('pendingBookmark', JSON.stringify({
          url: decodeURIComponent(urlParam),
          title: queryParams.get('title') ? decodeURIComponent(queryParams.get('title')) : '',
          description: queryParams.get('description') ? decodeURIComponent(queryParams.get('description')) : '',
          favicon: queryParams.get('favicon') ? decodeURIComponent(queryParams.get('favicon')) : '',
          tags: queryParams.get('tags') ? decodeURIComponent(queryParams.get('tags')).split(',').map(t => t.trim()).filter(t => t) : []
        }));
      }
      setShowLoginPrompt(true);
    }
  }, [loading, isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h2>
          <p className="text-gray-600 mb-6">Please log in to add bookmarks</p>
          {showLoginPrompt && (
            <button
              onClick={() => navigate('/login')}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Go to Login
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Add New Bookmark</h2>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
          <AddBookmarkForm onClose={() => navigate('/dashboard')} />
        </div>
      </div>
    </div>
  );
};

export default AddBookmarkPage;
