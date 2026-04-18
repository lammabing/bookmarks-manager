#!/bin/bash
# Automated backup script for cron
# Adds itself to crontab for regular backups

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_BASE_DIR="$PROJECT_DIR/backups/auto"
NODE_PATH="/home/ceo/.nvm/versions/node/v20.20.0/bin/node"

# Create backup directory
mkdir -p "$BACKUP_BASE_DIR"

# Create backup
TIMESTAMP=$(date -u +"%Y-%m-%dT%H-%M-%S-%3NZ")
BACKUP_DIR="$BACKUP_BASE_DIR/auto-backup_$TIMESTAMP"

echo "[$(date)] Creating backup to $BACKUP_DIR"

# Export MongoDB data using Node.js script
$NODE_PATH "$PROJECT_DIR/admin-scripts/robust-backup.js" 2>&1 | tail -5

echo "[$(date)] Backup completed"

# Clean old backups (keep last 20)
cd "$BACKUP_BASE_DIR"
ls -dt */ 2>/dev/null | tail -n +21 | xargs -r rm -rf

echo "[$(date)] Old backups cleaned, kept 20 most recent"
echo "---"
