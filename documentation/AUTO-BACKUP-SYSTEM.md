# Auto-Backup System for Bookmark Manager

## Overview

The Bookmark Manager now has an **automatic backup system** that creates a backup before every write operation (create, update, delete) to protect against accidental data loss.

## How It Works

### Automatic Backups

Before **every** write operation, the system automatically creates a backup of your entire database:

| Operation | Auto-Backup Triggered |
|-----------|----------------------|
| Create bookmark | ✅ Yes |
| Update bookmark | ✅ Yes |
| Delete bookmark | ✅ Yes |
| Bulk edit bookmarks | ✅ Yes |
| Bulk delete bookmarks | ✅ Yes |
| Bulk tag operations | ✅ Yes |
| Bulk visibility changes | ✅ Yes |
| Bulk share | ✅ Yes |
| Move bookmarks to folder | ✅ Yes |
| Create folder | ✅ Yes |
| Update folder | ✅ Yes |
| Delete folder | ✅ Yes |
| Rename tag | ✅ Yes |
| Delete tag | ✅ Yes |
| Share bookmark | ✅ Yes |

### Backup Location

Auto-backups are stored in:
```
/mnt/g/www/bookmarks-manager/backups/auto/
```

Each backup is a timestamped folder containing JSON files:
```
backups/auto/
├── auto-backup_2026-03-11T17-46-08-657Z/
│   ├── bookmarks.json
│   ├── folders.json
│   ├── users.json
│   └── bookmarkextensions.json
├── auto-backup_2026-03-11T17-46-41-310Z/
│   └── ...
└── ...
```

### Backup Retention

- **Maximum auto-backups kept**: 5 most recent
- **Automatic cleanup**: Old backups are deleted when limit is exceeded
- **Storage efficient**: Only JSON format (no mongodump) for speed

## Manual Backups

For scheduled/ manual backups, use the existing backup scripts:

### Run Manual Backup
```bash
cd /mnt/g/www/bookmarks-manager
node admin-scripts/backup-database.js
```

This creates a full backup with:
- mongodump format (binary)
- JSON format (human-readable)
- Metadata and statistics

### Scheduled Backups (Cron)

Add to your crontab for automated scheduled backups:

```bash
crontab -e
```

**Daily at 2 AM:**
```
0 2 * * * cd /mnt/g/www/bookmarks-manager && node admin-scripts/backup-database.js >> /tmp/bookmark-backup.log 2>&1
```

**Weekly on Sundays at 3 AM:**
```
0 3 * * 0 cd /mnt/g/www/bookmarks-manager && node admin-scripts/backup-database.js >> /tmp/bookmark-backup.log 2>&1
```

## Recovery from Auto-Backup

### Manual Recovery

1. **Stop the server**
   ```bash
   pkill -f "node.*server.js"
   ```

2. **Navigate to backup folder**
   ```bash
   cd /mnt/g/www/bookmarks-manager/backups/auto/
   ls -la  # Find the backup you want to restore
   ```

3. **Restore using mongorestore**
   ```bash
   cd auto-backup_YYYY-MM-DDTHH-MM-SS
   mongorestore --db bookmarking-app --drop bookmarks.json
   ```

   Or use the JSON files directly with a custom restore script.

### Using Existing Backup System

The project also has comprehensive backup scripts at:
- `admin-scripts/backup-database.js` - Basic backup
- `admin-scripts/robust-backup-improved.js` - Advanced backup with Windows host backup
- `admin-scripts/run-backup.sh` - Shell script wrapper

## Implementation Details

### Modified Files

The auto-backup feature was added to these route files:

1. **`routes/bookmarks.js`**
   - Added `createQuickBackup()` function
   - Added backup call before all write operations

2. **`routes/folders.js`**
   - Added `createQuickBackup()` function
   - Added backup call before create/update/delete

3. **`routes/tags.js`**
   - Added `createQuickBackup()` function
   - Added backup call before rename/delete operations

### Backup Function

```javascript
const createQuickBackup = async () => {
  // Creates timestamped backup folder
  // Exports all collections to JSON
  // Cleans up old backups (keeps 5 most recent)
  // Never blocks operation if it fails
}
```

### Key Features

- ✅ **Non-blocking**: If backup fails, the write operation still succeeds
- ✅ **Fast**: Only JSON export, no mongodump dependency
- ✅ **Automatic cleanup**: Maintains only 5 most recent backups
- ✅ **Complete**: Backs up all collections (bookmarks, folders, users, tags)
- ✅ **Human-readable**: JSON format can be inspected manually

## Monitoring Backups

### Check Recent Backups
```bash
ls -la /mnt/g/www/bookmarks-manager/backups/auto/
```

### View Backup Contents
```bash
cat /mnt/g/www/bookmarks-manager/backups/auto/auto-backup_*/bookmarks.json | head -50
```

### Check Server Logs
Auto-backup messages appear in the server console:
```
💾 Auto-backup created: ./backups/auto/auto-backup_2026-03-11T17-46-08-657Z
```

## Best Practices

1. **Regular Manual Backups**: Auto-backups are great for recent changes, but also run full backups daily/weekly
2. **Offsite Storage**: Periodically copy backups to cloud storage or external drive
3. **Test Restores**: Occasionally test restoring from backup to ensure it works
4. **Monitor Disk Space**: Check that backup directory isn't growing too large
5. **Keep Multiple Generations**: The existing `robust-backup-improved.js` keeps 10 full backups

## Troubleshooting

### Auto-backup Not Creating

1. Check server logs for error messages
2. Verify `./backups/auto` directory exists and is writable
3. Ensure MongoDB connection is active

### Too Many Backups

The system automatically keeps only 5, but if this isn't working:
```bash
# Manual cleanup
cd /mnt/g/www/bookmarks-manager/backups/auto/
ls -t | tail -n +6 | xargs rm -rf  # Keep only 5 newest
```

### Restore Not Working

1. Verify backup JSON files contain valid data
2. Check MongoDB is running
3. Use mongorestore or write a custom restore script

---

## Summary

Your bookmarks are now protected with:
- ✅ **Auto-backups** before every write operation (keeps 5 most recent)
- ✅ **Manual backup script** for on-demand full backups
- ✅ **Scheduled backups** via cron (daily/weekly)
- ✅ **Multiple backup locations** (local + optional Windows host)
- ✅ **Human-readable JSON format** for easy inspection

**Your data is safe!** 🎉
