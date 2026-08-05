import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  Tag, 
  ArrowRight, 
  Utensils, 
  Check,
  Percent
} from 'lucide-react';
import toast from 'react-hot-toast';

const Cart = () => {
  const { 
    cartItems, 
    restaurantName, 
    restaurantId,
    couponCode,
    discount,
    updateQty, 
    removeFromCart, 
    clearCart,
    applyCoupon,
    removeCoupon,
    getSubtotal,
    getDeliveryFee,
    getGST,
    getTotalAmount
  } = useContext(CartContext);

  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState('');

  const handleCouponSubmit = (e) => {
    e.preventDefault();
    if (!couponInput) return;
    const res = applyCoupon(couponInput);
    if (res.success) {
      toast.success(res.message);
      setCouponInput('');
    } else {
      toast.error(res.message);
    }
  };

  const handleCheckoutRedirect = () => {
    navigate('/checkout');
  };

  const subtotal = getSubtotal();
  const gst = getGST();
  const delivery = getDeliveryFee();
  const total = getTotalAmount();

  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="bg-gray-50 border border-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-sm">
          <ShoppingBag className="h-10 w-10 text-gray-300" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Your cart is empty</h2>
        <p className="text-sm text-gray-500 mt-2">
          Looks like you haven't added anything to your cart yet. Let's find some delicious meals.
        </p>
        <Link 
          to="/" 
          className="mt-8 inline-flex items-center space-x-2 bg-brand-500 hover:bg-brand-600 text-white font-bold px-6 py-3 rounded-2xl shadow-md transition-all text-sm"
        >
          <span>Browse Restaurants</span>
          <ArrowRight className="h-4.5 w-4.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8 flex items-center space-x-2">
        <ShoppingBag className="h-8 w-8 text-brand-500" />
        <span>Shopping Cart</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Cart Items List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-center border-b border-gray-50 pb-4 mb-6">
              <div>
                <span className="text-[10px] text-gray-400 font-extrabold uppercase">ORDERING FROM</span>
                <h3 className="font-extrabold text-gray-800 text-sm">
                  {(() => {
                    const unique = [...new Set(cartItems.map(i => i.restaurantName).filter(Boolean))];
                    if (unique.length === 0) return 'No Restaurant selected';
                    if (unique.length === 1) return unique[0];
                    return `${unique[0]} & ${unique.length - 1} other(s)`;
                  })()}
                </h3>
              </div>
              <button 
                onClick={() => {
                  clearCart();
                  toast.success('Cart cleared');
                }}
                className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center space-x-1"
              >
                <Trash2 className="h-4 w-4" />
                <span>Clear Cart</span>
              </button>
            </div>

            {/* Items Cards */}
            <div className="divide-y divide-gray-50">
              {cartItems.map((item) => (
                <div key={item.menuItem} className="py-5 flex justify-between items-center gap-4 first:pt-0 last:pb-0">
                  <div className="flex items-center space-x-4 min-w-0">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <div className={`w-3.5 h-3.5 border flex items-center justify-center rounded-sm ${
                          item.isVeg ? 'border-emerald-600' : 'border-red-600'
                        }`}>
                          <div className={`w-1 h-1 rounded-full ${
                            item.isVeg ? 'bg-emerald-600' : 'bg-red-600'
                          }`} />
                        </div>
                        <h4 className="font-extrabold text-sm text-gray-900 truncate">{item.name}</h4>
                      </div>
                      <p className="text-xs text-gray-500 font-semibold mt-1">₹{item.price} each</p>
                      {item.restaurantName && (
                        <p className="text-[10px] text-brand-500 font-extrabold mt-1">From: {item.restaurantName}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    {/* Quantity controls */}
                    <div className="bg-gray-100 rounded-xl flex items-center p-1 font-bold text-xs border border-gray-200">
                      <button 
                        onClick={() => updateQty(item.menuItem, item.qty - 1)}
                        className="p-1.5 hover:bg-white rounded-lg text-gray-500 hover:text-gray-900 transition-colors"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="px-3 text-gray-800">{item.qty}</span>
                      <button 
                        onClick={() => updateQty(item.menuItem, item.qty + 1)}
                        className="p-1.5 hover:bg-white rounded-lg text-gray-500 hover:text-gray-900 transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <span className="font-extrabold text-sm text-gray-900 w-16 text-right">
                      ₹{item.price * item.qty}
                    </span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Right Side: Totals & Coupons */}
        <div className="space-y-6">
          {/* Coupon codes box */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-extrabold text-gray-900 flex items-center space-x-2 mb-4">
              <Tag className="h-4.5 w-4.5 text-brand-500" />
              <span>Coupons & Offers</span>
            </h3>

            {!couponCode ? (
              <form onSubmit={handleCouponSubmit} className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Enter WELCOME50 or FREE100"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="flex-grow px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 text-xs font-bold uppercase bg-white text-gray-800"
                />
                <button
                  type="submit"
                  className="bg-gray-950 text-white font-bold px-4 py-2 rounded-xl text-xs hover:bg-gray-900"
                >
                  Apply
                </button>
              </form>
            ) : (
              <div className="bg-emerald-50/50 border border-emerald-200 p-3 rounded-2xl flex justify-between items-center">
                <div className="flex items-center space-x-2.5">
                  <div className="bg-emerald-500 text-white p-1 rounded-lg">
                    <Percent className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-emerald-800 uppercase leading-none">{couponCode}</p>
                    <p className="text-[10px] text-emerald-600 mt-1 font-semibold">₹{discount} discount applied</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    removeCoupon();
                    toast.success('Coupon removed');
                  }}
                  className="text-xs text-red-500 font-bold hover:underline"
                >
                  Remove
                </button>
              </div>
            )}

            {/* Hint of coupons for user */}
            {!couponCode && (
              <div className="mt-4 text-[10px] text-gray-400 space-y-1 pl-1">
                <p>• Try <span className="font-bold text-gray-500">WELCOME50</span> for 50% off (up to ₹150)</p>
                <p>• Try <span className="font-bold text-gray-500">FREE100</span> for flat ₹100 off (Min order ₹400)</p>
              </div>
            )}
          </div>

          {/* Billing breakdown */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-extrabold text-gray-900 border-b border-gray-50 pb-4 mb-4">
              Billing Details
            </h3>

            <div className="space-y-3.5 text-sm font-semibold text-gray-500 border-b border-gray-100 pb-5">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
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
                  <span>Discount</span>
                  <span>-₹{discount}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center text-lg font-extrabold text-gray-900 pt-5 mb-8">
              <span>Grand Total</span>
              <span className="text-brand-500 text-2xl">₹{total}</span>
            </div>

            <button
              onClick={handleCheckoutRedirect}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-base py-4 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
