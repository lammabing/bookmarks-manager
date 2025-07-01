# Technology Stack

## Chosen Technologies, Framework, and Architecture
*   **Frontend:** React, Vite, Tailwind CSS
*   **Backend:** Node.js (v20.11.1), Express (v4.18.2)
*   **Database:** MongoDB (v7.0) with Mongoose ODM (v8.0.3)
*   **Authentication:** JSON Web Tokens (JWT)
*   **Browser Extension:** Chrome/Firefox extension for one-click bookmarking
*   **Proxy Server:** CORS Anywhere for metadata fetching
*   **Architecture:** Client-server (Frontend interacts with Backend API, Backend interacts with MongoDB)
*   **State Management:** React Context API
*   **Font Management:** react-font-picker with Google Fonts integration

## Module Dependencies
*   **Dependencies:**
    *   `autoprefixer`: ^10.4.0 (PostCSS plugin to add vendor prefixes)
    *   `axios`: ^1.9.0 (Promise-based HTTP client for browser and Node.js)
    *   `bcryptjs`: ^2.4.3 (Password hashing)
    *   `cookie-parser`: ^1.4.7 (Parse Cookie header and populate req.cookies)
    *   `cors`: ^2.8.5 (Middleware for enabling CORS)
    *   `dotenv`: ^16.5.0 (Loads environment variables from a .env file)
    *   `express`: ^4.18.2 (Fast, unopinionated, minimalist web framework for Node.js)
    *   `express-jwt`: ^8.5.1 (JWT authentication middleware for Express)
    *   `jsonwebtoken`: ^9.0.2 (JWT implementation)
    *   `lucide-react`: ^0.100.0 (Lucide icons for React)
    *   `mongoose`: ^8.0.3 (MongoDB object modeling tool)
    *   `postcss`: ^8.4.0 (Tool for transforming CSS with JavaScript)
    *   `react`: ^18.2.0 (JavaScript library for building user interfaces)
    *   `react-dom`: ^18.2.0 (React package for working with the DOM)
    *   `tailwindcss`: ^3.3.0 (A utility-first CSS framework)
    *   `sharp`: ^0.34.2 (High performance Node.js image processing library)
*   **Dev Dependencies:**
    *   `@vitejs/plugin-react`: ^3.0.0 (Vite plugin for React)
    *   `concurrently`: ^8.2.2 (Run multiple commands concurrently)
    *   `vite`: ^4.0.0 (Next Generation Frontend Tooling)

## Environment Variables
*   `.env` file required with:
    *   `MONGODB_URI`: MongoDB connection string (e.g., `mongodb://localhost:27017/bookmarking-app`)
    *   `JWT_SECRET`: Secret key for JWT authentication (generate with `openssl rand -base64 32`)
    *   `VITE_API_BASE_URL`: Frontend API base URL (e.g., `http://localhost:5015/api`)

## Data Source(s)
*   MongoDB database
*   Google Fonts API for font management
*   Webpage metadata via proxy server
*   Browser context information via extension

## Data Structures
*   **Bookmarks:** Stored as documents in MongoDB, following the `Bookmark` model
*   **Users:** Stored as documents in MongoDB, following the `User` model

## Database and Table Schema
*   **Database:** `bookmarking-app`
*   **Collections:**
    *   `bookmarks`
        *   `url`: String, required
        *   `title`: String, required
        *   `description`: String
        *   `tags`: Array of Strings
        *   `favicon`: String
        *   `userId`: ObjectId, ref: 'User'
        *   `createdAt`: Date, default: Date.now
        *   `updatedAt`: Date, default: Date.now
    *   `users`
        *   `username`: String, required, unique
        *   `password`: String, required
        *   `email`: String
        *   `createdAt`: Date, default: Date.now
        *   `updatedAt`: Date, default: Date.now

## API Schema
*   **Bookmark Object:**
    *   `_id`: String (MongoDB ObjectId)
    *   `url`: String
    *   `title`: String
    *   `description`: String (optional)
    *   `tags`: Array of Strings (optional)
    *   `favicon`: String (optional)
    *   `userId`: String (owner reference)
    *   `createdAt`: Date
    *   `updatedAt`: Date
*   **User Object:**
    *   `_id`: String (MongoDB ObjectId)
    *   `username`: String
    *   `email`: String (optional)
    *   `createdAt`: Date
    *   `updatedAt`: Date

## API Endpoints
*   **Bookmarks:**
    *   `GET /api/bookmarks`: Get all bookmarks for current user
    *   `GET /api/bookmarks/:id`: Get a single bookmark by ID
    *   `POST /api/bookmarks`: Add a new bookmark or array of bookmarks
    *   `PUT /api/bookmarks/:id`: Update a bookmark by ID
    *   `DELETE /api/bookmarks/:id`: Delete a bookmark by ID
*   **Users:**
    *   `POST /api/users/register`: Register a new user
    *   `POST /api/users/login`: Authenticate user and get JWT token
    *   `GET /api/users/profile`: Get current user's profile
*   **Utility:**
    *   `POST /api/metadata`: Fetch metadata for a given URL

---
Last Updated: 2025-06-30 06:01 PM by Documentation Agent