// popup.js

document.addEventListener('DOMContentLoaded', () => {
  const loginSection = document.getElementById('login-section');
  const loginForm = document.getElementById('login-form');
  const loginEmail = document.getElementById('login-email');
  const loginPassword = document.getElementById('login-password');
  const loginError = document.getElementById('login-error');
  const bookmarksSection = document.getElementById('bookmarks-section');
  const form = document.getElementById('add-bookmark-form');
  const titleInput = document.getElementById('bookmark-title');
  const urlInput = document.getElementById('bookmark-url');
  const bookmarksList = document.getElementById('bookmarks-list');
  const logoutBtn = document.getElementById('logout-btn');
  const toggleViewBtn = document.getElementById('toggle-view-btn');
  let showPublic = false;

  function showLogin() {
    loginSection.style.display = '';
    bookmarksSection.style.display = 'none';
    loginError.style.display = 'none';
  }

  function showBookmarks() {
    loginSection.style.display = 'none';
    bookmarksSection.style.display = '';
    showPublic = false;
    loadBookmarks();
  }

  // Check auth state on load
  chrome.storage.sync.get(['authToken'], (result) => {
    if (result.authToken) {
      showBookmarks();
    } else {
      showLogin();
    }
    // Toggle between My Bookmarks and All Public Bookmarks
  if (toggleViewBtn) {
    toggleViewBtn.addEventListener('click', () => {
      showPublic = !showPublic;
      toggleViewBtn.textContent = showPublic ? 'Show My Bookmarks' : 'Show All Public Bookmarks';
      loadBookmarks();
    });
  }
});

  // Login form handler
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    loginError.style.display = 'none';
    const email = loginEmail.value.trim();
    const password = loginPassword.value.trim();
    if (!email || !password) return;
    fetch('http://localhost:3000/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
      .then(res => res.json().then(data => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) throw new Error(data.message || 'Login failed');
        chrome.storage.sync.set({ authToken: data.token }, () => {
          loginForm.reset();
          showBookmarks();
          // Toggle between My Bookmarks and All Public Bookmarks
  if (toggleViewBtn) {
    toggleViewBtn.addEventListener('click', () => {
      showPublic = !showPublic;
      toggleViewBtn.textContent = showPublic ? 'Show My Bookmarks' : 'Show All Public Bookmarks';
      loadBookmarks();
    });
  }
});
      })
      .catch(err => {
        loginError.textContent = err.message;
        loginError.style.display = '';
        // Toggle between My Bookmarks and All Public Bookmarks
  if (toggleViewBtn) {
    toggleViewBtn.addEventListener('click', () => {
      showPublic = !showPublic;
      toggleViewBtn.textContent = showPublic ? 'Show My Bookmarks' : 'Show All Public Bookmarks';
      loadBookmarks();
    });
  }
});
    // Toggle between My Bookmarks and All Public Bookmarks
  if (toggleViewBtn) {
    toggleViewBtn.addEventListener('click', () => {
      showPublic = !showPublic;
      toggleViewBtn.textContent = showPublic ? 'Show My Bookmarks' : 'Show All Public Bookmarks';
      loadBookmarks();
    });
  }
});

  // Logout handler
  logoutBtn.addEventListener('click', () => {
    chrome.storage.sync.remove('authToken', showLogin);
    // Toggle between My Bookmarks and All Public Bookmarks
  if (toggleViewBtn) {
    toggleViewBtn.addEventListener('click', () => {
      showPublic = !showPublic;
      toggleViewBtn.textContent = showPublic ? 'Show My Bookmarks' : 'Show All Public Bookmarks';
      loadBookmarks();
    });
  }
});

  // Load bookmarks from backend
  function loadBookmarks() {
    bookmarksList.innerHTML = '<em>Loading bookmarks...</em>';
    chrome.storage.sync.get(['authToken'], (result) => {
      let url = 'http://localhost:3000/api/bookmarks';
      let headers = {};
      if (!showPublic && result.authToken) {
        headers['x-auth-token'] = result.authToken;
      }
      fetch(url, { headers })
        .then(res => res.json())
        .then(data => {
          if (!Array.isArray(data) || data.length === 0) {
            bookmarksList.innerHTML = '<em>No bookmarks found.</em>';
            return;
          }
          bookmarksList.innerHTML = '<ul>' + data.map(b => {
            let deleteBtn = '';
            // Only show delete button if user is logged in and not viewing public bookmarks
            if (!showPublic && b._id) {
              deleteBtn = ` <button class="delete-btn" data-id="${b._id}">Delete</button>`;
            }
            return `<li><a href="${b.url}" target="_blank">${b.title || b.url}</a>${deleteBtn}</li>`;
          }).join('') + '</ul>';

          // Add event listeners for delete buttons
          document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
              const id = this.getAttribute('data-id');
              if (confirm('Are you sure you want to delete this bookmark?')) {
                chrome.storage.sync.get(['authToken'], (result) => {
                  const token = result.authToken;
                  fetch(`http://localhost:3000/api/bookmarks/${id}`, {
                    method: 'DELETE',
                    headers: token ? { 'x-auth-token': token } : {}
                  })
                  .then(res => {
                    if (!res.ok) throw new Error('Failed to delete bookmark');
                    loadBookmarks();
                  })
                  .catch(() => {
                    alert('Error deleting bookmark.');
                  });
                });
              }
            });
          });
        })
        .catch(() => {
          bookmarksList.innerHTML = '<em>Error loading bookmarks.</em>';
          // Toggle between My Bookmarks and All Public Bookmarks
  if (toggleViewBtn) {
    toggleViewBtn.addEventListener('click', () => {
      showPublic = !showPublic;
      toggleViewBtn.textContent = showPublic ? 'Show My Bookmarks' : 'Show All Public Bookmarks';
      loadBookmarks();
    });
  }
});
      // Toggle between My Bookmarks and All Public Bookmarks
  if (toggleViewBtn) {
    toggleViewBtn.addEventListener('click', () => {
      showPublic = !showPublic;
      toggleViewBtn.textContent = showPublic ? 'Show My Bookmarks' : 'Show All Public Bookmarks';
      loadBookmarks();
    });
  }
});
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = titleInput.value.trim();
    const url = urlInput.value.trim();
    if (!title || !url) return;
    // Send bookmark to backend API
    chrome.storage.sync.get(['authToken'], (result) => {
      const token = result.authToken;
      fetch('http://localhost:3000/api/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'x-auth-token': token } : {})
        },
        body: JSON.stringify({ title, url })
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to add bookmark');
          return res.json();
        })
        .then(() => {
          form.reset();
          loadBookmarks();
        })
        .catch(() => {
          alert('Error adding bookmark.');
          // Toggle between My Bookmarks and All Public Bookmarks
  if (toggleViewBtn) {
    toggleViewBtn.addEventListener('click', () => {
      showPublic = !showPublic;
      toggleViewBtn.textContent = showPublic ? 'Show My Bookmarks' : 'Show All Public Bookmarks';
      loadBookmarks();
    });
  }
});
      // Toggle between My Bookmarks and All Public Bookmarks
  if (toggleViewBtn) {
    toggleViewBtn.addEventListener('click', () => {
      showPublic = !showPublic;
      toggleViewBtn.textContent = showPublic ? 'Show My Bookmarks' : 'Show All Public Bookmarks';
      loadBookmarks();
    });
  }
});
    // Toggle between My Bookmarks and All Public Bookmarks
  if (toggleViewBtn) {
    toggleViewBtn.addEventListener('click', () => {
      showPublic = !showPublic;
      toggleViewBtn.textContent = showPublic ? 'Show My Bookmarks' : 'Show All Public Bookmarks';
      loadBookmarks();
    });
  }
});
  // Toggle between My Bookmarks and All Public Bookmarks
  if (toggleViewBtn) {
    toggleViewBtn.addEventListener('click', () => {
      showPublic = !showPublic;
      toggleViewBtn.textContent = showPublic ? 'Show My Bookmarks' : 'Show All Public Bookmarks';
      loadBookmarks();
    });
  }
});
