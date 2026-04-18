#!/bin/bash
# Daily automated backup script for cron
# Install with: crontab -e
# Add: 0 */6 * * * /mnt/g/www/bookmarks-manager/scripts/daily-backup.sh >> /tmp/bookmark-backup.log 2>&1

set -e

# Configuration
PROJECT_DIR="/mnt/g/www/bookmarks-manager"
NODE_PATH="/home/ceo/.nvm/versions/node/v20.20.0/bin/node"
LOG_FILE="/tmp/bookmark-backup.log"

echo "========================================"
echo "[$(date)] Starting bookmark backup..."
echo "========================================"

# Change to project directory
cd "$PROJECT_DIR"

# Run the robust backup script directly
"$NODE_PATH" admin-scripts/robust-backup.js

echo "[$(date)] Backup completed successfully."
echo ""

# Keep log file manageable (last 1000 lines)
if [ -f "$LOG_FILE" ]; then
    tail -n 1000 "$LOG_FILE" > "${LOG_FILE}.tmp" && mv "${LOG_FILE}.tmp" "$LOG_FILE"
fi
