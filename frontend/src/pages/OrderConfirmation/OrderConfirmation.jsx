import React from 'react';
import './OrderConfirmation.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const OrderConfirmation = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const order = state?.order;

  if (!order) {
    return (
      <div className="order-confirmation-container">
        <p>No se encontraron detalles de la orden. Por favor, intenta de nuevo.</p>
        <button className="confirmation-button" onClick={() => navigate('/')}>
          Volver al Inicio
        </button>
      </div>
    );
  }
  const [timeLeft, setTimeLeft] = useState('');
useEffect(() => {
  if (!order?.pickup_time) return;

  const interval = setInterval(() => {
    const now = new Date();
    const pickup = new Date(order.pickup_time);
    const diff = pickup - now;

    if (diff <= 0) {
      setTimeLeft('¡Es hora de recoger tu orden!');
      clearInterval(interval);
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
  }, 1000);

  return () => clearInterval(interval);
}, [order?.pickup_time]);

  

  return (
    <div className="order-confirmation-container">
      <h2>¡Orden Confirmada!</h2>
      <div className="confirmation-code">
        <h3>Código de Confirmación: <span>{order.confirmation_code}</span></h3>
      </div>
      <div className="order-details">
        <p><strong>Cafetería:</strong> {order.cafeteria_id?.name || 'Desconocida'}</p>
        <p><strong>Estado:</strong> <span className={`order-status ${order.status}`}>{order.status}</span></p>
        <p><strong>Total:</strong> ${order.total_amount.toFixed(2)}</p>
        <p><strong>Hora de Recogida:</strong> {new Date(order.pickup_time).toLocaleString()}</p>
        <p><strong>Tiempo restante:</strong> {timeLeft}</p>
        <p><strong>Método de Pago:</strong> {order.payment_method}</p>
        {order.feedback && <p><strong>Feedback:</strong> {order.feedback}</p>}
        {order.rating > 0 && <p><strong>Calificación:</strong> {order.rating} / 5</p>}
        <div className="order-items">
          <h4>Items:</h4>
          <ul>
            {order.items.map((item, index) => (
              <li key={index}>
                <span>{item.food_id?.name || 'Item desconocido'} (x{item.quantity})</span>
                <span>${(item.food_id?.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="confirmation-actions">
        <button className="confirmation-button" onClick={() => navigate('/orders')}>
          Ver Mis Órdenes
        </button>
        <button className="confirmation-button secondary" onClick={() => navigate('/')}>
          Volver al Inicio
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmation;