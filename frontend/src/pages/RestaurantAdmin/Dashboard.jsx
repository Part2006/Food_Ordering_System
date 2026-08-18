import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { 
  TrendingUp, 
  ShoppingBag, 
  Star, 
  MapPin, 
  Clock, 
  DollarSign, 
  Settings,
  Save,
  Loader2 
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [restaurant, setRestaurant] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Profile settings forms
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [deliveryRadius, setDeliveryRadius] = useState(5);
  const [openTime, setOpenTime] = useState('09:00 AM');
  const [closeTime, setCloseTime] = useState('10:00 PM');
  const [image, setImage] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // 1. Fetch restaurant
      const restRes = await axios.get(`${API_URL}/restaurants/my-restaurant`);
      const rest = restRes.data.restaurant;
      setRestaurant(rest);
      
      // Seed form states
      setName(rest.name);
      setAddress(rest.address);
      setCuisine(rest.cuisine.join(', '));
      setDeliveryRadius(rest.deliveryRadius);
      setOpenTime(rest.timing?.open || '09:00 AM');
      setCloseTime(rest.timing?.close || '10:00 PM');
      setImage(rest.image || '');

      // 2. Fetch orders
      const ordersRes = await axios.get(`${API_URL}/orders/restaurant/${rest._id}`);
      setOrders(ordersRes.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load restaurant analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name || !address || !cuisine) {
      toast.error('Please fill in required fields');
      return;
    }

    setUpdatingProfile(true);
    try {
      const payload = {
        name,
        address,
        cuisine: cuisine.split(',').map(c => c.trim()),
        deliveryRadius: parseFloat(deliveryRadius),
        timing: { open: openTime, close: closeTime },
        image
      };

      const res = await axios.put(`${API_URL}/restaurants/${restaurant._id}`, payload);
      setRestaurant(res.data);
      toast.success('Restaurant profile updated!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update restaurant profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  // Calculations
  const paidOrders = orders.filter(o => o.paymentStatus === 'Paid');
  const totalSales = paidOrders.reduce((acc, o) => acc + o.totalAmount, 0);
  const activeOrdersCount = orders.filter(o => ['Placed', 'Accepted', 'Preparing', 'Out for Delivery'].includes(o.status)).length;
  
  // Aggregate sales charts data
  const getSalesChartData = () => {
    const dailyMap = {};
    
    // Default last 7 days
    for (let i = 6; i >= 0; i--) {
      const dateStr = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString([], { month: 'short', day: 'numeric' });
      dailyMap[dateStr] = 0;
    }

    paidOrders.forEach(o => {
      const dateStr = new Date(o.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' });
      if (dailyMap[dateStr] !== undefined) {
        dailyMap[dateStr] += o.totalAmount;
      }
    });

    return Object.keys(dailyMap).map(day => ({
      day,
      Sales: dailyMap[day]
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <Loader2 className="h-8 w-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  const chartData = getSalesChartData();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Welcome Banner */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">Analytics Summary</h1>
        <p className="text-sm text-gray-500 mt-1">Real-time performance details for {restaurant?.name}</p>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Sales */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex items-center space-x-4">
          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-semibold block">Total Revenue</span>
            <span className="text-2xl font-extrabold text-gray-900">₹{totalSales}</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex items-center space-x-4">
          <div className="bg-rose-50 text-brand-500 p-3 rounded-2xl">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-semibold block">Orders Count</span>
            <span className="text-2xl font-extrabold text-gray-900">{orders.length}</span>
          </div>
        </div>

        {/* Active Orders */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex items-center space-x-4">
          <div className="bg-blue-50 text-blue-500 p-3 rounded-2xl">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-semibold block">Active Orders</span>
            <span className="text-2xl font-extrabold text-gray-900">{activeOrdersCount}</span>
          </div>
        </div>

        {/* Rating */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex items-center space-x-4">
          <div className="bg-amber-50 text-amber-500 p-3 rounded-2xl">
            <Star className="h-6 w-6 fill-amber-500 text-amber-500" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-semibold block">Customer Rating</span>
            <span className="text-2xl font-extrabold text-gray-900">
              {restaurant?.rating > 0 ? `${restaurant.rating.toFixed(1)}★` : 'New'}
            </span>
          </div>
        </div>
      </div>

      {/* Charts & Profile Configs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sales Chart (2 columns span) */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-gray-900 flex items-center space-x-2 border-b border-gray-50 pb-4">
            <TrendingUp className="h-5 w-5 text-brand-500" />
            <span>Weekly Sales Trend (INR)</span>
          </h2>

          <div className="h-80 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="Sales" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Profile Settings card (1 column span) */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm h-fit">
          <h2 className="text-lg font-bold text-gray-900 flex items-center space-x-2 border-b border-gray-50 pb-4 mb-6">
            <Settings className="h-5 w-5 text-brand-500" />
            <span>Restaurant Profile</span>
          </h2>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">KITCHEN NAME</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">ADDRESS</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">CUISINES (Comma separated)</label>
              <input
                type="text"
                required
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">RADIUS (KM)</label>
                <input
                  type="number"
                  required
                  value={deliveryRadius}
                  onChange={(e) => setDeliveryRadius(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">BANNER IMAGE URL</label>
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-semibold"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">OPEN TIME</label>
                <input
                  type="text"
                  required
                  value={openTime}
                  onChange={(e) => setOpenTime(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">CLOSE TIME</label>
                <input
                  type="text"
                  required
                  value={closeTime}
                  onChange={(e) => setCloseTime(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-semibold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={updatingProfile}
              className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white py-3 rounded-xl font-bold text-xs shadow-sm flex items-center justify-center space-x-1 pt-3.5"
            >
              <Save className="h-4 w-4" />
              <span>{updatingProfile ? 'Saving Changes...' : 'Save Settings'}</span>
            </button>

          </form>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;
