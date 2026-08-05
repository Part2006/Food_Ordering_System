import express from 'express';
import { 
  getRestaurants, 
  getRestaurantById, 
  createRestaurant, 
  updateRestaurant, 
  approveRestaurant, 
  deleteRestaurant,
  getMyRestaurant
} from '../controllers/restaurantController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(getRestaurants)
  .post(protect, authorize('restaurant', 'admin'), createRestaurant);

router.get('/my-restaurant', protect, authorize('restaurant', 'admin'), getMyRestaurant);

router.route('/:id')
  .get(getRestaurantById)
  .put(protect, authorize('restaurant', 'admin'), updateRestaurant)
  .delete(protect, authorize('admin'), deleteRestaurant);

router.put('/:id/approve', protect, authorize('admin'), approveRestaurant);

export default router;
