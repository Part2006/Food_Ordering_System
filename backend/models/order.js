import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  name: { type: String, required: true }, // cache name at order time
  qty: { type: Number, required: true },
  price: { type: Number, required: true }
});

const statusHistorySchema = new mongoose.Schema({
  status: { 
    type: String, 
    enum: ['Placed', 'Accepted', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'],
    required: true
  },
  timestamp: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Placed', 'Accepted', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Placed'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Pending'
  },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  deliveryAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true }
  },
  statusHistory: [statusHistorySchema]
}, {
  timestamps: true
});

// Auto-push the first status history log on save if not present
orderSchema.pre('save', function(next) {
  if (this.statusHistory.length === 0) {
    this.statusHistory.push({ status: this.status, timestamp: this.createdAt || new Date() });
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
