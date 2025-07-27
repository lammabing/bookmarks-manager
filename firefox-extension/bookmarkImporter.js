// Firefox version - replace chrome.* with browser.*
class BookmarkImporter {
  async getAllBookmarks() {
    return browser.bookmarks.getTree();
  }

  async getAuthToken() {
    const result = await browser.storage.sync.get(['authToken']);
    return result.authToken;
  }
  
  // ... rest of the methods remain the same
}