import Folder from '../models/Folder.js';
import mongoose from 'mongoose';

// Validate folder ownership
export const validateFolderOwnership = async (req, res, next) => {
  try {
    const folder = await Folder.findById(req.params.id);
    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }
    
    if (!folder.owner.equals(req.user._id)) {
      return res.status(403).json({ error: 'Not authorized to access this folder' });
    }
    
    req.folder = folder;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Error validating folder ownership' });
  }
};

// Validate folder data
export const validateFolderData = (req, res, next) => {
  const { name } = req.body;
  
  if (!name || name.trim().length === 0) {
    return res.status(400).json({ error: 'Folder name is required' });
  }
  
  if (name.length > 100) {
    return res.status(400).json({ error: 'Folder name must be 100 characters or less' });
  }
  
  next();
};

// Validate folder parent
export const validateFolderParent = async (req, res, next) => {
  const { parent } = req.body;
  
  if (parent) {
    if (!mongoose.Types.ObjectId.isValid(parent)) {
      return res.status(400).json({ error: 'Invalid parent folder ID' });
    }
    
    const parentFolder = await Folder.findById(parent);
    if (!parentFolder) {
      return res.status(400).json({ error: 'Parent folder not found' });
    }
    
    if (!parentFolder.owner.equals(req.user._id)) {
      return res.status(403).json({ error: 'Not authorized to use this parent folder' });
    }
  }
  
  next();
};