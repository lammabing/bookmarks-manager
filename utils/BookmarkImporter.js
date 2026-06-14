import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Bookmark from '../models/Bookmark.js';
import Folder from '../models/Folder.js';
import User from '../models/User.js';
import BookmarkHTMLParser from './BookmarkHTMLParser.js';

dotenv.config();

class BookmarkImporter {
  constructor(userId) {
    this.userId = userId;
    this.folderMap = new Map();
  }

  async importFromFile(filePath) {
    try {
      console.log(`Starting import from: ${filePath}`);

      const parsedItems = BookmarkHTMLParser.parseHTMLFile(filePath);

      const folders = parsedItems.filter(item => item.type === 'folder');
      const bookmarks = parsedItems.filter(item => item.type === 'bookmark');

      console.log(`Parsed ${folders.length} folders and ${bookmarks.length} bookmarks`);

      await this.importFolders(folders);
      await this.importBookmarks(bookmarks);

      return {
        success: true,
        foldersImported: folders.length,
        bookmarksImported: bookmarks.length,
        message: `Successfully imported ${folders.length} folders and ${bookmarks.length} bookmarks`
      };
    } catch (error) {
      console.error('Import failed:', error);
      return {
        success: false,
        error: error.message,
        message: `Import failed: ${error.message}`
      };
    }
  }

  async importFolders(folders) {
    console.log(`Importing ${folders.length} folders...`);

    for (const folderData of folders) {
      try {
        let parentFolderId = null;
        if (folderData.parentId) {
          parentFolderId = this.folderMap.get(folderData.parentId);
        }

        const folder = new Folder({
          name: folderData.name,
          description: '',
          parent: parentFolderId,
          owner: this.userId,
          createdAt: folderData.addDate || new Date(),
          updatedAt: folderData.lastModified || new Date()
        });

        await folder.save();

        this.folderMap.set(folderData.id, folder._id);

        console.log(`Created folder: ${folder.name} (${folder._id})`);
      } catch (error) {
        console.error(`Failed to create folder ${folderData.name}:`, error.message);
      }
    }
  }

  async importBookmarks(bookmarks) {
    console.log(`Importing ${bookmarks.length} bookmarks...`);

    for (const bookmarkData of bookmarks) {
      try {
        let folderId = null;
        if (bookmarkData.parentId) {
          folderId = this.folderMap.get(bookmarkData.parentId);
        }

        const bookmark = new Bookmark({
          url: bookmarkData.url,
          title: bookmarkData.title,
          description: '',
          tags: [],
          favicon: '',
          owner: this.userId,
          folder: folderId,
          visibility: 'private',
          createdAt: bookmarkData.addDate || new Date(),
          updatedAt: bookmarkData.lastModified || new Date()
        });

        await bookmark.save();

        console.log(`Created bookmark: ${bookmark.title} (${bookmark.url})`);
      } catch (error) {
        console.error(`Failed to create bookmark ${bookmarkData.title}:`, error.message);
      }
    }
  }

  async importFromContent(htmlContent) {
    try {
      console.log('Starting import from HTML content...');

      const parsedItems = BookmarkHTMLParser.parseHTMLContent(htmlContent);

      const folders = parsedItems.filter(item => item.type === 'folder');
      const bookmarks = parsedItems.filter(item => item.type === 'bookmark');

      console.log(`Parsed ${folders.length} folders and ${bookmarks.length} bookmarks`);

      await this.importFolders(folders);
      await this.importBookmarks(bookmarks);

      return {
        success: true,
        foldersImported: folders.length,
        bookmarksImported: bookmarks.length,
        message: `Successfully imported ${folders.length} folders and ${bookmarks.length} bookmarks`
      };
    } catch (error) {
      console.error('Import failed:', error);
      return {
        success: false,
        error: error.message,
        message: `Import failed: ${error.message}`
      };
    }
  }
}

export default BookmarkImporter;
