import React, { useContext, useEffect, useState } from 'react';
import './Order.css';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';

const Order = () => {
  const { url } = useContext(StoreContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Obtener user_id desde localStorage
  const user_id = localStorage.getItem('user_id');

  const fetchUserOrders = async () => {
    try {
      const response = await axios.post(`${url}/api/order/user`, { user_id });
      if (response.data.success) {
        setOrders(response.data.data);
      } else {
        setError('No se pudieron obtener las órdenes');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user_id) {
      fetchUserOrders();
    }
  }, [user_id]);

  if (!user_id) {
    return (
      <div className="order-container">
        <p>Por favor, inicia sesión para ver tus órdenes.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="order-container">
        <p>Cargando órdenes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-container">
        <p>{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="order-container">
        <p>No tienes órdenes registradas.</p>
      </div>
    );
  }

  return (
    <div className="order-container">
      <h2>Tus Órdenes</h2>
      <div className="order-list">
        {orders.map((order) => (
          <div key={order._id} className="order-card">
            <h3>Orden #{order.confirmation_code}</h3>
            <p><strong>Cafetería:</strong> {order.cafeteria_id?.name || 'Desconocida'}</p>
            <p><strong>Estado:</strong> {order.status}</p>
            <p><strong>Total:</strong> ${order.total_amount.toFixed(2)}</p>
            <div className="order-items">
              <h4>Items:</h4>
              <ul>
                {order.items.map((item, index) => (
                  <li key={index}>
                    {item.food_id?.name || 'Item desconocido'} (x{item.quantity}) - $
                    {(item.food_id?.price * item.quantity).toFixed(2)}
                  </li>
                ))}
              </ul>
            </div>
            {order.feedback && (
              <p><strong>Feedback:</strong> {order.feedback}</p>
            )}
            <p><strong>Código de Confirmación:</strong> {order.confirmation_code}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Order;