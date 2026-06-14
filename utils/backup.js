import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

const AUTO_BACKUP_DIR = './backups/auto';
const MAX_AUTO_BACKUPS = 5;

if (!fs.existsSync(AUTO_BACKUP_DIR)) {
  fs.mkdirSync(AUTO_BACKUP_DIR, { recursive: true });
}

export const createQuickBackup = async () => {
  try {
    const db = mongoose.connection.db;
    if (!db) return null;

    const totalDocs = await db.collection('bookmarks').countDocuments();
    const existingBackups = fs.existsSync(AUTO_BACKUP_DIR)
      ? fs.readdirSync(AUTO_BACKUP_DIR).filter(name => name.startsWith('auto-backup_'))
      : [];

    if (totalDocs === 0 && existingBackups.length > 0) {
      const latestBackup = existingBackups.sort().reverse()[0];
      const latestPath = path.join(AUTO_BACKUP_DIR, latestBackup, 'bookmarks.json');
      if (fs.existsSync(latestPath)) {
        const prevBookmarks = JSON.parse(fs.readFileSync(latestPath, 'utf8'));
        if (prevBookmarks.length > 0) {
          console.log('⚠️  Auto-backup SKIPPED: DB is empty but previous backups have data. Preventing overwrite.');
          return null;
        }
      }
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(AUTO_BACKUP_DIR, `auto-backup_${timestamp}`);
    fs.mkdirSync(backupPath, { recursive: true });

    const collections = await db.listCollections().toArray();

    for (const collection of collections) {
      const documents = await db.collection(collection.name).find({}).toArray();
      fs.writeFileSync(
        path.join(backupPath, `${collection.name}.json`),
        JSON.stringify(documents, null, 2)
      );
    }

    const backups = fs.readdirSync(AUTO_BACKUP_DIR)
      .filter(name => name.startsWith('auto-backup_'))
      .sort()
      .reverse();

    if (backups.length > MAX_AUTO_BACKUPS) {
      backups.slice(MAX_AUTO_BACKUPS).forEach(backup => {
        fs.rmSync(path.join(AUTO_BACKUP_DIR, backup), { recursive: true, force: true });
      });
    }

    console.log(`💾 Auto-backup created: ${backupPath}`);
    return backupPath;
  } catch (error) {
    console.error('⚠️  Auto-backup failed:', error.message);
    return null;
  }
};
