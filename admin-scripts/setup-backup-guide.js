import fs from 'fs';
import path from 'path';

// Create a backup setup script that guides the user through the process
const setupBackupInstructions = () => {
  const instructions = `
# Bookmark Manager Automated Backup Setup

## Overview
This backup strategy ensures your bookmarks survive WSL reinstallation by backing up to the Windows host filesystem.

## Current Backup Script Location
- Script: /mnt/g/www/bookmarks/admin-scripts/robust-backup.js
- This script backs up to: /mnt/c/Users/$USER/Documents/BookmarkManagerBackups

## Manual Backup
Run this command to create a manual backup:
\`\`\`
cd /mnt/g/www/bookmarks && node admin-scripts/robust-backup.js
\`\`\`

## Automated Backup Setup (Recommended)

### Option 1: Using Cron (Linux scheduler)
1. Open your crontab:
   \`\`\`
   crontab -e
   \`\`\`

2. Add one of these lines to schedule automatic backups:

   Daily at 2 AM:
   \`\`\`
   0 2 * * * cd /mnt/g/www/bookmarks && /usr/bin/node admin-scripts/robust-backup.js >> /tmp/bookmark-backup.log 2>&1
   \`\`\`

   Weekly on Sundays at 3 AM:
   \`\`\`
   0 3 * * 0 cd /mnt/g/www/bookmarks && /usr/bin/node admin-scripts/robust-backup.js >> /tmp/bookmark-backup.log 2>&1
   \`\`\`

   Every 6 hours:
   \`\`\`
   0 */6 * * * cd /mnt/g/www/bookmarks && /usr/bin/node admin-scripts/robust-backup.js >> /tmp/bookmark-backup.log 2>&1
   \`\`\`

### Option 2: Using a systemd timer (alternative to cron)
1. Create a service file:
   \`\`\`
   sudo nano /etc/systemd/system/bookmark-backup.service
   \`\`\`

   Contents:
   \`\`\`
   [Unit]
   Description=Bookmark Manager Backup Service

   [Service]
   Type=oneshot
   ExecStart=/usr/bin/node /mnt/g/www/bookmarks/admin-scripts/robust-backup.js
   WorkingDirectory=/mnt/g/www/bookmarks
   \`\`\`

2. Create a timer file:
   \`\`\`
   sudo nano /etc/systemd/system/bookmark-backup.timer
   \`\`\`

   Contents:
   \`\`\`
   [Unit]
   Description=Run Bookmark Manager Backup Daily
   Requires=bookmark-backup.service

   [Timer]
   OnCalendar=daily
   Persistent=true

   [Install]
   WantedBy=timers.target
   \`\`\`

3. Enable and start the timer:
   \`\`\`
   sudo systemctl enable bookmark-backup.timer
   sudo systemctl start bookmark-backup.timer
   \`\`\`

## Backup Locations
1. **Primary (Survives WSL reinstallation)**: 
   - Path: \`/mnt/c/Users/\${USER}/Documents/BookmarkManagerBackups/\`
   - This maps to: \`C:\\\\Users\\\\[YourWindowsUsername]\\\\Documents\\\\BookmarkManagerBackups\\\\\` on Windows
   - Backups are stored here in ZIP format

2. **Secondary (Local)**:
   - Path: \`/mnt/g/www/bookmarks/backups/\`
   - Also in ZIP format

## Backup Contents
Each backup contains:
- JSON exports of all collections (users, bookmarks, folders)
- Metadata with statistics and timestamps
- ZIP archive for easy transport

## Recovery Process
If you need to recover:
1. Install WSL and clone the bookmark manager project
2. Start MongoDB
3. Run: \`node restore-bookmarks.js\` (using your backup files)
4. Your data will be restored

## Verification
To verify backups are working:
1. Run the backup manually: \`node admin-scripts/robust-backup.js\`
2. Check Windows Documents folder for new backup files
3. Verify the backup contains your data

## Troubleshooting
- If Windows path doesn't exist, manually create the folder in Windows Explorer
- Check logs: \`tail -f /tmp/bookmark-backup.log\` during backup
- Ensure MongoDB is running before backup: \`npm run start\` or start Docker container
`;

  // Write the instructions to a file
  const outputPath = path.join(process.cwd(), 'BACKUP_SETUP_INSTRUCTIONS.md');
  fs.writeFileSync(outputPath, instructions);
  
  console.log('✅ Backup setup instructions created:');
  console.log(`📄 ${outputPath}`);
  console.log('\n💡 Please follow the instructions in the file to set up automated backups.');
};

// Run the setup
setupBackupInstructions();