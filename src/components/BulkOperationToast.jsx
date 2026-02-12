import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader, AlertCircle, Undo2 } from 'lucide-react';

const BulkOperationToast = ({
  message,
  type = 'success',
  isVisible = false,
  duration = 5000,
  onUndo,
  onClose,
  progress = 0,
  showUndo = false
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [displayProgress, setDisplayProgress] = useState(0);

  // Handle progress animation
  useEffect(() => {
    if (progress > 0 && progress < 100) {
      const interval = setInterval(() => {
        setDisplayProgress(prev => {
          if (prev >= progress) {
            clearInterval(interval);
            return progress;
          }
          return prev + 1;
        });
      }, 50);
      return () => clearInterval(interval);
    } else {
      setDisplayProgress(progress);
    }
  }, [progress]);

  // Auto-hide after duration
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      if (onClose) {
        onClose();
      }
    }, 300); // Match the animation duration
  };

  const handleUndo = () => {
    if (onUndo) {
      onUndo();
    }
    handleClose();
  };

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'info':
      case 'progress':
        return <Loader className={`w-5 h-5 text-blue-500 ${type === 'progress' ? 'animate-spin' : ''}`} />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
      case 'progress':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-green-50 border-green-200';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
      case 'progress':
        return 'text-blue-800';
      default:
        return 'text-green-800';
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 transform ${
      isClosing ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
    }`}>
      <div className={`${getBgColor()} border rounded-lg shadow-lg p-4 max-w-md w-full`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          
          <div className="ml-3 flex-1">
            <p className={`text-sm font-medium ${getTextColor()}`}>
              {message}
            </p>
            
            {/* Progress bar for progress type */}
            {type === 'progress' && progress > 0 && progress < 100 && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${displayProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {displayProgress}% complete
                </p>
              </div>
            )}
            
            {/* Undo button */}
            {showUndo && (
              <button
                onClick={handleUndo}
                className="mt-2 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                <Undo2 className="w-4 h-4 mr-1" />
                Undo
              </button>
            )}
          </div>
          
          <button
            onClick={handleClose}
            className={`ml-4 flex-shrink-0 ${getTextColor()} hover:opacity-75 transition-opacity`}
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// Toast manager for managing multiple toasts
export const ToastManager = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = Date.now();
    const newToast = { id, ...toast };
    setToasts(prev => [...prev, newToast]);
    
    // Auto-remove if duration is set
    if (toast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration);
    }
    
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const updateToast = (id, updates) => {
    setToasts(prev => 
      prev.map(toast => 
        toast.id === id ? { ...toast, ...updates } : toast
      )
    );
  };

  return {
    addToast,
    removeToast,
    updateToast,
    toasts,
    ToastComponent: ({ toast }) => (
      <BulkOperationToast
        key={toast.id}
        message={toast.message}
        type={toast.type}
        isVisible={true}
        duration={toast.duration}
        onUndo={toast.onUndo}
        onClose={() => removeToast(toast.id)}
        progress={toast.progress}
        showUndo={toast.showUndo}
      />
    )
  };
};

export default BulkOperationToast;