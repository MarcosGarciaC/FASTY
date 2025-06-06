import React from 'react'
import './Header.css'


const Header = () => {
  return (
    <div className='header'>
      <div className="header-contents">
        <h2 className='transX'><em>ORDENA TU COMIDA</em> <strong>FAVORITA</strong> <em>EN TU LUGAR</em> <strong>FAVORITO</strong></h2>
        <div className='transX'>
          <p>Selecciona de las distintas cafeterias de la UNI aquella que mas te guste</p>
          <button>Ver Opciones</button>
        </div>
      </div>
    </div>
  )
}

export default Header
