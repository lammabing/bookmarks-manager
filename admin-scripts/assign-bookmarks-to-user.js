import mongoose from 'mongoose';
import User from '../models/User.js';
import Bookmark from '../models/Bookmark.js';

const connectionString = 'mongodb://localhost:27017/bookmarking-app';

async function assignBookmarks() {
  try {
    await mongoose.connect(connectionString);
    console.log('Connected to MongoDB');

    // Get username from command line
    const username = process.argv[2];
    if (!username) {
      throw new Error('Username not provided. Usage: node assignBookmarksToSkylabel.js <username>');
    }

    // Find user by provided username
    const user = await User.findOne({ username });
    if (!user) {
      throw new Error(`User "${username}" not found`);
    }

    // Update all bookmarks to be owned by the specified user
    const result = await Bookmark.updateMany(
      {},
      {
        $set: {
          owner: user._id,
          visibility: 'private'
        }
      }
    );

    console.log(`Successfully assigned ${result.modifiedCount} bookmarks to user ${username}`);
    mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

// Check if username argument is provided
if (process.argv.length < 3) {
  console.error('Error: Username argument is required');
  console.log('Usage: node assignBookmarksToSkylabel.js <username>');
  process.exit(1);
}

assignBookmarks();