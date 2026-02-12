import React, { useState, useRef, useEffect } from 'react';

const Tooltip = ({ children, content, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef(null);

  const handleMouseEnter = () => {
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  // Position classes for tooltip
  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <div 
          ref={tooltipRef}
          className={`${positionClasses[position]} absolute z-10 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm whitespace-nowrap pointer-events-none transition-opacity duration-150`}
        >
          {content}
          <div className={`absolute w-2 h-2 bg-gray-900 rotate-45 ${position === 'top' ? 'bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2' : 
            position === 'bottom' ? 'top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2' : 
            position === 'left' ? 'right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2' : 
            'left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2'}`}></div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;