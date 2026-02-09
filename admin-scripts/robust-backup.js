import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import dotenv from 'dotenv';

dotenv.config();

const execAsync = promisify(exec);

// Configuration - backup to Windows host filesystem which survives WSL reinstallation
const BACKUP_DIR = '/mnt/c/Users/$USER/Documents/BookmarkManagerBackups'; // Windows Documents folder
const LOCAL_BACKUP_DIR = './backups'; // Local backup as secondary option
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' +
                  new Date().toTimeString().split(' ')[0].replace(/:/g, '-');

// Ensure backup directories exist
const ensureBackupDirectories = () => {
  // Try to create Windows backup directory
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
      console.log(`📁 Created Windows backup directory: ${BACKUP_DIR}`);
    }
  } catch (error) {
    console.warn(`⚠️  Could not create Windows backup directory: ${error.message}`);
    console.log(`💡 Falling back to local backup only`);
  }

  // Create local backup directory as fallback
  if (!fs.existsSync(LOCAL_BACKUP_DIR)) {
    fs.mkdirSync(LOCAL_BACKUP_DIR, { recursive: true });
    console.log(`📁 Created local backup directory: ${LOCAL_BACKUP_DIR}`);
  }
};

const createRobustBackup = async () => {
  try {
    console.log('🔄 Starting robust database backup...');
    console.log(`📅 Timestamp: ${TIMESTAMP}`);

    // Connect to MongoDB to get database info
    await mongoose.connect(process.env.MONGODB_URI);
    const dbName = mongoose.connection.db.databaseName;
    console.log(`🗄️  Database: ${dbName}`);

    // Ensure backup directories exist
    ensureBackupDirectories();

    // Create backup directories for this session
    const windowsBackupPath = path.join(BACKUP_DIR, `backup_${TIMESTAMP}`);
    const localBackupPath = path.join(LOCAL_BACKUP_DIR, `backup_${TIMESTAMP}`);
    
    // Create both backup locations
    if (fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(windowsBackupPath, { recursive: true });
      console.log(`📁 Created Windows backup location: ${windowsBackupPath}`);
    }
    
    fs.mkdirSync(localBackupPath, { recursive: true });
    console.log(`📁 Created local backup location: ${localBackupPath}`);

    // Create JSON exports (human-readable) to both locations
    await createJSONBackup(localBackupPath);
    
    if (fs.existsSync(BACKUP_DIR)) {
      await createJSONBackup(windowsBackupPath); // Also backup to Windows
    }

    // Create backup metadata in both locations
    await createBackupMetadata(localBackupPath, dbName);
    
    if (fs.existsSync(BACKUP_DIR)) {
      await createBackupMetadata(windowsBackupPath, dbName);
    }

    // Additionally, create a ZIP archive of the backup for easy transport
    await createZipArchive(localBackupPath);
    if (fs.existsSync(BACKUP_DIR)) {
      await createZipArchive(windowsBackupPath);
    }

    console.log('✅ Robust backup completed successfully!');
    console.log(`📁 Local backup location: ${localBackupPath}`);
    if (fs.existsSync(BACKUP_DIR)) {
      console.log(`📁 Windows backup location: ${windowsBackupPath}`);
    }

    // Clean up old backups (keep only last 10)
    await cleanupOldBackups();

    await mongoose.disconnect();

  } catch (error) {
    console.error('❌ Backup failed:', error);
    process.exit(1);
  }
};

