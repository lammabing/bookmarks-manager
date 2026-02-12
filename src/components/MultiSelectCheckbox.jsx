import React, { useEffect, useRef } from 'react';
import { Square, CheckSquare, MinusSquare } from 'lucide-react';

const MultiSelectCheckbox = ({
  checked = false,
  indeterminate = false,
  onChange,
  disabled = false,
  className = '',
  size = 'medium',
  ariaLabel,
  ...props
}) => {
  const checkboxRef = useRef(null);

  // Handle indeterminate state
  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6'
  };

  const baseClasses = 'transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  
  const handleClick = (e) => {
    if (!disabled && onChange) {
      onChange(!checked, e);
    }
  };

  const renderIcon = () => {
    if (indeterminate) {
      return (
        <MinusSquare 
          className={`${sizeClasses[size]} text-blue-600`} 
        />
      );
    }
    
    return checked ? (
      <CheckSquare 
        className={`${sizeClasses[size]} text-blue-600`} 
      />
    ) : (
      <Square 
        className={`${sizeClasses[size]} text-gray-400 hover:text-gray-600`} 
      />
    );
  };

  return (
    <button
      ref={checkboxRef}
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`${baseClasses} ${disabledClasses} ${className}`}
      aria-label={ariaLabel || (checked ? 'Deselect' : 'Select')}
      aria-checked={indeterminate ? 'mixed' : checked}
      {...props}
    >
      {renderIcon()}
    </button>
  );
};

export default MultiSelectCheckbox;