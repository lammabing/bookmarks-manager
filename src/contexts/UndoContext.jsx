import React, { createContext, useContext, useState, useCallback } from 'react';
import undoManager from '../utils/undoManager';
import { ToastManager } from '../components/BulkOperationToast';

const UndoContext = createContext();

export const useUndo = () => {
  const context = useContext(UndoContext);
  if (!context) {
    throw new Error('useUndo must be used within an UndoProvider');
  }
  return context;
};

export const UndoProvider = ({ children }) => {
  const [toastManager] = useState(() => new ToastManager());
  const [isUndoing, setIsUndoing] = useState(false);
  const [isRedoing, setIsRedoing] = useState(false);

  // Add a new operation to the undo stack
  const addOperation = useCallback((operation) => {
    undoManager.addOperation(operation);
  }, []);

  // Undo the last operation
  const undo = useCallback(async () => {
    if (undoManager.getUndoCount() === 0 || isUndoing) return;

    setIsUndoing(true);
    const result = await undoManager.undo();
    
    if (result && result.success) {
      // Show success toast
      toastManager.addToast({
        message: result.message,
        type: 'success',
        duration: 3000,
        showUndo: false
      });
    } else if (result) {
      // Show error toast
      toastManager.addToast({
        message: result.error || 'Failed to undo operation',
        type: 'error',
        duration: 5000,
        showUndo: false
      });
    }
    
    setIsUndoing(false);
    return result;
  }, [isUndoing, toastManager]);

  // Redo the last undone operation
  const redo = useCallback(async () => {
    if (undoManager.getRedoCount() === 0 || isRedoing) return;

    setIsRedoing(true);
    const result = await undoManager.redo();
    
    if (result && result.success) {
      // Show success toast
      toastManager.addToast({
        message: result.message,
        type: 'success',
        duration: 3000,
        showUndo: false
      });
    } else if (result) {
      // Show error toast
      toastManager.addToast({
        message: result.error || 'Failed to redo operation',
        type: 'error',
        duration: 5000,
        showUndo: false
      });
    }
    
    setIsRedoing(false);
    return result;
  }, [isRedoing, toastManager]);

  // Clear all operations
  const clear = useCallback(() => {
    undoManager.clear();
  }, []);

  // Get undo/redo status
  const canUndo = undoManager.getUndoCount() > 0;
  const canRedo = undoManager.getRedoCount() > 0;

  // Create and add a bulk delete operation
  const createBulkDeleteOperation = useCallback((bookmarks, deleteFunction) => {
    const operation = undoManager.createBulkDeleteOperation(bookmarks, deleteFunction);
    addOperation(operation);
    return operation;
  }, [addOperation]);

  // Create and add a bulk edit operation
  const createBulkEditOperation = useCallback((bookmarks, originalData, editFunction) => {
    const operation = undoManager.createBulkEditOperation(bookmarks, originalData, editFunction);
    addOperation(operation);
    return operation;
  }, [addOperation]);

  // Create and add a bulk tags operation
  const createBulkTagsOperation = useCallback((bookmarks, originalTags, addedTags, tagsFunction) => {
    const operation = undoManager.createBulkTagsOperation(bookmarks, originalTags, addedTags, tagsFunction);
    addOperation(operation);
    return operation;
  }, [addOperation]);

  // Create and add a bulk visibility operation
  const createBulkVisibilityOperation = useCallback((bookmarks, originalVisibility, visibilityFunction) => {
    const operation = undoManager.createBulkVisibilityOperation(bookmarks, originalVisibility, visibilityFunction);
    addOperation(operation);
    return operation;
  }, [addOperation]);

  // Create and add a bulk share operation
  const createBulkShareOperation = useCallback((bookmarks, originalSharedWith, sharedWith, shareFunction) => {
    const operation = undoManager.createBulkShareOperation(bookmarks, originalSharedWith, sharedWith, shareFunction);
    addOperation(operation);
    return operation;
  }, [addOperation]);

  // Handle keyboard shortcuts for undo/redo
  const handleKeyDown = useCallback((event) => {
    // Ctrl+Z or Cmd+Z for undo
    if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
      event.preventDefault();
      undo();
    }
    // Ctrl+Shift+Z or Cmd+Shift+Z or Ctrl+Y for redo
    else if (
      ((event.ctrlKey || event.metaKey) && event.key === 'z' && event.shiftKey) ||
      ((event.ctrlKey || event.metaKey) && event.key === 'y')
    ) {
      event.preventDefault();
      redo();
    }
  }, [undo, redo]);

  // Add keyboard event listener
  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const value = {
    canUndo,
    canRedo,
    isUndoing,
    isRedoing,
    undo,
    redo,
    clear,
    addOperation,
    createBulkDeleteOperation,
    createBulkEditOperation,
    createBulkTagsOperation,
    createBulkVisibilityOperation,
    createBulkShareOperation,
    toastManager
  };

  return (
    <UndoContext.Provider value={value}>
      {children}
      {/* Render all active toasts */}
      {toastManager.toasts.map(toast => (
        <toastManager.ToastComponent key={toast.id} toast={toast} />
      ))}
    </UndoContext.Provider>
  );
};

export default UndoProvider;