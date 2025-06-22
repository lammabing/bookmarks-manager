import mongoose from 'mongoose';
import User from '../models/User.js';
import Bookmark from '../models/Bookmark.js';

const connectionString = 'mongodb://localhost:27017/bookmarking-app';

async function checkBookmarks() {
  try {
    await mongoose.connect(connectionString);
    console.log('Connected to MongoDB');

    // Get username from command line
    const username = process.argv[2];
    if (!username) {
      throw new Error('Username not provided. Usage: node checkSkylabelBookmarks.js <username>');
    }

    // Find user by provided username
    const user = await User.findOne({ username });
    if (!user) {
      throw new Error(`User "${username}" not found`);
    }

    // Count bookmarks using the same query as the API endpoint
    const query = {
      $or: [
        { visibility: 'public' },
        { owner: user._id },
        { visibility: 'selected', sharedWith: user._id }
      ]
    };
    
    const count = await Bookmark.countDocuments(query);
    console.log(`API query returns ${count} bookmarks for user '${username}'`);

    mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

// Check if username argument is provided
if (process.argv.length < 3) {
  console.error('Error: Username argument is required');
  console.log('Usage: node checkSkylabelBookmarks.js <username>');
  process.exit(1);
}

checkBookmarks();