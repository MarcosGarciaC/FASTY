import React, { useContext, useState } from 'react'
import './PlaceOrder.css'
import { StoreContext } from '../../context/StoreContext'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const PlaceOrder = () => {
  const { getTotalCartAmount, orderItems, food_list, url, clearCart } = useContext(StoreContext)
  const deliveryFee = 2 // Tarifa fija de envío
  const navigate = useNavigate()

  const [rating] = useState(Number(localStorage.getItem('orderRating') || 0));
  const [feedback] = useState(localStorage.getItem('orderFeedback') || '');
  const [pickupTime] = useState(localStorage.getItem('pickupTime') || '');

  
  // Estado para los datos del formulario
const [formData] = useState({
  paymentMethod: 'cash'
})


  // Manejar cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Generar un código de confirmación aleatorio
  const generateConfirmationCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase()
  }

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      // Obtener el token del usuario del localStorage
      const token = localStorage.getItem('token')
      if (!token) {
        alert('Por favor, inicie sesión para realizar un pedido.')
        return
      }

      // Verificar que hay items en el carrito
      if (orderItems.length === 0) {
        alert('Your cart is empty')
        return
      }

      // Obtener el user_id del token (asumiendo que el token contiene esta información)
      // Esto depende de cómo esté estructurado tu token JWT
      // Alternativamente, podrías hacer una petición al backend para obtener el user_id
      const user_id = localStorage.getItem('user_id') // Asegúrate de guardar esto al hacer login

      // Preparar los items para la orden
      const items = orderItems.map(item => {
        const foodItem = food_list.find(food => food._id === item.food_id)
        return {
          food_id: item.food_id,
          quantity: item.quantity,
          price: foodItem.price,
          special_instructions: '' // Puedes agregar un campo para esto si lo necesitas
        }
      })

      // Obtener el cafeteria_id del primer item (asumiendo que todos son del mismo cafetín)
      const cafeteria_id = orderItems[0]?.cafeteria_id

      if (!cafeteria_id) {
        alert('Ninguna cafeteria seleccionada')
        return
      }

      // Crear el objeto de la orden
      const orderData = {
        user_id,
        cafeteria_id,
        items,
        total_amount: getTotalCartAmount() + deliveryFee,
        pickup_time: new Date(pickupTime) || new Date(Date.now() + 30 * 60 * 1000), // 30 minutos desde ahora
        payment_method: formData.paymentMethod,
        confirmation_code: generateConfirmationCode(),
        rating,
        feedback
      }

      // Enviar la orden al backend
      const response = await axios.post(`${url}/api/order/create`, orderData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.data.success) {
        alert('Orden realizada con éxito!')
        clearCart()
        navigate('/order-confirmation', { state: { order: response.data.data } })
      } else {
        alert('Failed to place order: ' + response.data.message)
      }
    } catch (error) {
      console.error('Error realizando la orden:', error)
      alert('Error placing order. Please try again.')
    }
  }

  return (
    <form className='place-order' onSubmit={handleSubmit}>
     {/* <div className="place-order-left">
        <p className='title'>Order Information</p>
        <div className="multi-fields">
          <input 
            type="text" 
            placeholder='First Name'
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
          <input 
            type="text" 
            placeholder='Last Name'
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>
        <input 
          type='email' 
          placeholder='Email address'
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input 
          type="text" 
          placeholder='Street'
          name="street"
          value={formData.street}
          onChange={handleChange}
          required
        /> 
        <div className="multi-fields">
          <input 
            type="text" 
            placeholder='City'
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
          />
          <input 
            type="text" 
            placeholder='State'
            name="state"
            value={formData.state}
            onChange={handleChange}
            required
          />  
        </div>
        <div className="multi-fields">
          <input 
            type="text" 
            placeholder='Zip Code'
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
            required
          />
          <input 
            type="text" 
            placeholder='Country'
            name="country"
            value={formData.country}
            onChange={handleChange}
            required
          />  
        </div>
        <input 
          type="text" 
          placeholder='Phone'
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
        />
        <div className="payment-method">
          <label>Payment Method:</label>
          <select 
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
            required
          >
            <option value="cash">Cash</option>
            <option value="card">Credit Card</option>
            <option value="university_card">University Card</option>
          </select>
        </div>
      </div> */}
      
      <div className="place-order-right">
        <div className="cart-total">
          <h2>Total a pagar</h2>
          <div className="cart-total-details-container">
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>${getTotalCartAmount().toFixed(2)}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Precio de Pre orden</p>
              <p>${getTotalCartAmount()===0 ? 0 : deliveryFee.toFixed(2)}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>${(getTotalCartAmount()===0 ? 0 : getTotalCartAmount()+deliveryFee).toFixed(2)}</b>
            </div>
          </div>
          <button type="submit" className='checkout-btn'>CONFIRMAR LA ORDEN</button>
        </div>
      </div>
    </form>
  )
}

export default PlaceOrder