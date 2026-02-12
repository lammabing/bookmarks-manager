import React, { useState, useEffect } from 'react';
import { X, Folder, Tag, Lock, Globe, Users, Save, Plus, Trash2 } from 'lucide-react';

const BulkEditModal = ({
  isOpen,
  onClose,
  selectedBookmarks,
  operationType,
  folders = [],
  existingTags = [],
  onSave,
  initialData = {}
}) => {
  console.log('🔍 [DEBUG] BulkEditModal props:', { isOpen, operationType, selectedBookmarks, folders, existingTags, onSave, initialData });
  console.log('🔍 [DEBUG] BulkEditModal initialData:', initialData);
  
  const [formData, setFormData] = useState(initialData);
  const [newTag, setNewTag] = useState('');
  const [selectedFolder, setSelectedFolder] = useState(initialData.folderId || '');
  const [selectedTags, setSelectedTags] = useState(new Set(initialData.tags || []));
  const [selectedVisibility, setSelectedVisibility] = useState(initialData.visibility || 'private');
  const [sharedWith, setSharedWith] = useState(initialData.sharedWith || []);
  const [newSharedUser, setNewSharedUser] = useState('');
  
  // Reset state when operationType changes
  useEffect(() => {
    console.log('🔍 [DEBUG] BulkEditModal operationType changed to:', operationType);
    console.log('🔍 [DEBUG] BulkEditModal initialData in useEffect:', initialData);
    
    // Set default values based on operation type if initialData is undefined
    const defaultFolderId = operationType === 'edit' ? (initialData.folderId || '') : '';
    const defaultTags = operationType === 'tags' ? (initialData.tags || []) : [];
    const defaultVisibility = (operationType === 'edit' || operationType === 'visibility') ? (initialData.visibility || 'private') : 'private';
    const defaultSharedWith = operationType === 'share' ? (initialData.sharedWith || []) : [];
    
    setSelectedFolder(defaultFolderId);
    setSelectedTags(new Set(defaultTags));
    setSelectedVisibility(defaultVisibility);
    setSharedWith(defaultSharedWith);
    setNewTag('');
    setNewSharedUser('');
  }, [operationType, initialData]);

  const handleSave = () => {
    console.log('🔍 [DEBUG] handleSave called');
    const data = {
      folderId: selectedFolder,
      tags: Array.from(selectedTags),
      visibility: selectedVisibility,
      sharedWith: sharedWith
    };
    
    console.log('🔍 [DEBUG] handleSave data:', data);
    if (onSave) {
      onSave(data);
    }
  };

  const handleAddTag = () => {
    console.log('🔍 [DEBUG] handleAddTag called with newTag:', newTag);
    if (newTag.trim() && !selectedTags.has(newTag.trim())) {
      setSelectedTags(new Set([...selectedTags, newTag.trim()]));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag) => {
    console.log('🔍 [DEBUG] handleRemoveTag called with tag:', tag);
    const newTags = new Set(selectedTags);
    newTags.delete(tag);
    setSelectedTags(newTags);
  };

  const handleAddSharedUser = () => {
    console.log('🔍 [DEBUG] handleAddSharedUser called with newSharedUser:', newSharedUser);
    if (newSharedUser.trim() && !sharedWith.includes(newSharedUser.trim())) {
      setSharedWith([...sharedWith, newSharedUser.trim()]);
      setNewSharedUser('');
    }
  };

  const handleRemoveSharedUser = (user) => {
    console.log('🔍 [DEBUG] handleRemoveSharedUser called with user:', user);
    setSharedWith(sharedWith.filter(u => u !== user));
  };

  const handleKeyPress = (e, callback) => {
    if (e.key === 'Enter') {
      console.log('🔍 [DEBUG] handleKeyPress called with Enter key');
      callback();
    }
  };

  console.log('🔍 [DEBUG] BulkEditModal rendering with isOpen:', isOpen, 'operationType:', operationType);
  if (!isOpen) return null;
  
  useEffect(() => {
    console.log('🔍 [DEBUG] BulkEditModal useEffect called with operationType:', operationType);
  }, [operationType]);

  const renderContent = () => {
    console.log('🔍 [DEBUG] renderContent called with operationType:', operationType);
    switch (operationType) {
      case 'edit':
        console.log('🔍 [DEBUG] Rendering edit content');
        return (
          <div className="space-y-6">
            {/* Folder Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Move to Folder
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedFolder('')}
                  className={`p-3 border rounded-lg text-center transition-colors ${
                    selectedFolder === ''
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Folder className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm">No Folder</span>
                </button>
                {folders && folders.map((folder) => (
                  <button
                    key={folder._id}
                    onClick={() => setSelectedFolder(folder._id)}
                    className={`p-3 border rounded-lg text-center transition-colors ${
                      selectedFolder === folder._id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Folder
                      className="w-5 h-5 mx-auto mb-1"
                      style={{ color: folder.color || '#3B82F6' }}
                    />
                    <span className="text-sm truncate">{folder.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tags Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Tags
              </label>
              <div className="mb-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, handleAddTag)}
                    placeholder="Add a new tag"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {existingTags && existingTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      const newTags = new Set(selectedTags);
                      if (newTags.has(tag)) {
                        newTags.delete(tag);
                      } else {
                        newTags.add(tag);
                      }
                      setSelectedTags(newTags);
                    }}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedTags.has(tag)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
                
                {Array.from(selectedTags).map((tag) => (
                  <div
                    key={tag}
                    className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 hover:text-blue-900"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Visibility Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visibility
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setSelectedVisibility('private')}
                  className={`p-3 border rounded-lg text-center transition-colors ${
                    selectedVisibility === 'private'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Lock className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm">Private</span>
                </button>
                <button
                  onClick={() => setSelectedVisibility('public')}
                  className={`p-3 border rounded-lg text-center transition-colors ${
                    selectedVisibility === 'public'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Globe className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm">Public</span>
                </button>
                <button
                  onClick={() => setSelectedVisibility('selected')}
                  className={`p-3 border rounded-lg text-center transition-colors ${
                    selectedVisibility === 'selected'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Users className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm">Selected Users</span>
                </button>
              </div>
            </div>

            {/* Sharing Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Share With
              </label>
              <div className="mb-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSharedUser}
                    onChange={(e) => setNewSharedUser(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, handleAddSharedUser)}
                    placeholder="Add username to share with"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleAddSharedUser}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {sharedWith.map((user) => (
                  <div
                    key={user}
                    className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                  >
                    {user}
                    <button
                      onClick={() => handleRemoveSharedUser(user)}
                      className="ml-2 hover:text-green-900"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'tags':
        console.log('🔍 [DEBUG] Rendering tags content');
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Tags to Selected Bookmarks
              </label>
              <div className="mb-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, handleAddTag)}
                    placeholder="Add a new tag"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {existingTags && existingTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      const newTags = new Set(selectedTags);
                      if (newTags.has(tag)) {
                        newTags.delete(tag);
                      } else {
                        newTags.add(tag);
                      }
                      setSelectedTags(newTags);
                    }}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedTags.has(tag)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
                
                {Array.from(selectedTags).map((tag) => (
                  <div
                    key={tag}
                    className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 hover:text-blue-900"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'visibility':
        console.log('🔍 [DEBUG] Rendering visibility content');
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Set Visibility for Selected Bookmarks
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setSelectedVisibility('private')}
                  className={`p-3 border rounded-lg text-center transition-colors ${
                    selectedVisibility === 'private'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Lock className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm">Private</span>
                </button>
                <button
                  onClick={() => setSelectedVisibility('public')}
                  className={`p-3 border rounded-lg text-center transition-colors ${
                    selectedVisibility === 'public'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Globe className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm">Public</span>
                </button>
                <button
                  onClick={() => setSelectedVisibility('selected')}
                  className={`p-3 border rounded-lg text-center transition-colors ${
                    selectedVisibility === 'selected'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Users className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm">Selected Users</span>
                </button>
              </div>
            </div>
          </div>
        );

      case 'share':
        console.log('🔍 [DEBUG] Rendering share content');
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Share Selected Bookmarks With
              </label>
              <div className="mb-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSharedUser}
                    onChange={(e) => setNewSharedUser(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, handleAddSharedUser)}
                    placeholder="Add username to share with"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleAddSharedUser}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {sharedWith.map((user) => (
                  <div
                    key={user}
                    className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                  >
                    {user}
                    <button
                      onClick={() => handleRemoveSharedUser(user)}
                      className="ml-2 hover:text-green-900"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        console.log('🔍 [DEBUG] Unknown operationType:', operationType);
        return (
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Unknown Operation</h3>
            <p className="text-gray-600">The operation type "{operationType}" is not recognized.</p>
          </div>
        );
    }
  };

  console.log('🔍 [DEBUG] BulkEditModal returning JSX with operationType:', operationType);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {operationType === 'edit' && 'Edit Bookmarks'}
            {operationType === 'tags' && 'Add Tags'}
            {operationType === 'visibility' && 'Change Visibility'}
            {operationType === 'share' && 'Share Bookmarks'}
            {!(operationType === 'edit' || operationType === 'tags' || operationType === 'visibility' || operationType === 'share') && `Bulk Edit: ${operationType}`}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkEditModal;