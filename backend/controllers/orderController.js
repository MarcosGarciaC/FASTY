import orderModel from "../models/orderModel.js";
import cafeteriaModel from "../models/cafetinModel.js"; // Importar el modelo de cafeteria
import userModel from "../models/userModel.js"; // Importar el modelo de usuario
import nodemailer from 'nodemailer';

// Configuración para enviar correo de confirmación de orden
const sendOrderConfirmationEmail = async (order, userEmail, cafeteriaId) => {
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

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // Correo para el usuario
  const userMailOptions = {
    from: '"FASTY" <no-reply@fasty.com>',
    to: userEmail,
    subject: 'Confirmación de tu orden',
    html: `
      <p>¡Gracias por tu pedido!</p>
      <p>Detalles de la orden:</p>
      <ul>
        <li><strong>Código de confirmación:</strong> ${order.confirmation_code}</li>
        <li><strong>Total:</strong> $${order.total_amount.toFixed(2)}</li>
        <li><strong>Hora de recogida:</strong> ${new Date(order.pickup_time).toLocaleString()}</li>
        <li><strong>Método de pago:</strong> ${order.payment_method}</li>
      </ul>
      <p>Tu pedido está en proceso. Puedes verificar el estado en nuestro sitio web.</p>
    `
  };

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
      <p>Por favor, prepara el pedido para la hora indicada.</p>
    `
  };

  // Enviar ambos correos
  await Promise.all([
    transporter.sendMail(userMailOptions),
    transporter.sendMail(cafeteriaMailOptions)
  ]);
};

// Crear una nueva orden
const createOrder = async (req, res) => {
  try {
    const order = new orderModel({
      user_id: req.body.user_id,
      cafeteria_id: req.body.cafeteria_id,
      items: req.body.items,
      total_amount: req.body.total_amount,
      pickup_time: req.body.pickup_time,
      payment_method: req.body.payment_method,
      confirmation_code: req.body.confirmation_code,
      rating: req.body.rating,
      feedback: req.body.feedback
    });

    await order.save();

    // Enviar correo de confirmación al usuario y a la cafetería
    await sendOrderConfirmationEmail(order, req.body.user_email, req.body.cafeteria_id);

    res.json({ success: true, message: "Order created successfully", data: order });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error creating order" });
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