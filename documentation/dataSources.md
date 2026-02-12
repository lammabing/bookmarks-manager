# Data Sources

## Database Schema
### Collections
1. **bookmarks**
   - _id: ObjectId (auto-generated)
   - url: String (required)
   - title: String (required)
   - description: String
   - tags: [String]
   - favicon: String
   - userId: ObjectId (references users._id)
   - folder: ObjectId (references folders._id, optional)
   - visibility: String (enum: 'private', 'public', 'shared', default: 'private')
   - sharedWith: [ObjectId] (references users._id, for 'shared' visibility)
   - createdAt: Date (auto)
   - updatedAt: Date (auto)

2. **users**
   - _id: ObjectId (auto-generated)
   - username: String (required, unique)
   - password: String (required, hashed)
   - email: String (optional)
   - createdAt: Date (auto)
   - updatedAt: Date (auto)

3. **folders**
   - _id: ObjectId (auto-generated)
   - name: String (required)
   - description: String (optional)
   - color: String (optional, hex color code)
   - icon: String (optional, icon identifier)
   - parent: ObjectId (references folders._id, optional for nested folders)
   - userId: ObjectId (references users._id, required)
   - isRoot: Boolean (default: false)
   - order: Number (default: 0)
   - bookmarkCount: Number (default: 0)
   - createdAt: Date (auto)
   - updatedAt: Date (auto)

4. **tags**
   - _id: ObjectId (auto-generated)
   - name: String (required, unique per user)
   - userId: ObjectId (references users._id, required)
   - createdAt: Date (auto)
   - updatedAt: Date (auto)

### Relationships
- One-to-Many: User has many Bookmarks, Folders, and Tags
- One-to-Many: Folder has many Bookmarks (optional relationship)
- Many-to-Many: Bookmarks can have multiple Tags
- Hierarchical: Folders can have parent-child relationships (nested folders)

## API Endpoints
### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Authenticate user and get JWT
- `GET /api/users/me` - Get current user's profile (updated from /profile)

### Users
- `GET /api/users/shareable` - Get list of users that can be shared with

### Bookmarks
- `GET /api/bookmarks` - Get all bookmarks for current user
- `GET /api/bookmarks/public` - Get public bookmarks for homepage
- `GET /api/bookmarks/:id` - Get bookmark by ID
- `POST /api/bookmarks` - Create new bookmark(s) (supports bulk creation)
- `PUT /api/bookmarks/:id` - Update bookmark by ID
- `DELETE /api/bookmarks/:id` - Delete bookmark by ID
- `PUT /api/bookmarks/:id/move` - Move bookmark to different folder
- `POST /api/bookmarks/move` - Move multiple bookmarks to folder
- `POST /api/bookmarks/:id/share` - Update bookmark sharing settings
- `GET /api/bookmarks/shared` - Get bookmarks shared with current user

### Folders
- `GET /api/folders` - Get all folders for current user
- `GET /api/folders/:id` - Get folder by ID with bookmarks
- `POST /api/folders` - Create new folder
- `PUT /api/folders/:id` - Update folder by ID
- `DELETE /api/folders/:id` - Delete folder by ID
- `GET /api/folders/:id/bookmarks` - Get bookmarks in specific folder
- `POST /api/folders/:id/move` - Move folder to new parent

### Tags
- `GET /api/tags` - Get all tags for current user
- `GET /api/tags/stats` - Get tag usage statistics
- `POST /api/tags` - Create new tag
- `PUT /api/tags/:id` - Update tag by ID
- `DELETE /api/tags/:id` - Delete tag by ID

### Metadata
- `POST /api/metadata` - Fetch metadata for a given URL

## Remote Data Fetching
The application uses the `fetchMetadata.js` utility to:
1. Retrieve webpage metadata (title, description, favicon) when adding new bookmarks
2. Handle CORS issues through a proxy server (CORS Anywhere)
3. Parse HTML content to extract Open Graph and Twitter Card metadata
4. Fallback to HTML title and meta description if needed
5. Generate favicons using Google's favicon service if not found in metadata

## Web Scraping Targets
The metadata fetching logic targets:
1. `<title>` elements in HTML head
2. `<meta>` tags with:
   - name="description"
   - property="og:title", "og:description", "og:image"
   - name="twitter:title", "twitter:description", "twitter:image"
3. First `<link rel="icon">` for favicon
4. Fallback to domain favicon at /favicon.ico
5. Use Google favicon service (https://www.google.com/s2/favicons?domain=example.com) as final fallback

## Data Flow Architecture
### Frontend State Management
- **AuthContext**: User authentication and session management
- **BookmarkContext**: Bookmark CRUD operations and state
- **FolderContext**: Hierarchical folder management (fully implemented)
- **TagContext**: Tag management and statistics
- **FontContext**: Font customization settings
- **ToastContext**: Toast notification system with undo functionality

### API Integration
- RESTful API design with proper HTTP methods
- JWT-based authentication for protected routes
- Middleware for authentication verification and CORS handling
- Error handling with appropriate HTTP status codes

### Database Optimizations
- Indexes on frequently queried fields (userId, folder, tags)
- Efficient tree traversal for folder hierarchies
- Optimized bookmark-folder associations
- Connection pooling for MongoDB performance

---
Last Updated: 2025-08-05 by Development Team
