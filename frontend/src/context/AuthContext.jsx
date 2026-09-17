import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/axiosClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('cybertrace_token') || null);
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('cybertrace_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleSessionExpired = () => {
      setToken(null);
      setUser(null);
    };
    window.addEventListener('cybertrace:session_expired', handleSessionExpired);
    return () => {
      window.removeEventListener('cybertrace:session_expired', handleSessionExpired);
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { token: receivedToken, user: receivedUser } = response.data;
      localStorage.setItem('cybertrace_token', receivedToken);
      localStorage.setItem('cybertrace_user', JSON.stringify(receivedUser));
      setToken(receivedToken);
      setUser(receivedUser);
      return { success: true, user: receivedUser };
    } catch (err) {
      const msg = err.response?.data?.message || 'Authentication failed. Please check your credentials.';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('cybertrace_token');
    localStorage.removeItem('cybertrace_user');
    setToken(null);
    setUser(null);
    setError(null);
  };

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'ADMIN',
    isInvestigator: user?.role === 'INVESTIGATOR',
    login,
    logout,
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
