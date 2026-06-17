# Browser Extensions

Chrome and Firefox extension development for quick bookmarking.

## Overview

| Feature | Chrome | Firefox |
|---------|--------|---------|
| **Manifest Version** | V3 | V3 |
| **Background Script** | Service Worker | Background Scripts |
| **API Namespace** | `chrome.*` | `browser.*` |
| **Storage** | chrome.storage.local | browser.storage.local |
| **Context Menu** | ✓ | ✓ |
| **Permissions** | activeTab, storage | contextMenus, storage, activeTab, scripting, bookmarks, tabs |

---

## Chrome Extension

**Location**: `chrome-extension/`

### Structure

```
chrome-extension/
├── manifest.json           # Extension configuration
├── background.js           # Service worker (event handling)
├── popup.html              # Popup UI
├── popup.js                # Popup logic
├── content.js              # Content script (injected into pages)
└── icons/
    ├── icon16.png
    ├── icon32.png
    ├── icon48.png
    └── icon128.png
```

### Manifest Configuration

**File**: `chrome-extension/manifest.json`

```json
{
  "manifest_version": 3,
  "name": "Bookmarks Manager",
  "version": "1.0.0",
  "description": "Add bookmarks to your Bookmarks Manager app",
  "permissions": [
    "activeTab",
    "storage"
  ],
  "host_permissions": [
    "http://localhost:5170/*",
    "http://localhost:5015/*",
    "<all_urls>"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "32": "icons/icon32.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "icons": {
    "16": "icons/icon16.png",
    "32": "icons/icon32.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "content_scripts": [
    {
      "matches": ["http://localhost:5170/*"],
      "js": ["content.js"]
    }
  ]
}
```

### Background Service Worker

**File**: `chrome-extension/background.js`

**Responsibilities**:
1. Authentication token management
2. Bookmark creation API calls
3. Token verification

**Message Handler**:
```javascript
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'get_auth_token') {
    chrome.storage.local.get(['authToken', 'user'], (result) => {
      sendResponse({ token: result.authToken, user: result.user });
    });
    return true;  // Keep message channel open for async response
  }
  
  if (message.action === 'set_auth_token') {
    chrome.storage.local.set({
      authToken: message.token,
      user: message.user
    }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
  
  if (message.action === 'clear_auth_token') {
    chrome.storage.local.remove(['authToken', 'user'], () => {
      sendResponse({ success: true });
    });
    return true;
  }
  
  if (message.action === 'add_bookmark') {
    addBookmark(message.bookmarkData, message.token)
      .then(response => sendResponse({ success: true, data: response }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  if (message.action === 'verify_token') {
    verifyToken(message.token)
      .then(user => sendResponse({ success: true, user }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});
```

**Add Bookmark Function**:
```javascript
async function addBookmark(bookmarkData, sendResponse) {
  try {
    // Get stored token
    const { authToken } = await chrome.storage.local.get('authToken');
    
    if (!authToken) {
      sendResponse({ success: false, error: 'Not authenticated' });
      return;
    }
    
    // POST to API
    const response = await fetch('http://localhost:5015/api/bookmarks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': authToken
      },
      body: JSON.stringify(bookmarkData)
    });
    
    if (response.ok) {
      const data = await response.json();
      sendResponse({ success: true, bookmark: data });
    } else {
      sendResponse({ success: false, error: 'Failed to add bookmark' });
    }
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}
```

**Token Verification**:
```javascript
async function verifyToken(token) {
  try {
    const response = await fetch('http://localhost:5015/api/users/me', {
      headers: {
        'x-auth-token': token
      }
    });
    
    if (!response.ok) {
      throw new Error('Token is invalid or expired');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error verifying token:', error);
    throw error;
  }
}
```

> **Note**: `verify_token` is no longer called during popup open. The popup trusts stored tokens directly, avoiding false "Login Required" state when the API is unreachable. Verification happens naturally at bookmark submission time.

#### Popup Auth Flow

The popup's `checkAuthStatus()` uses a three-tier approach:

1. **Check background storage** — fastest path; if a token was previously synced, show the bookmark form immediately.
2. **Check content script** — if no token in storage, the popup sends `check_auth_status` to the content script on the active tab. The content script reads the token directly from the app's `localStorage` and returns it. The popup then stores it in the background.
3. **Redirect to app** — if neither has a token, the popup opens `APP_URL/bookmark/new?url=...&title=...` in a new tab (with page data pre-filled) and closes itself. There is no "Login Required" modal.

This ensures the extension never blocks the user with a login prompt. Authenticated users see the bookmark form directly in the popup. Unauthenticated users are seamlessly redirected to the app.

### Popup UI

**File**: `chrome-extension/popup.html`

