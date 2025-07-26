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
import { bookmarkApi } from '../utils/api';
import {
  MagnifyingGlassIcon,
  TagIcon,
  FolderIcon,
  AdjustmentsHorizontalIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { user } = useAuth();
  const { bookmarks, loading, loadBookmarks } = useBookmarks();
  const { folders } = useFolders();
  const { tags } = useTags();
  const { fontSettings } = useFontContext();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showFontSettings, setShowFontSettings] = useState(false);
  const [showTagManager, setShowTagManager] = useState(false);
  const [showFolderManager, setShowFolderManager] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchBarRef = useRef(null);

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
    updateFontSettings(newSettings);
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

  const filteredBookmarks = bookmarks.filter(bookmark => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      bookmark.title.toLowerCase().includes(searchLower) ||
      bookmark.description.toLowerCase().includes(searchLower) ||
      bookmark.url.toLowerCase().includes(searchLower) ||
      (bookmark.tags && bookmark.tags.some(tag => tag.toLowerCase().includes(searchLower)))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {showAddForm && (
        <AddBookmarkForm
          onClose={() => {
            setShowAddForm(false);
            loadBookmarks(); // Reload bookmarks after adding
          }}
        />
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.username}!
        </h1>
        <p className="text-gray-600 mt-2">
          Manage your bookmarks, folders, and tags from here.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Bookmarks</h3>
          <p className="text-3xl font-bold text-blue-600">{bookmarks.length}</p>
          <p className="text-sm text-gray-500">Total bookmarks</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Folders</h3>
          <p className="text-3xl font-bold text-green-600">{folders.length}</p>
          <p className="text-sm text-gray-500">Total folders</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tags</h3>
          <p className="text-3xl font-bold text-purple-600">{tags.length}</p>
          <p className="text-sm text-gray-500">Total tags</p>
        </div>

        {/* Icon Navigation Bar */}
        <div className="mt-8 flex justify-center space-x-6">
          <button
            onClick={() => searchBarRef.current && searchBarRef.current.focus()}
            className="p-3 bg-blue-100 rounded-full text-blue-600 hover:bg-blue-200 transition-colors"
            title="Search"
          >
            <MagnifyingGlassIcon className="h-6 w-6" />
          </button>
          <button
            onClick={() => setShowTagManager(true)}
            className="p-3 bg-purple-100 rounded-full text-purple-600 hover:bg-purple-200 transition-colors"
            title="Manage Tags"
          >
            <TagIcon className="h-6 w-6" />
          </button>
          <button
            onClick={() => setShowFolderManager(true)}
            className="p-3 bg-green-100 rounded-full text-green-600 hover:bg-green-200 transition-colors"
            title="Manage Folders"
          >
            <FolderIcon className="h-6 w-6" />
          </button>
          <button
            onClick={() => setShowFontSettings(true)}
            className="p-3 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors"
            title="Font Settings"
          >
            <AdjustmentsHorizontalIcon className="h-6 w-6" />
          </button>
          <button
            onClick={handleExportBookmarks}
            className="p-3 bg-green-100 rounded-full text-green-600 hover:bg-green-200 transition-colors"
            title="Export Bookmarks"
          >
            <ArrowDownTrayIcon className="h-6 w-6" />
          </button>
          <button
            onClick={() => document.getElementById('import-bookmarks').click()}
            className="p-3 bg-yellow-100 rounded-full text-yellow-600 hover:bg-yellow-200 transition-colors"
            title="Import Bookmarks"
          >
            <ArrowUpTrayIcon className="h-6 w-6" />
          </button>
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Your Bookmarks</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowAddForm(true)}
              className="p-3 bg-blue-100 rounded-full text-blue-600 hover:bg-blue-200 transition-colors"
              title="Add Bookmark"
            >
              <PlusIcon className="h-6 w-6" />
            </button>
            <button
              onClick={() => setShowFontSettings(true)}
              className="p-3 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors"
              title="Font Settings"
            >
              <AdjustmentsHorizontalIcon className="h-6 w-6" />
            </button>
            <button
              onClick={handleExportBookmarks}
              className="p-3 bg-green-100 rounded-full text-green-600 hover:bg-green-200 transition-colors"
              title="Export Bookmarks"
            >
              <ArrowDownTrayIcon className="h-6 w-6" />
            </button>
            <button
              onClick={() => document.getElementById('import-bookmarks').click()}
              className="p-3 bg-yellow-100 rounded-full text-yellow-600 hover:bg-yellow-200 transition-colors"
              title="Import Bookmarks"
            >
              <ArrowUpTrayIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
        <div id="search-bar-container">
          <SearchBar ref={searchBarRef} onSearch={handleSearch} />
        </div>

        {loading ? (
          <p>Loading bookmarks...</p>
        ) : filteredBookmarks.length > 0 ? (
          <BookmarkGrid
            bookmarks={filteredBookmarks}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onSelect={handleSelect}
            viewMode="grid"
            fontSettings={fontSettings}
          />
        ) : (
          <p className="text-gray-500 text-center py-8">No bookmarks match your search. Try different keywords.</p>
        )}
      </div>
      <FontSettingsModal
        isOpen={showFontSettings}
        onClose={() => setShowFontSettings(false)}
        onApply={handleUpdateFontSettings}
        initialSettings={fontSettings}
      />
      <input
        type="file"
        id="import-bookmarks"
        accept=".json"
        onChange={handleImportBookmarks}
        className="hidden"
      />
      
      {/* Tag Manager Modal */}
      {showTagManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold">Tag Management</h2>
              <button
                onClick={() => setShowTagManager(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[70vh]">
              <TagManager />
            </div>
          </div>
        </div>
      )}

      {/* Folder Manager Modal */}
      {showFolderManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold">Folder Management</h2>
              <button
                onClick={() => setShowFolderManager(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[70vh]">
              <FolderManager />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
