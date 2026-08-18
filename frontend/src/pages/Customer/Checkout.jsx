import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import { 
  MapPin, 
  CreditCard, 
  Tag, 
  Plus, 
  Trash2, 
  AlertCircle, 
  Check,
  ShoppingBag,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

const Checkout = () => {
  const { user, addAddress, deleteAddress, isAuthenticated } = useContext(AuthContext);
  const { 
    cartItems, 
    restaurantId, 
    restaurantName,
    couponCode,
    discount,
    applyCoupon,
    removeCoupon,
    getSubtotal,
    getDeliveryFee,
    getGST,
    getTotalAmount,
    clearCart
  } = useContext(CartContext);
  
  const navigate = useNavigate();

  // Address states
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newZipCode, setNewZipCode] = useState('');

  // Payment states
  const [paymentMode, setPaymentMode] = useState('simulate'); // 'razorpay' or 'simulate'
  const [couponInput, setCouponInput] = useState('');
  const [processing, setProcessing] = useState(false);

  // Redirect to home if cart is empty
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please log in to proceed with checkout');
      navigate('/login');
    } else if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      navigate('/');
    } else if (user?.addresses?.length > 0) {
      // Find default address or set first
      const defaultIndex = user.addresses.findIndex(addr => addr.isDefault);
      setSelectedAddressIndex(defaultIndex !== -1 ? defaultIndex : 0);
    }
  }, [cartItems, user, isAuthenticated]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newStreet || !newCity || !newState || !newZipCode) {
      toast.error('Please fill all address fields');
      return;
    }

    const addr = {
      street: newStreet,
      city: newCity,
      state: newState,
      zipCode: newZipCode,
      isDefault: user?.addresses?.length === 0 // Make default if it's the first address
    };

    const res = await addAddress(addr);
    if (res.success) {
      toast.success('Address saved successfully');
      setNewStreet('');
      setNewCity('');
      setNewState('');
      setNewZipCode('');
      setShowAddressForm(false);
      
      // Auto select the new address
      if (user?.addresses) {
        setSelectedAddressIndex(user.addresses.length);
      }
    } else {
      toast.error(res.message || 'Failed to save address');
    }
  };

  const handleDeleteAddress = async (addrId, index) => {
    const res = await deleteAddress(addrId);
    if (res.success) {
      toast.success('Address removed');
      if (selectedAddressIndex === index) {
        setSelectedAddressIndex(user.addresses.length > 1 ? 0 : null);
      }
    } else {
      toast.error('Failed to delete address');
    }
  };

  const handleCouponApply = (e) => {
    e.preventDefault();
    if (!couponInput) return;
    const res = applyCoupon(couponInput);
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  const handlePlaceOrder = async () => {
    if (selectedAddressIndex === null || !user?.addresses?.[selectedAddressIndex]) {
      toast.error('Please select a delivery address');
      return;
    }

    const targetAddress = user.addresses[selectedAddressIndex];
    setProcessing(true);

    try {
      const orderPayload = {
        items: cartItems,
        deliveryAddress: {
          street: targetAddress.street,
          city: targetAddress.city,
          state: targetAddress.state,
          zipCode: targetAddress.zipCode
        },
        simulatePayment: paymentMode === 'simulate',
        discount: discount // Pass coupon discount
      };

      // 1. Create order on backend (returns Razorpay Order ID or fake simulated ID)
      const createRes = await axios.post(`${API_URL}/payment/create-order`, orderPayload);
      const { orderId, orderIds, totalAmount, razorpayOrderId, isSimulated, keyId } = createRes.data;

      // 2. Handle Payment Verification
      if (isSimulated) {
        // Simulation payment flow: hit verification webhook directly with simulated fields
        setTimeout(async () => {
          try {
            const verifyPayload = {
              razorpayOrderId,
              isSimulated: true
            };
            const verifyRes = await axios.post(`${API_URL}/payment/verify`, verifyPayload);
            if (verifyRes.data.success) {
              clearCart();
              if (orderIds && orderIds.length > 1) {
                toast.success(`Successfully placed ${orderIds.length} orders from different restaurants!`);
                navigate('/orders');
              } else {
                toast.success('Order placed successfully (Simulated Payment)');
                navigate(`/order-tracking/${orderId}`);
              }
            } else {
              toast.error('Payment verification failed');
            }
          } catch (err) {
            console.error(err);
            toast.error('Simulated checkout failed');
          } finally {
            setProcessing(false);
          }
        }, 1500);
      } else {
        // Real Razorpay integration flow
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          toast.error('Failed to load payment gateways. Please try Simulation Mode.');
          setProcessing(false);
          return;
        }

        const options = {
          key: keyId,
          amount: Math.round(totalAmount * 100),
          currency: 'INR',
          name: 'QuickBite Food Platform',
          description: `Bulk Food Order`,
          order_id: razorpayOrderId,
          handler: async (response) => {
            try {
              const verifyPayload = {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                isSimulated: false
              };

              const verifyRes = await axios.post(`${API_URL}/payment/verify`, verifyPayload);
              if (verifyRes.data.success) {
                clearCart();
                if (orderIds && orderIds.length > 1) {
                  toast.success(`Successfully placed ${orderIds.length} orders from different restaurants!`);
                  navigate('/orders');
                } else {
                  toast.success('Payment successful! Order placed.');
                  navigate(`/order-tracking/${orderId}`);
                }
              } else {
                toast.error('Signature verification failed');
              }
            } catch (err) {
              console.error(err);
              toast.error('Transaction verification failed');
            } finally {
              setProcessing(false);
            }
          },
          prefill: {
            name: user.name,
            email: user.email
          },
          theme: {
            color: '#f43f5e'
          },
          modal: {
            ondismiss: () => {
              toast.error('Payment cancelled');
              setProcessing(false);
            }
          }
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Checkout failed');
      setProcessing(false);
    }
  };

  const subtotal = getSubtotal();
  const gst = getGST();
  const delivery = getDeliveryFee();
  const total = getTotalAmount();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8 flex items-center space-x-2">
        <ShoppingBag className="h-8 w-8 text-brand-500" />
        <span>Secure Checkout</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns - Delivery Address & Payment Mode */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Address Card */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-brand-500" />
                <span>Delivery Address</span>
              </h2>
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
                <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">New Location Details</h3>
                <div className="grid grid-cols-1 gap-4">
                  <input
                    type="text"
                    required
                    placeholder="Street Address, Area/Building"
                    value={newStreet}
                    onChange={(e) => setNewStreet(e.target.value)}
                    className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white text-sm"
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="City"
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white text-sm col-span-1"
                    />
                    <input
                      type="text"
                      required
                      placeholder="State"
                      value={newState}
                      onChange={(e) => setNewState(e.target.value)}
                      className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white text-sm col-span-1"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Zip Code"
                      value={newZipCode}
                      onChange={(e) => setNewZipCode(e.target.value)}
                      className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white text-sm col-span-1"
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
                    Save Location
                  </button>
                </div>
              </form>
            )}

            {/* List of Saved Addresses */}
            {user?.addresses?.length === 0 ? (
              <div className="text-center py-6 text-sm text-gray-500">
                No delivery addresses added yet. Please add one above.
              </div>
            ) : (
              <div className="space-y-3">
                {user?.addresses?.map((addr, index) => (
                  <div
                    key={addr._id}
                    onClick={() => setSelectedAddressIndex(index)}
                    className={`p-4 border rounded-2xl cursor-pointer flex items-center justify-between transition-all ${
                      selectedAddressIndex === index
                        ? 'border-brand-500 bg-brand-50/30'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-1.5 rounded-lg mt-0.5 ${
                        selectedAddressIndex === index ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-400'
                      }`}>
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{addr.street}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{addr.city}, {addr.state} - {addr.zipCode}</p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAddress(addr._id, index);
                      }}
                      className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Card */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 flex items-center space-x-2 mb-6">
              <CreditCard className="h-5 w-5 text-brand-500" />
              <span>Select Payment Method</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Simulate card */}
              <div
                onClick={() => setPaymentMode('simulate')}
                className={`p-4 border rounded-2xl cursor-pointer flex flex-col justify-between transition-all h-28 ${
                  paymentMode === 'simulate'
                    ? 'border-brand-500 bg-brand-50/30'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-1.5">
                    <Sparkles className="h-5 w-5 text-brand-500" />
                    <span className="text-sm font-bold text-gray-800">Simulate Checkout</span>
                  </div>
                  {paymentMode === 'simulate' && (
                    <div className="bg-brand-500 text-white p-0.5 rounded-full">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Recommended for testing. Places simulated orders without requiring real Razorpay credentials.
                </p>
              </div>

              {/* Razorpay card */}
              <div
                onClick={() => setPaymentMode('razorpay')}
                className={`p-4 border rounded-2xl cursor-pointer flex flex-col justify-between transition-all h-28 ${
                  paymentMode === 'razorpay'
                    ? 'border-brand-500 bg-brand-50/30'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-800">Razorpay Payment</span>
                  {paymentMode === 'razorpay' && (
                    <div className="bg-brand-500 text-white p-0.5 rounded-full">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Real payment gateway integration using Razorpay checkout modal (supports UPI/Cards).
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Billing & Coupon Summary */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm h-fit">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4 mb-4">
              Billing Summary
            </h2>
            
            <p className="text-xs text-gray-400 font-semibold mb-3">ORDER FROM</p>
            <div className="text-sm font-bold text-gray-800 mb-6">
              {(() => {
                const unique = [...new Set(cartItems.map(i => i.restaurantName).filter(Boolean))];
                if (unique.length === 0) return 'No Restaurant selected';
                if (unique.length === 1) return unique[0];
                return `${unique[0]} & ${unique.length - 1} other(s)`;
              })()}
            </div>

            {/* Cart billing calculations */}
            <div className="space-y-3.5 text-sm font-semibold text-gray-500 border-b border-gray-100 pb-5">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-gray-900">₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (5%)</span>
                <span className="text-gray-900">₹{gst}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span className="text-gray-900">
                  {delivery === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `₹${delivery}`}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold bg-emerald-50/50 p-2 rounded-xl">
                  <span className="flex items-center space-x-1">
                    <Tag className="h-4 w-4" />
                    <span>Promo: {couponCode}</span>
                  </span>
                  <span>-₹{discount}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center text-lg font-extrabold text-gray-900 pt-5 mb-8">
              <span>Grand Total</span>
              <span className="text-brand-500 text-2xl">₹{total}</span>
            </div>

            {/* Promo Codes */}
            {!couponCode ? (
              <form onSubmit={handleCouponApply} className="mb-6">
                <label className="block text-xs font-semibold text-gray-400 mb-2">APPLY PROMO CODE</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="WELCOME50 or FREE100"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="flex-grow px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 text-sm font-bold uppercase"
                  />
                  <button
                    type="submit"
                    className="bg-gray-900 text-white font-bold px-4 py-2 rounded-xl text-xs hover:bg-gray-800"
                  >
                    Apply
                  </button>
                </div>
              </form>
            ) : (
              <div className="mb-6 flex justify-between items-center bg-gray-50 border border-gray-200 p-3 rounded-2xl">
                <div>
                  <div className="text-xs font-bold text-emerald-600 uppercase flex items-center space-x-1">
                    <Check className="h-3.5 w-3.5" />
                    <span>Coupon active</span>
                  </div>
                  <div className="text-[10px] text-gray-400 font-semibold mt-0.5">₹{discount} savings applied</div>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-xs text-red-500 font-bold hover:underline"
                >
                  Remove
                </button>
              </div>
            )}

            {/* Checkouts triggers */}
            <button
              onClick={handlePlaceOrder}
              disabled={processing}
              className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-extrabold text-base py-4 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
            >
              <span>{processing ? 'Processing Payment...' : `Confirm & Pay ₹${total}`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
