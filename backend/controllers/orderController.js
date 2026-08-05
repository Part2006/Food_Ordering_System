import Order from '../models/order.js';
import Restaurant from '../models/restaurant.js';
import MenuItem from '../models/menuItem.js';
import User from '../models/user.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize Razorpay instance if keys are available in environment
const hasRazorpayKeys = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET;
let razorpay;

if (hasRazorpayKeys) {
  try {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    console.log('Razorpay initialized successfully.');
  } catch (err) {
    console.error('Failed to initialize Razorpay with provided keys:', err.message);
  }
} else {
  console.log('Razorpay keys missing in .env. Running in Simulated Payment Mode.');
}

// @desc    Create a new order & initiate payment
// @route   POST /api/orders
// @access  Private (Customer)
export const createOrder = async (req, res) => {
  try {
    const { items, deliveryAddress, simulatePayment, discount } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Group items by restaurant
    const itemsByRestaurant = {};
    for (const item of items) {
      const rId = item.restaurantId;
      if (!rId) {
        return res.status(400).json({ message: 'Restaurant ID missing for some items' });
      }
      if (!itemsByRestaurant[rId]) {
        itemsByRestaurant[rId] = [];
      }
      itemsByRestaurant[rId].push(item);
    }

    // Calculate subtotal and verify prices
    let totalSubtotal = 0;
    const restaurantOrdersData = [];

    for (const rId of Object.keys(itemsByRestaurant)) {
      const restaurant = await Restaurant.findById(rId);
      if (!restaurant) {
        return res.status(404).json({ message: `Restaurant not found for ID ${rId}` });
      }

      let subtotal = 0;
      const orderItems = [];

      for (const item of itemsByRestaurant[rId]) {
        const dbMenuItem = await MenuItem.findById(item.menuItem);
        if (!dbMenuItem || dbMenuItem.restaurant.toString() !== rId) {
          return res.status(400).json({ message: `Menu item ${item.name || item.menuItem} not found in this restaurant` });
        }
        subtotal += dbMenuItem.price * item.qty;
        orderItems.push({
          menuItem: dbMenuItem._id,
          name: dbMenuItem.name,
          qty: item.qty,
          price: dbMenuItem.price
        });
      }

      totalSubtotal += subtotal;
      restaurantOrdersData.push({
        restaurantId: rId,
        orderItems,
        subtotal
      });
    }

    // Grand calculations matching frontend
    const deliveryFee = totalSubtotal > 500 ? 0 : 40;
    const gst = Math.round(totalSubtotal * 0.05);
    const discountVal = discount || 0;
    const grandTotal = Math.max(0, totalSubtotal + deliveryFee + gst - discountVal);

    // Create the Razorpay order (single transaction for the grand total)
    const fakeOrderId = `order_sim_${crypto.randomBytes(8).toString('hex')}`;
    let razorpayOrderId = fakeOrderId;
    let isSimulated = true;

    if (hasRazorpayKeys && !simulatePayment) {
      const options = {
        amount: Math.round(grandTotal * 100), // in paise
        currency: 'INR',
        receipt: `receipt_bulk_${Date.now()}`
      };
      try {
        const razorpayOrder = await razorpay.orders.create(options);
        razorpayOrderId = razorpayOrder.id;
        isSimulated = false;
      } catch (err) {
        console.error('Razorpay order creation error:', err);
        return res.status(500).json({ message: 'Razorpay order creation failed, try Simulation Mode' });
      }
    }

    // Save individual Order documents in MongoDB
    const savedOrderIds = [];
    for (const rData of restaurantOrdersData) {
      // Allocate taxes, delivery fee, and discounts proportionally based on subtotal ratio
      const ratio = totalSubtotal > 0 ? (rData.subtotal / totalSubtotal) : 0;
      const orderTotal = Math.round(rData.subtotal + (deliveryFee * ratio) + (gst * ratio) - (discountVal * ratio));

      const order = new Order({
        customer: req.user._id,
        restaurant: rData.restaurantId,
        items: rData.orderItems,
        totalAmount: Math.max(0, orderTotal),
        status: 'Placed',
        paymentStatus: 'Pending',
        deliveryAddress,
        razorpayOrderId
      });

      const savedOrder = await order.save();
      savedOrderIds.push(savedOrder._id);
    }

    return res.status(201).json({
      orderId: savedOrderIds[0], // for backward compatibility
      orderIds: savedOrderIds,
      totalAmount: grandTotal,
      razorpayOrderId,
      isSimulated,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error, failed to create order' });
  }
};

// @desc    Verify payment and confirm order
// @route   POST /api/payment/verify
// @access  Private (Customer)
export const verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, isSimulated } = req.body;

    const orders = await Order.find({ razorpayOrderId });
    if (orders.length === 0) {
      return res.status(404).json({ message: 'No orders found matching this transaction' });
    }

    if (isSimulated) {
      for (const order of orders) {
        order.paymentStatus = 'Paid';
        order.razorpayPaymentId = razorpayPaymentId || `pay_sim_${crypto.randomBytes(8).toString('hex')}`;
        await order.save();
        emitRealtimeUpdates(req, order);
      }
      return res.json({ success: true, message: 'Payment verified (simulated)' });
    }

    if (!hasRazorpayKeys) {
      return res.status(400).json({ message: 'Razorpay keys not configured on server, cannot verify real signatures' });
    }

    // Verify signature
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== razorpaySignature) {
      for (const order of orders) {
        order.paymentStatus = 'Failed';
        await order.save();
      }
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    for (const order of orders) {
      order.paymentStatus = 'Paid';
      order.razorpayPaymentId = razorpayPaymentId;
      await order.save();
      emitRealtimeUpdates(req, order);
    }

    res.json({ success: true, message: 'Payment verified successfully' });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: 'Server error, payment verification failed' });
  }
};

