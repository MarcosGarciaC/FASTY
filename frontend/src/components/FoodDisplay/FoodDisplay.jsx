import React, { useContext, useState, useEffect } from 'react';
import './FoodDisplay.css';
import { StoreContext } from '../../context/StoreContext';
import FoodItem from '../FoodItem/FoodItem';

const FoodDisplay = ({ cafeteriaId }) => {
  const { food_list } = useContext(StoreContext);
  const [selectedCategories, setSelectedCategories] = useState(['Menú']);

  // Set "Menú" as default when cafeteriaId changes
  useEffect(() => {
    if (cafeteriaId !== "All") {
      setSelectedCategories(['Menú']);
    }
  }, [cafeteriaId]);

  // If no cafeteria is selected, render nothing
  if (cafeteriaId === "All") {
    return (
      <div className='food-display' id='food-display'>
        <p>SELECCIONA UNA CAFETERIA PARA VER SU MENÚ.</p>
      </div>
    );
  }

  // Get unique categories for the selected cafeteria, excluding "Menú" for desktop
  const desktopCategories = [...new Set(
    food_list
      .filter(item => item.cafeteria_id === cafeteriaId)
      .map(item => item.category || 'Uncategorized')
  )].sort();

  // Handle category filter changes
  const handleCategoryChange = (category) => {
    if (category === 'Menú') {
      setSelectedCategories(['Menú']); // Select only "Menú", deselect others
    } else {
      setSelectedCategories(prev => {
        const newSelection = prev.includes(category)
          ? prev.filter(cat => cat !== category && cat !== 'Menú')
          : [...prev.filter(cat => cat !== 'Menú'), category];
        return newSelection.length === 0 ? ['Menú'] : newSelection;
      });
    }
  };

  // Group food items by category, filtered by selected categories
  const filteredFoodList = food_list.filter(item => 
    item.cafeteria_id === cafeteriaId && 
    (selectedCategories.includes('Menú') || selectedCategories.includes(item.category || 'Uncategorized'))
  );

  const foodByCategory = filteredFoodList.reduce((acc, item) => {
    const category = item.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  return (
    <div className='food-display' id='food-display'>
      <div className='food-display-container'>
        <div className='food-display-filter'>
          <h3>Filtros por Categoría</h3>
          {desktopCategories.length > 0 ? (
            desktopCategories.map((category, index) => (
              <label key={index} className='filter-checkbox desktop-only'>
                <input
                  type='checkbox'
                  checked={selectedCategories.includes(category)}
                  onChange={() => handleCategoryChange(category)}
                />
                <span>{category}</span>
              </label>
            ))
          ) : (
            <p>No hay categorías disponibles.</p>
          )}
          <div className='food-display-filter-mobile mobile-only'>
            {desktopCategories.length > 0 ? (
              <>
                <span
                  className={`filter-menu ${selectedCategories.includes('Menú') ? 'selected' : ''}`}
                  onClick={() => handleCategoryChange('Menú')}
                >
                  Menú
                </span>
                <span className='filter-separator'>|</span>
                {desktopCategories.map((category, index) => (
                  <span
                    key={index}
                    className={`filter-item ${selectedCategories.includes(category) ? 'selected' : ''}`}
                    onClick={() => handleCategoryChange(category)}
                  >
                    {category}
                  </span>
                ))}
              </>
            ) : (
              <p>No hay categorías disponibles.</p>
            )}
          </div>
        </div>
        <div className='food-display-content'>
          <h2>Menú del Cafetín</h2>
          {Object.keys(foodByCategory).length === 0 ? (
            <p>No hay elementos disponibles en este cafetín.</p>
          ) : (
            Object.keys(foodByCategory).sort().map((category, index) => (
              <div key={index} className='food-display-category'>
                <h3 className='food-display-category-title'>{category}</h3>
                <div className='food-display-list'>
                  {foodByCategory[category].map((item, itemIndex) => (
                    <FoodItem
                      key={itemIndex}
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
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodDisplay;