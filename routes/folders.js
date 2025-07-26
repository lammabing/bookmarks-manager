import express from 'express';
import Folder from '../models/Folder.js';
import Bookmark from '../models/Bookmark.js';
import auth from '../middleware/auth.js';

const router = express.Router();

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
