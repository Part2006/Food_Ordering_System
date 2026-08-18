import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Utensils, 
  DollarSign, 
  Star,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';
const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liveOrdersCount, setLiveOrdersCount] = useState(0);

  useEffect(() => {
    fetchStats();

    // Establish Socket.io connection to listen for global admin transactions
    const socket = io(SOCKET_URL);
    socket.emit('join', 'admin_room');

    socket.on('new_order', (order) => {
      // Increase live transaction count
      setLiveOrdersCount(prev => prev + 1);
      
      // Update statistics summary on incoming order
      setStats(prev => {
        if (!prev) return null;
        return {
          ...prev,
          summary: {
            ...prev.summary,
            totalOrders: prev.summary.totalOrders + 1
          }
        };
      });

      toast(`New platform transaction placed! Amt: ₹${order.totalAmount}`, {
        icon: '🔔',
        style: {
          borderRadius: '16px',
          background: '#18181b',
          color: '#fff',
        },
        duration: 5000
      });
    });

    return () => {
      socket.emit('leave', 'admin_room');
      socket.disconnect();
    };
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/admin/dashboard-stats`);
      setStats(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load platform analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <Loader2 className="h-8 w-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  const { summary, dailyStats, topRestaurants, topDishes } = stats;

  // Format Recharts dailyStats data
  const chartData = dailyStats.map(stat => ({
    day: stat._id,
    Orders: stat.ordersCount,
    Revenue: stat.revenue
  }));

  const COLORS = ['#f43f5e', '#be123c', '#9f1239', '#fb7185', '#fda4af'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center space-x-2">
            <ShieldCheck className="h-8 w-8 text-brand-500" />
            <span>Super Admin Central Hub</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">Platform-wide statistics, active kitchen approvals, and order tracking overrides.</p>
        </div>

        {/* Live transaction indicator */}
        <div className="flex items-center space-x-2 bg-rose-50 border border-rose-100 px-4 py-2 rounded-2xl text-xs font-bold text-brand-700 animate-pulse">
          <Activity className="h-4 w-4 text-brand-500" />
          <span>{liveOrdersCount} Transactions Live This Session</span>
        </div>
      </div>

      {/* Pending Kitchen Approvals Alert Banner */}
      {summary.totalRestaurants - summary.approvedRestaurants > 0 && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-3xl p-6 text-white shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg">Pending Kitchen Approvals</h3>
              <p className="text-xs text-amber-100 mt-0.5">
                You have {summary.totalRestaurants - summary.approvedRestaurants} restaurant application(s) waiting for your review.
              </p>
            </div>
          </div>
          <Link 
            to="/admin/restaurants" 
            className="bg-white text-gray-900 font-extrabold text-xs px-5 py-3 rounded-2xl shadow-sm hover:bg-amber-50 transition-colors"
          >
            Review & Approve Kitchens →
          </Link>
        </div>
      )}

      {/* Summary stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Revenue */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex items-center space-x-4">
          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-semibold block">Total Revenue</span>
            <span className="text-2xl font-extrabold text-gray-900">₹{summary.totalRevenue}</span>
          </div>
        </div>

        {/* Orders */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex items-center space-x-4">
          <div className="bg-rose-50 text-brand-500 p-3 rounded-2xl">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-semibold block">Total Orders</span>
            <span className="text-2xl font-extrabold text-gray-900">{summary.totalOrders}</span>
          </div>
        </div>

        {/* Customers */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex items-center space-x-4">
          <div className="bg-blue-50 text-blue-500 p-3 rounded-2xl">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-semibold block">Total Customers</span>
            <span className="text-2xl font-extrabold text-gray-900">{summary.totalCustomers}</span>
          </div>
        </div>

        {/* Total Kitchens */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex items-center space-x-4">
          <div className="bg-purple-50 text-purple-500 p-3 rounded-2xl">
            <Utensils className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-semibold block">Total Kitchens</span>
            <span className="text-2xl font-extrabold text-gray-900">{summary.totalRestaurants}</span>
          </div>
        </div>

        {/* Pending approvals */}
        <Link 
          to="/admin/restaurants" 
          className="bg-white border border-amber-200 hover:border-amber-400 rounded-3xl p-6 shadow-sm flex items-center space-x-4 transition-all group"
        >
          <div className="bg-amber-50 text-amber-500 group-hover:bg-amber-500 group-hover:text-white p-3 rounded-2xl transition-colors">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-amber-600 font-bold block">Approved / Pending</span>
            <span className="text-xl font-extrabold text-gray-900">
              {summary.approvedRestaurants} / {summary.totalRestaurants}
            </span>
          </div>
        </Link>
      </div>

      {/* Main Charts area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Revenue/Orders over time Area chart (2 cols span) */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-gray-900 flex items-center space-x-2 border-b border-gray-50 pb-4">
            <TrendingUp className="h-5 w-5 text-brand-500" />
            <span>Platform Revenue & Order Sales Trends</span>
          </h2>

          <div className="h-80 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" tickLine={false} axisLine={false} />
                <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} />
                <Tooltip />
                <Area yAxisId="left" type="monotone" dataKey="Revenue" name="Revenue (INR)" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                <Area yAxisId="right" type="monotone" dataKey="Orders" name="Orders Count" stroke="#3b82f6" strokeWidth={2} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Restaurants chart (1 col span) */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4 mb-6">
              Top Cuisineries by Income
            </h2>
            
            {topRestaurants.length === 0 ? (
              <div className="text-center py-10 text-xs text-gray-400">
                No revenue logged yet.
              </div>
            ) : (
              <div className="space-y-4">
                {topRestaurants.map((rest, index) => (
                  <div key={rest.name} className="flex items-center justify-between font-semibold text-sm">
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-lg text-xs font-bold text-gray-500">
                        {index + 1}
                      </span>
                      <span className="text-gray-800 truncate max-w-[120px]">{rest.name}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-gray-900 font-extrabold">₹{rest.revenue}</span>
                      <span className="text-[10px] text-gray-400 mt-0.5">{rest.ordersCount} orders</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="text-[10px] text-gray-400 mt-6 pt-4 border-t border-gray-50 leading-relaxed">
            Data aggregates from Paid transactions only.
          </div>
        </div>

      </div>

      {/* Top Dishes sold */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4 mb-6">
          Most Popular Dishes
        </h2>

        {topDishes.length === 0 ? (
          <div className="text-center py-6 text-xs text-gray-400">
            No dishes sold yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {topDishes.map((dish, index) => (
              <div key={dish.name} className="bg-gray-50 border border-gray-100 p-5 rounded-2xl flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-extrabold text-brand-500 uppercase">RANK #{index + 1}</span>
                  <h3 className="font-extrabold text-sm text-gray-900 mt-1 truncate">{dish.name}</h3>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200/50 flex justify-between items-end font-semibold">
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase">QUANTITY</span>
                    <span className="text-gray-800 text-sm">{dish.quantity} sold</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 block uppercase">SALES</span>
                    <span className="text-emerald-600 font-bold text-sm">₹{dish.revenue}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;
