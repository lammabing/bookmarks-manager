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
│   ├── planned-features.md # Future feature planning
│   └── dataSources.md      # API and database documentation
├── middleware/             # Express middleware
├── models/                 # MongoDB models (User, Bookmark, Folder)
├── routes/                 # API route handlers
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
│   │   ├── BookmarkGrid.jsx # Main bookmark display component
│   │   ├── BulkEditPanel.jsx # Bulk operations UI
│   │   ├── EditBookmarkForm.jsx
│   │   ├── FontSettings.jsx
│   │   ├── FontSettingsModal.jsx
│   │   ├── FolderManager.jsx # Folder management UI (in development)
│   │   ├── PublicBookmarksGrid.jsx # Homepage public bookmarks
│   │   ├── SearchBar.jsx
│   │   ├── TagManager.jsx
│   │   └── ... (other components)
│   ├── contexts/           # React context providers
│   │   ├── AuthContext.jsx # Authentication state
│   │   ├── BookmarkContext.jsx # Bookmark data management
│   │   ├── FolderContext.jsx # Folder hierarchy (backend complete)
│   │   ├── TagContext.jsx  # Tag management
│   │   └── FontContext.jsx # Font customization
│   ├── pages/              # Main application pages
│   │   ├── Dashboard.jsx   # Main user dashboard
│   │   ├── Home.jsx        # Public homepage
│   │   ├── Login.jsx       # Authentication page
│   │   └── Register.jsx    # User registration
│   ├── utils/              # Utility functions
│   │   ├── api.js          # API client functions
│   │   └── fetchMetadata.js # Webpage metadata extraction
│   └── App.jsx             # Root application component
├── backups/                # Database backups
├── .env                    # Environment variables
├── docker-compose.yml      # Docker configuration
├── package.json            # Project dependencies
├── server.js               # Backend entry point
└── README.md               # Project documentation
```

## Key Abstractions
1. **Component-Based UI**: Frontend built with React components for modularity
2. **RESTful API**: Backend follows REST principles with proper route ordering
3. **Context-Based State Management**: React contexts for global state (Auth, Bookmarks, Folders, Tags, Font)
4. **MVC Architecture**: Models (MongoDB schemas), Views (React), Controllers (Express routes)
5. **Utility Modules**: Reusable functions for common tasks like API calls and metadata fetching
6. **Hierarchical Data**: Folder system with parent-child relationships
7. **Cross-Browser Extension**: Unified extension codebase for Chrome and Firefox

## Current Architecture Status

### Backend (✅ Stable)
1. **server.js**: Express server with middleware setup
2. **routes/**: RESTful API endpoints
   - `users.js`: Authentication and user management (`/api/users/me` endpoint)
   - `bookmarks.js`: Bookmark CRUD with proper route ordering
   - `folders.js`: Hierarchical folder management (complete)
   - `tags.js`: Tag operations and statistics
3. **models/**: MongoDB schemas
   - `User.js`: User authentication and profile data
   - `Bookmark.js`: Bookmark data with folder associations
   - `Folder.js`: Hierarchical folder structure (complete)
4. **middleware/**: Authentication and validation middleware

### Frontend (✅ Recently Fixed)
1. **App.jsx**: Root component with routing and global providers
2. **pages/Home.jsx**: Homepage with public bookmarks showcase
3. **pages/Dashboard.jsx**: Main dashboard with unified action toolbar
   - Fixed API endpoint issues (`/users/me`)
   - Added view mode toggle (grid/list)
   - Integrated font settings with fallbacks
   - Removed duplicate tag displays
   - Improved error handling
4. **contexts/**: Global state management
   - AuthContext: Session management with cross-tab sync
   - BookmarkContext: Bookmark data and operations
   - FolderContext: Folder hierarchy management (backend complete)
   - TagContext: Tag management and operations
   - FontContext: Font customization settings (now properly integrated)
5. **components/**: Reusable UI components
   - BookmarkGrid: Main bookmark display with grid/list views
   - PublicBookmarksGrid: Display community bookmarks
   - TagManager: Tag creation, editing, and deletion
   - FolderManager: Folder hierarchy management (in development)
   - BulkEditPanel: Bulk operations UI
   - AddBookmarkForm: Bookmark creation with metadata fetching

### Browser Extensions (🔄 85% Complete)
1. **Chrome Extension** (`extension/`):
   - manifest.json: Chrome extension configuration
   - background.js: Context menu and background processes
   - popup.html/js/css: Extension popup interface
   - bookmarkImporter.js: Import browser bookmarks
2. **Firefox Extension** (`firefox-extension/`):
   - manifest.json: Firefox extension configuration
   - background.js: Firefox-specific background script
   - Shared popup interface with Chrome version

## Recent Fixes & Improvements (January 2025)

### Critical Bug Fixes
- ✅ Fixed API endpoint mismatch (`/users/profile` → `/users/me`)
- ✅ Resolved undefined component errors (`FolderSelector`, `TagSelector`)
- ✅ Fixed font settings integration and undefined errors
- ✅ Corrected public bookmarks route ordering
- ✅ Removed duplicate tag displays in bookmark cards

### UI/UX Enhancements
- ✅ Added view mode toggle (grid/list) to Dashboard
- ✅ Improved unified action toolbar
- ✅ Better error handling and fallback states
- ✅ Enhanced responsive design
- ✅ Cleaner bookmark card layout

### Code Quality Improvements
- ✅ Better error boundaries and fallback handling
- ✅ Improved context integration
- ✅ More consistent component structure
- ✅ Enhanced debugging and logging

## Development Status

### Completed Systems
- ✅ User authentication and session management
- ✅ Bookmark CRUD operations with metadata
- ✅ Tag management and filtering
- ✅ Public bookmark showcase
- ✅ Font customization system
- ✅ Browser extension popup UI
- ✅ Bookmarklet integration
- ✅ Dashboard with view modes

### In Development
- 🔄 Folder system frontend (backend complete)
- 🔄 Browser extension background sync
- 🔄 Bulk operations completion
- 🔄 Advanced folder management UI

### Planned
- 📋 Drag-and-drop functionality
- 📋 Advanced search and filtering
- 📋 Collaboration features
- 📋 Data export/import
- 📋 Performance optimizations

---
*Last Updated: 2025-01-27 by Documentation Agent*
