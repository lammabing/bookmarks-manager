# Frontend Components

React component library and UI architecture for the Bookmarks Manager.

## Component Architecture

```
App.jsx
├── Navbar
├── Routes
│   ├── Home
│   │   ├── Hero Section
│   │   ├── Feature Cards
│   │   └── PublicBookmarksGrid
│   ├── Login
│   │   └── LoginForm
│   ├── Register
│   │   └── RegisterForm
│   └── Dashboard (ProtectedRoute)
│       ├── Statistics Cards
│       ├── Search & Filter Bar
│       ├── Action Toolbar
│       ├── FolderTree (Sidebar)
│       └── BookmarkGrid
│           ├── BookmarkCard (multiple)
│           ├── EditBookmarkForm
│           └── BulkEditToolbar
└── Modals (rendered conditionally)
    ├── AuthModal
    ├── AddBookmarkForm
    ├── FolderManager
    ├── TagManager
    ├── FontSettingsModal
    ├── TutorialModal
    └── BulkOperationToast
```

---

## Authentication Components

### AuthModal

**File**: `src/components/Auth/AuthModal.jsx`

Modal that toggles between login and registration forms.

**Props**:
| Prop | Type | Description |
|------|------|-------------|
| `isOpen` | boolean | Controls modal visibility |
| `onClose` | function | Close handler |

---

### LoginForm

**File**: `src/components/Auth/LoginForm.jsx`

Email/password login form.

**State**:
```javascript
const [formData, setFormData] = useState({ email: '', password: '' });
const [error, setError] = useState('');
```

**Behavior**:
- Validates email and password
- Calls `auth.login(email, password)` from AuthContext
- Stores token in localStorage on success
- Redirects to `/dashboard`

---

### RegisterForm

**File**: `src/components/Auth/RegisterForm.jsx`

User registration with confirmation.

**State**:
```javascript
const [formData, setFormData] = useState({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
});
```

**Validation**:
- Password match check
- Username length (3-30 chars)
- Email format

---

## Bookmark Components

### AddBookmarkForm

**File**: `src/components/AddBookmarkForm.jsx`

Modal form for creating/editing bookmarks.

**Props**:
| Prop | Type | Description |
|------|------|-------------|
| `isOpen` | boolean | Modal visibility |
| `onClose` | function | Close handler |
| `bookmark` | object | Pre-fill data (for editing) |
| `initialData` | object | URL params to pre-fill |

**Features**:
- URL auto-fill from params
- Tag selection via TagSelector
- Folder selection via FolderSelector
- Visibility settings (private/public/selected)
- User selection for sharing
- Favicon auto-extraction
- Form validation

**Form Fields**:
```javascript
{
  url: string (required),
  title: string (required),
  description: string,
  tags: string[],
  folder: ObjectId | null,
  visibility: 'private' | 'public' | 'selected',
  sharedWith: ObjectId[]
}
```

---

### BookmarkGrid

**File**: `src/components/BookmarkGrid.jsx`

Grid or list view of bookmarks with multi-select.

**Props**:
| Prop | Type | Description |
|------|------|-------------|
| `bookmarks` | array | Bookmarks to display |
| `loading` | boolean | Loading state |
| `viewMode` | string | 'grid' or 'list' |
| `onSelect` | function | Selection handler |
| `selectedIds` | array | Selected bookmark IDs |
| `fontSettings` | object | Font customization |

**Features**:
- Grid/list view toggle
- Multi-select checkboxes
- Edit/delete buttons per bookmark
- Sharing badges
- Social media share buttons
- Font settings application
- Empty state message

---

### BookmarkDetail

**File**: `src/components/BookmarkDetail.jsx`

Detailed view of a single bookmark.

**Displays**:
- Favicon
- Title (clickable link)
- URL
- Description
- Tags (clickable)
- Visibility badge
- Sharing info
- Metadata (dates)
- BookmarkExtensions component

---

### BookmarkExtensions

**File**: `src/components/BookmarkExtensions.jsx`

Manage custom extensions for a bookmark.

**Features**:
- Add/edit/delete notes
- Add/edit/delete comments
- Attach images (URL)
- Custom JSON data
- Type selector dropdown

---

### BookmarkImport

**File**: `src/components/BookmarkImport.jsx`

File upload UI for importing browser bookmarks.

**Features**:
- Drag-and-drop file upload
- File validation (.html/.htm, 10MB)
- Progress indicator
- Import result summary
- Browser export guides

**Usage**:
```jsx
<BookmarkImport onImportComplete={(result) => {
  console.log(`Imported ${result.bookmarksImported} bookmarks`);
}} />
```

---

### EditBookmarkForm

**File**: `src/components/EditBookmarkForm.jsx`

