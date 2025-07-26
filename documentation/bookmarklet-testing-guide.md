# Bookmarklet Testing Guide

This guide will help you verify that the useEffect hook in the AddBookmarkForm component is being properly triggered by the bookmarklet.

## Prerequisites

1. Ensure the development server is running (`npm run dev`)
2. Make sure you have installed the bookmarklet in your browser

## Testing Steps

### 1. Open Browser Developer Tools
- Open your browser's developer tools
- Navigate to the Console tab

### 2. Test with the Bookmarklet Test Page
- Navigate to http://localhost:5170/bookmarklet-test.html
- Click the bookmarklet in your bookmarks bar
- Observe the console logs in the developer tools

### 3. Expected Console Output
When the bookmarklet opens the bookmarks-manager app, you should see the following log messages in the console:

1. `AddBookmarkForm useEffect triggered`
2. `URL Parameters:` followed by an object containing the url, title, description, and favicon parameters
3. `Setting form data with:` followed by an object showing the parsed data that will populate the form

### 4. Verify Form Population
- Check that the form fields (URL, Title, Description) are pre-filled with the data from the test page
- The favicon should also be displayed in the form

## Troubleshooting

If you don't see the expected console logs:

1. Make sure you're running the development server (not production build)
2. Verify that the bookmarklet code is correctly installed in your browser
3. Check that there are no JavaScript errors in the console
4. Ensure you're testing with a page that has the proper metadata (title, description)

## Manual Testing
You can also manually test the URL parameter parsing by navigating directly to:
```
http://localhost:5170/?url=https%3A%2F%2Fexample.com&title=Example%20Page&description=This%20is%20an%20example%20page
```

This should trigger the same useEffect hook and populate the form with the provided parameters.

## How It Works
When the bookmarklet opens the URL with parameters, the Home component now detects these parameters and automatically displays the AddBookmarkForm with the pre-filled data. This allows users to quickly add bookmarks without needing to log in first, though they will need to log in to save the bookmark.

## Troubleshooting Vite Issues
If you encounter Vite "403 Restricted" errors:

1. Ensure you've updated the vite.config.js file with the proper fs.allow settings
2. Restart your development server after making configuration changes
3. Make sure you're accessing the application through the correct URL (typically http://localhost:5170)