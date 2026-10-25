import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Check current session from HttpOnly cookie on application boot
  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/me');
      if (response.data?.user) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
      setAuthError(null);
    } catch (err) {
      // 401 simply means not logged in
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Login handler
  const login = async (email, password) => {
    try {
      setAuthError(null);
      const response = await api.post('/auth/login', { email, password });
      if (response.data?.user) {
        setUser(response.data.user);
        return { success: true, user: response.data.user };
      }
      throw new Error('Invalid response from server');
    } catch (err) {
      const msg = err.message || 'Login failed. Please check your credentials.';
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  // Register handler
  const register = async (userData) => {
    try {
      setAuthError(null);
      const response = await api.post('/auth/register', userData);
      if (response.data?.user) {
        setUser(response.data.user);
        return { success: true, user: response.data.user };
      }
      throw new Error('Invalid response from server');
    } catch (err) {
      const msg = err.message || 'Registration failed. Please check the entered details.';
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('Logout API notice:', err.message);
    } finally {
      setUser(null);
      setAuthError(null);
    }
  };

  const value = {
    user,
    loading,
    authError,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    checkAuthStatus
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