Inline editing form within BookmarkGrid.

**Props**:
| Prop | Type | Description |
|------|------|-------------|
| `bookmark` | object | Bookmark to edit |
| `onSave` | function | Save handler |
| `onCancel` | function | Cancel handler |

---

### PublicBookmarksGrid

**File**: `src/components/PublicBookmarksGrid.jsx`

Grid of public bookmarks (no auth required).

**Features**:
- Fetches from `/api/bookmarks/public`
- Pagination support
- Shows username, date, tags
- Link to bookmark URL

---

## Folder Components

### FolderTree

**File**: `src/components/FolderTree.jsx`

Recursive folder tree sidebar.

**Props**:
| Prop | Type | Description |
|------|------|-------------|
| `folders` | array | Flat folder array |
| `selectedFolder` | ObjectId | Currently selected |
| `onSelect` | function | Selection handler |
| `expandedFolders` | object | Expanded state |
| `onToggle` | function | Expand/collapse handler |

**Features**:
- Expandable/collapsible nodes
- Bookmark counts per folder
- Selection highlighting
- Indentation for hierarchy
- Empty folder message

---

### FolderManager

**File**: `src/components/FolderManager.jsx`

Full CRUD modal for folder management.

**Features**:
- Add/edit/delete folders
- Name, description, parent selection
- Color picker
- Icon selector
- Hierarchical display

**Form Fields**:
```javascript
{
  name: string (required),
  description: string,
  parent: ObjectId | null,
  color: string (hex),
  icon: string
}
```

---

### FolderSelector

**File**: `src/components/FolderSelector.jsx`

Dropdown for selecting folders.

**Features**:
- Hierarchical folder display with indentation
- Search/filter folders
- Inline folder creation
- "No Folder" option
- Used in AddBookmarkForm and BulkEditModal

---

### FolderBreadcrumb

**File**: `src/components/FolderBreadcrumb.jsx`

Breadcrumb navigation for folder hierarchy.

**Props**:
| Prop | Type | Description |
|------|------|-------------|
| `folderId` | ObjectId | Current folder |
| `onNavigate` | function | Navigation handler |

**Renders**:
```
Home / All Bookmarks / Development / React
```

---

## Tag Components

### TagManager

**File**: `src/components/TagManager.jsx`

Modal for tag CRUD operations.

**Features**:
- List all tags with bookmark counts
- Rename tags (updates all bookmarks)
- Delete tags (removes from all bookmarks)
- Search/filter tags

---

### TagSelector

**File**: `src/components/TagSelector.jsx`

Tag selection/creation dropdown.

**Features**:
- Search existing tags
- Create new tags
- Removable tag pills
- Comma-separated input for multiple tags
- Auto-complete from existing tags

**Usage**:
```jsx
<TagSelector
  selectedTags={tags}
  onChange={(newTags) => setTags(newTags)}
/>
```

---

## Bulk Operations Components

### BulkEditModal

**File**: `src/components/BulkEditModal.jsx`

Modal for bulk operations on selected bookmarks.

**Operations**:
| Operation | Description |
|-----------|-------------|
| Move to Folder | Move all selected to folder |
| Add Tags | Add tags to all selected |
| Change Visibility | Set visibility for all selected |
| Share with Users | Share all selected with users |

**Props**:
| Prop | Type | Description |
|------|------|-------------|
| `isOpen` | boolean | Modal visibility |
| `onClose` | function | Close handler |
| `selectedIds` | array | Selected bookmark IDs |
| `bookmarks` | array | All bookmarks |

---

### BulkEditToolbar

**File**: `src/components/BulkEditToolbar.jsx`

Sticky bottom toolbar shown when bookmarks are selected.

**Buttons**:
- Edit (bulk edit modal)
- Tags (bulk tag operation)
- Visibility (dropdown: private/public/selected)
- Share (share with users)
- Delete (with confirmation)

**Position**: Fixed at bottom of screen
**Visibility**: Only shown when `selectedIds.length > 0`

---

### BulkOperationToast

**File**: `src/components/BulkOperationToast.jsx`

Toast notification showing bulk operation progress.

**Features**:
- Animated progress bar
- Operation status message
- Undo button support
- Auto-dismiss after completion
- Managed by ToastManager

---

## Sharing Components

### ShareSettings

**File**: `src/components/ShareSettings.jsx`

Bookmark sharing configuration UI.

**Features**:
- Visibility level selector (radio buttons)
- User search and selection
- Shows current sharing status
- Undo support via toast

---

### SharingBadge

**File**: `src/components/SharingBadge.jsx`

Visual badge showing bookmark visibility.

**Variants**:
| Visibility | Color | Icon |
|------------|-------|------|
| Private | Gray | Lock |
| Public | Green | Globe |
| Shared | Blue | Users |

