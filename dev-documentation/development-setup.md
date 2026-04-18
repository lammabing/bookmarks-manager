# Development Setup

Environment configuration, prerequisites, and getting started guide.

## Prerequisites

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| **Node.js** | v20+ | JavaScript runtime |
| **npm** | 10+ | Package manager |
| **Docker Desktop** | 29.3.0+ | Container runtime (for MongoDB) |
| **Git** | 2.x | Version control |
| **WSL2** | 6.6.87.2+ | Windows Subsystem for Linux (Windows only) |

### Optional Software

| Software | Purpose |
|----------|---------|
| **VS Code** | Recommended IDE |
| **React DevTools** | Browser extension for debugging |
| **MongoDB Compass** | Database GUI (optional) |
| **Postman/Insomnia** | API testing |

---

## Installation

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd bookmarks-manager
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs all dependencies from `package.json`:

```
~600 packages in node_modules/
Including: React, Express, Mongoose, Vite, Tailwind, etc.
```

### Step 3: Configure Environment Variables

```bash
# Copy template
cp .env copy .env

# Edit .env file
nano .env
```

**Required Variables**:
```env
MONGODB_URI=mongodb://localhost:27017/bookmarking-app
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5015
```

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/bookmarking-app` |
| `JWT_SECRET` | Secret key for JWT signing | Any random string (32+ chars) |
| `PORT` | Backend server port | `5015` |

### Step 4: Start MongoDB

**⚠️ IMPORTANT**: Ensure Docker Desktop is running first!

```bash
# Check Docker
docker info

# Start MongoDB
./start-mongo-reliable.sh
```

**Expected Output**:
```
[INFO] Checking Docker availability...
[INFO] Docker is available!
[INFO] MongoDB container exists. Starting...
[INFO] MongoDB container started successfully.
[INFO] Waiting for MongoDB to be ready...
[INFO] MongoDB is ready!
[INFO] Data directory: mongodb-data (Docker named volume)
```

**If Docker is not running**:
1. Start Docker Desktop on Windows
2. Wait 30-60 seconds for WSL integration
3. Ensure WSL integration is enabled in Docker Desktop Settings → Resources → WSL Integration
4. Try again

### Step 5: Start Application

**Option A: Full Stack (Recommended)**
```bash
./start.sh
```
This starts MongoDB, backend, and frontend together.

**Option B: Manual Start**
```bash
# Terminal 1: Backend
npm run start

# Terminal 2: Frontend
npm run dev
```

**Expected Output**:
```
Backend:
  Server is running on http://localhost:5015
  MongoDB connected successfully

Frontend:
  VITE v6.3.5  ready in 234 ms
  ➜  Local:   http://localhost:5170/
  ➜  Network: http://192.168.1.100:5170/
```

### Step 6: Access Application

- **Frontend**: http://localhost:5170
- **Backend API**: http://localhost:5015
- **API Docs**: See [API Reference](./api-reference.md)

---

## First-Time Setup

### Create Admin User

```bash
node create-user.js
```

Or use the registration form at http://localhost:5170/register

### Default Credentials (if restored from backup)

```
Email: admin@example.com
Password: h0ngk0ng
```

### Verify Installation

```bash
# Test backend
curl http://localhost:5015/api/users/me \
  -H "x-auth-token: YOUR_TOKEN"

# Test frontend
# Open browser to http://localhost:5170
```

---

## Development Workflow

### Running the Application

```bash
# Full stack (MongoDB + Backend + Frontend)
./start.sh

# Frontend only (hot reload)
npm run dev

# Backend only
npm run start

# Both (without MongoDB)
npm run dev:full
```

### Making Changes

**Frontend Changes**:
- Edit any file in `src/`
- Vite automatically reloads (HMR - Hot Module Replacement)
- Changes appear instantly in browser

**Backend Changes**:
- Edit files in root, `routes/`, `models/`, `middleware/`
- Restart backend manually: `Ctrl+C` then `npm run start`
- Or use `nodemon` for auto-restart:
  ```bash
  npm install -g nodemon
  nodemon server.js
  ```

**Database Schema Changes**:
- Edit models in `models/`
- Restart backend
- Existing data persists in MongoDB

---

## Available Scripts

### Development

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend dev server (port 5170) |
| `npm run start` | Start backend server (port 5015) |
| `npm run dev:full` | Run both frontend and backend |

### Production

| Command | Description |
|---------|-------------|
| `npm run build` | Build frontend for production |
| `npm run serve` | Preview production build |

### Maintenance

| Command | Description |
|---------|-------------|
| `npm run backup` | Run database backup |
| `npm run backup:pre-migration` | Backup before migration |
| `npm run import-bookmarks` | Run CLI bookmark import |

---

## Project Structure Quick Reference

```
bookmarks-manager/
├── src/                    # Frontend React app
│   ├── components/         # UI components
│   ├── contexts/           # React Context providers
│   ├── pages/              # Route pages
│   └── utils/              # Utility functions
├── routes/                 # Express API routes
├── models/                 # Mongoose schemas
├── middleware/             # Express middleware
├── chrome-extension/       # Chrome browser extension
├── firefox-extension/      # Firefox browser extension
├── scripts/                # Maintenance scripts
├── admin-scripts/          # Admin utilities
├── backups/                # Automated backups
├── server.js               # Backend entry point
├── start.sh                # Application starter
└── start-mongo-reliable.sh # MongoDB starter
```

See [Project Structure](./project-structure.md) for complete details.

---

## Database Management

### View Database

**MongoDB Shell** (if installed):
```bash
mongosh mongodb://localhost:27017/bookmarking-app
```

**MongoDB Compass** (GUI):
1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. Select `bookmarking-app` database

**Via Node.js**:
```bash
node check-all-bookmarks.js
node list-users.js
```

### Backup Database

```bash
# Manual backup
npm run backup

