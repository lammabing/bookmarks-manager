import React, { useState } from 'react';
import { useFolders } from '../contexts/FolderContext';
import { ChevronRightIcon, ChevronDownIcon, FolderIcon, FolderOpenIcon } from '@heroicons/react/24/outline';

const FolderTreeItem = ({ folder, level = 0 }) => {
  const {
    expandedFolders,
    toggleFolderExpansion,
    selectedFolder,
    selectFolder,
    getFolderChildren
  } = useFolders();

  const children = getFolderChildren(folder._id);
  const hasChildren = children.length > 0;
  const isExpanded = expandedFolders.has(folder._id);
  const isSelected = selectedFolder === folder._id;

  const handleToggleExpansion = (e) => {
    e.stopPropagation();
    if (hasChildren) {
      toggleFolderExpansion(folder._id);
    }
  };

  const handleSelectFolder = () => {
    selectFolder(folder._id);
  };

  return (
    <div className="select-none">
      <div
        className={`flex items-center py-1 px-2 rounded cursor-pointer hover:bg-gray-100 ${
          isSelected ? 'bg-blue-100 text-blue-800' : 'text-gray-700'
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleSelectFolder}
      >
        {/* Expansion toggle */}
        <button
          onClick={handleToggleExpansion}
          className={`mr-1 p-0.5 rounded hover:bg-gray-200 ${
            hasChildren ? 'visible' : 'invisible'
          }`}
        >
          {hasChildren && (
            isExpanded ? (
              <ChevronDownIcon className="w-4 h-4" />
            ) : (
              <ChevronRightIcon className="w-4 h-4" />
            )
          )}
        </button>

        {/* Folder icon */}
        <div className="mr-2">
          {isExpanded ? (
            <FolderOpenIcon className="w-4 h-4" style={{ color: folder.color || '#6B7280' }} />
          ) : (
            <FolderIcon className="w-4 h-4" style={{ color: folder.color || '#6B7280' }} />
          )}
        </div>

        {/* Folder name */}
        <span className="text-sm font-medium truncate flex-1">
          {folder.name}
        </span>

        {/* Bookmark count */}
        {folder.bookmarkCount > 0 && (
          <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
            {folder.bookmarkCount}
          </span>
        )}
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {children.map(child => (
            <FolderTreeItem
              key={child._id}
              folder={child}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FolderTree = ({ className = '' }) => {
  const { folderTree, loading, error, clearFolderSelection, selectedFolder } = useFolders();

  if (loading) {
    return (
      <div className={`${className} p-4`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2 ml-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2 ml-8"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} p-4`}>
        <div className="text-red-600 text-sm">
          Error loading folders: {error}
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">Folders</h3>
        <button
          onClick={clearFolderSelection}
          className={`text-xs px-2 py-1 rounded ${
            selectedFolder 
              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          All
        </button>
      </div>

      {/* Tree */}
      <div className="p-2 max-h-96 overflow-y-auto">
        {folderTree.length === 0 ? (
          <div className="text-gray-500 text-sm p-4 text-center">
            No folders yet. Create your first folder to organize bookmarks.
          </div>
        ) : (
          folderTree.map(folder => (
            <FolderTreeItem key={folder._id} folder={folder} />
          ))
        )}
      </div>
    </div>
  );
};

export default FolderTree;
