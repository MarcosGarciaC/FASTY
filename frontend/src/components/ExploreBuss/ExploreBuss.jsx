import React, { useContext } from 'react';
import './ExploreBuss.css';
import { StoreContext } from '../../context/StoreContext';

const ExploreBuss = ({ cafeteriaId, setCafeteriaId }) => {
  const { cafetinList, url, orderItems, clearCart } = useContext(StoreContext);

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

  return (
    <div className='explore-buss' id='explore-buss'>
      <h1>{cafeteriaId === "All" ? "Explora las distintas cafeterías" : "Cafetería seleccionada"}</h1>
      <div className="explore-buss__list">
        {filteredCafetinList.map((item, index) => (
          <div
            onClick={() => handleCafeteriaClick(item._id)}
            key={index}
            className='explore-buss-list__items'
          >
            <img
              className={cafeteriaId === item._id ? "active" : ""}
              src={`${url}/images/cafetins/${item.logo}`}
              alt=""
            />
            <p>{item.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExploreBuss;