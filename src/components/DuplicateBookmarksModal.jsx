import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const DuplicateBookmarksModal = ({ duplicates, onClose, onRemove }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] flex flex-col relative">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Duplicate Bookmarks Found
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <XMarkIcon className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <p className="text-sm text-gray-600">
            The following URLs have multiple bookmarks. The most complete entry
            will be kept; duplicates will be removed.
          </p>

          {duplicates.map((group, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-500 truncate mb-2">
                {group.url}
              </div>

              <div className="flex items-start gap-2 mb-2">
                <span className="mt-0.5 flex-shrink-0 w-2 h-2 rounded-full bg-green-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-green-700">Kept</p>
                  <p className="text-sm text-gray-900 truncate">{group.keep.title}</p>
                </div>
              </div>

              {group.remove.map((dup, j) => (
                <div key={j} className="flex items-start gap-2 mb-1 ml-4">
                  <span className="mt-0.5 flex-shrink-0 w-2 h-2 rounded-full bg-red-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-red-600">Removed</p>
                    <p className="text-sm text-gray-700 truncate">{dup.title}</p>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="border-t p-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onRemove}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            Remove All Duplicates
          </button>
        </div>
      </div>
    </div>
  );
};

export default DuplicateBookmarksModal;
