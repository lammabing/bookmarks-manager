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

// Indexes for performance
folderSchema.index({ owner: 1, parent: 1 });
folderSchema.index({ owner: 1, name: 1 });

// Prevent circular references
folderSchema.pre('save', async function(next) {
  if (this.parent) {
    const checkCircular = async (folderId, targetParentId) => {
      if (folderId.toString() === targetParentId.toString()) {
        throw new Error('Circular reference detected');
      }

      const parentFolder = await mongoose.model('Folder').findById(targetParentId);
      if (parentFolder && parentFolder.parent) {
        await checkCircular(folderId, parentFolder.parent);
      }
    };

    await checkCircular(this._id, this.parent);
  }
  next();
});

// Update timestamp on save
folderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Update bookmark count when bookmarks are added/removed
folderSchema.methods.updateBookmarkCount = async function() {
  const Bookmark = mongoose.model('Bookmark');
  this.bookmarkCount = await Bookmark.countDocuments({ folder: this._id });
  await this.save();
};

export default mongoose.model('Folder', folderSchema);
