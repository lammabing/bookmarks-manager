# Quick Installation Guide

## Step 1: Start the Development Server

The server should already be running. If not, run:
```bash
npm run dev:full
```

This starts both:
- Backend API server on port 5170
- Frontend Vite dev server on port 5170

## Step 2: Install the Chrome Extension

1. **Open Chrome Extensions**
   - Open Google Chrome
   - Navigate to `chrome://extensions/`
   - Or: Chrome menu (⋮) → More Tools → Extensions

2. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top right corner

3. **Load the Extension**
   - Click the "Load unpacked" button
   - Navigate to and select the `chrome-extension` directory
   - The extension should now appear in your extensions list

4. **Pin the Extension** (Recommended)
   - Click the puzzle piece icon in Chrome's toolbar
   - Find "Bookmark App Extension"
   - Click the pin icon to add it to your toolbar

## Step 3: Test the Extension

### First Use (Login Required)

1. Navigate to any webpage (e.g., https://example.com)
2. Click the extension icon in your toolbar
3. You should see a "Login Required" message
4. Click "Open Login Page"
5. This opens your bookmarking app in a new tab
6. Log in with your credentials
7. The extension will automatically detect your login

### Adding a Bookmark

1. Navigate to any webpage you want to bookmark
2. Click the extension icon
3. You should now see the bookmark form with:
   - URL pre-filled from the current page
   - Title pre-filled with the page title
4. Optionally add:
   - Description
   - Tags (comma-separated, e.g., `tech, tutorial, useful`)
5. Click "Add Bookmark"
6. Success message appears and popup closes

### Verify the Bookmark

1. Open your bookmarking app at http://localhost:5170
2. Navigate to your dashboard
3. You should see the newly added bookmark

## Troubleshooting

### Extension doesn't appear after loading
- Make sure you selected the correct `chrome-extension` directory
- Check for errors in the Chrome Extensions page
- Try removing and reloading the extension

### "Please login first" message persists
- Make sure you're logged in on the bookmarking app
- Refresh the bookmarking app page after logging in
- Try clicking the extension icon again

### Bookmarks not saving
- Verify the development server is running (`npm run dev:full`)
- Check the browser console for errors (right-click extension → Inspect popup)
- Check the background script console (chrome://extensions → Service Worker)

### Token not syncing
- Refresh the bookmarking app page after logging in
- Check that the content script is loaded (look for console messages on the app page)
- Try logging out and logging in again

## Development Tips

### Viewing Extension Logs

**Background Script:**
1. Go to `chrome://extensions/`
2. Find "Bookmark App Extension"
3. Click "Service Worker" under "Inspect views"

**Popup:**
1. Click the extension icon
2. Right-click the popup
3. Select "Inspect popup"

**Content Script:**
1. Open your bookmarking app (http://localhost:5170)
2. Right-click the page
3. Select "Inspect"
4. Look for content script messages in the console

### Reloading the Extension

After making changes to extension files:
1. Go to `chrome://extensions/`
2. Find "Bookmark App Extension"
3. Click the refresh icon 🔄

### Clearing Extension Data

To reset the extension:
1. Go to `chrome://extensions/`
2. Find "Bookmark App Extension"
3. Click "Remove"
4. Reload the extension using "Load unpacked"

## Configuration

The extension is configured for local development:

- **API URL**: `http://localhost:5170/api`
- **App URL**: `http://localhost:5170`

To change these for production:

1. Edit `chrome-extension/background.js`:
   ```javascript
   const API_BASE_URL = 'https://your-production-url.com/api';
   ```

2. Edit `chrome-extension/popup.js`:
   ```javascript
   const APP_URL = 'https://your-production-url.com';
   ```

3. Reload the extension