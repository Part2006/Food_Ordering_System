import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Check, 
  X, 
  Search, 
  MapPin, 
  Utensils, 
  ShieldAlert, 
  RefreshCw,
  Ban,
  CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

const RestaurantApproval = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'pending', 'approved'

  useEffect(() => {
    fetchRestaurants();
  }, [filterType]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/restaurants?showAll=true`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRestaurants(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load restaurants list');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, currentApprovalState) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        `${API_URL}/restaurants/${id}/approve`, 
        { isApproved: !currentApprovalState },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRestaurants(prev => prev.map(r => r._id === id ? { ...r, isApproved: res.data.isApproved } : r));
      toast.success(res.data.isApproved ? 'Restaurant approved!' : 'Approval revoked');
    } catch (err) {
      console.error(err);
      toast.error('Operation failed');
    }
  };

  const handleToggleActive = async (id, currentActiveState) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        `${API_URL}/restaurants/${id}`, 
        { isActive: !currentActiveState },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRestaurants(prev => prev.map(r => r._id === id ? { ...r, isActive: res.data.isActive } : r));
      toast.success(res.data.isActive ? 'Restaurant unblocked' : 'Restaurant blocked/suspended');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update active state');
    }
  };

  const filteredRestaurants = restaurants.filter(r => {
    const searchMatch = r.name.toLowerCase().includes(search.toLowerCase()) || 
                        r.cuisine.join(' ').toLowerCase().includes(search.toLowerCase());
    
    if (filterType === 'pending') {
      return searchMatch && !r.isApproved;
    }
    if (filterType === 'approved') {
      return searchMatch && r.isApproved;
    }
    return searchMatch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Manage Kitchen Registrations</h1>
          <p className="text-sm text-gray-500 mt-1">Approve new restaurant applications or suspend existing ones.</p>
        </div>

        {/* Tab filters */}
        <div className="flex space-x-2 bg-gray-100 p-1 rounded-xl text-xs font-bold border border-gray-200">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterType === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType('pending')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterType === 'pending' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Pending Approval
          </button>
          <button
            onClick={() => setFilterType('approved')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterType === 'approved' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Approved
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white border border-gray-100 p-4 rounded-3xl shadow-sm flex items-center space-x-2 mb-6 max-w-md">
        <Search className="h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by restaurant name or cuisine..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="block w-full focus:outline-none text-sm font-semibold bg-white text-gray-800"
        />
      </div>

      {/* Grid of Kitchens */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <RefreshCw className="h-6 w-6 text-brand-500 animate-spin" />
        </div>
      ) : filteredRestaurants.length === 0 ? (
        <div className="text-center py-20 text-sm text-gray-400 bg-white border border-gray-100 rounded-3xl shadow-sm">
          No kitchens match selected filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRestaurants.map(r => (
            <div 
              key={r._id} 
              className={`bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between ${
                !r.isActive ? 'bg-red-50/20 border-dashed border-red-200' : ''
              }`}
            >
              {/* Restaurant info card */}
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-extrabold text-lg text-gray-900">{r.name}</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">Owner ID: {r.owner?.name || 'Deleted owner'}</p>
                  </div>
                  
                  <div className="flex space-x-2 text-[9px] uppercase font-extrabold">
                    <span className={`px-2.5 py-1 rounded-lg border ${
                      r.isApproved ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : 'bg-amber-50 text-amber-800 border-amber-100'
                    }`}>
                      {r.isApproved ? 'Approved' : 'Pending'}
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg border ${
                      r.isActive ? 'bg-blue-50 text-blue-800 border-blue-100' : 'bg-red-50 text-red-800 border-red-100'
                    }`}>
                      {r.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-gray-600 font-semibold space-y-1">
                  <div className="flex items-center space-x-1.5">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{r.address}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Utensils className="h-4 w-4 text-gray-400" />
                    <span className="truncate">{r.cuisine.join(', ')}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3 text-xs font-bold pt-6 mt-6 border-t border-gray-50">
                {/* Approve toggle */}
                <button
                  onClick={() => handleApprove(r._id, r.isApproved)}
                  className={`py-2.5 rounded-xl text-center flex items-center justify-center space-x-1 transition-colors ${
                    r.isApproved 
                      ? 'bg-amber-50 hover:bg-amber-100 text-amber-700' 
                      : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm'
                  }`}
                >
                  {r.isApproved ? (
                    <>
                      <X className="h-4 w-4" />
                      <span>Revoke Approval</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Approve Signup</span>
                    </>
                  )}
                </button>

                {/* Suspend block toggle */}
                <button
                  onClick={() => handleToggleActive(r._id, r.isActive)}
                  className={`py-2.5 rounded-xl text-center flex items-center justify-center space-x-1 transition-colors ${
                    r.isActive 
                      ? 'bg-red-50 hover:bg-red-100 text-red-700' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <Ban className="h-4 w-4" />
                  <span>{r.isActive ? 'Block Kitchen' : 'Unblock'}</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default RestaurantApproval;
