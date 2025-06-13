import React, { useState, useEffect } from 'react';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const cafeteriaId = localStorage.getItem("cafeteria_id");

  const statusOptions = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];

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
      fetchOrders(); // llamada inicial
      intervalId = setInterval(fetchOrders, 5000); // polling cada 5 segundos
    }

    // Limpiar el intervalo cuando se desmonte el componente
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
      } else {
        console.error("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const getTimeRemaining = (pickupTime) => {
    const now = new Date();
    const pickup = new Date(pickupTime);
    const diffMs = pickup - now;

    if (diffMs <= 0) return "Tiempo vencido";

    const mins = Math.floor(diffMs / 60000);
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;

    return `${hours > 0 ? hours + "h " : ""}${remMins}min`;
  };

  if (loading) return <div>Loading orders...</div>;
  if (!cafeteriaId) return <div>Error: No cafeteria_id found in localStorage</div>;

  const pendingOrders = orders
    .filter(order => order.status !== 'completed')
    .sort((a, b) => new Date(a.pickup_time) - new Date(b.pickup_time));

  const completedOrders = orders.filter(order => order.status === 'completed');

  const renderOrder = (order) => (
    <div key={order._id} className={`order-item ${order.updated ? 'status-updated' : ''}`}>
      <div data-label="Customer:">{order.user_id?.name || 'Unknown'}</div>

      <div className="order-items" data-label="Items:">
        {order.items.map((item, idx) => (
          <div key={idx}>
            {item.food_id?.name || 'Unknown'} × {item.quantity} (${(item.food_id?.price * item.quantity).toFixed(2)})
          </div>
        ))}
      </div>

      <div data-label="Total:">${order.total_amount.toFixed(2)}</div>

      <div data-label="Pickup Time:">
        {new Date(order.pickup_time).toLocaleString()}
        <div className="time-remaining">({getTimeRemaining(order.pickup_time)} restantes)</div>
      </div>

      <div className="order-status" data-label="Status:">
        <select value={order.status} onChange={(e) => handleStatusChange(order._id, e.target.value)}>
          {statusOptions.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      <div className="order-payment" data-label="Payment:">
        <div>{order.payment_method}</div>
        <div className={`payment-status ${order.payment_status?.toLowerCase() || "pending"}`}>
          {order.payment_status || "Pending"}
        </div>
      </div>

      <div data-label="Confirmation:">{order.confirmation_code}</div>

      <div className="order-details" data-label="Customer Feedback:">
        <h4>Customer Feedback:</h4>
        {order.feedback ? <p>{order.feedback}</p> : <p className="no-feedback">No feedback yet</p>}
      </div>
    </div>
  );

  return (
    <div className="orders-container">
      <h1>Orders</h1>

      <h2>📌 Pending Orders</h2>
      <div className="orders-header">
        <div className="header-info">Customer</div>
        <div className="header-info">Items</div>
        <div className="header-info">Total</div>
        <div className="header-info">Pickup Time</div>
        <div className="header-info">Status</div>
        <div className="header-info">Payment</div>
        <div className="header-info">Confirmation</div>
      </div>
      <div className="orders-list">
        {pendingOrders.map(renderOrder)}
      </div>

      <h2>✅ Completed Orders</h2>
      <div className="orders-header">
        <div className="header-info">Customer</div>
        <div className="header-info">Items</div>
        <div className="header-info">Total</div>
        <div className="header-info">Pickup Time</div>
        <div className="header-info">Status</div>
        <div className="header-info">Payment</div>
        <div className="header-info">Confirmation</div>
      </div>
      <div className="orders-list">
        {completedOrders.map(renderOrder)}
      </div>
    </div>
  );
};

export default Orders;