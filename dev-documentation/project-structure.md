# Project Structure

Complete directory and file organization for the Bookmarks Manager project.

## Root Directory

```
bookmarks-manager/
├── admin-scripts/              # Database administration scripts
├── backups/                    # Automated backup storage
├── chrome-extension/           # Chrome browser extension
├── dev-documentation/          # Development documentation (this directory)
├── documentation/              # Legacy project documentation
├── firefox-extension/          # Firefox browser extension
├── icons/                      # Application icons
├── middleware/                 # Express middleware
├── models/                     # Mongoose database models
├── node_modules/               # npm dependencies
├── public/                     # Static public assets
├── routes/                     # Express API route handlers
├── scripts/                    # Maintenance and utility scripts
├── src/                        # Frontend React application
├── uploads/                    # Uploaded bookmark HTML files
│
├── .env                        # Environment variables (gitignored)
├── .gitattributes              # Git attributes
├── .gitignore                  # Git ignore rules
├── docker-compose.yml          # Docker Compose configuration
├── index.html                  # HTML entry point
├── package.json                # Project dependencies and scripts
├── package-lock.json           # Locked dependency versions
├── postcss.config.cjs          # PostCSS configuration
├── server.js                   # Express server entry point
├── tailwind.config.js          # Tailwind CSS configuration
├── vite.config.js              # Vite build configuration
│
├── start.sh                    # Main application starter script
├── start-mongo.sh              # Original MongoDB Docker starter
├── start-mongo-persistent.sh   # Persistent storage starter (deprecated)
├── start-mongo-reliable.sh     # Reliable MongoDB starter (current)
│
└── [Various utility scripts]   # One-off scripts (see scripts/)
```

## Frontend Structure (`src/`)

```
src/
├── components/                 # Reusable UI components (30 files)
│   ├── Auth/                  # Authentication components
│   │   ├── AuthModal.jsx      # Combined login/register modal
│   │   ├── LoginForm.jsx      # Login form
│   │   └── RegisterForm.jsx   # Registration form
│   │
│   ├── AddBookmarkForm.jsx    # Modal for adding/editing bookmarks
│   ├── BookmarkDetail.jsx     # Single bookmark detail view
│   ├── BookmarkExtensions.jsx # Custom extensions manager
│   ├── BookmarkGrid.jsx       # Grid/list view of bookmarks
│   ├── BookmarkImport.jsx     # File upload for importing bookmarks
│   ├── BulkEditModal.jsx      # Bulk operations modal
│   ├── BulkEditToolbar.jsx    # Sticky toolbar for selected bookmarks
│   ├── BulkOperationToast.jsx # Progress toast for bulk ops
│   ├── EditBookmarkForm.jsx   # Inline edit form
│   ├── FolderBreadcrumb.jsx   # Folder navigation breadcrumbs
│   ├── FolderManager.jsx      # Folder CRUD modal
│   ├── FolderSelector.jsx     # Dropdown for folder selection
│   ├── FolderTree.jsx         # Recursive folder tree sidebar
│   ├── FontSettings.jsx       # Basic font settings
│   ├── FontSettingsModal.jsx  # Advanced font customization
│   ├── MultiSelectCheckbox.jsx # Checkbox with indeterminate state
│   ├── Navbar.jsx             # Top navigation bar
│   ├── ProgressManager.jsx    # Progress tracking context
│   ├── ProtectedRoute.jsx     # Auth route guard
│   ├── PublicBookmarksGrid.jsx # Public bookmarks display
│   ├── SearchBar.jsx          # Text search input
│   ├── ShareSettings.jsx      # Sharing configuration UI
│   ├── SharingBadge.jsx       # Visibility badge
│   ├── SocialMediaShare.jsx   # Social sharing buttons
│   ├── TagManager.jsx         # Tag CRUD modal
│   ├── TagSelector.jsx        # Tag selection/creation
│   ├── ToastNotification.jsx  # Toast notification component
│   ├── Tooltip.jsx            # Hover tooltip
│   └── TutorialModal.jsx      # Feature tour/help modal
│
├── contexts/                   # React Context providers (7 files)
│   ├── AuthContext.jsx        # Authentication state
│   ├── BookmarkContext.jsx    # Bookmarks array and loading
│   ├── FolderContext.jsx      # Folder state wrapper
│   ├── TagContext.jsx         # Tags array
│   ├── FontContext.jsx        # Font customization settings
│   ├── ToastContext.jsx       # Toast notifications
│   └── UndoContext.jsx        # Undo/redo stack
│
├── hooks/                      # Custom React hooks (1 file)
│   └── useFolders.js          # Complete folder management hook
│
├── pages/                      # Main application pages (5 files)
│   ├── Home.jsx               # Landing page
│   ├── Login.jsx              # Login page
│   ├── Register.jsx           # Registration page
│   ├── Dashboard.jsx          # Main application dashboard
│   └── ImportBookmarksPage.jsx # Bookmark import page
│
├── utils/                      # Utility functions (10 files)
│   ├── api.js                 # Axios instance + API clients
│   ├── extensionApi.js        # Bookmark extensions API
│   ├── fetchMetadata.js       # Page metadata fetcher
│   ├── BookmarkImporter.js    # Server-side HTML import parser
│   ├── BookmarkHTMLParser.js  # Static HTML bookmark parser
│   ├── folderApi.js           # Client-side folder API
│   ├── fontSettings.js        # Font settings localStorage helpers
│   ├── undoManager.js         # Undo/redo stack manager
│   ├── performance.js         # Debounce, throttle, cache, etc.
│   └── db.js                  # IndexedDB wrapper
│
├── App.jsx                     # Root component with routing
└── main.jsx                    # React entry point
```

