import fs from 'fs';
import path from 'path';
import { parse } from 'node-html-parser';

class BookmarkHTMLParser {
  static parseHTMLFile(filePath) {
    const htmlContent = fs.readFileSync(filePath, 'utf8');
    return this.parseHTMLContent(htmlContent);
  }

  static parseHTMLContent(htmlContent) {
    const root = parse(htmlContent);
    const bookmarks = [];

    const mainDL = root.querySelector('dl');
    if (mainDL) {
      this.processDL(mainDL, bookmarks, null);
    }

    return bookmarks;
  }

  static processDL(dlElement, bookmarks, parentId) {
    const childNodes = Array.from(dlElement.childNodes);

    for (let i = 0; i < childNodes.length; i++) {
      const node = childNodes[i];

      if (node.nodeType !== 1) continue;

      if (node.tagName === 'DT') {
        const anchor = node.querySelector('a');
        const heading = node.querySelector('h3');

        if (anchor) {
          const bookmark = this.parseBookmark(anchor, parentId);
          bookmarks.push(bookmark);
        } else if (heading) {
          const folder = this.parseFolder(heading, parentId);

          for (let j = i + 1; j < childNodes.length; j++) {
            const nextNode = childNodes[j];
            if (nextNode.nodeType === 1 && nextNode.tagName === 'DL') {
              this.processDL(nextNode, bookmarks, folder.id);
              break;
            }
            if (nextNode.nodeType === 1 && nextNode.tagName === 'DT') {
              break;
            }
          }

          bookmarks.push(folder);
        }
      } else if (node.tagName === 'A') {
        const bookmark = this.parseBookmark(node, parentId);
        bookmarks.push(bookmark);
      } else if (node.tagName === 'H3') {
        const folder = this.parseFolder(node, parentId);

        for (let j = i + 1; j < childNodes.length; j++) {
          const nextNode = childNodes[j];
          if (nextNode.nodeType === 1 && nextNode.tagName === 'DL') {
            this.processDL(nextNode, bookmarks, folder.id);
            break;
          }
          if (nextNode.nodeType === 1 && (nextNode.tagName === 'H3' || nextNode.tagName === 'DT')) {
            break;
          }
        }

        bookmarks.push(folder);
      }
    }
  }

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

  static generateId(input) {
    return input.replace(/[^a-zA-Z0-9]/g, '').substring(0, 24);
  }
}

export default BookmarkHTMLParser;
