import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Configuration
const AUTO_BACKUP_DIR = './backups/auto';
const MAX_AUTO_BACKUPS = 5; // Keep only last 5 auto-backups to save space

// Ensure auto backup directory exists
if (!fs.existsSync(AUTO_BACKUP_DIR)) {
  fs.mkdirSync(AUTO_BACKUP_DIR, { recursive: true });
}

/**
 * Create a quick JSON backup of the database
 * Called automatically before write operations
 */
const createAutoBackup = async (mongoose) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' +
                      new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
    
    const backupPath = path.join(AUTO_BACKUP_DIR, `auto-backup_${timestamp}`);
    fs.mkdirSync(backupPath, { recursive: true });

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    console.log(`🔄 Auto-backup: Starting backup of ${collections.length} collections...`);

    for (const collection of collections) {
      const collectionName = collection.name;
      const documents = await db.collection(collectionName).find({}).toArray();
      
      const filePath = path.join(backupPath, `${collectionName}.json`);
      fs.writeFileSync(filePath, JSON.stringify(documents, null, 2));
      
      console.log(`  📄 ${collectionName}: ${documents.length} documents`);
    }

    // Write metadata
    const metadata = {
      timestamp: new Date().toISOString(),
      type: 'auto-backup',
      reason: 'pre-write backup',
      collections: collections.map(c => c.name),
      totalCollections: collections.length
    };
    
    fs.writeFileSync(
      path.join(backupPath, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    );

    // Cleanup old auto-backups (keep only last MAX_AUTO_BACKUPS)
    await cleanupOldAutoBackups();

    console.log(`✅ Auto-backup completed: ${backupPath}`);
    return backupPath;

  } catch (error) {
    console.error('⚠️  Auto-backup failed:', error.message);
    // Don't throw - we don't want to block the write operation if backup fails
  }
};

/**
 * Remove old auto-backups, keeping only the most recent ones
 */
const cleanupOldAutoBackups = async () => {
  try {
    const backups = fs.readdirSync(AUTO_BACKUP_DIR)
      .filter(name => name.startsWith('auto-backup_'))
      .sort()
      .reverse(); // Newest first

    if (backups.length > MAX_AUTO_BACKUPS) {
      const toDelete = backups.slice(MAX_AUTO_BACKUPS);
      
      for (const backup of toDelete) {
        const backupPath = path.join(AUTO_BACKUP_DIR, backup);
        fs.rmSync(backupPath, { recursive: true, force: true });
        console.log(`🗑️  Deleted old auto-backup: ${backup}`);
      }
    }
  } catch (error) {
    console.error('⚠️  Auto-backup cleanup failed:', error.message);
  }
};

/**
 * Middleware factory - creates middleware that backs up before write operations
 * @param {string} operation - Description of the operation (e.g., 'bookmark create')
 */
export const autoBackup = (operation) => {
  return async (req, res, next) => {
    try {
      console.log(`\n🔄 Auto-backup triggered: ${operation}`);
      
      // Import mongoose from connection
      const mongoose = await import('mongoose');
      
      // Check if we're connected
      if (mongoose.default.connection.readyState !== 1) {
        console.log('⚠️  MongoDB not connected, skipping auto-backup');
        return next();
      }
      
      // Create backup
      await createAutoBackup(mongoose.default);
      
      next();
    } catch (error) {
      console.error('⚠️  Auto-backup error, continuing with operation:', error.message);
      next(); // Continue with the operation even if backup fails
    }
  };
};

/**
 * Manual backup function for use in scripts
 */
export const manualBackup = async () => {
  const mongoose = await import('mongoose');
  await mongoose.default.connect(process.env.MONGODB_URI);
  
  try {
    const backupPath = await createAutoBackup(mongoose.default);
    console.log(`✅ Manual backup completed: ${backupPath}`);
    return backupPath;
  } finally {
    await mongoose.default.disconnect();
  }
};

export default { autoBackup, manualBackup, createAutoBackup };
