# State Management

React Context API architecture, data flow, and state patterns.

## Overview

The application uses **React Context API** exclusively for global state management—no Redux, Zustand, or other libraries.

### Why Context API?

| Advantage | Impact |
|-----------|--------|
| Built into React | No additional dependencies |
| Simple API | Easy to understand and maintain |
| Good for small-medium apps | ~15K LOC, ~50 components |
| No boilerplate | No actions, reducers, selectors |

| Limitation | Mitigation |
|------------|------------|
| Re-renders all consumers | Memoization and careful context splitting |
| No middleware | Manual handling in context |
| No devtools | Console logging for debugging |

---

## Context Architecture

### Provider Tree

```
App.jsx
└── AuthProvider (outer)
    └── FolderProvider
        └── BookmarkProvider
            └── TagProvider
                └── FontProvider
                    └── ToastProvider
                        └── Routes/Pages (consumers)
```

**Nesting Order Rationale**:
1. **Auth** (outermost) - All other contexts depend on authentication
2. **Folder** - Bookmarks need folders to exist
3. **Bookmark** - Core application data
4. **Tag** - Tags are derived from bookmarks
5. **Font** - UI customization, independent
6. **Toast** (innermost) - Needs access to all other contexts

---

## AuthContext

**File**: `src/contexts/AuthContext.jsx`

### State

```javascript
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);
const [isAuthenticated, setIsAuthenticated] = useState(false);
```

### Methods

| Method | Parameters | Description |
|--------|-----------|-------------|
| `login` | email, password | Authenticates user, stores token |
| `register` | username, email, password | Creates account, stores token |
| `logout` | - | Clears token and state |
| `checkAuthStatus` | - | Verifies token with /api/users/me |

### Hook

```javascript
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, login, logout, isAuthenticated, loading } = useAuth();
}
```

### Cross-Tab Synchronization

```javascript
// Listen for storage changes
window.addEventListener('storage', (e) => {
  if (e.key === 'token') {
    if (e.newValue) {
      // Token added in another tab - login
      checkAuthStatus();
    } else {
      // Token removed in another tab - logout
      setUser(null);
      setIsAuthenticated(false);
    }
  }
});
```

**Behavior**:
- Login in Tab A → Tab B auto-logs in
- Logout in Tab A → Tab B auto-logs out
- Token refresh in Tab A → Tab B syncs

### Optimistic Authentication

```javascript
const login = async (email, password) => {
  // Optimistic: set authenticated immediately
  setIsAuthenticated(true);
  
  try {
    const data = await authApi.login({ email, password });
    localStorage.setItem('token', data.token);
    setUser(data.user);
  } catch (error) {
    // Revert on failure
    setIsAuthenticated(false);
    throw error;
  }
};
```

### Token Extension Sync

On successful login, token is sent to Chrome extension:

```javascript
try {
  await chrome.runtime.sendMessage(extensionId, {
    action: 'set_auth_token',
    token: data.token
  });
} catch (e) {
  // Extension not installed
}
```

---

## BookmarkContext

**File**: `src/contexts/BookmarkContext.jsx`

### State

```javascript
const [bookmarks, setBookmarks] = useState([]);
const [loading, setLoading] = useState(false);
```

### Methods

| Method | Parameters | Description |
|--------|-----------|-------------|
| `loadBookmarks` | filters (optional) | Fetches bookmarks from API |
| `addBookmark` | bookmarkData | Creates new bookmark |
| `updateBookmark` | id, updates | Updates existing bookmark |
| `deleteBookmark` | id | Deletes bookmark |
| `shareBookmark` | id, userIds | Shares with users |
| `getSharedWithMeBookmarks` | - | Gets bookmarks shared with user |

### Hook

```javascript
import { useBookmarks } from '../contexts/BookmarkContext';

function Dashboard() {
  const { bookmarks, loadBookmarks, addBookmark, loading } = useBookmarks();
}
```

### Auto-Load on Authentication

```javascript
useEffect(() => {
  if (isAuthenticated) {
    loadBookmarks();
  } else {
    setBookmarks([]);
  }
}, [isAuthenticated]);
```

### Filter Support

```javascript
const loadBookmarks = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.folder) params.set('folder', filters.folder);
  if (filters.tags) params.set('tags', filters.tags.join(','));
  if (filters.search) params.set('search', filters.search);
  
  const data = await bookmarkApi.getAll(params);
  setBookmarks(data);
};
```

