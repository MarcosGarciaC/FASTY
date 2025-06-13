import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../../Context/AuthContext';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/user/login`, {
        email,
        password
      });

      if (response.data.success) {
        const user = response.data.user;
        
        // Validar que el usuario tenga rol de admin o cafeteria_owner
        if (user.role === 'admin' || user.role === 'cafeteria_owner') {
          login(response.data.token, user);
          
          if (rememberMe) {
            localStorage.setItem('rememberMe', 'true');
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(user));
          }
          
          navigate('/dashboard');
          toast.success(`Bienvenido ${user.full_name || ''}`);
        } else {
          toast.error('Acceso restringido: Solo para administradores y dueños de cafetería');
        }
      } else {
        toast.error(response.data.message || 'Credenciales incorrectas');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al iniciar sesión');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Iniciar Sesión</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="admin@example.com"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="••••••••"
              required
            />
          </div>
          
          <div className="form-options">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Recordarme</span>
            </label>
          </div>
          
          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Cargando...' : 'Ingresar'}
          </button>
          
          <div className="register-link">
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;