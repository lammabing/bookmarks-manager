import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Bookmark from './models/Bookmark.js';

// Load environment variables
dotenv.config();

async function checkBookmarks() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the user by email and get their bookmarks
    const bookmarks = await Bookmark.find({ owner: '6989ad5b56e3496aa27e0d29' }); // Using the user ID we found earlier, referencing the owner field

    if (bookmarks.length === 0) {
      console.log('No bookmarks found for user skylabel@gmx.com');
    } else {
      console.log(`Found ${bookmarks.length} bookmarks for user skylabel@gmx.com:`);
      bookmarks.forEach((bookmark, index) => {
        console.log(`${index + 1}. Title: ${bookmark.title || 'No title'} | URL: ${bookmark.url} | Created: ${bookmark.createdAt}`);
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
checkBookmarks();