---

## FolderContext

**File**: `src/contexts/FolderContext.jsx`

### Implementation

Wraps the `useFolders` hook and exposes its return value:

```javascript
export const FolderContext = createContext();

export function FolderProvider({ children }) {
  const folderData = useFolders();
  
  return (
    <FolderContext.Provider value={folderData}>
      {children}
    </FolderContext.Provider>
  );
}
```

### Hook (from `useFolders.js`)

**File**: `src/hooks/useFolders.js`

### State

```javascript
const [folders, setFolders] = useState([]);
const [folderTree, setFolderTree] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [expandedFolders, setExpandedFolders] = useState({});
const [selectedFolder, setSelectedFolder] = useState(null);
```

### Methods

| Method | Parameters | Description |
|--------|-----------|-------------|
| `fetchFolders` | - | Fetches folders from API |
| `addFolder` | folderData | Creates new folder |
| `editFolder` | id, updates | Updates folder |
| `removeFolder` | id | Deletes folder |
| `getFolderById` | id | Returns folder object |
| `getFolderChildren` | id | Returns child folders |
| `toggleFolderExpansion` | id | Expands/collapses in tree |
| `selectFolder` | id | Selects for filtering |
| `clearFolderSelection` | - | Clears selection |
| `expandAllFolders` | - | Expands entire tree |
| `collapseAllFolders` | - | Collapses entire tree |

### Hook

```javascript
import { useFolders } from '../hooks/useFolders';

function MyComponent() {
  const {
    folders,
    folderTree,
    selectedFolder,
    selectFolder,
    addFolder
  } = useFolders();
}
```

### Tree Building

```javascript
function buildFolderTree(folders) {
  const folderMap = {};
  const tree = [];
  
  folders.forEach(folder => {
    folderMap[folder._id] = { ...folder, children: [] };
  });
  
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

## TagContext

**File**: `src/contexts/TagContext.jsx`

### State

```javascript
const [tags, setTags] = useState([]);
const [loading, setLoading] = useState(false);
```

### Methods

| Method | Parameters | Description |
|--------|-----------|-------------|
| `loadTags` | - | Fetches tags from /api/tags |
| `setTags` | tagsArray | Direct tag state update |

### Hook

```javascript
import { useTags } from '../contexts/TagContext';

function MyComponent() {
  const { tags, loadTags } = useTags();
}
```

### Auto-Load

```javascript
useEffect(() => {
  if (isAuthenticated) {
    loadTags();
  }
}, [isAuthenticated]);
```

**Note**: Tags are derived from bookmarks via MongoDB aggregation:
```javascript
// Backend
Bookmark.aggregate([
  { $match: { owner: userId } },
  { $unwind: '$tags' },
  { $group: { _id: '$tags', count: { $sum: 1 } } },
  { $sort: { count: -1 } }
]);
```

---

## FontContext

**File**: `src/contexts/FontContext.jsx`

### State

```javascript
const [fontSettings, setFontSettings] = useState({
  title: {
    fontFamily: 'Inter',
    fontSize: 18,
    fontWeight: 600,
    color: '#1F2937'
  },
  description: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: 400,
    color: '#6B7280'
  },
  body: {
    fontFamily: 'Inter',
    fontSize: 16
  }
});
```

### Methods

| Method | Parameters | Description |
|--------|-----------|-------------|
| `updateFontSettings` | newSettings | Updates and persists to localStorage |

### Persistence

```javascript
const updateFontSettings = (newSettings) => {
  setFontSettings(newSettings);
  localStorage.setItem('fontSettings', JSON.stringify(newSettings));
};

// Load on mount
useEffect(() => {
  const saved = localStorage.getItem('fontSettings');
  if (saved) {
    setFontSettings(JSON.parse(saved));
  }
}, []);
```

### Hook

```javascript
import { useFontContext } from '../contexts/FontContext';

function BookmarkGrid() {
  const { fontSettings } = useFontContext();
}
```

---

## ToastContext

**File**: `src/contexts/ToastContext.jsx`

### State

```javascript
const [toasts, setToasts] = useState([]);
```

### Methods

| Method | Parameters | Description |
|--------|-----------|-------------|
| `showSuccess` | message, duration | Success toast |
| `showError` | message, duration | Error toast |
| `showInfo` | message, duration | Info toast |
| `showUndoable` | message, undoFn | Toast with undo button |
| `removeToast` | id | Removes specific toast |

### Hook

```javascript
import { useToast } from '../contexts/ToastContext';

