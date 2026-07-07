![Bookmark Manager Banner](banner.svg)

# Bookmark Manager

A web-based application for managing bookmarks with advanced organization features, authentication, and cross-device sync.

## Features

- **User Authentication**: Secure registration and login with JWT
- **Bookmark Management**: Add, edit, and delete bookmarks with metadata
- **Tag Management**: Organize bookmarks with customizable tags and bulk editing
- **Folder System**: Hierarchical folder organization with drag-and-drop functionality
- **Advanced Search**: Filter bookmarks by tags, keywords, and dates
- **Font Customization**: Adjust font settings with Google Fonts integration
- **Metadata Extraction**: Automatically fetches titles, descriptions and favicons
- **Import/Export**: Import bookmarks from browsers or export for backup
- **Browser Extension**: Add bookmarks directly from Chrome/Firefox with enhanced popup UI and context menu; now supports pre-filling bookmark forms with current page information when not logged in
- **Bookmarklet**: Add bookmarks from any webpage with a single click using the bookmarklet
- **PWA with Web Share Target**: Installable on Android — share any webpage directly to the app via the system share sheet
- **Auto-Backup System**: Automatic backups before every write operation to protect against data loss
- **Server-Side Metadata**: Secure metadata extraction without third-party proxies
- **Rate Limiting**: Protection against brute-force attacks on authentication endpoints

---

## Installation Guide

### Prerequisites

Before installing, ensure you have the following:

| Requirement | Version | How to Check |
|------------|---------|--------------|
| **Node.js** | v20+ | `node --version` |
| **npm** | v9+ | `npm --version` |
| **Docker** | Latest | `docker --version` |

#### Install Prerequisites (if needed)

**Windows (WSL2):**
```bash
# Install Node.js (using nvm recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20

# Install Docker Desktop for Windows
# Download from: https://www.docker.com/products/docker-desktop/
```

**Linux:**
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

---

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd bookmarks-manager
```

---

### Step 2: Install Dependencies

```bash
npm install
```

This installs all required packages including:
- React 18.2.0 (Frontend)
- Express 4.21.2 (Backend)
- MongoDB/Mongoose 8.0.3 (Database)
- Vite 6.3.5 (Build tool)
- Tailwind CSS 3.3.0 (Styling)

---

### Step 3: Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

If `.env.example` doesn't exist, create `.env` manually:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/bookmarking-app

# JWT Secret (generate with `openssl rand -base64 64`)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Port
PORT=5015

# Frontend Port (for Vite)
VITE_PORT=5170

# CORS Origin (set to frontend URL in production)
CORS_ORIGIN=http://localhost:5170
```

**Important:** Change `JWT_SECRET` to a random string for production:
```bash
# Generate a random secret
openssl rand -base64 64
```

---

### Step 4: Set Up MongoDB Database

The application uses MongoDB with Docker for easy setup and data persistence.

#### Option A: Using the Start Script (Recommended)

```bash
# Make the script executable
chmod +x start-mongo.sh

# Run the script to start MongoDB container
./start-mongo.sh
```

This script will:
1. Check if Docker is running
2. Create a MongoDB container named `mongodb-container`
3. Mount persistent storage to `~/mongodb`
4. Expose MongoDB on port `27017`

**Verify MongoDB is running:**
```bash
docker ps | grep mongodb-container
```

You should see:
```
mongodb-container   mongo:latest   "docker-entrypoint.s…"   Up X minutes
```

#### Option B: Manual Docker Setup

```bash
# Create data directory for persistence
mkdir -p ~/mongodb

# Start MongoDB container
docker run -d \
  --hostname=mongodb-container \
  --name=mongodb-container \
  --network=bridge \
  -p 27017:27017 \
  -v ~/mongodb:/data/db \
  -v /data/configdb \
  --restart=unless-stopped \
  mongo:latest
```

#### Option C: Using Existing MongoDB

If you have MongoDB installed locally or use MongoDB Atlas:

1. **Local MongoDB:**
   ```bash
   # Install MongoDB locally
   sudo apt-get install -y mongodb-org
   
   # Start MongoDB service
   sudo systemctl start mongod
   ```
   
   Update `.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/bookmarking-app
   ```

2. **MongoDB Atlas (Cloud):**
   
   Update `.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bookmarking-app
   ```

---

### Step 5: Verify Database Connection

Test the MongoDB connection:

```bash
# Using mongosh (MongoDB shell)
docker exec mongodb-container mongosh bookmarking-app --eval "db.getCollectionNames()"
```

Expected output:
```
[]
```

(Empty array is correct - collections are created when you add data)

---

