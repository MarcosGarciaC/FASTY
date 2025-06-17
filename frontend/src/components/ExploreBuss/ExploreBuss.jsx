import React, { useContext } from 'react';
import './ExploreBuss.css';
import { StoreContext } from '../../context/StoreContext';

const ExploreBuss = ({ cafeteriaId, setCafeteriaId }) => {
  const { cafetinList, orderItems, clearCart } = useContext(StoreContext);

  // Filtrar la lista de cafeterías según el cafeteriaId
  const filteredCafetinList = cafeteriaId === "All"
    ? cafetinList
    : cafetinList.filter(item => item._id === cafeteriaId);

  const handleCafeteriaClick = (itemId) => {
    if (cafeteriaId === itemId && orderItems.length > 0) {
      // If trying to deselect the current cafeteria and cart is not empty
      const confirmClear = window.confirm(
        "Tienes artículos de esta cafetería en tu carrito. Si los deseleccionas, se vaciarán. ¿Quieres continuar?"
      );
      if (confirmClear) {
        clearCart(); // Clear the cart
        setCafeteriaId("All"); // Deselect the cafeteria
      }
      // If user cancels, do nothing (keep current cafeteriaId)
    } else {
      // Toggle between selecting a new cafeteria or deselecting to "All"
      setCafeteriaId(cafeteriaId === itemId ? "All" : itemId);
    }
  };

  const selectedCafeteria = cafeteriaId !== "All" && filteredCafetinList[0];

  // Function to check if the cafeteria is open based on current time and day
  const isOpenToday = (openingHours) => {
    const now = new Date('2025-06-16T20:50:00-05:00'); // Current time: 08:50 PM CST, Monday
    const currentDay = now.toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
    const hours = openingHours[currentDay];

    if (!hours || !hours.open || !hours.close) {
      return false;
    }

    const [openHour, openMinute] = hours.open.split(':').map(Number);
    const [closeHour, closeMinute] = hours.close.split(':').map(Number);
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const openMinutes = openHour * 60 + openMinute;
    const closeMinutes = closeHour * 60 + closeMinute;
    const currentMinutes = currentHour * 60 + currentMinute;

    return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
  };

  // Function to get status for the current day
  const getDayStatus = (day, hours, isCurrentDay) => {
    if (!hours || !hours.open || !hours.close) {
      return { status: 'Cerrado', class: 'closed' };
    }
    if (isCurrentDay) {
      return isOpenToday({ [day]: hours })
        ? { status: 'Abierto', class: 'open' }
        : { status: 'Cerrado', class: 'closed' };
    }
    return { status: 'Cerrado', class: 'closed' }; // Default for non-current days (not used)
  };

  return (
    <div className='explore-buss' id='explore-buss'>
      <h1>{cafeteriaId === "All" ? "Explora las distintas cafeterías" : "Cafetería seleccionada"}</h1>
      <div className="explore-buss__container">
        <div className={`explore-buss__list ${selectedCafeteria ? 'with-details' : ''}`}>
          {filteredCafetinList.map((item, index) => (
            <div
              onClick={() => handleCafeteriaClick(item._id)}
              key={index}
              className='explore-buss-list__items'
            >
              <img
                className={cafeteriaId === item._id ? "active" : ""}
                src={item.logo}
                alt={item.name}
              />
              <p>{item.name}</p>
            </div>
          ))}
        </div>
        {selectedCafeteria && (
          <div className="explore-buss__details">
            <h2>{selectedCafeteria.name}</h2>
            <p className="explore-buss__location">
              <i className="fa-solid fa-map-marker-alt"></i> {selectedCafeteria.location || "No hay ubicación disponible."}
            </p>
            <p className="explore-buss__location">
              <i className="fa-solid fa-phone"></i> {selectedCafeteria.contact_phone || "No hay número de contacto disponible."}
            </p>
            <div className="explore-buss__hours">
              <div className="hours-list">
                {[''].map((day, index) => {
                  const isCurrentDay = day.toLowerCase() === '';
                  const { status, class: statusClass } = getDayStatus(day, selectedCafeteria.opening_hours[day], isCurrentDay);
                  return (
                    <div key={index} className={`hours-item ${statusClass}`}>
                      <span className="hours-day">{day.charAt(0).toUpperCase() + day.slice(1)}</span>
                      <span className="hours-status">
                        <span className={`status-dot ${statusClass}`}></span>
                        {status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExploreBuss;