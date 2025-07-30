# Bookmarklet Guide

The bookmarklet allows you to quickly add bookmarks to your bookmarks-manager from any webpage with a single click.

## How to Install the Bookmarklet

1. Copy the following JavaScript code:

```javascript
javascript:(function(){const url=encodeURIComponent(window.location.href),title=encodeURIComponent(document.title||""),metaDesc=document.querySelector('meta[name="description"]'),description=metaDesc?encodeURIComponent(metaDesc.getAttribute("content")||""):"",faviconLink=document.querySelector('link[rel*="icon"]'),favicon=faviconLink&&faviconLink.href?encodeURIComponent(faviconLink.href):function(){try{return encodeURIComponent(`https://www.google.com/s2/favicons?domain=${window.location.hostname}`)}catch(e){return""}}(),appUrl=`http://localhost:5170/?url=${url}&title=${title}&description=${description}&favicon=${favicon}`,width=600,height=700,left=(screen.width-width)/2,top=(screen.height-height)/2;window.open(appUrl,"_blank",`width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`);})();
```

2. Create a new bookmark in your browser's bookmarks bar
3. Name it "Add to Bookmarks Manager" (or any name you prefer)
4. Paste the copied JavaScript code as the URL/address of the bookmark
5. Save the bookmark

## How to Use the Bookmarklet

1. Navigate to any webpage you want to bookmark
2. Click the "Add to Bookmarks Manager" bookmark in your bookmarks bar
3. A new window will open with a form pre-filled with:
   - Page URL
   - Page title
   - Page description (if available)
   - Site favicon (if available)
4. You can edit any of these fields before saving
5. Click "Add Bookmark" to save it to your bookmarks-manager
6. After successful save, you'll see a subtle success message and the form will automatically close

## Features

- Automatically extracts page information (URL, title, description)
- Attempts to fetch the site's favicon
- Opens in a properly sized window for easy use
- Works on most websites
- Preserves form data during login redirects
- Shows subtle success indication when bookmark is added
- Automatically closes after successful save

## Troubleshooting

If the bookmarklet doesn't work:

1. Make sure your bookmarks-manager is running on `http://localhost:5170`
2. Check that you're logged in to your bookmarks-manager
3. Try refreshing the page before using the bookmarklet
4. Some websites with strict Content Security Policies may block bookmarklets

## Customization

If you're running your bookmarks-manager on a different port or URL, you'll need to modify the bookmarklet code accordingly. Change this part of the code:

```javascript
const appUrl = `http://localhost:5170/?url=${url}&title=${title}&description=${description}&favicon=${favicon}`;
```

Replace `http://localhost:5170` with your actual bookmarks-manager URL.

## Testing

For detailed testing instructions, see the [Bookmarklet Testing Guide](bookmarklet-testing-guide.md).

---
*Last Updated: 2025-07-30 by Development Team*