import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const AUTO_BACKUP_DIR = './backups/auto';

// Auto-detect latest backup or use CLI argument
function getLatestBackup(customPath) {
  if (customPath) {
    return customPath;
  }

  if (!fs.existsSync(AUTO_BACKUP_DIR)) {
    throw new Error(`Auto-backup directory not found: ${AUTO_BACKUP_DIR}`);
  }

  const backups = fs.readdirSync(AUTO_BACKUP_DIR)
    .filter(name => name.startsWith('auto-backup_') && fs.statSync(path.join(AUTO_BACKUP_DIR, name)).isDirectory())
    .sort()
    .reverse();

  if (backups.length === 0) {
    throw new Error('No backups found in ' + AUTO_BACKUP_DIR);
  }

  const latest = path.join(AUTO_BACKUP_DIR, backups[0]);
  console.log(`Auto-detected latest backup: ${latest}`);
  return latest;
}

const BACKUP_DIR = getLatestBackup(process.argv[2]);

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');

    try {
      // Read backup data
      const bookmarks = JSON.parse(fs.readFileSync(`${BACKUP_DIR}/bookmarks.json`, 'utf8'));
      const folders = JSON.parse(fs.readFileSync(`${BACKUP_DIR}/folders.json`, 'utf8'));

      console.log(`Found ${bookmarks.length} bookmarks and ${folders.length} folders in backup`);

      // Safety confirmation
      console.log('\n⚠️  WARNING: This will DELETE all existing bookmarks and folders.');
      console.log('   Press Ctrl+C within 5 seconds to cancel...\n');
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Clear existing data
      await mongoose.connection.db.collection('bookmarks').deleteMany({});
      await mongoose.connection.db.collection('folders').deleteMany({});
      console.log('Cleared existing bookmarks and folders');

      // Restore folders first
      if (folders.length > 0) {
        const folderResult = await mongoose.connection.db.collection('folders').insertMany(folders);
        console.log(`✅ Restored ${folderResult.insertedCount} folders`);
      }

      // Restore bookmarks
      if (bookmarks.length > 0) {
        // Insert in batches to avoid memory issues
        const batchSize = 100;
        let restored = 0;

        for (let i = 0; i < bookmarks.length; i += batchSize) {
          const batch = bookmarks.slice(i, i + batchSize);
          const result = await mongoose.connection.db.collection('bookmarks').insertMany(batch);
          restored += result.insertedCount;
        }

        console.log(`✅ Restored ${restored} bookmarks`);
      }

      console.log('\n✅ Restore completed successfully!');

      mongoose.disconnect();
    } catch (error) {
      console.error('❌ Error during restore:', error);
      mongoose.disconnect();
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });
