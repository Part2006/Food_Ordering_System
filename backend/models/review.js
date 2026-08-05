import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }, // optional: rating specific dish
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true }
}, {
  timestamps: true
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;
