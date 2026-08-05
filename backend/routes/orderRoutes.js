import express from 'express';
import { 
  getMyOrders, 
  getRestaurantOrders, 
  getAllOrders, 
  updateOrderStatus,
  getOrderById
} from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Admin-only route to get all orders across the platform
router.route('/')
  .get(protect, authorize('admin'), getAllOrders);

// Customer order history
router.get('/my-orders', protect, getMyOrders);

// Restaurant admin order queue
router.get('/restaurant/:restaurantId', protect, authorize('restaurant', 'admin'), getRestaurantOrders);

// Get order details by ID (Customer / Restaurant / Admin)
router.get('/:id', protect, getOrderById);

// Order status updates (Restaurant owners or Super Admin override)
router.put('/:id/status', protect, authorize('restaurant', 'admin'), updateOrderStatus);

export default router;
