const mongoose = require('mongoose');

const BookmarkExtensionSchema = new mongoose.Schema({
  bookmarkId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bookmark',
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['note', 'comment', 'image', 'discussion', 'custom'] // Extend as needed
  },
  content: {
    type: mongoose.Schema.Types.Mixed, // Can be string, object, etc.
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
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

BookmarkExtensionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('BookmarkExtension', BookmarkExtensionSchema);
