import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AddBookmarkForm from '../components/AddBookmarkForm';
import PublicBookmarksGrid from '../components/PublicBookmarksGrid';
import { BookmarkIcon, TagIcon, FolderIcon, MagnifyingGlassIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);

  // Check for URL parameters when component mounts
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const urlParam = queryParams.get('url');

    if (urlParam) {
      setShowAddForm(true);
    }
  }, []);

  const features = [
    {
      icon: BookmarkIcon,
      title: 'Smart Bookmarking',
      description: 'Save and organize your bookmarks with automatic metadata extraction'
    },
    {
      icon: FolderIcon,
      title: 'Folder Organization',
      description: 'Create nested folders to organize your bookmarks hierarchically'
    },
    {
      icon: TagIcon,
      title: 'Tag Management',
      description: 'Use tags to categorize and quickly find your bookmarks'
    },
    {
      icon: MagnifyingGlassIcon,
      title: 'Advanced Search',
      description: 'Find bookmarks instantly with powerful search and filtering'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {showAddForm && (
        <AddBookmarkForm
          onClose={() => setShowAddForm(false)}
        />
      )}

      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
              Organize Your
              <span className="text-blue-600"> Bookmarks</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              A powerful bookmark manager with folders, tags, and smart organization features.
              Keep your favorite links organized and easily accessible.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <div className="space-y-3 sm:space-y-0 sm:space-x-3 sm:flex">
                  <Link
                    to="/register"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                  >
                    Get Started
                  </Link>
                  <Link
                    to="/login"
                    className="w-full flex items-center justify-center px-8 py-3 border border-blue-600 text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Everything you need to manage bookmarks
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Powerful features to help you organize and find your bookmarks efficiently
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center">
                  <feature.icon className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Public Bookmarks Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <GlobeAltIcon className="h-12 w-12 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              Discover Public Bookmarks
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Explore interesting links shared by our community
            </p>
          </div>

          <PublicBookmarksGrid />

          <div className="text-center mt-8">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 transition-colors"
              >
                View All in Dashboard
              </Link>
            ) : (
              <Link
                to="/register"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Join to Share Your Bookmarks
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
