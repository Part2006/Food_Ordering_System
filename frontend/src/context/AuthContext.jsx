import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

// Default API URL (assuming proxy or environment variable)
const API_URL = 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Configure axios authorization header on token change
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
      fetchProfile();
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/auth/profile`);
      setUser(res.data);
    } catch (err) {
      console.error('Failed to load profile:', err.response?.data?.message || err.message);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      setToken(res.data.token);
      setUser(res.data);
      return { success: true, role: res.data.role };
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.message || 'Login failed. Please check credentials.' 
      };
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const res = await axios.post(`${API_URL}/auth/register`, { name, email, password, role });
      setToken(res.data.token);
      setUser(res.data);
      return { success: true, role: res.data.role };
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed.' 
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await axios.put(`${API_URL}/auth/profile`, profileData);
      setUser(res.data);
      if (res.data.token) {
        setToken(res.data.token);
      }
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to update profile'
      };
    }
  };

  const addAddress = async (newAddress) => {
    if (!user) return { success: false, message: 'Not logged in' };
    try {
      const updatedAddresses = [...user.addresses, newAddress];
      return await updateProfile({ addresses: updatedAddresses });
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const deleteAddress = async (addressId) => {
    if (!user) return { success: false, message: 'Not logged in' };
    try {
      const updatedAddresses = user.addresses.filter(addr => addr._id !== addressId);
      return await updateProfile({ addresses: updatedAddresses });
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      logout,
      updateProfile,
      addAddress,
      deleteAddress,
      isAuthenticated: !!user,
      isCustomer: user?.role === 'customer',
      isRestaurantAdmin: user?.role === 'restaurant',
      isSuperAdmin: user?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
};
