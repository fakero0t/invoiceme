import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  type User,
  type RegisterData,
  type LoginData,
} from '../shared/api/auth';

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null);
  const accessToken = ref<string | null>(null);
  const refreshToken = ref<string | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const isAuthenticated = computed(() => !!user.value && !!accessToken.value);

  /**
   * Register a new user
   */
  const register = async (data: RegisterData) => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await registerUser(data);
      user.value = response.user;
      accessToken.value = response.accessToken;
      refreshToken.value = response.refreshToken;

      // Store tokens in localStorage as backup
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);

      return response;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Registration failed';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Login with email and password
   */
  const login = async (data: LoginData) => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await loginUser(data);
      user.value = response.user;
      accessToken.value = response.accessToken;
      refreshToken.value = response.refreshToken;

      // Store tokens in localStorage as backup
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);

      return response;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Login failed';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Logout current user
   */
  const logout = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      await logoutUser();
    } catch (err: any) {
      console.error('Logout error:', err);
      // Continue with local logout even if API fails
    } finally {
      // Clear state
      user.value = null;
      accessToken.value = null;
      refreshToken.value = null;

      // Clear localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');

      isLoading.value = false;
    }
  };

  /**
   * Fetch current user profile
   */
  const fetchUser = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      const userData = await getCurrentUser();
      user.value = userData;
      return userData;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch user';
      // If user fetch fails, clear auth state
      user.value = null;
      accessToken.value = null;
      refreshToken.value = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Initialize auth state from localStorage
   */
  const initializeAuth = async () => {
    const storedAccessToken = localStorage.getItem('accessToken');
    const storedRefreshToken = localStorage.getItem('refreshToken');

    if (storedAccessToken && storedRefreshToken) {
      accessToken.value = storedAccessToken;
      refreshToken.value = storedRefreshToken;

      try {
        await fetchUser();
      } catch (err) {
        // If fetch fails, tokens are invalid
        console.error('Failed to initialize auth:', err);
      }
    }
  };

  /**
   * Clear error message
   */
  const clearError = () => {
    error.value = null;
  };

  return {
    // State
    user,
    accessToken,
    refreshToken,
    isLoading,
    error,
    // Getters
    isAuthenticated,
    // Actions
    register,
    login,
    logout,
    fetchUser,
    initializeAuth,
    clearError,
  };
});

