#!/bin/bash
# cleanup-all-old-backups.sh
# Script to remove all old and redundant backups, keeping only the most recent

echo "🔍 Comprehensive backup cleanup..."

# Define backup directory
BACKUP_DIR="/mnt/g/www/bookmarks/backups"
cd "$BACKUP_DIR" || exit 1

echo "📦 Current local backups:"
ls -la

# Remove ALL backup directories except the most recent one
backup_dirs=($(ls -1d backup_* 2>/dev/null | sort -r)) # Sort in reverse order (newest first)

if [ ${#backup_dirs[@]} -gt 1 ]; then
    # Keep only the most recent directory, remove all others
    for ((i=1; i<${#backup_dirs[@]}; i++)); do
        dir="${backup_dirs[$i]}"
        if [[ -d "$dir" ]]; then
            echo "🗑️  Removing old backup directory: $dir"
            rm -rf "$dir"
        fi
    done
fi

# Remove ALL archive files except the most recent one
archives=($(ls -1 *.tar.gz 2>/dev/null | sort -r)) # Sort in reverse order (newest first)

if [ ${#archives[@]} -gt 1 ]; then
    # Keep only the most recent archive, remove all others
    for ((i=1; i<${#archives[@]}; i++)); do
        archive="${archives[$i]}"
        echo "🗑️  Removing old archive: $archive"
        rm -f "$archive"
    done
elif [ ${#archives[@]} -eq 0 ]; then
    # If no archives exist but we have a directory, create an archive of the most recent
    if [ ${#backup_dirs[@]} -gt 0 ]; then
        latest_dir="${backup_dirs[0]}"
        if [[ -d "$latest_dir" ]]; then
            echo "📦 Creating archive for the remaining backup: ${latest_dir}"
            tar -czf "${latest_dir}.tar.gz" "$latest_dir"
        fi
    fi
fi

# Clean up Windows backup location too
WIN_BACKUP_DIR="/mnt/d/backups/BookmarkManagerBackups"
if [ -d "$WIN_BACKUP_DIR" ]; then
    echo ""
    echo "🧹 Cleaning up Windows backup location: $WIN_BACKUP_DIR"
    cd "$WIN_BACKUP_DIR" || exit 1
    
    win_backup_dirs=($(ls -1d backup_* 2>/dev/null | sort -r))
    
    if [ ${#win_backup_dirs[@]} -gt 1 ]; then
        # Keep only the most recent directory, remove all others
        for ((i=1; i<${#win_backup_dirs[@]}; i++)); do
            dir="${win_backup_dirs[$i]}"
            if [[ -d "$dir" ]]; then
                echo "🗑️  Removing old Windows backup directory: $dir"
                rm -rf "$dir"
            fi
        done
    fi
    
    # Clean up Windows archives too
    win_archives=($(ls -1 *.tar.gz 2>/dev/null | sort -r))
    
    if [ ${#win_archives[@]} -gt 1 ]; then
        # Keep only the most recent archive, remove all others
        for ((i=1; i<${#win_archives[@]}; i++)); do
            archive="${win_archives[$i]}"
            echo "🗑️  Removing old Windows archive: $archive"
            rm -f "$archive"
        done
    elif [ ${#win_archives[@]} -eq 0 ] && [ ${#win_backup_dirs[@]} -gt 0 ]; then
        # Create archive if none exists
        latest_win_dir="${win_backup_dirs[0]}"
        if [[ -d "$latest_win_dir" ]]; then
            echo "📦 Creating archive for Windows backup: ${latest_win_dir}"
            tar -czf "${latest_win_dir}.tar.gz" "$latest_win_dir"
        fi
    fi
fi

echo ""
echo "✅ Comprehensive cleanup completed!"
echo "📊 Remaining local backups:"
ls -la backup_* 2>/dev/null || echo "  No backup directories/archives remaining"
echo ""
echo "📊 Remaining Windows backups:"
ls -la /mnt/d/backups/BookmarkManagerBackups/ 2>/dev/null || echo "  Windows backup directory not found"