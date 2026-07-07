# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │   React SPA  │  │ Chrome Ext   │  │  Firefox Ext     │   │
│  │  (Vite)      │  │ (MV3)        │  │  (MV3)           │   │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘   │
│         │                 │                    │              │
│         └─────────────────┼────────────────────┘              │
│                           │                                   │
└───────────────────────────┼───────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      SERVER LAYER                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Express.js Server (Port 5015)            │   │
│  │                                                       │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │            Middleware Layer                     │  │   │
│  │  │  • CORS                                        │  │   │
│  │  │  • JWT Authentication                          │  │   │
│  │  │  • Request Validation                          │  │   │
│  │  │  • Auto-Backup                                 │  │   │
│  │  │  • File Upload (Multer)                        │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │                                                       │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │              Route Handlers                     │  │   │
│  │  │  • /api/users (Authentication)                 │  │   │
│  │  │  • /api/bookmarks (CRUD + Bulk Ops)            │  │   │
│  │  │  • /api/folders (Folder Management)            │  │   │
│  │  │  • /api/tags (Tag Operations)                  │  │   │
│  │  │  • /api/bookmarks/:id/extensions               │  │   │
│  │  │  • /api/import (Bookmark Import)               │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
│                           │                                   │
└───────────────────────────┼───────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     DATA LAYER                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          MongoDB (Docker Container)                   │   │
│  │          Port: 27017                                  │   │
│  │          Volume: mongodb-data (Docker named)          │   │
│  │                                                       │   │
│  │  Collections:                                         │   │
│  │  • users                    (Authentication)           │   │
│  │  • bookmarks                (User bookmarks)           │   │
│  │  • folders                  (Folder hierarchy)         │   │
│  │  • bookmarkextensions       (Custom extensions)        │   │
│  │                                                       │   │
│  │  ODM: Mongoose 8.0.3                                  │   │
│  │  Storage Engine: WiredTiger                           │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

It also includes a PWA manifest (`manifest.json`) and service worker (`sw.js`) served as static assets for installability and Web Share Target support on Android.

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2.0 | UI library with hooks and functional components |
| **Vite** | 6.3.5 | Fast build tool and dev server with HMR |
| **React Router DOM** | 7.7.0 | Client-side routing and navigation |
| **Tailwind CSS** | 3.3.0 | Utility-first CSS framework |
| **Axios** | - | HTTP client for API communication |
| **Lucide React** | - | Icon library |
| **Heroicons React** | - | Additional icon set |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | v20+ | JavaScript runtime |
| **Express.js** | 4.21.2 | Web framework and API server |
| **Mongoose** | 8.0.3 | MongoDB ODM with schema validation |
| **bcryptjs** | - | Password hashing (10 salt rounds) |
| **jsonwebtoken** | - | JWT token generation and verification |
| **Multer** | - | Multipart form data handling (file uploads) |
| **CORS** | - | Cross-origin resource sharing |
| **Cookie Parser** | - | Cookie parsing middleware |
| **node-html-parser** | - | HTML parsing for bookmark imports |
| **dotenv** | - | Environment variable loading |

### Infrastructure

| Technology | Version | Purpose |
|------------|---------|---------|
| **MongoDB** | 8.0.4 | NoSQL database |
| **Docker** | 29.3.0 | Container runtime (Docker Desktop on Windows) |
| **WSL2** | 6.6.87.2 | Windows Subsystem for Linux |

## Data Flow

### Authentication Flow

```
User Login Request
    ↓
┌─────────────────────┐
│  POST /api/users    │
│  /login             │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Verify email &     │
│  password (bcrypt)  │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Generate JWT       │
│  (24h expiry)       │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Return {token,     │
│  user} to client    │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Store token in     │
│  localStorage       │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Cross-tab sync     │
│  (storage event)    │
└─────────────────────┘
```

### Bookmark CRUD Flow

