import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Bookmark from '../../models/Bookmark.js';
import Folder from '../../models/Folder.js';
import User from '../../models/User.js';
import BookmarkHTMLParser from './BookmarkHTMLParser.js';

dotenv.config();

class BookmarkImporter {
  constructor(userId) {
    this.userId = userId;
    this.folderMap = new Map(); // Maps temporary folder IDs to actual DB folder IDs
  }

  /**
   * Import bookmarks from HTML file
   * @param {string} filePath - Path to the HTML bookmark file
   * @returns {Object} Result with imported counts
   */
  async importFromFile(filePath) {
    try {
      console.log(`Starting import from: ${filePath}`);
      
      // Parse the HTML file
      const parsedItems = BookmarkHTMLParser.parseHTMLFile(filePath);
      
      // Separate folders and bookmarks
      const folders = parsedItems.filter(item => item.type === 'folder');
      const bookmarks = parsedItems.filter(item => item.type === 'bookmark');
      
      console.log(`Parsed ${folders.length} folders and ${bookmarks.length} bookmarks`);
      
      // Import folders first (since bookmarks may reference them)
      await this.importFolders(folders);
      
      // Import bookmarks
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

  /**
   * Import folders to the database
   * @param {Array} folders - Array of folder objects from parser
   */
  async importFolders(folders) {
    console.log(`Importing ${folders.length} folders...`);
    
    for (const folderData of folders) {
      try {
        // Find parent folder in our map if it exists
        let parentFolderId = null;
        if (folderData.parentId) {
          parentFolderId = this.folderMap.get(folderData.parentId);
        }
        
        // Create folder in database
        const folder = new Folder({
          name: folderData.name,
          description: '', // HTML export doesn't typically include descriptions
          parent: parentFolderId,
          owner: this.userId,
          createdAt: folderData.addDate || new Date(),
          updatedAt: folderData.lastModified || new Date()
        });
        
        await folder.save();
        
        // Store the mapping from temporary ID to actual DB ID
        this.folderMap.set(folderData.id, folder._id);
        
        console.log(`Created folder: ${folder.name} (${folder._id})`);
      } catch (error) {
        console.error(`Failed to create folder ${folderData.name}:`, error.message);
      }
    }
  }

  /**
   * Import bookmarks to the database
   * @param {Array} bookmarks - Array of bookmark objects from parser
   */
  async importBookmarks(bookmarks) {
    console.log(`Importing ${bookmarks.length} bookmarks...`);
    
    for (const bookmarkData of bookmarks) {
      try {
        // Find folder in our map if it exists
        let folderId = null;
        if (bookmarkData.parentId) {
          folderId = this.folderMap.get(bookmarkData.parentId);
        }
        
        // Create bookmark in database
        const bookmark = new Bookmark({
          url: bookmarkData.url,
          title: bookmarkData.title,
          description: '', // HTML export doesn't typically include descriptions
          tags: [], // No tags in HTML export
          favicon: '', // Will be fetched later
          owner: this.userId,
          folder: folderId,
          visibility: 'private', // Default to private
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

  /**
   * Import bookmarks from HTML content directly
   * @param {string} htmlContent - HTML content string
   * @returns {Object} Result with imported counts
   */
  async importFromContent(htmlContent) {
    try {
      console.log('Starting import from HTML content...');
      
      // Parse the HTML content
      const parsedItems = BookmarkHTMLParser.parseHTMLContent(htmlContent);
      
      // Separate folders and bookmarks
      const folders = parsedItems.filter(item => item.type === 'folder');
      const bookmarks = parsedItems.filter(item => item.type === 'bookmark');
      
      console.log(`Parsed ${folders.length} folders and ${bookmarks.length} bookmarks`);
      
      // Import folders first (since bookmarks may reference them)
      await this.importFolders(folders);
      
      // Import bookmarks
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