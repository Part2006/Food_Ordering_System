import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  isDefault: { type: Boolean, default: false }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['customer', 'restaurant', 'admin'], 
    default: 'customer' 
  },
  isBlocked: { type: Boolean, default: false },
  addresses: [addressSchema]
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);
export default User;
