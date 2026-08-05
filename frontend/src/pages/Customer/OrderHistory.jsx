import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../../context/CartContext';
import { Clock, MapPin, RefreshCw, ShoppingBag, ChevronRight, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addToCart, clearCart } = useContext(CartContext);

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  const fetchOrderHistory = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/orders/my-orders`);
      setOrders(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load order history');
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = async (orderItems, restaurantId, restaurantName) => {
    try {
      clearCart();
      
      // Add items sequentially
      for (const item of orderItems) {
        // Construct the item format expected by addToCart
        const mockItem = {
          _id: item.menuItem,
          name: item.name,
          price: item.price,
          isVeg: true // fallback default
        };
        // Wait, what if we have custom options? No, standard items.
        // Let's add them
        addToCart(mockItem, restaurantId, restaurantName);
      }
      
      toast.success('Items loaded back into cart!');
      navigate('/cart');
    } catch (err) {
      console.error(err);
      toast.error('Reorder failed');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-800 border-emerald-100';
      case 'Cancelled':
        return 'bg-red-50 text-red-800 border-red-100';
      case 'Placed':
        return 'bg-blue-50 text-blue-800 border-blue-100';
      default:
        return 'bg-amber-50 text-amber-800 border-amber-100';
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6" />
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white border rounded-3xl h-48" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8 flex items-center space-x-2">
        <Clock className="h-8 w-8 text-brand-500" />
        <span>My Orders History</span>
      </h1>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm max-w-md mx-auto">
          <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto" />
          <h3 className="mt-4 text-lg font-bold text-gray-900">No orders placed yet</h3>
          <p className="mt-2 text-sm text-gray-500">
            Looks like you haven't ordered any food yet. Browse your local restaurants to get started!
          </p>
          <Link to="/" className="mt-6 inline-block bg-brand-500 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-brand-600">
            Find Restaurants
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((ord) => {
            const isActiveOrder = !['Delivered', 'Cancelled'].includes(ord.status);
            
            return (
              <div 
                key={ord._id}
                className="bg-white border border-gray-100 hover:border-gray-200 transition-all rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start gap-6"
              >
                {/* Left block - Restaurant info & items list */}
                <div className="flex-grow space-y-4">
                  <div className="flex items-center space-x-4">
                    {ord.restaurant?.image && (
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
                        <img 
                          src={ord.restaurant.image} 
                          alt={ord.restaurant.name}
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 leading-tight">
                        {ord.restaurant?.name || 'Restaurant Closed'}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Placed on {new Date(ord.createdAt).toLocaleDateString()} at {new Date(ord.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  </div>

                  {/* Order items text line */}
                  <div className="text-xs text-gray-600 font-semibold bg-gray-50 p-3 rounded-2xl border border-gray-100/50">
                    <span className="text-gray-400 block mb-1">ITEMS</span>
                    <p className="truncate text-gray-800">
                      {ord.items.map(item => `${item.name} (${item.qty})`).join(', ')}
                    </p>
                  </div>
                </div>

                {/* Right block - Status, cost, reorder */}
                <div className="flex flex-col md:items-end justify-between self-stretch flex-shrink-0 min-w-[150px] border-t md:border-t-0 border-gray-50 pt-4 md:pt-0">
                  <div className="flex items-center justify-between md:justify-end md:space-x-3 w-full">
                    <span className={`text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-lg border ${getStatusColor(ord.status)}`}>
                      {ord.status}
                    </span>
                    <span className="font-extrabold text-gray-900">₹{ord.totalAmount}</span>
                  </div>

                  <div className="flex space-x-2 w-full mt-4 md:mt-0 font-bold text-xs">
                    {/* Track active orders */}
                    {isActiveOrder ? (
                      <Link 
                        to={`/order-tracking/${ord._id}`}
                        className="flex-grow text-center bg-brand-500 text-white py-2.5 px-4 rounded-xl hover:bg-brand-600 transition-colors shadow-sm flex items-center justify-center space-x-1"
                      >
                        <span>Track Live</span>
                        <ChevronRight className="h-4.5 w-4.5" />
                      </Link>
                    ) : (
                      <>
                        <Link 
                          to={`/order-tracking/${ord._id}`}
                          className="flex-grow text-center text-gray-600 border border-gray-250 py-2.5 px-3 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                          View Details
                        </Link>
                        
                        <button
                          onClick={() => handleReorder(ord.items, ord.restaurant?._id, ord.restaurant?.name)}
                          className="flex-grow text-center bg-brand-50 hover:bg-brand-100 text-brand-700 py-2.5 px-3 rounded-xl transition-all flex items-center justify-center space-x-1"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          <span>Reorder</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