```
User Action (Add Bookmark)
    ↓
┌─────────────────────┐
│  AddBookmarkForm    │
│  Component          │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  bookmarkApi        │
│  .create(data)      │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  POST /api/         │
│  bookmarks          │
│  (with JWT)         │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  auth middleware    │
│  (verify JWT)       │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  autoBackup()       │
│  (pre-write)        │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Validate folder    │
│  ownership          │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Create Bookmark    │
│  in MongoDB         │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Update React       │
│  state (context)    │
└─────────────────────┘
```

## Architecture Patterns

### 1. Context-Based State Management

The application uses React Context API exclusively for global state:

```
AuthProvider (outer)
  └─ FolderProvider
      └─ BookmarkProvider
          └─ TagProvider
              └─ FontProvider
                  └─ ToastProvider
                      └─ App Pages (inner)
```

**Benefits**:
- No external dependencies (no Redux/Zustand)
- Built into React
- Simple API
- Good for small-medium apps

**Limitations**:
- Re-renders all consumers on state change
- No middleware support
- Manual optimization needed

### 2. RESTful API Design

All backend routes follow REST conventions:

- **GET** `/resource` - List all
- **GET** `/resource/:id` - Get one
- **POST** `/resource` - Create
- **PUT** `/resource/:id` - Update
- **DELETE** `/resource/:id` - Delete

### 3. JWT Authentication

Stateless authentication:
- Token stored in localStorage
- Sent with every request in header
- Verified by middleware on protected routes
- 24-hour expiry

### 4. Auto-Backup System

Non-blocking backup before every write operation:
- Triggered by `autoBackup()` middleware
- Exports all collections to JSON
- Keeps max 5 recent backups
- Never fails the main operation

## Security Considerations

### Password Security
- **Hashing**: bcrypt with 10 salt rounds
- **Storage**: Never store plain text passwords
- **Comparison**: Timing-safe bcrypt.compare()

### JWT Security
- **Secret**: Stored in environment variable
- **Expiry**: 24 hours
- **Transmission**: Via HTTP header (not URL)
- **Storage**: localStorage (vulnerable to XSS)

### Input Validation
- **Mongoose schemas**: Type validation and constraints
- **Folder validation**: Ownership checks, circular reference prevention
- **File uploads**: Extension and size limits (10MB max)

### CORS Configuration
- **Origin**: Restricted to `http://localhost:5170` (development)
- **Methods**: GET, POST, PUT, DELETE
- **Headers**: Content-Type, Authorization

## Performance Optimizations

### Frontend
- **Vite**: Fast HMR and optimized builds
- **Lazy loading**: Route-based code splitting (potential)
- **Memoization**: React.memo for expensive components
- **Debouncing**: Search input debounce
- **Virtualization**: Large list rendering optimization (utility available)

### Backend
- **MongoDB indexes**: On owner, parent, name fields
- **Connection pooling**: Mongoose default
- **GC optimization**: Manual garbage collection every 30s (if exposed)

### Network
- **Axios interceptor**: Automatic token injection
- **Vite proxy**: `/api` proxied to backend in development
- **Compression**: Potential gzip compression

## Deployment Architecture

```
Production Environment
┌─────────────────────────┐
│   Nginx (Optional)      │
│   Reverse Proxy         │
└───────────┬─────────────┘
            │
    ┌───────┴───────┐
    │               │
    ▼               ▼
┌────────┐    ┌────────────┐
│ Static │    │ Node.js    │
│ Files  │    │ Server     │
│ (dist) │    │ (Express)  │
└────────┘    └─────┬──────┘
                    │
                    ▼
              ┌────────────┐
              │  MongoDB   │
              │  (Docker)  │
              └────────────┘
```

## Future Architecture Improvements

1. **State Management**: Migrate to Zustand or Redux Toolkit for better performance
2. **Database**: Add Redis for session caching
3. **API**: Implement GraphQL for flexible queries
4. **Auth**: Add refresh tokens and HTTP-only cookies
5. **Testing**: Add Jest + React Testing Library
6. **CI/CD**: GitHub Actions for automated testing and deployment
7. **Monitoring**: Add Sentry for error tracking
8. **CDN**: Serve static assets via CDN

---

*Last Updated: April 9, 2026*
