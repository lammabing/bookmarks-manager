// Add to existing popup.js
const importer = new BookmarkImporter();

// Function to check login status and show appropriate section
function checkLoginStatus() {
  chrome.storage.sync.get(['authToken'], (result) => {
    if (result.authToken) {
      document.getElementById('login-section').style.display = 'none';
      document.getElementById('main-section').style.display = 'block';
      loadBookmarks();
    } else {
      document.getElementById('login-section').style.display = 'block';
      document.getElementById('main-section').style.display = 'none';
    }
  });
}

// Login form submission
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const loginErrorDiv = document.getElementById('login-error');
  loginErrorDiv.style.display = 'none';

  try {
    const response = await fetch('http://localhost:5015/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      // Store token
      chrome.storage.sync.set({ authToken: data.token }, () => {
        // Show main section
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('main-section').style.display = 'block';
        loadBookmarks();
      });
    } else {
      // Show error
      loginErrorDiv.textContent = data.message || 'Login failed.';
      loginErrorDiv.style.display = 'block';
    }
  } catch (error) {
    let errorMessage = 'An error occurred. Please try again.';
    if (error.message) {
      errorMessage += ` Details: ${error.message}`;
    }
    loginErrorDiv.textContent = errorMessage;
    loginErrorDiv.style.display = 'block';
    console.error('Login error:', error);
  }
});

// Logout button
document.getElementById('logout-btn').addEventListener('click', () => {
  chrome.storage.sync.remove('authToken', () => {
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('main-section').style.display = 'none';
    document.getElementById('login-form').reset();
  });
});

// Add Bookmark form submission
document.getElementById('add-bookmark-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('bookmark-title').value;
  const url = document.getElementById('bookmark-url').value;

  chrome.storage.sync.get(['authToken'], async (result) => {
    const token = result.authToken;
    if (!token) {
      alert('You must be logged in to add a bookmark.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5015/api/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ title, url }),
      });

      if (response.ok) {
        document.getElementById('add-bookmark-form').reset();
        loadBookmarks(); // Refresh the list
        alert('Bookmark added successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to add bookmark: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding bookmark:', error);
      alert('An error occurred while adding the bookmark.');
    }
  });
});

// Function to load and display bookmarks
async function loadBookmarks() {
  const bookmarksList = document.getElementById('bookmarks-list');
  bookmarksList.innerHTML = 'Loading bookmarks...'; // Clear previous content and show loading

  chrome.storage.sync.get(['authToken'], async (result) => {
    const token = result.authToken;
    if (!token) {
      bookmarksList.innerHTML = 'Please log in to see bookmarks.';
      return;
    }

    try {
      const response = await fetch('http://localhost:5015/api/bookmarks', {
        headers: {
          'x-auth-token': token,
        },
      });

      if (response.ok) {
        const bookmarks = await response.json();
        bookmarksList.innerHTML = ''; // Clear loading text
        if (bookmarks.length === 0) {
          bookmarksList.innerHTML = 'No bookmarks found.';
        } else {
          bookmarks.forEach(bookmark => {
            const div = document.createElement('div');
            div.className = 'bookmark-item';
            div.style.marginBottom = '10px';
            div.style.paddingBottom = '10px';
            div.style.borderBottom = '1px solid #eee';
            div.innerHTML = `
              <a href="${bookmark.url}" target="_blank" style="font-weight: bold; color: #007bff;">${bookmark.title}</a>
              <br>
              <small style="color: #6c757d;">${bookmark.url}</small>
            `;
            bookmarksList.appendChild(div);
          });
        }
      } else {
        bookmarksList.innerHTML = 'Failed to load bookmarks.';
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error);
      bookmarksList.innerHTML = 'An error occurred while loading bookmarks.';
    }
  });
}

// Initial check on popup load
document.addEventListener('DOMContentLoaded', checkLoginStatus);

// Import functionality
document.getElementById('import-all-btn').addEventListener('click', async () => {
  const bookmarkTree = await importer.getAllBookmarks();
  const bookmarks = importer.flattenBookmarks(bookmarkTree);
  
  if (bookmarks.length === 0) {
    alert('No bookmarks found to import.');
    return;
  }
  
  if (confirm(`Import ${bookmarks.length} bookmarks from your browser?`)) {
    await performImport(bookmarks);
  }
});

document.getElementById('select-folder-btn').addEventListener('click', async () => {
  const bookmarkTree = await importer.getAllBookmarks();
  const folders = importer.buildFolderTree(bookmarkTree);
  
  displayFolderSelection(folders);
});

document.getElementById('import-selected-btn').addEventListener('click', async () => {
  const bookmarkTree = await importer.getAllBookmarks();
  const bookmarks = importer.flattenBookmarks(bookmarkTree, importer.selectedFolders);
  
  if (bookmarks.length === 0) {
    alert('No bookmarks found in selected folders.');
    return;
  }
  
  await performImport(bookmarks);
});

document.getElementById('cancel-selection-btn').addEventListener('click', () => {
  document.getElementById('folder-selection').style.display = 'none';
  importer.selectedFolders.clear();
});

function displayFolderSelection(folders) {
  const folderTree = document.getElementById('folder-tree');
  folderTree.innerHTML = '';
  
  folders.forEach(folder => {
    const div = document.createElement('div');
    div.className = 'folder-item';
    div.style.marginLeft = `${folder.level * 20}px`;
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `folder-${folder.id}`;
    checkbox.addEventListener('change', (e) => {
      if (e.target.checked) {
        importer.selectedFolders.add(folder.id);
      } else {
        importer.selectedFolders.delete(folder.id);
      }
    });
    
    const label = document.createElement('label');
    label.htmlFor = `folder-${folder.id}`;
    label.textContent = `${folder.title} (${folder.bookmarkCount} bookmarks)`;
    
    div.appendChild(checkbox);
    div.appendChild(label);
    folderTree.appendChild(div);
  });
  
  document.getElementById('folder-selection').style.display = 'block';
}

async function performImport(bookmarks) {
  const progressDiv = document.getElementById('import-progress');
  const progressText = document.getElementById('progress-text');
  
  progressDiv.style.display = 'block';
  
  const result = await importer.importBookmarks(bookmarks, (imported, total) => {
    progressText.textContent = `${imported} / ${total} imported`;
  });
  
  progressDiv.style.display = 'none';
  alert(`Import complete! ${result.imported} of ${result.total} bookmarks imported successfully.`);
  
  // Refresh bookmark list
  loadBookmarks();
}