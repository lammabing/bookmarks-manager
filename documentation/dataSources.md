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
   - createdAt: Date (auto)
   - updatedAt: Date (auto)

2. **users**
   - _id: ObjectId (auto-generated)
   - username: String (required, unique)
   - password: String (required)
   - email: String
   - createdAt: Date (auto)
   - updatedAt: Date (auto)

### Relationships
- One-to-Many: User has many Bookmarks
- Bookmark belongs to one User via userId

## API Endpoints
### Bookmarks
- `GET /api/bookmarks` - Get all bookmarks for current user
- `GET /api/bookmarks/:id` - Get bookmark by ID
- `POST /api/bookmarks` - Create new bookmark(s)
- `PUT /api/bookmarks/:id` - Update bookmark by ID
- `DELETE /api/bookmarks/:id` - Delete bookmark by ID

### Users
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Authenticate user and get JWT
- `GET /api/users/profile` - Get current user's profile

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
4. First `<link rel="icon">` for favicon
5. Fallback to domain favicon at /favicon.ico
6. Use Google favicon service (https://www.google.com/s2/favicons?domain=example.com) as final fallback

---
Last Updated: 2025-06-30 06:02 PM by Documentation Agent