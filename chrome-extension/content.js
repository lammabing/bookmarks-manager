// Content script for the bookmark app
// This script runs on the bookmark app pages to receive auth tokens

console.log('Bookmark app content script loaded');

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Content script received message:', request);

  if (request.action === 'check_auth_status') {
    // Check if user is logged in on the page
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    
    sendResponse({
      isLoggedIn: !!token,
      token: token,
      user: user
    });
  }

  if (request.action === 'listen_for_auth_changes') {
    // Listen for auth changes on the page
    // This is already handled by the window.addEventListener('storage') in the popup
    // But we can add additional monitoring here if needed
    console.log('Listening for auth changes...');
  }
});

// Send auth token to extension when user logs in
const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
  originalSetItem.apply(this, arguments);
  
  if (key === 'token') {
    console.log('Token changed in localStorage, notifying extension');
    // Get user info
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    
    // Send to extension
    if (value && user) {
      chrome.runtime.sendMessage({
        action: 'set_auth_token',
        token: value,
        user: user
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.log('Could not send token to extension:', chrome.runtime.lastError.message);
        } else {
          console.log('Token sent to extension successfully');
        }
      });
    }
  }
};

// Send auth token to extension on page load (if user is already logged in)
window.addEventListener('load', () => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  if (token && userStr) {
    const user = JSON.parse(userStr);
    console.log('User is already logged in, sending token to extension');
    
    chrome.runtime.sendMessage({
      action: 'set_auth_token',
      token: token,
      user: user
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.log('Could not send token to extension:', chrome.runtime.lastError.message);
      } else {
        console.log('Token sent to extension successfully');
      }
    });
  }
});

// Listen for token removal (logout)
const originalRemoveItem = localStorage.removeItem;
localStorage.removeItem = function(key) {
  originalRemoveItem.apply(this, arguments);
  
  if (key === 'token') {
    console.log('Token removed from localStorage, notifying extension');
    chrome.runtime.sendMessage({
      action: 'clear_auth_token'
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.log('Could not notify extension:', chrome.runtime.lastError.message);
      } else {
        console.log('Extension notified of logout');
      }
    });
  }
};