import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const { data } = await api.get('/user');
        setUser(data.user);
      } catch (error) {
        localStorage.removeItem('auth_token');
      } finally {
        setLoading(false);
      }
    };

    const token = localStorage.getItem('auth_token');
    token ? verifyUser() : setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const { data } = await api.post('/login', credentials);
      localStorage.setItem('auth_token', data.token);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const { data } = await api.post('/register', userData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } finally {
      localStorage.removeItem('auth_token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);