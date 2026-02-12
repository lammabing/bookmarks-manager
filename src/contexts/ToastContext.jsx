import React, { createContext, useContext, useState } from 'react';
import ToastNotification from '../components/ToastNotification';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', options = {}) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      message,
      type,
      ...options
    };
    
    setToasts(prev => [...prev, newToast]);
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showSuccess = (message, options = {}) => {
    return addToast(message, 'success', options);
  };

  const showError = (message, options = {}) => {
    return addToast(message, 'error', options);
  };

  const showInfo = (message, options = {}) => {
    return addToast(message, 'info', options);
  };

  const showUndoable = (message, onUndo, options = {}) => {
    return addToast(message, 'info', {
      ...options,
      duration: 0, // Don't auto-close undoable toasts
      onUndo
    });
  };

  const value = {
    showSuccess,
    showError,
    showInfo,
    showUndoable,
    removeToast
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <ToastNotification
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration || 3000}
            onClose={() => removeToast(toast.id)}
            onUndo={toast.onUndo}
            undoLabel={toast.undoLabel || 'Undo'}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};