import { createContext, useContext, useState, useEffect } from 'react';
import api, { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, check if a stored token is still valid
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        setUser(response.data.data);
      } catch {
        // Token is invalid or expired — clear it
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      console.log('Login response:', response.data);
      const { token, data } = response.data;
      
      if (!token || !data) {
        throw new Error('Invalid response format: missing token or user data');
      }
      
      localStorage.setItem('token', token);
      setUser(data);
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    const response = await authAPI.register(userData);
    return response.data;
  };

  const updateProfile = async (profileData) => {
    const response = await authAPI.updateProfile(profileData);
    setUser(response.data.data);
    return response.data.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    updateProfile,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;