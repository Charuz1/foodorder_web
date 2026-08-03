import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      fetchProfile();
    } else {
      localStorage.removeItem('token');
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        logout();
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      setToken(data.token);
      setUser(data.user);
      showNotification(`Welcome back, ${data.user.name}!`);
      return { success: true };
    } catch (err) {
      showNotification(err.message, 'error');
      return { success: false, error: err.message };
    }
  };

  const register = async (name, email, password, phone, address, role) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone, address, role })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      setToken(data.token);
      setUser(data.user);
      showNotification(`Account created successfully! Welcome, ${data.user.name}.`);
      return { success: true };
    } catch (err) {
      showNotification(err.message, 'error');
      return { success: false, error: err.message };
    }
  };

  const updateProfile = async (name, phone, address) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, phone, address })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Update failed');
      }
      setUser(data);
      showNotification('Profile updated successfully!');
      return { success: true };
    } catch (err) {
      showNotification(err.message, 'error');
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
    showNotification('Logged out successfully.');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, updateProfile, logout, notification, showNotification }}>
      {children}
    </AuthContext.Provider>
  );
};
