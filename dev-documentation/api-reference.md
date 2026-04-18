# API Reference

Complete REST API endpoint documentation for the Bookmarks Manager backend.

**Base URL**: `http://localhost:5015/api`

## Authentication

Most endpoints require JWT authentication via the `x-auth-token` or `Authorization` header:

```http
x-auth-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

or

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Users API

**Base**: `/api/users`

### Register New User

```http
POST /api/users/register
Content-Type: application/json
```

**Request Body**:
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response** (201):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "69b196cd36a03ff278ab64a0",
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

**Errors**:
- `400` - User already exists
- `400` - Validation error (username too short, invalid email, etc.)

---

### Login

```http
POST /api/users/login
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": "admin@example.com",
  "password": "h0ngk0ng"
}
```

**Response** (200):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "69b196cd36a03ff278ab64a0",
    "username": "admin",
    "email": "admin@example.com"
  }
}
```

**Errors**:
- `400` - Missing email or password
- `400` - Invalid credentials

---

### Get Current User

```http
GET /api/users/me
x-auth-token: <token>
```

**Response** (200):
```json
{
  "id": "69b196cd36a03ff278ab64a0",
  "username": "admin",
  "email": "admin@example.com",
  "createdAt": "2026-03-31T00:36:42.000Z"
}
```

**Errors**:
- `401` - Invalid or missing token

---

### Get Shareable Users

```http
GET /api/users/shareable
x-auth-token: <token>
```

**Response** (200):
```json
[
  {
    "id": "...",
    "username": "user1",
    "email": "user1@example.com"
  },
  {
    "id": "...",
    "username": "user2",
    "email": "user2@example.com"
  }
]
```

Returns all users except the current user (for sharing bookmarks).

---

## Bookmarks API

**Base**: `/api/bookmarks`

### Get All User Bookmarks

```http
GET /api/bookmarks
x-auth-token: <token>
```

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `folder` | ObjectId | Filter by folder ID |
| `tags` | String (comma-separated) | Filter by tags |
| `search` | String | Search in title/description |

**Response** (200):
```json
[
  {
    "_id": "69847f18e9e709d18915ed51",
    "url": "https://github.com",
    "title": "GitHub",
    "description": "Dev Repos",
    "tags": ["dev", "downloads"],
    "favicon": "https://www.google.com/s2/favicons?domain=github.com",
    "owner": "69b196cd36a03ff278ab64a0",
    "folder": null,
    "visibility": "private",
    "sharedWith": [],
    "createdAt": "2026-02-05T11:29:28.756Z",
    "updatedAt": "2026-04-07T06:06:18.932Z"
  }
]
```

---

### Get Public Bookmarks

```http
GET /api/bookmarks/public
```

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | Number | 1 | Page number |
| `limit` | Number | 20 | Items per page |

**Response** (200):
```json
{
  "bookmarks": [
    {
      "_id": "...",
      "url": "...",
      "title": "...",
      "description": "...",
      "tags": [],
      "favicon": "...",
      "owner": {
        "username": "admin"
      },
      "createdAt": "..."
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 42
}
```

---

### Get Single Bookmark

```http
GET /api/bookmarks/:id
x-auth-token: <token> (optional for public bookmarks)
```

**Response** (200):
```json
{
  "_id": "69847f18e9e709d18915ed51",
  "url": "https://github.com",
  "title": "GitHub",
  "description": "Dev Repos",
  "tags": ["dev"],
  "owner": {
    "id": "69b196cd36a03ff278ab64a0",
    "username": "admin"
  },
  "folder": null,
  "visibility": "public"
}
```

**Errors**:
- `404` - Bookmark not found
- `403` - Access denied (private bookmark)

---

### Create Bookmark

```http
POST /api/bookmarks
x-auth-token: <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "url": "https://github.com/facebook/react",
  "title": "React GitHub",
  "description": "A JavaScript library for building user interfaces",
  "tags": ["react", "javascript", "frontend"],
  "folder": "69847f18e9e709d18915ed99",
  "visibility": "private"
}
```

**Response** (201):
```json
{
  "_id": "...",
  "url": "https://github.com/facebook/react",
  "title": "React GitHub",
  "owner": "69b196cd36a03ff278ab64a0",
  "createdAt": "2026-04-09T05:00:00.000Z",
  "updatedAt": "2026-04-09T05:00:00.000Z"
}
```

**Validation**:
- `url` and `title` are required
- If `folder` is provided, must belong to user
- Auto-backup triggered before creation

**Errors**:
- `400` - Missing required fields
- `403` - Folder not found or access denied

---

### Update Bookmark

```http
PUT /api/bookmarks/:id
x-auth-token: <token>
Content-Type: application/json
```

