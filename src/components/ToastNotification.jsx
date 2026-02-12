import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const ToastNotification = ({ 
  message, 
  type = 'info', 
  duration = 3000, 
  onClose,
  onUndo,
  undoLabel = 'Undo'
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
          iconColor: 'text-green-500'
        };
      case 'error':
        return {
          icon: XCircle,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          iconColor: 'text-red-500'
        };
      case 'info':
      default:
        return {
          icon: Info,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          iconColor: 'text-blue-500'
        };
    }
  };

  const config = getToastConfig();
  const Icon = config.icon;

  return (
    <div className={`fixed bottom-4 right-4 z-50 flex items-center p-4 mb-4 ${config.bgColor} ${config.borderColor} border rounded-lg shadow-lg max-w-sm`}>
      <div className="flex items-center">
        <Icon className={`flex-shrink-0 w-5 h-5 ${config.iconColor}`} />
        <div className="ml-3 text-sm font-medium ${config.textColor}">
          {message}
        </div>
      </div>
      <div className="flex items-center ml-4 space-x-2">
        {onUndo && (
          <button
            onClick={onUndo}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 focus:outline-none"
          >
            {undoLabel}
          </button>
        )}
        <button
          onClick={onClose}
          className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ToastNotification;