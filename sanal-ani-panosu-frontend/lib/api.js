import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: 'http://localhost:5154/api',
  timeout: 30000, // 30 seconds default timeout
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Get the JWT token from cookies
    const token = Cookies.get('jwt');
    
    // If token exists, add it to the authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api; 