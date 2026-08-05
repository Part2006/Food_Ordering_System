import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true }, // e.g. Starters, Main Course, Desserts, Beverages
  image: { type: String, required: true },
  isAvailable: { type: Boolean, default: true },
  isVeg: { type: Boolean, default: true }, // Veg / Non-veg
  description: { type: String }
}, {
  timestamps: true
});

const MenuItem = mongoose.model('MenuItem', menuItemSchema);
export default MenuItem;
