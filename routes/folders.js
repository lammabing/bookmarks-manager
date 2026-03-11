import express from 'express';
import Folder from '../models/Folder.js';
import Bookmark from '../models/Bookmark.js';
import auth from '../middleware/auth.js';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Auto-backup configuration (shared with bookmarks.js)
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

// Get all folders for user (tree structure)
router.get('/', auth, async (req, res) => {
  try {
    const folders = await Folder.find({ owner: req.user.id })
      .populate('parent', 'name')
      .sort({ order: 1, name: 1 });

    // Build tree structure
    const buildTree = (folders, parentId = null) => {
      return folders
        .filter(folder => {
          if (parentId === null) return folder.parent === null;
          return folder.parent && folder.parent._id.toString() === parentId.toString();
        })
        .map(folder => ({
          ...folder.toObject(),
          children: buildTree(folders, folder._id)
        }));
    };

    const folderTree = buildTree(folders);
    res.json(folderTree);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get specific folder with bookmarks
router.get('/:id', auth, async (req, res) => {
  try {
    const folder = await Folder.findOne({
      _id: req.params.id,
      owner: req.user.id
    }).populate('parent', 'name');

    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    const bookmarks = await Bookmark.find({ folder: folder._id })
      .sort({ createdAt: -1 });

    res.json({ folder, bookmarks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new folder
router.post('/', auth, async (req, res) => {
  try {
    // Create auto-backup before write operation
    await createQuickBackup();
    
    const { name, description, parent, color, icon } = req.body;

    // Validate parent folder ownership if provided
    if (parent) {
      const parentFolder = await Folder.findOne({
        _id: parent,
        owner: req.user.id
      });
      if (!parentFolder) {
        return res.status(400).json({ message: 'Invalid parent folder' });
      }
    }

    const folder = new Folder({
      name,
      description,
      parent: parent || null,
      owner: req.user.id,
      color: color || '#3B82F6',
      icon: icon || 'folder'
    });

    await folder.save();
    res.status(201).json(folder);
  } catch (error) {
    if (error.message === 'Circular reference detected') {
      return res.status(400).json({ message: 'Cannot create circular folder reference' });
    }
    res.status(400).json({ message: error.message });
  }
});

// Update folder
router.put('/:id', auth, async (req, res) => {
  try {
    // Create auto-backup before write operation
    await createQuickBackup();
    
    const { name, description, parent, color, icon, order } = req.body;

    const folder = await Folder.findOne({
      _id: req.params.id,
      owner: req.user.id
    });

    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    // Validate parent folder if changing
    if (parent && parent !== folder.parent?.toString()) {
      const parentFolder = await Folder.findOne({
        _id: parent,
        owner: req.user.id
      });
      if (!parentFolder) {
        return res.status(400).json({ message: 'Invalid parent folder' });
      }
    }

    folder.name = name || folder.name;
    folder.description = description !== undefined ? description : folder.description;
    folder.parent = parent !== undefined ? parent : folder.parent;
    folder.color = color || folder.color;
    folder.icon = icon || folder.icon;
    folder.order = order !== undefined ? order : folder.order;

    await folder.save();
    res.json(folder);
  } catch (error) {
    if (error.message === 'Circular reference detected') {
      return res.status(400).json({ message: 'Cannot create circular folder reference' });
    }
    res.status(400).json({ message: error.message });
  }
});

// Delete folder (move bookmarks to parent)
router.delete('/:id', auth, async (req, res) => {
  try {
    // Create auto-backup before write operation
    await createQuickBackup();
    
    const folder = await Folder.findOne({
      _id: req.params.id,
      owner: req.user.id
    });

    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    // Move bookmarks to parent folder
    await Bookmark.updateMany(
      { folder: folder._id },
      { folder: folder.parent }
    );

    // Move child folders to parent
    await Folder.updateMany(
      { parent: folder._id },
      { parent: folder.parent }
    );

    await Folder.findByIdAndDelete(folder._id);
    res.json({ message: 'Folder deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get bookmarks in folder
router.get('/:id/bookmarks', auth, async (req, res) => {
  try {
    const folder = await Folder.findOne({
      _id: req.params.id,
      owner: req.user.id
    });

    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    const bookmarks = await Bookmark.find({ folder: folder._id })
      .sort({ createdAt: -1 });

    res.json(bookmarks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Move folder to new parent
router.post('/:id/move', auth, async (req, res) => {
  try {
    const { newParent } = req.body;

    const folder = await Folder.findOne({
      _id: req.params.id,
      owner: req.user.id
    });

    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    // Validate new parent if provided
    if (newParent) {
      const parentFolder = await Folder.findOne({
        _id: newParent,
        owner: req.user.id
      });
      if (!parentFolder) {
        return res.status(400).json({ message: 'Invalid parent folder' });
      }
    }

    folder.parent = newParent || null;
    await folder.save();

    res.json(folder);
  } catch (error) {
    if (error.message === 'Circular reference detected') {
      return res.status(400).json({ message: 'Cannot create circular folder reference' });
    }
    res.status(400).json({ message: error.message });
  }
});

export default router;
