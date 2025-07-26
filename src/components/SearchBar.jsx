import React, { useState, forwardRef } from 'react';

const SearchBar = forwardRef(({ onSearch }, ref) => {
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  return (
    <input
      ref={ref}
      type="text"
      id="search-bar"
      placeholder="Search bookmarks..."
      value={query}
      onChange={handleSearch}
      className="w-full p-2 border rounded-lg mb-4"
    />
  );
});

export default SearchBar;
