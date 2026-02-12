import React from 'react';
import { Folder, Tag, Trash2, Lock, Globe, Users, X } from 'lucide-react';

const BulkEditToolbar = ({
  selectedCount,
  onBulkEdit,
  onBulkTags,
  onBulkDelete,
  onBulkVisibility,
  onBulkShare,
  onCancel,
  disabled = false
}) => {
  const handleBulkEdit = () => {
    console.log('🔍 [DEBUG] BulkEditToolbar handleBulkEdit called');
    if (!disabled && onBulkEdit) {
      onBulkEdit();
    }
  };

  const handleBulkTags = () => {
    console.log('🔍 [DEBUG] BulkEditToolbar handleBulkTags called');
    if (!disabled && onBulkTags) {
      onBulkTags();
    }
  };

  const handleBulkDelete = () => {
    if (!disabled && onBulkDelete) {
      if (window.confirm(`Are you sure you want to delete ${selectedCount} bookmarks?`)) {
        onBulkDelete();
      }
    }
  };

  const handleBulkVisibility = (visibility) => {
    if (!disabled && onBulkVisibility) {
      onBulkVisibility(visibility);
    }
  };

  const handleBulkShare = () => {
    if (!disabled && onBulkShare) {
      onBulkShare();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">
            {selectedCount} {selectedCount === 1 ? 'bookmark' : 'bookmarks'} selected
          </span>
          
          <div className="flex items-center space-x-2 border-l pl-4">
            <button
              onClick={handleBulkEdit}
              disabled={disabled}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                disabled
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
              title="Edit selected bookmarks"
            >
              <Folder className="w-4 h-4 mr-2" />
              Edit
            </button>
            
            <button
              onClick={handleBulkTags}
              disabled={disabled}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                disabled
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-green-50 text-green-700 hover:bg-green-100'
              }`}
              title="Add tags to selected bookmarks"
            >
              <Tag className="w-4 h-4 mr-2" />
              Tags
            </button>
            
            <div className="relative group">
              <button
                disabled={disabled}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  disabled
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                }`}
                title="Change visibility"
              >
                <Lock className="w-4 h-4 mr-2" />
                Visibility
              </button>
              
              <div className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <button
                  onClick={() => handleBulkVisibility('private')}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Private
                </button>
                <button
                  onClick={() => handleBulkVisibility('public')}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Public
                </button>
                <button
                  onClick={() => handleBulkVisibility('selected')}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Selected Users
                </button>
              </div>
            </div>
            
            <button
              onClick={handleBulkShare}
              disabled={disabled}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                disabled
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
              }`}
              title="Share selected bookmarks"
            >
              <Users className="w-4 h-4 mr-2" />
              Share
            </button>
            
            <button
              onClick={handleBulkDelete}
              disabled={disabled}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                disabled
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-red-50 text-red-700 hover:bg-red-100'
              }`}
              title="Delete selected bookmarks"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </button>
          </div>
        </div>
        
        <button
          onClick={onCancel}
          className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
          title="Cancel selection"
        >
          <X className="w-4 h-4 mr-2" />
          Cancel
        </button>
      </div>
    </div>
  );
};

export default BulkEditToolbar;