function MyComponent() {
  const { showSuccess, showError, showUndoable } = useToast();
}
```

### Usage Examples

```javascript
// Simple success toast
showSuccess('Bookmark added successfully');

// Error with longer duration
showError('Failed to delete bookmark', 5000);

// Undoable operation
showUndoable('Bookmark deleted', () => {
  // Undo function - re-add bookmark
  addBookmark(deletedBookmark);
});
```

### Toast Manager

Renders toasts at bottom-right of screen:

```jsx
<div className="fixed bottom-4 right-4 z-50">
  {toasts.map(toast => (
    <ToastNotification key={toast.id} {...toast} />
  ))}
</div>
```

---

## UndoContext

**File**: `src/contexts/UndoContext.jsx`

### State

Uses `undoManager` singleton:

```javascript
const undoManager = new UndoManager({ maxHistory: 50 });

const [canUndo, setCanUndo] = useState(false);
const [canRedo, setCanRedo] = useState(false);
```

### Methods

| Method | Parameters | Description |
|--------|-----------|-------------|
| `undo` | - | Reverts last operation |
| `redo` | - | Re-applies reverted operation |
| `createBulkDeleteOperation` | deletedItems, restoreFn | Tracks bulk delete |
| `createBulkEditOperation` | before, after, applyFn | Tracks bulk edit |
| `createBulkTagsOperation` | before, after, applyFn | Tracks bulk tag change |
| `createBulkVisibilityOperation` | before, after, applyFn | Tracks visibility change |
| `createBulkShareOperation` | before, after, applyFn | Tracks sharing change |

### Hook

```javascript
import { useUndo } from '../contexts/UndoContext';

function MyComponent() {
  const { undo, redo, canUndo, canRedo } = useUndo();
}
```

### Keyboard Shortcuts

```javascript
useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.key === 'z') {
      e.preventDefault();
      if (e.shiftKey) {
        redo();  // Ctrl+Shift+Z
      } else {
        undo();  // Ctrl+Z
      }
    }
  };
  
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [undo, redo]);
```

### Undo Manager Class

**File**: `src/utils/undoManager.js`

```javascript
class UndoManager {
  constructor({ maxHistory = 50 } = {}) {
    this.undoStack = [];
    this.redoStack = [];
    this.maxHistory = maxHistory;
  }
  
  add(entry) {
    this.undoStack.push(entry);
    if (this.undoStack.length > this.maxHistory) {
      this.undoStack.shift();  // Remove oldest
    }
    this.redoStack = [];  // Clear redo on new action
  }
  
  undo() {
    const entry = this.undoStack.pop();
    if (entry) {
      entry.undo();
      this.redoStack.push(entry);
    }
  }
  
  redo() {
    const entry = this.redoStack.pop();
    if (entry) {
      entry.redo();
      this.undoStack.push(entry);
    }
  }
}
```

### Factory Method Example

```javascript
createBulkDeleteOperation(deletedItems, restoreFn) {
  return {
    type: 'BULK_DELETE',
    timestamp: Date.now(),
    data: deletedItems,
    undo: () => restoreFn(deletedItems),
    redo: () => {
      // Delete again
      bookmarkApi.bulkDelete(deletedItems.map(i => i._id));
    },
    description: `Deleted ${deletedItems.length} bookmarks`
  };
}
```

---

## ProgressManager

**File**: `src/components/ProgressManager.jsx`

**Note**: This is defined but **NOT wired into App.jsx** provider tree.

### State

```javascript
const [activeOperations, setActiveOperations] = useState(new Map());
```

### Methods

| Method | Parameters | Description |
|--------|-----------|-------------|
| `startProgress` | operationName | Starts tracking |
| `updateProgress` | name, percent | Updates progress |
| `completeProgress` | name | Marks complete |
| `createBulkOperation` | name | Bulk operation tracker |
| `createUploadOperation` | name | File upload tracker |

---

## Data Flow Diagrams

### Loading Bookmarks

```
User logs in
    ↓
AuthContext sets isAuthenticated = true
    ↓
BookmarkContext useEffect triggers
    ↓
loadBookmarks() called
    ↓
bookmarkApi.getAll() (adds JWT via interceptor)
    ↓
GET /api/bookmarks
    ↓
