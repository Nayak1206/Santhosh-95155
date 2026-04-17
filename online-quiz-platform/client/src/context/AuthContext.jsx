import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authApi from '../api/authApi';
import axiosInstance from '../api/axiosInstance';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set the token state and update axios global header
  const updateToken = (newToken) => {
    setToken(newToken);
    if (newToken) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    } else {
      delete axiosInstance.defaults.headers.common['Authorization'];
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Try to refresh on initial load (handles page refresh)
        const res = await axiosInstance.post('/auth/refresh');
        const { token: newToken } = res.data;
        updateToken(newToken);
        
        // Fetch user info
        const userRes = await authApi.getMe();
        setUser(userRes.data);
      } catch (error) {
        console.warn('Authentication failed or no session found');
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (credentials) => {
    const res = await authApi.login(credentials);
    const { user: userData, token: newToken } = res.data;
    updateToken(newToken);
    setUser(userData);
    return userData;
  };

  const register = async (userData) => {
    const res = await authApi.register(userData);
    const { user: newUser, token: newToken } = res.data;
    updateToken(newToken);
    setUser(newUser);
    return newUser;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    updateToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, setUser, updateToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
