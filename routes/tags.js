import express from 'express';
import mongoose from 'mongoose';
import Bookmark from '../models/Bookmark.js';
import { auth } from '../middleware/auth.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Auto-backup configuration
const AUTO_BACKUP_DIR = './backups/auto';
const MAX_AUTO_BACKUPS = 5;

if (!fs.existsSync(AUTO_BACKUP_DIR)) {
  fs.mkdirSync(AUTO_BACKUP_DIR, { recursive: true });
}

const createQuickBackup = async () => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(AUTO_BACKUP_DIR, `auto-backup_${timestamp}`);
    fs.mkdirSync(backupPath, { recursive: true });

    const db = mongoose.connection.db;
    if (!db) return null;

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

// @route   GET /api/tags
// @desc    Get all tags with bookmark counts
// @access  Private (only show tags belonging to the authenticated user)
router.get('/', auth, async (req, res) => {
  try {
    // Aggregate tags and count occurrences
    const tags = await Bookmark.aggregate([
      // Match bookmarks owned by the current user
      { $match: { owner: new mongoose.Types.ObjectId(req.user.id) } },
      
      // Unwind the tags array to create a document per tag
      { $unwind: "$tags" },
      
      // Group by tag name and count occurrences
      { 
        $group: {
          _id: "$tags",
          count: { $sum: 1 }
        }
      },
      
      // Project to rename fields
      { 
        $project: {
          name: "$_id",
          count: 1,
          _id: 0
        }
      },
      
      // Sort alphabetically by tag name
      { $sort: { name: 1 } }
    ]);
    
    res.json(tags);
  } catch (err) {
    console.error('Error fetching tags:', err);
    console.error('Error details:', {
      message: err.message,
      stack: err.stack,
      user: req.user,
      userId: req.user.id
    });
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/tags/:tagName
// @desc    Rename a tag
// @access  Private
router.put('/:tagName', auth, async (req, res) => {
  try {
    // Create auto-backup before write operation
    await createQuickBackup();
    
    const oldTag = req.params.tagName;
    const newTag = req.body.newName;
    
    if (!newTag || newTag.trim() === '') {
      return res.status(400).json({ message: 'New tag name is required' });
    }
    
    // Update all bookmarks that have the old tag
    const result = await Bookmark.updateMany(
      {
        owner: new mongoose.Types.ObjectId(req.user.id),
        tags: oldTag
      },
      { 
        $set: { 
          "tags.$[elem]": newTag 
        } 
      },
      {
        arrayFilters: [{ "elem": oldTag }],
        multi: true
      }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: 'No bookmarks found with the specified tag' });
    }
    
    res.json({ 
      message: `Tag renamed from '${oldTag}' to '${newTag}' successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    console.error('Error renaming tag:', err);
    res.status(500).json({ message: err.message });
  }
});

// @route   DELETE /api/tags/:tagName
// @desc    Delete a tag from all bookmarks
// @access  Private
router.delete('/:tagName', auth, async (req, res) => {
  try {
    // Create auto-backup before write operation
    await createQuickBackup();
    
    const tagName = req.params.tagName;
    
    // Remove the tag from all bookmarks
    const result = await Bookmark.updateMany(
      { 
        owner: req.user._id,
        tags: tagName 
      },
      { 
        $pull: { tags: tagName } 
      },
      {
        multi: true
      }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: 'No bookmarks found with the specified tag' });
    }
    
    res.json({ 
      message: `Tag '${tagName}' deleted successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    console.error('Error deleting tag:', err);
    res.status(500).json({ message: err.message });
  }
});

export default router;