// Helper for socket events when order is placed and confirmed paid
const emitRealtimeUpdates = async (req, order) => {
  const io = req.app.get('socketio');
  if (io) {
    try {
      const populatedOrder = await Order.findById(order._id)
        .populate('customer', 'name email')
        .populate('restaurant', 'name address owner');

      // Send to Super Admin room
      io.to('admin_room').emit('new_order', populatedOrder);

      // Send to Restaurant owner room
      if (populatedOrder.restaurant) {
        const restRoom = `restaurant_${populatedOrder.restaurant._id}`;
        io.to(restRoom).emit('new_order', populatedOrder);
      }
    } catch (err) {
      console.error('Socket notification emit failed:', err);
    }
  }
};

// @desc    Get customer's orders history
// @route   GET /api/orders/my-orders
// @access  Private (Customer)
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate('restaurant', 'name image address')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({ message: 'Server error, failed to fetch orders' });
  }
};

// @desc    Get restaurant's orders
// @route   GET /api/orders/restaurant/:restaurantId
// @access  Private (Restaurant Admin)
export const getRestaurantOrders = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Verify ownership
    if (restaurant.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to access these orders' });
    }

    const orders = await Order.find({ restaurant: restaurant._id })
      .populate('customer', 'name email')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Get restaurant orders error:', error);
    res.status(500).json({ message: 'Server error, failed to fetch orders' });
  }
};

// @desc    Get all orders across platform (with filters)
// @route   GET /api/orders
// @access  Private (Super Admin Only)
export const getAllOrders = async (req, res) => {
  try {
    const { restaurant, status, paymentStatus, startDate, endDate } = req.query;
    const filter = {};

    if (restaurant) {
      filter.restaurant = restaurant;
    }
    if (status) {
      filter.status = status;
    }
    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    const orders = await Order.find(filter)
      .populate('customer', 'name email')
      .populate('restaurant', 'name')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Server error, failed to fetch orders' });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Restaurant Owner / Super Admin)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Placed', 'Accepted', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid order status value' });
    }

    const order = await Order.findById(req.params.id)
      .populate('restaurant')
      .populate('customer', 'name email');
      
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check authorization: must be either the restaurant owner OR a super admin
    if (req.user.role !== 'admin' && order.restaurant.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to change status of this order' });
    }

    order.status = status;
    order.statusHistory.push({ status, timestamp: new Date() });
    
    // Auto mark payment status as Paid if Delivered (for cash cases, or fallback safety)
    if (status === 'Delivered') {
      order.paymentStatus = 'Paid';
    }

    const updatedOrder = await order.save();

    // Trigger real-time updates through Socket.io
    const io = req.app.get('socketio');
    if (io) {
      // Emit to customer tracking room
      const customerRoom = `order_${order._id}`;
      io.to(customerRoom).emit('order_status_update', updatedOrder);

      // Emit to admin room
      io.to('admin_room').emit('order_status_update', updatedOrder);

      // Emit to restaurant owner room
      const restRoom = `restaurant_${order.restaurant._id}`;
      io.to(restRoom).emit('order_status_update', updatedOrder);
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error, failed to update order status' });
  }
};

// @desc    Get Platform-Wide Dashboard Stats & Analytics
// @route   GET /api/admin/dashboard-stats
// @access  Private (Super Admin Only)
export const getDashboardStats = async (req, res) => {
  try {
    // Total orders count
    const totalOrders = await Order.countDocuments();

    // Total active customers
    const totalCustomers = await User.countDocuments({ role: 'customer' });

    // Total restaurants
    const totalRestaurants = await Restaurant.countDocuments();
    const approvedRestaurants = await Restaurant.countDocuments({ isApproved: true });

    // Revenue calculations (only from Paid orders)
    const revenueAgg = await Order.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

    // Daily Orders and Revenue aggregation (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyStats = await Order.aggregate([
      { 
        $match: { 
          createdAt: { $gte: sevenDaysAgo },
          paymentStatus: 'Paid'
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          ordersCount: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Top Restaurants by sales
    const topRestaurants = await Order.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      {
        $group: {
          _id: '$restaurant',
          revenue: { $sum: '$totalAmount' },
          ordersCount: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'restaurants',
          localField: '_id',
          foreignField: '_id',
          as: 'restaurantDetails'
        }
      },
      { $unwind: '$restaurantDetails' },
      {
        $project: {
          name: '$restaurantDetails.name',
          revenue: 1,
          ordersCount: 1
        }
      }
    ]);

    // Top dishes sold
    const topDishes = await Order.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.menuItem',
          name: { $first: '$items.name' },
          quantity: { $sum: '$items.qty' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } }
        }
      },
      { $sort: { quantity: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      summary: {
        totalOrders,
        totalCustomers,
        totalRestaurants,
        approvedRestaurants,
        totalRevenue
      },
      dailyStats,
      topRestaurants,
      topDishes
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error, failed to retrieve dashboard metrics' });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email')
      .populate('restaurant', 'name address owner');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const isCustomer = order.customer._id.toString() === req.user._id.toString();
    const isOwner = order.restaurant.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({ message: 'Server error, failed to fetch order details' });
  }
};
