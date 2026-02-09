import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Bookmark from './models/Bookmark.js';

// Load environment variables
dotenv.config();

async function checkAllBookmarks() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Count total bookmarks
    const totalBookmarks = await Bookmark.countDocuments();
    console.log(`Total bookmarks in database: ${totalBookmarks}`);

    if (totalBookmarks > 0) {
      // Get all unique userIds that have bookmarks
      const userIds = await Bookmark.distinct('userId');
      console.log(`Unique user IDs with bookmarks: ${userIds.join(', ')}`);

      // Show a sample of bookmarks
      const sampleBookmarks = await Bookmark.find().limit(5);
      console.log('\nSample bookmarks:');
      sampleBookmarks.forEach((bookmark, index) => {
        console.log(`${index + 1}. Title: ${bookmark.title || 'No title'} | URL: ${bookmark.url} | UserId: ${bookmark.userId} | Created: ${bookmark.createdAt}`);
      });
    }
  } catch (error) {
    console.error('Error checking bookmarks:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run the function
checkAllBookmarks();