# Technology Stack

## Chosen Technologies, Framework, and Architecture
*   **Frontend:** React 18.2.0, Vite 6.3.5, Tailwind CSS 3.3.0
*   **Backend:** Node.js (v20.11.1), Express 4.21.2
*   **Database:** MongoDB (v7.0) with Mongoose ODM 8.0.3
*   **Authentication:** JSON Web Tokens (JWT) with cross-tab session sync
*   **State Management:** React Context API (Auth, Bookmarks, Folders, Tags, Font)
*   **Routing:** React Router DOM 7.7.0
*   **Icons:** Lucide React 0.100.0, Heroicons React 2.2.0
*   **Browser Extension:** Chrome/Firefox extension with Manifest V3 support
*   **Proxy Server:** CORS Anywhere for metadata fetching
*   **Architecture:** Client-server (Frontend interacts with Backend API, Backend interacts with MongoDB)
*   **Build Tool:** Vite with React plugin
*   **Styling:** Tailwind CSS with PostCSS and Autoprefixer

## Module Dependencies
*   **Core Dependencies:**
    *   `react`: ^18.2.0 (UI library)
    *   `react-dom`: ^18.2.0 (React DOM renderer)
    *   `react-router-dom`: ^7.7.0 (Client-side routing)
    *   `express`: ^4.21.2 (Web framework for Node.js)
    *   `mongoose`: ^8.0.3 (MongoDB object modeling)
    *   `axios`: ^1.9.0 (HTTP client for API calls)
    *   `jsonwebtoken`: ^9.0.2 (JWT implementation)
    *   `bcryptjs`: ^2.4.3 (Password hashing)
    *   `cors`: ^2.8.5 (Cross-origin resource sharing)
    *   `dotenv`: ^16.5.0 (Environment variable management)

*   **UI and Styling:**
    *   `tailwindcss`: ^3.3.0 (Utility-first CSS framework)
    *   `postcss`: ^8.4.0 (CSS post-processor)
    *   `autoprefixer`: ^10.4.0 (CSS vendor prefixes)
    *   `lucide-react`: ^0.100.0 (Icon library)
    *   `@heroicons/react`: ^2.2.0 (Additional icon library)

*   **Development Dependencies:**
    *   `@vitejs/plugin-react`: ^4.7.0 (Vite React plugin)
    *   `vite`: ^6.3.5 (Build tool and dev server)
    *   `concurrently`: ^8.2.2 (Run multiple commands)
    *   `sharp`: ^0.34.2 (Image processing)

*   **Authentication & Security:**
    *   `express-jwt`: ^8.5.1 (JWT middleware for Express)
    *   `cookie-parser`: ^1.4.7 (Cookie parsing middleware)

## Environment Variables
*   `.env` file required with:
    *   `MONGODB_URI`: MongoDB connection string (e.g., `mongodb://localhost:27017/bookmarking-app`)
    *   `JWT_SECRET`: Secret key for JWT authentication (generate with `openssl rand -base64 32`)
    *   `VITE_API_BASE_URL`: Frontend API base URL (e.g., `http://localhost:5015/api`)

## Data Source(s)
*   **Primary Database:** MongoDB with Mongoose ODM
*   **External APIs:** 
    *   Google Fonts API for font management
    *   Webpage metadata via CORS proxy server
    *   Browser context information via extension
*   **Local Storage:** JWT tokens for authentication persistence
*   **Session Storage:** Temporary UI state management

## Data Structures
*   **Bookmarks:** MongoDB documents with URL, title, description, tags, favicon, timestamps
*   **Users:** MongoDB documents with username, email, hashed password, profile data
*   **Tags:** Managed within bookmark documents and separate tag collection
*   **Folders:** Hierarchical structure (planned implementation)
*   **Extensions:** Additional bookmark metadata and annotations

## API Endpoints
*   **Authentication:**
    *   `POST /api/users/register`: Register new user
    *   `POST /api/users/login`: User authentication
    *   `GET /api/users/profile`: Get current user profile

*   **Bookmarks:**
    *   `GET /api/bookmarks`: Get all bookmarks for current user
    *   `GET /api/bookmarks/:id`: Get single bookmark by ID
    *   `POST /api/bookmarks`: Add new bookmark or array of bookmarks
    *   `PUT /api/bookmarks/:id`: Update bookmark by ID
    *   `DELETE /api/bookmarks/:id`: Delete bookmark by ID

*   **Tags:**
    *   `GET /api/tags`: Get all tags for current user
    *   `POST /api/tags`: Create new tag
    *   `PUT /api/tags/:id`: Update tag by ID
    *   `DELETE /api/tags/:id`: Delete tag by ID

*   **Extensions:**
    *   `GET /api/bookmarkExtensions/:bookmarkId`: Get extensions for bookmark
    *   `POST /api/bookmarkExtensions`: Create bookmark extension
    *   `PUT /api/bookmarkExtensions/:id`: Update extension
    *   `DELETE /api/bookmarkExtensions/:id`: Delete extension

*   **Utility:**
    *   `POST /api/metadata`: Fetch metadata for given URL

## Architecture Patterns
*   **Context Pattern:** Global state management with React contexts
*   **Repository Pattern:** API service layer abstracts data access
*   **Component Composition:** Reusable UI components with props
*   **Middleware Pattern:** Express middleware for authentication and CORS
*   **Observer Pattern:** Event-driven updates across components

## Performance Optimizations
*   **Lazy Loading:** Components loaded on demand
*   **Memoization:** React.memo for expensive components
*   **Debounced Search:** Reduced API calls during search
*   **Optimistic Updates:** Immediate UI feedback before server confirmation
*   **Connection Pooling:** MongoDB connection optimization

---
Last Updated: 2025-01-27 by Documentation Agent
