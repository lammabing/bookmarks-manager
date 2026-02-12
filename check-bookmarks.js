import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Bookmark from './models/Bookmark.js';
import Folder from './models/Folder.js';

// Load environment variables
dotenv.config();

async function checkBookmarksForUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find user by email
    const userEmail = 'skylabel@gmx.com';
    const user = await User.findOne({ email: userEmail });
    
    if (!user) {
      console.log(`No user found with email: ${userEmail}`);
      
      // Let's check if there are any users at all
      const allUsers = await User.find({});
      console.log(`Total users in database: ${allUsers.length}`);
      if (allUsers.length > 0) {
        console.log('Existing users:');
        allUsers.forEach(u => {
          console.log(`- ${u.email} (${u.username})`);
        });
      }
    } else {
      console.log(`Found user: ${user.email} (${user.username})`);
      console.log(`User ID: ${user._id}`);
      console.log(`Created at: ${user.createdAt}`);
      
      // Check for bookmarks owned by this user
      const bookmarks = await Bookmark.find({ owner: user._id }).populate('folder');
      console.log(`\nNumber of bookmarks found: ${bookmarks.length}`);
      
      if (bookmarks.length > 0) {
        console.log('\nBookmark details:');
        bookmarks.forEach((bookmark, index) => {
          console.log(`${index + 1}. Title: ${bookmark.title}`);
          console.log(`   URL: ${bookmark.url}`);
          console.log(`   Tags: [${bookmark.tags.join(', ')}]`);
          console.log(`   Created: ${bookmark.createdAt}`);
          console.log(`   Folder: ${bookmark.folder ? bookmark.folder.name : 'None'}`);
          console.log('');
        });
      }
      
      // Check for folders owned by this user
      const folders = await Folder.find({ owner: user._id });
      console.log(`\nNumber of folders found: ${folders.length}`);
      
      if (folders.length > 0) {
        console.log('\nFolder details:');
        folders.forEach((folder, index) => {
          console.log(`${index + 1}. Name: ${folder.name}`);
          console.log(`   Description: ${folder.description || 'None'}`);
          console.log(`   Parent: ${folder.parent ? folder.parent : 'Root'}`);
          console.log(`   Created: ${folder.createdAt}`);
          console.log(`   Bookmarks in folder: ${folder.bookmarkCount}`);
          console.log('');
        });
      }
    }
  } catch (error) {
    console.error('Error checking bookmarks:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the function
checkBookmarksForUser();