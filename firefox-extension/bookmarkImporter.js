// bookmarkImporter.js - Import browser bookmarks to the bookmarks manager

class BookmarkImporter {
  constructor(apiBaseUrl, authToken) {
    this.apiBaseUrl = apiBaseUrl;
    this.authToken = authToken;
  }

  // Get all bookmarks from the browser
  async getAllBookmarks() {
    return await browser.bookmarks.getTree();
  }

  // Flatten the bookmark tree into a simple array
  flattenBookmarks(bookmarkNodes) {
    const bookmarks = [];
    
    const traverse = (nodes, parentPath = []) => {
      nodes.forEach(node => {
        if (node.url) {
          // This is a bookmark
          bookmarks.push({
            title: node.title || 'Untitled',
            url: node.url,
            path: [...parentPath], // Path to this bookmark
            dateAdded: node.dateAdded
          });
        } else if (node.children) {
          // This is a folder
          const newPath = [...parentPath, node.title];
          traverse(node.children, newPath);
        }
      });
    };
    
    traverse(bookmarkNodes);
    return bookmarks;
  }

  // Count bookmarks in a folder and its subfolders
  countBookmarks(folder) {
    let count = 0;
    
    const traverse = (node) => {
      if (node.children) {
        node.children.forEach(child => {
          if (child.url) {
            count++;
          } else {
            traverse(child);
          }
        });
      }
    };
    
    traverse(folder);
    return count;
  }

  // Build a tree structure of bookmark folders for the UI
  buildFolderTree(bookmarkTree) {
    const buildNode = (node) => {
      if (node.children) {
        // This is a folder
        return {
          id: node.id,
          title: node.title || 'Untitled Folder',
          type: 'folder',
          children: node.children.map(buildNode).filter(child => child !== null),
          count: this.countBookmarks(node)
        };
      } else if (node.url) {
        // This is a bookmark - don't include in folder tree
        return null;
      }
    };

    // Process the root level
    const rootChildren = bookmarkTree[0]?.children || [];
    return rootChildren.map(buildNode).filter(node => node !== null);
  }

  // Import bookmarks to the backend
  async importBookmarks(bookmarks, onProgress) {
    const total = bookmarks.length;
    let imported = 0;
    
    for (const bookmark of bookmarks) {
      try {
        // Extract favicon from the domain
        const urlObj = new URL(bookmark.url);
        const favicon = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`;
        
        // Create tags from the folder path
        const tags = bookmark.path.filter(p => p && p.trim() !== '');
        
        const response = await fetch(`${this.apiBaseUrl}/bookmarks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': this.authToken
          },
          body: JSON.stringify({
            title: bookmark.title,
            url: bookmark.url,
            description: '',
            tags: tags,
            favicon: favicon
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error(`Failed to import bookmark: ${bookmark.url}`, errorData);
        } else {
          imported++;
        }
        
        // Report progress
        if (onProgress) {
          onProgress(imported, total);
        }
      } catch (error) {
        console.error(`Error importing bookmark: ${bookmark.url}`, error);
      }
    }
    
    return imported;
  }
}

// Export for use in popup.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BookmarkImporter;
}