// Popup script for the bookmark extension

// DOM Elements
const loading = document.getElementById('loading');
const loginSection = document.getElementById('loginSection');
const bookmarkForm = document.getElementById('bookmarkForm');
const userInfo = document.getElementById('userInfo');
const userName = document.getElementById('userName');
const userAvatar = document.getElementById('userAvatar');
const logoutBtn = document.getElementById('logoutBtn');
const loginBtn = document.getElementById('loginBtn');
const urlPreview = document.getElementById('urlPreview');
const titleInput = document.getElementById('title');
const descriptionInput = document.getElementById('description');
const tagsInput = document.getElementById('tags');
const addBookmarkBtn = document.getElementById('addBookmarkBtn');
const cancelBtn = document.getElementById('cancelBtn');
const messageDiv = document.getElementById('message');

// App URL
const APP_URL = 'http://localhost:5170'; // Change this to your production URL when deploying

// Current tab URL and title
let currentUrl = '';
let currentTitle = '';

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Popup initialized');
  
  // Get current tab info
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab) {
    currentUrl = tab.url;
    currentTitle = tab.title;
    urlPreview.textContent = currentUrl;
    titleInput.value = currentTitle || currentUrl;
  }

  // Check authentication status
  checkAuthStatus();
});

// Check if user is authenticated
async function checkAuthStatus() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'get_auth_token' });
    
    if (response && response.token) {
      // Token exists, verify it
      const verifyResponse = await chrome.runtime.sendMessage({
        action: 'verify_token',
        token: response.token
      });

      if (verifyResponse.success && verifyResponse.user) {
        // User is authenticated
        showBookmarkForm(verifyResponse.user);
      } else {
        // Token is invalid, clear it and show login
        await chrome.runtime.sendMessage({ action: 'clear_auth_token' });
        showLoginSection();
      }
    } else {
      // No token, show login
      showLoginSection();
    }
  } catch (error) {
    console.error('Error checking auth status:', error);
    showLoginSection();
  }
}

// Show login section
function showLoginSection() {
  loading.style.display = 'none';
  loginSection.style.display = 'block';
  bookmarkForm.classList.remove('active');
  userInfo.style.display = 'none';
}

// Show bookmark form
function showBookmarkForm(user) {
  loading.style.display = 'none';
  loginSection.style.display = 'none';
  bookmarkForm.classList.add('active');
  userInfo.style.display = 'flex';
  
  // Update user info
  userName.textContent = user.username || user.email || 'User';
  userAvatar.textContent = (user.username || user.email || 'U').charAt(0).toUpperCase();
}

// Show message
function showMessage(text, type = 'success') {
  messageDiv.textContent = text;
  messageDiv.className = `message ${type}`;
  
  setTimeout(() => {
    messageDiv.className = 'message';
  }, 3000);
}

// Add bookmark
async function addBookmark() {
  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();
  const tags = tagsInput.value.trim();

  if (!title) {
    showMessage('Please enter a title', 'error');
    return;
  }

  if (!currentUrl) {
    showMessage('No URL to bookmark', 'error');
    return;
  }

  // Parse tags
  const tagsArray = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

  // Prepare bookmark data
  const bookmarkData = {
    url: currentUrl,
    title: title,
    description: description,
    tags: tagsArray
  };

  // Get token
  const response = await chrome.runtime.sendMessage({ action: 'get_auth_token' });
  
  if (!response || !response.token) {
    showMessage('Please login first', 'error');
    return;
  }

  try {
    addBookmarkBtn.disabled = true;
    addBookmarkBtn.textContent = 'Adding...';

    const result = await chrome.runtime.sendMessage({
      action: 'add_bookmark',
      bookmarkData: bookmarkData,
      token: response.token
    });

    if (result.success) {
      showMessage('Bookmark added successfully!');
      
      // Clear form
      descriptionInput.value = '';
      tagsInput.value = '';
      
      // Close popup after a short delay
      setTimeout(() => {
        window.close();
      }, 1500);
    } else {
      showMessage(result.error || 'Failed to add bookmark', 'error');
    }
  } catch (error) {
    console.error('Error adding bookmark:', error);
    showMessage('Failed to add bookmark', 'error');
  } finally {
    addBookmarkBtn.disabled = false;
    addBookmarkBtn.textContent = 'Add Bookmark';
  }
}

// Function to get favicon URL for the current tab
async function getFaviconUrl(tabUrl) {
  try {
    // Try to get favicon from the tab's domain
    const url = new URL(tabUrl);
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=64`;
    return faviconUrl;
  } catch (error) {
    console.error('Error getting favicon:', error);
    return '';
  }
}

// Event listeners
loginBtn.addEventListener('click', async () => {
  // Get favicon for the current URL
  const faviconUrl = await getFaviconUrl(currentUrl);

  // Open the app in a new tab with URL parameters to pre-fill the bookmark form
  const params = new URLSearchParams({
    url: encodeURIComponent(currentUrl),
    title: encodeURIComponent(currentTitle || ''),
    description: '',
    favicon: encodeURIComponent(faviconUrl)
  });

  chrome.tabs.create({ url: `${APP_URL}?${params.toString()}` });
});


logoutBtn.addEventListener('click', async () => {
  await chrome.runtime.sendMessage({ action: 'clear_auth_token' });
  showLoginSection();
});

addBookmarkBtn.addEventListener('click', addBookmark);

cancelBtn.addEventListener('click', () => {
  window.close();
});

// Listen for storage changes (e.g., when user logs in on the app)
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.authToken) {
    if (changes.authToken.newValue) {
      // User logged in
      checkAuthStatus();
    } else {
      // User logged out
      showLoginSection();
    }
  }
});