Minimal HTML structure:
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      width: 400px;
      padding: 16px;
      font-family: system-ui, sans-serif;
    }
    .form-group {
      margin-bottom: 12px;
    }
    label {
      display: block;
      margin-bottom: 4px;
      font-weight: 500;
    }
    input, textarea {
      width: 100%;
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
    button {
      background: #3B82F6;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
    }
    button:hover {
      background: #2563EB;
    }
  </style>
</head>
<body>
  <h2>Add Bookmark</h2>
  <div id="content">
    <div class="form-group">
      <label for="url">URL</label>
      <input type="text" id="url" readonly>
    </div>
    <div class="form-group">
      <label for="title">Title</label>
      <input type="text" id="title">
    </div>
    <div class="form-group">
      <label for="tags">Tags (comma-separated)</label>
      <input type="text" id="tags" placeholder="dev, tutorial">
    </div>
    <button id="save">Save Bookmark</button>
    <div id="status"></div>
  </div>
  <script src="popup.js"></script>
</body>
</html>
```

### Popup Logic

**File**: `chrome-extension/popup.js`

```javascript
document.addEventListener('DOMContentLoaded', async () => {
  // Get current tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  // Pre-fill form
  document.getElementById('url').value = tab.url;
  document.getElementById('title').value = tab.title;
  
  // Check authentication — trusts stored token without API verify call
  chrome.runtime.sendMessage({ action: 'get_auth_token' }, (response) => {
    if (response.token) {
      // Token exists, show bookmark form immediately
      showBookmarkForm(response.user);
    } else {
      // No token, show login prompt
      document.getElementById('content').innerHTML = `
        <p>Please log in to the Bookmarks Manager first.</p>
        <button id="login">Go to Login</button>
      `;
      document.getElementById('login').addEventListener('click', () => {
        // Opens dedicated /bookmark/new route with bookmark data as query params
        chrome.tabs.create({ url: 'http://localhost:5170/bookmark/new?url=...&title=...' });
      });
    }
  });
  
  // Save bookmark
  document.getElementById('save').addEventListener('click', async () => {
    const bookmarkData = {
      url: document.getElementById('url').value,
      title: document.getElementById('title').value,
      tags: document.getElementById('tags').value.split(',').map(t => t.trim())
    };
    
    chrome.runtime.sendMessage({ 
      action: 'add_bookmark', 
      bookmarkData 
    }, (response) => {
      if (response.success) {
        document.getElementById('status').textContent = 'Bookmark saved!';
      } else {
        document.getElementById('status').textContent = `Error: ${response.error}`;
      }
    });
  });
});
```

The app provides a dedicated route `/bookmark/new` that renders the add bookmark form as a standalone page (not a modal overlay). The route accepts query parameters: `url`, `title`, `description`, `favicon`, and `tags`. This route is used by both the bookmarklet and the extension's "Open Login Page" button. After login, the user is redirected back to this route with the pending bookmark data preserved via `sessionStorage`.

### Content Script

**File**: `chrome-extension/content.js`

Injected into app pages for potential DOM manipulation or messaging:

```javascript
// Listen for messages from popup or background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'get_page_data') {
    // Extract page data if needed
    sendResponse({
      url: window.location.href,
      title: document.title
    });
  }
});
```

---

## Firefox Extension

**Location**: `firefox-extension/`

### Key Differences from Chrome

| Aspect | Chrome | Firefox |
|--------|--------|---------|
| **API** | `chrome.*` | `browser.*` (Promise-based) |
| **Background** | `service_worker` | `scripts` array |
| **Manifest** | `action` | `action` (same in MV3) |
| **Message Response** | `return true` for async | Return Promise |

### Manifest Configuration

**File**: `firefox-extension/manifest.json`

```json
{
  "manifest_version": 3,
  "name": "Bookmarks Manager",
  "version": "1.0.0",
  "description": "Add bookmarks to your Bookmarks Manager app",
  "permissions": [
    "contextMenus",
    "storage",
    "activeTab",
    "scripting",
    "bookmarks",
    "tabs"
  ],
  "host_permissions": [
    "http://localhost:5170/*",
    "http://localhost:5015/*",
    "<all_urls>"
  ],
  "background": {
    "scripts": ["background.js"]
  },
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "32": "icons/icon32.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "icons": {
    "16": "icons/icon16.png",
    "32": "icons/icon32.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "browser_specific_settings": {
    "gecko": {
      "id": "bookmarks-manager@example.com"
    }
  }
}
```

### Background Script

**File**: `firefox-extension/background.js`

Uses `browser.*` API (Promise-based):

```javascript
// Context menu
browser.contextMenus.create({
  id: "add-bookmark",
  title: "Add page to Bookmarks Manager",
  contexts: ["page"]
});

browser.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "add-bookmark") {
    // Get auth token
    const { authToken } = await browser.storage.local.get('authToken');
    
    if (!authToken) {
      browser.tabs.create({ url: 'http://localhost:5170/login' });
      return;
    }
    
    // Add bookmark
    try {
      const response = await fetch('http://localhost:5015/api/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': authToken
        },
        body: JSON.stringify({
          url: tab.url,
          title: tab.title
        })
      });
      
      if (response.ok) {
        // Show notification
        browser.notifications.create({
          type: "basic",
          iconUrl: "icons/icon48.png",
          title: "Bookmark Added",
          message: `"${tab.title}" saved to Bookmarks Manager`
        });
      }
    } catch (error) {
      console.error('Failed to add bookmark:', error);
    }
  }
});

