import React, { useState, useEffect } from 'react';
import { Search, X, UserPlus } from 'lucide-react';
import { authApi } from '../utils/api';

const UserSelector = ({ selectedUsers, onUserSelect, placeholder = "Select users to share with..." }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await authApi.getShareableUsers();
        setUsers(response.data);
        setFilteredUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const handleUserClick = (user) => {
    if (!selectedUsers.find(selected => selected._id === user._id)) {
      onUserSelect([...selectedUsers, user]);
    }
    setSearchTerm('');
    setShowDropdown(false);
  };

  const removeUser = (userId) => {
    onUserSelect(selectedUsers.filter(user => user._id !== userId));
  };

  const getAvailableUsers = () => {
    return filteredUsers.filter(user => 
      !selectedUsers.find(selected => selected._id === user._id)
    );
  };

  return (
    <div className="relative">
      {/* Selected Users */}
      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedUsers.map(user => (
            <div
              key={user._id}
              className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
            >
              <span>{user.username}</span>
              <button
                type="button"
                onClick={() => removeUser(user._id)}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Dropdown */}
        {showDropdown && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading users...</div>
            ) : getAvailableUsers().length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchTerm ? 'No users found' : 'All users selected'}
              </div>
            ) : (
              getAvailableUsers().map(user => (
                <div
                  key={user._id}
                  onClick={() => handleUserClick(user)}
                  className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <UserPlus size={16} className="text-gray-600" />
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">{user.username}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

export default UserSelector;