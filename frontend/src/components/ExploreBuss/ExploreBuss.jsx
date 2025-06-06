import React, { useContext } from 'react';
import './ExploreBuss.css';
import { StoreContext } from '../../context/StoreContext';

const ExploreBuss = ({ cafeteriaId, setCafeteriaId }) => {
  const { cafetinList, url } = useContext(StoreContext);

  return (
    <div className='explore-buss' id='explore-buss'>
      <h1>Explora las distintas cafeterías</h1>
      <div className="explore-buss__list">
        {cafetinList.map((item, index) => (
          <div
            onClick={() => setCafeteriaId(prev => prev === item._id ? "All" : item._id)}
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
