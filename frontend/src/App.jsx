import React, { useState } from 'react'
import Navbar from './components/Navbar/Navbar'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home/Home'
import Cart from './pages/Cart/Cart'
import PlaceOrder from './pages/PlaceOrder/PlaceOrder'
import Footer from './components/Footer/Footer'
import LoginPopUp from './components/LoginPopUp/LoginPopUp'
import Order from './pages/Order/Order'
import ScrollToTop from './context/ScrollTop'
import OrderConfirmation from './pages/OrderConfirmation/OrderConfirmation'

const App = () => {
  
  const [showLogin, setShowLogin] = useState(false)

  React.useEffect(() => {
    if (showLogin) {
      document.body.classList.add('login-popup-open');
    } else {
      document.body.classList.remove('login-popup-open');
    }
  }, [showLogin]);

  return (
    <>
    {showLogin?<LoginPopUp setShowLogin={setShowLogin}/>:<></>}
      <div className='app'>
        <Navbar setShowLogin={setShowLogin}/>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/cart' element={<Cart />} />
          <Route path='/order' element={<PlaceOrder />} />
          <Route path='/orders' element={<Order/>}/>
          <Route path='/order-confirmation' element={<OrderConfirmation/>}/>
        </Routes>
      </div>
      <Footer />
    </>
  )
}

export default App
