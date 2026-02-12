import express from 'express';
import Bookmark from '../models/Bookmark.js';
import Folder from '../models/Folder.js';
import { auth } from '../middleware/auth.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// @route   GET /api/bookmarks/public
// @desc    Get all public bookmarks (no auth required)
// @access  Public
router.get('/public', async (req, res) => {
  try {
    console.log('=== PUBLIC BOOKMARKS REQUEST ===');
    console.log('Query params:', req.query);

    const { page = 1, limit = 12 } = req.query;

    const bookmarks = await Bookmark.find({
      visibility: 'public'
    })
    .populate('owner', 'username')
    .sort({ updatedAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

    console.log(`Found ${bookmarks.length} public bookmarks`);

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
    console.log('=== BOOKMARK CREATION REQUEST ===');
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Request body:', req.body);
    console.log('Request body tags type:', typeof req.body.tags, 'value:', req.body.tags);
    console.log('Request body tags is undefined:', req.body.tags === undefined);
    console.log('Request body tags is null:', req.body.tags === null);
    const { title, url, description, tags, folder, favicon, notes } = req.body;
    
    // Ensure tags is explicitly handled even if not in destructuring
    const requestTags = req.body.tags;
    console.log('Explicitly extracted tags from req.body.tags:', requestTags);
    
    // Validation: Check if tags field exists in request
    if (!('tags' in req.body)) {
      console.log('WARNING: Tags field is missing from request body!');
    }
    
    // Force tags to be an array even if undefined
    const finalTags = requestTags || [];
    console.log('Final tags after forcing array:', finalTags);

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

    // Ensure tags is always an array of strings
    let processedTags = [];
    console.log('Processing tags - input tags type:', typeof finalTags, 'value:', finalTags);
    
    // Handle undefined or null tags
    if (!finalTags) {
      console.log('Tags is null or undefined, using empty array');
      processedTags = [];
    } else if (Array.isArray(finalTags)) {
      // If tags is an array, extract just the names
      processedTags = finalTags
        .map(tag => {
          if (typeof tag === 'string') {
            return tag.trim();
          } else if (tag && typeof tag === 'object' && tag.name) {
            return tag.name.trim();
          }
          return null;
        })
        .filter(tag => tag && tag.length > 0);
      console.log('Processed tags from array:', processedTags);
    } else if (typeof finalTags === 'string') {
      // If tags is a string, split by comma
      processedTags = finalTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      console.log('Processed tags from string:', processedTags);
    } else {
      console.log('Tags is unexpected type, using empty array');
      processedTags = [];
    }

    console.log('Creating bookmark with processedTags:', processedTags);
    const bookmark = new Bookmark({
      title,
      url,
      description,
      tags: processedTags,
      folder: folder || null,
      owner: req.user.id,
      favicon: favicon || `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}`,
      notes: notes || '',
      visibility: req.body.visibility || 'private',
      sharedWith: Array.isArray(req.body.sharedWith) ? req.body.sharedWith : []
    });
    console.log('Bookmark object before save:', bookmark);

    await bookmark.save();

    console.log('Bookmark saved successfully:', bookmark);
    console.log('Saved bookmark tags:', bookmark.tags);

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

    // Process tags if provided
    let updateData = { ...req.body, updatedAt: new Date() };
    console.log('Update bookmark - req.body:', req.body);
    console.log('Update bookmark - req.body.tags type:', typeof req.body.tags, 'value:', req.body.tags);
    
    if (req.body.tags !== undefined) {
      // Ensure tags is always an array of strings
      let processedTags = [];
      console.log('Processing tags for update - input tags type:', typeof req.body.tags, 'value:', req.body.tags);
      
      // Handle undefined or null tags
      if (!req.body.tags) {
        console.log('Tags is null or undefined for update, using empty array');
        processedTags = [];
      } else if (Array.isArray(req.body.tags)) {
        // If tags is an array, extract just the names
        processedTags = req.body.tags
          .map(tag => {
            if (typeof tag === 'string') {
              return tag.trim();
            } else if (tag && typeof tag === 'object' && tag.name) {
              return tag.name.trim();
            }
            return null;
          })
          .filter(tag => tag && tag.length > 0);
        console.log('Processed tags from array for update:', processedTags);
      } else if (typeof req.body.tags === 'string') {
        // If tags is a string, split by comma
        processedTags = req.body.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
        console.log('Processed tags from string for update:', processedTags);
      } else {
        console.log('Tags is unexpected type for update, using empty array');
        processedTags = [];
      }
      updateData.tags = processedTags;
    } else {
      // Ensure tags is always an array
      updateData.tags = updateData.tags || [];
      console.log('Tags not provided in update, using existing or empty array:', updateData.tags);
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

// @route   GET /api/bookmarks/shared-with-me
// @desc    Get bookmarks shared with the current user
// @access  Private
router.get('/shared-with-me', auth, async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;

    const bookmarks = await Bookmark.find({
      sharedWith: req.user.id,
      owner: { $ne: req.user.id } // Exclude user's own bookmarks
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

export default router;
