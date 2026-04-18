import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Bookmark from './models/Bookmark.js';
import Folder from './models/Folder.js';

// Load environment variables
dotenv.config();

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Check bookmarks
    const bookmarks = await Bookmark.find({});
    console.log(`Bookmarks in database: ${bookmarks.length}`);
    if (bookmarks.length > 0) {
      console.log('\nFirst 5 bookmarks:');
      bookmarks.slice(0, 5).forEach(b => {
        console.log(`  - ${b.title} (${b.url})`);
      });
    }

    // Check folders
    const folders = await Folder.find({});
    console.log(`\nFolders in database: ${folders.length}`);
    if (folders.length > 0) {
      console.log('\nFirst 5 folders:');
      folders.slice(0, 5).forEach(f => {
        console.log(`  - ${f.name} (parent: ${f.parentFolder || 'root'})`);
      });
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
  }
}

checkData();
