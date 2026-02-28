import React, { useState, useRef, useEffect } from 'react';
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
import TutorialModal from '../components/TutorialModal';
import FolderTree from '../components/FolderTree';
import FolderBreadcrumb from '../components/FolderBreadcrumb';
import BulkEditToolbar from '../components/BulkEditToolbar';
import BulkEditModal from '../components/BulkEditModal';
import BulkOperationToast from '../components/BulkOperationToast';
import Tooltip from '../components/Tooltip';
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
  QuestionMarkCircleIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { user } = useAuth();
  const { bookmarks, loading, loadBookmarks, getSharedWithMeBookmarks } = useBookmarks();
  const { folders, selectedFolder, selectFolder, clearFolderSelection } = useFolders();
  const { tags } = useTags();
  const { fontSettings } = useFontContext();

  // Debug logging
  console.log('🔍 [DEBUG] Dashboard component mounted');
  console.log('🔍 [DEBUG] Dashboard fontSettings:', fontSettings);
  console.log('🔍 [DEBUG] Dashboard user:', user);
  console.log('🔍 [DEBUG] Dashboard bookmarks:', bookmarks);
  console.log('🔍 [DEBUG] Dashboard folders:', folders);
  console.log('🔍 [DEBUG] Dashboard folders length:', folders?.length || 0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showFontSettings, setShowFontSettings] = useState(false);
  const [showTagManager, setShowTagManager] = useState(false);
  const [showFolderManager, setShowFolderManager] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [sharedBookmarks, setSharedBookmarks] = useState([]);
  const [showSharedWithMe, setShowSharedWithMe] = useState(false);
  const [loadingShared, setLoadingShared] = useState(false);
  const searchBarRef = useRef(null);
  
  // Bulk editing state
  const [selectedBookmarks, setSelectedBookmarks] = useState(new Set());
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [bulkEditOperation, setBulkEditOperation] = useState('edit');
  const [showBulkOperationToast, setShowBulkOperationToast] = useState(false);
  const [bulkOperationMessage, setBulkOperationMessage] = useState('');
  const [bulkOperationType, setBulkOperationType] = useState('success');
  const [showTutorial, setShowTutorial] = useState(false);

  // Load shared bookmarks
  const loadSharedBookmarks = async () => {
    try {
      setLoadingShared(true);
      const response = await getSharedWithMeBookmarks();
      setSharedBookmarks(response.bookmarks || []);
    } catch (error) {
      console.error('Error loading shared bookmarks:', error);
      setSharedBookmarks([]);
    } finally {
      setLoadingShared(false);
    }
  };

  // Toggle between my bookmarks and shared with me
  const toggleSharedWithMe = () => {
    const newValue = !showSharedWithMe;
    setShowSharedWithMe(newValue);
    
    if (newValue && sharedBookmarks.length === 0) {
      loadSharedBookmarks();
    }
  };

  // Filter bookmarks based on search, folder, tags, and sharing mode
  const filteredBookmarks = (showSharedWithMe ? sharedBookmarks : bookmarks).filter(bookmark => {
    const matchesSearch = !searchQuery ||
      bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.url.toLowerCase().includes(searchQuery.toLowerCase());

    // Handle folder filtering - bookmark.folder can be a string ID or an object with _id
    const bookmarkFolderId = typeof bookmark.folder === 'string' 
      ? bookmark.folder 
      : bookmark.folder?._id;
    
    const matchesFolder = !selectedFolder ||
      (selectedFolder === 'none' ? !bookmark.folder : bookmarkFolderId === selectedFolder);

    // Debug logging for folder filtering
    if (selectedFolder) {
      console.log(`[Folder Filter] Bookmark: ${bookmark.title}, bookmark.folder:`, bookmark.folder, ', bookmarkFolderId:', bookmarkFolderId, ', selectedFolder:', selectedFolder, ', matches:', matchesFolder);
    }

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

  const handleExportFilteredBookmarks = () => {
    // Create a blob with the filtered bookmarks data
    const dataStr = JSON.stringify(filteredBookmarks, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    // Create a download link
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'filtered-bookmarks.json';

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

  const handleImportBookmarksHTML = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const fileExtension = file.name.toLowerCase().split('.').pop();
    if (fileExtension !== 'html' && fileExtension !== 'htm') {
      alert('Please select a valid HTML file (.html or .htm)');
      event.target.value = '';
      return;
    }

    const formData = new FormData();
    formData.append('bookmarksFile', file);

    try {
      const token = localStorage.getItem('token'); // Get token from localStorage
      if (!token) {
        alert('Please log in first');
        return;
      }

      const response = await fetch('/api/import/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Successfully imported ${data.bookmarksImported} bookmarks and ${data.foldersImported} folders!`);
        // Reload bookmarks after import
        loadBookmarks();
      } else {
        alert(data.error || 'Failed to import bookmarks');
      }
    } catch (error) {
      console.error('Error importing HTML bookmarks:', error);
      alert('Network error: ' + error.message);
    }

    // Reset file input
    event.target.value = '';
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  // Bulk editing handlers
  const handleSelectionChange = (newSelection) => {
    setSelectedBookmarks(newSelection);
  };

  const handleBulkEdit = () => {
    console.log('🔍 [DEBUG] handleBulkEdit called');
    setBulkEditOperation('edit');
    setShowBulkEditModal(true);
    console.log('🔍 [DEBUG] showBulkEditModal set to:', true, 'operationType:', 'edit');
  };

  const handleBulkTags = () => {
    console.log('🔍 [DEBUG] handleBulkTags called');
    setBulkEditOperation('tags');
    setShowBulkEditModal(true);
    console.log('🔍 [DEBUG] showBulkEditModal set to:', true, 'operationType:', 'tags');
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedBookmarks.size} bookmarks?`)) {
      try {
        const bookmarkIds = Array.from(selectedBookmarks);
        await bookmarkApi.bulkDelete(bookmarkIds);
        
        // Reload bookmarks after deletion
        loadBookmarks();
        
        // Clear selection
        setSelectedBookmarks(new Set());
        
        // Show success message
        setBulkOperationMessage(`Successfully deleted ${selectedBookmarks.size} bookmarks`);
        setBulkOperationType('success');
        setShowBulkOperationToast(true);
        
        // Hide toast after 3 seconds
        setTimeout(() => setShowBulkOperationToast(false), 3000);
      } catch (error) {
        console.error('Error deleting bookmarks:', error);
        setBulkOperationMessage('Error deleting bookmarks');
        setBulkOperationType('error');
        setShowBulkOperationToast(true);
        
        // Hide toast after 3 seconds
        setTimeout(() => setShowBulkOperationToast(false), 3000);
      }
    }
  };

  const handleBulkVisibility = async (visibility) => {
    try {
      const bookmarkIds = Array.from(selectedBookmarks);
      await bookmarkApi.bulkVisibility(bookmarkIds, visibility);
      
      // Reload bookmarks after update
      loadBookmarks();
      
      // Clear selection
      setSelectedBookmarks(new Set());
      
      // Show success message
      setBulkOperationMessage(`Successfully updated ${selectedBookmarks.size} bookmarks`);
      setBulkOperationType('success');
      setShowBulkOperationToast(true);
      
      // Hide toast after 3 seconds
      setTimeout(() => setShowBulkOperationToast(false), 3000);
    } catch (error) {
      console.error('Error updating bookmarks:', error);
      setBulkOperationMessage('Error updating bookmarks');
      setBulkOperationType('error');
      setShowBulkOperationToast(true);
      
      // Hide toast after 3 seconds
      setTimeout(() => setShowBulkOperationToast(false), 3000);
    }
  };

  const handleBulkShare = async () => {
    setBulkEditOperation('share');
    setShowBulkEditModal(true);
  };

  const handleBulkSave = async (data) => {
    console.log('🔍 [DEBUG] handleBulkSave called with data:', data);
    try {
      const bookmarkIds = Array.from(selectedBookmarks);
      console.log('🔍 [DEBUG] bookmarkIds:', bookmarkIds);
      
      // Handle share operation separately
      if (bulkEditOperation === 'share') {
        console.log('🔍 [DEBUG] Handling share operation');
        await bookmarkApi.bulkShare(bookmarkIds, data.sharedWith);
      } else {
        console.log('🔍 [DEBUG] Handling edit/tags operation');
        const operations = {};
        
        // Build operations object based on what's being updated
        if (data.folderId !== undefined) {
          operations.folder = data.folderId;
        }
        
        if (data.tags) {
          operations.tags = {
            action: 'replace',
            tags: data.tags
          };
        }
        
        if (data.visibility) {
          operations.visibility = data.visibility;
        }
        
        console.log('🔍 [DEBUG] operations:', operations);
        
        // Use bulk edit API if we have operations
        if (Object.keys(operations).length > 0) {
          await bookmarkApi.bulkEdit(bookmarkIds, operations);
        }
      }
      
      // Reload bookmarks after update
      loadBookmarks();
      
      // Clear selection
      setSelectedBookmarks(new Set());
      
      // Close modal
      setShowBulkEditModal(false);
      
      // Show success message
      const operationName = bulkEditOperation === 'share' ? 'shared' : 'updated';
      setBulkOperationMessage(`Successfully ${operationName} ${selectedBookmarks.size} bookmarks`);
      setBulkOperationType('success');
      setShowBulkOperationToast(true);
      
      // Hide toast after 3 seconds
      setTimeout(() => setShowBulkOperationToast(false), 3000);
    } catch (error) {
      console.error('Error updating bookmarks:', error);
      setBulkOperationMessage('Error updating bookmarks');
      setBulkOperationType('error');
      setShowBulkOperationToast(true);
      
      // Hide toast after 3 seconds
      setTimeout(() => setShowBulkOperationToast(false), 3000);
    }
  };

  const handleBulkCancel = () => {
    setSelectedBookmarks(new Set());
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Shared with me toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bookmark Source
              </label>
              <button
                onClick={toggleSharedWithMe}
                className={`w-full flex items-center justify-center px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  showSharedWithMe
                    ? 'bg-blue-100 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <UsersIcon className="w-5 h-5 mr-2" />
                {showSharedWithMe ? 'Shared with me' : 'My bookmarks'}
              </button>
            </div>

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
                onChange={(e) => {
                  if (e.target.value === '') {
                    clearFolderSelection();
                  } else {
                    selectFolder(e.target.value);
                  }
                }}
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
          {(searchQuery || selectedFolder || selectedTags.length > 0 || showSharedWithMe) && (
            <div className="mt-4 pt-4 border-t">
              <button
                onClick={() => {
                  setSearchQuery('');
                  clearFolderSelection();
                  setSelectedTags([]);
                  setShowSharedWithMe(false);
                }}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Folder Breadcrumb */}
        <div className="mb-4">
          <FolderBreadcrumb />
        </div>

        {/* Action Toolbar */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                title="Add Bookmark"
              >
                <PlusIcon className="w-5 h-5" />
              </button>

              <button
                onClick={() => setShowFolderManager(true)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                title="Manage Folders"
              >
                <FolderIcon className="w-5 h-5" />
              </button>

              <button
                onClick={() => setShowTagManager(true)}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                title="Manage Tags"
              >
                <TagIcon className="w-5 h-5" />
              </button>

              <button
                onClick={handleExportFilteredBookmarks}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                title="Export Filtered Bookmarks"
              >
                <ArrowDownTrayIcon className="w-5 h-5" />
              </button>

              <Tooltip content="Import Bookmarks from HTML File" position="top">
                <label className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors cursor-pointer">
                  <ArrowUpTrayIcon className="w-5 h-5" />
                  <input
                    type="file"
                    accept=".html,.htm"
                    onChange={handleImportBookmarksHTML}
                    className="hidden"
                  />
                </label>
              </Tooltip>
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
                onClick={() => setShowTutorial(true)}
                className="flex items-center px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <QuestionMarkCircleIcon className="w-5 h-5 mr-2" />
                Tutorial
              </button>
            </div>
          </div>
        </div>

        {/* Folder Tree and Bookmarks Grid */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Folder Tree */}
          <div className="lg:w-1/4">
            <FolderTree className="bg-white rounded-lg shadow" />
          </div>

          {/* Bookmarks Grid */}
          <div className="lg:w-3/4">
            {(loading || (showSharedWithMe && loadingShared)) ? (
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
                onSelectionChange={handleSelectionChange}
                selectedBookmarks={selectedBookmarks}
              />
            )}
          </div>
        </div>

        {/* Bulk Edit Toolbar */}
        {selectedBookmarks.size > 0 && (
          <BulkEditToolbar
            selectedCount={selectedBookmarks.size}
            onBulkEdit={handleBulkEdit}
            onBulkTags={handleBulkTags}
            onBulkDelete={handleBulkDelete}
            onBulkVisibility={handleBulkVisibility}
            onBulkShare={handleBulkShare}
            onCancel={handleBulkCancel}
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

        {showTutorial && (
          <TutorialModal
            isOpen={showTutorial}
            onClose={() => setShowTutorial(false)}
          />
        )}

        {/* Bulk Edit Modal */}
        {console.log('🔍 [DEBUG] BulkEditModal condition:', showBulkEditModal, 'operationType:', bulkEditOperation)}
        {showBulkEditModal && (
          <BulkEditModal
            isOpen={showBulkEditModal}
            onClose={() => {
              console.log('🔍 [DEBUG] BulkEditModal onClose called');
              setShowBulkEditModal(false);
            }}
            selectedBookmarks={Array.from(selectedBookmarks)}
            operationType={bulkEditOperation}
            folders={folders}
            existingTags={tags}
            onSave={handleBulkSave}
            initialData={{
              folderId: bulkEditOperation === 'edit' ? '' : undefined,
              tags: bulkEditOperation === 'tags' ? [] : undefined,
              visibility: bulkEditOperation === 'edit' || bulkEditOperation === 'visibility' ? 'private' : undefined,
              sharedWith: bulkEditOperation === 'share' ? [] : undefined
            }}
          />
        )}

        {/* Bulk Operation Toast */}
        {showBulkOperationToast && (
          <BulkOperationToast
            message={bulkOperationMessage}
            type={bulkOperationType}
            onClose={() => setShowBulkOperationToast(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
