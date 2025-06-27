import React, { useContext } from 'react';
import './FoodItem.css';
import "https://kit.fontawesome.com/ce8be9cf0b.js";
import { StoreContext } from '../../context/StoreContext';

const FoodItem = ({ id, name, price, description, image, rating, cafeteria_id }) => {
  const { cartItems, addToCart, removeFromCart, url, orderItems, food_list } = useContext(StoreContext);

  const currentCafeteriaId = orderItems.length > 0 ? orderItems[0].cafeteria_id : null;
  const isOtherCafeteria = currentCafeteriaId && currentCafeteriaId !== cafeteria_id;

  const foodInfo = food_list.find(item => item._id === id);
  const isAvailable = foodInfo?.is_available;
  const remainingQty = foodInfo?.daily_quantity - (cartItems[id] || 0);

  const isDisabled = isOtherCafeteria || !isAvailable || remainingQty <= 0;

  return (
    <div className='food-item'>
      <div className='food-item-img-container'>
        {image ? (
          <img className='food-item-image' src={image} alt={name} />
        ) : (
          <p className='no-image'>No image available</p>
        )}
      </div>
      <div className="food-item-info">
        <div className="food-item-name-rating">
          <h3 className="food-item-name">{name}</h3>
          <span className="food-item-rating">⭐ {rating}</span>
        </div>
        <p className='food-item-desc'>{description}</p>
        <div className="food-item-bottom">
          <p className="food-item-price">C${price}</p>
          <div className='add_minus-icons'>
            {!cartItems[id] ? (
              <i
                className={`fa-solid fa-plus ${isDisabled ? 'disabled' : ''}`}
                onClick={() => !isDisabled && addToCart(id, cafeteria_id)}
                title={
                  !isAvailable
                    ? "Este producto no está disponible."
                    : remainingQty <= 0
                    ? "Ya alcanzaste la cantidad máxima disponible para hoy."
                    : isOtherCafeteria
                    ? "Comida no disponible."
                    : "Agregar al carrito"
                }
                style={{ cursor: isDisabled ? 'not-allowed' : 'pointer', opacity: isDisabled ? 0.5 : 1 }}
              ></i>
            ) : (
              <div className='food-item-counter'>
                <i className="fa-solid fa-minus" onClick={() => removeFromCart(id)}></i>
                <p className='item-count'>{cartItems[id]}</p>
                <i
                  className={`fa-solid fa-plus ${isDisabled ? 'disabled' : ''}`}
                  onClick={() => !isDisabled && addToCart(id, cafeteria_id)}
                  style={{ cursor: isDisabled ? 'not-allowed' : 'pointer', opacity: isDisabled ? 0.5 : 1 }}
                ></i>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


export default FoodItem;