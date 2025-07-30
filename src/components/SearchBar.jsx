import React, { useState, forwardRef, useEffect } from 'react';

const SearchBar = forwardRef(({ searchQuery, onSearchChange, placeholder }, ref) => {
  const [query, setQuery] = useState(searchQuery || '');

  // Update local state when searchQuery prop changes
  useEffect(() => {
    setQuery(searchQuery || '');
  }, [searchQuery]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setQuery(value);
    onSearchChange(value);
  };

  return (
    <input
      ref={ref}
      type="text"
      id="search-bar"
      placeholder={placeholder || "Search bookmarks..."}
      value={query}
      onChange={handleSearch}
      className="w-full p-2 border rounded-lg"
    />
  );
});

export default SearchBar;