# Or run script directly
node admin-scripts/robust-backup.js
```

Backups saved to: `backups/auto/`

### Restore Database

```bash
# Restore from specific backup
node scripts/restore-all-from-backup.js
```

### Reset Database

```bash
# Stop MongoDB container
docker stop mongodb-container

# Remove container and volume
docker rm mongodb-container
docker volume rm mongodb-data

# Restart fresh
./start-mongo-reliable.sh
```

**⚠️ WARNING**: This deletes all data!

---

## Browser Extension Setup

### Chrome Extension

1. Open Chrome → `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select `chrome-extension/` directory
5. Extension icon appears in toolbar

### Firefox Extension

1. Open Firefox → `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on...**
3. Select `firefox-extension/manifest.json`
4. Extension loads temporarily (until restart)

### Testing Extension

1. Log in to web app
2. Token syncs to extension automatically
3. Click extension icon on any page
4. Fill in details and save

---

## Environment Configuration

### Development

```env
MONGODB_URI=mongodb://localhost:27017/bookmarking-app
JWT_SECRET=dev-secret-not-for-production
PORT=5015
```

### Production

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/bookmarks
JWT_SECRET=$(openssl rand -hex 64)
PORT=5015
NODE_ENV=production
```

### Multiple Environments

Create environment-specific files:
```
.env.development
.env.staging
.env.production
```

Load with:
```bash
NODE_ENV=production npm run start
```

---

## Troubleshooting

### Docker Not Running

**Symptom**: `docker info` fails

**Solution**:
1. Start Docker Desktop on Windows
2. Wait 30-60 seconds
3. Ensure WSL integration enabled
4. Verify: `docker info`

### MongoDB Won't Start

**Symptom**: `./start-mongo-reliable.sh` fails

**Solutions**:
```bash
# Check if port 27017 is in use
netstat -tlnp | grep 27017

# Kill process on port 27017
fuser -k 27017/tcp

# Remove old container
docker rm -f mongodb-container

# Restart
./start-mongo-reliable.sh
```

### Port Already in Use

**Symptom**: `EADDRINUSE` error

**Solution**:
```bash
# Kill process on port 5015 (backend)
fuser -k 5015/tcp

# Kill process on port 5170 (frontend)
fuser -k 5170/tcp

# Or use the built-in script
npx kill-port 5015
npx kill-port 5170
```

### Data Loss After Restart

**Cause**: Docker volume not persisting

**Solution**: See [Troubleshooting Guide](../TROUBLESHOOTING.md)

### Frontend Can't Connect to Backend

**Symptom**: Network errors in browser console

**Check**:
1. Backend running: `curl http://localhost:5015`
2. CORS configured for `http://localhost:5170`
3. Vite proxy configured in `vite.config.js`

---

## VS Code Setup

### Recommended Extensions

- **ES7+ React/Redux/React-Native snippets**: React shortcuts
- **Tailwind CSS IntelliSense**: Tailwind autocomplete
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **MongoDB for VS Code**: Database management

### Settings

**.vscode/settings.json**:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.tabSize": 2,
  "files.autoSave": "afterDelay",
  "javascript.updateImportsOnFileMove.enabled": "always"
}
```

### Debug Configuration

**.vscode/launch.json**:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Debug Frontend",
      "url": "http://localhost:5170",
      "webRoot": "${workspaceFolder}/src"
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "program": "${workspaceFolder}/server.js",
      "console": "integratedTerminal"
    }
  ]
}
```

---

## Code Style

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `BookmarkGrid.jsx` |
| Functions | camelCase | `fetchBookmarks()` |
| Variables | camelCase | `bookmarkData` |
| Constants | UPPER_SNAKE_CASE | `API_BASE_URL` |
| Files | Match export name | `useFolders.js` |

### Import Order

```javascript
// 1. npm packages
import React from 'react';
import axios from 'axios';

// 2. Absolute imports (from src/)
import { useAuth } from '../contexts/AuthContext';
import BookmarkGrid from '../components/BookmarkGrid';

// 3. Relative imports
import { formatDate } from './utils';

// 4. CSS (if any)
import './styles.css';
```

### Git Commits

```bash
# Good commit messages
git commit -m "Add bulk delete functionality to bookmark grid"
git commit -m "Fix folder selection dropdown not updating"
git commit -m "Refactor authentication context for clarity"

# Bad commit messages
git commit -m "fix"
git commit -m "update"
git commit -m "stuff"
```

---

## Performance Tips

### Frontend

- Use React.memo for expensive components
- Memoize computations with useMemo
- Debounce search inputs
- Lazy load routes (code splitting)

### Backend

- MongoDB indexes on frequently queried fields
- Pagination for large datasets
- Response caching for static data
- Connection pooling (Mongoose default)

### Development

- Close unused browser tabs
- Use Chrome DevTools Memory tab to monitor usage
- Restart dev server if HMR breaks
- Clear localStorage if auth issues persist

---

## Next Steps

1. [Read Architecture Overview](./architecture.md)
2. [Understand Database Models](./database-models.md)
3. [Explore API Endpoints](./api-reference.md)
4. [Review Frontend Components](./frontend-components.md)
5. [Learn State Management](./state-management.md)

---

*Last Updated: April 9, 2026*
