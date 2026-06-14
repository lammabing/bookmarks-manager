import express from 'express';
import Bookmark from '../models/Bookmark.js';
import Folder from '../models/Folder.js';
import { auth } from '../middleware/auth.js';
import jwt from 'jsonwebtoken';
import { createQuickBackup } from '../utils/backup.js';
import { normalizeTags } from '../utils/helpers.js';

const router = express.Router();

// @route   GET /api/bookmarks/public
// @desc    Get all public bookmarks (no auth required)
// @access  Public
router.get('/public', async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;

    const bookmarks = await Bookmark.find({
      visibility: 'public'
    })
    .populate('owner', 'username')
    .sort({ updatedAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Bookmark.countDocuments({ visibility: 'public' });

    res.json({
      bookmarks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error in public bookmarks:', error);
    res.status(500).json({ message: error.message });
  }
});

// Add bulk move endpoint (before other routes)
router.post('/move', auth, async (req, res) => {
  try {
    // Create auto-backup before write operation
    await createQuickBackup();
    
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

// @route   POST /api/bookmarks/bulk-edit
// @desc    Bulk edit multiple bookmarks (folder, tags, visibility)
// @access  Private
router.post('/bulk-edit', auth, async (req, res) => {
  try {
    // Create auto-backup before write operation
    await createQuickBackup();
    
    const { bookmarkIds, operations } = req.body;

    // Validate input
    if (!bookmarkIds || !Array.isArray(bookmarkIds) || bookmarkIds.length === 0) {
      return res.status(400).json({ message: 'Bookmark IDs array is required' });
    }

    if (!operations || typeof operations !== 'object') {
      return res.status(400).json({ message: 'Operations object is required' });
    }

    // Verify all bookmarks belong to the authenticated user
    const userBookmarks = await Bookmark.find({
      _id: { $in: bookmarkIds },
      owner: req.user.id
    });

    if (userBookmarks.length !== bookmarkIds.length) {
      return res.status(403).json({
        message: 'Some bookmarks do not exist or do not belong to you',
        validBookmarks: userBookmarks.map(b => b._id)
      });
    }

    const results = {
      success: true,
      modifiedCount: 0,
      folderUpdates: 0,
      tagUpdates: 0,
      visibilityUpdates: 0,
      errors: []
    };

    // Process folder operations
    if (operations.hasOwnProperty('folder')) {
      try {
        const targetFolder = operations.folder;
        
        // Validate folder ownership if provided
        if (targetFolder) {
          const folderDoc = await Folder.findOne({
            _id: targetFolder,
            owner: req.user.id
          });
          if (!folderDoc) {
            results.errors.push('Invalid target folder');
            return res.status(400).json(results);
          }
        }

        // Get current folders for bookmark count updates
        const currentFolders = await Bookmark.distinct('folder', {
          _id: { $in: bookmarkIds }
        });

        // Update bookmarks
        const folderResult = await Bookmark.updateMany(
          { _id: { $in: bookmarkIds } },
          {
            folder: targetFolder || null,
            updatedAt: new Date()
          }
        );

        results.folderUpdates = folderResult.modifiedCount;
        results.modifiedCount += folderResult.modifiedCount;

        // Update bookmark counts for affected folders
        for (const folderId of currentFolders) {
          if (folderId) {
            const folderDoc = await Folder.findById(folderId);
            if (folderDoc) await folderDoc.updateBookmarkCount();
          }
        }

        if (targetFolder) {
          const targetFolderDoc = await Folder.findById(targetFolder);
          if (targetFolderDoc) await targetFolderDoc.updateBookmarkCount();
        }
      } catch (error) {
        results.errors.push(`Folder operation failed: ${error.message}`);
      }
    }

    // Process tag operations
    if (operations.tags && operations.tags.action && operations.tags.tags) {
      try {
        const { action, tags } = operations.tags;
        
        if (!['add', 'remove', 'replace'].includes(action)) {
          results.errors.push('Invalid tag action. Must be add, remove, or replace');
        } else {
          let tagUpdateResult;
          
          switch (action) {
            case 'add':
              tagUpdateResult = await Bookmark.updateMany(
                { _id: { $in: bookmarkIds } },
                {
                  $addToSet: { tags: { $each: tags } },
                  updatedAt: new Date()
                }
              );
              break;
              
            case 'remove':
              tagUpdateResult = await Bookmark.updateMany(
                { _id: { $in: bookmarkIds } },
                {
                  $pull: { tags: { $in: tags } },
                  updatedAt: new Date()
                }
              );
              break;
              
            case 'replace':
              tagUpdateResult = await Bookmark.updateMany(
                { _id: { $in: bookmarkIds } },
                {
                  tags: tags,
                  updatedAt: new Date()
                }
              );
              break;
          }
          
          if (tagUpdateResult) {
            results.tagUpdates = tagUpdateResult.modifiedCount;
            results.modifiedCount += tagUpdateResult.modifiedCount;
          }
        }
      } catch (error) {
        results.errors.push(`Tag operation failed: ${error.message}`);
      }
    }

    // Process visibility operations
    if (operations.visibility) {
      try {
        const validVisibilities = ['private', 'selected', 'public'];
        if (!validVisibilities.includes(operations.visibility)) {
          results.errors.push('Invalid visibility value');
        } else {
          const updateData = {
            visibility: operations.visibility,
            updatedAt: new Date()
          };

          // Clear sharedWith if not using 'selected' visibility
          if (operations.visibility !== 'selected') {
            updateData.sharedWith = [];
          }

          const visibilityResult = await Bookmark.updateMany(
            { _id: { $in: bookmarkIds } },
            updateData
          );

          results.visibilityUpdates = visibilityResult.modifiedCount;
          results.modifiedCount += visibilityResult.modifiedCount;
        }
      } catch (error) {
        results.errors.push(`Visibility operation failed: ${error.message}`);
      }
    }

    // Get updated bookmarks for response
    const updatedBookmarks = await Bookmark.find({
      _id: { $in: bookmarkIds }
    }).populate('folder', 'name color');

    results.success = results.errors.length === 0;
    results.updatedBookmarks = updatedBookmarks;

    const statusCode = results.success ? 200 : 400;
    res.status(statusCode).json(results);
  } catch (error) {
    console.error('Error in bulk edit:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      errors: [error.message]
    });
  }
});

// @route   POST /api/bookmarks/bulk-tags
// @desc    Bulk tag operations on multiple bookmarks
// @access  Private
router.post('/bulk-tags', auth, async (req, res) => {
  try {
    // Create auto-backup before write operation
    await createQuickBackup();
    
    const { bookmarkIds, action, tags } = req.body;

    // Validate input
    if (!bookmarkIds || !Array.isArray(bookmarkIds) || bookmarkIds.length === 0) {
      return res.status(400).json({ message: 'Bookmark IDs array is required' });
    }

    if (!action || !['add', 'remove', 'replace'].includes(action)) {
      return res.status(400).json({
        message: 'Valid action is required: add, remove, or replace'
      });
    }

    if (!tags || !Array.isArray(tags)) {
      return res.status(400).json({ message: 'Tags array is required' });
    }

    // Verify all bookmarks belong to the authenticated user
    const userBookmarks = await Bookmark.find({
      _id: { $in: bookmarkIds },
      owner: req.user.id
    });

    if (userBookmarks.length !== bookmarkIds.length) {
      return res.status(403).json({
        message: 'Some bookmarks do not exist or do not belong to you',
        validBookmarks: userBookmarks.map(b => b._id)
      });
    }

    let result;
    const updateData = { updatedAt: new Date() };

    switch (action) {
      case 'add':
        // Add tags without duplicating existing ones
        result = await Bookmark.updateMany(
          { _id: { $in: bookmarkIds } },
          {
            $addToSet: { tags: { $each: tags } },
            ...updateData
          }
        );
        break;
        
      case 'remove':
        // Remove specified tags
        result = await Bookmark.updateMany(
          { _id: { $in: bookmarkIds } },
          {
            $pull: { tags: { $in: tags } },
            ...updateData
          }
        );
        break;
        
      case 'replace':
        // Replace all tags with new set
        result = await Bookmark.updateMany(
          { _id: { $in: bookmarkIds } },
          {
            tags: tags,
            ...updateData
          }
        );
        break;
    }

    // Get updated bookmarks for response
    const updatedBookmarks = await Bookmark.find({
      _id: { $in: bookmarkIds }
    }).populate('folder', 'name color');

    res.json({
      success: true,
      action,
      modifiedCount: result.modifiedCount,
      updatedBookmarks,
      message: `${result.modifiedCount} bookmarks updated with ${action} tags operation`
    });
  } catch (error) {
    console.error('Error in bulk tags operation:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/bookmarks/bulk-delete
// @desc    Bulk delete multiple bookmarks
// @access  Private
router.post('/bulk-delete', auth, async (req, res) => {
  try {
    // Create auto-backup before write operation
    await createQuickBackup();
    
    const { bookmarkIds } = req.body;

    // Validate input
    if (!bookmarkIds || !Array.isArray(bookmarkIds) || bookmarkIds.length === 0) {
      return res.status(400).json({ message: 'Bookmark IDs array is required' });
    }

    // Verify all bookmarks belong to the authenticated user
    const userBookmarks = await Bookmark.find({
      _id: { $in: bookmarkIds },
      owner: req.user.id
    });

    if (userBookmarks.length !== bookmarkIds.length) {
      return res.status(403).json({
        message: 'Some bookmarks do not exist or do not belong to you',
        validBookmarks: userBookmarks.map(b => b._id)
      });
    }

    // Get affected folders for bookmark count updates
    const affectedFolders = await Bookmark.distinct('folder', {
      _id: { $in: bookmarkIds },
      folder: { $ne: null }
    });

    // Delete bookmarks
    const result = await Bookmark.deleteMany({
      _id: { $in: bookmarkIds },
      owner: req.user.id
    });

    // Update bookmark counts for affected folders
    for (const folderId of affectedFolders) {
      const folderDoc = await Folder.findById(folderId);
      if (folderDoc) await folderDoc.updateBookmarkCount();
    }

    res.json({
      success: true,
      deletedCount: result.deletedCount,
      message: `${result.deletedCount} bookmarks deleted successfully`
    });
  } catch (error) {
    console.error('Error in bulk delete:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/bookmarks/bulk-visibility
// @desc    Bulk visibility changes for multiple bookmarks
// @access  Private
router.post('/bulk-visibility', auth, async (req, res) => {
  try {
    // Create auto-backup before write operation
    await createQuickBackup();
    
    const { bookmarkIds, visibility, sharedWith } = req.body;

    // Validate input
    if (!bookmarkIds || !Array.isArray(bookmarkIds) || bookmarkIds.length === 0) {
      return res.status(400).json({ message: 'Bookmark IDs array is required' });
    }

    const validVisibilities = ['private', 'selected', 'public'];
    if (!validVisibilities.includes(visibility)) {
      return res.status(400).json({
        message: `Invalid visibility. Must be one of: ${validVisibilities.join(', ')}`
      });
    }

    // Verify all bookmarks belong to the authenticated user
    const userBookmarks = await Bookmark.find({
      _id: { $in: bookmarkIds },
      owner: req.user.id
    });

    if (userBookmarks.length !== bookmarkIds.length) {
      return res.status(403).json({
        message: 'Some bookmarks do not exist or do not belong to you',
        validBookmarks: userBookmarks.map(b => b._id)
      });
    }

    const updateData = {
      visibility: visibility,
      updatedAt: new Date()
    };

    // Handle sharedWith for 'selected' visibility
    if (visibility === 'selected') {
      if (sharedWith && Array.isArray(sharedWith)) {
        updateData.sharedWith = sharedWith;
      } else {
        updateData.sharedWith = [];
      }
    } else {
      // Clear sharedWith for other visibility types
      updateData.sharedWith = [];
    }

    // Update bookmarks
    const result = await Bookmark.updateMany(
      { _id: { $in: bookmarkIds } },
      updateData
    );

    // Get updated bookmarks for response
    const updatedBookmarks = await Bookmark.find({
      _id: { $in: bookmarkIds }
    }).populate('folder', 'name color');

    res.json({
      success: true,
      visibility,
      modifiedCount: result.modifiedCount,
      updatedBookmarks,
      message: `${result.modifiedCount} bookmarks updated to ${visibility} visibility`
    });
  } catch (error) {
    console.error('Error in bulk visibility change:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/bookmarks/bulk-share
// @desc    Bulk share multiple bookmarks with users
// @access  Private
router.post('/bulk-share', auth, async (req, res) => {
  try {
    // Create auto-backup before write operation
    await createQuickBackup();
    
    const { bookmarkIds, userIds, message } = req.body;

    // Validate input
    if (!bookmarkIds || !Array.isArray(bookmarkIds) || bookmarkIds.length === 0) {
      return res.status(400).json({ message: 'Bookmark IDs array is required' });
    }

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'User IDs array is required' });
    }

    // Verify all bookmarks belong to the authenticated user
    const userBookmarks = await Bookmark.find({
      _id: { $in: bookmarkIds },
      owner: req.user.id
    });

    if (userBookmarks.length !== bookmarkIds.length) {
      return res.status(403).json({
        message: 'Some bookmarks do not exist or do not belong to you',
        validBookmarks: userBookmarks.map(b => b._id)
      });
    }

    // Update bookmarks to set visibility to 'selected' and add shared users
    const result = await Bookmark.updateMany(
      { _id: { $in: bookmarkIds } },
      {
        visibility: 'selected',
        $addToSet: { sharedWith: { $each: userIds } },
        updatedAt: new Date()
      }
    );

    // Get updated bookmarks for response
    const updatedBookmarks = await Bookmark.find({
      _id: { $in: bookmarkIds }
    }).populate('folder', 'name color');

    // TODO: Implement notification system to notify shared users
    if (message) {
      console.log('Share message:', message);
      // Here you would typically send notifications to the shared users
    }

    res.json({
      success: true,
      sharedCount: result.modifiedCount,
      sharedWith: userIds.length,
      updatedBookmarks,
      message: `${result.modifiedCount} bookmarks shared with ${userIds.length} users`
    });
  } catch (error) {
    console.error('Error in bulk share:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/bookmarks/deduplicate
// @desc    Find and optionally remove duplicate bookmarks (same URL) for the current user
// @access  Private
router.post('/deduplicate', auth, async (req, res) => {
  try {
    const { remove = false } = req.body;
    const userId = req.user.id;

    const bookmarks = await Bookmark.find({ owner: userId }).lean();

    // Group by URL (case-insensitive, trimmed)
    const grouped = {};
    for (const bm of bookmarks) {
      const url = bm.url?.trim().toLowerCase();
      if (!url) continue;
      if (!grouped[url]) grouped[url] = [];
      grouped[url].push(bm);
    }

    const duplicateGroups = Object.values(grouped).filter(bms => bms.length > 1);
    const totalDuplicateUrls = duplicateGroups.length;

    if (totalDuplicateUrls === 0) {
      return res.json({ duplicates: [], totalDuplicateUrls: 0, removedCount: 0, message: 'No duplicate bookmarks found' });
    }

    // For each group, keep the most complete bookmark, mark rest for removal
    const toRemove = [];

    for (const bms of duplicateGroups) {
      bms.sort((a, b) => {
        const scoreA = (a.description ? 2 : 0) + (a.notes ? 1 : 0) + (a.tags?.length || 0);
        const scoreB = (b.description ? 2 : 0) + (b.notes ? 1 : 0) + (b.tags?.length || 0);
        if (scoreB !== scoreA) return scoreB - scoreA;
        return new Date(a.createdAt) - new Date(b.createdAt);
      });
      toRemove.push(...bms.slice(1));
    }

    let removedCount = 0;

    if (remove && toRemove.length > 0) {
      await createQuickBackup();
      const ids = toRemove.map(b => b._id);
      const result = await Bookmark.deleteMany({ _id: { $in: ids }, owner: userId });
      removedCount = result.deletedCount;
    }

    const duplicates = duplicateGroups.map(bms => ({
      url: bms[0].url,
      keep: { _id: bms[0]._id, title: bms[0].title },
      remove: bms.slice(1).map(b => ({ _id: b._id, title: b.title }))
    }));

    res.json({
      duplicates,
      totalDuplicateUrls,
      totalDuplicates: toRemove.length,
      removedCount,
      message: remove
        ? `Removed ${removedCount} duplicate bookmark(s)`
        : `Found ${totalDuplicateUrls} URL(s) with ${toRemove.length} duplicate(s)`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/bookmarks
// @desc    Get all bookmarks (filtered by visibility and ownership)
// @access  Private
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

// @route   GET /api/bookmarks/shared-with-me
// @desc    Get bookmarks shared with the current user
// @access  Private
router.get('/shared-with-me', auth, async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;

    const bookmarks = await Bookmark.find({
      sharedWith: req.user.id,
      owner: { $ne: req.user.id }
    })
    .populate('owner', 'username')
    .sort({ updatedAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Bookmark.countDocuments({
      sharedWith: req.user.id,
      owner: { $ne: req.user.id }
    });

    res.json({
      bookmarks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching shared bookmarks:', error);
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
    // Create auto-backup before write operation
    await createQuickBackup();
    
    const { title, url, description, tags, folder, favicon: rawFavicon, notes } = req.body;
    const requestTags = req.body.tags;
    const finalTags = requestTags || [];

    if (folder) {
      const folderDoc = await Folder.findOne({
        _id: folder,
        owner: req.user.id
      });
      if (!folderDoc) {
        return res.status(400).json({ message: 'Invalid folder' });
      }
    }

    let favicon = rawFavicon;
    if (favicon && !favicon.startsWith('http://') && !favicon.startsWith('https://')) {
      favicon = '';
    }
    if (!favicon) {
      try { favicon = `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}`; } catch { favicon = ''; }
    }

    const processedTags = normalizeTags(finalTags);
    const bookmark = new Bookmark({
      title,
      url,
      description,
      tags: processedTags,
      folder: folder || null,
      owner: req.user.id,
      favicon,
      notes: notes || '',
      visibility: req.body.visibility || 'private',
      sharedWith: Array.isArray(req.body.sharedWith) ? req.body.sharedWith : []
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
    // Create auto-backup before write operation
    await createQuickBackup();
    
    const bookmark = await Bookmark.findById(req.params.id);

    if (!bookmark) {
      return res.status(404).json({ message: 'Bookmark not found' });
    }

    // Check if user owns this bookmark
    if (bookmark.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this bookmark' });
    }

    // Validate folder ownership if provided
    if (req.body.folder) {
      const folderDoc = await Folder.findOne({
        _id: req.body.folder,
        owner: req.user.id
      });
      if (!folderDoc) {
        return res.status(400).json({ message: 'Invalid folder' });
      }
    }

    let updateData = { ...req.body, updatedAt: new Date() };

    if (req.body.tags !== undefined) {
      updateData.tags = normalizeTags(req.body.tags);
    } else {
      updateData.tags = updateData.tags || [];
    }

    if (updateData.favicon && !updateData.favicon.startsWith('http://') && !updateData.favicon.startsWith('https://')) {
      delete updateData.favicon;
    }

    const updatedBookmark = await Bookmark.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('folder', 'name color');

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
    // Create auto-backup before write operation
    await createQuickBackup();
    
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
    // Create auto-backup before write operation
    await createQuickBackup();
    
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

export default router;