Response: [bookmarks]
    ↓
setBookmarks(data)
    ↓
React re-renders BookmarkGrid
```

### Adding Bookmark

```
User fills AddBookmarkForm
    ↓
Clicks "Save"
    ↓
bookmarkApi.create(formData)
    ↓
POST /api/bookmarks
    ↓
Server: autoBackup() → validate → create
    ↓
Response: { bookmark }
    ↓
addBookmark(bookmark) in context
    ↓
setBookmarks(prev => [...prev, bookmark])
    ↓
Toast: showSuccess('Bookmark added')
    ↓
Form closes
```

### Bulk Delete with Undo

```
User selects bookmarks
    ↓
Clicks "Delete" in BulkEditToolbar
    ↓
bookmarkApi.bulkDelete(ids)
    ↓
DELETE /api/bookmarks/bulk-delete
    ↓
Response: { count: 5 }
    ↓
Remove from state: setBookmarks(prev => prev.filter(b => !ids.includes(b._id)))
    ↓
Create undo entry: undoManager.createBulkDeleteOperation(deletedBookmarks, restoreFn)
    ↓
Toast: showUndoable('5 bookmarks deleted', undoFn)
    ↓
User clicks "Undo" (or Ctrl+Z)
    ↓
undo() called
    ↓
restoreFn(deletedBookmarks)
    ↓
setBookmarks(prev => [...prev, ...deletedBookmarks])
```

---

## Performance Optimization

### Context Splitting

State is split across multiple contexts to minimize re-renders:

```javascript
// BAD: One giant context
const AppContext = createContext();
// Every state change re-renders ALL consumers

// GOOD: Split by domain
const AuthContext = createContext();      // Changes on login/logout
const BookmarkContext = createContext();  // Changes on bookmark CRUD
const TagContext = createContext();       // Changes on tag operations
// Only affected consumers re-render
```

### Memoization

```javascript
import { memo, useMemo, useCallback } from 'react';

// Memoize expensive computations
const filteredBookmarks = useMemo(() => {
  return bookmarks.filter(b => b.tags.includes(selectedTag));
}, [bookmarks, selectedTag]);

// Memoize callbacks
const handleDelete = useCallback((id) => {
  deleteBookmark(id);
}, [deleteBookmark]);

// Memoize components
const BookmarkCard = memo(({ bookmark }) => {
  // Only re-renders if bookmark prop changes
});
```

### Selective Subscription

Components only consume contexts they need:

```javascript
// Navbar only needs auth
const { user, logout } = useAuth();

// Dashboard needs multiple contexts
const { bookmarks } = useBookmarks();
const { folderTree } = useFolders();
const { tags } = useTags();
```

---

## Persistence

| State | Storage | Key |
|-------|---------|-----|
| Auth token | localStorage | `token` |
| Font settings | localStorage | `fontSettings` |
| Extension auth | chrome.storage.local | `authToken` |

### Load on Mount

```javascript
// AuthContext
useEffect(() => {
  const token = localStorage.getItem('token');
  if (token) {
    checkAuthStatus();
  } else {
    setLoading(false);
  }
}, []);

// FontContext
useEffect(() => {
  const saved = localStorage.getItem('fontSettings');
  if (saved) {
    setFontSettings(JSON.parse(saved));
  }
}, []);
```

---

## Missing Contexts

### UndoContext

Defined but **NOT in App.jsx**:

```jsx
// Should be added:
<UndoContext.Provider value={undoValue}>
  {/* children */}
</UndoContext.Provider>
```

### ProgressManager

Defined but **NOT in App.jsx**:

```jsx
// Should be added:
<ProgressProvider>
  {/* children */}
</ProgressProvider>
```

---

## Debugging

### Logging State Changes

```javascript
// Add to context
useEffect(() => {
  console.log('Bookmarks changed:', bookmarks);
}, [bookmarks]);
```

### React DevTools

Install React DevTools browser extension to:
- Inspect component tree
- View context values
- Track re-renders

### Console Patterns

```javascript
// Log all bookmarks
console.table(bookmarks);

// Log specific bookmark
console.dir(bookmarks.find(b => b._id === id));

// Count renders
const renderCount = useRef(0);
useEffect(() => {
  renderCount.current++;
  console.log('BookmarkGrid rendered', renderCount.current, 'times');
});
```

---

*Last Updated: April 9, 2026*
