import React, { useState, useEffect } from 'react';
import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { ExternalLink, User } from 'lucide-react';

const PublicBookmarksGrid = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPublicBookmarks = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Fetching public bookmarks...');
        const response = await fetch('/api/bookmarks/public?page=1&limit=12');

        console.log('Response status:', response.status);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Received data:', data);

        setBookmarks(data.bookmarks || []);
      } catch (err) {
        console.error('Error fetching public bookmarks:', err);
        setError(`Failed to load public bookmarks: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicBookmarks();
  }, []);

  const handleBookmarkClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border p-4 animate-pulse">
            <div className="w-6 h-6 bg-gray-200 rounded mb-3"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-blue-600 hover:text-blue-800"
        >
          Try again
        </button>
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-8">
        <GlobeAltIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No public bookmarks available yet.</p>
        <p className="text-sm text-gray-400 mt-2">
          Be the first to share a bookmark by setting its visibility to "public"!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4">
      {bookmarks.map((bookmark) => (
        <div
          key={bookmark._id}
          className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow cursor-pointer group"
          onClick={() => handleBookmarkClick(bookmark.url)}
        >
          <div className="flex items-start justify-between mb-3">
            <img
              src={bookmark.favicon}
              alt="Favicon"
              className="w-6 h-6 flex-shrink-0"
              onError={(e) => {
                e.target.src = `https://www.google.com/s2/favicons?domain=${new URL(bookmark.url).hostname}`;
              }}
            />
            <ExternalLink className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {bookmark.title}
          </h3>

          {bookmark.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {bookmark.description}
            </p>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center">
              <User className="h-3 w-3 mr-1" />
              <span>{bookmark.owner?.username || 'Anonymous'}</span>
            </div>
            <span>{new Date(bookmark.updatedAt).toLocaleDateString()}</span>
          </div>

          {bookmark.tags && bookmark.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {bookmark.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                >
                  {tag}
                </span>
              ))}
              {bookmark.tags.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{bookmark.tags.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PublicBookmarksGrid;
