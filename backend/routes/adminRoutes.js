import express from 'express';
import { getUsers, toggleUserBlock } from '../controllers/adminController.js';
import { getDashboardStats } from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Apply admin guards to all sub-routes here
router.use(protect, authorize('admin'));

// Fetch all users for super admin dashboard
router.get('/users', getUsers);

// Block / unblock a specific user (customer or restaurant owner)
router.put('/users/:id/block', toggleUserBlock);

// Fetch platform statistics
router.get('/dashboard-stats', getDashboardStats);

export default router;
