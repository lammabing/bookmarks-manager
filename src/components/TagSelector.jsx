import React, { useState } from 'react';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';

const TagSelector = ({ selectedTags = [], onTagsChange, availableTags = [] }) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredTags = availableTags.filter(tag => 
    tag.name.toLowerCase().includes(inputValue.toLowerCase()) &&
    !selectedTags.some(selected => selected._id === tag._id)
  );

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setShowSuggestions(true);
  };

  const handleTagSelect = (tag) => {
    onTagsChange([...selectedTags, tag]);
    setInputValue('');
    setShowSuggestions(false);
  };

  const handleTagRemove = (tagToRemove) => {
    onTagsChange(selectedTags.filter(tag => tag._id !== tagToRemove._id));
  };

  const handleCreateTag = () => {
    if (inputValue.trim()) {
      const newTag = {
        _id: `temp-${Date.now()}`,
        name: inputValue.trim(),
        color: '#3B82F6'
      };
      onTagsChange([...selectedTags, newTag]);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredTags.length > 0) {
        handleTagSelect(filteredTags[0]);
      } else if (inputValue.trim()) {
        handleCreateTag();
      }
    }
  };

  return (
    <div className="relative">
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedTags.map((tag) => (
            <span
              key={tag._id}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {tag.name}
              <button
                type="button"
                onClick={() => handleTagRemove(tag)}
                className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200"
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type to search or create tags..."
        />

        {/* Suggestions Dropdown */}
        {showSuggestions && (inputValue || filteredTags.length > 0) && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
            {filteredTags.map((tag) => (
              <button
                key={tag._id}
                type="button"
                onClick={() => handleTagSelect(tag)}
                className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center"
              >
                <span
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: tag.color }}
                ></span>
                {tag.name}
              </button>
            ))}
            
            {inputValue.trim() && !filteredTags.some(tag => tag.name.toLowerCase() === inputValue.toLowerCase()) && (
              <button
                type="button"
                onClick={handleCreateTag}
                className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center text-blue-600"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Create "{inputValue}"
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TagSelector;