import React, { useState } from 'react';
import { useFolders } from '../contexts/FolderContext';
import { ChevronDownIcon, FolderIcon } from '@heroicons/react/24/outline';

const FolderSelector = ({ selectedFolderId, onFolderSelect, placeholder = "Select a folder" }) => {
  const { folders } = useFolders();
  const [isOpen, setIsOpen] = useState(false);

  const selectedFolder = folders.find(folder => folder._id === selectedFolderId);

  const handleFolderSelect = (folderId) => {
    onFolderSelect(folderId);
    setIsOpen(false);
  };

  const renderFolderOption = (folder, level = 0) => {
    const indent = level * 20;

    return (
      <div key={folder._id}>
        <button
          type="button"
          onClick={() => handleFolderSelect(folder._id)}
          className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center"
          style={{ paddingLeft: `${12 + indent}px` }}
        >
          <FolderIcon className="w-4 h-4 mr-2 text-gray-500" />
          {folder.name}
        </button>
        {folder.children && folder.children.map(child =>
          renderFolderOption(child, level + 1)
        )}
      </div>
    );
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between bg-white"
      >
        <div className="flex items-center">
          <FolderIcon className="w-4 h-4 mr-2 text-gray-500" />
          <span className={selectedFolder ? 'text-gray-900' : 'text-gray-500'}>
            {selectedFolder ? selectedFolder.name : placeholder}
          </span>
        </div>
        <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
          <button
            type="button"
            onClick={() => handleFolderSelect(null)}
            className="w-full px-3 py-2 text-left hover:bg-gray-100 text-gray-500"
          >
            No folder
          </button>
          {folders.map(folder => renderFolderOption(folder))}
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default FolderSelector;
