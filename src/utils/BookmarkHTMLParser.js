import fs from 'fs';
import path from 'path';
import { parse } from 'node-html-parser';

/**
 * Parse HTML bookmark file exported from browsers
 */
class BookmarkHTMLParser {
  /**
   * Parse the HTML bookmark file
   * @param {string} filePath - Path to the HTML bookmark file
   * @returns {Array} Array of bookmarks and folders
   */
  static parseHTMLFile(filePath) {
    const htmlContent = fs.readFileSync(filePath, 'utf8');
    return this.parseHTMLContent(htmlContent);
  }

  /**
   * Parse HTML content directly
   * @param {string} htmlContent - HTML content string
   * @returns {Array} Array of bookmarks and folders
   */
  static parseHTMLContent(htmlContent) {
    const root = parse(htmlContent);
    const bookmarks = [];

    // Look for the first DL in the document (could be direct child of root)
    const mainDL = root.querySelector('dl');
    if (mainDL) {
      this.processDL(mainDL, bookmarks, null);
    }

    return bookmarks;
  }

  /**
   * Process a DL element (folder/container)
   * @param {HTMLElement} dlElement - DL element to process
   * @param {Array} bookmarks - Array to add processed items to
   * @param {string|null} parentId - Parent folder ID (null for root level)
   */
  static processDL(dlElement, bookmarks, parentId) {
    // Get all direct children nodes
    const childNodes = Array.from(dlElement.childNodes);
    
    for (let i = 0; i < childNodes.length; i++) {
      const node = childNodes[i];
      
      // Skip text nodes (like <p> tags)
      if (node.nodeType !== 1) continue; // 1 = ELEMENT_NODE
      
      if (node.tagName === 'DT') {
        // DT contains either a bookmark (A tag) or folder (H3 tag)
        const anchor = node.querySelector('a');
        const heading = node.querySelector('h3');

        if (anchor) {
          // This is a bookmark inside DT
          const bookmark = this.parseBookmark(anchor, parentId);
          bookmarks.push(bookmark);
        } else if (heading) {
          // This is a folder inside DT
          const folder = this.parseFolder(heading, parentId);

          // The folder's contents DL comes after this DT
          // Look for the next sibling that is a DL
          for (let j = i + 1; j < childNodes.length; j++) {
            const nextNode = childNodes[j];
            if (nextNode.nodeType === 1 && nextNode.tagName === 'DL') {
              this.processDL(nextNode, bookmarks, folder.id);
              break; // Only process the first DL after the folder
            }
            // Stop if we hit another DT (meaning the next item)
            if (nextNode.nodeType === 1 && nextNode.tagName === 'DT') {
              break;
            }
          }

          bookmarks.push(folder);
        }
      } else if (node.tagName === 'A') {
        // Standalone bookmark (not inside DT)
        const bookmark = this.parseBookmark(node, parentId);
        bookmarks.push(bookmark);
      } else if (node.tagName === 'H3') {
        // Standalone folder (not inside DT)
        const folder = this.parseFolder(node, parentId);

        // The folder's contents DL comes after this H3
        // Look for the next sibling that is a DL
        for (let j = i + 1; j < childNodes.length; j++) {
          const nextNode = childNodes[j];
          if (nextNode.nodeType === 1 && nextNode.tagName === 'DL') {
            this.processDL(nextNode, bookmarks, folder.id);
            break; // Only process the first DL after the folder
          }
          // Stop if we hit another H3 or DT (meaning the next item)
          if (nextNode.nodeType === 1 && (nextNode.tagName === 'H3' || nextNode.tagName === 'DT')) {
            break;
          }
        }

        bookmarks.push(folder);
      }
    }
  }

  /**
   * Parse a bookmark from an anchor element
   * @param {HTMLElement} anchor - Anchor element
   * @param {string|null} parentId - Parent folder ID
   * @returns {Object} Bookmark object
   */
  static parseBookmark(anchor, parentId) {
    const href = anchor.getAttribute('href');
    const title = anchor.textContent.trim();
    const addDate = anchor.getAttribute('add_date');
    const lastModified = anchor.getAttribute('last_modified');
    
    return {
      type: 'bookmark',
      id: this.generateId(href + (addDate || '')),
      url: href,
      title: title || href,
      parentId: parentId,
      addDate: addDate ? new Date(parseInt(addDate) * 1000) : new Date(),
      lastModified: lastModified ? new Date(parseInt(lastModified) * 1000) : new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Parse a folder from an H3 element
   * @param {HTMLElement} heading - H3 element
   * @param {string|null} parentId - Parent folder ID
   * @returns {Object} Folder object
   */
  static parseFolder(heading, parentId) {
    const title = heading.textContent.trim();
    const addDate = heading.getAttribute('add_date');
    const lastModified = heading.getAttribute('last_modified');
    
    return {
      type: 'folder',
      id: this.generateId(title + (addDate || '')),
      name: title,
      parentId: parentId,
      addDate: addDate ? new Date(parseInt(addDate) * 1000) : new Date(),
      lastModified: lastModified ? new Date(parseInt(lastModified) * 1000) : new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Generate a simple ID based on input
   * @param {string} input - Input string to generate ID from
   * @returns {string} Generated ID
   */
  static generateId(input) {
    return input.replace(/[^a-zA-Z0-9]/g, '').substring(0, 24);
  }
}

export default BookmarkHTMLParser;