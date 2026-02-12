# Bookmark Manager - Backup Strategy Documentation

## Overview
This document outlines the backup strategy for the Bookmark Manager application to ensure data persistence even in case of WSL reinstallation or corruption.

## Current Situation
- The MongoDB database runs in a Docker container within WSL
- Docker volumes are stored within the WSL filesystem
- WSL reinstallation or corruption would result in data loss
- A robust backup strategy is essential for data preservation

## Backup Solution: Robust Backup Script

### Features
- **Dual Backup Locations**: Creates backups both locally and on Windows host filesystem
- **Human-Readable Format**: Exports data as JSON files for easy inspection
- **Compressed Archives**: Creates .tar.gz archives for efficient storage
- **Metadata**: Includes backup statistics and information
- **Automatic Cleanup**: Maintains only the 10 most recent backups
- **Cross-Platform Compatibility**: Works with both WSL and traditional Linux environments

### Backup Script
- **Location**: `/mnt/g/www/bookmarks/admin-scripts/robust-backup-improved.js`
- **Functionality**: 
  - Exports all collections (users, bookmarks, folders) to JSON
  - Creates metadata with statistics
  - Generates compressed archives
  - Cleans up old backups

## Setting Up Windows Backup Location

Due to WSL permission restrictions, the Windows backup directory must be created manually:

### Step 1: Create Windows Backup Directory
1. Open Windows File Explorer
2. Navigate to `C:\Users\[YourUsername]\Documents\`
3. Create a new folder named `BookmarkManagerBackups`
4. Alternatively, you can create it on Desktop or OneDrive Documents

### Step 2: Verify WSL Access
After creating the directory in Windows, verify WSL can access it:
```bash
ls /mnt/c/Users/[YourUsername]/Documents/BookmarkManagerBackups
```

## Running Backups

### Manual Backup
```bash
cd /mnt/g/www/bookmarks
node admin-scripts/robust-backup-improved.js
```

### Automated Backup with Cron
1. Open your crontab:
```bash
crontab -e
```

2. Add one of these lines for automatic scheduling:

Daily at 2 AM:
```
0 2 * * * cd /mnt/g/www/bookmarks && /usr/bin/node admin-scripts/robust-backup-improved.js >> /tmp/bookmark-backup.log 2>&1
```

Weekly on Sundays at 3 AM:
```
0 3 * * 0 cd /mnt/g/www/bookmarks && /usr/bin/node admin-scripts/robust-backup-improved.js >> /tmp/bookmark-backup.log 2>&1
```

Every 6 hours:
```
0 */6 * * * cd /mnt/g/www/bookmarks && /usr/bin/node admin-scripts/robust-backup-improved.js >> /tmp/bookmark-backup.log 2>&1
```

## Backup Locations

### Primary (Survives WSL Reinstallation):
- **WSL Path**: `/mnt/c/Users/[YourUsername]/Documents/BookmarkManagerBackups/`
- **Windows Path**: `C:\Users\[YourUsername]\Documents\BookmarkManagerBackups\`
- **Format**: Both individual JSON files and compressed .tar.gz archives

### Secondary (Local):
- **Path**: `/mnt/g/www/bookmarks/backups/`
- **Format**: Both individual JSON files and compressed .tar.gz archives

## Backup Contents
Each backup includes:
- `json/users.json` - User accounts
- `json/bookmarks.json` - All bookmark entries
- `json/folders.json` - Folder organization
- `json/bookmarkextensions.json` - Extension data
- `backup-metadata.json` - Statistics and information
- `backup-summary.txt` - Human-readable summary
- `[backup-name].tar.gz` - Compressed archive of the entire backup

## Recovery Process

### In Case of Data Loss:
1. Reinstall WSL and clone the Bookmark Manager project
2. Start MongoDB service
3. Locate your most recent backup files
4. Use the restore script:
```bash
node restore-bookmarks.js
```

### Manual Recovery Steps:
1. Stop the application
2. Connect to MongoDB
3. Clear existing data if needed
4. Import the JSON files using mongoimport or a custom script
5. Restart the application

## Verification

### Checking Backup Status:
```bash
# View recent backups
ls -la backups/

# Check Windows backups (after manual setup)
ls -la /mnt/c/Users/[YourUsername]/Documents/BookmarkManagerBackups/

# Check backup logs
tail -f /tmp/bookmark-backup.log
```

### Verifying Backup Integrity:
1. Check that JSON files contain expected data
2. Verify the number of documents matches expectations
3. Ensure metadata reflects correct counts

## Troubleshooting

### Common Issues:

1. **Permission Denied for Windows Directory**:
   - Manually create the directory in Windows first
   - Ensure the directory path is correct

2. **Missing zip/tar Commands**:
   - The script now uses tar by default (available on most systems)
   - Install zip if preferred: `sudo apt-get install zip`

3. **MongoDB Connection Issues**:
   - Ensure MongoDB is running: `npm run start` or start Docker container
   - Verify MONGODB_URI in .env file

4. **Cron Job Failures**:
   - Check environment variables are available to cron
   - Add full paths to executables in cron jobs
   - Monitor logs: `tail -f /tmp/bookmark-backup.log`

## Best Practices

1. **Regular Monitoring**: Check backup logs periodically
2. **Offsite Storage**: Consider copying backups to cloud storage
3. **Test Restores**: Periodically test the restore process
4. **Multiple Locations**: Maintain copies in multiple locations
5. **Alerting**: Set up notifications for backup failures

## Maintenance

- The script automatically cleans up old backups (keeps 10 most recent)
- Monitor disk space usage regularly
- Update backup frequency based on usage patterns
- Review backup contents periodically to ensure completeness

## Moving MongoDB Data to Persistent Storage

To ensure your MongoDB data survives WSL reinstallation, you can move the data directory to a dedicated drive like D: which is separate from the system drives:

### Step 1: Create Persistent Directory on D: Drive
```bash
mkdir /mnt/d/backups
mkdir /mnt/d/backups/mongodb-data
```

### Step 2: Stop Current MongoDB Container
```bash
docker stop mongodb-container
docker rm mongodb-container
```

### Step 3: Copy Existing Data
```bash
cp -r /home/ceo/mongodb/* /mnt/d/backups/mongodb-data/
```

### Step 4: Start MongoDB with Persistent Storage
```bash
docker run -d \
  --name mongodb-container \
  -v /mnt/d/backups/mongodb-data:/data/db \
  -p 27017:27017 \
  --restart unless-stopped \
  mongo:latest
```

### Automated Script
A script has been created at `/mnt/g/www/bookmarks/start-mongo-persistent.sh` that performs all these steps automatically. To use it:

1. Make it executable: `sudo chmod +x /mnt/g/www/bookmarks/start-mongo-persistent.sh`
2. Run it: `bash /mnt/g/www/bookmarks/start-mongo-persistent.sh`

### Benefits of D: Drive Approach
- Dedicated storage location separate from system drives
- Better organization for backups and persistent data
- Survives WSL reinstallation
- Easy to locate and manage
- Can be backed up separately to external drives

## Emergency Recovery Contact Information

In case of catastrophic failure:
1. Check the backup directories mentioned above
2. Look for the most recent .tar.gz archive
3. Use the restore process documented above
4. If using persistent storage, your MongoDB data will be in `D:\backups\mongodb-data\`
5. Contact system administrator if needed

---

**Note**: This backup strategy ensures your bookmarks survive WSL reinstallation. The Windows backup location is the most reliable for disaster recovery scenarios.