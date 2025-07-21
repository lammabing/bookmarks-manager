import express from 'express';
import mongoose from 'mongoose';
import Folder from '../models/Folder.js';
import Bookmark from '../models极/Bookmark.js';
import auth from '../middleware/auth.js';
import { 
  validateFolderOwnership, 
  validateFolderData, 
  validateFolderParent 
} from '../middleware/folderValidation.js';

const router = express.Router();

// Helper function to build folder tree
const buildFolderTree = (folders, parentId = null) => {
  const folderTree = [];
  const children = folders.filter(folder => 
    (folder.parent && folder.parent.equals(parentId)) || 
    (!folder.parent && !parentId)
  );
  
  for (const child of children) {
    const subtree = buildFolderTree(folders, child._id);
    folderTree.push({
      ...child._doc,
      children: subtree
    });
  }
  
  return folderTree;
};

// Create a new folder
router.post('/', 
  auth, 
  validateFolderData, 
  validateFolderParent, 
  async (req, res) => {
    try {
      const { name, description, parent, color, icon } = req.body;
      const folder = new Folder({
        name,
        description,
        parent: parent || null,
        owner: req.user._id,
        color: color || '#3B82F6',
        icon: icon || 'folder'
      });
      
      await folder.save();
      res.status(201).send(folder);
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
  }
);

// Get all folders for the current user (tree structure)
router.get('/', auth, async (req, res) => {
  try {
    const folders = await Folder.find({ owner: req.user._id });
    const folderTree = buildFolderTree(folders);
    res.send(folderTree);
  } catch (error) {
    res.status(500).send({ error: 'Error fetching folders' });
  }
});

// Get a specific folder
router.get('/:id', 
  auth, 
  validateFolderOwnership, 
  async (极req, res) => {
    res.send(req.folder);
  }
);

// Update a folder
router.put('/:id', 
  auth, 
  validateFolderOwnership,
  validateFolderData, 
  validateFolderParent,
  async (req, res) => {
    try {
      const { name, description, parent, color, icon } = req.body;
      const folder = await Folder.findOneAndUpdate(
        { _id: req.params.id },
        { name, description, parent, color, icon },
        { new: true, runValidators: true }
      );
      
      res.send(folder);
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
  }
);

// Delete a folder and move its bookmarks to parent
router.delete('/:id', 
  auth, 
  validateFolderOwnership,
  async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      const folder = req.folder;
      
      // Move bookmarks to parent folder or set to null
      await Bookmark.updateMany(
        { folder: folder._id },
        { folder: folder.parent },
        { session }
      );
      
      // Recursively delete child folders
      const deleteFolderAndChildren = async (folderId) => {
        const children = await Folder.find({ parent: folderId }).session(session);
        for (const child of children) {
          await deleteFolderAndChildren(child._id);
        }
        await Folder.deleteOne({ _id: folderId }).session(session);
      };
      
      await deleteFolderAndChildren(folder._id);
      
      await session.commitTransaction();
      session.endSession();
      res.send({ message: 'Folder deleted successfully' });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      res.status(500).send({ error: 'Error deleting folder' });
    }
  }
);

// Get bookmarks in a folder
router.get('/:id/bookmarks', 
  auth, 
  validateFolderOwnership, 
  async (req, res) => {
    try {
      const bookmarks = await Bookmark.find({
        folder: req.params.id,
        owner: req.user._id
      });
      res.send(bookmarks);
    } catch (error) {
      res.status(500).send({ error: 'Error fetching bookmarks' });
    }
  }
);

export default router;