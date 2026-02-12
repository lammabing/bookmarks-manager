#!/bin/bash
# cleanup-old-backups.sh
# Script to remove redundant, old and irrelevant backups

echo "🔍 Analyzing backup directories..."

# Define backup directory
BACKUP_DIR="/mnt/g/www/bookmarks/backups"
cd "$BACKUP_DIR" || exit 1

echo "📦 Current backups:"
ls -la

echo ""
echo "🗑️  Removing redundant backups..."

# Keep only the most recent backup directories (not archives)
# Get all backup directories (those starting with backup_YYYY-MM-DD)
backup_dirs=($(ls -1d backup_* 2>/dev/null | sort))

echo "Found ${#backup_dirs[@]} backup directories"

if [ ${#backup_dirs[@]} -gt 2 ]; then
    # Keep the 2 most recent directories, remove older ones
    dirs_to_remove=("${backup_dirs[@]:0:$((${#backup_dirs[@]}-2))}")
    
    echo "Keeping the 2 most recent backup directories:"
    for i in $(seq $((${#backup_dirs[@]}-2)) $((${#backup_dirs[@]}-1))); do
        echo "  ✓ ${backup_dirs[$i]}"
    done
    
    echo "Removing older backup directories:"
    for dir in "${dirs_to_remove[@]}"; do
        echo "  - $dir"
        rm -rf "$dir"
    done
else
    echo "Less than 3 backup directories found, keeping all."
fi

# Remove tar.gz archives except the most recent one
archives=($(ls -1 *.tar.gz 2>/dev/null | sort))
echo ""
echo "Found ${#archives[@]} archive files"

if [ ${#archives[@]} -gt 1 ]; then
    # Keep only the most recent archive, remove others
    archives_to_remove=("${archives[@]:0:$((${#archives[@]}-1))}")
    
    echo "Keeping the most recent archive:"
    echo "  ✓ ${archives[-1]}"
    
    echo "Removing older archives:"
    for archive in "${archives_to_remove[@]}"; do
        echo "  - $archive"
        rm -f "$archive"
    done
elif [ ${#archives[@]} -eq 1 ]; then
    echo "Only one archive found, keeping it."
else
    echo "No archives found."
fi

# Also clean up the Windows backup location
WIN_BACKUP_DIR="/mnt/d/backups/BookmarkManagerBackups"
if [ -d "$WIN_BACKUP_DIR" ]; then
    echo ""
    echo "🧹 Cleaning up Windows backup location: $WIN_BACKUP_DIR"
    cd "$WIN_BACKUP_DIR" || exit 1
    
    win_backup_dirs=($(ls -1d backup_* 2>/dev/null | sort))
    echo "Found ${#win_backup_dirs[@]} backup directories in Windows location"
    
    if [ ${#win_backup_dirs[@]} -gt 2 ]; then
        # Keep the 2 most recent, remove older ones
        win_dirs_to_remove=("${win_backup_dirs[@]:0:$((${#win_backup_dirs[@]}-2))}")
        
        echo "Keeping the 2 most recent backup directories:"
        for i in $(seq $((${#win_backup_dirs[@]}-2)) $((${#win_backup_dirs[@]}-1))); do
            echo "  ✓ ${win_backup_dirs[$i]}"
        done
        
        echo "Removing older backup directories:"
        for dir in "${win_dirs_to_remove[@]}"; do
            echo "  - $dir"
            rm -rf "$dir"
        done
    fi
    
    # Clean up Windows archives too
    win_archives=($(ls -1 *.tar.gz 2>/dev/null | sort))
    if [ ${#win_archives[@]} -gt 1 ]; then
        win_archives_to_remove=("${win_archives[@]:0:$((${#win_archives[@]}-1))}")
        echo "Removing older archives from Windows location:"
        for archive in "${win_archives_to_remove[@]}"; do
            echo "  - $archive"
            rm -f "$archive"
        done
    fi
fi

echo ""
echo "✅ Cleanup completed!"
echo "📊 Remaining backups in local directory:"
ls -la backup_* 2>/dev/null || echo "  No backup directories remaining"
echo "📊 Remaining archives in local directory:"
ls -la *.tar.gz 2>/dev/null || echo "  No archives remaining"