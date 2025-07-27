import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Bookmark from '../models/Bookmark.js';
import User from '../models/User.js';

dotenv.config();

const createTestPublicBookmarks = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find a user to assign bookmarks to
    const user = await User.findOne();
    if (!user) {
      console.log('No users found. Please create a user first.');
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
      },
      {
        title: 'GitHub',
        url: 'https://github.com',
        description: 'The world\'s largest code hosting platform.',
        tags: ['git', 'code', 'development'],
        visibility: 'public',
        owner: user._id,
        favicon: 'https://github.com/favicon.ico'
      }
    ];

    for (const bookmarkData of testBookmarks) {
      const bookmark = new Bookmark(bookmarkData);
      await bookmark.save();
      console.log(`Created bookmark: ${bookmark.title}`);
    }

    console.log('Test public bookmarks created successfully!');
  } catch (error) {
    console.error('Error creating test bookmarks:', error);
  } finally {
    await mongoose.disconnect();
  }
};

createTestPublicBookmarks();