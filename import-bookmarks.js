import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import BookmarkImporter from './src/utils/BookmarkImporter.js';

dotenv.config();

/**
 * Import bookmarks from HTML file
 * Usage: node import-bookmarks.js <email> <html-file-path>
 */
async function importBookmarks(email, filePath) {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find user by email
    const user = await User.findOne({ email: email });
    if (!user) {
      console.error(`User with email ${email} not found`);
      return;
    }

    console.log(`Found user: ${user.email} (${user.username})`);
    console.log(`User ID: ${user._id}`);

    // Create importer instance
    const importer = new BookmarkImporter(user._id);

    // Import bookmarks
    const result = await importer.importFromFile(filePath);

    console.log(result.message);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');

    return result;
  } catch (error) {
    console.error('Error importing bookmarks:', error);
    process.exit(1);
  }
}

// Command line interface
async function main() {
  if (process.argv.length < 4) {
    console.log('Usage: node import-bookmarks.js <email> <html-file-path>');
    console.log('Example: node import-bookmarks.js user@example.com bookmarks.html');
    process.exit(1);
  }

  const email = process.argv[2];
  const filePath = process.argv[3];

  console.log(`Importing bookmarks for user: ${email}`);
  console.log(`From file: ${filePath}`);

  await importBookmarks(email, filePath);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { importBookmarks };