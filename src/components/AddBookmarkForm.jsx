import React, { useState, useEffect } from 'react';
import { useBookmarks } from '../contexts/BookmarkContext';
import { useTags } from '../contexts/TagContext';
import FolderSelector from './FolderSelector';
import TagSelector from './TagSelector';

const AddBookmarkForm = ({ onClose, initialData = null }) => {
  const { addBookmark, updateBookmark } = useBookmarks();
  const { tags } = useTags();

  const [formData, setFormData] = useState({
    url: initialData?.url || '',
    title: initialData?.title || '',
    description: initialData?.description || '',
    tags: initialData?.tags || [],
    folder: initialData?.folder || null,
    notes: initialData?.notes || '',
    favicon: initialData?.favicon || ''
  });

  // Extract URL parameters when component mounts
  useEffect(() => {
    console.log('AddBookmarkForm useEffect triggered');
    
    if (!initialData) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (initialData) {
        await updateBookmark(initialData._id, formData);
      } else {
        await addBookmark(formData);
      }
      onClose();
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
    setFormData(prev => ({
      ...prev,
      tags: selectedTags
    }));
  };

  const handleFolderChange = (folderId) => {
    setFormData(prev => ({
      ...prev,
      folder: folderId
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            {initialData ? 'Edit Bookmark' : 'Add New Bookmark'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
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
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Folder
              </label>
              <FolderSelector
                selectedFolderId={formData.folder}
                onFolderSelect={handleFolderChange}
                placeholder="Choose a folder (optional)"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <TagSelector
                selectedTags={formData.tags}
                onTagsChange={handleTagsChange}
                availableTags={tags}
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
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Personal notes..."
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Saving...' : (initialData ? 'Update' : 'Add Bookmark')}
              </button>
            </div>
            <input type="hidden" name="favicon" value={formData.favicon} />
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddBookmarkForm;
