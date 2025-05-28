import Cookies from 'js-cookie';
import api from './api';

// Token management
export const setToken = (token) => {
  Cookies.set('jwt', token);
};

export const getToken = () => {
  return Cookies.get('jwt');
};

export const removeToken = () => {
  Cookies.remove('jwt');
};

// Authentication functions
export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      setToken(response.data.token);
      return response.data;
    }
    return null;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Authenticate user with email and password
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<Object>} User data including token
 */
export const loginUser = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
      // Store token in cookie if present
    if (response.data && response.data.token) {
      Cookies.set('jwt', response.data.token);
      
      // Store user ID in localStorage for easy access
      if (response.data.user && response.data.user.id) {
        localStorage.setItem('userId', response.data.user.id);
      }
    }
    
    // Return the user data
    return response.data;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const logout = () => {
  removeToken();
  // Additional logout logic as needed
};

/**
 * Logs out the user by removing the JWT token and redirecting to login page
 * @param {Function} [router] - Next.js router instance for redirection
 */
export const logoutUser = (router) => {
  // Remove the JWT token cookie
  Cookies.remove('jwt');
  
  // Remove user data from localStorage
  localStorage.removeItem('userId');
  
  // Redirect to the login page
  if (router) {
    // If a Next.js router instance is provided, use it for client-side navigation
    router.push('/login');
  } else if (typeof window !== 'undefined') {
    // If no router is provided but we're in a browser environment, use window.location
    window.location.href = '/login';
  }
};

export const isAuthenticated = () => {
  return !!getToken();
}; 