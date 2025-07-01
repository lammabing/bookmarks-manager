import React from 'react';
import BookmarkExtensions from './BookmarkExtensions';

export default function BookmarkDetail({ bookmark, onBack }) {
  if (!bookmark) return null;
  return (
    <div className="max-w-xl mx-auto p-4 border rounded shadow bg-white">
      <button
        onClick={onBack}
        className="mb-4 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
      >
        ← Back to all bookmarks
      </button>
      <div className="flex items-center mb-4">
        {bookmark.favicon && (
          <img src={bookmark.favicon} alt="favicon" className="w-8 h-8 mr-3 rounded" />
        )}
        <div>
          <h2 className="text-xl font-bold mb-1">{bookmark.title}</h2>
          <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">
            {bookmark.url}
          </a>
        </div>
      </div>
      {bookmark.description && (
        <div className="mb-2 text-gray-700">{bookmark.description}</div>
      )}
      {bookmark.tags && bookmark.tags.length > 0 && (
        <div className="mb-2">
          {bookmark.tags.map(tag => (
            <span key={tag} className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded mr-2 text-xs">{tag}</span>
          ))}
        </div>
      )}
      <BookmarkExtensions bookmarkId={bookmark._id} />
    </div>
  );
}
