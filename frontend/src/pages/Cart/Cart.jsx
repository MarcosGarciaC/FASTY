import React, { useContext, useState } from 'react'
import './Cart.css'
import { StoreContext } from '../../context/StoreContext'
import { useNavigate } from 'react-router-dom'
import Flatpickr from 'react-flatpickr'
import 'flatpickr/dist/themes/material_blue.css' // Puedes elegir otro tema si quieres


const Cart = () => {
  const { cartItems, food_list, removeFromCart, getTotalCartAmount } = useContext(StoreContext)
  const navigate = useNavigate()

  const getDefaultPickupTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 16);
    now.setSeconds(0);
    now.setMilliseconds(0);
    return now;
  }

  


  // Estados para los nuevos campos
  const [pickupTime, setPickupTime] = useState(getDefaultPickupTime())
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
      setValidationError('Por favor seleccione una hora de retiro')
      return false
    }

    const selectedTime = new Date(time).getTime()
    const minTime = new Date()
    minTime.setMinutes(minTime.getMinutes() + 15)

    if (selectedTime < minTime.getTime()) {
      setValidationError('La hora de retiro debe ser al menos 15 min después de ahora')
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
            <p></p>
            <p>Nombre</p>
            <p>Precio</p>
            <p>Cantidad</p>
            <p>Total</p>
            <p>Remover</p>
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
            <h2>Total del carrito</h2>
            <div className="cart-total-details-container">
              <div className="cart-total-details">
                <p>Subtotal</p>
                <p>${getTotalCartAmount().toFixed(2)}</p>
              </div>
              <hr />
              <div className="cart-total-details">
                <p>Precio de pre orden</p>
                <p>${getTotalCartAmount() === 0 ? 0 : deliveryFee.toFixed(2)}</p>
              </div>
              <hr />
              <div className="cart-total-details">
                <b>Total</b>
                <b>${(getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + deliveryFee).toFixed(2)}</b>
              </div>
            </div>

            {/* Campos adicionales */}
            <div className="additional-fields">
              <div className="pickup-time">
                <label htmlFor="pickupTime">Hora de retiro:</label>
                <Flatpickr
                  options={{
                    enableTime: true,
                    noCalendar: true,
                    dateFormat: 'h:i K', // formato 12h con AM/PM
                    time_24hr: false,
                    minuteIncrement: 1,
                    defaultDate: getDefaultPickupTime(), // esta es la clave
                  }}
                  value={pickupTime}
                  onChange={(selectedDates) => {
                    const now = new Date()
                    const selectedTime = selectedDates[0]

                    // Combinar fecha de hoy con hora seleccionada
                    const combinedDate = new Date(
                      now.getFullYear(),
                      now.getMonth(),
                      now.getDate(),
                      selectedTime.getHours(),
                      selectedTime.getMinutes()
                    )

                    setPickupTime(combinedDate)
                    validatePickupTime(combinedDate.toISOString())
                  }}
                />


                {validationError && (
                  <p className="error-message" style={{ color: 'red', fontSize: '0.8rem' }}>
                    {validationError}
                  </p>
                )}
                <p className="time-note" style={{ fontSize: '0.8rem', color: '#555' }}>
                  Por favor seleccione un tiempo de al menos 15 minutos desde ahora
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
                  <label htmlFor="feedback">Notas para el producto (optional):</label>
                  <textarea
                    id="feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Escribe tus notas especiales para el producto..."
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
              PROCEDER A CHECKOUT
            </button>
          </div>

          <div className="cart-promocode">
            <p className='promo-text'>Si tienes un código de promoción ponlo aqui!</p>
            <div className="cart-promocode-input">
              <input
                type='text'
                placeholder='Código de promo'
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
                Aplicar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart