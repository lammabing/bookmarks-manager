# Codebase Summary

## Project Structure
```
.
├── documentation/          # Project documentation
│   ├── currentTask.md      # Current development status
│   ├── projectRoadmap.md   # Feature roadmap and timeline
│   ├── feedback.md         # User feedback and issue tracking
│   ├── codebaseSummary.md  # This file - codebase overview
│   ├── folder-implementation-plan.md # Detailed folder system plan
│   ├── techStack.md        # Technology stack documentation
│   ├── bookmark_sharing_plan.md # Sharing feature implementation
│   ├── bookmarklet-guide.md # Bookmarklet usage guide
│   ├── browser-extensions-plan.md # Extension development plan
│   └── planned-features.md # Future feature planning
├── middleware/             # Express middleware
│   └── auth.js             # JWT authentication middleware
├── models/                 # MongoDB models
│   ├── Bookmark.js         # Bookmark schema with folder support
│   ├── BookmarkExtension.js # Extension-specific bookmark model
│   ├── Folder.js           # Hierarchical folder model
│   └── User.js             # User schema and model
├── routes/                 # API route handlers
│   ├── bookmarks.js        # Bookmark CRUD with public endpoint
│   ├── bookmarkExtensions.js # Extension-specific routes
│   ├── folders.js          # Folder management routes
│   ├── tags.js             # Tag management routes
│   └── users.js            # User authentication routes
├── extension/              # Chrome browser extension
│   ├── background.js       # Context menu and background processes
│   ├── manifest.json       # Chrome extension configuration
│   ├── popup.html          # Extension popup UI
│   ├── popup.js            # Popup interaction logic
│   ├── popup.css           # Popup styling
│   ├── bookmarkImporter.js # Browser bookmark import functionality
│   └── icons/              # Extension icons in multiple sizes
├── firefox-extension/      # Firefox browser extension
│   ├── background.js       # Firefox-specific background script
│   ├── manifest.json       # Firefox extension configuration
│   ├── popup.html          # Firefox popup UI
│   ├── popup.js            # Firefox popup logic
│   ├── bookmarkImporter.js # Firefox bookmark import
│   └── icons/              # Firefox extension icons
├── scripts/                # Database maintenance scripts
│   └── checkPublicBookmarks.js # Public bookmark verification
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
│   │   ├── FolderManager.jsx # Folder management UI (in development)
│   │   ├── PublicBookmarksGrid.jsx # Public bookmarks display
│   │   ├── SearchBar.jsx
│   │   └── TagManager.jsx  # Tag management UI
│   ├── contexts/           # React context providers
│   │   ├── AuthContext.jsx # Authentication state management
│   │   ├── BookmarkContext.jsx # Bookmark state management
│   │   ├── FolderContext.jsx # Folder state management
│   │   ├── FontContext.jsx # Font settings management
│   │   └── TagContext.jsx  # Tag state management
│   ├── pages/              # Page components
│   │   ├── Dashboard.jsx   # Main dashboard with unified toolbar
│   │   └── Home.jsx        # Homepage with public bookmarks
│   ├── utils/              # Utility functions
│   │   ├── api.js          # API service layer
│   │   ├── db.js           # Database connection
│   │   ├── fetchMetadata.js # URL metadata fetcher
│   │   ├── fontSettings.js # Font management
│   │   └── importBookmarks.js # Bookmark import utilities
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
├── tailwind.config.js      # Tailwind CSS configuration
└── vite.config.js          # Vite build configuration
```

## Key Abstractions
1. **Component-Based UI**: Frontend built with React components for modularity
2. **RESTful API**: Backend follows REST principles with proper route ordering
3. **Context-Based State Management**: React contexts for global state (Auth, Bookmarks, Folders, Tags, Font)
4. **MVC Architecture**: Models (MongoDB schemas), Views (React), Controllers (Express routes)
5. **Utility Modules**: Reusable functions for common tasks like API calls and metadata fetching
6. **Hierarchical Data**: Folder system with parent-child relationships
7. **Cross-Browser Extension**: Unified extension codebase for Chrome and Firefox

