import React from 'react';
import './Sidebar.css';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className='sidebar'>
      <div className="sidebar-options">
        <NavLink to='/add' className="sidebar-option">
          <i className="fa-solid fa-plus"></i>
          <p>Agregar Artículos</p>
        </NavLink>
        <NavLink to='/list' className="sidebar-option">
          <i className="fa-solid fa-list"></i>
          <p>Lista de Artículos</p>
        </NavLink>           
        <NavLink to='/orders' className="sidebar-option">
          <i class="fa-regular fa-calendar-check"></i>
          <p>Ordenes</p>
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;