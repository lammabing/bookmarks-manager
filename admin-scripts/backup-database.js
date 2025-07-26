import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import dotenv from 'dotenv';

dotenv.config();

const execAsync = promisify(exec);

// Configuration
const BACKUP_DIR = './backups';
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' +
                  new Date().toTimeString().split(' ')[0].replace(/:/g, '-');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

const createBackup = async () => {
  try {
    console.log('🔄 Starting database backup...');
    console.log(`📅 Timestamp: ${TIMESTAMP}`);

    // Connect to MongoDB to get database info
    await mongoose.connect(process.env.MONGODB_URI);
    const dbName = mongoose.connection.db.databaseName;
    console.log(`🗄️  Database: ${dbName}`);

    // Create backup directory for this session
    const backupPath = path.join(BACKUP_DIR, `backup_${TIMESTAMP}`);
    fs.mkdirSync(backupPath, { recursive: true });

    // Method 1: Use mongodump (recommended for production)
    await createMongoDump(dbName, backupPath);

    // Method 2: Create JSON exports (human-readable)
    await createJSONBackup(backupPath);

    // Create backup metadata
    await createBackupMetadata(backupPath, dbName);

    console.log('✅ Backup completed successfully!');
    console.log(`📁 Backup location: ${backupPath}`);

    await mongoose.disconnect();

  } catch (error) {
    console.error('❌ Backup failed:', error);
    process.exit(1);
  }
};

// Create mongodump backup (binary format)
const createMongoDump = async (dbName, backupPath) => {
  try {
    console.log('🔄 Creating mongodump backup...');

    const mongoUri = process.env.MONGODB_URI;
    const dumpPath = path.join(backupPath, 'mongodump');

    // Extract connection details from URI
    const uri = new URL(mongoUri);
    const host = uri.hostname;
    const port = uri.port || '27017';

    const command = `mongodump --host ${host}:${port} --db ${dbName} --out ${dumpPath}`;

    const { stdout, stderr } = await execAsync(command);

    if (stderr && !stderr.includes('done dumping')) {
      console.warn('⚠️  mongodump warnings:', stderr);
    }

    console.log('✅ mongodump backup completed');

  } catch (error) {
    console.warn('⚠️  mongodump failed (continuing with JSON backup):', error.message);
    console.log('💡 Make sure mongodump is installed: https://docs.mongodb.com/database-tools/');
  }
};

// Create JSON backup (human-readable)
const createJSONBackup = async (backupPath) => {
  try {
    console.log('🔄 Creating JSON backup...');

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
    console.log('🔄 Creating backup metadata...');

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
      backupMethod: 'mongodump + JSON',
      nodeVersion: process.version,
      totalCollections: collections.length,
      totalDocuments: Object.values(stats).reduce((sum, stat) => sum + stat.documentCount, 0)
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

// Command line interface
const main = async () => {
  console.log('🚀 MongoDB Backup Script');
  console.log('========================');

  // Check if MongoDB URI is configured
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI environment variable not found');
    console.error('💡 Make sure .env file exists with MONGODB_URI');
    process.exit(1);
  }

  await createBackup();
};

// Export for use in other scripts
export { createBackup, createMongoDump, createJSONBackup };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