### Step 6: Start the Application

#### Development Mode (Recommended)

Start both frontend and backend:

```bash
npm run dev:full
```

This starts:
- **Backend API** on http://localhost:5015
- **Frontend** on http://localhost:5170

Or start them separately:

```bash
# Terminal 1 - Backend
npm run start

# Terminal 2 - Frontend
npm run dev
```

#### Production Mode

```bash
# Build frontend assets
npm run build

# Start production server
npm run serve
```

---

### Step 7: Create Your First User Account

1. Open your browser and navigate to http://localhost:5170

2. Click **"Create a new account"**

3. Fill in the registration form:
   - Username (min 3 characters)
   - Email address
   - Password (min 6 characters)

4. Click **"Register"**

5. You'll be automatically logged in and redirected to the dashboard

---

## Access URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:5170 | Main application UI |
| **Backend API** | http://localhost:5015 | REST API endpoints |
| **MongoDB** | localhost:27017 | Database connection |

---

## Database Structure

### Collections (Auto-created)

The application uses the `bookmarking-app` database with these collections:

| Collection | Description |
|-----------|-------------|
| `users` | User accounts and authentication |
| `bookmarks` | Bookmark entries with metadata |
| `folders` | Folder hierarchy for organization |
| `bookmarkextensions` | Browser extension data |

### Data Persistence

- **Location:** `~/mongodb` on your host system
- **Docker Volume:** `/data/db` inside container
- **Survives:** Container restarts, deletions, WSL reinstallation

---

## Backup System

### Automatic Backups

The app automatically creates backups before every write operation:
- Location: `./backups/auto/`
- Keeps: 5 most recent backups
- Format: Human-readable JSON

### Manual Backups

```bash
# Create a full backup
node admin-scripts/backup-database.js

# Advanced backup with offsite storage
node admin-scripts/robust-backup-improved.js
```

### Scheduled Backups

Add to crontab for daily backups at 2 AM:
```bash
crontab -e
```

```
0 2 * * * cd /mnt/g/www/bookmarks-manager && node admin-scripts/backup-database.js >> /tmp/bookmark-backup.log 2>&1
```

---

## Troubleshooting

### MongoDB Connection Error

**Problem:** `MongooseServerSelectionError: connect ECONNREFUSED`

**Solution:**
```bash
# Check if MongoDB container is running
docker ps | grep mongodb-container

# If not running, start it
./start-mongo.sh

# Or restart existing container
docker restart mongodb-container
```

### Port Already in Use

**Problem:** `Error: listen EADDRINUSE: address already in use :::5015`

**Solution:**
```bash
# Find and kill process using the port
lsof -ti:5015 | xargs kill -9
lsof -ti:5170 | xargs kill -9

# Restart the application
npm run dev:full
```

### Permission Denied for Docker

**Problem:** `Got permission denied while trying to connect to the Docker daemon socket`

**Solution:**
```bash
# Add your user to the docker group
sudo usermod -aG docker $USER

# Log out and log back in, or run:
newgrp docker
```

### Frontend Not Loading

**Problem:** Blank page or loading spinner

**Solution:**
```bash
# Clear browser cache
# Or try incognito/private window

# Check frontend is running
curl http://localhost:5170

# Restart frontend
pkill -f vite
npm run dev
```

### Auto-Backup Not Working

**Problem:** No backups in `./backups/auto/`

**Solution:**
```bash
# Check directory exists
ls -la ./backups/auto/

# Create if missing
mkdir -p ./backups/auto

# Check server logs for errors
tail -f /tmp/bookmark-backup.log
```

---

## Next Steps

After installation:

1. ✅ **Create your user account** at http://localhost:5170
2. ✅ **Add your first bookmark** using the "+" button
3. ✅ **Create folders** to organize bookmarks
4. ✅ **Add tags** for easy searching
5. ✅ **Install browser extension** (optional) from `extension/` folder
6. ✅ **Set up bookmarklet** for quick bookmarking
7. ✅ **Install as PWA** on mobile — open in Android Chrome → Install app → share web pages directly

---

## Additional Resources

- **Changelog:** See `CHANGELOG.md` for version history and recent fixes
- **Documentation:** See `documentation/` folder for detailed guides
- **API Endpoints:** See `documentation/dataSources.md`
- **Backup Strategy:** See `documentation/AUTO-BACKUP-SYSTEM.md`
- **Browser Extension:** See `extension/README.md`

---

## Support

For issues or questions:
- Check existing documentation in `documentation/` folder
- Review troubleshooting section above
- Check server logs for error messages

---

**Happy Bookmarking!** 🎉
