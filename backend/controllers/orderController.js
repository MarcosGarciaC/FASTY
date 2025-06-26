import orderModel from "../models/orderModel.js";
import cafeteriaModel from "../models/cafetinModel.js"; // Importar el modelo de cafeteria
import userModel from "../models/userModel.js"; // Importar el modelo de usuario
import nodemailer from 'nodemailer';

// Configuración para enviar correo de confirmación de orden
const sendOrderConfirmationEmail = async (order, cafeteriaId) => {
  // Obtener la cafetería
  const cafeteria = await cafeteriaModel.findById(cafeteriaId);
  if (!cafeteria) {
    throw new Error('Cafeteria not found');
  }

  // Obtener el email del propietario de la cafetería
  const owner = await userModel.findById(cafeteria.owner_id);
  if (!owner || !owner.email) {
    throw new Error('Cafeteria owner email not found');
  }
  const cafeteriaEmail = owner.email;

  // Obtener los detalles de los ítems con populate
  const populatedOrder = await orderModel.findById(order._id)
    .populate('items.food_id', 'name price');

  // Formatear los ítems para el correo
  const itemsHtml = populatedOrder.items.map(item => `
    <li>
      <strong>Ítem:</strong> ${item.food_id.name}<br>
      <strong>Cantidad:</strong> ${item.quantity}<br>
      <strong>Precio unitario:</strong> $${item.price.toFixed(2)}<br>
      <strong>Instrucciones especiales:</strong> ${item.special_instructions || 'Ninguna'}
    </li>
  `).join('');

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // Correo para la cafetería
  const cafeteriaMailOptions = {
    from: '"FASTY" <no-reply@fasty.com>',
    to: cafeteriaEmail,
    subject: 'Nueva orden recibida',
    html: `
      <p>Se ha recibido una nueva orden para ${cafeteria.name}:</p>
      <p>Detalles de la orden:</p>
      <ul>
        <li><strong>Código de confirmación:</strong> ${order.confirmation_code}</li>
        <li><strong>Total:</strong> $${order.total_amount.toFixed(2)}</li>
        <li><strong>Hora de recogida:</strong> ${new Date(order.pickup_time).toLocaleString()}</li>
        <li><strong>Método de pago:</strong> ${order.payment_method}</li>
      </ul>
      <p>Ítems de la orden:</p>
      <ul>
        ${itemsHtml}
      </ul>
      <p>Por favor, prepara el pedido para la hora indicada.</p>
    `
  };

  // Enviar correo a la cafetería
  await transporter.sendMail(cafeteriaMailOptions);
};

const createOrder = async (req, res) => {
  try {
    const {
      user_id,
      cafeteria_id,
      items,
      total_amount,
      pickup_time,
      payment_method,
      confirmation_code,
      rating,
      feedback
    } = req.body;

    // Verificar disponibilidad de cada ítem
    for (const item of items) {
      const food = await foodModel.findById(item.food_id);

      if (!food || !food.is_available) {
        return res.status(400).json({ success: false, message: `El producto con ID ${item.food_id} no está disponible.` });
      }

      if (food.daily_quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Cantidad insuficiente para ${food.name}. Disponible: ${food.daily_quantity}, solicitado: ${item.quantity}`
        });
      }
    }

    // Crear la orden
    const order = new orderModel({
      user_id,
      cafeteria_id,
      items,
      total_amount,
      pickup_time,
      payment_method,
      confirmation_code,
      rating,
      feedback
    });

    await order.save();

    // Restar la cantidad ordenada a cada producto
    for (const item of items) {
      await foodModel.findByIdAndUpdate(item.food_id, {
        $inc: { daily_quantity: -item.quantity }
      });
    }

    // Enviar correo
    await sendOrderConfirmationEmail(order, cafeteria_id);

    res.json({ success: true, message: "Orden creada exitosamente", data: order });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error al crear la orden" });
  }
};


// Obtener todas las órdenes filtradas por cafeteria_id
const getOrdersByCafeteria = async (req, res) => {
  try {
    const { cafeteria_id } = req.params;
    const orders = await orderModel.find({ cafeteria_id })
      .populate('user_id', 'name email')
      .populate('cafeteria_id', 'name')
      .populate('items.food_id', 'name price');

    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error fetching orders" });
  }
};

// Actualizar el estado de una orden
const updateOrderStatus = async (req, res) => {
  try {
    const { order_id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const updatedOrder = await orderModel.findByIdAndUpdate(
      order_id,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, message: "Order status updated", data: updatedOrder });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error updating order status" });
  }
};

// Obtener detalles de una orden específica
const getOrderDetails = async (req, res) => {
  try {
    const { order_id } = req.params;
    const order = await orderModel.findById(order_id)
      .populate('user_id', 'name email')
      .populate('cafeteria_id', 'name')
      .populate('items.food_id', 'name price description');

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error fetching order details" });
  }
};

// Obtener todas las órdenes de un usuario
const getOrdersByUser = async (req, res) => {
  try {
    const { user_id } = req.body;
    if (!user_id) {
      return res.status(400).json({ success: false, message: "user_id is required" });
    }
    const orders = await orderModel.find({ user_id })
      .populate('user_id', 'name email')
      .populate('cafeteria_id', 'name')
      .populate('items.food_id', 'name price')
      .sort({ createdAt: -1 }); // Ordenar por fecha de creación descendente
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error fetching user orders" });
  }
};

export { createOrder, getOrdersByCafeteria, updateOrderStatus, getOrderDetails, getOrdersByUser };