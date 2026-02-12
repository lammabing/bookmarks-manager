import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import dotenv from 'dotenv';

dotenv.config();

const execAsync = promisify(exec);

// Configuration - backup to Windows host filesystem which survives WSL reinstallation
// Try multiple potential Windows paths, preferring D: drive for dedicated storage
const WINDOWS_BACKUP_DIRS = [
  '/mnt/d/backups/BookmarkManagerBackups',
  '/mnt/c/Users/' + (process.env.USER || process.env.USERNAME || 'Default') + '/Documents/BookmarkManagerBackups',
  '/mnt/c/Users/' + (process.env.USER || process.env.USERNAME || 'Default') + '/Desktop/BookmarkManagerBackups',
  '/mnt/c/Users/' + (process.env.USER || process.env.USERNAME || 'Default') + '/OneDrive/Documents/BookmarkManagerBackups'
];
const LOCAL_BACKUP_DIR = './backups'; // Local backup as secondary option
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' +
                  new Date().toTimeString().split(' ')[0].replace(/:/g, '-');

// Ensure backup directories exist
const ensureBackupDirectories = () => {
  let windowsBackupDir = null;
  
  // Try to create Windows backup directory from available options
  for (const winDir of WINDOWS_BACKUP_DIRS) {
    try {
      if (!fs.existsSync(winDir)) {
        fs.mkdirSync(winDir, { recursive: true });
        windowsBackupDir = winDir;
        console.log(`📁 Created Windows backup directory: ${winDir}`);
        break;
      } else {
        windowsBackupDir = winDir;
        console.log(`📁 Using existing Windows backup directory: ${winDir}`);
        break;
      }
    } catch (error) {
      console.warn(`⚠️  Could not create/access Windows backup directory: ${winDir} - ${error.message}`);
    }
  }

  // Create local backup directory as fallback
  if (!fs.existsSync(LOCAL_BACKUP_DIR)) {
    fs.mkdirSync(LOCAL_BACKUP_DIR, { recursive: true });
    console.log(`📁 Created local backup directory: ${LOCAL_BACKUP_DIR}`);
  }
  
  return windowsBackupDir;
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
    const windowsBackupDir = ensureBackupDirectories();

    // Create backup directories for this session
    let windowsBackupPath = null;
    let localBackupPath = path.join(LOCAL_BACKUP_DIR, `backup_${TIMESTAMP}`);
    
    // Create both backup locations
    if (windowsBackupDir) {
      windowsBackupPath = path.join(windowsBackupDir, `backup_${TIMESTAMP}`);
      try {
        fs.mkdirSync(windowsBackupPath, { recursive: true });
        console.log(`📁 Created Windows backup location: ${windowsBackupPath}`);
      } catch (error) {
        console.warn(`⚠️  Could not create Windows backup location: ${error.message}`);
        windowsBackupPath = null;
      }
    }
    
    fs.mkdirSync(localBackupPath, { recursive: true });
    console.log(`📁 Created local backup location: ${localBackupPath}`);

    // Create JSON exports (human-readable) to both locations
    await createJSONBackup(localBackupPath);
    
    if (windowsBackupPath) {
      try {
        await createJSONBackup(windowsBackupPath); // Also backup to Windows
      } catch (error) {
        console.warn(`⚠️  Windows JSON backup failed: ${error.message}`);
      }
    }

    // Create backup metadata in both locations
    await createBackupMetadata(localBackupPath, dbName);
    
    if (windowsBackupPath) {
      try {
        await createBackupMetadata(windowsBackupPath, dbName);
      } catch (error) {
        console.warn(`⚠️  Windows metadata creation failed: ${error.message}`);
      }
    }

    // Additionally, create an archive of the backup for easy transport
    await createArchive(localBackupPath);
    if (windowsBackupPath) {
      try {
        await createArchive(windowsBackupPath);
      } catch (error) {
        console.warn(`⚠️  Windows archive creation failed: ${error.message}`);
      }
    }

    console.log('✅ Robust backup completed successfully!');
    console.log(`📁 Local backup location: ${localBackupPath}`);
    if (windowsBackupPath) {
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

// Create archive for easy transport (try multiple methods)
const createArchive = async (backupPath) => {
  try {
    console.log(`🔄 Creating archive for: ${backupPath}`);
    
    const archiveFileName = backupPath + '.tar.gz';
    const relativePath = path.dirname(backupPath);
    const backupDirName = path.basename(backupPath);
    
    // Try tar first (should be available on most Linux systems)
    try {
      const command = `cd ${relativePath} && tar -czf ${path.basename(archiveFileName)} ${backupDirName}`;
      await execAsync(command);
      console.log(`✅ TAR.GZ archive created: ${archiveFileName}`);
      return;
    } catch (tarError) {
      console.warn(`⚠️  TAR creation failed: ${tarError.message}`);
    }
    
    // If tar fails, try zip if available
    try {
      const command = `cd ${relativePath} && zip -r ${path.basename(backupPath + '.zip')} ${backupDirName}`;
      await execAsync(command);
      console.log(`✅ ZIP archive created: ${backupPath + '.zip'}`);
      return;
    } catch (zipError) {
      console.warn(`⚠️  ZIP creation failed: ${zipError.message}`);
    }
    
    console.warn(`⚠️  Archive creation failed - continuing without archive`);
  } catch (error) {
    console.warn(`⚠️  Archive creation failed: ${error.message}`);
    // Archive creation is optional, don't fail the backup process
  }
};

// Clean up old backups (keep only last 10)
const cleanupOldBackups = async () => {
  try {
    console.log('🧹 Cleaning up old backups...');
    
    // Clean up local backups
    await cleanupDirectory(LOCAL_BACKUP_DIR);
    
    // Try to clean up Windows backups if directory exists
    for (const winDir of WINDOWS_BACKUP_DIRS) {
      if (fs.existsSync(winDir)) {
        try {
          await cleanupDirectory(winDir);
          break; // Stop after cleaning the first accessible directory
        } catch (error) {
          console.warn(`⚠️  Could not clean Windows directory ${winDir}: ${error.message}`);
        }
      }
    }
    
  } catch (error) {
    console.warn(`⚠️  Cleanup failed: ${error.message}`);
  }
};

const cleanupDirectory = async (dirPath) => {
  try {
    if (!fs.existsSync(dirPath)) {
      return; // Directory doesn't exist, nothing to clean
    }
    
    const files = fs.readdirSync(dirPath);
    const backupFiles = files.filter(file => 
      file.startsWith('backup_') && 
      (file.endsWith('.tar.gz') || file.endsWith('.zip') || fs.statSync(path.join(dirPath, file)).isDirectory())
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
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory()) {
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