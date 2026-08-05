import express from 'express';
import { 
  createMenuItem, 
  updateMenuItem, 
  deleteMenuItem, 
  getMenuItemsByRestaurant,
  getMenuItems
} from '../controllers/menuController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(getMenuItems)
  .post(protect, authorize('restaurant', 'admin'), createMenuItem);

router.route('/:id')
  .put(protect, authorize('restaurant', 'admin'), updateMenuItem)
  .delete(protect, authorize('restaurant', 'admin'), deleteMenuItem);

router.get('/restaurant/:restaurantId', getMenuItemsByRestaurant);

export default router;
