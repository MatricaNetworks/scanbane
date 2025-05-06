import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL for the API - replace with your actual server URL
// For development with Expo Go, you'll need to use the actual IP address
// instead of localhost when testing on real devices
const API_URL = 'http://localhost:5000/api';

// Create an axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies/sessions
});

// Request interceptor to handle auth
apiClient.interceptors.request.use(
  async (config) => {
    // You can add auth token logic here if needed in the future
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle specific error cases
    if (error.response) {
      // Handle 401 Unauthorized
      if (error.response.status === 401 && !originalRequest._retry) {
        // If session expired, you might want to clear local storage and redirect to login
        try {
          await AsyncStorage.removeItem('user');
        } catch (e) {
          console.error('Error clearing user data', e);
        }
      }
      
      // Get detailed error message if available
      const errorMessage = 
        error.response.data?.message || 
        error.response.data?.error || 
        'An unexpected error occurred';
      
      return Promise.reject(new Error(errorMessage));
    }
    
    // Network errors
    if (error.request) {
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }
    
    // Other errors
    return Promise.reject(error);
  }
);

export default apiClient;