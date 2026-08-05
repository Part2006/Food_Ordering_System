import Review from '../models/review.js';
import Restaurant from '../models/restaurant.js';

// @desc    Create a new restaurant review
// @route   POST /api/reviews
// @access  Private (Customer)
export const createReview = async (req, res) => {
  try {
    const { restaurantId, rating, comment, menuItemId } = req.body;

    if (!restaurantId || !rating || !comment) {
      return res.status(400).json({ message: 'Please provide restaurant, rating, and comment' });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const review = new Review({
      customer: req.user._id,
      restaurant: restaurantId,
      menuItem: menuItemId || null,
      rating: parseInt(rating),
      comment
    });

    const savedReview = await review.save();

    // Recalculate average rating for this restaurant
    const reviews = await Review.find({ restaurant: restaurantId });
    const numReviews = reviews.length;
    const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / numReviews;

    restaurant.rating = parseFloat(avgRating.toFixed(1));
    restaurant.numReviews = numReviews;
    await restaurant.save();

    res.status(201).json(savedReview);
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Server error, failed to submit review' });
  }
};

// @desc    Get all reviews for a restaurant
// @route   GET /api/reviews/restaurant/:restaurantId
// @access  Public
export const getRestaurantReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ restaurant: req.params.restaurantId })
      .populate('customer', 'name')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Server error, failed to fetch reviews' });
  }
};