**Request Body** (partial):
```json
{
  "title": "Updated Title",
  "tags": ["new", "tags"],
  "visibility": "public"
}
```

**Response** (200):
```json
{
  "_id": "...",
  "title": "Updated Title",
  "updatedAt": "2026-04-09T05:00:00.000Z"
}
```

**Errors**:
- `404` - Bookmark not found
- `403` - Not owner

---

### Delete Bookmark

```http
DELETE /api/bookmarks/:id
x-auth-token: <token>
```

**Response** (200):
```json
{
  "message": "Bookmark deleted"
}
```

**Errors**:
- `404` - Bookmark not found
- `403` - Not owner

---

## Bulk Operations

### Move Bookmarks to Folder

```http
POST /api/bookmarks/move
x-auth-token: <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "bookmarkIds": ["id1", "id2", "id3"],
  "folderId": "69847f18e9e709d18915ed99"
}
```

**Response** (200):
```json
{
  "message": "Bookmarks moved successfully",
  "count": 3
}
```

---

### Bulk Edit

```http
POST /api/bookmarks/bulk-edit
x-auth-token: <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "bookmarkIds": ["id1", "id2"],
  "folder": "folderId",
  "tags": {
    "operation": "add",  // "add" | "remove" | "replace"
    "tags": ["new-tag", "another-tag"]
  },
  "visibility": "public"
}
```

**Response** (200):
```json
{
  "message": "Bulk edit completed",
  "count": 2
}
```

---

### Bulk Tag Operations

```http
POST /api/bookmarks/bulk-tags
x-auth-token: <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "bookmarkIds": ["id1", "id2"],
  "operation": "add",
  "tags": ["react", "javascript"]
}
```

**Operations**:
- `add`: Add tags to bookmarks
- `remove`: Remove tags from bookmarks
- `replace`: Replace all tags with new tags

---

### Bulk Delete

```http
POST /api/bookmarks/bulk-delete
x-auth-token: <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "bookmarkIds": ["id1", "id2", "id3"]
}
```

**Response** (200):
```json
{
  "message": "Bookmarks deleted successfully",
  "count": 3
}
```

---

### Bulk Visibility Change

```http
POST /api/bookmarks/bulk-visibility
x-auth-token: <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "bookmarkIds": ["id1", "id2"],
  "visibility": "public"
}
```

---

### Bulk Share with Users

```http
POST /api/bookmarks/bulk-share
x-auth-token: <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "bookmarkIds": ["id1", "id2"],
  "userIds": ["userId1", "userId2"]
}
```

Sets visibility to `selected` and adds users to `sharedWith` array.

---

## Folders API

**Base**: `/api/folders`

### Get Folder Tree

```http
GET /api/folders
x-auth-token: <token>
```

**Response** (200):
```json
[
  {
    "_id": "folder1",
    "name": "Development",
    "parent": null,
    "color": "#3B82F6",
    "icon": "folder",
    "bookmarkCount": 42,
    "children": [
      {
        "_id": "folder2",
        "name": "React",
        "parent": "folder1",
        "bookmarkCount": 15,
        "children": []
      }
    ]
  }
]
```

Returns hierarchical folder structure.

---

### Get Single Folder

```http
GET /api/folders/:id
x-auth-token: <token>
```

**Response** (200):
```json
{
  "_id": "folder1",
  "name": "Development",
  "description": "Dev resources",
  "parent": null,
  "owner": "69b196cd36a03ff278ab64a0",
  "color": "#3B82F6",
  "icon": "folder",
  "bookmarkCount": 42,
  "bookmarks": [...]
}
```

---

### Create Folder

```http
POST /api/folders
x-auth-token: <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "React Resources",
  "description": "React-related bookmarks",
  "parent": "folder1",  // Optional (null for root)
  "color": "#EF4444",
  "icon": "code"
}
```

**Response** (201):
```json
{
  "_id": "...",
  "name": "React Resources",
  "owner": "69b196cd36a03ff278ab64a0",
  "createdAt": "2026-04-09T05:00:00.000Z"
}
```

**Validation**:
- `name` is required (max 100 chars)
- If `parent` is provided, must belong to user
- Circular reference check

---

### Update Folder

```http
PUT /api/folders/:id
x-auth-token: <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "Updated Name",
  "color": "#10B981",
  "icon": "star"
}
```

---

### Delete Folder

```http
DELETE /api/folders/:id
x-auth-token: <token>
```

**Response** (200):
```json
{
  "message": "Folder deleted successfully"
}
```

**Behavior**:
- Bookmarks in folder are moved to parent folder (or null)
- Child folders are moved to parent (or root)

