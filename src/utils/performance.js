// Debounce function to limit how often a function can be called
export const debounce = (func, wait, immediate = false) => {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
};

// Throttle function to limit how often a function can be called
export const throttle = (func, limit) => {
  let inThrottle;
  
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Memoization utility for expensive function calls
export const memoize = (func, resolver) => {
  const cache = new Map();
  
  return function memoizedFunction(...args) {
    const key = resolver ? resolver(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = func.apply(this, args);
    cache.set(key, result);
    return result;
  };
};

// Virtualization utility for large lists
export const useVirtualization = (items, itemHeight, containerHeight) => {
  const startIndex = Math.max(0, Math.floor(0));
  const endIndex = Math.min(items.length, Math.ceil(containerHeight / itemHeight) + startIndex);
  
  return {
    visibleItems: items.slice(startIndex, endIndex),
    startIndex,
    endIndex,
    totalHeight: items.length * itemHeight
  };
};

// Batch updates for React state
export const batchUpdates = (updates, setState) => {
  setState(prevState => {
    const newState = { ...prevState };
    updates.forEach(update => {
      newState = { ...newState, ...update };
    });
    return newState;
  });
};

// Lazy loading utility for images and components
export const useLazyLoad = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold }
    );
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold]);
  
  return { ref, isVisible };
};

// Prefetch utility for data
export const prefetchData = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      ...options
    });
    return response.ok;
  } catch (error) {
    console.error('Prefetch failed:', error);
    return false;
  }
};

// Cache utility for API responses
export class ResponseCache {
  constructor(maxSize = 100, ttl = 5 * 60 * 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }
  
  set(key, value) {
    // Remove oldest item if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }
  
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    // Check if item has expired
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }
  
  has(key) {
    return this.get(key) !== null;
  }
  
  delete(key) {
    this.cache.delete(key);
  }
  
  clear() {
    this.cache.clear();
  }
  
  size() {
    return this.cache.size;
  }
}

// Create a singleton cache instance
export const responseCache = new ResponseCache();

// Optimized bulk operations
export const createOptimizedBulkOperation = (items, batchSize = 10) => {
  return async (operationFn) => {
    const results = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(item => operationFn(item))
      );
      results.push(...batchResults);
      
      // Yield to the event loop to prevent blocking
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    
    return results;
  };
};

// Optimized search with debouncing and caching
export const createOptimizedSearch = (searchFn, debounceTime = 300) => {
  const debouncedSearch = debounce(searchFn, debounceTime);
  const cache = new Map();
  
  return async (query) => {
    // Check cache first
    if (cache.has(query)) {
      return cache.get(query);
    }
    
    // Perform search
    const results = await debouncedSearch(query);
    
    // Cache results
    cache.set(query, results);
    
    // Limit cache size
    if (cache.size > 50) {
      const oldestKey = cache.keys().next().value;
      cache.delete(oldestKey);
    }
    
    return results;
  };
};

// Performance monitoring utility
export const performanceMonitor = {
  marks: new Map(),
  
  start(label) {
    this.marks.set(label, performance.now());
  },
  
  end(label) {
    const start = this.marks.get(label);
    if (start) {
      const duration = performance.now() - start;
      this.marks.delete(label);
      console.log(`${label} took ${duration.toFixed(2)}ms`);
      return duration;
    }
    return null;
  },
  
  measure(label, startLabel, endLabel) {
    const start = this.marks.get(startLabel);
    const end = this.marks.get(endLabel);
    
    if (start && end) {
      const duration = end - start;
      console.log(`${label} took ${duration.toFixed(2)}ms`);
      return duration;
    }
    return null;
  }
};

// Memory usage monitoring
export const memoryMonitor = {
  check() {
    if ('memory' in performance) {
      const memory = performance.memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        usedPercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      };
    }
    return null;
  },
  
  warnThreshold: 0.8, // 80%
  
  checkAndWarn() {
    const memory = this.check();
    if (memory && memory.usedPercentage > this.warnThreshold * 100) {
      console.warn(`Memory usage is high: ${memory.usedPercentage.toFixed(2)}%`);
    }
    return memory;
  }
};