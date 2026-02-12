import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const BookmarkImport = () => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { token } = useAuth();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      const fileExtension = selectedFile.name.toLowerCase().split('.').pop();
      if (fileExtension !== 'html' && fileExtension !== 'htm') {
        setError('Please select a valid HTML file (.html or .htm)');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    const formData = new FormData();
    formData.append('bookmarksFile', file);

    setIsUploading(true);
    setUploadProgress(0);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/import/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Successfully imported ${data.bookmarksImported} bookmarks and ${data.foldersImported} folders!`);
        setUploadProgress(100);
      } else {
        setError(data.error || 'Failed to import bookmarks');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      // Validate file type
      const fileExtension = droppedFile.name.toLowerCase().split('.').pop();
      if (fileExtension !== 'html' && fileExtension !== 'htm') {
        setError('Please drop a valid HTML file (.html or .htm)');
        return;
      }
      setFile(droppedFile);
      setError('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Import Bookmarks</h2>
      
      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          error ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-400'
        }`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => document.getElementById('fileInput').click()}
      >
        <input
          id="fileInput"
          type="file"
          accept=".html,.htm"
          onChange={handleFileChange}
          className="hidden"
        />
        
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <svg 
              className="w-8 h-8 text-blue-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
              />
            </svg>
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-700">
              {file ? file.name : 'Click to select or drag and drop'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              HTML files only (.html, .htm) - Maximum 10MB
            </p>
          </div>
          
          {file && (
            <div className="mt-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Selected
              </span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {message && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-700">{message}</p>
        </div>
      )}

      {isUploading && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">Uploading...</span>
            <span className="text-sm font-medium text-gray-700">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="mt-6 flex space-x-4">
        <button
          onClick={handleImport}
          disabled={!file || isUploading}
          className={`px-6 py-2 rounded-md font-medium transition-colors ${
            !file || isUploading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isUploading ? 'Importing...' : 'Import Bookmarks'}
        </button>
        
        <button
          onClick={() => {
            setFile(null);
            setError('');
            setMessage('');
          }}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 transition-colors"
        >
          Clear
        </button>
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-md">
        <h3 className="font-medium text-gray-800 mb-2">How to export bookmarks from your browser:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li><strong>Chrome:</strong> Bookmarks → Bookmark Manager → Organize → Export Bookmarks</li>
          <li><strong>Firefox:</strong> Library → Bookmarks → Show All Bookmarks → Import & Backup → Export HTML</li>
          <li><strong>Edge:</strong> Favorites → Import favorites → Export to file → HTML</li>
          <li><strong>Safari:</strong> Bookmarks → Export Bookmarks</li>
        </ul>
      </div>
    </div>
  );
};

export default BookmarkImport;