---

### SocialMediaShare

**File**: `src/components/SocialMediaShare.jsx`

Social sharing buttons.

**Platforms**:
- Twitter/X
- Facebook
- LinkedIn
- WhatsApp
- Email
- Copy to Clipboard

**Props**:
| Prop | Type | Description |
|------|------|-------------|
| `url` | string | URL to share |
| `title` | string | Bookmark title |

---

## UI Components

### Navbar

**File**: `src/components/Navbar.jsx`

Top navigation bar.

**Elements**:
- Logo
- Dashboard link
- Import link
- Draggable bookmarklet button
- User info (username)
- Logout button

**Bookmarklet Button**:
- Draggable to browser bookmarks bar
- Opens app with URL params pre-filled
- Shows tooltip with instructions

---

### SearchBar

**File**: `src/components/SearchBar.jsx`

Text search input (forwardRef).

**Props**:
| Prop | Type | Description |
|------|------|-------------|
| `value` | string | Current search text |
| `onChange` | function | Change handler |
| `placeholder` | string | Placeholder text |
| `ref` | ref | Forwarded ref |

---

### MultiSelectCheckbox

**File**: `src/components/MultiSelectCheckbox.jsx`

Checkbox with indeterminate state.

**States**:
- Checked
- Unchecked
- Indeterminate (some children selected)

**Accessibility**:
- ARIA attributes
- Keyboard navigation
- Focus management

---

### ToastNotification

**File**: `src/components/ToastNotification.jsx`

Individual toast notification.

**Types**:
- Success (green)
- Error (red)
- Info (blue)

**Features**:
- Auto-dismiss with duration
- Close button
- Undo button (optional)
- Slide-in animation

---

### Tooltip

**File**: `src/components/Tooltip.jsx`

Hover tooltip.

**Props**:
| Prop | Type | Description |
|------|------|-------------|
| `content` | string | Tooltip text |
| `position` | string | 'top' | 'bottom' | 'left' | 'right' |
| `children` | node | Trigger element |

---

### TutorialModal

**File**: `src/components/TutorialModal.jsx`

Feature tour/help modal.

**Content**:
- 8 feature cards with icons
- Pro tips section
- Navigation (next/previous)
- Skip/done buttons

---

### FontSettings

**File**: `src/components/FontSettings.jsx`

Basic font settings component.

**Controls**:
- Font family (dropdown)
- Font size (slider/number)
- Font weight (normal/bold)
- Font color (picker)

---

### FontSettingsModal

**File**: `src/components/FontSettingsModal.jsx`

Advanced font customization.

**Separate Settings**:
- Title font (family, size, weight, color)
- Description font (family, size, weight, color)
- Body font settings
- Live preview
- Save to localStorage

---

### ProgressManager

**File**: `src/components/ProgressManager.jsx`

Progress tracking context provider.

**Methods**:
```javascript
{
  startProgress(operation),
  updateProgress(operation, percent),
  completeProgress(operation),
  createBulkOperation(name),
  createUploadOperation(name)
}
```

**Note**: Not currently wired into App.jsx provider tree.

---

### ProtectedRoute

**File**: `src/components/ProtectedRoute.jsx`

Route guard for authenticated routes.

**Behavior**:
- Checks `isAuthenticated` from AuthContext
- Shows spinner during loading
- Redirects to `/login` if not authenticated
- Renders children if authenticated

**Usage**:
```jsx
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
```

---

## Component Patterns

### Modal Pattern

Most modals follow this pattern:

```jsx
function MyModal({ isOpen, onClose, ...props }) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg mx-auto mt-20">
        <button onClick={onClose}>X</button>
        {/* Modal content */}
      </div>
    </div>
  );
}
```

### Form Pattern

Forms use controlled components:

```jsx
const [formData, setFormData] = useState({
  title: '',
  url: '',
  description: ''
});

const handleChange = (e) => {
  setFormData(prev => ({
    ...prev,
    [e.target.name]: e.target.value
  }));
};

<input 
  name="title" 
  value={formData.title} 
  onChange={handleChange} 
/>
```

### Loading Pattern

Components show loading states:

```jsx
if (loading) {
  return <div className="animate-spin">Loading...</div>;
}

if (bookmarks.length === 0) {
  return <EmptyState />;
}

return <BookmarkGrid bookmarks={bookmarks} />;
```

---

## Styling

### Tailwind CSS

All components use Tailwind utility classes.

**Common Patterns**:
```jsx
// Card
<div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition">

// Button
<button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">

// Input
<input className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500" />

// Grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

### Responsive Design

Breakpoints:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

Example:
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

---

*Last Updated: April 9, 2026*
