import express from 'express';
import Bookmark from '../models/Bookmark.js';
import Folder from '../models/Folder.js';
import { auth } from '../middleware/auth.js';
import jwt from 'jsonwebtoken'; // Add missing import

const router = express.Router();

// @route   GET /api/bookmarks
// @desc    Get all bookmarks (filtered by visibility and ownership)
// @access  Public/Private
router.get('/', auth, async (req, res) => {
  try {
    const { folder, tags, search } = req.query;
    let query = { owner: req.user.id };

    // Add folder filtering
    if (folder) {
      query.folder = folder === 'null' ? null : folder;
    }

    // Existing tag and search filtering...
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { url: { $regex: search, $options: 'i' } }
      ];
    }

    const bookmarks = await Bookmark.find(query)
      .populate('folder', 'name color')
      .sort({ createdAt: -1 });

    res.json(bookmarks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/bookmarks/:id
// @desc    Get a single bookmark
// @access  Public/Private (depending on bookmark visibility)
router.get('/:id', async (req, res) => {
  try {
    const bookmark = await Bookmark.findById(req.params.id)
      .populate('owner', 'username');

    if (!bookmark) {
      return res.status(404).json({ message: 'Bookmark not found' });
    }

    // Check if user can access this bookmark
    let canAccess = bookmark.visibility === 'public';

    if (req.headers['x-auth-token'] && !canAccess) {
      try {
        const decoded = jwt.verify(req.headers['x-auth-token'], process.env.JWT_SECRET);
        const userId = decoded.id;

        canAccess = bookmark.owner.toString() === userId ||
                   (bookmark.visibility === 'selected' &&
                    bookmark.sharedWith.some(id => id.toString() === userId));
      } catch (err) {
        // Invalid token, fall back to public-only access
      }
    }

    if (!canAccess) {
      return res.status(403).json({ message: 'Not authorized to view this bookmark' });
    }

    res.json(bookmark);
  } catch (err) {
    console.error('Error fetching bookmark:', err);
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/bookmarks
// @desc    Create a new bookmark
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { title, url, description, tags, folder, favicon } = req.body;

    // Validate folder ownership if provided
    if (folder) {
      const folderDoc = await Folder.findOne({
        _id: folder,
        owner: req.user.id
      });
      if (!folderDoc) {
        return res.status(400).json({ message: 'Invalid folder' });
      }
    }

    const bookmark = new Bookmark({
      title,
      url,
      description,
      tags: tags || [],
      folder: folder || null,
      owner: req.user.id,
      favicon: favicon || `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}`
    });

    await bookmark.save();

    // Update folder bookmark count
    if (folder) {
      const folderDoc = await Folder.findById(folder);
      await folderDoc.updateBookmarkCount();
    }

    res.status(201).json(bookmark);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/bookmarks/:id
// @desc    Update a bookmark
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const bookmark = await Bookmark.findById(req.params.id);

    if (!bookmark) {
      return res.status(404).json({ message: 'Bookmark not found' });
    }

    // Check if user owns this bookmark
    if (bookmark.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this bookmark' });
    }

    const updatedBookmark = await Bookmark.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    res.json(updatedBookmark);
  } catch (err) {
    console.error('Error updating bookmark:', err);
    res.status(500).json({ message: err.message });
  }
});

// @route   DELETE /api/bookmarks/:id
// @desc    Delete a bookmark
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const bookmark = await Bookmark.findById(req.params.id);

    if (!bookmark) {
      return res.status(404).json({ message: 'Bookmark not found' });
    }

    // Check if user owns this bookmark
    if (bookmark.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this bookmark' });
    }

    await Bookmark.findByIdAndDelete(req.params.id);

    res.json({ message: 'Bookmark deleted successfully' });
  } catch (err) {
    console.error('Error deleting bookmark:', err);
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/bookmarks/:id/share
// @desc    Share a bookmark with specific users
// @access  Private
router.post('/:id/share', auth, async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds)) {
      return res.status(400).json({ message: 'User IDs array is required' });
    }

    const bookmark = await Bookmark.findById(req.params.id);

    if (!bookmark) {
      return res.status(404).json({ message: 'Bookmark not found' });
    }

    // Check if user owns this bookmark
    if (bookmark.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to share this bookmark' });
    }

    // Update bookmark visibility and shared users
    bookmark.visibility = 'selected';
    bookmark.sharedWith = [...new Set([...bookmark.sharedWith, ...userIds])];
    bookmark.updatedAt = new Date();

    await bookmark.save();

    res.json({ message: 'Bookmark shared successfully', bookmark });
  } catch (err) {
    console.error('Error sharing bookmark:', err);
    res.status(500).json({ message: err.message });
  }
});

// Add bulk move endpoint
router.post('/move', auth, async (req, res) => {
  try {
    const { bookmarkIds, targetFolder } = req.body;

    // Validate folder ownership if provided
    if (targetFolder) {
      const folderDoc = await Folder.findOne({
        _id: targetFolder,
        owner: req.user.id
      });
      if (!folderDoc) {
        return res.status(400).json({ message: 'Invalid target folder' });
      }
    }

    // Update bookmarks
    const result = await Bookmark.updateMany(
      {
        _id: { $in: bookmarkIds },
        owner: req.user.id
      },
      { folder: targetFolder || null }
    );

    // Update bookmark counts for affected folders
    const affectedFolders = await Bookmark.distinct('folder', {
      _id: { $in: bookmarkIds }
    });

    for (const folderId of affectedFolders) {
      if (folderId) {
        const folderDoc = await Folder.findById(folderId);
        if (folderDoc) await folderDoc.updateBookmarkCount();
      }
    }

    if (targetFolder) {
      const targetFolderDoc = await Folder.findById(targetFolder);
      if (targetFolderDoc) await targetFolderDoc.updateBookmarkCount();
    }

    res.json({
      message: `${result.modifiedCount} bookmarks moved successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