## Backend Structure

```
models/
├── User.js                     # User schema with bcrypt
├── Bookmark.js                 # Bookmark schema with sharing
├── Folder.js                   # Folder schema with hierarchy
└── BookmarkExtension.js        # Custom extensions schema

routes/
├── users.js                    # /api/users (auth endpoints)
├── bookmarks.js                # /api/bookmarks (CRUD + bulk)
├── folders.js                  # /api/folders (folder management)
├── tags.js                     # /api/tags (tag operations)
├── bookmarkExtensions.js       # /api/bookmarks/:id/extensions
└── bookmark-import.js          # /api/import (file upload)

middleware/
├── auth.js                     # JWT authentication
├── folderValidation.js         # Folder ownership validation
└── autoBackup.js               # Pre-write backup system
```

## Browser Extensions

### Chrome Extension (`chrome-extension/`)

```
chrome-extension/
├── manifest.json               # Manifest V3 configuration
├── background.js               # Service worker (auth + bookmark API)
├── popup.js                    # Popup UI logic
├── popup.html                  # Popup UI HTML
├── content.js                  # Content script
└── icons/
    ├── icon16.png
    ├── icon32.png
    ├── icon48.png
    └── icon128.png
```

### Firefox Extension (`firefox-extension/`)

```
firefox-extension/
├── manifest.json               # Manifest V3 (Firefox-compatible)
├── background.js               # Background script (browser.* API)
├── popup.js                    # Popup UI logic
├── popup.html                  # Popup UI HTML
├── content.js                  # Content script
└── icons/
    ├── icon16.png
    ├── icon32.png
    ├── icon48.png
    └── icon128.png
```

## Scripts and Utilities

### Admin Scripts (`admin-scripts/`)

| File | Purpose |
|------|---------|
| `assign-bookmarks-to-user.js` | Assign orphaned bookmarks to a user |
| `backup-database.js` | Export all collections to JSON |
| `check-user-bookmarks.js` | Count bookmarks for a user |
| `check-user-email.js` | Find user by email |
| `cleanup-all-old-backups.sh` | Remove old backups (shell) |
| `cleanup-old-backups.sh` | Backup cleanup with retention |
| `find-bookmarks-by-user.js` | List user's bookmarks |
| `list-usernames.js` | List all registered users |
| `migrate-orphaned-bookmarks-to-user.js` | Migrate ownerless bookmarks |
| `reset-password-of-user.js` | Reset user password via CLI |
| `robust-backup.js` | Main backup script with error handling |
| `robust-backup-improved.js` | Enhanced backup with features |
| `run-backup.sh` | Shell wrapper for backup |
| `setup-backup-guide.js` | Backup setup guide |

### Utility Scripts (`scripts/`)

| File | Purpose |
|------|---------|
| `daily-backup.sh` | Cron-compatible backup (every 6h) |
| `setup-backup-cron.sh` | Install backup cron job |
| `createTestBookmarks.js` | Create test data for development |
| `resetPassword.js` | Reset user password |
| `resetPasswordFixed.js` | Fixed password reset (bypasses pre-save) |
| `verifyPassword.js` | Verify password matches |
| `checkUser.js` | Check user details |
| `checkPublicBookmarks.js` | Inspect public bookmarks |
| `restore-all-from-backup.js` | Full restore from backup |
| `restore-from-april7-backup.js` | Specific date restore |

### Root-Level Utility Scripts

These are one-off scripts in the project root. Most can be consolidated into `scripts/` or `admin-scripts/`.

