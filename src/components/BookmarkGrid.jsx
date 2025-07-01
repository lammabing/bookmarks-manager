import React, { useState } from 'react';
import { Trash2, Edit, Lock, Globe } from 'lucide-react';
import EditBookmarkForm from './EditBookmarkForm';

const BookmarkGrid = ({ bookmarks, onDelete, onEdit, viewMode, fontSettings, onSelect, hoverEffect = "hover:shadow-lg hover:bg-blue-50 transition" }) => {
  const [editingBookmark, setEditingBookmark] = useState(null);

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

  return (
    <div>
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
          {bookmarks.map((bookmark) => (
            <div
              key={bookmark._id}
              className={`border rounded-lg p-4 shadow-sm relative cursor-pointer ${hoverEffect}`}
              {...(editingBookmark?._id === bookmark._id ? {} : { onClick: () => onSelect && onSelect(bookmark) })}
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
                      className="hover:underline mr-2"
                      onClick={e => e.stopPropagation()}
                    >
                      {bookmark.title}
                    </a>
                    {bookmark.visibility === 'private' ? (
                      <Lock size={16} className="text-gray-500" />
                    ) : (
                      <Globe size={16} className="text-blue-500" />
                    )}
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
                  <div className="mt-2">
                    {bookmark.tags.map((tag) => (
                      <span key={tag} className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2">
                        #{tag}
                      </span>
                    ))}
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
            <div key={bookmark._id} className="flex items-center justify-between border rounded-lg p-4 shadow-sm">
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
                      className="hover:underline mr-2"
                      onClick={e => e.stopPropagation()}
                    >
                      {bookmark.title}
                    </a>
                    {bookmark.visibility === 'private' ? (
                      <Lock size={16} className="text-gray-500" />
                    ) : (
                      <Globe size={16} className="text-blue-500" />
                    )}
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
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(bookmark)}
                  className="p-1 text-blue-500 hover:text-blue-700"
                  aria-label="Edit bookmark"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => onDelete(bookmark._id)}
                  className="p-1 text-red-500 hover:text-red-700"
                  aria-label="Delete bookmark"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookmarkGrid;
