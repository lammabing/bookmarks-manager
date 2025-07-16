import React from 'react';
import BookmarkExtensions from './BookmarkExtensions';

export default function BookmarkDetail({ bookmark, onBack }) {
  if (!bookmark) return null;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header with back button */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 text-sm font-medium"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to bookmarks
        </button>
      </div>

      {/* Main content card */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header section */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start space-x-4">
            {bookmark.favicon && (
              <img 
                src={bookmark.favicon} 
                alt="favicon" 
                className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-gray-200"
                onError={(e) => {
                  e.target.src = '/favicon.png';
                }}
              />
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 mb-2 break-words">
                {bookmark.title}
              </h1>
              <a 
                href={bookmark.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 hover:text-blue-800 underline break-all text-sm"
              >
                {bookmark.url}
              </a>
            </div>
          </div>
        </div>

        {/* Content section */}
        <div className="p-6">
          {/* Description */}
          {bookmark.description && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">{bookmark.description}</p>
            </div>
          )}

          {/* Tags */}
          {bookmark.tags && bookmark.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {bookmark.tags.map(tag => (
                  <span 
                    key={tag} 
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
            <div>
              <span className="font-medium text-gray-700">Created:</span>
              <span className="ml-2 text-gray-600">
                {new Date(bookmark.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Updated:</span>
              <span className="ml-2 text-gray-600">
                {new Date(bookmark.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Extensions section */}
        <div className="border-t border-gray-100">
          <BookmarkExtensions bookmarkId={bookmark._id} />
        </div>
      </div>
    </div>
  );
}
