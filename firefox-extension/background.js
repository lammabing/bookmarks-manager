// background.js

// NOTE: For Firefox compatibility, use the browser.* namespace instead of chrome.*
// You may use a polyfill if you want to support both Chrome and Firefox.

browser.runtime.onInstalled.addListener(() => {
  browser.contextMenus.create({
    id: "add-bookmark",
    title: "Add page to Bookmarks Manager",
    contexts: ["page"]
  });
});

browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "add-bookmark" && tab) {
    browser.scripting.executeScript({
      target: {tabId: tab.id},
      func: () => {
        browser.runtime.sendMessage({
          action: "add_bookmark",
          url: window.location.href,
          title: document.title
        });
      }
    });
  }
});

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "add_bookmark") {
    // Send bookmark to backend API
    browser.storage.sync.get(["authToken"]).then((result) => {
      const token = result.authToken;
      fetch('http://localhost:3000/api/bookmarks', {
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
