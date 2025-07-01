import express from 'express';
const router = express.Router();
import BookmarkExtension from '../models/BookmarkExtension.js';

// Get all extensions for a bookmark
router.get('/bookmarks/:bookmarkId/extensions', async (req, res) => {
  try {
    const extensions = await BookmarkExtension.find({ bookmarkId: req.params.bookmarkId });
    res.json(extensions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new extension for a bookmark
router.post('/bookmarks/:bookmarkId/extensions', async (req, res) => {
  try {
    const { type, content, metadata } = req.body;
    const extension = new BookmarkExtension({
      bookmarkId: req.params.bookmarkId,
      type,
      content,
      metadata
    });
    await extension.save();
    res.status(201).json(extension);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update an extension
router.put('/extensions/:extensionId', async (req, res) => {
  try {
    const { type, content, metadata } = req.body;
    const extension = await BookmarkExtension.findByIdAndUpdate(
      req.params.extensionId,
      { type, content, metadata, updatedAt: Date.now() },
      { new: true }
    );
    if (!extension) return res.status(404).json({ error: 'Extension not found' });
    res.json(extension);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete an extension
router.delete('/extensions/:extensionId', async (req, res) => {
  try {
    const extension = await BookmarkExtension.findByIdAndDelete(req.params.extensionId);
    if (!extension) return res.status(404).json({ error: 'Extension not found' });
    res.json({ message: 'Extension deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
