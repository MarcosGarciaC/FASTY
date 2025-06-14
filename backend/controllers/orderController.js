import orderModel from "../models/orderModel.js";

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