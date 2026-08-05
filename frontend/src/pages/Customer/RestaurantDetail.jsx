import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../../context/CartContext';
import { Star, ShoppingBag, ToggleLeft, ToggleRight, Check, ShoppingCart, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api';

const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartItems, updateQty } = useContext(CartContext);

  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering & tabs
  const [activeTab, setActiveTab] = useState('menu'); // 'menu' or 'reviews'
  const [vegOnly, setVegOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetchRestaurantDetails();
    fetchRestaurantReviews();
  }, [id]);

  const fetchRestaurantDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/restaurants/${id}`);
      setRestaurant(res.data.restaurant);
      setMenu(res.data.menu);
    } catch (err) {
      console.error('Error fetching restaurant detail:', err);
      toast.error('Failed to load restaurant details');
    } finally {
      setLoading(false);
    }
  };

  const fetchRestaurantReviews = async () => {
    try {
      const res = await axios.get(`${API_URL}/reviews/restaurant/${id}`);
      setReviews(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Group categories from menu items
  const categories = ['All', ...new Set(menu.map(item => item.category))];

  // Filter menu items
  const filteredMenu = menu.filter(item => {
    const categoryMatch = selectedCategory === 'All' || item.category === selectedCategory;
    const vegMatch = !vegOnly || item.isVeg;
    return categoryMatch && vegMatch;
  });

  const getItemQtyInCart = (itemId) => {
    const item = cartItems.find(i => i.menuItem === itemId);
    return item ? item.qty : 0;
  };

  const handleAddToCart = (item) => {
    const res = addToCart(item, restaurant._id, restaurant.name);
    if (res.success) {
      toast.success(`${item.name} added to cart`);
    } else {
      // If adding item from a different restaurant, show a confirmation toast/alert
      if (window.confirm(res.message)) {
        // Clear cart first, then add item
        // CartContext doesn't expose clean & add immediately, but we can clear cart and call addToCart
        // Since we have clearCart, we can do:
        // clearCart();
        // addToCart(item, restaurant._id, restaurant.name);
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 animate-pulse">
        <div className="bg-gray-200 h-64 rounded-3xl mb-8" />
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-10" />
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex justify-between border-b pb-6">
              <div className="space-y-2 w-2/3">
                <div className="h-5 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-1/4" />
                <div className="h-4 bg-gray-200 rounded w-full" />
              </div>
              <div className="bg-gray-200 h-28 w-28 rounded-2xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-gray-900">Restaurant not found</h2>
        <button onClick={() => navigate('/')} className="mt-4 text-brand-500 font-semibold">
          Back to browsing
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24">
      {/* Restaurant Info Header */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <span className="bg-brand-50 text-brand-700 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
            {restaurant.cuisine.slice(0, 2).join(' • ')}
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-2">{restaurant.name}</h1>
          <p className="text-gray-500 mt-1 text-sm">{restaurant.address}</p>
          <div className="flex items-center space-x-6 mt-4 text-xs font-semibold text-gray-600">
            <div>
              <span className="text-gray-400">Radius: </span>
              <span className="text-gray-900 font-bold">{restaurant.deliveryRadius} km</span>
            </div>
            <div>
              <span className="text-gray-400">Hours: </span>
              <span className="text-gray-900 font-bold">{restaurant.timing?.open} - {restaurant.timing?.close}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto border-t sm:border-t-0 border-gray-100 pt-4 sm:pt-0">
          <div className="bg-emerald-50 text-emerald-800 px-3 py-2 rounded-2xl flex items-center space-x-1 shadow-sm font-extrabold">
            <Star className="h-5 w-5 fill-emerald-600 text-emerald-600" />
            <span className="text-lg leading-none mt-0.5">{restaurant.rating.toFixed(1)}</span>
          </div>
          <span className="text-[10px] text-gray-400 mt-1">{restaurant.numReviews} ratings on QuickBite</span>
        </div>
      </div>

      {/* Tabs Menu vs Reviews */}
      <div className="flex border-b border-gray-200 mt-10 space-x-8 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('menu')}
          className={`pb-4 border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === 'menu' ? 'border-brand-500 text-brand-500 font-bold' : 'border-transparent text-gray-500'
          }`}
        >
          <ShoppingCart className="h-4 w-4" />
          <span>Menu Card</span>
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`pb-4 border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === 'reviews' ? 'border-brand-500 text-brand-500 font-bold' : 'border-transparent text-gray-500'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          <span>Ratings & Reviews</span>
        </button>
      </div>

      {activeTab === 'menu' ? (
        <div className="mt-8 flex flex-col md:flex-row gap-8">
          {/* Side Categories Navigation */}
          <div className="w-full md:w-48 flex-shrink-0 md:sticky md:top-24 h-fit">
            <div className="bg-white border border-gray-100 p-4 rounded-3xl shadow-sm space-y-1">
              <span className="text-[10px] text-gray-400 font-extrabold tracking-wider uppercase block mb-3 pl-2">
                Categories
              </span>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    selectedCategory === cat 
                      ? 'bg-brand-500 text-white shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Veg only toggle */}
            <div className="bg-white border border-gray-100 p-4 rounded-3xl shadow-sm mt-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Veg Only</span>
              <button 
                onClick={() => setVegOnly(!vegOnly)}
                className="focus:outline-none text-brand-500"
              >
                {vegOnly ? <ToggleRight className="h-8 w-8" /> : <ToggleLeft className="h-8 w-8 text-gray-300" />}
              </button>
            </div>
          </div>

          {/* Menu Items Listings */}
          <div className="flex-grow space-y-6">
            {filteredMenu.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <ShoppingCart className="h-10 w-10 text-gray-300 mx-auto" />
                <h4 className="text-base font-bold text-gray-700 mt-2">No menu items found</h4>
                <p className="text-xs text-gray-400 mt-1">Try toggling off Veg Only filter.</p>
              </div>
            ) : (
              filteredMenu.map(item => {
                const qty = getItemQtyInCart(item._id);
                return (
                  <div 
                    key={item._id}
                    className={`bg-white border border-gray-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow flex justify-between gap-6 ${
                      !item.isAvailable ? 'opacity-60' : ''
                    }`}
                  >
                    {/* Item Details */}
                    <div className="flex-grow flex flex-col">
                      <div className="flex items-center space-x-2">
                        {/* Veg / Non-veg square dot tag */}
                        <div className={`w-4 h-4 border-2 flex items-center justify-center rounded-sm ${
                          item.isVeg ? 'border-emerald-600' : 'border-red-600'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            item.isVeg ? 'bg-emerald-600' : 'bg-red-600'
                          }`} />
                        </div>
                        <span className="text-[10px] text-gray-400 font-semibold">{item.category}</span>
                      </div>

                      <h3 className="text-lg font-extrabold text-gray-900 mt-2">{item.name}</h3>
                      <span className="text-base font-extrabold text-gray-900 mt-1">₹{item.price}</span>
                      <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                        {item.description || 'No description available for this dish.'}
                      </p>
                    </div>

                    {/* Item Image and Add button */}
                    <div className="relative flex-shrink-0 flex flex-col items-center">
                      <div className="w-28 h-28 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="absolute -bottom-3 w-24">
                        {!item.isAvailable ? (
                          <div className="bg-gray-100 text-gray-400 border border-gray-200 text-xs font-bold text-center py-2 rounded-xl">
                            Sold Out
                          </div>
                        ) : qty > 0 ? (
                          <div className="bg-brand-500 text-white flex items-center justify-between rounded-xl px-2 py-1.5 shadow-sm border border-brand-600">
                            <button 
                              onClick={() => updateQty(item._id, qty - 1)}
                              className="px-2 font-black text-sm hover:scale-110"
                            >
                              -
                            </button>
                            <span className="font-bold text-xs">{qty}</span>
                            <button 
                              onClick={() => updateQty(item._id, qty + 1)}
                              className="px-2 font-black text-sm hover:scale-110"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAddToCart(item)}
                            className="w-full bg-white text-brand-500 border border-gray-200 hover:border-brand-500 font-extrabold text-xs py-2 px-3 rounded-xl shadow-sm transition-all text-center hover:bg-brand-50"
                          >
                            ADD
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* Reviews tab view */
        <div className="mt-8 space-y-4 max-w-2xl">
          {reviews.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <MessageSquare className="h-10 w-10 text-gray-300 mx-auto" />
              <h4 className="text-base font-bold text-gray-700 mt-2">No reviews yet</h4>
              <p className="text-xs text-gray-400 mt-1">Be the first to order and write a review.</p>
            </div>
          ) : (
            reviews.map(rev => (
              <div key={rev._id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-gray-900">{rev.customer.name}</span>
                  <div className="bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-lg flex items-center space-x-1 text-xs font-bold">
                    <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                    <span>{rev.rating}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-3 italic leading-relaxed">
                  "{rev.comment}"
                </p>
                <div className="text-[10px] text-gray-400 mt-4 text-right">
                  {new Date(rev.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Floating cart bar on mobile/desktop if items exist */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-gray-900/95 backdrop-blur-md text-white px-5 py-4 rounded-2xl flex items-center justify-between shadow-xl animate-slideUp z-40 border border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="bg-brand-500 rounded-xl p-2.5">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-gray-400 font-semibold">{cartItems.length} items in cart</div>
              <div className="text-sm font-extrabold text-white">
                ₹{cartItems.reduce((acc, i) => acc + (i.price * i.qty), 0)}
              </div>
            </div>
          </div>

          <button 
            onClick={() => navigate('/cart')}
            className="bg-brand-500 hover:bg-brand-600 font-extrabold text-sm px-6 py-2.5 rounded-xl transition-all flex items-center space-x-1.5 shadow-md hover:scale-105 active:scale-95"
          >
            <span>View Cart</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default RestaurantDetail;
