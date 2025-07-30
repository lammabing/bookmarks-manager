import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookmarks } from '../contexts/BookmarkContext';
import { useFolders } from '../contexts/FolderContext';
import { useTags } from '../contexts/TagContext';
import { useAuth } from '../contexts/AuthContext';
import TagSelector from './TagSelector';
import FolderSelector from './FolderSelector';

const AddBookmarkForm = ({ onClose, initialData = null }) => {
  const navigate = useNavigate();
  const { addBookmark, updateBookmark } = useBookmarks();
  const { tags } = useTags();
  const { folders } = useFolders();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    url: initialData?.url || '',
    title: initialData?.title || '',
    description: initialData?.description || '',
    tags: initialData?.tags || [],
    folder: initialData?.folder?._id || initialData?.folder || null,
    notes: initialData?.notes || '',
    favicon: initialData?.favicon || ''
  });
  const [showSuccess, setShowSuccess] = useState(false);

  // Extract URL parameters when component mounts
  useEffect(() => {
    console.log('AddBookmarkForm useEffect triggered');

    if (!initialData) {
      // First check for pending bookmark data from sessionStorage
      const pendingBookmark = sessionStorage.getItem('pendingBookmark');
      if (pendingBookmark) {
        try {
          const savedData = JSON.parse(pendingBookmark);
          setFormData(savedData);
          sessionStorage.removeItem('pendingBookmark');
          return;
        } catch (error) {
          console.error('Error parsing pending bookmark data:', error);
        }
      }

      // Then check URL parameters
      const queryParams = new URLSearchParams(window.location.search);
      const urlParam = queryParams.get('url');
      const titleParam = queryParams.get('title');
      const descriptionParam = queryParams.get('description');
      const faviconParam = queryParams.get('favicon');

      console.log('URL Parameters:', {
        url: urlParam,
        title: titleParam,
        description: descriptionParam,
        favicon: faviconParam
      });

      if (urlParam) {
        try {
          const decodedUrl = decodeURIComponent(urlParam);
          const faviconUrl = faviconParam
            ? decodeURIComponent(faviconParam)
            : `https://www.google.com/s2/favicons?domain=${new URL(decodedUrl).hostname}`;

          console.log('Setting form data with:', {
            url: decodedUrl,
            title: titleParam ? decodeURIComponent(titleParam) : '',
            description: descriptionParam ? decodeURIComponent(descriptionParam) : '',
            favicon: faviconUrl
          });

          setFormData(prev => ({
            ...prev,
            url: decodedUrl,
            title: titleParam ? decodeURIComponent(titleParam) : '',
            description: descriptionParam ? decodeURIComponent(descriptionParam) : '',
            favicon: faviconUrl
          }));
        } catch (error) {
          console.error('Error parsing URL parameters:', error);
        }
      } else {
        console.log('No URL parameter found');
      }
    } else {
      console.log('Initial data provided, skipping URL parameter extraction');
    }
  }, [initialData]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Wait for auth loading to complete before checking authentication
    if (authLoading) {
      return; // Don't proceed while still checking auth
    }

    // Check authentication after loading is complete
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (initialData) {
        await updateBookmark(initialData._id, formData);
      } else {
        await addBookmark(formData);
      }
      setShowSuccess(true);
      // Close the form after a short delay to show the success message
      setTimeout(() => {
        onClose();
        setShowSuccess(false);
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to save bookmark');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTagsChange = (selectedTags) => {
    console.log('Tags changed:', selectedTags);
    setFormData(prev => ({
      ...prev,
      tags: selectedTags.map(tag => typeof tag === 'string' ? tag : tag.name)
    }));
  };

  const handleFolderChange = (folderId) => {
    setFormData(prev => ({
      ...prev,
      folder: folderId
    }));
  };

  const handleLoginRedirect = () => {
    // Store form data in sessionStorage to preserve it
    sessionStorage.setItem('pendingBookmark', JSON.stringify(formData));
    navigate('/login');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {initialData ? 'Edit Bookmark' : 'Add New Bookmark'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Success Message */}
          {showSuccess && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              Bookmark {initialData ? 'updated' : 'added'} successfully!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL *
              </label>
              <input
                type="url"
                name="url"
                value={formData.url}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com"
              />
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Bookmark title"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description..."
              />
            </div>

            {/* Folder Selection */}
            <div>
              <label htmlFor="folder" className="block text-sm font-medium text-gray-700 mb-1">
                Folder
              </label>
              <FolderSelector
                selectedFolderId={formData.folder}
                onFolderSelect={(folderId) => setFormData(prev => ({ ...prev, folder: folderId }))}
                placeholder="Select a folder (optional)"
                allowCreateNew={true}
                className="w-full"
              />
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <TagSelector
                selectedTags={formData.tags}
                onTagsChange={(tags) => setFormData(prev => ({ ...prev, tags }))}
                placeholder="Add tags..."
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Additional notes..."
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : (initialData ? 'Update' : 'Add')} Bookmark
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddBookmarkForm;
