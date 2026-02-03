import axios from 'axios';

// Create axios instance for Company API (auth, users, teams)
const companyApi = axios.create({
  baseURL: process.env.REACT_APP_COMPANY_API_BASE_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create axios instance for Local Backend API (meetings, availability, booking, smtp)
const localApi = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach Authorization header
companyApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`[Company API Request] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[Company API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors and 401 redirect
companyApi.interceptors.response.use(
  (response) => {
    console.log(`[Company API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.status);
    return response;
  },
  (error) => {
    console.error('[Company API Error]', error.response?.data || error.message);
    
    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      console.log('[Company API] Unauthorized - redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/connect';
    }
    
    return Promise.reject(error);
  }
);

// Local API interceptors (for debugging)
localApi.interceptors.request.use(
  (config) => {
    console.log(`[Local API Request] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[Local API Request Error]', error);
    return Promise.reject(error);
  }
);

localApi.interceptors.response.use(
  (response) => {
    console.log(`[Local API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.status);
    return response;
  },
  (error) => {
    console.error('[Local API Error]', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ==================== AUTH API ====================

export const authApi = {
  // Login
  login: async (credentials) => {
    const response = await companyApi.post('/api/auth/login', credentials);
    console.log('[Auth] Login response:', response.data);
    return response.data;
  },

  // Signup
  signup: async (userData) => {
    const response = await companyApi.post('/api/auth/signup', userData);
    console.log('[Auth] Signup response:', response.data);
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await companyApi.post('/api/auth/logout');
    console.log('[Auth] Logout response:', response.data);
    return response.data;
  },

  // Verify session
  verify: async () => {
    const response = await companyApi.get('/api/auth/verify');
    console.log('[Auth] Verify response:', response.data);
    return response.data;
  },
};

// ==================== USERS API ====================

export const usersApi = {
  // Get current user
  getMe: async () => {
    const response = await companyApi.get('/api/users/me');
    console.log('[Users] Get me response:', response.data);
    return response.data;
  },

  // Update current user
  updateMe: async (userData) => {
    const response = await companyApi.put('/api/users/me', userData);
    console.log('[Users] Update me response:', response.data);
    return response.data;
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await companyApi.post('/api/users/me/change-password', passwordData);
    console.log('[Users] Change password response:', response.data);
    return response.data;
  },
};

// ==================== TEAMS API ====================

export const teamsApi = {
  // Create team
  create: async (teamData) => {
    const response = await companyApi.post('/api/teams', teamData);
    console.log('[Teams] Create response:', response.data);
    return response.data;
  },

  // Get my team
  getMyTeam: async () => {
    const response = await companyApi.get('/api/teams/me');
    console.log('[Teams] Get my team response:', response.data);
    return response.data;
  },

  // Get team by ID
  getById: async (teamId) => {
    const response = await companyApi.get(`/api/teams/${teamId}`);
    console.log('[Teams] Get team by ID response:', response.data);
    return response.data;
  },

  // Delete team
  delete: async (teamId) => {
    const response = await companyApi.delete(`/api/teams/${teamId}`);
    console.log('[Teams] Delete response:', response.data);
    return response.data;
  },

  // Add member to team
  addMember: async (teamId, memberData) => {
    const response = await companyApi.post(`/api/teams/${teamId}/members`, memberData);
    console.log('[Teams] Add member response:', response.data);
    return response.data;
  },
};

// Export the local API for meetings/availability/booking/smtp
export { localApi };

// Export the company API instance as default
export default companyApi;
