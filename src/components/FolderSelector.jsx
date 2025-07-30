import { useState, useRef, useEffect } from 'react';
import { useFolders } from '../contexts/FolderContext';
import { ChevronDownIcon, FolderIcon, PlusIcon } from '@heroicons/react/24/outline';

const FolderSelector = ({
  selectedFolderId,
  onFolderSelect,
  placeholder = "Select a folder",
  allowCreateNew = false,
  className = ""
}) => {
  const { folders, addFolder } = useFolders();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowCreateForm(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Build folder tree for display
  const buildFolderTree = (folders, parentId = null, level = 0) => {
    return folders
      .filter(folder => folder.parent === parentId)
      .map(folder => ({
        ...folder,
        level,
        children: buildFolderTree(folders, folder._id, level + 1)
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  // Flatten tree for search
  const flattenFolders = (tree) => {
    let result = [];
    tree.forEach(folder => {
      result.push(folder);
      if (folder.children) {
        result = result.concat(flattenFolders(folder.children));
      }
    });
    return result;
  };

  const folderTree = buildFolderTree(folders);
  const flatFolders = flattenFolders(folderTree);

  // Filter folders based on search
  const filteredFolders = searchTerm
    ? flatFolders.filter(folder =>
        folder.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : flatFolders;

  const selectedFolder = folders.find(f => f._id === selectedFolderId);

  const handleFolderSelect = (folderId) => {
    onFolderSelect(folderId);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      const newFolder = await addFolder({
        name: newFolderName.trim(),
        parent: null,
        color: '#3B82F6'
      });

      setNewFolderName('');
      setShowCreateForm(false);
      handleFolderSelect(newFolder._id);
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  const renderFolder = (folder) => (
    <div
      key={folder._id}
      onClick={() => handleFolderSelect(folder._id)}
      className={`
        flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100
        ${selectedFolderId === folder._id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}
      `}
      style={{ paddingLeft: `${12 + folder.level * 20}px` }}
    >
      <FolderIcon
        className="w-4 h-4 mr-2 flex-shrink-0"
        style={{ color: folder.color }}
      />
      <span className="truncate">{folder.name}</span>
      {folder.bookmarkCount > 0 && (
        <span className="ml-auto text-xs text-gray-500">
          {folder.bookmarkCount}
        </span>
      )}
    </div>
  );

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Selected folder display */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
      >
        <div className="flex items-center">
          {selectedFolder ? (
            <>
              <FolderIcon
                className="w-4 h-4 mr-2"
                style={{ color: selectedFolder.color }}
              />
              <span>{selectedFolder.name}</span>
            </>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </div>
        <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {/* Search */}
          <div className="p-2 border-b">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search folders..."
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* No folder option */}
          <div
            onClick={() => handleFolderSelect(null)}
            className={`
              flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100
              ${selectedFolderId === null ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}
            `}
          >
            <span className="italic">No folder</span>
          </div>

          {/* Folder list */}
          {filteredFolders.length > 0 ? (
            filteredFolders.map(renderFolder)
          ) : (
            <div className="px-3 py-2 text-gray-500 text-sm">
              {searchTerm ? 'No folders found' : 'No folders available'}
            </div>
          )}

          {/* Create new folder */}
          {allowCreateNew && (
            <div className="border-t">
              {showCreateForm ? (
                <form onSubmit={handleCreateFolder} className="p-2">
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Folder name"
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    autoFocus
                  />
                  <div className="flex justify-end space-x-1 mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateForm(false);
                        setNewFolderName('');
                      }}
                      className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Create
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCreateForm(true)}
                  className="w-full flex items-center px-3 py-2 text-blue-600 hover:bg-blue-50"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Create new folder
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FolderSelector;
