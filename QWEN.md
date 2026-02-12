# Bookmark Manager - Development Context

## Project Overview

A web-based application for managing bookmarks with advanced organization features, authentication, and cross-device sync.

### Key Features
- **User Authentication**: Secure registration and login with JWT
- **Bookmark Management**: Add, edit, and delete bookmarks with metadata
- **Tag Management**: Organize bookmarks with customizable tags and bulk editing
- **Folder System**: Hierarchical folder organization with drag-and-drop functionality
- **Advanced Search**: Filter bookmarks by tags, keywords, and dates
- **Font Customization**: Adjust font settings with Google Fonts integration
- **Metadata Extraction**: Automatically fetches titles, descriptions and favicons
- **Import/Export**: Import bookmarks from browsers or export for backup
- **Browser Extension**: Add bookmarks directly from Chrome/Firefox
- **Bookmarklet**: Add bookmarks from any webpage with a single click

### Technology Stack
- **Frontend**: React 18.2.0, Vite 6.3.5, Tailwind CSS 3.3.0
- **Backend**: Node.js, Express 4.21.2
- **Database**: MongoDB with Mongoose ODM 8.0.3
- **Authentication**: JSON Web Tokens (JWT) with cross-tab session sync
- **State Management**: React Context API
- **Routing**: React Router DOM 7.7.0

## Project Structure
```
.
├── documentation/          # Project documentation
├── middleware/             # Express middleware
├── models/                 # MongoDB models (User, Bookmark, Folder)
├── routes/                 # API route handlers
├── extension/              # Chrome browser extension
├── firefox-extension/      # Firefox browser extension
├── scripts/                # Database maintenance scripts
├── admin-scripts/          # Admin/maintenance scripts
├── src/                    # Frontend React application
│   ├── components/         # Reusable UI components
│   ├── contexts/           # React context providers
│   ├── hooks/              # Custom React hooks
│   ├── pages/              # Main application pages
│   ├── utils/              # Utility functions
│   └── App.jsx             # Root application component
├── .env                    # Environment variables
├── start-mongo.sh          # MongoDB Docker container starter script
├── package.json            # Project dependencies
├── server.js               # Backend entry point
└── README.md               # Project documentation
```

## Development Environment Setup

### Prerequisites
- Node.js v20+
- MongoDB (local or cloud instance)
- Docker (for local MongoDB setup)

### Installation Steps
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env\ copy .env
   ```
   Required variables:
   - `MONGODB_URI`: MongoDB connection string
   - `JWT_SECRET`: Secret key for JWT authentication
4. Start MongoDB with Docker:
   ```bash
   ./start-mongo.sh
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

### Access
- Application: http://localhost:5170
- Backend API: http://localhost:5015

## Available Scripts

### Development
- `npm run dev`: Start frontend development server
- `npm run start`: Start backend server
- `npm run dev:full`: Start both frontend and backend

### Production
- `npm run build`: Build frontend assets
- `npm run serve`: Preview production build

### Maintenance
- `npm run backup`: Backup database
- `npm run backup:pre-migration`: Backup database before migration

## API Endpoints

### Authentication
- `POST /api/users/register`: Register new user
- `POST /api/users/login`: User authentication
- `GET /api/users/me`: Get current user profile

### Bookmarks
- `GET /api/bookmarks`: Get all bookmarks for current user
- `GET /api/bookmarks/public`: Get public bookmarks
- `POST /api/bookmarks`: Create new bookmark
- `PUT /api/bookmarks/:id`: Update bookmark
- `DELETE /api/bookmarks/:id`: Delete bookmark
- `POST /api/bookmarks/move`: Move multiple bookmarks to folder
- `POST /api/bookmarks/bulk-edit`: Bulk edit bookmarks
- `POST /api/bookmarks/bulk-delete`: Bulk delete bookmarks

### Folders
- `GET /api/folders`: Get user's folder tree
- `POST /api/folders`: Create new folder
- `PUT /api/folders/:id`: Update folder
- `DELETE /api/folders/:id`: Delete folder

### Tags
- `GET /api/tags`: Get all tags for current user
- `POST /api/tags`: Create new tag
- `PUT /api/tags/:id`: Update tag
- `DELETE /api/tags/:id`: Delete tag

## Current Development Status

