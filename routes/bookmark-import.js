import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import BookmarkImporter from '../src/utils/BookmarkImporter.js';
import User from '../models/User.js';

const router = express.Router();

// Configure multer for file uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, 'bookmarks_' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Only allow HTML files
    if (file.originalname.toLowerCase().endsWith('.html') || file.originalname.toLowerCase().endsWith('.htm')) {
      cb(null, true);
    } else {
      cb(new Error('Only HTML files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Create uploads directory if it doesn't exist
import fs from 'fs';
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// POST /api/import
router.post('/', upload.single('bookmarksFile'), async (req, res) => {
  try {
    // Check if user is authenticated (this assumes you have authentication middleware)
    // For now, we'll get the user from the token in the request
    const token = req.headers.authorization?.split(' ')[1]; // Bearer token
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify token and get user (assuming you have jwt installed and configured)
    const jwt = await import('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by ID
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Validate file extension
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    if (fileExtension !== '.html' && fileExtension !== '.htm') {
      return res.status(400).json({ error: 'Invalid file type. Only HTML files are allowed.' });
    }

    // Create importer instance
    const importer = new BookmarkImporter(user._id);

    // Import bookmarks from uploaded file
    const result = await importer.importFromFile(req.file.path);

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        foldersImported: result.foldersImported,
        bookmarksImported: result.bookmarksImported
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Bookmark import error:', error);
    
    // Clean up uploaded file if it exists
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting uploaded file:', unlinkError);
      }
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }

    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to import bookmarks'
    });
  }
});

export default router;