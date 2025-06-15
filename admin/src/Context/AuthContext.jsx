import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    user: null,
    token: null
  });

  // Verificar autenticación al cargar
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user_id = localStorage.getItem('user_id');

    if (token && user_id) {
      validateToken(token);
    }
  }, []);

  const validateToken = async (token) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/user/validate` , {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success && 
          (response.data.user.role === 'admin' || response.data.user.role === 'cafeteria_owner')) {
        setAuth({
          isAuthenticated: true,
          user: response.data.user,
          token
        });
      } else {
        logout();
      }
    } catch (error) {
      logout();
    }
  };

  const login = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user_id', user._id);
    setAuth({
      isAuthenticated: true,
      user,
      token
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    setAuth({
      isAuthenticated: false,
      user: null,
      token: null
    });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};