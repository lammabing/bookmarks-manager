import mongoose from 'mongoose';
import User from '../models/User.js';
import Bookmark from '../models/Bookmark.js';

const connectionString = 'mongodb://localhost:27017/bookmarking-app';

async function checkUserBookmarks() {
  try {
    await mongoose.connect(connectionString);
    console.log('Connected to MongoDB');

    // Find the skylabel user
    const user = await User.findOne({ username: 'skylabel' });
    if (!user) {
      console.log('User skylabel not found');
      return;
    }

    console.log(`Found user: ${user.username} (ID: ${user._id})`);

    // Count all bookmarks owned by this user
    const ownedCount = await Bookmark.countDocuments({ owner: user._id });
    console.log(`Bookmarks owned by skylabel: ${ownedCount}`);

    // Count bookmarks without owner field
    const orphanedCount = await Bookmark.countDocuments({ owner: { $exists: false } });
    console.log(`Orphaned bookmarks (no owner): ${orphanedCount}`);

    // Show a few sample bookmarks
    const sampleBookmarks = await Bookmark.find({ owner: user._id }).limit(5);
    console.log('\nSample bookmarks:');
    sampleBookmarks.forEach(b => {
      console.log(`- ${b.title} (${b.url})`);
    });

    mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkUserBookmarks();