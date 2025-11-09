import apiClient from './client';

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

/**
 * Register a new user account
 */
export const registerUser = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await apiClient.post('/api/v1/auth/register', data);
  return response.data;
};

/**
 * Login with email and password
 */
export const loginUser = async (data: LoginData): Promise<AuthResponse> => {
  const response = await apiClient.post('/api/v1/auth/login', data);
  return response.data;
};

/**
 * Logout current user
 */
export const logoutUser = async (): Promise<void> => {
  await apiClient.post('/api/v1/auth/logout');
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get('/api/v1/auth/me');
  return response.data.user;
};

/**
 * Refresh access token
 */
export const refreshToken = async (): Promise<{ accessToken: string }> => {
  const response = await apiClient.post('/api/v1/auth/refresh');
  return response.data;
};

