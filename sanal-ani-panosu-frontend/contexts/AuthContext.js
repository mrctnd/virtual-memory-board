'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status
  const checkAuth = () => {
    const token = Cookies.get('jwt');
    const userId = localStorage.getItem('userId');
    
    if (token) {
      setIsAuthenticated(true);
      // Optionally fetch user data here if needed
      if (userId) {
        setUser({ id: userId });
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
    setLoading(false);
  };

  // Login function
  const login = (token, userData) => {
    Cookies.set('jwt', token);
    if (userData && userData.id) {
      localStorage.setItem('userId', userData.id);
      setUser(userData);
    }
    setIsAuthenticated(true);
  };

  // Logout function
  const logout = () => {
    Cookies.remove('jwt');
    localStorage.removeItem('userId');
    setIsAuthenticated(false);
    setUser(null);
  };

  // Check auth status on mount and when storage changes
  useEffect(() => {
    checkAuth();

    // Listen for storage changes (like logout in another tab)
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Set up an interval to check periodically (for token expiration)
    const interval = setInterval(checkAuth, 60000); // Check every minute
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
