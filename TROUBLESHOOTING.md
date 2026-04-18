# MongoDB Data Loss Prevention Guide

## ⚠️ Root Cause of Data Loss

Your MongoDB runs in a **Docker container** that depends on **Docker Desktop for Windows** being running. When Docker Desktop:
- Stops or crashes
- Is restarted
- Loses volume mount connections

...your MongoDB container may be recreated **without proper data persistence**, resulting in **complete data loss**.

## How to Prevent Data Loss

### 1. Always Check Docker Desktop Before Starting
```bash
# Verify Docker is running
docker info

# If you get an error, start Docker Desktop on Windows first
```

### 2. Start MongoDB with the Reliable Script
```bash
./start-mongo-reliable.sh
```

This script:
- Waits for Docker Desktop to be available
- Checks if container exists
- Starts or creates container with proper volume mounts
- Verifies MongoDB is ready

### 3. Use Docker Compose (Alternative)
```bash
docker-compose up -d
```

This is more reliable for volume management than raw `docker run` commands.

### 4. Verify Your Data is There
After starting MongoDB, verify your bookmarks:
```bash
# Quick check - should show your bookmark count
node --experimental-specifier-resolution=node -e "
import mongoose from 'mongoose';
import Bookmark from './models/Bookmark.js';
mongoose.connect('mongodb://localhost:27017/bookmarking-app').then(async () => {
  const count = await Bookmark.countDocuments();
  console.log('Bookmarks in database:', count);
  process.exit(0);
});
"
```

### 5. Restore from Backup if Needed
Backups are stored in: `backups/auto/`

To restore from the most recent backup:
```bash
node scripts/restore-from-april7-backup.js
```

Or use any backup in `backups/auto/` or `/tmp/bookmarks_backup/`

## Automated Backups

**Frequency**: Every 6 hours (at midnight, 6am, noon, 6pm)

**Location**: `backups/auto/`

**What's backed up**:
- All bookmarks
- All folders
- Users
- Bookmark extensions data

**Manual backup**:
```bash
node admin-scripts/robust-backup.js
```

## Troubleshooting

### "No bookmarks after login"
1. Check if Docker Desktop is running: `docker info`
2. Check MongoDB container: `docker ps | grep mongodb`
3. If container doesn't exist, restart: `./start-mongo-reliable.sh`
4. If data is gone, restore from backup

### "Docker not available" error
1. Start Docker Desktop on Windows
2. Wait 30-60 seconds for WSL integration
3. Run: `./start-mongo-reliable.sh`

### "Connection refused" on port 27017
MongoDB isn't running. Start it:
```bash
./start-mongo-reliable.sh
```

### Find Available Backups
```bash
# List all backups
ls -lt backups/auto/
ls -lt /tmp/bookmarks_backup/

# Check most recent backup
ls -lh backups/auto/$(ls -t backups/auto/ | head -1)/
```

## Quick Reference

| Command | Purpose |
|---------|---------|
| `./start-mongo-reliable.sh` | Start MongoDB safely |
| `docker info` | Check if Docker is running |
| `docker ps` | List running containers |
| `node admin-scripts/robust-backup.js` | Manual backup |
| `crontab -l` | Check automated backup schedule |

## Emergency Contacts

If you lose data again:
1. **Don't panic** - backups exist
2. Check `/tmp/bookmarks_backup/` and `backups/auto/`
3. Run restoration script
4. Check this guide for what went wrong
