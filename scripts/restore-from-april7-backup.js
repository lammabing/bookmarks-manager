import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Bookmark from '../models/Bookmark.js';
import Folder from '../models/Folder.js';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use the April 7, 2026 backup (most recent)
const BACKUP_DIR = '/mnt/g/www/bookmarks-manager/backups/auto/auto-backup_2026-04-07T06-41-53-563Z';

const restoreAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // Step 1: Reset admin password
    console.log('\n=== Step 1: Resetting admin password ===');
    const adminEmail = 'admin@example.com';
    const adminUser = await User.findOne({ email: adminEmail });

    if (!adminUser) {
      console.error('✗ Admin user not found!');
      process.exit(1);
    }

    const newPassword = 'h0ngk0ng';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Use findByIdAndUpdate to bypass pre-save hook
    await User.findByIdAndUpdate(adminUser._id, { password: hashedPassword });

    // Verify by fetching updated user
    const updatedUser = await User.findById(adminUser._id);
    const isMatch = await updatedUser.comparePassword(newPassword);
    console.log(`✓ Password reset for ${adminEmail}: ${isMatch ? 'VERIFIED ✓' : 'FAILED ✗'}`);
    console.log(`  User ID: ${adminUser._id}`);
    console.log(`  Username: ${adminUser.username}`);

    // Step 2: Load backup data
    console.log('\n=== Step 2: Loading backup data ===');
    const bookmarksData = fs.readFileSync(path.join(BACKUP_DIR, 'bookmarks.json'), 'utf8');
    const foldersData = fs.readFileSync(path.join(BACKUP_DIR, 'folders.json'), 'utf8');
    
    const backupBookmarks = JSON.parse(bookmarksData);
    const backupFolders = JSON.parse(foldersData);
    
    console.log(`✓ Loaded ${backupBookmarks.length} bookmarks and ${backupFolders.length} folders from backup`);
    console.log(`  Backup date: April 7, 2026`);

    // Step 3: Reassign bookmarks to admin user
    console.log('\n=== Step 3: Preparing bookmarks for restoration ===');
    
    // Clear existing bookmarks and folders for admin
    console.log('  Clearing current empty data...');
    const deleteResult1 = await Bookmark.deleteMany({ userId: adminUser._id });
    const deleteResult2 = await Folder.deleteMany({ userId: adminUser._id });
    console.log(`  Cleared ${deleteResult1.deletedCount} old bookmarks and ${deleteResult2.deletedCount} old folders`);

    // Map old user IDs to admin user ID
    const oldOwnerIds = [...new Set(backupBookmarks.map(b => b.owner))];
    console.log(`  Found ${oldOwnerIds.length} unique owner IDs in backup`);

    // Transform bookmarks
    const transformedBookmarks = backupBookmarks.map(bookmark => ({
      url: bookmark.url,
      title: bookmark.title,
      description: bookmark.description || '',
      tags: bookmark.tags || [],
      favicon: bookmark.favicon || '',
      owner: adminUser._id,
      folder: bookmark.folder || null,
      visibility: bookmark.visibility || 'private',
      sharedWith: bookmark.sharedWith || [],
      createdAt: bookmark.createdAt || new Date(),
      updatedAt: bookmark.updatedAt || new Date()
    }));

    // Insert bookmarks in batches to avoid hitting MongoDB limits
    const batchSize = 100;
    let insertedCount = 0;
    
    for (let i = 0; i < transformedBookmarks.length; i += batchSize) {
      const batch = transformedBookmarks.slice(i, i + batchSize);
      await Bookmark.insertMany(batch);
      insertedCount += batch.length;
      console.log(`  Inserted batch: ${insertedCount}/${transformedBookmarks.length}`);
    }
    
    console.log(`✓ Restored ${insertedCount} bookmarks to admin user`);

    // Step 4: Restore folders
    console.log('\n=== Step 4: Restoring folders ===');
    
    const transformedFolders = backupFolders.map(folder => ({
      name: folder.name,
      owner: adminUser._id,
      parent: folder.parentId || null,
      color: folder.color || '#3B82F6',
      icon: folder.icon || 'folder',
      order: folder.order || 0,
      isRoot: folder.isRoot || false,
      description: folder.description || '',
      bookmarkCount: 0,
      createdAt: folder.createdAt || new Date(),
      updatedAt: folder.updatedAt || new Date()
    }));

    const insertedFolders = await Folder.insertMany(transformedFolders);
    console.log(`✓ Restored ${insertedFolders.length} folders to admin user`);

    // Step 5: Update folder references in bookmarks
    console.log('\n=== Step 5: Updating folder references ===');
    
    // Create mapping from old folder IDs to new folder IDs
    const folderIdMap = {};
    backupFolders.forEach((oldFolder, index) => {
      if (oldFolder._id) {
        folderIdMap[oldFolder._id] = insertedFolders[index]._id.toString();
      }
    });
    
    console.log(`  Created folder ID mapping for ${Object.keys(folderIdMap).length} folders`);

    // Update bookmarks with new folder IDs
    let updatedCount = 0;
    const allBookmarks = await Bookmark.find({ owner: adminUser._id });
    
    for (const bookmark of allBookmarks) {
      if (bookmark.folder && folderIdMap[bookmark.folder.toString()]) {
        bookmark.folder = folderIdMap[bookmark.folder.toString()];
        await bookmark.save();
        updatedCount++;
      }
    }
    console.log(`✓ Updated ${updatedCount} bookmark folder references`);

    // Final summary
    console.log('\n========================================');
    console.log('✓ RESTORATION COMPLETE');
    console.log('========================================');
    console.log(`Admin Email: ${adminEmail}`);
    console.log(`Admin Username: ${adminUser.username}`);
    console.log(`Admin User ID: ${adminUser._id}`);
    console.log(`Password: ${newPassword}`);
    console.log(`Bookmarks Restored: ${insertedCount}`);
    console.log(`Folders Restored: ${insertedFolders.length}`);
    console.log('========================================\n');

  } catch (error) {
    console.error('✗ Error during restoration:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

restoreAdmin();
