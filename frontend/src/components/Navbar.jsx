import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { 
  ShoppingBag, 
  User, 
  LogOut, 
  Utensils, 
  Shield, 
  Menu, 
  X,
  Clock,
  MapPin,
  ClipboardList
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated, isCustomer, isRestaurantAdmin, isSuperAdmin } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Brand Name */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 text-brand-500 font-extrabold text-2xl tracking-tight">
              <Utensils className="h-7 w-7 text-brand-500 animate-bounce" />
              <span>QuickBite</span>
            </Link>

            {/* Address display (Customer only) */}
            {isAuthenticated && isCustomer && user?.addresses?.find(a => a.isDefault) && (
              <div className="hidden md:flex items-center ml-6 text-sm text-gray-500 space-x-1 border-l border-gray-200 pl-6">
                <MapPin className="h-4 w-4 text-brand-500" />
                <span className="truncate max-w-[200px]">
                  {user.addresses.find(a => a.isDefault).street}
                </span>
              </div>
            )}
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Customer Navigation */}
            {(!isAuthenticated || isCustomer) && (
              <>
                <Link 
                  to="/" 
                  className={`text-sm font-semibold transition-colors duration-200 ${
                    isActive('/') ? 'text-brand-500' : 'text-gray-600 hover:text-brand-500'
                  }`}
                >
                  Browse Food
                </Link>
                {isAuthenticated && (
                  <>
                    <Link 
                      to="/orders" 
                      className={`text-sm font-semibold flex items-center space-x-1 transition-colors duration-200 ${
                        isActive('/orders') ? 'text-brand-500' : 'text-gray-600 hover:text-brand-500'
                      }`}
                    >
                      <Clock className="h-4 w-4" />
                      <span>My Orders</span>
                    </Link>
                    <Link 
                      to="/profile" 
                      className={`text-sm font-semibold flex items-center space-x-1 transition-colors duration-200 ${
                        isActive('/profile') ? 'text-brand-500' : 'text-gray-600 hover:text-brand-500'
                      }`}
                    >
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </>
                )}
                <Link to="/cart" className="relative p-2 text-gray-600 hover:text-brand-500 transition-colors duration-200">
                  <ShoppingBag className="h-6 w-6" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-brand-500 text-white font-bold text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </>
            )}

            {/* Restaurant Admin Navigation */}
            {isAuthenticated && isRestaurantAdmin && (
              <>
                <Link 
                  to="/restaurant/dashboard" 
                  className={`text-sm font-semibold transition-colors duration-200 ${
                    isActive('/restaurant/dashboard') ? 'text-brand-500' : 'text-gray-600 hover:text-brand-500'
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/restaurant/orders" 
                  className={`text-sm font-semibold transition-colors duration-200 ${
                    isActive('/restaurant/orders') ? 'text-brand-500' : 'text-gray-600 hover:text-brand-500'
                  }`}
                >
                  Orders queue
                </Link>
                <Link 
                  to="/restaurant/menu" 
                  className={`text-sm font-semibold transition-colors duration-200 ${
                    isActive('/restaurant/menu') ? 'text-brand-500' : 'text-gray-600 hover:text-brand-500'
                  }`}
                >
                  Manage Menu
                </Link>
              </>
            )}

            {/* Super Admin Navigation */}
            {isAuthenticated && isSuperAdmin && (
              <>
                <Link 
                  to="/admin/dashboard" 
                  className={`text-sm font-semibold flex items-center space-x-1 transition-colors duration-200 ${
                    isActive('/admin/dashboard') ? 'text-brand-500' : 'text-gray-600 hover:text-brand-500'
                  }`}
                >
                  <Shield className="h-4 w-4" />
                  <span>Admin Hub</span>
                </Link>
                <Link 
                  to="/admin/orders" 
                  className={`text-sm font-semibold transition-colors duration-200 ${
                    isActive('/admin/orders') ? 'text-brand-500' : 'text-gray-600 hover:text-brand-500'
                  }`}
                >
                  All Orders
                </Link>
                <Link 
                  to="/admin/restaurants" 
                  className={`text-sm font-semibold transition-colors duration-200 ${
                    isActive('/admin/restaurants') ? 'text-brand-500' : 'text-gray-600 hover:text-brand-500'
                  }`}
                >
                  Approve Shops
                </Link>
                <Link 
                  to="/admin/customers" 
                  className={`text-sm font-semibold transition-colors duration-200 ${
                    isActive('/admin/customers') ? 'text-brand-500' : 'text-gray-600 hover:text-brand-500'
                  }`}
                >
                  User Control
                </Link>
              </>
            )}

            {/* User Profile dropdown or Login/Signup */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-4 border-l border-gray-200 pl-4">
                <div className="flex items-center space-x-2">
                  <div className="bg-gray-100 rounded-full p-2">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-gray-800">{user?.name?.split(' ')[0]}</span>
                    <span className="text-[10px] text-gray-400 capitalize">{user?.role}</span>
                  </div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-brand-500 transition-colors duration-200"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3 border-l border-gray-200 pl-4">
                <Link to="/login" className="text-sm font-semibold text-gray-600 hover:text-brand-500 px-3 py-2">
                  Log in
                </Link>
                <Link 
                  to="/register" 
                  className="text-sm font-semibold bg-brand-500 text-white hover:bg-brand-600 px-4 py-2 rounded-xl transition-all duration-200 shadow-sm"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            {isCustomer && (
              <Link to="/cart" className="relative p-2 text-gray-600">
                <ShoppingBag className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-500 text-white font-bold text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-brand-500"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Options */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 px-4 pt-2 pb-4 space-y-2 animate-fadeIn">
          {/* Customer links */}
          {(!isAuthenticated || isCustomer) && (
            <>
              <Link 
                to="/" 
                className="block px-3 py-2 rounded-xl text-base font-semibold text-gray-700 hover:bg-gray-50 hover:text-brand-500"
                onClick={() => setMobileMenuOpen(false)}
              >
                Browse Food
              </Link>
              {isAuthenticated && (
                <>
                  <Link 
                    to="/orders" 
                    className="block px-3 py-2 rounded-xl text-base font-semibold text-gray-700 hover:bg-gray-50 hover:text-brand-500"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Orders
                  </Link>
                  <Link 
                    to="/profile" 
                    className="block px-3 py-2 rounded-xl text-base font-semibold text-gray-700 hover:bg-gray-50 hover:text-brand-500"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                </>
              )}
            </>
          )}

          {/* Restaurant Admin links */}
          {isAuthenticated && isRestaurantAdmin && (
            <>
              <Link 
                to="/restaurant/dashboard" 
                className="block px-3 py-2 rounded-xl text-base font-semibold text-gray-700 hover:bg-gray-50 hover:text-brand-500"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                to="/restaurant/orders" 
                className="block px-3 py-2 rounded-xl text-base font-semibold text-gray-700 hover:bg-gray-50 hover:text-brand-500"
                onClick={() => setMobileMenuOpen(false)}
              >
                Orders Queue
              </Link>
              <Link 
                to="/restaurant/menu" 
                className="block px-3 py-2 rounded-xl text-base font-semibold text-gray-700 hover:bg-gray-50 hover:text-brand-500"
                onClick={() => setMobileMenuOpen(false)}
              >
                Manage Menu
              </Link>
            </>
          )}

          {/* Super Admin links */}
          {isAuthenticated && isSuperAdmin && (
            <>
              <Link 
                to="/admin/dashboard" 
                className="block px-3 py-2 rounded-xl text-base font-semibold text-gray-700 hover:bg-gray-50 hover:text-brand-500"
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin Hub Dashboard
              </Link>
              <Link 
                to="/admin/orders" 
                className="block px-3 py-2 rounded-xl text-base font-semibold text-gray-700 hover:bg-gray-50 hover:text-brand-500"
                onClick={() => setMobileMenuOpen(false)}
              >
                All Orders
              </Link>
              <Link 
                to="/admin/restaurants" 
                className="block px-3 py-2 rounded-xl text-base font-semibold text-gray-700 hover:bg-gray-50 hover:text-brand-500"
                onClick={() => setMobileMenuOpen(false)}
              >
                Approve Shops
              </Link>
              <Link 
                to="/admin/customers" 
                className="block px-3 py-2 rounded-xl text-base font-semibold text-gray-700 hover:bg-gray-50 hover:text-brand-500"
                onClick={() => setMobileMenuOpen(false)}
              >
                User Control
              </Link>
            </>
          )}

          {/* Profile options */}
          <div className="pt-4 border-t border-gray-100">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="px-3 py-2 flex items-center space-x-3">
                  <div className="bg-gray-100 rounded-full p-2">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-800">{user?.name?.split(' ')[0]}</div>
                    <div className="text-xs text-gray-400 capitalize">{user?.role}</div>
                  </div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-base font-semibold text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Log out</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-2 px-3">
                <Link 
                  to="/login" 
                  className="w-full text-center py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link 
                  to="/register" 
                  className="w-full text-center py-2 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
