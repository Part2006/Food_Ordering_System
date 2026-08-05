import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { AuthContext } from '../../context/AuthContext';
import { ClipboardCheck, CheckCircle2, XCircle, Clock, MapPin, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

const OrdersList = () => {
  const { user } = useContext(AuthContext);
  const [restaurant, setRestaurant] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restaurantLoading, setRestaurantLoading] = useState(true);

  useEffect(() => {
    fetchMyRestaurant();
  }, []);

  useEffect(() => {
    if (restaurant) {
      fetchRestaurantOrders();

      // Establish Socket connection
      const socket = io(SOCKET_URL);
      const restRoom = `restaurant_${restaurant._id}`;
      socket.emit('join', restRoom);

      // Listen for incoming new orders
      socket.on('new_order', (newOrder) => {
        // Prepend to top of list if it is not already in the list
        setOrders(prev => {
          if (prev.some(o => o._id === newOrder._id)) return prev;
          return [newOrder, ...prev];
        });
        toast.success(`NEW ORDER RECEIVED! Order ID: #${newOrder._id.substring(18)}`, {
          icon: '🍕',
          duration: 6000
        });
        playNotificationSound();
      });

      // Listen for status updates
      socket.on('order_status_update', (updatedOrder) => {
        setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
      });

      return () => {
        socket.emit('leave', restRoom);
        socket.disconnect();
      };
    }
  }, [restaurant]);

  const playNotificationSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880.00, audioCtx.currentTime + 0.15); // A5
      
      gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.4);
    } catch (e) {
      console.warn('Audio play blocked or failed:', e);
    }
  };

  const fetchMyRestaurant = async () => {
    try {
      setRestaurantLoading(true);
      const res = await axios.get(`${API_URL}/restaurants/my-restaurant`);
      setRestaurant(res.data.restaurant);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load restaurant profile. Ensure profile is created.');
    } finally {
      setRestaurantLoading(false);
    }
  };

  const fetchRestaurantOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/orders/restaurant/${restaurant._id}`);
      setOrders(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch restaurant orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await axios.put(`${API_URL}/orders/${orderId}/status`, { status: newStatus });
      // Update local state
      setOrders(prev => prev.map(o => o._id === orderId ? res.data : o));
      toast.success(`Order set to ${newStatus}`);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update order status');
    }
  };

  // Group orders by action types
  const pendingOrders = orders.filter(o => o.status === 'Placed');
  const activeOrders = orders.filter(o => ['Accepted', 'Preparing', 'Out for Delivery'].includes(o.status));
  const completedOrders = orders.filter(o => ['Delivered', 'Cancelled'].includes(o.status));

  if (restaurantLoading) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <Loader2 className="h-8 w-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <ClipboardCheck className="h-12 w-12 text-gray-300 mx-auto" />
        <h2 className="text-xl font-bold text-gray-900 mt-4">Create your restaurant profile</h2>
        <p className="text-sm text-gray-500 mt-1">
          To start accepting orders, you must create your kitchen profile details.
        </p>
        {/* We can links to a profile page or auto create a dummy one for demonstration.
            We will provide a dummy register trigger or simple form if needed, but let's assume
            the owner registration seed script handles restaurant creation automatically! */}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Restaurant Header */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm mb-8 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <span className="text-[10px] text-emerald-600 font-extrabold uppercase bg-emerald-50 px-2 py-0.5 rounded-md">
            Kitchen Active
          </span>
          <h1 className="text-2xl font-extrabold text-gray-900 mt-1">{restaurant.name} Dashboard</h1>
          <p className="text-xs text-gray-400 mt-0.5">{restaurant.address}</p>
        </div>

        <div className="flex items-center space-x-6 text-sm">
          <div>
            <span className="text-gray-400">Approved status:</span>
            <span className={`ml-2 px-2.5 py-1 rounded-xl text-xs font-bold ${
              restaurant.isApproved ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
            }`}>
              {restaurant.isApproved ? 'Approved' : 'Pending Approval'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Incoming vs Active/Completed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Column 1 - Incoming Placed Orders (Requires immediate Accept/Reject) */}
        <div className="bg-rose-50/50 border border-rose-100 rounded-3xl p-6 shadow-sm h-fit space-y-6">
          <h2 className="text-lg font-extrabold text-rose-900 flex items-center space-x-2">
            <Clock className="h-5 w-5 text-rose-500 animate-pulse" />
            <span>New Orders ({pendingOrders.length})</span>
          </h2>

          {pendingOrders.length === 0 ? (
            <div className="text-center py-10 text-sm font-semibold text-rose-600">
              No new orders pending
            </div>
          ) : (
            <div className="space-y-4">
              {pendingOrders.map(ord => (
                <div key={ord._id} className="bg-white border border-rose-100 rounded-2xl p-4 shadow-sm space-y-4">
                  <div className="flex justify-between items-start border-b border-gray-50 pb-2">
                    <div>
                      <p className="text-xs font-bold text-gray-900">#ID: {ord._id.substring(18)}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Placed by {ord.customer?.name}</p>
                    </div>
                    <span className="font-extrabold text-sm text-gray-900">₹{ord.totalAmount}</span>
                  </div>

                  <div className="space-y-1">
                    {ord.items.map(i => (
                      <p key={i.menuItem} className="text-xs text-gray-700 font-semibold">
                        {i.qty}x {i.name}
                      </p>
                    ))}
                  </div>

                  <div className="text-[10px] text-gray-500 flex items-start space-x-1">
                    <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span>{ord.deliveryAddress.street}, {ord.deliveryAddress.city}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-bold pt-2 border-t border-gray-50">
                    <button
                      onClick={() => handleUpdateStatus(ord._id, 'Cancelled')}
                      className="bg-red-50 hover:bg-red-100 text-red-700 py-2 rounded-xl text-center"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(ord._id, 'Accepted')}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-xl text-center shadow-sm"
                    >
                      Accept
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Columns 2 & 3 - Active cooking queue vs Completed history */}
        <div className="lg:col-span-2 space-y-8">
          {/* Active Orders Queue */}
          <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center space-x-2 border-b border-gray-50 pb-4">
              <span>Cooking & Delivery Queue ({activeOrders.length})</span>
            </h2>

            {loading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-6 w-6 text-brand-500 animate-spin" />
              </div>
            ) : activeOrders.length === 0 ? (
              <div className="text-center py-10 text-sm text-gray-400">
                No orders currently in preparation
              </div>
            ) : (
              <div className="space-y-4">
                {activeOrders.map(ord => (
                  <div key={ord._id} className="border border-gray-100 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <span className="font-extrabold text-sm text-gray-900">#ID: {ord._id.substring(18)}</span>
                        <span className={`px-2 py-0.5 rounded-lg text-[9px] uppercase font-extrabold bg-amber-50 text-amber-800`}>
                          {ord.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 font-semibold">
                        {ord.items.map(i => `${i.qty}x ${i.name}`).join(', ')}
                      </div>
                      <div className="text-[10px] text-gray-400 flex items-center space-x-1">
                        <MapPin className="h-3.5 w-3.5 text-gray-400" />
                        <span>{ord.deliveryAddress.street}</span>
                      </div>
                    </div>

                    {/* Step button actions */}
                    <div className="w-full md:w-auto text-xs font-bold border-t md:border-t-0 border-gray-50 pt-3 md:pt-0">
                      {ord.status === 'Accepted' && (
                        <button
                          onClick={() => handleUpdateStatus(ord._id, 'Preparing')}
                          className="w-full md:w-auto bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-xl flex items-center justify-center space-x-1 shadow-sm"
                        >
                          <span>Start Cooking</span>
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      )}
                      {ord.status === 'Preparing' && (
                        <button
                          onClick={() => handleUpdateStatus(ord._id, 'Out for Delivery')}
                          className="w-full md:w-auto bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-xl flex items-center justify-center space-x-1 shadow-sm"
                        >
                          <span>Assign to Delivery</span>
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      )}
                      {ord.status === 'Out for Delivery' && (
                        <button
                          onClick={() => handleUpdateStatus(ord._id, 'Delivered')}
                          className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl flex items-center justify-center space-x-1 shadow-sm"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Mark Delivered</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past Completed / Cancelled Orders */}
          <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center space-x-2 border-b border-gray-50 pb-4">
              <span>Past Orders History ({completedOrders.length})</span>
            </h2>

            {completedOrders.length === 0 ? (
              <div className="text-center py-6 text-sm text-gray-400">
                No orders archived today
              </div>
            ) : (
              <div className="max-h-[300px] overflow-y-auto space-y-3.5 pr-2">
                {completedOrders.map(ord => (
                  <div key={ord._id} className="flex justify-between items-center text-xs border-b border-gray-50 pb-3 last:border-0 last:pb-0 font-semibold">
                    <div>
                      <p className="font-bold text-gray-800">#ID: {ord._id.substring(18)}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {ord.items.map(i => `${i.qty}x ${i.name}`).join(', ')}
                      </p>
                    </div>

                    <div className="flex items-center space-x-4">
                      <span className="font-bold text-gray-900">₹{ord.totalAmount}</span>
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] uppercase font-extrabold ${
                        ord.status === 'Delivered' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
                      }`}>
                        {ord.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default OrdersList;
