import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Bookmark from './models/Bookmark.js';
import Folder from './models/Folder.js';
import { readFileSync } from 'fs';

// Load environment variables
dotenv.config();

async function restoreBookmarksFromBackup() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Read the backup data

    // Read users from backup
    const backupUsers = JSON.parse(readFileSync('./backups/backup_2026-02-05_20-26-24/backup_2026-02-05_20-26-24/json/users.json', 'utf8'));
    // Read bookmarks from backup
    const backupBookmarks = JSON.parse(readFileSync('./backups/backup_2026-02-05_20-26-24/backup_2026-02-05_20-26-24/json/bookmarks.json', 'utf8'));
    // Read directories from backup
    const backupDirectories = JSON.parse(readFileSync('./backups/backup_2026-02-05_20-26-24/backup_2026-02-05_20-26-24/json/folders.json', 'utf8')); // Note: renamed from directories to folders

    // Find the user in the current database
    const currentUser = await User.findOne({ email: 'skylabel@gmx.com' });
    if (!currentUser) {
      console.log('User skylabel@gmx.com not found in current database');
      return;
    }

    // Find the corresponding user in the backup
    const backupUser = backupUsers.find(user => user.email === 'skylabel@gmx.com');
    if (!backupUser) {
      console.log('User skylabel@gmx.com not found in backup');
      return;
    }

    console.log(`Restoring bookmarks for user: ${currentUser.email}`);
    console.log(`Backup user ID: ${backupUser._id}, Current user ID: ${currentUser._id}`);

    // Get existing bookmarks for this user to avoid duplicates
    const existingBookmarks = await Bookmark.find({ owner: currentUser._id });
    console.log(`Found ${existingBookmarks.length} existing bookmarks for user`);

    // Prepare bookmarks for insertion
    const bookmarksToInsert = [];
    let duplicateCount = 0;

    for (const bookmark of backupBookmarks) {
      // Skip if this is a system bookmark (belongs to system user)
      if (bookmark.owner === '6845ba6677f8151b7f8c12a0') {
        continue;
      }

      // Check if a bookmark with the same URL already exists for this user
      const exists = existingBookmarks.some(b => b.url === bookmark.url);
      if (!exists) {
        // Create a new bookmark object with the current user ID
        const newBookmark = {
          url: bookmark.url,
          title: bookmark.title,
          description: bookmark.description || '',
          tags: bookmark.tags || [],
          favicon: bookmark.favicon || '',
          owner: currentUser._id, // Use the current user ID, not the backup one
          visibility: bookmark.visibility || 'private',
          createdAt: bookmark.createdAt || new Date(),
          updatedAt: bookmark.updatedAt || new Date()
        };

        // Handle folder/directory mapping if present in the backup
        if (bookmark.directory) {
          // Find the corresponding directory in the backup
          const backupDir = backupDirectories.find(dir => dir._id === bookmark.directory);
          if (backupDir && backupDir.owner === backupUser._id) {
            // We need to handle folder restoration separately
            // For now, we'll skip the folder assignment to avoid complications
            console.log(`Bookmark "${bookmark.title}" was in directory "${backupDir.name}", but we'll skip folder assignment for now`);
          }
        }

        bookmarksToInsert.push(newBookmark);
      } else {
        duplicateCount++;
      }
    }

    console.log(`Found ${bookmarksToInsert.length} bookmarks to restore (skipping ${duplicateCount} duplicates)`);

    if (bookmarksToInsert.length > 0) {
      // Insert the bookmarks
      const result = await Bookmark.insertMany(bookmarksToInsert);
      console.log(`Successfully restored ${result.length} bookmarks`);
    } else {
      console.log('No new bookmarks to restore');
    }

    // Also try to restore any directories/folders that belong to the user
    console.log('\nChecking for directories to restore...');
    const backupUserDirs = backupDirectories.filter(dir => 
      dir.owner === backupUser._id && 
      dir._id !== '687a93f6e3619b496e451d3f' && // Skip root
      dir._id !== '687a93f6e3619b496e451d41'    // Skip imported
    );

    if (backupUserDirs.length > 0) {
      console.log(`Found ${backupUserDirs.length} directories to potentially restore`);
      
      // Check existing folders in current database for this user
      const existingFolders = await Folder.find({ owner: currentUser._id });
      console.log(`Current database has ${existingFolders.length} existing folders for user`);
      
      // Prepare folders for insertion
      const foldersToInsert = [];
      for (const dir of backupUserDirs) {
        // Check if a folder with the same name already exists
        const exists = existingFolders.some(f => f.name === dir.name);
        if (!exists) {
          const newFolder = {
            name: dir.name,
            description: dir.description || '',
            owner: currentUser._id,
            createdAt: dir.createdAt || new Date(),
            updatedAt: dir.updatedAt || new Date()
          };
          
          // Don't set parent folder for now to avoid complexity with ID mapping
          foldersToInsert.push(newFolder);
        }
      }
      
      if (foldersToInsert.length > 0) {
        const folderResult = await Folder.insertMany(foldersToInsert);
        console.log(`Successfully restored ${folderResult.length} folders`);
      } else {
        console.log('No new folders to restore');
      }
    }

    console.log('\nRestore process completed!');
  } catch (error) {
    console.error('Error restoring bookmarks:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run the function
restoreBookmarksFromBackup();