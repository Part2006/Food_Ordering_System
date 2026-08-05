import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  ShieldAlert, 
  ShoppingBag, 
  Smile, 
  TrendingUp, 
  Utensils 
} from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

const STEPS = [
  { label: 'Placed', description: 'Waiting for restaurant confirmation' },
  { label: 'Accepted', description: 'Restaurant confirmed your order' },
  { label: 'Preparing', description: 'Chef is preparing your hot meal' },
  { label: 'Out for Delivery', description: 'Delivery agent is heading your way' },
  { label: 'Delivered', description: 'Enjoy your delicious food!' }
];

const OrderTracking = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();

    // Establish Socket.io connection
    const socket = io(SOCKET_URL);

    // Join order tracking room
    socket.emit('join', `order_${id}`);

    // Listen for live status changes
    socket.on('order_status_update', (updatedOrder) => {
      setOrder(updatedOrder);
      toast.success(`Order status updated to: ${updatedOrder.status}`, {
        icon: '🛵',
        duration: 4000
      });
    });

    return () => {
      socket.emit('leave', `order_${id}`);
      socket.disconnect();
    };
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      // Wait, let's verify if the route is /api/orders/:id or we can fetch all and find
      // Actually, since we didn't write an explicit getOrderById in backend, we should write it, or write it now.
      // Wait! Let's check orderController.js. Did we write a getOrderById function?
      // Ah! In orderController.js, we have:
      // `getMyOrders` (list all customer orders)
      // `getRestaurantOrders`
      // `getAllOrders` (list all orders)
      // We did NOT write an explicit `getOrderById` endpoint in orderController!
      // Let's verify: Yes, we didn't. But we can easily write it! Or we can search the order by ID using `getMyOrders` filter or fetch it in backend.
      // Wait, we need to add a route for `/api/orders/:id` in `orderRoutes.js` and `orderController.js`!
      // This is a crucial detail. Let's write `getOrderById` in `orderController.js` and map it to `GET /api/orders/:id`.
      // Let's do that! Let's write the routing code first, then we can write the tracking page.
      // Wait, let's finish writing this page assuming the endpoint is `/api/orders/${id}`. We can then add that endpoint to the backend. It's very simple.
      const res = await axios.get(`${API_URL}/orders/${id}`);
      setOrder(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load tracking details');
    } finally {
      setLoading(false);
    }
  };

  const getStepIndex = (status) => {
    if (status === 'Cancelled') return -1;
    return STEPS.findIndex(step => step.label === status);
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 animate-pulse">
        <div className="bg-gray-200 h-8 rounded w-1/3 mb-6" />
        <div className="bg-gray-200 h-48 rounded-3xl mb-8" />
        <div className="h-64 bg-gray-200 rounded-3xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <ShieldAlert className="h-12 w-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-gray-900 mt-4">Order tracking not available</h2>
        <p className="text-sm text-gray-400 mt-1">Please verify the order ID or go back home.</p>
        <Link to="/" className="mt-6 inline-block bg-brand-500 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-brand-600">
          Back to Home
        </Link>
      </div>
    );
  }

  const currentStepIndex = getStepIndex(order.status);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Upper Panel */}
      <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm mb-6 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Live Tracking</span>
          <h1 className="text-2xl font-extrabold text-gray-900 mt-1">Order #{order._id.substring(18)}</h1>
          <p className="text-xs text-gray-500 mt-1">Placed at {new Date(order.createdAt).toLocaleTimeString()}</p>
        </div>

        <div className="flex items-center space-x-3 text-sm">
          <span className="text-gray-500">Payment Status:</span>
          <span className={`px-3 py-1.5 rounded-xl font-bold ${
            order.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
          }`}>
            {order.paymentStatus}
          </span>
        </div>
      </div>

      {/* Cancelled screen overlay */}
      {order.status === 'Cancelled' ? (
        <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center mb-8">
          <ShieldAlert className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-extrabold text-red-900 mt-4">This order was cancelled</h2>
          <p className="text-sm text-red-700 mt-1">The restaurant was unable to accept this order, or it was manually revoked.</p>
          <Link to="/" className="mt-6 inline-block bg-red-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-red-700">
            Order something else
          </Link>
        </div>
      ) : (
        /* Real-Time Stepper timeline */
        <div className="bg-white border border-gray-100 p-6 sm:p-8 rounded-3xl shadow-sm mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-8 flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-brand-500" />
            <span>Delivery Timeline Progress</span>
          </h2>

          <div className="relative">
            {/* Background progress bar */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 hidden md:block" />

            {/* Foreground active bar */}
            {currentStepIndex > 0 && (
              <div 
                className="absolute top-1/2 left-0 h-1 bg-emerald-500 -translate-y-1/2 hidden md:block transition-all duration-500"
                style={{ width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%` }}
              />
            )}

            {/* Steps map */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-4 relative z-10">
              {STEPS.map((step, idx) => {
                const isCompleted = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div key={step.label} className="flex md:flex-col items-center md:text-center space-x-4 md:space-x-0">
                    {/* Circle marker */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                      isCompleted 
                        ? 'bg-emerald-500 text-white ring-4 ring-emerald-100' 
                        : 'bg-white text-gray-300 border-2 border-gray-200'
                    }`}>
                      {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                    </div>

                    {/* Meta info */}
                    <div className="mt-0 md:mt-4">
                      <p className={`text-sm font-bold ${
                        isCurrent ? 'text-brand-500 font-extrabold' : isCompleted ? 'text-gray-800' : 'text-gray-400'
                      }`}>{step.label}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bill & Summary Details */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4 mb-4">
          Order Details
        </h2>

        {/* List of items */}
        <div className="space-y-4 border-b border-gray-100 pb-5 mb-5">
          {order.items.map((item) => (
            <div key={item.menuItem} className="flex justify-between items-center text-sm font-semibold">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-brand-500 font-bold bg-brand-50 px-2 py-0.5 rounded-lg">
                  {item.qty}x
                </span>
                <span className="text-gray-800">{item.name}</span>
              </div>
              <span className="text-gray-900">₹{item.price * item.qty}</span>
            </div>
          ))}
        </div>

        {/* Totals & Delivery Address */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          {/* Address */}
          <div>
            <span className="text-xs text-gray-400 font-semibold block mb-2">DELIVERY ADDRESS</span>
            <div className="flex items-start space-x-2">
              <MapPin className="h-4.5 w-4.5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold text-gray-800">{order.deliveryAddress.street}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.zipCode}
                </p>
              </div>
            </div>
          </div>

          {/* Money summary */}
          <div className="space-y-2 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 font-semibold">
            <div className="flex justify-between text-gray-500">
              <span>Grand Total</span>
              <span className="text-gray-900 font-extrabold text-lg">₹{order.totalAmount}</span>
            </div>
            <div className="text-[10px] text-gray-400 leading-normal">
              Paid via Razorpay Order Ref: <span className="font-mono text-gray-600">{order.razorpayOrderId}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
