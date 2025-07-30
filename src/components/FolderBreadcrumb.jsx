import React from 'react';
import { useFolders } from '../contexts/FolderContext';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';

const FolderBreadcrumb = ({ className = '' }) => {
  const { selectedFolder, folders, selectFolder, clearFolderSelection } = useFolders();

  // Build breadcrumb path
  const buildBreadcrumbPath = (folderId) => {
    const path = [];
    let currentFolder = folders.find(f => f._id === folderId);
    
    while (currentFolder) {
      path.unshift(currentFolder);
      currentFolder = currentFolder.parent ? 
        folders.find(f => f._id === currentFolder.parent) : null;
    }
    
    return path;
  };

  const breadcrumbPath = selectedFolder ? buildBreadcrumbPath(selectedFolder) : [];

  if (!selectedFolder && breadcrumbPath.length === 0) {
    return null;
  }

  return (
    <nav className={`flex items-center space-x-1 text-sm text-gray-600 ${className}`}>
      {/* Home/All Bookmarks */}
      <button
        onClick={clearFolderSelection}
        className="flex items-center hover:text-blue-600 transition-colors"
      >
        <HomeIcon className="w-4 h-4 mr-1" />
        All Bookmarks
      </button>

      {/* Breadcrumb path */}
      {breadcrumbPath.map((folder, index) => (
        <React.Fragment key={folder._id}>
          <ChevronRightIcon className="w-4 h-4 text-gray-400" />
          <button
            onClick={() => selectFolder(folder._id)}
            className={`hover:text-blue-600 transition-colors ${
              index === breadcrumbPath.length - 1 
                ? 'text-blue-600 font-medium' 
                : 'text-gray-600'
            }`}
          >
            {folder.name}
          </button>
        </React.Fragment>
      ))}
    </nav>
  );
};

export default FolderBreadcrumb;