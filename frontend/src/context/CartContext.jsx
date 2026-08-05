import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const localData = localStorage.getItem('cartItems');
    return localData ? JSON.parse(localData) : [];
  });

  const [restaurantId, setRestaurantId] = useState(() => {
    return localStorage.getItem('cartRestaurantId') || null;
  });

  const [restaurantName, setRestaurantName] = useState(() => {
    return localStorage.getItem('cartRestaurantName') || '';
  });

  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    if (cartItems.length === 0) {
      setRestaurantId(null);
      setRestaurantName('');
      localStorage.removeItem('cartRestaurantId');
      localStorage.removeItem('cartRestaurantName');
      setCouponCode('');
      setDiscount(0);
    } else {
      const firstItem = cartItems[0];
      if (firstItem && firstItem.restaurantId) {
        setRestaurantId(firstItem.restaurantId);
        setRestaurantName(firstItem.restaurantName);
        localStorage.setItem('cartRestaurantId', firstItem.restaurantId);
        localStorage.setItem('cartRestaurantName', firstItem.restaurantName);
      }
    }
  }, [cartItems]);

  const addToCart = (item, restId, restName) => {
    setCartItems((prevItems) => {
      const existing = prevItems.find(i => i.menuItem === item._id);
      if (existing) {
        return prevItems.map(i => 
          i.menuItem === item._id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prevItems, { 
        menuItem: item._id, 
        name: item.name, 
        price: item.price, 
        image: item.image,
        isVeg: item.isVeg,
        qty: 1,
        restaurantId: restId,
        restaurantName: restName
      }];
    });

    return { success: true };
  };

  const updateQty = (itemId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCartItems(prev => prev.map(i => i.menuItem === itemId ? { ...i, qty: newQty } : i));
  };

  const removeFromCart = (itemId) => {
    setCartItems(prev => prev.filter(i => i.menuItem !== itemId));
  };

  const clearCart = () => {
    setCartItems([]);
    setRestaurantId(null);
    setRestaurantName('');
    setCouponCode('');
    setDiscount(0);
  };

  // Coupons calculation
  const applyCoupon = (code) => {
    const total = getSubtotal();
    const cleanCode = code.trim().toUpperCase();
    
    if (cleanCode === 'WELCOME50') {
      const discVal = Math.min(total * 0.5, 150);
      setDiscount(discVal);
      setCouponCode('WELCOME50');
      return { success: true, message: `50% discount up to ₹150 applied!` };
    } else if (cleanCode === 'FREE100') {
      if (total < 400) {
        return { success: false, message: 'Minimum order amount for FREE100 is ₹400' };
      }
      setDiscount(100);
      setCouponCode('FREE100');
      return { success: true, message: '₹100 discount applied!' };
    }
    
    return { success: false, message: 'Invalid coupon code' };
  };

  const removeCoupon = () => {
    setCouponCode('');
    setDiscount(0);
  };

  const getSubtotal = () => {
    return cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
  };

  const getDeliveryFee = () => {
    return getSubtotal() > 500 ? 0 : 40; // Free delivery above ₹500
  };

  const getGST = () => {
    return Math.round(getSubtotal() * 0.05); // 5% GST on food
  };

  const getTotalAmount = () => {
    const subtotal = getSubtotal();
    const delivery = getDeliveryFee();
    const gst = getGST();
    return Math.max(0, subtotal + delivery + gst - discount);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      restaurantId,
      restaurantName,
      couponCode,
      discount,
      addToCart,
      updateQty,
      removeFromCart,
      clearCart,
      applyCoupon,
      removeCoupon,
      getSubtotal,
      getDeliveryFee,
      getGST,
      getTotalAmount
    }}>
      {children}
    </CartContext.Provider>
  );
};
