// Popup script for the bookmark extension

// DOM Elements
const loading = document.getElementById('loading');
const bookmarkForm = document.getElementById('bookmarkForm');
const userInfo = document.getElementById('userInfo');
const userName = document.getElementById('userName');
const userAvatar = document.getElementById('userAvatar');
const logoutBtn = document.getElementById('logoutBtn');
const urlPreview = document.getElementById('urlPreview');
const titleInput = document.getElementById('title');
const descriptionInput = document.getElementById('description');
const tagsInput = document.getElementById('tags');
const addBookmarkBtn = document.getElementById('addBookmarkBtn');
const cancelBtn = document.getElementById('cancelBtn');
const messageDiv = document.getElementById('message');

// App URL
let APP_URL = 'http://localhost:5170';

let currentUrl = '';
let currentTitle = '';

document.addEventListener('DOMContentLoaded', async () => {
  const { appUrl } = await chrome.storage.sync.get('appUrl');
  if (appUrl) APP_URL = appUrl;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab) {
    currentUrl = tab.url;
    currentTitle = tab.title;
    urlPreview.textContent = currentUrl;
    titleInput.value = currentTitle || currentUrl;
  }

  checkAuthStatus();
});

// Check if user is authenticated
async function checkAuthStatus() {
  try {
    // First try to get token from background storage
    const response = await chrome.runtime.sendMessage({ action: 'get_auth_token' });
    
    if (response && response.token) {
      showBookmarkForm(response.user || {});
      return;
    }

    // No token in background — try to get it from the content script on the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id) {
      try {
        const contentResponse = await new Promise((resolve, reject) => {
          chrome.tabs.sendMessage(tab.id, { action: 'check_auth_status' }, (res) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve(res);
            }
          });
        });

        if (contentResponse && contentResponse.token) {
          await chrome.runtime.sendMessage({
            action: 'set_auth_token',
            token: contentResponse.token,
            user: contentResponse.user
          });
          showBookmarkForm(contentResponse.user || {});
          return;
        }
      } catch (e) {
        console.log('Could not read token from content script:', e.message);
      }
    }

    // No token found — redirect to the app's bookmark form and close popup
    openAppWithBookmarkData();
  } catch (error) {
    console.error('Error checking auth status:', error);
    openAppWithBookmarkData();
  }
}

// Open the app's bookmark form in a new tab with the current page data
async function openAppWithBookmarkData() {
  const faviconUrl = await getFaviconUrl(currentUrl);
  const params = new URLSearchParams({
    url: currentUrl,
    title: currentTitle || '',
    description: '',
    favicon: faviconUrl
  });
  chrome.tabs.create({ url: `${APP_URL}/bookmark/new?${params.toString()}` });
  window.close();
}

// Show bookmark form
function showBookmarkForm(user) {
  loading.style.display = 'none';
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
logoutBtn.addEventListener('click', async () => {
  await chrome.runtime.sendMessage({ action: 'clear_auth_token' });
  chrome.tabs.create({ url: APP_URL });
  window.close();
});

addBookmarkBtn.addEventListener('click', addBookmark);

cancelBtn.addEventListener('click', () => {
  window.close();
});

// Listen for storage changes (e.g., when user logs in on the app)
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.authToken) {
    if (changes.authToken.newValue) {
      // User logged in — re-check auth
      checkAuthStatus();
    } else {
      // User logged out — close popup
      window.close();
    }
  }
});