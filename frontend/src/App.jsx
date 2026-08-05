import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Toaster } from 'react-hot-toast';

// Layout & Components
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Customer Views
import Home from './pages/Customer/Home';
import RestaurantDetail from './pages/Customer/RestaurantDetail';
import Cart from './pages/Customer/Cart';
import Checkout from './pages/Customer/Checkout';
import OrderTracking from './pages/Customer/OrderTracking';
import OrderHistory from './pages/Customer/OrderHistory';
import Profile from './pages/Customer/Profile';

// Restaurant Admin Views
import RestaurantDashboard from './pages/RestaurantAdmin/Dashboard';
import RestaurantOrders from './pages/RestaurantAdmin/OrdersList';
import RestaurantMenu from './pages/RestaurantAdmin/MenuManager';

// Super Admin Views
import SuperAdminDashboard from './pages/SuperAdmin/Dashboard';
import SuperAdminOrders from './pages/SuperAdmin/OrderOverride';
import SuperAdminRestaurants from './pages/SuperAdmin/RestaurantApproval';
import SuperAdminCustomers from './pages/SuperAdmin/CustomerList';

// Route Protectors
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-brand-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If authenticated but role not allowed, send to appropriate default dashboard
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'restaurant') return <Navigate to="/restaurant/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-64px)] bg-gray-50/50">
        {children}
      </div>
    </>
  );
};

// Wrapper for public navigation layouts
const PublicLayoutWrapper = ({ children }) => {
  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-64px)] bg-gray-50/50">
        {children}
      </div>
    </>
  );
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AuthProvider>
        <CartProvider>
          {/* Notifications setup */}
          <Toaster 
            position="top-right" 
            toastOptions={{
              duration: 3500,
              style: {
                borderRadius: '16px',
                background: '#fff',
                color: '#1f2937',
                fontSize: '14px',
                fontWeight: '600',
                border: '1px solid #f3f4f6',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)'
              }
            }} 
          />

          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Public Customer Routes */}
            <Route path="/" element={
              <PublicLayoutWrapper>
                <Home />
              </PublicLayoutWrapper>
            } />
            <Route path="/restaurant/:id" element={
              <PublicLayoutWrapper>
                <RestaurantDetail />
              </PublicLayoutWrapper>
            } />

            {/* Protected Customer Routes */}
            <Route path="/cart" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <Cart />
              </ProtectedRoute>
            } />
            <Route path="/checkout" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <Checkout />
              </ProtectedRoute>
            } />
            <Route path="/order-tracking/:id" element={
              <ProtectedRoute allowedRoles={['customer', 'restaurant', 'admin']}>
                <OrderTracking />
              </ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <OrderHistory />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <Profile />
              </ProtectedRoute>
            } />

            {/* Protected Restaurant Admin Routes */}
            <Route path="/restaurant/dashboard" element={
              <ProtectedRoute allowedRoles={['restaurant']}>
                <RestaurantDashboard />
              </ProtectedRoute>
            } />
            <Route path="/restaurant/orders" element={
              <ProtectedRoute allowedRoles={['restaurant']}>
                <RestaurantOrders />
              </ProtectedRoute>
            } />
            <Route path="/restaurant/menu" element={
              <ProtectedRoute allowedRoles={['restaurant']}>
                <RestaurantMenu />
              </ProtectedRoute>
            } />

            {/* Protected Super Admin Routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <SuperAdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/orders" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <SuperAdminOrders />
              </ProtectedRoute>
            } />
            <Route path="/admin/restaurants" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <SuperAdminRestaurants />
              </ProtectedRoute>
            } />
            <Route path="/admin/customers" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <SuperAdminCustomers />
              </ProtectedRoute>
            } />

            {/* Fallback Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
