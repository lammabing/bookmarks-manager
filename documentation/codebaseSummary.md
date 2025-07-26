# Codebase Summary

## Project Structure
```
.
├── documentation/          # Project documentation
├── middleware/             # Express middleware
│   └── auth.js             # Authentication middleware
├── models/                 # MongoDB models
│   ├── Bookmark.js         # Bookmark schema and model
│   ├── BookmarkExtension.js # Extension-specific bookmark model
│   └── User.js             # User schema and model
├── routes/                 # API route handlers
│   ├── bookmarks.js        # Bookmark CRUD operations
│   ├── bookmarkExtensions.js # Extension-specific routes
│   ├── tags.js             # Tag management routes
│   └── users.js            # User authentication routes
├── extension/              # Browser extension source
│   ├── background.js       # Handles context menu and background processes
│   ├── manifest.json       # Defines extension configuration and permissions
│   ├── manifest-v3.json    # Manifest V3 for Chrome extension
│   ├── popup.html          # Popup UI for extension
│   ├── popup.js            # Popup interaction logic
│   ├── popup.css           # Popup styling
│   ├── site.webmanifest    # Web app manifest
│   └── icons/              # Extension icons in multiple sizes
├── scripts/                # Database maintenance scripts
├── admin-scripts/          # Admin/maintenance scripts
│   └── backup-database.js  # Database backup utility
├── src/                    # Frontend React application
│   ├── components/         # Reusable UI components
│   │   ├── AddBookmarkForm.jsx
│   │   ├── Auth/           # Authentication components
│   │   ├── BookmarkGrid.jsx
│   │   ├── BulkEditPanel.jsx # Bulk operations UI
│   │   ├── EditBookmarkForm.jsx
│   │   ├── FontSettings.jsx
│   │   ├── FontSettingsModal.jsx
│   │   ├── FolderManager.jsx # Folder management UI
│   │   ├── SearchBar.jsx
│   │   └── TagManager.jsx  # Tag management UI
│   ├── contexts/           # React context providers
│   │   ├── AuthContext.jsx # Authentication state management
│   │   ├── BookmarkContext.jsx # Bookmark state management
│   │   ├── FolderContext.jsx # Folder state management
│   │   ├── FontContext.jsx # Font settings management
│   │   └── TagContext.jsx  # Tag state management
│   ├── pages/              # Page components
│   │   └── Dashboard.jsx   # Main dashboard with unified toolbar
│   ├── utils/              # Utility functions
│   │   ├── api.js          # API service
│   │   ├── db.js           # Database connection
│   │   ├── fetchMetadata.js # URL metadata fetcher
│   │   ├── fontSettings.js # Font management
│   │   └── importBookmarks.js # Bookmark import
│   ├── App.jsx             # Main application component
│   ├── index.css           # Global styles
│   ├── main.jsx            # Entry point
│   └── bookmarklet.min.js  # Bookmarklet code
├── .env                    # Environment variables
├── .gitignore              # Git ignore rules
├── docker-compose.yml      # Docker configuration
├── index.html              # HTML entry point
├── package.json            # Project dependencies
├── package-lock.json       # Dependency lock file
├── postcss.config.cjs      # PostCSS configuration
├── README.md               # Project overview
├── server.js               # Backend entry point
├── setup-app.sh            # Setup script
├── start.sh                # Startup script
├── start-mongo.sh          # MongoDB Docker container starter
└── tailwind.config.js      # Tailwind CSS configuration
```

## Key Abstractions
1. **Component-Based UI**: Frontend built with React components for modularity
2. **RESTful API**: Backend follows REST principles for CRUD operations
3. **Context-Based State Management**: React contexts for global state (Auth, Bookmarks, Folders, Tags, Font)
4. **MVC Architecture**: Models (MongoDB schemas), Views (React), Controllers (Express routes)
5. **Utility Modules**: Reusable functions for common tasks like API calls and metadata fetching

## Module Dependencies
- Frontend components depend on API service (api.js) for data fetching
- Context providers manage global application state
- API routes depend on Mongoose models for database operations
- Middleware (auth.js) protects authenticated routes
- Utility modules are imported across both frontend and backend

## Core Components

### Backend
1. **server.js**: Express server entry point with middleware setup
2. **models/**: MongoDB schemas for data persistence
   - Bookmark: Core bookmark data with tags and metadata
   - User: User authentication and profile data
   - BookmarkExtension: Additional bookmark metadata
3. **routes/**: API endpoint handlers
   - Authentication, CRUD operations, tag management
4. **middleware/auth.js**: JWT authentication middleware

### Frontend
1. **App.jsx**: Root component with routing and global providers
2. **pages/Dashboard.jsx**: Main dashboard with unified action toolbar
   - Consolidated all functional buttons into single toolbar
   - Statistics cards for bookmarks, folders, and tags
   - Responsive layout with proper spacing
3. **contexts/**: Global state management
   - AuthContext: Session management with cross-tab sync
   - BookmarkContext: Bookmark data and operations
   - FolderContext: Folder hierarchy management
   - TagContext: Tag management and operations
   - FontContext: Font customization settings
4. **components/**: Reusable UI components
   - TagManager: Tag creation, editing, and deletion
   - FolderManager: Folder hierarchy management
   - BulkEditPanel: Bulk operations UI
   - AddBookmarkForm: Bookmark creation with metadata fetching

### Browser Extension
1. **manifest.json**: Extension configuration and permissions
2. **background.js**: Context menu and background processes
3. **popup.html/js/css**: Extension popup interface
4. **icons/**: Extension icons in multiple sizes

### Shared Utilities
1. **fetchMetadata.js**: Webpage metadata extraction
2. **fontSettings.js**: Font preference management
3. **api.js**: Centralized API service layer
4. **importBookmarks.js**: Bookmark import functionality

## Recent Improvements
- **Session Management**: Fixed cross-tab authentication sync issues
- **UI Consolidation**: Unified action toolbar in Dashboard
- **Context Architecture**: Comprehensive state management system
- **Extension Support**: Chrome/Firefox browser extension
- **Bookmarklet**: One-click bookmark addition from any webpage

---
Last Updated: 2025-01-27 by Documentation Agent
