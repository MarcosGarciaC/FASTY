import express from 'express';
import { 
  createOrder, 
  getOrdersByCafeteria, 
  updateOrderStatus, 
  getOrderDetails 
} from '../controllers/orderController.js';

const orderRouter = express.Router();

// Rutas para las órdenes
orderRouter.post("/create", createOrder);
orderRouter.get("/cafeteria/:cafeteria_id", getOrdersByCafeteria);
orderRouter.patch("/:order_id/status", updateOrderStatus);
orderRouter.get("/:order_id", getOrderDetails);

export default orderRouter;