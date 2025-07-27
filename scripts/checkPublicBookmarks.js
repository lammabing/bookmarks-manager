import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Bookmark from '../models/Bookmark.js';
import User from '../models/User.js';

dotenv.config();

const checkAndCreatePublicBookmarks = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check existing bookmarks
    const totalBookmarks = await Bookmark.countDocuments({});
    console.log(`Total bookmarks: ${totalBookmarks}`);

    const publicBookmarks = await Bookmark.countDocuments({ visibility: 'public' });
    console.log(`Public bookmarks: ${publicBookmarks}`);

    // Show all visibility values
    const visibilityValues = await Bookmark.distinct('visibility');
    console.log('Existing visibility values:', visibilityValues);

    // If no public bookmarks, create some test ones
    if (publicBookmarks === 0) {
      console.log('No public bookmarks found. Creating test bookmarks...');
      
      // Find or create a user
      let user = await User.findOne();
      if (!user) {
        console.log('No users found. Please create a user account first.');
        return;
      }

      const testBookmarks = [
        {
          title: 'React Documentation',
          url: 'https://react.dev',
          description: 'The official React documentation with guides and API reference.',
          tags: ['react', 'javascript', 'frontend'],
          visibility: 'public',
          owner: user._id,
          favicon: 'https://react.dev/favicon.ico'
        },
        {
          title: 'MDN Web Docs',
          url: 'https://developer.mozilla.org',
          description: 'Comprehensive web development documentation and tutorials.',
          tags: ['web', 'documentation', 'javascript'],
          visibility: 'public',
          owner: user._id,
          favicon: 'https://developer.mozilla.org/favicon.ico'
        }
      ];

      for (const bookmarkData of testBookmarks) {
        const bookmark = new Bookmark(bookmarkData);
        await bookmark.save();
        console.log(`Created public bookmark: ${bookmark.title}`);
      }

      console.log('Test public bookmarks created!');
    }

    // Show sample public bookmarks
    const samplePublic = await Bookmark.find({ visibility: 'public' }).limit(3);
    console.log('Sample public bookmarks:');
    samplePublic.forEach(bookmark => {
      console.log(`- ${bookmark.title} (${bookmark.visibility})`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
};

checkAndCreatePublicBookmarks();