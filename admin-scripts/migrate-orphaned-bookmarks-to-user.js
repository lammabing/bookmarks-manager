import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Bookmark from '../models/Bookmark.js';
import crypto from 'crypto';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const migrateBookmarks = async (username) => {
  try {
    // Find user by provided username
    const user = await User.findOne({ username });
    if (!user) {
      throw new Error(`User "${username}" not found`);
    }
    
    // Find all bookmarks without an owner
    const bookmarksToMigrate = await mongoose.connection.collection('bookmarks').find({
      owner: { $exists: false }
    }).toArray();
    
    console.log(`Found ${bookmarksToMigrate.length} bookmarks to migrate`);
    
    if (bookmarksToMigrate.length === 0) {
      console.log('No bookmarks to migrate');
      process.exit(0);
    }
    
    // Update each bookmark
    for (const bookmark of bookmarksToMigrate) {
      console.log(`Migrating bookmark: ${bookmark.title}`);
      
      await mongoose.connection.collection('bookmarks').updateOne(
        { _id: bookmark._id },
        {
          $set: {
            owner: user._id,
            visibility: 'private',
            updatedAt: new Date()
          }
        }
      );
    }
    
    console.log(`Successfully migrated ${bookmarksToMigrate.length} bookmarks to user ${username}`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

// Check if username argument is provided
if (process.argv.length < 3) {
  console.error('Error: Username argument is required');
  console.log('Usage: node migrate-orphaned-bookmarks-to-user.js <username>');
  process.exit(1);
}

const username = process.argv[2];
migrateBookmarks(username);