---

### Move Folder

```http
POST /api/folders/:id/move
x-auth-token: <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "newParentId": "folder1"  // null for root
}
```

---

### Get Folder Bookmarks

```http
GET /api/folders/:id/bookmarks
x-auth-token: <token>
```

Returns all bookmarks in the specified folder.

---

## Tags API

**Base**: `/api/tags`

### Get All Tags

```http
GET /api/tags
x-auth-token: <token>
```

**Response** (200):
```json
[
  {
    "_id": "react",
    "count": 15
  },
  {
    "_id": "javascript",
    "count": 23
  }
]
```

Uses MongoDB aggregation to count tag usage across all bookmarks.

---

### Rename Tag

```http
PUT /api/tags/:tagName
x-auth-token: <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "newName": "reactjs"
}
```

**Response** (200):
```json
{
  "message": "Tag renamed successfully",
  "count": 15
}
```

Updates tag across all user's bookmarks.

---

### Delete Tag

```http
DELETE /api/tags/:tagName
x-auth-token: <token>
```

**Response** (200):
```json
{
  "message": "Tag deleted successfully",
  "count": 15
}
```

Removes tag from all user's bookmarks.

---

## Bookmark Extensions API

**Base**: `/api/bookmarks/:bookmarkId/extensions`

### Get Extensions

```http
GET /api/bookmarks/:bookmarkId/extensions
```

**Response** (200):
```json
[
  {
    "_id": "...",
    "bookmarkId": "69847f18e9e709d18915ed51",
    "type": "note",
    "content": "Important resource",
    "metadata": {},
    "createdAt": "2026-04-07T06:06:18.932Z"
  }
]
```

**Note**: This endpoint is currently public (no auth required).

---

### Create Extension

```http
POST /api/bookmarks/:bookmarkId/extensions
Content-Type: application/json
```

**Request Body**:
```json
{
  "type": "note",
  "content": "This is a great tutorial",
  "metadata": {
    "author": "admin"
  }
}
```

**Types**: `note`, `comment`, `image`, `discussion`, `custom`

---

### Update Extension

```http
PUT /api/extensions/:extensionId
Content-Type: application/json
```

**Request Body**:
```json
{
  "content": "Updated content",
  "metadata": { ... }
}
```

---

### Delete Extension

```http
DELETE /api/extensions/:extensionId
```

---

## Import API

**Base**: `/api/import`

### Import Bookmarks from HTML File

```http
POST /api/import
x-auth-token: <token>
Content-Type: multipart/form-data
```

**Request**:
- **Field**: `file` (HTML file from browser bookmark export)
- **Max Size**: 10MB
- **Allowed Extensions**: `.html`, `.htm`

**Response** (200):
```json
{
  "message": "Import completed successfully",
  "foldersCreated": 5,
  "bookmarksImported": 142
}
```

**Process**:
1. File uploaded via Multer
2. Parsed using `BookmarkHTMLParser` (handles Netscape bookmark format)
3. Folders created with hierarchy
4. Bookmarks imported with tags and metadata
5. Folder IDs mapped between HTML and database

---

## Error Responses

All endpoints return consistent error format:

```json
{
  "error": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| `200` | Success | GET, PUT, DELETE success |
| `201` | Created | POST success (new resource) |
| `400` | Bad Request | Missing fields, validation error |
| `401` | Unauthorized | Missing or invalid JWT token |
| `403` | Forbidden | Access denied (not owner) |
| `404` | Not Found | Resource doesn't exist |
| `500` | Server Error | Unexpected error |

---

## Rate Limiting

Currently **no rate limiting** is implemented. Consider adding:
- `express-rate-limit` package
- Different limits for auth vs data endpoints
- IP-based or user-based limiting

---

## Pagination

Only `/api/bookmarks/public` supports pagination:

```javascript
{
  "page": 1,
  "limit": 20,
  "total": 142,
  "bookmarks": [...]
}
```

Other endpoints return all results. Consider adding pagination for:
- `/api/bookmarks` (user's bookmarks)
- `/api/folders` (if user has many folders)

---

## API Conventions

### Request Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Content-Type` | Yes (POST/PUT) | `application/json` or `multipart/form-data` |
| `x-auth-token` | For private routes | JWT token |
| `Authorization` | Alternative to x-auth-token | `Bearer <token>` |

### Response Format

- **Success**: Data object/array directly
- **Error**: `{ "error": "message" }`
- **Lists**: Array of objects
- **Single Resource**: Object with `_id`

### Timestamps

All timestamps in **ISO 8601** format:
```
2026-04-09T05:00:00.000Z
```

---

*Last Updated: April 9, 2026*
