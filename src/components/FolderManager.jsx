import React, { useState } from 'react';
import { useFolders } from '../contexts/FolderContext';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const FolderManager = ({ onClose }) => {
  const { folders, addFolder, editFolder, removeFolder, loading, error } = useFolders();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent: null,
    color: '#3B82F6'
  });

  const handleAddFolder = () => {
    setEditingFolder(null);
    setFormData({
      name: '',
      description: '',
      parent: null,
      color: '#3B82F6'
    });
    setShowAddForm(true);
  };

  const handleEditFolder = (folder) => {
    setEditingFolder(folder);
    setFormData({
      name: folder.name,
      description: folder.description || '',
      parent: folder.parent || null,
      color: folder.color || '#3B82F6'
    });
    setShowAddForm(true);
  };

  const handleDeleteFolder = async (folderId) => {
    if (window.confirm('Are you sure you want to delete this folder? All bookmarks in this folder will be moved to the parent folder.')) {
      try {
        await removeFolder(folderId);
      } catch (err) {
        console.error('Error deleting folder:', err);
        alert('Failed to delete folder: ' + (err.message || 'Unknown error'));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFolder) {
        await editFolder(editingFolder._id, formData);
      } else {
        await addFolder(formData);
      }
      setShowAddForm(false);
    } catch (err) {
      console.error('Error saving folder:', err);
      alert('Failed to save folder: ' + (err.message || 'Unknown error'));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Folder Management</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleAddFolder}
                className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <PlusIcon className="w-4 h-4 mr-1" />
                Add Folder
              </button>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {showAddForm && (
            <div className="mb-6 p-4 border border-gray-200 rounded-lg">
              <h4 className="text-md font-medium mb-3">
                {editingFolder ? 'Edit Folder' : 'Add New Folder'}
              </h4>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Folder name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Folder description (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Parent Folder
                  </label>
                  <select
                    name="parent"
                    value={formData.parent || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">None (Root folder)</option>
                    {folders.map(folder => (
                      <option key={folder._id} value={folder._id}>
                        {folder.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <div className="flex items-center">
                    <input
                      type="color"
                      name="color"
                      value={formData.color}
                      onChange={handleInputChange}
                      className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <span className="ml-2 text-sm text-gray-600">{formData.color}</span>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : (editingFolder ? 'Update Folder' : 'Create Folder')}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="border border-gray-200 rounded-lg">
            <div className="grid grid-cols-1 divide-y divide-gray-200">
              {folders.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No folders yet. Create your first folder to get started.
                </div>
              ) : (
                folders.map(folder => (
                  <div key={folder._id} className="p-3 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: folder.color || '#3B82F6' }}
                      />
                      <span className="font-medium">{folder.name}</span>
                      {folder.description && (
                        <span className="ml-2 text-sm text-gray-500">- {folder.description}</span>
                      )}
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEditFolder(folder)}
                        className="p-1 text-gray-500 hover:text-blue-600"
                        title="Edit folder"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteFolder(folder._id)}
                        className="p-1 text-gray-500 hover:text-red-600"
                        title="Delete folder"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FolderManager;
