import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Bookmark from './models/Bookmark.js';
import Folder from './models/Folder.js';
import { readFileSync, readdirSync, existsSync, statSync } from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

const AUTO_BACKUP_DIR = './backups/auto';

// Auto-detect latest backup or use CLI argument
function getLatestBackup(customPath) {
  if (customPath) {
    return customPath;
  }

  if (!existsSync(AUTO_BACKUP_DIR)) {
    throw new Error(`Auto-backup directory not found: ${AUTO_BACKUP_DIR}`);
  }

  const backups = readdirSync(AUTO_BACKUP_DIR)
    .filter(name => name.startsWith('auto-backup_') && statSync(path.join(AUTO_BACKUP_DIR, name)).isDirectory())
    .sort()
    .reverse();

  if (backups.length === 0) {
    throw new Error('No backups found in ' + AUTO_BACKUP_DIR);
  }

  const latest = path.join(AUTO_BACKUP_DIR, backups[0]);
  console.log(`Auto-detected latest backup: ${latest}`);
  return latest;
}

async function restoreFromBackup() {
  try {
    const backupPath = getLatestBackup(process.argv[2]);

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Read backup data
    console.log(`\nReading backup from: ${backupPath}`);
    const backupUsers = JSON.parse(readFileSync(`${backupPath}/users.json`, 'utf8'));
    const backupBookmarks = JSON.parse(readFileSync(`${backupPath}/bookmarks.json`, 'utf8'));
    const backupFolders = JSON.parse(readFileSync(`${backupPath}/folders.json`, 'utf8'));

    console.log(`\nBackup contains:`);
    console.log(`  - ${backupUsers.length} users`);
    console.log(`  - ${backupBookmarks.length} bookmarks`);
    console.log(`  - ${backupFolders.length} folders`);

    // Safety confirmation
    console.log('\n⚠️  WARNING: This will DELETE all existing data and replace it with backup data.');
    console.log('   Press Ctrl+C within 5 seconds to cancel...\n');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Bookmark.deleteMany({});
    await Folder.deleteMany({});
    console.log('Existing data cleared');

    // Restore users
    console.log('\nRestoring users...');
    const usersToInsert = backupUsers.map(u => ({
      _id: u._id,
      username: u.username,
      email: u.email,
      password: u.password,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
      __v: u.__v || 0
    }));
    await User.insertMany(usersToInsert, { lean: false });
    console.log(`Restored ${usersToInsert.length} users`);

    // Restore folders
    console.log('\nRestoring folders...');
    const foldersToInsert = backupFolders.map(f => ({
      _id: f._id,
      name: f.name,
      description: f.description || '',
      owner: f.owner,
      parent: f.parent || null,
      isRoot: f.isRoot || false,
      order: f.order || 0,
      color: f.color || '#3B82F6',
      icon: f.icon || 'folder',
      bookmarkCount: f.bookmarkCount || 0,
      createdAt: f.createdAt,
      updatedAt: f.updatedAt,
      __v: f.__v || 0
    }));
    await Folder.insertMany(foldersToInsert, { lean: false });
    console.log(`Restored ${foldersToInsert.length} folders`);

    // Restore bookmarks
    console.log('\nRestoring bookmarks...');
    const bookmarksToInsert = backupBookmarks.map(b => ({
      _id: b._id,
      url: b.url,
      title: b.title,
      description: b.description || '',
      tags: b.tags || [],
      favicon: b.favicon || '',
      owner: b.owner,
      folder: b.folder || null,
      visibility: b.visibility || 'private',
      sharedWith: b.sharedWith || [],
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
      __v: b.__v || 0
    }));
    await Bookmark.insertMany(bookmarksToInsert, { lean: false });
    console.log(`Restored ${bookmarksToInsert.length} bookmarks`);

    console.log('\n========================================');
    console.log('RESTORE COMPLETED SUCCESSFULLY!');
    console.log('========================================');
    console.log(`Users: ${usersToInsert.length}`);
    console.log(`Folders: ${foldersToInsert.length}`);
    console.log(`Bookmarks: ${bookmarksToInsert.length}`);

  } catch (error) {
    console.error('Error restoring backup:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
  }
}

restoreFromBackup();
