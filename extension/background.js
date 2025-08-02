// background.js

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "add-bookmark",
        title: "Add page to Bookmarks Manager",
        contexts: ["page"]
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "add-bookmark" && tab) {
        chrome.scripting.executeScript({
            target: {tabId: tab.id},
            func: () => {
                chrome.runtime.sendMessage({
                    action: "add_bookmark",
                    url: window.location.href,
                    title: document.title
                });
            }
        });
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "add_bookmark") {
        // Send bookmark to backend API
        chrome.storage.sync.get(['authToken'], (result) => {
            const token = result.authToken;
            fetch('http://localhost:5015/api/bookmarks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'x-auth-token': token } : {})
                },
                body: JSON.stringify({ title: message.title, url: message.url })
            })
                .then(res => {
                    if (!res.ok) throw new Error('Failed to add bookmark');
                    return res.json();
                })
                .then(() => {
                    // Optionally notify the user or update UI
                })
                .catch(() => {
                    // Optionally handle error
                });
        });
    }
  });
  
  // Listen for messages from the web application
  chrome.runtime.onMessageExternal.addListener(
    (request, sender, sendResponse) => {
      // Verify the sender is the correct web app
      if (sender.url === "http://localhost:5015/" && request.action === "set_auth_token" && request.token) {
        chrome.storage.sync.set({ authToken: request.token }, () => {
          console.log("Auth token received from web app and stored in extension.");
          sendResponse({ status: "success" });
        });
      }
      return true; // Indicates you wish to send a response asynchronously
    }
  );