## Module Dependencies
- Frontend components depend on API service (api.js) for data fetching
- Context providers manage global application state
- API routes depend on Mongoose models for database operations
- Middleware (auth.js) protects authenticated routes
- Utility modules are imported across both frontend and backend
- Folder system integrates with existing bookmark management
- Browser extensions communicate with backend API

## Core Components

### Backend
1. **server.js**: Express server entry point with middleware setup
2. **models/**: MongoDB schemas for data persistence
   - Bookmark: Core bookmark data with tags, folders, and visibility
   - User: User authentication and profile data
   - Folder: Hierarchical folder structure with parent-child relationships
   - BookmarkExtension: Additional bookmark metadata
3. **routes/**: API endpoint handlers with proper ordering
   - Public bookmarks endpoint (before parameterized routes)
   - Authentication, CRUD operations, folder management
   - Bulk operations for efficiency
4. **middleware/auth.js**: JWT authentication middleware

### Frontend
1. **App.jsx**: Root component with routing and global providers
2. **pages/Home.jsx**: Homepage with public bookmarks showcase
3. **pages/Dashboard.jsx**: Main dashboard with unified action toolbar
   - Consolidated all functional buttons into single toolbar
   - Statistics cards for bookmarks, folders, and tags
   - Responsive layout with proper spacing
4. **contexts/**: Global state management
   - AuthContext: Session management with cross-tab sync
   - BookmarkContext: Bookmark data and operations
   - FolderContext: Folder hierarchy management (backend complete)
   - TagContext: Tag management and operations
   - FontContext: Font customization settings
5. **components/**: Reusable UI components
   - PublicBookmarksGrid: Display community bookmarks
   - TagManager: Tag creation, editing, and deletion
   - FolderManager: Folder hierarchy management (in development)
   - BulkEditPanel: Bulk operations UI
   - AddBookmarkForm: Bookmark creation with metadata fetching

### Browser Extensions
1. **Chrome Extension** (`extension/`):
   - manifest.json: Chrome extension configuration
   - background.js: Context menu and background processes
   - popup.html/js/css: Extension popup interface
   - bookmarkImporter.js: Import browser bookmarks
2. **Firefox Extension** (`firefox-extension/`):
   - manifest.json: Firefox extension configuration
   - background.js: Firefox-specific background script
   - Shared popup interface with Chrome version

### Shared Utilities
1. **fetchMetadata.js**: Webpage metadata extraction
2. **fontSettings.js**: Font preference management
3. **api.js**: Centralized API service layer with error handling
4. **importBookmarks.js**: Bookmark import functionality

## Recent Improvements
- **Route Ordering Fix**: Resolved Express route matching issues for public bookmarks
- **Folder System Backend**: Complete hierarchical folder CRUD implementation
- **Session Management**: Fixed cross-tab authentication sync issues
- **UI Consolidation**: Unified action toolbar in Dashboard
- **Context Architecture**: Comprehensive state management system
- **Extension Support**: Chrome/Firefox browser extensions with import
- **Public Bookmarks**: Homepage showcase of community bookmarks
- **Bulk Operations**: Efficient bulk move operations with validation

## Current Development Focus
- **Folder Frontend**: Implementing folder tree navigation and management UI
- **Extension Completion**: Background sync and offline capabilities
- **Bulk Operations**: Expanding bulk edit and delete functionality
- **Error Handling**: Enhanced error messages and loading states
- **Testing**: Unit and integration test implementation

## Architecture Patterns
- **Express Route Ordering**: Specific routes before parameterized routes
- **Context Pattern**: Global state management with React contexts
- **Repository Pattern**: API service layer abstracts data access
- **Component Composition**: Reusable UI components with props
- **Middleware Pattern**: Express middleware for authentication and CORS
- **Observer Pattern**: Event-driven updates across components
- **Hierarchical Data**: Tree structures for folder organization

## Performance Optimizations
- **Lazy Loading**: Components loaded on demand
- **Memoization**: React.memo for expensive components
- **Debounced Search**: Reduced API calls during search
- **Optimistic Updates**: Immediate UI feedback before server confirmation
- **Connection Pooling**: MongoDB connection optimization
- **Route Efficiency**: Proper Express route ordering for performance

---
Last Updated: 2025-01-27 by Documentation Agent
