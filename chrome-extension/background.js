// Background service worker for the bookmark extension

// API base URL - adjust this to match your server
const API_BASE_URL = 'http://localhost:5170/api';

// Listen for messages from popup and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);

  if (request.action === 'get_auth_token') {
    // Retrieve stored token
    chrome.storage.local.get(['authToken', 'user'], (result) => {
      sendResponse({
        token: result.authToken || null,
        user: result.user || null
      });
    });
    return true; // Keep message channel open for async response
  }

  if (request.action === 'set_auth_token') {
    // Store auth token and user info
    chrome.storage.local.set({
      authToken: request.token,
      user: request.user
    }, () => {
      console.log('Auth token stored successfully');
      sendResponse({ success: true });
    });
    return true;
  }

  if (request.action === 'clear_auth_token') {
    // Clear auth token and user info
    chrome.storage.local.remove(['authToken', 'user'], () => {
      console.log('Auth token cleared');
      sendResponse({ success: true });
    });
    return true;
  }

  if (request.action === 'add_bookmark') {
    // Add bookmark to the app
    addBookmark(request.bookmarkData, request.token)
      .then(response => sendResponse({ success: true, data: response }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (request.action === 'verify_token') {
    // Verify if token is still valid
    verifyToken(request.token)
      .then(user => sendResponse({ success: true, user }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

// Function to add bookmark
async function addBookmark(bookmarkData, token) {
  try {
    const response = await fetch(`${API_BASE_URL}/bookmarks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      },
      body: JSON.stringify(bookmarkData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add bookmark');
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding bookmark:', error);
    throw error;
  }
}

// Function to verify token
async function verifyToken(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'GET',
      headers: {
        'x-auth-token': token
      }
    });

    if (!response.ok) {
      throw new Error('Token is invalid or expired');
    }

    return await response.json();
  } catch (error) {
    console.error('Error verifying token:', error);
    throw error;
  }
}

// Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Bookmark extension installed');
});

// Listen for extension startup
chrome.runtime.onStartup.addListener(() => {
  console.log('Bookmark extension started');
});