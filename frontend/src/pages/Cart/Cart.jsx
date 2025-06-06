import React, { useContext, useState } from 'react'
import './Cart.css'
import { StoreContext } from '../../context/StoreContext'
import { useNavigate } from 'react-router-dom'

const Cart = () => {
  const { cartItems, food_list, removeFromCart, getTotalCartAmount } = useContext(StoreContext)
  const navigate = useNavigate()
  
  // Estados para los nuevos campos
  const [pickupTime, setPickupTime] = useState('')
  const [feedback, setFeedback] = useState('')
  const [rating, setRating] = useState(0)
  const [validationError, setValidationError] = useState('')

  // Calcular la hora mínima (ahora + 15 minutos)
  const getMinPickupTime = () => {
    const now = new Date()
    now.setMinutes(now.getMinutes() + 15)
    return now.toISOString().slice(0, 16)
  }

  // Validar el tiempo de recogida
  const validatePickupTime = (time) => {
    if (!time) {
      setValidationError('Please select a pickup time')
      return false
    }
    
    const selectedTime = new Date(time).getTime()
    const minTime = new Date()
    minTime.setMinutes(minTime.getMinutes() + 15)
    
    if (selectedTime < minTime.getTime()) {
      setValidationError('Pickup time must be at least 15 minutes from now')
      return false
    }
    
    setValidationError('')
    return true
  }

  // Manejar cambio en el tiempo de recogida
  const handlePickupTimeChange = (e) => {
    const time = e.target.value
    setPickupTime(time)
    validatePickupTime(time)
  }

  // Calcular totales
  const subtotal = food_list.reduce((total, item) => {
    if (cartItems[item._id] > 0) {
      return total + (item.price * cartItems[item._id])
    }
    return total
  }, 0)

  const deliveryFee = 2 // Tarifa fija de envío
  const total = subtotal + deliveryFee

  // Manejar el envío al checkout
  const handleProceedToCheckout = () => {
    if (!validatePickupTime(pickupTime)) {
      return
    }
    
    // Guardar los datos adicionales en el localStorage para usarlos en PlaceOrder
    localStorage.setItem('orderFeedback', feedback)
    localStorage.setItem('orderRating', rating.toString())
    localStorage.setItem('pickupTime', pickupTime)
    
    // Navegar a la página de checkout
    navigate('/order')
  }

  return (
    <div className='cart'>
      <div className='cart-container'>
        <div className='cart-items'>
          <div className="cart-items-title">
            <p>Item</p>
            <p>Title</p>
            <p>Price</p>
            <p>Quantity</p>
            <p>Total</p>
            <p>Remove</p>
          </div>
          <hr />

          <div className="cart-items-list">
            {food_list.map((item) => {
              if (cartItems[item._id] > 0) {
                return (
                  <div key={item._id} className='cart-items-item'>
                    <img src={item.image} alt={item.name} />
                    <p>{item.name}</p>
                    <p>${item.price.toFixed(2)}</p>
                    <p>{cartItems[item._id]}</p>
                    <p>${(item.price * cartItems[item._id]).toFixed(2)}</p>
                    <p onClick={() => removeFromCart(item._id)} className='cross'>×</p>
                  </div>
                )
              }
              return null
            })}
          </div>
        </div>

        <div className='cart-bottom'>
          <div className="cart-total">
            <h2>Cart Totals</h2>
            <div className="cart-total-details-container">
              <div className="cart-total-details">
                <p>Subtotal</p>
                <p>${getTotalCartAmount().toFixed(2)}</p>
              </div>
              <hr />
              <div className="cart-total-details">
                <p>Delivery Fee</p>
                <p>${getTotalCartAmount()===0?0:deliveryFee.toFixed(2)}</p>
              </div>
              <hr />
              <div className="cart-total-details">
                <b>Total</b>
                <b>${(getTotalCartAmount()===0?0:getTotalCartAmount()+deliveryFee).toFixed(2)}</b>
              </div>
            </div>
            
            {/* Campos adicionales */}
            <div className="additional-fields">
              <div className="pickup-time">
                <label htmlFor="pickupTime">Pickup Time:</label>
                <input
                  type="datetime-local"
                  id="pickupTime"
                  value={pickupTime}
                  onChange={handlePickupTimeChange}
                  required
                  min={getMinPickupTime()}
                />
                {validationError && (
                  <p className="error-message" style={{color: 'red', fontSize: '0.8rem'}}>
                    {validationError}
                  </p>
                )}
                <p className="time-note" style={{fontSize: '0.8rem', color: '#555'}}>
                  Please select a time at least 15 minutes from now
                </p>
              </div>
              
              <div className="rating-feedback">
                <div className="rating">
                  <label>Rating (optional):</label>
                  <div className="stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={star <= rating ? 'filled' : ''}
                        onClick={() => setRating(star)}
                        style={{
                          cursor: 'pointer',
                          fontSize: '1.5rem',
                          color: star <= rating ? '#ffb700' : '#ccc'
                        }}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="feedback">
                  <label htmlFor="feedback">Feedback (optional):</label>
                  <textarea
                    id="feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Any special instructions or feedback..."
                    rows="3"
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  />
                </div>
              </div>
            </div>
            
            <button 
              onClick={handleProceedToCheckout} 
              className='checkout-btn'
              disabled={getTotalCartAmount() === 0 || !!validationError}
              style={{
                backgroundColor: getTotalCartAmount() === 0 || !!validationError ? '#ccc' : '#ffb700',
                cursor: getTotalCartAmount() === 0 || !!validationError ? 'not-allowed' : 'pointer'
              }}
            >
              PROCEED TO CHECKOUT
            </button>
          </div>

          <div className="cart-promocode">
            <p className='promo-text'>If you have a promo code, Enter it here!</p>
            <div className="cart-promocode-input">
              <input 
                type='text' 
                placeholder='promo code' 
                style={{
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px 0 0 4px',
                  width: '70%'
                }}
              />
              <button 
                className='promo-btn'
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#ffb700',
                  border: 'none',
                  borderRadius: '0 4px 4px 0',
                  cursor: 'pointer'
                }}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart