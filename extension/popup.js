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

  function showLogin() {
    loginSection.style.display = '';
    bookmarksSection.style.display = 'none';
    loginError.style.display = 'none';
  }

  function showBookmarks() {
    loginSection.style.display = 'none';
    bookmarksSection.style.display = '';
    loadBookmarks();
  }

  // Check auth state on load
  chrome.storage.sync.get(['authToken'], (result) => {
    if (result.authToken) {
      showBookmarks();
    } else {
      showLogin();
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
        });
      })
      .catch(err => {
        loginError.textContent = err.message;
        loginError.style.display = '';
      });
  });

  // Logout handler
  logoutBtn.addEventListener('click', () => {
    chrome.storage.sync.remove('authToken', showLogin);
  });

  // Load bookmarks from backend
  function loadBookmarks() {
    bookmarksList.innerHTML = '<em>Loading bookmarks...</em>';
    chrome.storage.sync.get(['authToken'], (result) => {
      const token = result.authToken;
      fetch('http://localhost:3000/api/bookmarks', {
        headers: token ? { 'x-auth-token': token } : {}
      })
        .then(res => res.json())
        .then(data => {
          if (!Array.isArray(data) || data.length === 0) {
            bookmarksList.innerHTML = '<em>No bookmarks found.</em>';
            return;
          }
          bookmarksList.innerHTML = '<ul>' + data.map(b => `<li><a href="${b.url}" target="_blank">${b.title || b.url}</a></li>`).join('') + '</ul>';
        })
        .catch(() => {
          bookmarksList.innerHTML = '<em>Error loading bookmarks.</em>';
        });
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
        });
    });
  });
});
