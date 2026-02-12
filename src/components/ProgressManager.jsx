import React, { createContext, useContext, useState, useCallback } from 'react';
import { BulkOperationToast } from './BulkOperationToast';

const ProgressContext = createContext();

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};

export const ProgressProvider = ({ children }) => {
  const [activeOperations, setActiveOperations] = useState(new Map());
  const [toastManager] = useState(() => new ToastManager());

  // Start a new progress operation
  const startProgress = useCallback((operationId, options = {}) => {
    const {
      total = 100,
      message = 'Processing...',
      type = 'progress',
      autoClose = true,
      duration = 0
    } = options;

    const operation = {
      id: operationId,
      total,
      current: 0,
      message,
      type,
      startTime: Date.now(),
      status: 'running',
      autoClose,
      duration
    };

    setActiveOperations(prev => new Map(prev).set(operationId, operation));

    // Show initial toast
    toastManager.addToast({
      id: operationId,
      message,
      type,
      duration: duration > 0 ? duration : 0,
      progress: 0,
      showUndo: false
    });

    return operation;
  }, [toastManager]);

  // Update progress for an operation
  const updateProgress = useCallback((operationId, current, message) => {
    setActiveOperations(prev => {
      const operations = new Map(prev);
      const operation = operations.get(operationId);
      
      if (operation) {
        const updatedOperation = {
          ...operation,
          current: Math.min(current, operation.total),
          message: message || operation.message,
          status: current >= operation.total ? 'completed' : 'running'
        };

        operations.set(operationId, updatedOperation);

        // Update toast
        const progress = Math.round((updatedOperation.current / updatedOperation.total) * 100);
        toastManager.updateToast(operationId, {
          message: updatedOperation.message,
          progress
        });
      }

      return operations;
    });
  }, [toastManager]);

  // Complete an operation
  const completeProgress = useCallback((operationId, success = true, finalMessage) => {
    setActiveOperations(prev => {
      const operations = new Map(prev);
      const operation = operations.get(operationId);
      
      if (operation) {
        const completedOperation = {
          ...operation,
          current: operation.total,
          status: success ? 'completed' : 'failed',
          endTime: Date.now()
        };

        operations.set(operationId, completedOperation);

        // Update toast with final status
        toastManager.updateToast(operationId, {
          message: finalMessage || `${success ? 'Completed' : 'Failed'}: ${operation.message}`,
          type: success ? 'success' : 'error',
          progress: 100,
          duration: success ? 3000 : 5000
        });

        // Auto-remove after delay if autoClose is enabled
        if (operation.autoClose) {
          setTimeout(() => {
            removeProgress(operationId);
          }, success ? 3000 : 5000);
        }
      }

      return operations;
    });
  }, [toastManager]);

  // Remove an operation
  const removeProgress = useCallback((operationId) => {
    setActiveOperations(prev => {
      const operations = new Map(prev);
      operations.delete(operationId);
      return operations;
    });
    
    // Remove toast
    toastManager.removeToast(operationId);
  }, [toastManager]);

  // Get operation status
  const getProgress = useCallback((operationId) => {
    return activeOperations.get(operationId);
  }, [activeOperations]);

  // Get all active operations
  const getAllProgress = useCallback(() => {
    return Array.from(activeOperations.values());
  }, [activeOperations]);

  // Check if any operation is running
  const isAnyOperationRunning = useCallback(() => {
    return Array.from(activeOperations.values()).some(op => op.status === 'running');
  }, [activeOperations]);

  // Create a bulk operation with progress tracking
  const createBulkOperation = useCallback((operationId, items, operationFn, options = {}) => {
    const {
      batchSize = 10,
      updateInterval = 5,
      onProgress,
      onComplete,
      onError
    } = options;

    startProgress(operationId, {
      message: `Processing ${items.length} items...`,
      total: items.length,
      ...options
    });

    let currentIndex = 0;
    const results = [];
    const errors = [];

    const processBatch = async () => {
      const batch = items.slice(currentIndex, currentIndex + batchSize);
      
      for (const item of batch) {
        try {
          const result = await operationFn(item);
          results.push(result);
          
          currentIndex++;
          updateProgress(operationId, currentIndex);
          
          // Call progress callback if provided
          if (onProgress) {
            onProgress(currentIndex, items.length, result);
          }
        } catch (error) {
          errors.push({ item, error });
          currentIndex++;
          updateProgress(operationId, currentIndex, `Error processing item: ${error.message}`);
          
          // Call error callback if provided
          if (onError) {
            onError(error, item);
          }
        }
      }

      // Continue with next batch if there are more items
      if (currentIndex < items.length) {
        // Yield to the event loop to prevent blocking
        await new Promise(resolve => setTimeout(resolve, 0));
        processBatch();
      } else {
        // All items processed
        const success = errors.length === 0;
        const finalMessage = success 
          ? `Successfully processed ${items.length} items`
          : `Processed ${items.length} items with ${errors.length} errors`;
        
        completeProgress(operationId, success, finalMessage);
        
        // Call complete callback if provided
        if (onComplete) {
          onComplete(results, errors);
        }
      }
    };

    // Start processing
    processBatch();

    return {
      operationId,
      cancel: () => removeProgress(operationId)
    };
  }, [startProgress, updateProgress, completeProgress, removeProgress]);

  // Create a file upload operation with progress tracking
  const createUploadOperation = useCallback((operationId, file, uploadFn, options = {}) => {
    const {
      chunkSize = 1024 * 1024, // 1MB chunks
      onProgress,
      onComplete,
      onError
    } = options;

    startProgress(operationId, {
      message: `Uploading ${file.name}...`,
      total: file.size,
      ...options
    });

    const uploadFile = async () => {
      try {
        let uploadedBytes = 0;
        
        // Upload in chunks
        while (uploadedBytes < file.size) {
          const chunk = file.slice(uploadedBytes, uploadedBytes + chunkSize);
          
          await uploadFn(chunk, uploadedBytes, file.size);
          
          uploadedBytes += chunk.size;
          updateProgress(operationId, uploadedBytes);
          
          // Call progress callback if provided
          if (onProgress) {
            onProgress(uploadedBytes, file.size);
          }
          
          // Yield to the event loop
          await new Promise(resolve => setTimeout(resolve, 0));
        }
        
        // Upload complete
        completeProgress(operationId, true, `Successfully uploaded ${file.name}`);
        
        // Call complete callback if provided
        if (onComplete) {
          onComplete(file);
        }
      } catch (error) {
        completeProgress(operationId, false, `Upload failed: ${error.message}`);
        
        // Call error callback if provided
        if (onError) {
          onError(error);
        }
      }
    };

    // Start upload
    uploadFile();

    return {
      operationId,
      cancel: () => removeProgress(operationId)
    };
  }, [startProgress, updateProgress, completeProgress, removeProgress]);

  const value = {
    startProgress,
    updateProgress,
    completeProgress,
    removeProgress,
    getProgress,
    getAllProgress,
    isAnyOperationRunning,
    createBulkOperation,
    createUploadOperation,
    activeOperations
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
      {/* Render all active progress toasts */}
      {Array.from(activeOperations.values()).map(operation => (
        <BulkOperationToast
          key={operation.id}
          message={operation.message}
          type={operation.type}
          isVisible={true}
          duration={0} // Don't auto-close manually managed operations
          progress={Math.round((operation.current / operation.total) * 100)}
          showUndo={false}
        />
      ))}
    </ProgressContext.Provider>
  );
};

export default ProgressProvider;