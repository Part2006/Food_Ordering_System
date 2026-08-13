import Restaurant from '../models/restaurant.js';
import MenuItem from '../models/menuItem.js';
import { seedIfEmpty } from '../seedHelper.js';

// @desc    Get all approved restaurants (with query filters)
// @route   GET /api/restaurants
// @access  Public
export const getRestaurants = async (req, res) => {
  try {
    const { search, cuisine, rating, limit } = req.query;
    
    // Self-healing database check: Auto-seed if empty
    const count = await Restaurant.countDocuments();
    if (count === 0) {
      console.log('No restaurants found in database. Automatically seeding default data...');
      await seedIfEmpty(true);
    }
    
    // Default filter: only show approved and active restaurants to public
    let filter = { isApproved: true, isActive: true };

    // Super Admin can pass showAll=true to see all restaurants including pending approvals
    if (req.query.showAll === 'true' || (req.user && req.user.role === 'admin')) {
      filter = {};
    }

    // Search by name or cuisine (ignore address filter)
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { cuisine: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Filter by cuisine
    if (cuisine) {
      filter.cuisine = { $in: [new RegExp(cuisine, 'i')] };
    }

    // Filter by rating
    if (rating) {
      filter.rating = { $gte: parseFloat(rating) };
    }

    const restaurants = await Restaurant.find(filter)
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit ? parseInt(limit) : 50);

    res.json(restaurants);
  } catch (error) {
    console.error('Get restaurants error:', error);
    res.status(500).json({ message: 'Server error, failed to fetch restaurants' });
  }
};

// @desc    Get restaurant details and its menu
// @route   GET /api/restaurants/:id
// @access  Public
export const getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).populate('owner', 'name email');
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Fetch the menu items for this restaurant
    const menuItems = await MenuItem.find({ restaurant: restaurant._id });

    res.json({
      restaurant,
      menu: menuItems
    });
  } catch (error) {
    console.error('Get restaurant by ID error:', error);
    res.status(500).json({ message: 'Server error, failed to fetch restaurant details' });
  }
};

// @desc    Create a new restaurant profile
// @route   POST /api/restaurants
// @access  Private (Restaurant owner or Admin)
export const createRestaurant = async (req, res) => {
  try {
    const { name, address, cuisine, deliveryRadius, timing, image } = req.body;
    
    // Check if the user already has a restaurant profile (if they are a restaurant role)
    if (req.user.role === 'restaurant') {
      const existing = await Restaurant.findOne({ owner: req.user._id });
      if (existing) {
        return res.status(400).json({ message: 'You already own a restaurant profile' });
      }
    }

    const restaurant = new Restaurant({
      name,
      owner: req.user._id,
      address,
      cuisine: Array.isArray(cuisine) ? cuisine : cuisine.split(',').map(c => c.trim()),
      deliveryRadius,
      timing,
      image,
      // If super admin creates it, auto-approve it, otherwise require approval
      isApproved: req.user.role === 'admin'
    });

    const created = await restaurant.save();
    res.status(201).json(created);
  } catch (error) {
    console.error('Create restaurant error:', error);
    res.status(500).json({ message: 'Server error, failed to create restaurant' });
  }
};

// @desc    Update restaurant profile
// @route   PUT /api/restaurants/:id
// @access  Private (Owner or Admin)
export const updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Authorization check
    if (restaurant.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to edit this restaurant' });
    }

    restaurant.name = req.body.name || restaurant.name;
    restaurant.address = req.body.address || restaurant.address;
    restaurant.deliveryRadius = req.body.deliveryRadius || restaurant.deliveryRadius;
    restaurant.image = req.body.image || restaurant.image;
    
    if (req.body.cuisine) {
      restaurant.cuisine = Array.isArray(req.body.cuisine) 
        ? req.body.cuisine 
        : req.body.cuisine.split(',').map(c => c.trim());
    }

    if (req.body.timing) {
      restaurant.timing = req.body.timing;
    }

    if (req.body.isActive !== undefined) {
      restaurant.isActive = req.body.isActive;
    }

    const updated = await restaurant.save();
    res.json(updated);
  } catch (error) {
    console.error('Update restaurant error:', error);
    res.status(500).json({ message: 'Server error, failed to update restaurant' });
  }
};

// @desc    Approve or reject/block restaurant
// @route   PUT /api/restaurants/:id/approve
// @access  Private (Super Admin Only)
export const approveRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const { isApproved } = req.body;
    if (isApproved === undefined) {
      return res.status(400).json({ message: 'Please provide isApproved status' });
    }

    restaurant.isApproved = isApproved;
    const updated = await restaurant.save();
    res.json(updated);
  } catch (error) {
    console.error('Approve restaurant error:', error);
    res.status(500).json({ message: 'Server error, failed to approve/reject restaurant' });
  }
};

// @desc    Delete restaurant profile
// @route   DELETE /api/restaurants/:id
// @access  Private (Super Admin Only)
export const deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    await Restaurant.deleteOne({ _id: restaurant._id });
    // Clean up menu items associated with the restaurant
    await MenuItem.deleteMany({ restaurant: restaurant._id });

    res.json({ message: 'Restaurant and all associated menu items deleted' });
  } catch (error) {
    console.error('Delete restaurant error:', error);
    res.status(500).json({ message: 'Server error, failed to delete restaurant' });
  }
};

// @desc    Get restaurant profile owned by current user
// @route   GET /api/restaurants/my-restaurant
// @access  Private (Restaurant admin)
export const getMyRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) {
      return res.status(404).json({ message: 'No restaurant found for this user' });
    }
    
    const menuItems = await MenuItem.find({ restaurant: restaurant._id });
    
    res.json({
      restaurant,
      menu: menuItems
    });
  } catch (error) {
    console.error('Get my restaurant error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
