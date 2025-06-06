import React, { useContext } from 'react'
import './FoodDisplay.css'
import { StoreContext } from '../../context/StoreContext'
import FoodItem from '../FoodItem/FoodItem'

const FoodDisplay = ({ cafeteriaId }) => {
  const { food_list } = useContext(StoreContext)

  return (
    <div className='food-display' id='food-display'>
      <h2>Menú del Cafetín</h2>
      <div className='food-display-list'>
        {food_list
          .filter(item => cafeteriaId === "All" || item.cafeteria_id === cafeteriaId)
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
  )
}

export default FoodDisplay
