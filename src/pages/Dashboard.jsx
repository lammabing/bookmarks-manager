import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useBookmarks } from '../contexts/BookmarkContext';
import { useFolders } from '../contexts/FolderContext';
import { useTags } from '../contexts/TagContext';
import { useFontContext } from '../contexts/FontContext';
import BookmarkGrid from '../components/BookmarkGrid';
import AddBookmarkForm from '../components/AddBookmarkForm';
import SearchBar from '../components/SearchBar';
import TagManager from '../components/TagManager';
import FolderManager from '../components/FolderManager';
import FontSettingsModal from '../components/FontSettingsModal';
import FolderTree from '../components/FolderTree';
import FolderBreadcrumb from '../components/FolderBreadcrumb';
import { bookmarkApi } from '../utils/api';
import {
  MagnifyingGlassIcon,
  TagIcon,
  FolderIcon,
  AdjustmentsHorizontalIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  PlusIcon,
  BookmarkIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { user } = useAuth();
  const { bookmarks, loading, loadBookmarks } = useBookmarks();
  const { folders } = useFolders();
  const { tags } = useTags();
  const { fontSettings } = useFontContext();

  // Debug logging
  console.log('Dashboard fontSettings:', fontSettings);
  console.log('Dashboard user:', user);
  console.log('Dashboard bookmarks:', bookmarks);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showFontSettings, setShowFontSettings] = useState(false);
  const [showTagManager, setShowTagManager] = useState(false);
  const [showFolderManager, setShowFolderManager] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const searchBarRef = useRef(null);

  // Filter bookmarks based on search, folder, and tags
  const filteredBookmarks = bookmarks.filter(bookmark => {
    const matchesSearch = !searchQuery ||
      bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.url.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFolder = !selectedFolder ||
      (selectedFolder === 'none' ? !bookmark.folder : bookmark.folder?._id === selectedFolder);

    const matchesTags = selectedTags.length === 0 ||
      selectedTags.every(tag => bookmark.tags?.includes(tag));

    return matchesSearch && matchesFolder && matchesTags;
  });

  const handleDelete = async (id) => {
    try {
      await bookmarkApi.deleteBookmark(id);
      loadBookmarks(); // Reload bookmarks after deletion
    } catch (error) {
      console.error('Error deleting bookmark:', error);
    }
  };

  const handleEdit = async (updatedBookmark) => {
    try {
      await bookmarkApi.updateBookmark(updatedBookmark._id, updatedBookmark);
      loadBookmarks(); // Reload bookmarks after update
    } catch (error) {
      console.error('Error updating bookmark:', error);
    }
  };

  const handleSelect = (bookmark) => {
    // Open bookmark in new tab
    window.open(bookmark.url, '_blank');
  };

  const handleUpdateFontSettings = (newSettings) => {
    // This function should update font settings through the context
    console.log('Font settings updated:', newSettings);
  };

  const handleExportBookmarks = () => {
    // Create a blob with the bookmarks data
    const dataStr = JSON.stringify(bookmarks, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    // Create a download link
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bookmarks.json';

    // Trigger the download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    URL.revokeObjectURL(url);
  };

  const handleImportBookmarks = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);
        if (!Array.isArray(jsonData)) {
          alert('Invalid file format. Expected an array of bookmarks.');
          return;
        }

        // Import bookmarks one by one
        let successCount = 0;
        let errorCount = 0;

        for (const bookmark of jsonData) {
          try {
            await bookmarkApi.createBookmark(bookmark);
            successCount++;
          } catch (error) {
            console.error('Error importing bookmark:', bookmark, error);
            errorCount++;
          }
        }

        // Reload bookmarks after import
        loadBookmarks();

        // Show result
        alert(`Import completed: ${successCount} bookmarks imported, ${errorCount} failed.`);
      } catch (error) {
        console.error('Error parsing JSON file:', error);
        alert('Error parsing JSON file. Please check the file format.');
      }
    };
    reader.readAsText(file);

    // Reset file input
    event.target.value = '';
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-gray-600">Manage your bookmarks and collections</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <BookmarkIcon className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Bookmarks</p>
                <p className="text-2xl font-bold text-gray-900">{bookmarks.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <FolderIcon className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Folders</p>
                <p className="text-2xl font-bold text-gray-900">{folders.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <TagIcon className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Tags</p>
                <p className="text-2xl font-bold text-gray-900">{tags.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <SearchBar
                ref={searchBarRef}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                placeholder="Search bookmarks..."
              />
            </div>

            {/* Folder Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Folder
              </label>
              <select
                value={selectedFolder || ''}
                onChange={(e) => setSelectedFolder(e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All folders</option>
                <option value="none">No folder</option>
                {folders.map(folder => (
                  <option key={folder._id} value={folder._id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tag Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Tags
              </label>
              <select
                multiple
                value={selectedTags}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => option.value);
                  setSelectedTags(values);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                size="3"
              >
                {tags.map((tag, index) => (
                  <option key={typeof tag === 'string' ? tag : `tag-${index}`} value={typeof tag === 'string' ? tag : tag.name || tag._id}>
                    {typeof tag === 'string' ? tag : tag.name || tag._id}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          {(searchQuery || selectedFolder || selectedTags.length > 0) && (
            <div className="mt-4 pt-4 border-t">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedFolder(null);
                  setSelectedTags([]);
                }}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Action Toolbar */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Add Bookmark
              </button>

              <button
                onClick={() => setShowFolderManager(true)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <FolderIcon className="w-5 h-5 mr-2" />
                Manage Folders
              </button>

              <button
                onClick={() => setShowTagManager(true)}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <TagIcon className="w-5 h-5 mr-2" />
                Manage Tags
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 text-sm ${
                    viewMode === 'grid' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 text-sm ${
                    viewMode === 'list' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  List
                </button>
              </div>

              <button
                onClick={() => setShowFontSettings(true)}
                className="flex items-center px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Cog6ToothIcon className="w-5 h-5 mr-2" />
                Settings
              </button>
            </div>
          </div>
        </div>

        {/* Bookmarks Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <BookmarkGrid
            bookmarks={filteredBookmarks}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onSelect={handleSelect}
            viewMode={viewMode}
            fontSettings={fontSettings || {
              titleFontFamily: 'Inter, sans-serif',
              titleFontSize: 16,
              titleFontWeight: 'bold',
              titleFontColor: '#111827',
              descriptionFontFamily: 'Inter, sans-serif',
              descriptionFontSize: 14,
              descriptionFontWeight: 'normal',
              descriptionFontColor: '#6B7280'
            }}
          />
        )}

        {/* Modals */}
        {showAddForm && (
          <AddBookmarkForm onClose={() => setShowAddForm(false)} />
        )}

        {showFolderManager && (
          <FolderManager onClose={() => setShowFolderManager(false)} />
        )}

        {showTagManager && (
          <TagManager onClose={() => setShowTagManager(false)} />
        )}

        {showFontSettings && (
          <FontSettingsModal
            isOpen={showFontSettings}
            onClose={() => setShowFontSettings(false)}
            onUpdateSettings={handleUpdateFontSettings}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
