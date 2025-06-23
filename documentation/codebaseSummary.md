# Codebase Summary

## Project Structure
```
.
├── documentation/          # Project documentation
├── middleware/             # Express middleware
│   └── auth.js             # Authentication middleware
├── models/                 # MongoDB models
│   ├── Bookmark.js         # Bookmark schema and model
│   └── User.js             # User schema and model
├── routes/                 # API route handlers
│   ├── bookmarks.js        # Bookmark CRUD operations
│   └── users.js            # User authentication routes
├── scripts/                # Database maintenance scripts
├── src/                    # Frontend React application
│   ├── components/         # Reusable UI components
│   │   ├── AddBookmarkForm.jsx
│   │   ├── Auth/           # Authentication components
│   │   ├── BookmarkGrid.jsx
│   │   ├── EditBookmarkForm.jsx
│   │   ├── FontSettings.jsx
│   │   ├── FontSettingsModal.jsx
│   │   ├── SearchBar.jsx
│   │   └── TagManager.jsx
│   ├── utils/              # Utility functions
│   │   ├── api.js          # API service
│   │   ├── db.js           # Database connection
│   │   ├── fetchMetadata.js # URL metadata fetcher
│   │   ├── fontSettings.js # Font management
│   │   └── importBookmarks.js # Bookmark import
│   ├── App.jsx             # Main application component
│   ├── index.css           # Global styles
│   └── main.jsx            # Entry point
├── .env                    # Environment variables
├── docker-compose.yml      # Docker configuration
├── index.html              # HTML entry point
├── package.json            # Project dependencies
├── planned-features.md     # Feature planning
├── postcss.config.cjs      # PostCSS configuration
├── README.md               # Project overview
├── server.js               # Backend entry point
├── setup-app.sh            # Setup script
├── start.sh                # Startup script
└── tailwind.config.js      # Tailwind CSS configuration
```

## Key Abstractions
1. **Component-Based UI**: Frontend built with React components for modularity
2. **RESTful API**: Backend follows REST principles for CRUD operations
3. **MVC Architecture**: Models (MongoDB schemas), Views (React), Controllers (Express routes)
4. **Utility Modules**: Reusable functions for common tasks like API calls and metadata fetching

## Module Dependencies
- Frontend components depend on API service (api.js) for data fetching
- API routes depend on Mongoose models for database operations
- Middleware (auth.js) protects authenticated routes
- Utility modules are imported across both frontend and backend

## Major Modules
### Backend
1. **server.js**: Entry point, sets up Express server and middleware
2. **models/**: Define MongoDB schemas and models
3. **routes/**: Handle API endpoints and business logic
4. **middleware/**: Authentication and request processing

### Frontend
1. **App.jsx**: Root component, manages routing and global state
   - Now uses state to control form visibility (initially hidden)
   - Shows form when "+" button clicked or bookmarklet used
2. **components/**: Reusable UI components
   - AddBookmarkForm: Added cancel button to hide form
3. **utils/api.js**: Centralized API service for backend communication

### Shared Utilities
1. **fetchMetadata.js**: Fetches webpage metadata for new bookmarks
2. **fontSettings.js**: Manages user font preferences

---
Last Updated: 2025-06-23 11:14 AM by Documentation Agent