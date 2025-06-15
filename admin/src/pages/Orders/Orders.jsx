import React, { useState, useEffect } from 'react';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const cafeteriaId = localStorage.getItem("cafeteria_id");

  const statusOptions = ['pending', 'completed'];

  useEffect(() => {
    let intervalId;

    const fetchOrders = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/order/cafeteria/${cafeteriaId}`);
        const data = await res.json();
        if (data.success) {
          setOrders(data.data);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    if (cafeteriaId) {
      fetchOrders();
      intervalId = setInterval(fetchOrders, 5000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [cafeteriaId]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/order/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });

      const result = await res.json();
      if (result.success) {
        setOrders(prev =>
          prev.map(order =>
            order._id === orderId ? { ...order, status: newStatus, updated: true } : order
          )
        );

        setTimeout(() => {
          setOrders(prev =>
            prev.map(order =>
              order._id === orderId ? { ...order, updated: false } : order
            )
          );
        }, 1500);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const getTimeRemaining = (pickupTime) => {
    const now = new Date();
    const pickup = new Date(pickupTime);
    const diffMs = pickup - now;

    if (diffMs <= 0) return "Time expired";

    const mins = Math.floor(diffMs / 60000);
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;

    return `${hours > 0 ? hours + "h " : ""}${remMins}min`;
  };

  if (loading) return <div className="loading">Loading orders...</div>;
  if (!cafeteriaId) return <div className="error">No cafeteria ID found</div>;

  const pendingOrders = orders
    .filter(order => order.status !== 'completed')
    .sort((a, b) => new Date(a.pickup_time) - new Date(b.pickup_time));

  const completedOrders = orders.filter(order => order.status === 'completed');

  const renderOrder = (order) => (
    <div key={order._id} className={`order-item ${order.status} ${order.updated ? 'updated' : ''}`}>
      <div className="order-header">
        <div className="order-meta">
          <span className="order-number">#{order.confirmation_code}</span>
          <span className="order-customer">{order.user_id?.name || 'Customer'}</span>
        </div>
        <div className="order-time">
          {new Date(order.pickup_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          <span className="time-remaining">{getTimeRemaining(order.pickup_time)}</span>
        </div>
      </div>

      <div className="order-details">
        <div className="order-items">
          {order.items.map((item, idx) => (
            <div key={idx} className="order-item-row">
              <span>{item.food_id?.name || 'Item'} × {item.quantity}</span>
              <span>${(item.food_id?.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="order-footer">
          <div className="order-total">Total: ${order.total_amount.toFixed(2)}</div>
          <div className="order-status">
            <select 
              value={order.status} 
              onChange={(e) => handleStatusChange(order._id, e.target.value)}
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="orders-container">
      <header className="orders-header">
        <h1>Orders</h1>
        <div className="refresh-info">Auto-refreshing every 5 seconds</div>
      </header>

      <section className="orders-section">
        <h2>Pending ({pendingOrders.length})</h2>
        {pendingOrders.length > 0 ? (
          <div className="orders-list">
            {pendingOrders.map(renderOrder)}
          </div>
        ) : (
          <div className="empty-state">No pending orders</div>
        )}
      </section>

      <section className="orders-section">
        <h2>Completed ({completedOrders.length})</h2>
        {completedOrders.length > 0 ? (
          <div className="orders-list">
            {completedOrders.map(renderOrder)}
          </div>
        ) : (
          <div className="empty-state">No completed orders</div>
        )}
      </section>
    </div>
  );
};

export default Orders;