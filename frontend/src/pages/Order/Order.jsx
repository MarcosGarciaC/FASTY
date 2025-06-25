import React, { useContext, useEffect, useState } from 'react';
import './Order.css';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';

const Order = () => {
  const { url } = useContext(StoreContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Separar órdenes en pendientes y completadas
  const pendingOrders = orders.filter(order => 
    ['pending', 'confirmed', 'preparing', 'ready'].includes(order.status)
  );
  const completedOrders = orders.filter(order => 
    ['completed', 'cancelled'].includes(order.status)
  );

  return (
    <div className="order-container">
      <h2>Tus Órdenes</h2>

      {/* Sección de órdenes pendientes */}
      <div className="order-section">
        <h3 className="order-section-title">Órdenes Pendientes</h3>
        {pendingOrders.length === 0 ? (
          <p className="order-empty">No tienes órdenes pendientes.</p>
        ) : (
          <div className="order-list">
            {pendingOrders.map((order) => (
              <div key={order._id} className="order-card">
                <h3>Orden #{order.confirmation_code}</h3>
                <p><strong>Cafetería:</strong> {order.cafeteria_id?.name || 'Desconocida'}</p>
                <p>
                  <strong>Estado:</strong>{' '}
                  <span className={`order-status ${order.status}`}>
                    <i className={`fas fa-${getStatusIcon(order.status)}`}></i>
                    {order.status}
                  </span>
                </p>
                <p><strong>Total:</strong> C${order.total_amount.toFixed(2)}</p>
                <div className="order-items">
                  <h4>Items:</h4>
                  <ul>
                    {order.items.map((item, index) => (
                      <li key={index}>
                        <span>{item.food_id?.name || 'Item desconocido'} (x{item.quantity})</span>
                        <span>C${(item.food_id?.price * item.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {order.feedback && (
                  <p className="order-feedback"><strong>Descripción:</strong> {order.feedback}</p>
                )}
                <p className="order-confirmation-code">
                  <strong>Código de Confirmación:</strong> {order.confirmation_code}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sección de órdenes completadas */}
      <div className="order-section">
        <h3 className="order-section-title">Órdenes Completadas</h3>
        {completedOrders.length === 0 ? (
          <p className="order-empty">No tienes órdenes completadas.</p>
        ) : (
          <div className="order-list">
            {completedOrders.map((order) => (
              <div key={order._id} className="order-card">
                <h3>Orden #{order.confirmation_code}</h3>
                <p><strong>Cafetería :</strong> {order.cafeteria_id?.name || 'Desconocida'}</p>
                <p>
                  <strong>Estado:</strong>{' '}
                  <span className={`order-status ${order.status}`}>
                    <i className={`fas fa-${getStatusIcon(order.status)}`}></i>
                    {order.status}
                  </span>
                </p>
                <p><strong>Total:</strong> ${order.total_amount.toFixed(2)}</p>
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
                {order.feedback && (
                  <p className="order-feedback"><strong>Descripción:</strong> {order.feedback}</p>
                )}
                <p className="order-confirmation-code">
                  <strong>Código de Confirmación:</strong> {order.confirmation_code}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Función para asignar íconos según el estado
const getStatusIcon = (status) => {
  switch (status) {
    case 'pending':
      return 'clock';
    case 'confirmed':
      return 'check-circle';
    case 'preparing':
      return 'utensils';
    case 'ready':
      return 'box-open';
    case 'completed':
      return 'check-double';
    case 'cancelled':
      return 'times-circle';
    default:
      return 'info-circle';
  }
};

export default Order;