| File | Purpose |
|------|---------|
| `check-all-bookmarks.js` | List all bookmarks |
| `check-bookmarks-user.js` | Check user's bookmarks |
| `check-bookmarks.js` | Inspect bookmark data |
| `check-collections.js` | List MongoDB collections |
| `check-data.js` | Inspect database data |
| `check-folders.js` | Inspect folder data |
| `check-password.js` | Password verification |
| `create-user.js` | Create user from CLI |
| `debug-parser.js` | Debug HTML parser |
| `debug-update-password.js` | Debug password update |
| `import-analysis.js` | Analyze import data |
| `import-bookmarks.js` | CLI bookmark import |
| `list-users.js` | List all users |
| `reset-admin-password.js` | Reset admin password |
| `resize-favicon-for-extension.js` | Resize for extension icons |
| `resize-favicon.js` | General favicon resizing |
| `restore-bookmarks-from-backup.js` | Restore from backup |
| `restore-bookmarks.js` | Bookmark restoration |
| `restore-from-backup.js` | General restore |
| `restore-users-from-backup.js` | Restore users |
| `test-login.js` | Test login flow |
| `test-parser.js` | Test HTML parser |
| `update-password-direct.js` | Direct password update |
| `update-password-verify.js` | Password update with verification |
| `update-password.js` | Password update utility |

## Configuration Files

### `.env` (Gitignored)

```env
MONGODB_URI=mongodb://localhost:27017/bookmarking-app
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5015
```

### `package.json` (Key Sections)

```json
{
  "name": "bookmarking-app",
  "type": "module",
  "scripts": {
    "dev": "NODE_OPTIONS=--max-old-space-size=1024 vite --port 5170 --host 0.0.0.0",
    "build": "vite build",
    "serve": "vite preview",
    "start": "node server.js",
    "dev:full": "concurrently \"npm run start\" \"npm run dev\"",
    "backup": "node admin-scripts/robust-backup.js",
    "backup:pre-migration": "node admin-scripts/robust-backup.js",
    "import-bookmarks": "node import-bookmarks.js"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^7.7.0",
    "axios": "^1.x",
    "lucide-react": "^0.x",
    "@heroicons/react": "^2.x"
  }
}
```

### `vite.config.js`

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5170,
    host: '0.0.0.0',
    proxy: {
      '/api': 'http://localhost:5015'
    },
    fs: {
      strict: false
    }
  }
})
```

### `tailwind.config.js`

```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {}
  },
  plugins: []
}
```

### `docker-compose.yml`

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:8.0
    container_name: mongodb-container
    hostname: mongodb-container
    restart: unless-stopped
    ports:
      - "27017:27017"
    volumes:
      - mongodb-data:/data/db
    environment:
      - MONGO_INITDB_DATABASE=bookmarking-app
    command: ["--storageEngine", "wiredTiger"]

volumes:
  mongodb_data:
    driver: local
```

## File Naming Conventions

| Type | Convention | Examples |
|------|------------|----------|
| **React Components** | PascalCase.jsx | `BookmarkGrid.jsx`, `LoginForm.jsx` |
| **Utility Functions** | camelCase.js | `fetchMetadata.js`, `api.js` |
| **Database Models** | PascalCase.js | `User.js`, `Bookmark.js` |
| **Express Routes** | camelCase.js | `bookmarks.js`, `users.js` |
| **Middleware** | camelCase.js | `auth.js`, `folderValidation.js` |
| **Scripts** | camelCase or kebab-case.js | `resetPassword.js`, `daily-backup.sh` |
| **Config Files** | kebab-case | `vite.config.js`, `tailwind.config.js` |
| **Documentation** | kebab-case.md | `project-structure.md`, `api-reference.md` |

## Import Organization

### Frontend Imports

```javascript
// Absolute imports (from src/)
import { useAuth } from '../contexts/AuthContext'
import { useBookmarks } from '../contexts/BookmarkContext'
import { bookmarkApi } from '../utils/api'
import BookmarkGrid from '../components/BookmarkGrid'

// npm imports
import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import axios from 'axios'

// Icon imports
import { Plus, Edit, Trash2 } from 'lucide-react'
```

### Backend Imports

```javascript
// ES Module imports
import express from 'express'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Local imports
import User from '../models/User.js'
import auth from '../middleware/auth.js'
import Bookmark from '../models/Bookmark.js'
```

## Notes

1. **ES Modules**: The entire project uses ES modules (`import/export`), not CommonJS (`require`)
2. **`.env` is gitignored**: Never commit secrets. Use `.env copy` as template
3. **Duplicate files**: `AddBookmarkForm copy.jsx` is a backup and should be removed
4. **Root scripts**: Many utility scripts in root should be consolidated into `scripts/` or `admin-scripts/`
5. **Documentation**: Legacy docs in `documentation/` may overlap with `dev-documentation/`

---

*Last Updated: April 9, 2026*
