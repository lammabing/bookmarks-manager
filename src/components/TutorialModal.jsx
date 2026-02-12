import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const TutorialModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const features = [
    {
      title: "Manage Bookmarks",
      description: "Add, edit, and organize your bookmarks with our intuitive interface. Click the '+' button to add a new bookmark.",
      icon: "🔖"
    },
    {
      title: "Folder Organization",
      description: "Create folders to organize your bookmarks hierarchically. Use the folder tree on the left to navigate and manage your collections.",
      icon: "📁"
    },
    {
      title: "Tag Management",
      description: "Add tags to your bookmarks for quick filtering and searching. Use the tag manager to create and maintain your tag library.",
      icon: "🏷️"
    },
    {
      title: "Advanced Search",
      description: "Filter bookmarks by folders, tags, or keywords. Use the search bar to quickly find what you're looking for.",
      icon: "🔍"
    },
    {
      title: "Bulk Operations",
      description: "Select multiple bookmarks to perform bulk actions like editing, tagging, sharing, or deleting.",
      icon: "⚡"
    },
    {
      title: "Font Customization",
      description: "Personalize your reading experience with custom font settings for titles and descriptions.",
      icon: "🔤"
    },
    {
      title: "Import/Export",
      description: "Import bookmarks from your browser or export your collection for backup or sharing.",
      icon: "📥"
    },
    {
      title: "Bookmarklet",
      description: "Use the 'Add Bookmark' button in the navigation bar to quickly add bookmarks from any webpage.",
      icon: "🔗"
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <XMarkIcon className="h-6 w-6 text-gray-500" />
        </button>

        {/* Header */}
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">How to Use Bookmarks Manager</h2>
          <p className="text-gray-600 mt-2">
            Learn the main features and capabilities of your bookmarks manager
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start">
                  <span className="text-2xl mr-3">{feature.icon}</span>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{feature.title}</h3>
                    <p className="text-gray-600 mt-1 text-sm">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h3 className="font-semibold text-gray-900 mb-2">Pro Tips</h3>
            <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
              <li>Drag the "Add Bookmark" button from the navigation bar to your bookmarks bar for quick access</li>
              <li>Use the folder tree to drag and drop bookmarks between folders</li>
              <li>Select multiple bookmarks using checkboxes to perform bulk operations</li>
              <li>Filter your bookmarks by multiple tags using the tag filter in the search section</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 rounded-b-lg">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialModal;