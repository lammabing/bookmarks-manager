import React, { useState, useEffect } from 'react';
import { Lock, Globe, Users, Share2 } from 'lucide-react';
import UserSelector from './UserSelector';
import SharingBadge from './SharingBadge';
import { useToast } from '../contexts/ToastContext';

const ShareSettings = ({
  bookmark,
  onVisibilityChange,
  onSharedWithChange,
  onShare,
  className = ""
}) => {
  const [visibility, setVisibility] = useState(bookmark?.visibility || 'private');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isSharing, setIsSharing] = useState(false);
  const [previousSettings, setPreviousSettings] = useState(null);
  const { showSuccess, showError, showUndoable } = useToast();

  useEffect(() => {
    if (bookmark?.sharedWith && bookmark.sharedWith.length > 0) {
      // Fetch user details for sharedWith IDs
      const fetchSharedUsers = async () => {
        try {
          // This would need an API endpoint to get user details by IDs
          // For now, we'll assume sharedWith contains user objects
          setSelectedUsers(bookmark.sharedWith);
        } catch (error) {
          console.error('Error fetching shared users:', error);
        }
      };
      fetchSharedUsers();
    }
  }, [bookmark]);

  const handleVisibilityChange = (newVisibility) => {
    setVisibility(newVisibility);
    onVisibilityChange(newVisibility);
  };

  const handleUserSelect = (users) => {
    setSelectedUsers(users);
    onSharedWithChange(users.map(user => user._id));
  };

  const handleShare = async () => {
    if (visibility === 'selected' && selectedUsers.length === 0) {
      showError('Please select at least one user to share with');
      return;
    }

    // Store previous settings for undo
    const currentSettings = {
      visibility: bookmark?.visibility || 'private',
      sharedWith: bookmark?.sharedWith || []
    };
    setPreviousSettings(currentSettings);

    setIsSharing(true);
    try {
      await onShare({
        visibility,
        sharedWith: visibility === 'selected' ? selectedUsers.map(user => user._id) : []
      });
      
      // Show success message with undo option
      const visibilityText = visibility === 'private' ? 'private' :
                              visibility === 'public' ? 'public' :
                              `with ${selectedUsers.length} user${selectedUsers.length > 1 ? 's' : ''}`;
      
      showUndoable(
        `Bookmark sharing updated: ${visibilityText}`,
        () => {
          // Undo function
          onVisibilityChange(currentSettings.visibility);
          onSharedWithChange(currentSettings.sharedWith);
          onShare(currentSettings);
        }
      );
    } catch (error) {
      console.error('Error sharing bookmark:', error);
      showError('Failed to share bookmark');
    } finally {
      setIsSharing(false);
    }
  };

  const visibilityOptions = [
    {
      value: 'private',
      label: 'Private',
      description: 'Only you can see this bookmark',
      icon: Lock,
      color: 'text-gray-600'
    },
    {
      value: 'public',
      label: 'Public',
      description: 'Anyone can see this bookmark',
      icon: Globe,
      color: 'text-blue-600'
    },
    {
      value: 'selected',
      label: 'Selected Users',
      description: 'Only selected users can see this bookmark',
      icon: Users,
      color: 'text-green-600'
    }
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center mb-4">
        <Share2 size={20} className="mr-2 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Sharing Settings</h3>
      </div>

      {/* Current Status */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <span className="text-sm text-gray-600">Current status:</span>
        <SharingBadge visibility={visibility} />
      </div>

      {/* Visibility Options */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Who can see this bookmark?</label>
        <div className="space-y-2">
          {visibilityOptions.map((option) => {
            const Icon = option.icon;
            return (
              <label
                key={option.value}
                className={`inline-flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  visibility === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  type="radio"
                  name="visibility"
                  value={option.value}
                  checked={visibility === option.value}
                  onChange={() => handleVisibilityChange(option.value)}
                  className="sr-only"
                />
                <Icon size={20} className={`mr-3 ${option.color}`} />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{option.label}</div>
                  <div className="text-sm text-gray-500">{option.description}</div>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    visibility === option.value
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}
                >
                  {visibility === option.value && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* User Selection */}
      {visibility === 'selected' && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Share with specific users</label>
          <UserSelector
            selectedUsers={selectedUsers}
            onUserSelect={handleUserSelect}
            placeholder="Search for users to share with..."
          />
        </div>
      )}

      {/* Share Button */}
      <div className="flex justify-end pt-4">
        <button
          onClick={handleShare}
          disabled={isSharing}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isSharing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Sharing...
            </>
          ) : (
            <>
              <Share2 size={16} className="mr-2" />
              Save Sharing Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ShareSettings;