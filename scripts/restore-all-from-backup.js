import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BACKUP_DIR = '/mnt/g/www/bookmarks-manager/backups/auto/auto-backup_2026-04-07T06-41-53-563Z';

const restoreAll = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // Load backup data
    console.log('\n=== Loading backup data ===');
    const usersData = JSON.parse(fs.readFileSync(path.join(BACKUP_DIR, 'users.json'), 'utf8'));
    const bookmarksData = JSON.parse(fs.readFileSync(path.join(BACKUP_DIR, 'bookmarks.json'), 'utf8'));
    const foldersData = JSON.parse(fs.readFileSync(path.join(BACKUP_DIR, 'folders.json'), 'utf8'));
    
    console.log(`✓ Loaded ${usersData.length} users, ${bookmarksData.length} bookmarks, ${foldersData.length} folders`);

    // Get or create admin user
    console.log('\n=== Setting up admin user ===');
    const { default: User } = await import('../models/User.js');
    const { default: Bookmark } = await import('../models/Bookmark.js');
    const { default: Folder } = await import('../models/Folder.js');

    let adminUser = await User.findOne({ email: 'admin@example.com' });
    
    if (!adminUser) {
      console.log('Creating admin user...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('h0ngk0ng', salt);
      
      adminUser = await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('✓ Admin user created');
    } else {
      console.log('✓ Admin user exists');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('h0ngk0ng', salt);
      adminUser.password = hashedPassword;
      await User.findByIdAndUpdate(adminUser._id, { password: hashedPassword });
      console.log('✓ Password reset to h0ngk0ng');
    }

    console.log(`  User ID: ${adminUser._id}`);

    // Restore bookmarks
    console.log('\n=== Restoring bookmarks ===');
    const transformedBookmarks = bookmarksData.map(b => ({
      url: b.url,
      title: b.title,
      description: b.description || '',
      tags: b.tags || [],
      favicon: b.favicon || '',
      owner: adminUser._id,
      folder: b.folder || null,
      visibility: b.visibility || 'private',
      sharedWith: b.sharedWith || [],
      createdAt: b.createdAt || new Date(),
      updatedAt: b.updatedAt || new Date()
    }));

    await Bookmark.deleteMany({ owner: adminUser._id });
    
    const batchSize = 100;
    for (let i = 0; i < transformedBookmarks.length; i += batchSize) {
      const batch = transformedBookmarks.slice(i, i + batchSize);
      await Bookmark.insertMany(batch);
      console.log(`  Inserted ${Math.min(i + batchSize, transformedBookmarks.length)}/${transformedBookmarks.length}`);
    }
    console.log(`✓ Restored ${transformedBookmarks.length} bookmarks`);

    // Restore folders
    console.log('\n=== Restoring folders ===');
    const transformedFolders = foldersData.map(f => ({
      name: f.name,
      owner: adminUser._id,
      parent: f.parentId || null,
      color: f.color || '#3B82F6',
      icon: f.icon || 'folder',
      order: f.order || 0,
      isRoot: f.isRoot || false,
      description: f.description || '',
      bookmarkCount: 0,
      createdAt: f.createdAt || new Date(),
      updatedAt: f.updatedAt || new Date()
    }));

    await Folder.deleteMany({ owner: adminUser._id });
    const insertedFolders = await Folder.insertMany(transformedFolders);
    console.log(`✓ Restored ${insertedFolders.length} folders`);

    // Update folder references
    console.log('\n=== Updating folder references ===');
    const folderIdMap = {};
    foldersData.forEach((oldFolder, index) => {
      if (oldFolder._id) {
        folderIdMap[oldFolder._id] = insertedFolders[index]._id.toString();
      }
    });

    let updatedCount = 0;
    const allBookmarks = await Bookmark.find({ owner: adminUser._id });
    for (const bookmark of allBookmarks) {
      if (bookmark.folder && folderIdMap[bookmark.folder.toString()]) {
        bookmark.folder = folderIdMap[bookmark.folder.toString()];
        await bookmark.save();
        updatedCount++;
      }
    }
    console.log(`✓ Updated ${updatedCount} folder references`);

    // Summary
    console.log('\n========================================');
    console.log('✓ RESTORATION COMPLETE');
    console.log('========================================');
    console.log(`Email: admin@example.com`);
    console.log(`Password: h0ngk0ng`);
    console.log(`Bookmarks: ${await Bookmark.countDocuments({ owner: adminUser._id })}`);
    console.log(`Folders: ${await Folder.countDocuments({ owner: adminUser._id })}`);
    console.log('========================================\n');

  } catch (error) {
    console.error('✗ Error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

restoreAll();
