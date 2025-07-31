// Centralized API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8001';

// API utility function
export const api = {
  get: (endpoint: string, options: RequestInit = {}) => {
    return fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  },
  
  post: (endpoint: string, data?: any, options: RequestInit = {}) => {
    return fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  },
  
  put: (endpoint: string, data?: any, options: RequestInit = {}) => {
    return fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  },
  
  delete: (endpoint: string, options: RequestInit = {}) => {
    return fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  },
};

// Utility function to get authenticated headers
export const getAuthHeaders = (token?: string) => {
  const authToken = token || localStorage.getItem('token');
  return authToken ? { Authorization: `Bearer ${authToken}` } : {};
};

// API base URL for direct usage
export const API_URL = API_BASE_URL;