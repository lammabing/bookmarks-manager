import React, { useState } from 'react';
import { Trash2, Edit, Lock, Globe, Users, Folder } from 'lucide-react';
import EditBookmarkForm from './EditBookmarkForm';
import BookmarkDetail from './BookmarkDetail';
import SharingBadge from './SharingBadge';
import SocialMediaShare from './SocialMediaShare';

const BookmarkGrid = ({ bookmarks, onDelete, onEdit, viewMode, fontSettings, hoverEffect = "hover:shadow-lg hover:bg-blue-50 transition" }) => {
  const [editingBookmark, setEditingBookmark] = useState(null);
  const [selectedBookmark, setSelectedBookmark] = useState(null);

  const handleEdit = (bookmark) => {
    setEditingBookmark(bookmark);
  };

  const handleSave = async (updatedBookmark) => {
    await onEdit(updatedBookmark);
    setEditingBookmark(null);
  };

  const handleCancel = () => {
    setEditingBookmark(null);
  };

  const handleCardClick = (bookmark) => {
    console.log('Card clicked for bookmark:', bookmark.title);
    setSelectedBookmark(bookmark);
  };

  const handleBackToGrid = () => {
    setSelectedBookmark(null);
  };

  const handleTitleClick = (e, url) => {
    console.log('Title clicked for URL:', url);
    e.preventDefault();
    e.stopPropagation();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // If a bookmark is selected for detailed view, show BookmarkDetail
  if (selectedBookmark) {
    return (
      <BookmarkDetail
        bookmark={selectedBookmark}
        onBack={handleBackToGrid}
      />
    );
  }

  return (
    <div>
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
          {bookmarks.map((bookmark) => (
            <div
              key={bookmark._id}
              className={`border rounded-lg p-4 shadow-sm relative cursor-pointer ${hoverEffect}`}
              onClick={(e) => {
                if (editingBookmark?._id !== bookmark._id) {
                  console.log('Card click event triggered');
                  handleCardClick(bookmark);
                }
              }}
            >
              {editingBookmark?._id === bookmark._id ? (
                <EditBookmarkForm
                  bookmark={bookmark}
                  onSave={handleSave}
                  onCancel={handleCancel}
                />
              ) : (
                <>
                  <img src={bookmark.favicon} alt="Favicon" className="w-6 h-6 mb-2" />
                  <div className="flex items-center">
                    <a
                      href={bookmark.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontFamily: fontSettings.titleFontFamily,
                        fontSize: `${fontSettings.titleFontSize}px`,
                        fontWeight: fontSettings.titleFontWeight,
                        color: fontSettings.titleFontColor,
                      }}
                      className="hover:underline mr-2 cursor-pointer"
                      onClick={(e) => handleTitleClick(e, bookmark.url)}
                    >
                      {bookmark.title}
                    </a>
                    <SharingBadge visibility={bookmark.visibility} className="ml-2" />
                  </div>

                  <p
                    style={{
                      fontFamily: fontSettings.descriptionFontFamily,
                      fontSize: `${fontSettings.descriptionFontSize}px`,
                      fontWeight: fontSettings.descriptionFontWeight,
                      color: fontSettings.descriptionFontColor,
                    }}
                    className="mt-2"
                  >
                    {bookmark.description}
                  </p>

                  {/* Tags below description */}
                  {bookmark.tags && bookmark.tags.length > 0 && (
                    <div className="mt-2">
                      <div className="flex flex-wrap gap-1">
                        {bookmark.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
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
                    </div>
                  )}

                  {/* Folder at bottom */}
                  {bookmark.folder && (
                    <div className="mt-2">
                      <div className="flex items-center text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded inline-flex">
                        <Folder
                          className="w-3 h-3 mr-1"
                          style={{ color: bookmark.folder.color || '#3B82F6' }}
                        />
                        <span>{bookmark.folder.name}</span>
                      </div>
                    </div>
                  )}

                  {/* Social Media Share */}
                  <div className="mt-2">
                    <SocialMediaShare bookmark={bookmark} />
                  </div>

                  <button
                    onClick={e => { e.stopPropagation(); handleEdit(bookmark); }}
                    className="absolute top-2 right-10 p-1 text-blue-500 hover:text-blue-700"
                    aria-label="Edit bookmark"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      if (window.confirm('Are you sure you want to delete this bookmark?')) {
                        onDelete(bookmark._id);
                      }
                    }}
                    className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-700"
                    aria-label="Delete bookmark"
                  >
                    <Trash2 size={18} />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4 p-4">
          {bookmarks.map((bookmark) => (
            <div
              key={bookmark._id}
              className="flex items-center justify-between border rounded-lg p-4 shadow-sm cursor-pointer hover:bg-gray-50 transition"
              onClick={() => handleCardClick(bookmark)}
            >
              <div className="flex items-center space-x-4">
                <img src={bookmark.favicon} alt="Favicon" className="w-6 h-6" />
                <div>
                  <div className="flex items-center">
                    <a
                      href={bookmark.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontFamily: fontSettings.titleFontFamily,
                        fontSize: `${fontSettings.titleFontSize}px`,
                        fontWeight: fontSettings.titleFontWeight,
                        color: fontSettings.titleFontColor,
                      }}
                      className="hover:underline mr-2 cursor-pointer"
                      onClick={(e) => handleTitleClick(e, bookmark.url)}
                    >
                      {bookmark.title}
                    </a>
                    <SharingBadge visibility={bookmark.visibility} className="ml-2" />
                  </div>
                  <p
                    style={{
                      fontFamily: fontSettings.descriptionFontFamily,
                      fontSize: `${fontSettings.descriptionFontSize}px`,
                      fontWeight: fontSettings.descriptionFontWeight,
                      color: fontSettings.descriptionFontColor,
                    }}
                    className="text-sm"
                  >
                    {bookmark.description.length > 20
                      ? `${bookmark.description.substring(0, 20)}...`
                      : bookmark.description}
                  </p>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3
                    style={{
                      fontFamily: fontSettings.titleFontFamily,
                      fontSize: `${fontSettings.titleFontSize}px`,
                      fontWeight: fontSettings.titleFontWeight,
                      color: fontSettings.titleFontColor,
                    }}
                    className="font-semibold truncate flex-1 mr-2"
                  >
                    {bookmark.title}
                  </h3>
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <button
                      onClick={e => { e.stopPropagation(); handleEdit(bookmark); }}
                      className="p-1 text-blue-500 hover:text-blue-700"
                      aria-label="Edit bookmark"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); onDelete(bookmark._id); }}
                      className="p-1 text-red-500 hover:text-red-700"
                      aria-label="Delete bookmark"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <p
                  style={{
                    fontFamily: fontSettings.descriptionFontFamily,
                    fontSize: `${fontSettings.descriptionFontSize}px`,
                    fontWeight: fontSettings.descriptionFontWeight,
                    color: fontSettings.descriptionFontColor,
                  }}
                  className="text-sm mb-3 line-clamp-2"
                >
                  {bookmark.description}
                </p>

                {/* Tags below description */}
                {bookmark.tags && bookmark.tags.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {bookmark.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
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
                  </div>
                )}

                {/* Bottom row with folder and social share */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {bookmark.folder && (
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded mr-2">
                        📁 {bookmark.folder.name}
                      </span>
                    )}
                  </div>
                  <SocialMediaShare bookmark={bookmark} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookmarkGrid;
