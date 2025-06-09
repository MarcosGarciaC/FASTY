import React, { useContext } from 'react';
import './FoodDisplay.css';
import { StoreContext } from '../../context/StoreContext';
import FoodItem from '../FoodItem/FoodItem';

const FoodDisplay = ({ cafeteriaId }) => {
  const { food_list } = useContext(StoreContext);

  // If no cafeteria is selected, render nothing
if (cafeteriaId === "All") {
  return (
    <div className='food-display' id='food-display'>
      <p>SELECCIONA UNA CAFETERIA PARA VER SU MENÚ.</p>
    </div>
  );
}

  return (
    <div className='food-display' id='food-display'>
      <h2>Menú del Cafetín</h2>
      <div className='food-display-list'>
        {food_list
          .filter(item => item.cafeteria_id === cafeteriaId)
          .map((item, index) => (
            <FoodItem
              key={index}
              id={item._id}
              name={item.name}
              description={item.description}
              price={item.price}
              image={item.image}
              rating={item.rating}
              cafeteria_id={item.cafeteria_id}
            />
          ))}
      </div>
    </div>
  );
};

export default FoodDisplay;