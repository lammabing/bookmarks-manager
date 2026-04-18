# Database Models

MongoDB schema definitions and relationships using Mongoose ODM.

## Overview

The application uses **4 MongoDB collections**:

| Collection | Model | Purpose |
|------------|-------|---------|
| `users` | User | User authentication and profiles |
| `bookmarks` | Bookmark | User bookmarks with metadata |
| `folders` | Folder | Hierarchical folder organization |
| `bookmarkextensions` | BookmarkExtension | Custom extensions (notes, comments) |

---

## User Model

**File**: `models/User.js`

### Schema

```javascript
{
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true  // Automatically converts to lowercase
  },
  password: {
    type: String,
    required: true,
    minlength: 6  // Plain text before hashing
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

### Pre-Save Hooks

1. **Password Hashing**:
   ```javascript
   userSchema.pre('save', async function(next) {
     if (!this.isModified('password')) return next();
     const salt = await bcrypt.genSalt(10);
     this.password = await bcrypt.hash(this.password, salt);
     next();
   });
   ```
   - Only hashes when password is new or changed
   - Uses 10 salt rounds (OWASP recommendation)

2. **Timestamp Update**:
   ```javascript
   userSchema.pre('save', function(next) {
     this.updatedAt = new Date();
     next();
   });
   ```

### Instance Methods

```javascript
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
}
```

**Usage**:
```javascript
const user = await User.findOne({ email });
const isMatch = await user.comparePassword(plainTextPassword);
```

### Indexes

- Automatic unique indexes on `username` and `email` (from `unique: true`)

### Example Document

```json
{
  "_id": "69b196cd36a03ff278ab64a0",
  "username": "admin",
  "email": "admin@example.com",
  "password": "$2a$10$XYZ...",  // bcrypt hash
  "createdAt": "2026-03-31T00:36:42.000Z",
  "updatedAt": "2026-04-09T04:52:00.000Z",
  "__v": 0
}
```

---

## Bookmark Model

**File**: `models/Bookmark.js`

### Schema

```javascript
{
  url: { 
    type: String, 
    required: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String 
  },
  tags: [String],  // Array of strings
  favicon: { 
    type: String 
  },
  notes: { 
    type: String 
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  folder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    default: null
  },
  visibility: {
    type: String,
    enum: ['private', 'selected', 'public'],
    default: 'private'
  },
  sharedWith: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}
