import User from '../models/user.js';

// @desc    Get all users (customers and restaurant owners)
// @route   GET /api/admin/users
// @access  Private (Super Admin Only)
export const getUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    const filter = {};

    if (role) {
      filter.role = role;
    } else {
      filter.role = { $ne: 'admin' }; // Don't return super admins by default
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error, failed to fetch users' });
  }
};

// @desc    Toggle block status of a user (or restaurant owner)
// @route   PUT /api/admin/users/:id/block
// @access  Private (Super Admin Only)
export const toggleUserBlock = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot block a Super Admin' });
    }

    // Toggle blocking by using a custom property on user or removing their active session
    // Since we don't have an active block field, let's modify the user model, or we can check if we need to add a block field.
    // Wait! Let's check if the user model has a block field. It doesn't have one explicitly. Let's add an `isBlocked` field to the user model or add it dynamically!
    // Since mongoose schemas are strict, we should update the User schema if we want to save `isBlocked`.
    // Let's modify User model to include `isBlocked: { type: Boolean, default: false }`. Let's do that!
    // But first, let's write the controller assuming it exists, and then we will update user.js.
    
    // Check if the property exists, if not default it
    const newBlockStatus = !req.body.isBlocked; // or toggle
    user.set('isBlocked', req.body.isBlocked);
    await user.save();

    res.json({ message: `User status updated to ${req.body.isBlocked ? 'Blocked' : 'Active'}`, user });
  } catch (error) {
    console.error('Toggle block error:', error);
    res.status(500).json({ message: 'Server error, failed to update block status' });
  }
};
