# Bookmark App Chrome Extension

This Chrome extension allows you to quickly add bookmarks from any webpage to your bookmarking app.

## Features

- 📌 Quick bookmark creation from any webpage
- 🔐 Seamless authentication with your bookmarking app
- 🎨 Clean, modern user interface
- 🏷️ Tag support for organizing bookmarks
- 👤 Shows logged-in user information

## Installation

### Development Mode (Unpacked Extension)

1. **Clone or navigate to the chrome-extension directory**
   ```bash
   cd chrome-extension
   ```

2. **Open Chrome Extensions**
   - Open Google Chrome
   - Navigate to `chrome://extensions/`
   - Or go to Chrome menu (three dots) → More Tools → Extensions

3. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top right corner

4. **Load the Extension**
   - Click the "Load unpacked" button
   - Select the `chrome-extension` directory
   - The extension should now appear in your extensions list

5. **Pin the Extension** (Optional)
   - Click the puzzle piece icon in Chrome's toolbar
   - Find "Bookmark App Extension" and click the pin icon to add it to your toolbar

## Configuration

The extension is configured to work with your local development server running on `http://localhost:5170`.

To change the API base URL, edit the `API_BASE_URL` variable in `background.js`:

```javascript
const API_BASE_URL = 'http://localhost:5170/api';
```

To change the app URL for the login page, edit the `APP_URL` variable in `popup.js`:

```javascript
const APP_URL = 'http://localhost:5170';
```

## How It Works

### Authentication Flow

1. **First Use**: When you click the extension button, you'll see a login prompt
2. **Login**: Click "Open Login Page" to open the bookmarking app in a new tab
3. **Auto-Authentication**: The content script detects when you log in on the app and automatically sends the authentication token to the extension
4. **Subsequent Uses**: The extension remembers your login session and shows the bookmark form directly

### Adding a Bookmark

1. Navigate to any webpage you want to bookmark
2. Click the extension icon in your Chrome toolbar
3. If logged in, fill in the bookmark details:
   - **Title**: Auto-filled with page title
   - **Description**: Optional description
   - **Tags**: Comma-separated tags (e.g., `tech, tutorial, useful`)
4. Click "Add Bookmark"
5. The bookmark is saved to your bookmarking app and the popup closes

### Authentication State Management

The extension uses Chrome's `chrome.storage.local` API to persist authentication tokens:

- **Storage Keys**:
  - `authToken`: JWT token for API authentication
  - `user`: User object with username and email

- **Token Synchronization**:
  - When you log in on the bookmarking app, the content script automatically sends the token to the extension
  - When you log out, the extension is notified and clears the stored token
  - The popup checks token validity on each open

## File Structure

```
chrome-extension/
├── manifest.json       # Extension manifest (configuration)
├── background.js       # Service worker for API calls and token management
├── popup.html          # Popup UI
├── popup.js           # Popup logic
├── content.js         # Content script for auth synchronization
├── icons/             # Extension icons
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── README.md          # This file
```

## Development

### Building for Production

To package the extension for distribution:

1. Update the `API_BASE_URL` in `background.js` to point to your production server
2. Update the `APP_URL` in `popup.js` to point to your production app
3. Test thoroughly with the production server
4. Zip the entire `chrome-extension` directory for distribution

### Updating the Extension

After making changes:

1. Go to `chrome://extensions/`
2. Find "Bookmark App Extension"
3. Click the refresh icon to reload the extension

### Debugging

1. **Background Script**:
   - Go to `chrome://extensions/`
   - Click "Service Worker" under "Inspect views"
   - This opens the background script console

2. **Popup**:
   - Right-click the extension icon
   - Select "Inspect popup"
   - This opens the popup DevTools

3. **Content Script**:
   - Open a tab with your bookmarking app
   - Right-click the page and select "Inspect"
   - Look for the content script in the DevTools console

## Troubleshooting

### Extension doesn't load
- Ensure Developer Mode is enabled
- Check that you selected the correct directory
- Look for errors in the Chrome Extensions page

### "Please login first" message persists
- Open the bookmarking app and log in
- Check the content script console for errors
- Try clearing extension data and logging in again:
  - Go to `chrome://extensions/`
  - Click "Remove" under the extension
  - Reload the extension

### Bookmarks not saving
- Check that the API server is running
- Verify the `API_BASE_URL` is correct
- Check the background script console for API errors
- Ensure the authentication token is valid

### Token not syncing
- Refresh the bookmarking app page after logging in
- Check that the content script is loaded (look for console messages)
- Verify the extension has proper permissions

## Permissions

The extension requires the following permissions:

- **activeTab**: To access the URL and title of the current tab
- **storage**: To store authentication tokens and user information
- **Host permissions**: To make API calls to your bookmarking app server

## API Endpoints Used

- `POST /api/users/login` - User authentication (handled by the app)
- `GET /api/users/me` - Verify authentication token
- `POST /api/bookmarks` - Create new bookmark

## Browser Compatibility

This extension is built for Chrome and Chromium-based browsers (Edge, Brave, Opera, etc.) using Manifest V3.

## License

This extension is part of your bookmarking app project.