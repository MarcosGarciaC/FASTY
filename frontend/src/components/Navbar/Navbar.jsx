import React, { useContext, useState } from 'react'
import './Navbar.css'
import '../../index.css'
import { assets } from '../../assets/assets'
import { Link, useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';

const Navbar = ({ setShowLogin }) => {
  const [menu, setMenu] = useState("home");
  const { getTotalCartAmount, token, setToken } = useContext(StoreContext);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id"); // Agregado para mantener consistencia con Order.jsx
    setToken("");
    navigate("/");
  };

  return (
    <div className='navbar'>
      <div className='navbar-left'>
        <Link to="/">
        <img src={assets.fasty_logo} alt="" className='logo' />
        </Link>
        <ul className='navbar-menu'>
          <li
            onClick={() => setMenu("home")}
            className={`nav-item ${menu === "home" ? "active" : ""}`}
          >
            <Link to="/">Home</Link>
          </li>
          <li
            onClick={() => setMenu("menu")}
            className={`nav-item ${menu === "menu" ? "active" : ""}`}
          >
            <a href='#explore-buss'>Cafeterias</a>
          </li>
          <li
            onClick={() => setMenu("contact-us")}
            className={`nav-item ${menu === "contact-us" ? "active" : ""}`}
          >
            <a href='#footer'>Contáctanos</a>
          </li>
        </ul>
      </div>

      <div className='navbar-right'>
        {isSearchOpen && (
          <div className='search-container'>
            <input
              type="text"
              placeholder="Search for cafeterias..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='search-input'
            />
            <button className='search-close' onClick={() => setIsSearchOpen(false)}>
              <i className="fa-solid fa-times"></i>
            </button>
          </div>
        )}

        <ul className='navbar-actions'>
          <li className='action-item cart-item'>
            <div className={getTotalCartAmount() === 0 ? "" : "notification-dot"}></div>
            <Link to="/cart" className="action-button">
              <i className="fa-solid fa-cart-shopping"></i>
              <span>Carrito</span>
            </Link>
          </li>
          <li className='action-item'>
            {!token ? (
              <button className='action-button' onClick={() => setShowLogin(true)}>
                <i className="fa-regular fa-user"></i>
                <span>Profile</span>
              </button>
            ) : (
              <div className='navbar-profile'>
                <i className="fa-regular fa-user"></i>
                <ul className="nav-profile-dropdown">
                  <li onClick={() => navigate('/orders')}>
                    <i className="fa-solid fa-bag-shopping"></i>
                    <p>Registro de ordenes</p>
                  </li>
                  <hr />
                  <li onClick={logout}>
                    <i className="fa-solid fa-right-from-bracket"></i>
                    <p>Cerrar Sesión</p>
                  </li>
                </ul>
              </div>
            )}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Navbar;