// Message handler (Promise-based)
browser.runtime.onMessage.addListener((message, sender) => {
  if (message.action === 'get_auth_token') {
    return browser.storage.local.get('authToken').then(result => ({
      token: result.authToken
    }));
  }
  
  if (message.action === 'set_auth_token') {
    return browser.storage.local.set({ authToken: message.token });
  }
  
  if (message.action === 'clear_auth_token') {
    return browser.storage.local.remove('authToken');
  }
});
```

---

## Installation

### Chrome (Development)

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `chrome-extension/` directory
5. Extension icon appears in toolbar

### Firefox (Development)

1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on...**
3. Select `firefox-extension/manifest.json`
4. Extension appears in toolbar (temporary until Firefox restarts)

### Production Distribution

**Chrome Web Store**:
1. Zip the `chrome-extension/` directory
2. Upload to Chrome Web Store Developer Dashboard
3. Pay $5 one-time developer fee
4. Submit for review

**Firefox Add-ons**:
1. Zip the `firefox-extension/` directory
2. Upload to Firefox Add-ons Developer Hub
3. Submit for review
4. Sign automatically for distribution

---

## Extension API Communication

### Flow Diagram

```
┌─────────────────────┐
│   Browser Tab       │
│   (Any Website)     │
└─────────┬───────────┘
          │
          │ User clicks extension icon
          ▼
┌─────────────────────┐
│   Popup UI          │
│   (popup.html/js)   │
└─────────┬───────────┘
          │
          │ Sends message to background
          ▼
┌─────────────────────┐
│   Background Script │
│   (service worker)  │
└─────────┬───────────┘
          │
          │ Retrieves token from storage
          │ Makes API call to backend
          ▼
┌─────────────────────┐
│   Backend API       │
│   /api/bookmarks    │
└─────────────────────┘
```

### Message Types

| Action | Direction | Data | Response |
|--------|-----------|------|----------|
| `get_auth_token` | Popup → Background | - | `{ token }` |
| `set_auth_token` | Web App → Background | `{ token }` | `{ success }` |
| `clear_auth_token` | Web App → Background | - | `{ success }` |
| `add_bookmark` | Popup → Background | `{ bookmarkData }` | `{ success, bookmark }` |
| `verify_token` | (available but unused in popup auth flow) | `{ token }` | `{ valid, user }` |

---

## Debugging Extensions

### Chrome

1. Go to `chrome://extensions/`
2. Find Bookmarks Manager extension
3. Click **Service Worker** link (opens DevTools)
4. Check console for errors
5. Click **Errors** button for manifest issues

### Firefox

1. Go to `about:debugging#/runtime/this-firefox`
2. Find Bookmarks Manager
3. Click **Inspect** (opens DevTools)
4. Check console and debugger tabs

### Common Issues

| Issue | Solution |
|-------|----------|
| **Service worker not starting** | Check for syntax errors in background.js |
| **CORS errors** | Verify host_permissions in manifest |
| **Token not syncing** | Check chrome.storage.local in DevTools |
| **API calls failing** | Verify backend is running on port 5015 |
| **Icon not showing** | Ensure icon files exist and paths are correct |
| **Popup shows "Login Required" despite being logged in** | Fixed in 2026-06-16 — the "Login Required" modal was removed entirely. The popup now checks background storage, falls back to the content script, and if neither has a token, opens the app's bookmark form in a new tab. Reload the extension to get the update. |

---

## Extension Permissions

### Requested Permissions

| Permission | Purpose |
|------------|---------|
| `activeTab` | Access current tab URL and title |
| `storage` | Store authentication token |
| `contextMenus` | Add right-click menu item (Firefox) |
| `scripting` | Inject scripts into pages (Firefox) |
| `bookmarks` | Access browser bookmarks (future feature) |
| `tabs` | Query and manage tabs (Firefox) |

### Host Permissions

```json
"host_permissions": [
  "http://localhost:5170/*",
  "http://localhost:5015/*",
  "<all_urls>"
]
```

Required for:
- Accessing app at localhost:5170
- Making API calls to localhost:5015
- Reading URLs of any website

---

## Future Enhancements

1. **Bulk Bookmark Import**: Import multiple tabs at once
2. **Folder Selection**: Choose folder when adding bookmark
3. **Tag Suggestions**: Auto-suggest tags based on page content
4. **Offline Queue**: Queue bookmarks when offline, sync later
5. **Search from Extension**: Search bookmarks without opening app
6. **Quick Access**: Recently added bookmarks in popup
7. **Highlight Visited Pages**: Mark pages already bookmarked
8. **Screenshot Capture**: Attach screenshots to bookmarks

---

*Last Updated: June 17, 2026*
