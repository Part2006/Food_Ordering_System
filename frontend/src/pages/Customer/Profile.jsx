import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { 
  User, 
  MapPin, 
  Star, 
  MessageSquare, 
  Clock, 
  Plus, 
  Trash2, 
  ChevronRight,
  UserCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

const Profile = () => {
  const { user, addAddress, deleteAddress } = useContext(AuthContext);
  const navigate = useNavigate();

  // Address states
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');

  // Review states
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const res = await axios.get(`${API_URL}/restaurants`);
      setRestaurants(res.data);
      if (res.data.length > 0) {
        setSelectedRestaurantId(res.data[0]._id);
      }
    } catch (err) {
      console.error('Error fetching restaurants for reviews:', err);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!street || !city || !state || !zipCode) {
      toast.error('Please enter all address details');
      return;
    }

    const addr = {
      street,
      city,
      state,
      zipCode,
      isDefault: user?.addresses?.length === 0
    };

    const res = await addAddress(addr);
    if (res.success) {
      toast.success('Address saved successfully!');
      setStreet('');
      setCity('');
      setState('');
      setZipCode('');
      setShowAddressForm(false);
    } else {
      toast.error(res.message || 'Failed to save address');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRestaurantId || !comment) {
      toast.error('Please select a restaurant and write a comment');
      return;
    }

    setSubmittingReview(true);
    try {
      const payload = {
        restaurantId: selectedRestaurantId,
        rating,
        comment
      };

      await axios.post(`${API_URL}/reviews`, payload);
      toast.success('Review submitted successfully! Thank you.');
      setComment('');
      setRating(5);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Welcome header banner */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center space-x-2">
          <UserCheck className="h-8 w-8 text-brand-500" />
          <span>My Profile Hub</span>
        </h1>
        <p className="text-sm text-gray-500 mt-1">Manage delivery locations and write reviews for kitchens.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - User info card & quick nav links */}
        <div className="space-y-6">
          
          {/* User detail info card */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex items-center space-x-4">
            <div className="bg-brand-50 rounded-full p-4 text-brand-600 flex-shrink-0">
              <User className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-gray-900">{user?.name}</h2>
              <p className="text-xs text-gray-400 mt-0.5">{user?.email}</p>
              <span className="inline-block mt-2 px-2.5 py-0.5 rounded-lg text-[9px] uppercase font-bold bg-blue-50 text-blue-800 border border-blue-100">
                {user?.role} Account
              </span>
            </div>
          </div>

          {/* Quick navigation actions list */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs text-gray-400 font-extrabold uppercase tracking-wider pl-1">
              Shortcuts
            </h3>

            <div className="space-y-2">
              <button
                onClick={() => navigate('/orders')}
                className="w-full flex items-center justify-between p-3.5 bg-gray-50 hover:bg-gray-100/70 border border-gray-150 rounded-2xl transition-all text-left text-sm font-bold text-gray-800"
              >
                <div className="flex items-center space-x-2.5">
                  <Clock className="h-4.5 w-4.5 text-gray-500" />
                  <span>My Orders History</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </button>

              <button
                onClick={() => navigate('/')}
                className="w-full flex items-center justify-between p-3.5 bg-gray-50 hover:bg-gray-100/70 border border-gray-150 rounded-2xl transition-all text-left text-sm font-bold text-gray-800"
              >
                <div className="flex items-center space-x-2.5">
                  <User className="h-4.5 w-4.5 text-gray-500" />
                  <span>Browse Foods / Restaurants</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          </div>

        </div>

        {/* Center & Right Column - Saved addresses management & Write a Review */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Saved Addresses */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-brand-500" />
                <span>My Saved Locations ({user?.addresses?.length || 0})</span>
              </h3>

              {!showAddressForm && (
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="text-xs font-bold text-brand-500 hover:text-brand-600 flex items-center space-x-1"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add New</span>
                </button>
              )}
            </div>

            {/* Address Form */}
            {showAddressForm && (
              <form onSubmit={handleAddAddress} className="bg-gray-50 p-5 rounded-2xl border border-gray-150 mb-6 space-y-4 animate-fadeIn">
                <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">New Location Details</h4>
                <div className="grid grid-cols-1 gap-4">
                  <input
                    type="text"
                    required
                    placeholder="Street Address, Area/Building"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white text-sm"
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white text-sm"
                    />
                    <input
                      type="text"
                      required
                      placeholder="State"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white text-sm"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Zip Code"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white text-sm"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 text-xs font-bold pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    className="px-4 py-2 text-gray-500 border border-gray-250 rounded-xl hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-brand-500 text-white rounded-xl hover:bg-brand-600 shadow-sm"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            )}

            {/* List addresses */}
            {user?.addresses?.length === 0 ? (
              <div className="text-center py-6 text-sm text-gray-400 border border-dashed border-gray-150 rounded-2xl">
                No saved addresses. Click Add New to create one.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user?.addresses?.map((addr) => (
                  <div key={addr._id} className="p-4 border border-gray-150 hover:border-gray-200 transition-all rounded-2xl flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-start space-x-2.5">
                      <div className="bg-white border border-gray-150 p-2 rounded-xl text-gray-500 mt-0.5">
                        <MapPin className="h-4 w-4 text-brand-500" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-800">{addr.street}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{addr.city}, {addr.state} - {addr.zipCode}</p>
                        {addr.isDefault && (
                          <span className="inline-block mt-2 text-[8px] uppercase font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                            Default Address
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteAddress(addr._id)}
                      className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg transition-colors"
                      title="Delete Location"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Write a Review Panel */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2 border-b border-gray-50 pb-4 mb-6">
              <MessageSquare className="h-5 w-5 text-brand-500" />
              <span>Write a Restaurant Review</span>
            </h3>

            {restaurants.length === 0 ? (
              <div className="text-center py-6 text-sm text-gray-400">
                No active restaurants found to review.
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">CHOOSE RESTAURANT</label>
                    <select
                      value={selectedRestaurantId}
                      onChange={(e) => setSelectedRestaurantId(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold bg-white focus:outline-none"
                    >
                      {restaurants.map(r => (
                        <option key={r._id} value={r._id}>{r.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">RATING STARS</label>
                    <div className="flex space-x-1 items-center bg-gray-50 p-1.5 rounded-xl border border-gray-200/50 w-fit">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="focus:outline-none p-0.5"
                        >
                          <Star className={`h-5 w-5 ${
                            star <= rating ? 'fill-amber-500 text-amber-500' : 'text-gray-300'
                          }`} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">YOUR COMMENT</label>
                  <textarea
                    required
                    placeholder="Tell us what you liked or how they can improve..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="block w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-semibold h-24"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold text-xs py-3 px-6 rounded-xl shadow-sm transition-all"
                >
                  {submittingReview ? 'Submitting Review...' : 'Submit Review'}
                </button>
              </form>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

export default Profile;
