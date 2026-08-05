import express from 'express';
import { createOrder, verifyPayment } from '../controllers/orderController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Route to create a new order (initiates Razorpay transaction)
router.post('/create-order', protect, createOrder);

// Route to verify Razorpay signature and capture payment
router.post('/verify', protect, verifyPayment);

export default router;
