import express from 'express';
import { createReview, getRestaurantReviews } from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Submit a review (Private: Customer only)
router.post('/', protect, createReview);

// Fetch reviews for a specific restaurant (Public)
router.get('/restaurant/:restaurantId', getRestaurantReviews);

export default router;