// Create JSON backup (human-readable)
const createJSONBackup = async (backupPath) => {
  try {
    console.log(`🔄 Creating JSON backup at: ${backupPath}`);

    const jsonPath = path.join(backupPath, 'json');
    fs.mkdirSync(jsonPath, { recursive: true });

    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📋 Found ${collections.length} collections`);

    for (const collection of collections) {
      const collectionName = collection.name;
      console.log(`📄 Backing up collection: ${collectionName}`);

      // Get all documents from collection
      const documents = await mongoose.connection.db
        .collection(collectionName)
        .find({})
        .toArray();

      // Write to JSON file
      const filePath = path.join(jsonPath, `${collectionName}.json`);
      fs.writeFileSync(filePath, JSON.stringify(documents, null, 2));

      console.log(`✅ ${collectionName}: ${documents.length} documents backed up`);
    }

    console.log('✅ JSON backup completed');

  } catch (error) {
    console.error('❌ JSON backup failed:', error);
    throw error;
  }
};

// Create backup metadata
const createBackupMetadata = async (backupPath, dbName) => {
  try {
    console.log(`🔄 Creating backup metadata at: ${backupPath}`);

    // Get collection statistics
    const collections = await mongoose.connection.db.listCollections().toArray();
    const stats = {};

    for (const collection of collections) {
      const collectionName = collection.name;
      const count = await mongoose.connection.db.collection(collectionName).countDocuments();

      try {
        const collStats = await mongoose.connection.db.collection(collectionName).stats();
        stats[collectionName] = {
          documentCount: count,
          avgObjSize: collStats.avgObjSize || 0,
          storageSize: collStats.storageSize || 0,
          totalIndexSize: collStats.totalIndexSize || 0
        };
      } catch (error) {
        // Fallback if stats() fails
        stats[collectionName] = {
          documentCount: count,
          avgObjSize: 0,
          storageSize: 0,
          totalIndexSize: 0
        };
      }
    }

    const metadata = {
      timestamp: new Date().toISOString(),
      database: dbName,
      mongoVersion: (await mongoose.connection.db.admin().serverStatus()).version,
      collections: stats,
      backupMethod: 'JSON export',
      nodeVersion: process.version,
      totalCollections: collections.length,
      totalDocuments: Object.values(stats).reduce((sum, stat) => sum + stat.documentCount, 0),
      backupLocation: backupPath
    };

    // Write metadata
    const metadataPath = path.join(backupPath, 'backup-metadata.json');
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

    // Write human-readable summary
    const summaryPath = path.join(backupPath, 'backup-summary.txt');
    const summary = `
DATABASE BACKUP SUMMARY
======================
Date: ${metadata.timestamp}
Database: ${metadata.database}
MongoDB Version: ${metadata.mongoVersion}
Node.js Version: ${metadata.nodeVersion}

COLLECTIONS:
${Object.entries(stats).map(([name, stat]) =>
  `- ${name}: ${stat.documentCount} documents`
).join('\n')}

TOTAL: ${metadata.totalCollections} collections, ${metadata.totalDocuments} documents

BACKUP LOCATION: ${backupPath}
`;

    fs.writeFileSync(summaryPath, summary);

    console.log('✅ Backup metadata created');
    console.log(`📊 Total: ${metadata.totalCollections} collections, ${metadata.totalDocuments} documents`);

  } catch (error) {
    console.error('❌ Metadata creation failed:', error);
    // Don't throw - metadata is nice to have but not critical
  }
};

// Create ZIP archive for easy transport
const createZipArchive = async (backupPath) => {
  try {
    console.log(`🔄 Creating ZIP archive for: ${backupPath}`);
    
    const zipFileName = backupPath + '.zip';
    const relativePath = path.dirname(backupPath);
    const backupDirName = path.basename(backupPath);
    
    const command = `cd ${relativePath} && zip -r ${path.basename(zipFileName)} ${backupDirName}`;
    await execAsync(command);
    
    console.log(`✅ ZIP archive created: ${zipFileName}`);
  } catch (error) {
    console.warn(`⚠️  ZIP creation failed: ${error.message}`);
    // ZIP creation is optional, don't fail the backup process
  }
};

// Clean up old backups (keep only last 10)
const cleanupOldBackups = async () => {
  try {
    console.log('🧹 Cleaning up old backups...');
    
    // Clean up local backups
    await cleanupDirectory(LOCAL_BACKUP_DIR);
    
    // Clean up Windows backups if directory exists
    if (fs.existsSync(BACKUP_DIR)) {
      await cleanupDirectory(BACKUP_DIR);
    }
    
  } catch (error) {
    console.warn(`⚠️  Cleanup failed: ${error.message}`);
  }
};

const cleanupDirectory = async (dirPath) => {
  try {
    const files = fs.readdirSync(dirPath);
    const backupFiles = files.filter(file => 
      file.startsWith('backup_') && 
      (file.endsWith('.zip') || fs.statSync(path.join(dirPath, file)).isDirectory())
    );
    
    // Sort by modification time (newest first)
    const sortedBackups = backupFiles.sort((a, b) => {
      const aTime = fs.statSync(path.join(dirPath, a)).mtime.getTime();
      const bTime = fs.statSync(path.join(dirPath, b)).mtime.getTime();
      return bTime - aTime; // Descending order (newest first)
    });
    
    // Keep only the 10 most recent backups
    const toDelete = sortedBackups.slice(10);
    
    for (const file of toDelete) {
      const fullPath = path.join(dirPath, file);
      if (fs.statSync(fullPath).isDirectory()) {
        fs.rmSync(fullPath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(fullPath);
      }
      console.log(`🗑️  Deleted old backup: ${fullPath}`);
    }
    
    console.log(`✅ Kept ${Math.min(sortedBackups.length, 10)} most recent backups in ${dirPath}`);
  } catch (error) {
    console.warn(`⚠️  Directory cleanup failed for ${dirPath}: ${error.message}`);
  }
};

// Command line interface
const main = async () => {
  console.log('🛡️  Robust MongoDB Backup Script for WSL');
  console.log('=====================================');

  // Check if MongoDB URI is configured
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI environment variable not found');
    console.error('💡 Make sure .env file exists with MONGODB_URI');
    process.exit(1);
  }

  await createRobustBackup();
};

// Export for use in other scripts
export { createRobustBackup };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}