import MenuItem from '../models/menuItem.js';
import Restaurant from '../models/restaurant.js';

// @desc    Create a new menu item
// @route   POST /api/menu
// @access  Private (Restaurant Owner or Admin)
export const createMenuItem = async (req, res) => {
  try {
    const { restaurant, name, price, category, image, isAvailable, isVeg, description } = req.body;

    // Verify restaurant existence and ownership
    const rest = await Restaurant.findById(restaurant);
    if (!rest) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    if (rest.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to add menu items to this restaurant' });
    }

    const menuItem = new MenuItem({
      restaurant,
      name,
      price: parseFloat(price),
      category,
      image,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      isVeg: isVeg !== undefined ? isVeg : true,
      description
    });

    const created = await menuItem.save();
    res.status(201).json(created);
  } catch (error) {
    console.error('Create menu item error:', error);
    res.status(500).json({ message: 'Server error, failed to create menu item' });
  }
};

// @desc    Update menu item
// @route   PUT /api/menu/:id
// @access  Private (Restaurant Owner or Admin)
export const updateMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    // Verify ownership of the restaurant
    const rest = await Restaurant.findById(menuItem.restaurant);
    if (!rest) {
      return res.status(404).json({ message: 'Associated restaurant not found' });
    }

    if (rest.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this menu item' });
    }

    menuItem.name = req.body.name || menuItem.name;
    menuItem.price = req.body.price !== undefined ? parseFloat(req.body.price) : menuItem.price;
    menuItem.category = req.body.category || menuItem.category;
    menuItem.image = req.body.image || menuItem.image;
    menuItem.description = req.body.description || menuItem.description;
    
    if (req.body.isAvailable !== undefined) {
      menuItem.isAvailable = req.body.isAvailable;
    }

    if (req.body.isVeg !== undefined) {
      menuItem.isVeg = req.body.isVeg;
    }

    const updated = await menuItem.save();
    res.json(updated);
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({ message: 'Server error, failed to update menu item' });
  }
};

// @desc    Delete menu item
// @route   DELETE /api/menu/:id
// @access  Private (Restaurant Owner or Admin)
export const deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    // Verify ownership of the restaurant
    const rest = await Restaurant.findById(menuItem.restaurant);
    if (!rest) {
      return res.status(404).json({ message: 'Associated restaurant not found' });
    }

    if (rest.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this menu item' });
    }

    await MenuItem.deleteOne({ _id: menuItem._id });
    res.json({ message: 'Menu item removed successfully' });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({ message: 'Server error, failed to delete menu item' });
  }
};

// @desc    Get all menu items for a restaurant
// @route   GET /api/menu/restaurant/:restaurantId
// @access  Public
export const getMenuItemsByRestaurant = async (req, res) => {
  try {
    const menuItems = await MenuItem.find({ restaurant: req.params.restaurantId });
    res.json(menuItems);
  } catch (error) {
    console.error('Get menu items by restaurant error:', error);
    res.status(500).json({ message: 'Server error, failed to fetch menu' });
  }
};

// @desc    Get all menu items (with filters)
// @route   GET /api/menu
// @access  Public
export const getMenuItems = async (req, res) => {
  try {
    const { category, search, vegOnly } = req.query;
    let filter = { isAvailable: true };

    if (category && category !== 'All') {
      // Map frontend category names to DB regex (e.g. 'Desserts' or 'Dessert')
      let dbCategory = category;
      if (category === 'Desserts') {
        dbCategory = 'Desserts|Dessert';
      }
      filter.category = { $regex: new RegExp(`^(${dbCategory})$`, 'i') };
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (vegOnly === 'true') {
      filter.isVeg = true;
    }

    const menuItems = await MenuItem.find(filter).populate('restaurant', 'name isApproved isActive');
    
    // Only return items from approved and active restaurants
    const approvedItems = menuItems.filter(item => item.restaurant && item.restaurant.isApproved && item.restaurant.isActive);

    res.json(approvedItems);
  } catch (error) {
    console.error('Get menu items error:', error);
    res.status(500).json({ message: 'Server error, failed to fetch menu items' });
  }
};
