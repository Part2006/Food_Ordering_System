import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  address: { type: String, required: true },
  cuisine: { type: [String], required: true },
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  isApproved: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  deliveryRadius: { type: Number, default: 5 }, // in km
  timing: {
    open: { type: String, default: '09:00 AM' },
    close: { type: String, default: '10:00 PM' }
  },
  image: { type: String, default: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80' }
}, {
  timestamps: true
});

const Restaurant = mongoose.model('Restaurant', restaurantSchema);
export default Restaurant;
