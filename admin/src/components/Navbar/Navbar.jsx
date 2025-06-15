import React, { useEffect, useState } from 'react';
import './Navbar.css';
import { assets } from '../../assets/assets';
import { NavLink, useLocation } from 'react-router-dom';
import "https://kit.fontawesome.com/ef73f50f34.js"


const Navbar = () => {
  const location = useLocation();
  const isProfileActive = location.pathname === '/profile';
  const [pageTitle, setPageTitle] = useState('');

  // Get current page name from path with animation
  useEffect(() => {
    let title = '';
    switch(location.pathname) {
      case '/profile':
        title = '';
        break;
      case '/orders':
        title = 'Pedidos';
        break;
      case '/list':
        title = 'Menú';
        break;
      case '/add':
        title='Agregar';
        break;
      default:
        title = 'Inicio';
    }
    
    // Reset for animation
    setPageTitle('');
    setTimeout(() => setPageTitle(title), 10);
  }, [location.pathname]);

  return (
    <div className='navbar'>
      <img className='logo' src={assets.fasty_logo} alt='Fasty Logo' />
      
      <div className="page-title-container">
        {pageTitle && (
          <h2 className="page-title">
            {pageTitle}
          </h2>
        )}
      </div>

      <NavLink to="/profile">
        <button className={`action-button ${isProfileActive ? 'active' : ''}`}>
          <i className="fa-regular fa-user"></i>
          {isProfileActive && (
            <span className='button-text'>Perfil de cafeteria</span>
          )}
        </button>
      </NavLink>
    </div>
  );
};

export default Navbar;