```

### Pre-Save Hooks

```javascript
bookmarkSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});
```

Automatically updates `updatedAt` on every save.

### Visibility Levels

| Value | Description | Who Can See |
|-------|-------------|-------------|
| `private` | Only owner | Owner only |
| `selected` | Shared with specific users | Owner + users in `sharedWith` |
| `public` | Anyone can view | Everyone (even unauthenticated via `/api/bookmarks/public`) |

### Example Document

```json
{
  "_id": "69847f18e9e709d18915ed51",
  "url": "https://github.com",
  "title": "GitHub",
  "description": "Dev Repos",
  "tags": ["dev", "downloads"],
  "favicon": "https://www.google.com/s2/favicons?domain=github.com",
  "notes": "",
  "owner": "69b196cd36a03ff278ab64a0",
  "folder": "69847f18e9e709d18915ed99",
  "visibility": "private",
  "sharedWith": [],
  "createdAt": "2026-02-05T11:29:28.756Z",
  "updatedAt": "2026-04-07T06:06:18.932Z",
  "__v": 0
}
```

### Common Queries

**Get user's bookmarks**:
```javascript
Bookmark.find({ owner: userId })
```

**Get bookmarks in folder**:
```javascript
Bookmark.find({ owner: userId, folder: folderId })
```

**Search bookmarks**:
```javascript
Bookmark.find({ 
  owner: userId,
  $or: [
    { title: { $regex: query, $options: 'i' } },
    { description: { $regex: query, $options: 'i' } }
  ]
})
```

**Filter by tags**:
```javascript
Bookmark.find({ 
  owner: userId,
  tags: { $in: tagArray }
})
```

**Get shared-with-me bookmarks**:
```javascript
Bookmark.find({ 
  sharedWith: userId,
  visibility: 'selected'
})
```

---

## Folder Model

**File**: `models/Folder.js`

### Schema

```javascript
{
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
    default: null  // null = root-level folder
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
    default: '#3B82F6',  // Blue
    match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/  // Valid hex color
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
}
```

### Indexes

```javascript
folderSchema.index({ owner: 1, parent: 1 });
folderSchema.index({ owner: 1, name: 1 });
```

Optimizes queries filtering by owner and parent/name.

### Pre-Save Hooks

**Circular Reference Prevention**:
```javascript
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
```

Prevents folders from being their own ancestors.

### Instance Methods

```javascript
folderSchema.methods.updateBookmarkCount = async function() {
  const Bookmark = mongoose.model('Bookmark');
  this.bookmarkCount = await Bookmark.countDocuments({ folder: this._id });
  await this.save();
};
```

**Usage**:
```javascript
const folder = await Folder.findById(folderId);
await folder.updateBookmarkCount();
```

### Example Document

```json
{
  "_id": "69847f18e9e709d18915ed99",
  "name": "Development",
  "description": "Dev resources",
  "parent": null,
  "owner": "69b196cd36a03ff278ab64a0",
  "isRoot": true,
  "order": 0,
  "color": "#3B82F6",
  "icon": "folder",
  "bookmarkCount": 42,
  "createdAt": "2026-02-05T11:29:28.756Z",
  "updatedAt": "2026-04-07T06:06:18.932Z",
  "__v": 0
}
```

### Hierarchy Building

Folders are stored flat but built into a tree client-side:

```javascript
function buildFolderTree(folders) {
  const folderMap = {};
  const tree = [];
  
  // Create map
  folders.forEach(folder => {
    folderMap[folder._id] = { ...folder, children: [] };
  });
  
  // Build tree
  folders.forEach(folder => {
    if (folder.parent && folderMap[folder.parent]) {
      folderMap[folder.parent].children.push(folderMap[folder._id]);
    } else {
      tree.push(folderMap[folder._id]);
    }
  });
  
  return tree;
}
```

---

## BookmarkExtension Model

**File**: `models/BookmarkExtension.js`

### Schema

```javascript
{
  bookmarkId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bookmark',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['note', 'comment', 'image', 'discussion', 'custom'],
    required: true
  },
  content: {
    type: mongoose.Schema.Types.Mixed  // Can be string, object, or array
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed  // Optional metadata
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

### Extension Types

| Type | Content | Use Case |
|------|---------|----------|
| `note` | String | Personal notes about bookmark |
| `comment` | String | Comments (potential multi-user) |
| `image` | URL or base64 | Screenshots or related images |
| `discussion` | Array of objects | Threaded discussions |
| `custom` | Any | Arbitrary custom data |

### Example Document

```json
{
  "_id": "...",
  "bookmarkId": "69847f18e9e709d18915ed51",
  "type": "note",
  "content": "Important resource for React hooks",
  "metadata": {
    "author": "admin",
    "priority": "high"
  },
  "createdAt": "2026-04-07T06:06:18.932Z",
  "updatedAt": "2026-04-07T06:06:18.932Z"
}
```

---

## Relationships

### Entity Relationship Diagram

```
┌─────────────┐
│    User     │
│             │
│  _id (PK)   │
│  username   │
│  email      │
│  password   │
└──────┬──────┘
       │
       │ 1
       │
       │
       │ N
       │
  ┌────┴────────────┐         ┌──────────────────────┐
  │                  │  N    N │                       │
  │   Bookmark       │◄──────►│  Bookmark             │
  │                  │         │  Extension            │
  │  _id (PK)        │         │                       │
  │  owner (FK) ─────┼────┐    │  bookmarkId (FK)      │
  │  folder (FK) ────┼──┐ │    │  type                 │
  │  visibility      │  │ │    │  content              │
  │  sharedWith ─────┼──┼─┼────┘  metadata             │
  │  tags []         │  │ │    └───────────────────────┘
  └──────────────────┘  │ │
                        │ │
                        │ │ N
                        │ │
                        │ │  ┌────────────────────┐
                        │ └──┤  Folder             │
                        │    │                     │
                        └───►│  _id (PK)           │
                             │  owner (FK) ────────┼──┐
                             │  parent (FK) ───────┼─┐│
                             │  name               │││
                             │  color              │││
                             │  icon               │││
                             └─────────────────────┘││
                                                     ││
                                                     ││
                        Self-referencing: parent ────┘│
                                                       │
                        Recursive hierarchy ───────────┘
```

### Relationship Types

| Relationship | Type | Implementation |
|--------------|------|----------------|
| **User → Bookmarks** | One-to-Many | `Bookmark.owner` references `User._id` |
| **User → Folders** | One-to-Many | `Folder.owner` references `User._id` |
| **Folder → Bookmarks** | One-to-Many | `Bookmark.folder` references `Folder._id` |
| **Folder → Folders** | Self-Referencing | `Folder.parent` references `Folder._id` |
| **Bookmark → Extensions** | One-to-Many | `BookmarkExtension.bookmarkId` references `Bookmark._id` |
| **User → Bookmarks (shared)** | Many-to-Many | `Bookmark.sharedWith[]` array of `User._id` |

### Cascade Behavior

**MongoDB does NOT support cascading deletes**. The application handles this manually:

| Action | Application Behavior |
|--------|---------------------|
| **Delete User** | Bookmarks/folders NOT deleted (orphaned) |
| **Delete Folder** | Bookmarks moved to parent folder (or null) |
| **Delete Bookmark** | Extensions NOT deleted (orphaned) |
| **Move Folder** | All child bookmarks move with it |

---

## Database Operations

### Connection

```javascript
import mongoose from 'mongoose';

await mongoose.connect(process.env.MONGODB_URI);
// Default: mongodb://localhost:27017/bookmarking-app
```

### Common Patterns

**Find and Populate**:
```javascript
const bookmark = await Bookmark.findById(id)
  .populate('owner', 'username email')
  .populate('folder', 'name');
```

**Aggregation (Tags with counts)**:
```javascript
const tags = await Bookmark.aggregate([
  { $match: { owner: userId } },
  { $unwind: '$tags' },
  { $group: { _id: '$tags', count: { $sum: 1 } } },
  { $sort: { count: -1 } }
]);
```

**Bulk Operations**:
```javascript
await Bookmark.updateMany(
  { _id: { $in: bookmarkIds }, owner: userId },
  { $set: { folder: newFolderId } }
);
```

---

## Indexes Summary

| Collection | Fields | Type | Purpose |
|------------|--------|------|---------|
| `users` | username | Unique | Fast lookup |
| `users` | email | Unique | Fast lookup |
| `folders` | owner, parent | Compound | Folder queries |
| `folders` | owner, name | Compound | Folder listing |
| `bookmarkextensions` | bookmarkId | Single | Extension queries |

### Recommended Additional Indexes

```javascript
// Bookmarks by owner
Bookmark.schema.index({ owner: 1 });

// Bookmarks by visibility
Bookmark.schema.index({ visibility: 1 });

// Bookmarks for search
Bookmark.schema.index({ title: 'text', description: 'text' });

// Shared bookmarks lookup
Bookmark.schema.index({ sharedWith: 1 });
```

---

## Data Validation

### Mongoose Validation

| Field | Validation | Error Message |
|-------|-----------|---------------|
| `username` | required, 3-30 chars, trim | "Path `username` is required" |
| `email` | required, valid email, lowercase | "Email is invalid" |
| `password` | required, min 6 chars | "Password too short" |
| `folder.name` | required, max 100 chars | "Name is required" |
| `folder.color` | hex color pattern | "Invalid color format" |

### Custom Validation

**Folder Circular Reference**:
```javascript
// Throws error if folder would be its own ancestor
if (folderId === targetParentId) {
  throw new Error('Circular reference detected');
}
```

**Folder Ownership**:
```javascript
// Middleware validates folder belongs to user
const folder = await Folder.findOne({ _id: folderId, owner: userId });
if (!folder) throw new Error('Folder not found or access denied');
```

---

*Last Updated: April 9, 2026*
