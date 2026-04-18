import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import User from './models/User.js';

dotenv.config();

const BACKUP_FILE = '/mnt/g/www/bookmarks-manager/backups/auto/auto-backup_2026-04-01T06-34-57-714Z/users.json';

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');

    try {
      // Read backup data
      const backupData = JSON.parse(fs.readFileSync(BACKUP_FILE, 'utf8'));
      console.log(`Found ${backupData.length} users in backup`);

      for (const userData of backupData) {
        // Check if user already exists
        const existingUser = await User.findOne({ email: userData.email });
        
        if (existingUser) {
          console.log(`⚠️  User ${userData.email} already exists, skipping`);
        } else {
          // Create user from backup (preserve original password hash and _id)
          const user = new User({
            _id: userData._id,
            username: userData.username,
            email: userData.email,
            password: userData.password, // Already hashed
            createdAt: userData.createdAt,
            updatedAt: userData.updatedAt
          });

          await user.save();
          console.log(`✅ Restored user: ${userData.email} (${userData.username})`);
        }
      }

      console.log('\n✅ Restore completed successfully!');
      console.log('\nYou can now login with:');
      console.log('  Email: admin@example.com');
      console.log('  Password: admin123 (or whatever was set before backup)');

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
