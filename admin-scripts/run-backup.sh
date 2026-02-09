#!/bin/bash
# Wrapper script for running the robust backup
# This script can be called by cron

# Change to the project directory
cd /mnt/g/www/bookmarks

# Run the robust backup script
/usr/bin/node admin-scripts/robust-backup.js >> /tmp/bookmark-backup.log 2>&1

# Optionally, you could add notifications here
echo "$(date): Backup completed" >> /tmp/bookmark-backup.log