### Recently Completed
- Enhanced tag management system
- Authentication session management across tabs
- Dashboard UI with unified action toolbar
- Folder/collection system implementation
- Bookmark sharing system

### In Progress
- Browser extension background sync (95% complete)
- Bulk editing operations (60% complete)

### Next Priority Tasks
1. Finish Browser Extension
2. Implement Remaining Bulk Operations
3. Advanced Folder Features

## Development Conventions

### Code Organization
- Use React Context API for global state management
- Follow RESTful API design principles
- Modular component structure with clear separation of concerns
- Consistent naming conventions (PascalCase for components, camelCase for functions/variables)

### Styling
- Tailwind CSS for styling with utility-first approach
- Responsive design for mobile and desktop
- Consistent color palette and spacing

### Error Handling
- Proper error boundaries in React components
- Consistent error response format from API endpoints
- User-friendly error messages

### Testing
- Manual testing through UI interactions
- API endpoint testing with tools like Postman
- Cross-browser compatibility testing

## Browser Extension

### Chrome Extension (`extension/`)
- Manifest V3 configuration
- Context menu integration
- Popup UI for quick bookmarking
- Background script for processing

### Firefox Extension (`firefox-extension/`)
- Firefox-specific manifest configuration
- Shared UI with Chrome version
- Compatible background processing

## Bookmarklet

A JavaScript bookmarklet allows users to quickly add bookmarks from any webpage. 
There are two installation methods:

1. **Drag-and-Drop**: Users can drag the "Add Bookmark" button from the navigation bar directly to their browser bookmarks bar
2. **Manual Installation**: Copy the code from `src/bookmarklet.min.js` and create a browser bookmark with the code as the URL

The bookmarklet automatically extracts page information (URL, title, description) and favicon, then opens a pre-filled form in the bookmarks manager. It also prompts users to enter tags for the bookmark (comma-separated).

## Important Files

### Configuration
- `package.json`: Project dependencies and scripts
- `server.js`: Backend entry point
- `vite.config.js`: Frontend build configuration
- `.env`: Environment variables
- `start-mongo.sh`: MongoDB Docker container starter script

### Documentation
- `README.md`: Project overview and setup instructions
- `documentation/techStack.md`: Technology stack details
- `documentation/dataSources.md`: Database schema and API endpoints
- `documentation/currentTask.md`: Current development status
- `documentation/projectRoadmap.md`: Feature roadmap and timeline

### Routes
- `routes/bookmarks.js`: Bookmark CRUD operations
- `routes/users.js`: Authentication and user management
- `routes/folders.js`: Folder management
- `routes/tags.js`: Tag operations

### Models
- `models/Bookmark.js`: Bookmark schema
- `models/User.js`: User schema
- `models/Folder.js`: Folder schema

## Key Directories

### `src/` - Frontend Application
- `components/`: Reusable UI components
- `contexts/`: React context providers for global state
- `pages/`: Main application pages (Dashboard, Login, etc.)
- `utils/`: Utility functions for API calls and metadata fetching

### `extension/` - Browser Extension
- Contains all files for Chrome extension
- Implements context menu and popup functionality

### `documentation/` - Project Documentation
- Comprehensive documentation for all aspects of the project
- Development plans, roadmaps, and implementation details

## Development Tips

1. **Environment Variables**: Ensure `.env` is properly configured with MongoDB URI and JWT secret
2. **MongoDB**: Use `./start-mongo.sh` to start the database
3. **Frontend Development**: Use `npm run dev` for hot reloading development server
4. **Backend Development**: Use `npm run start` to run the Express server
5. **Full Development Environment**: Use `npm run dev:full` to run both frontend and backend
6. **API Testing**: Test endpoints with tools like Postman or curl
7. **Extension Development**: Load unpacked extension from `extension/` directory in browser
8. **Database Backup**: Use `npm run backup` before making significant changes

## Recent Achievements (August 2025)
- Completed bookmark sharing system with visibility levels
- Implemented toast notification system with undo functionality
- Added social media sharing options
- Completed folder/collection system implementation
- Enhanced bookmark organization with hierarchical folders
- Implemented drag-and-drop functionality for folder reorganization
- Added folder-based filtering to search functionality
- Completed browser bookmark import functionality

---
*Last Updated: September 2025*