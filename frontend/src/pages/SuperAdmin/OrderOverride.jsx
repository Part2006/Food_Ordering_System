import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { 
  Search, 
  Download, 
  Calendar, 
  AlertCircle, 
  ArrowUpDown, 
  Eye, 
  RefreshCw, 
  TrendingUp, 
  Layers 
} from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

const OrderOverride = () => {
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Active modal details
  const [activeOrderDetails, setActiveOrderDetails] = useState(null);

  useEffect(() => {
    fetchRestaurantsList();
    fetchOrdersList();

    // Setup real-time updates via global socket room
    const socket = io(SOCKET_URL);
    socket.emit('join', 'admin_room');

    socket.on('new_order', (newOrder) => {
      setOrders(prev => {
        if (prev.some(o => o._id === newOrder._id)) return prev;
        return [newOrder, ...prev];
      });
    });

    socket.on('order_status_update', (updatedOrder) => {
      setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
      // Update modal if currently viewing this order
      setActiveOrderDetails(prev => {
        if (prev && prev._id === updatedOrder._id) return updatedOrder;
        return prev;
      });
    });

    return () => {
      socket.emit('leave', 'admin_room');
      socket.disconnect();
    };
  }, [selectedRestaurant, selectedStatus, selectedPaymentStatus, startDate, endDate]);

  const fetchRestaurantsList = async () => {
    try {
      const res = await axios.get(`${API_URL}/restaurants?showAll=true`);
      setRestaurants(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOrdersList = async () => {
    try {
      setLoading(true);
      let query = `${API_URL}/orders?`;
      if (selectedRestaurant) query += `restaurant=${selectedRestaurant}&`;
      if (selectedStatus) query += `status=${selectedStatus}&`;
      if (selectedPaymentStatus) query += `paymentStatus=${selectedPaymentStatus}&`;
      if (startDate) query += `startDate=${startDate}&`;
      if (endDate) query += `endDate=${endDate}&`;

      const res = await axios.get(query);
      setOrders(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load transaction logs');
    } finally {
      setLoading(false);
    }
  };

  const handleOverrideStatus = async (orderId, newStatus) => {
    try {
      const res = await axios.put(`${API_URL}/orders/${orderId}/status`, { status: newStatus });
      setOrders(prev => prev.map(o => o._id === orderId ? res.data : o));
      toast.success(`Override applied successfully. Order set to ${newStatus}`);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Override failed');
    }
  };

  const exportToCSV = () => {
    if (orders.length === 0) {
      toast.error('No transactions available to export');
      return;
    }

    const headers = ['Order ID', 'Customer Name', 'Customer Email', 'Restaurant', 'Items', 'Total Amount (INR)', 'Payment Status', 'Delivery Status', 'Timestamp'];
    const rows = orders.map(ord => [
      ord._id,
      ord.customer?.name || 'N/A',
      ord.customer?.email || 'N/A',
      ord.restaurant?.name || 'N/A',
      ord.items.map(i => `${i.name} (${i.qty})`).join('; '),
      ord.totalAmount,
      ord.paymentStatus,
      ord.status,
      new Date(ord.createdAt).toLocaleString()
    ]);

    let csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `platform_orders_export_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV file downloaded!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Platform Orders Override</h1>
          <p className="text-sm text-gray-500 mt-1">Override transaction states and extract spreadsheet logs.</p>
        </div>

        <button
          onClick={exportToCSV}
          className="bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs py-3 px-5 rounded-xl shadow-sm flex items-center space-x-1.5"
        >
          <Download className="h-4 w-4" />
          <span>Export as CSV</span>
        </button>
      </div>

      {/* Filters bar */}
      <div className="bg-white border border-gray-100 p-5 rounded-3xl shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {/* Restaurant select */}
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Kitchen Filter</label>
          <select
            value={selectedRestaurant}
            onChange={(e) => setSelectedRestaurant(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold bg-white focus:outline-none"
          >
            <option value="">All Restaurants</option>
            {restaurants.map(r => (
              <option key={r._id} value={r._id}>{r.name}</option>
            ))}
          </select>
        </div>

        {/* Status select */}
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Delivery Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold bg-white focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="Placed">Placed</option>
            <option value="Accepted">Accepted</option>
            <option value="Preparing">Preparing</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* Payment Status select */}
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Payment Status</label>
          <select
            value={selectedPaymentStatus}
            onChange={(e) => setSelectedPaymentStatus(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold bg-white focus:outline-none"
          >
            <option value="">All Payments</option>
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
            <option value="Failed">Failed</option>
          </select>
        </div>

        {/* Start date */}
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">From Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold bg-white focus:outline-none"
          />
        </div>

        {/* End date */}
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">To Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <RefreshCw className="h-6 w-6 text-brand-500 animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 text-sm text-gray-400">
            No transactions match current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-left text-xs font-semibold text-gray-600">
              <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-150">
                <tr>
                  <th className="py-4 px-6">Order ID</th>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Kitchen</th>
                  <th className="py-4 px-6">Total Amount</th>
                  <th className="py-4 px-6">Payment</th>
                  <th className="py-4 px-6">Delivery Status</th>
                  <th className="py-4 px-6">Timestamp</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700 bg-white">
                {orders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-gray-50/50">
                    <td className="py-4 px-6 font-mono text-gray-900">#{ord._id.substring(18)}</td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span>{ord.customer?.name || 'Deleted'}</span>
                        <span className="text-[10px] text-gray-400 mt-0.5">{ord.customer?.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">{ord.restaurant?.name || 'Closed'}</td>
                    <td className="py-4 px-6 font-bold text-gray-900">₹{ord.totalAmount}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase ${
                        ord.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
                      }`}>
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <select
                        value={ord.status}
                        onChange={(e) => handleOverrideStatus(ord._id, e.target.value)}
                        className={`px-2 py-1.5 border border-gray-250 rounded-xl text-[10px] font-bold bg-white focus:outline-none cursor-pointer ${
                          ord.status === 'Delivered' ? 'text-emerald-700' : ord.status === 'Cancelled' ? 'text-red-700' : 'text-amber-700'
                        }`}
                      >
                        <option value="Placed">Placed</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Preparing">Preparing</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-4 px-6 text-gray-400 text-[10px]">
                      {new Date(ord.createdAt).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setActiveOrderDetails(ord)}
                        className="p-1.5 text-gray-400 hover:text-brand-500 rounded-lg hover:bg-gray-50 inline-flex items-center space-x-1"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspect Order Details Modal */}
      {activeOrderDetails && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-gray-50 pb-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Order ID: #{activeOrderDetails._id}</h3>
                <p className="text-xs text-gray-400 mt-0.5">Full Transaction Log Report</p>
              </div>
              <button 
                onClick={() => setActiveOrderDetails(null)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold p-1 hover:bg-gray-50 rounded-xl"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-6 text-sm font-semibold">
              {/* Items */}
              <div>
                <span className="text-[10px] text-gray-400 font-bold block mb-2 uppercase">Order Items</span>
                <div className="space-y-2 bg-gray-50 p-3 rounded-2xl border border-gray-150">
                  {activeOrderDetails.items.map(i => (
                    <div key={i.menuItem} className="flex justify-between">
                      <span className="text-gray-800">{i.qty}x {i.name}</span>
                      <span className="text-gray-900">₹{i.price * i.qty}</span>
                    </div>
                  ))}
                  <div className="border-t border-gray-200/50 pt-2 flex justify-between font-extrabold text-gray-900">
                    <span>Total Amount</span>
                    <span>₹{activeOrderDetails.totalAmount}</span>
                  </div>
                </div>
              </div>

              {/* Delivery info */}
              <div>
                <span className="text-[10px] text-gray-400 font-bold block mb-2 uppercase">Shipping Address</span>
                <p className="text-gray-800">{activeOrderDetails.deliveryAddress.street}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {activeOrderDetails.deliveryAddress.city}, {activeOrderDetails.deliveryAddress.state} - {activeOrderDetails.deliveryAddress.zipCode}
                </p>
              </div>

              {/* Razorpay logs */}
              <div>
                <span className="text-[10px] text-gray-400 font-bold block mb-2 uppercase">Payment Integration Details</span>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-gray-50 p-3 rounded-2xl border border-gray-150">
                  <div>
                    <span className="text-gray-400 block text-[9px]">ORDER ID</span>
                    <span className="text-gray-800">{activeOrderDetails.razorpayOrderId || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[9px]">TRANSACTION ID</span>
                    <span className="text-gray-800">{activeOrderDetails.razorpayPaymentId || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Status History Stepper logs */}
              <div>
                <span className="text-[10px] text-gray-400 font-bold block mb-2 uppercase">Logs Audit history</span>
                <div className="space-y-2 pl-2 border-l border-gray-200">
                  {activeOrderDetails.statusHistory?.map((hist, idx) => (
                    <div key={idx} className="flex items-center space-x-2 text-xs">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                      <span className="text-gray-800">{hist.status}</span>
                      <span className="text-gray-400 text-[10px]">— {new Date(hist.timestamp).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default OrderOverride;
