import apiClient from './client';
import { hashPassword } from '../utils/crypto';

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
 * Password is hashed client-side before transmission
 */
export const registerUser = async (data: RegisterData): Promise<AuthResponse> => {
  // Hash password client-side before sending
  const hashedPassword = await hashPassword(data.password);
  
  const response = await apiClient.post('/api/v1/auth/register', {
    ...data,
    passwordHash: hashedPassword,
    password: undefined, // Remove plain text password
  });
  return response.data;
};

/**
 * Login with email and password
 * Password is hashed client-side before transmission
 */
export const loginUser = async (data: LoginData): Promise<AuthResponse> => {
  // Hash password client-side before sending
  const hashedPassword = await hashPassword(data.password);
  
  const response = await apiClient.post('/api/v1/auth/login', {
    email: data.email,
    passwordHash: hashedPassword,
  });
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

