import React, { useEffect, useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { StoreContext } from '../../context/StoreContext';
import './VerifyEmal.css';

const VerifyEmail = () => {
  const { url } = useContext(StoreContext);
  const [message, setMessage] = useState('Verificando tu cuenta...');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const verify = async () => {
      const query = new URLSearchParams(location.search);
      const token = query.get('token');
      const email = query.get('email');

      if (!token || !email) {
        setMessage('Enlace inválido.');
        return;
      }

      try {
        const response = await axios.get(`${url}/api/user/verify-email`, {
          params: { token, email }
        });

        if (response.data.success) {
          setMessage(response.data.message);
          setTimeout(() => navigate('/'), 3000); // Redirige a la página principal después de 3 segundos
        } else {
          setMessage(response.data.message);
        }
      } catch (error) {
        console.error('Error de verificación:', error);
        setMessage('Error al verificar la cuenta.');
      }
    };

    verify();
  }, [url, location.search, navigate]);

  return (
    <div className="verify-email-container">
      <h2>Verificación de Cuenta</h2>
      <p>{message}</p>
      {message.includes('exitosamente') && (
        <button onClick={() => navigate('/')}>Volver a la página principal</button>
      )}
    </div>
  );
};

export default VerifyEmail;