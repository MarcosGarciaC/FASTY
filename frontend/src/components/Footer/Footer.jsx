import React from 'react'
import './Footer.css'
import { assets } from '../../assets/assets'

const Footer = () => {
  return (
    <div className='footer' id='footer'>
      <div className='footer-content'>
        <div className='footer-content-left'>
          <img src={assets.fasty_logo} alt="FASTY Logo" className='logo'/>
          <p className='footer-description'>FASTY - Tu solución más rápida</p>
          <div className='footer-social-icons'>
            <a href='#'><i className="fa-brands fa-instagram"></i></a>
            <a href='#'><i className="fa-brands fa-facebook"></i></a>
            <a href='#'><i className="fa-brands fa-twitter"></i></a>
          </div>
        </div>
        <div className="footer-content-center">
          <h3>Enlaces de interés</h3>
          <ul>
            <li><a href='#'>Acerca de nosotros</a></li>
            <li><a href='#'>Preguntas frecuentes</a></li>
            <li><a href='#'>Consultas y seguridad</a></li>
            <li><a href='#'>FASTY para todos</a></li>
          </ul>
        </div>
        <div className="footer-content-right">
          <h3>Colabora con FASTY</h3>
          <ul>
            <li><a href='#'>Trabaja con nosotros</a></li>
            <li><a href='#'>Franquicias</a></li>
            <li><a href='#'>Conviértete en repartidor</a></li>
          </ul>   
        </div>
        <div className='footer-content-legal'>
          <h3>Legal</h3>
          <ul>
            <li><a href='#'><i className="fa-solid fa-circle-exclamation"></i> Condiciones de uso</a></li>
            <li><a href='#'><i className="fa-solid fa-shield-halved"></i> Política y privacidad</a></li>
            <li><a href='#'><i className="fa-solid fa-cookie-bite"></i> Política de Cookies</a></li>
          </ul>   
        </div>
      </div>
      <div className='footer-copyright'>
        <hr />
        <p>Copyright © {new Date().getFullYear()} FASTY - Todos los derechos reservados.</p>
      </div>
    </div>
  )
}

export default Footer