import mongoose from 'mongoose';

const folderSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 100
  },
  description: { 
    type: String,
    trim: true,
    maxlength: 500
  },
  parent: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Folder',
    default: null 
  },
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  isRoot: { 
    type: Boolean, 
    default: false 
  },
  order: { 
    type: Number, 
    default: 0 
  },
  color: { 
    type: String, 
    default: '#3B82F6',
    match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  },
  icon: { 
    type: String, 
    default: 'folder',
    maxlength: 50
  },
  bookmarkCount: {
    type: Number,
    default: 0
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update the updatedAt timestamp before saving
folderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Prevent circular references
folderSchema.pre('save', async function(next) {
  if (this.parent && this.parent.equals(this._id)) {
    return next(new Error('A folder cannot be its own parent'));
  }
  
  // Check for circular references in the hierarchy
  if (this.parent) {
    let current = this.parent;
    const visited = new Set([this._id]);
    
    while (current) {
      if (visited.has(current.toString())) {
        return next(new Error('Circular reference detected in folder hierarchy'));
      }
      visited.add(current.toString());
      
      const parentFolder = await mongoose.model('Folder').findById(current);
      if (!parentFolder) break;
      current = parentFolder.parent;
    }
  }
  
  next();
});

// Update bookmark count when bookmarks are added/removed
folderSchema.methods.updateBookmarkCount = async function() {
  const Bookmark = mongoose.model('Bookmark');
  this.bookmarkCount = await Bookmark.countDocuments({ folder: this._id });
  await this.save();
};

// Get full folder path for breadcrumbs
folderSchema.methods.getPath = async function() {
  const path = [];
  let current = this;
  
  while (current) {
    path.unshift({
      _id: current._id,
      name: current.name
    });
    if (current.parent) {
      current = await mongoose.model('Folder').findById(current.parent);
    } else {
      break;
    }
  }
  
  return path;
};

// Get all descendant folder IDs
folderSchema.methods.getDescendantIds = async function() {
  const descendantIds = [this._id];
  const children = await mongoose.model('Folder').find({ parent: this._id });
  
  for (const child of children) {
    const childDescendants = await child.getDescendantIds();
    descendantIds.push(...childDescendants);
  }
  
  return descendantIds;
};

// Indexes for performance
folderSchema.index({ owner: 1, parent: 1 });
folderSchema.index({ owner: 1, name: 1 });
folderSchema.index({ parent: 1 });

const Folder = mongoose.model('Folder', folderSchema);

export default Folder;