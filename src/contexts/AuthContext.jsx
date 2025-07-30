import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);

  const checkAuthStatus = async () => {
    // Prevent multiple simultaneous auth checks
    if (isCheckingAuth) return;

    setIsCheckingAuth(true);
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await authApi.getProfile(); // This should call /users/me
        setUser(response.data);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // CRITICAL FIX: Only remove token for actual authentication errors
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } finally {
      setIsCheckingAuth(false);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        // Set authenticated state immediately based on token presence
        // This prevents login prompts while we verify the token
        setIsAuthenticated(true);
        setLoading(false);

        // Verify token in background without blocking UI
        try {
          const response = await authApi.getProfile(); // This should call /users/me
          setUser(response.data);
          setIsAuthenticated(true);
        } catch (error) {
          // Only remove token for 401 (unauthorized)
          if (error.response?.status === 401) {
            localStorage.removeItem('token');
            setUser(null);
            setIsAuthenticated(false);
          }
          // For other errors, keep the optimistic state
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for storage changes to sync auth state across tabs
    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        if (e.newValue) {
          setIsAuthenticated(true);
          checkAuthStatus();
        } else {
          setUser(null);
          setIsAuthenticated(false);
          setLoading(false);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []); // Empty dependency array - only run once on mount

  const login = async (email, password) => {
    try {
      const response = await authApi.login({ email, password });
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      setUser(user);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await authApi.register({ username, email, password });
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      setUser(user);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
