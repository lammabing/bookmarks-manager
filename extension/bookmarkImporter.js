// Browser bookmark import functionality
class BookmarkImporter {
  constructor() {
    this.selectedFolders = new Set();
  }

  // Get all browser bookmarks
  async getAllBookmarks() {
    return new Promise((resolve) => {
      chrome.bookmarks.getTree((bookmarkTree) => {
        resolve(bookmarkTree);
      });
    });
  }

  // Flatten bookmark tree into importable format
  flattenBookmarks(bookmarkTree, selectedFolderIds = null) {
    const bookmarks = [];
    
    const traverse = (nodes, path = '') => {
      for (const node of nodes) {
        if (node.url) {
          // This is a bookmark
          if (!selectedFolderIds || selectedFolderIds.has(node.parentId)) {
            bookmarks.push({
              url: node.url,
              title: node.title,
              description: '',
              tags: path ? [path.replace(/\//g, '_')] : [],
              favicon: `https://www.google.com/s2/favicons?domain=${new URL(node.url).hostname}`,
              visibility: 'private',
              browserFolder: path
            });
          }
        } else if (node.children) {
          // This is a folder
          const folderPath = path ? `${path}/${node.title}` : node.title;
          traverse(node.children, folderPath);
        }
      }
    };

    traverse(bookmarkTree);
    return bookmarks;
  }

  // Build folder tree for selection UI
  buildFolderTree(bookmarkTree) {
    const folders = [];
    
    const traverse = (nodes, level = 0) => {
      for (const node of nodes) {
        if (node.children && node.title) {
          folders.push({
            id: node.id,
            title: node.title,
            level: level,
            bookmarkCount: this.countBookmarks(node)
          });
          traverse(node.children, level + 1);
        }
      }
    };

    traverse(bookmarkTree);
    return folders;
  }

  // Count bookmarks in a folder (recursive)
  countBookmarks(node) {
    let count = 0;
    if (node.children) {
      for (const child of node.children) {
        if (child.url) {
          count++;
        } else if (child.children) {
          count += this.countBookmarks(child);
        }
      }
    }
    return count;
  }

  // Import bookmarks to backend
  async importBookmarks(bookmarks, onProgress) {
    let imported = 0;
    const total = bookmarks.length;
    
    for (const bookmark of bookmarks) {
      try {
        const token = await this.getAuthToken();
        const response = await fetch('http://localhost:3000/api/bookmarks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'x-auth-token': token } : {})
          },
          body: JSON.stringify(bookmark)
        });

        if (response.ok) {
          imported++;
        }
        
        if (onProgress) {
          onProgress(imported, total);
        }
        
        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error('Error importing bookmark:', bookmark.title, error);
      }
    }
    
    return { imported, total };
  }

  // Get auth token from storage
  async getAuthToken() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['authToken'], (result) => {
        resolve(result.authToken);
      });
    });
  }
}