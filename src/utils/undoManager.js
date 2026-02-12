class UndoManager {
  constructor() {
    this.undoStack = [];
    this.redoStack = [];
    this.maxStackSize = 50;
  }

  // Add a new operation to the undo stack
  addOperation(operation) {
    this.undoStack.push({
      ...operation,
      timestamp: Date.now()
    });
    
    // Limit stack size
    if (this.undoStack.length > this.maxStackSize) {
      this.undoStack.shift();
    }
    
    // Clear redo stack when new operation is added
    this.redoStack = [];
  }

  // Undo the last operation
  async undo() {
    if (this.undoStack.length === 0) {
      return null;
    }

    const operation = this.undoStack.pop();
    this.redoStack.push(operation);

    try {
      // Execute the undo operation
      if (operation.undo) {
        await operation.undo();
      }
      
      return {
        success: true,
        operation,
        message: operation.undoMessage || `Undid ${operation.type} operation`
      };
    } catch (error) {
      console.error('Error undoing operation:', error);
      return {
        success: false,
        error: error.message,
        operation
      };
    }
  }

  // Redo the last undone operation
  async redo() {
    if (this.redoStack.length === 0) {
      return null;
    }

    const operation = this.redoStack.pop();
    this.undoStack.push(operation);

    try {
      // Execute the redo operation
      if (operation.redo) {
        await operation.redo();
      }
      
      return {
        success: true,
        operation,
        message: operation.redoMessage || `Redid ${operation.type} operation`
      };
    } catch (error) {
      console.error('Error redoing operation:', error);
      return {
        success: false,
        error: error.message,
        operation
      };
    }
  }

  // Clear all operations
  clear() {
    this.undoStack = [];
    this.redoStack = [];
  }

  // Get the number of undo operations available
  getUndoCount() {
    return this.undoStack.length;
  }

  // Get the number of redo operations available
  getRedoCount() {
    return this.redoStack.length;
  }

  // Get the last operation (without removing it)
  peekLastOperation() {
    return this.undoStack.length > 0 ? this.undoStack[this.undoStack.length - 1] : null;
  }

  // Create a bulk delete operation for undo
  createBulkDeleteOperation(bookmarks, deleteFunction) {
    return {
      type: 'bulk-delete',
      data: bookmarks,
      undoMessage: `Restore ${bookmarks.length} bookmarks`,
      redoMessage: `Delete ${bookmarks.length} bookmarks`,
      undo: async () => {
        // Restore all bookmarks
        for (const bookmark of bookmarks) {
          await deleteFunction(bookmark, true); // Pass true to indicate restore
        }
      },
      redo: async () => {
        // Delete all bookmarks again
        for (const bookmark of bookmarks) {
          await deleteFunction(bookmark, false); // Pass false to indicate delete
        }
      }
    };
  }

  // Create a bulk edit operation for undo
  createBulkEditOperation(bookmarks, originalData, editFunction) {
    return {
      type: 'bulk-edit',
      data: { bookmarks, originalData },
      undoMessage: `Revert ${bookmarks.length} bookmarks to previous state`,
      redoMessage: `Apply changes to ${bookmarks.length} bookmarks`,
      undo: async () => {
        // Restore original data
        for (const bookmark of bookmarks) {
          const original = originalData.find(b => b._id === bookmark._id);
          if (original) {
            await editFunction(original, true); // Pass true to indicate restore
          }
        }
      },
      redo: async () => {
        // Apply new data again
        for (const bookmark of bookmarks) {
          await editFunction(bookmark, false); // Pass false to indicate apply
        }
      }
    };
  }

  // Create a bulk tags operation for undo
  createBulkTagsOperation(bookmarks, originalTags, addedTags, tagsFunction) {
    return {
      type: 'bulk-tags',
      data: { bookmarks, originalTags, addedTags },
      undoMessage: `Remove tags from ${bookmarks.length} bookmarks`,
      redoMessage: `Add tags to ${bookmarks.length} bookmarks`,
      undo: async () => {
        // Remove added tags
        for (const bookmark of bookmarks) {
          const original = originalTags.find(b => b._id === bookmark._id);
          if (original) {
            await tagsFunction(bookmark._id, original, true); // Pass true to indicate remove
          }
        }
      },
      redo: async () => {
        // Add tags again
        for (const bookmark of bookmarks) {
          await tagsFunction(bookmark._id, addedTags, false); // Pass false to indicate add
        }
      }
    };
  }

  // Create a bulk visibility operation for undo
  createBulkVisibilityOperation(bookmarks, originalVisibility, visibilityFunction) {
    return {
      type: 'bulk-visibility',
      data: { bookmarks, originalVisibility },
      undoMessage: `Revert visibility for ${bookmarks.length} bookmarks`,
      redoMessage: `Change visibility for ${bookmarks.length} bookmarks`,
      undo: async () => {
        // Restore original visibility
        for (const bookmark of bookmarks) {
          const original = originalVisibility.find(b => b._id === bookmark._id);
          if (original) {
            await visibilityFunction(bookmark._id, original, true); // Pass true to indicate restore
          }
        }
      },
      redo: async () => {
        // Apply new visibility again
        for (const bookmark of bookmarks) {
          await visibilityFunction(bookmark._id, bookmark.visibility, false); // Pass false to indicate apply
        }
      }
    };
  }

  // Create a bulk share operation for undo
  createBulkShareOperation(bookmarks, originalSharedWith, sharedWith, shareFunction) {
    return {
      type: 'bulk-share',
      data: { bookmarks, originalSharedWith, sharedWith },
      undoMessage: `Revert sharing for ${bookmarks.length} bookmarks`,
      redoMessage: `Share ${bookmarks.length} bookmarks`,
      undo: async () => {
        // Restore original sharing
        for (const bookmark of bookmarks) {
          const original = originalSharedWith.find(b => b._id === bookmark._id);
          if (original) {
            await shareFunction(bookmark._id, original, true); // Pass true to indicate restore
          }
        }
      },
      redo: async () => {
        // Apply new sharing again
        for (const bookmark of bookmarks) {
          await shareFunction(bookmark._id, sharedWith, false); // Pass false to indicate apply
        }
      }
    };
  }
}

// Create a singleton instance
const undoManager = new UndoManager();

export default undoManager;