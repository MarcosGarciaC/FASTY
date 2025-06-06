import React, { useState } from 'react';
import './Home.css';
import Header from '../../components/Header/Header';
import ExploreBuss from '../../components/ExploreBuss/ExploreBuss';
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay';

const Home = () => {
  // Usamos "All" como valor por defecto para mostrar todos los productos inicialmente
  const [cafeteriaId, setCafeteriaId] = useState("All");

  return (
    <div>
      <Header />
      <ExploreBuss cafeteriaId={cafeteriaId} setCafeteriaId={setCafeteriaId} />
      <FoodDisplay cafeteriaId={cafeteriaId} />
    </div>
  );
};

export default Home;
