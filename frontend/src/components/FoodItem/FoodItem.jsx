import React, { useContext } from 'react';
import './FoodItem.css';
import "https://kit.fontawesome.com/ce8be9cf0b.js";
import { StoreContext } from '../../context/StoreContext';

const FoodItem = ({ id, name, price, description, image, rating, cafeteria_id }) => {
  const { cartItems, addToCart, removeFromCart, url } = useContext(StoreContext);


  return (
    <div className='food-item'>
      <div className='food-item-img-container'>
        <img className='food-item-image' src={url+"/images/"+image} alt={name} />
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
             <i className="fa-solid fa-plus" onClick={() => addToCart(id, cafeteria_id)}></i>) 
             : (
              <div className='food-item-counter'>
                <i className="fa-solid fa-minus" onClick={() => removeFromCart(id)}></i>
                <p className='item-count'>{cartItems[id]}</p>
                <i className="fa-solid fa-plus" onClick={() => addToCart(id, cafeteria_id)}></i>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodItem;