import React from 'react';
import BookmarkImport from '../components/BookmarkImport';

const ImportBookmarksPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Import Bookmarks</h1>
          <p className="text-gray-600 mt-2">
            Import your bookmarks from browser-exported HTML files
          </p>
        </div>
        
        <BookmarkImport />
      </div>
    </div>
  );
};

export default ImportBookmarksPage;