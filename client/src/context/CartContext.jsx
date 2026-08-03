import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (food, quantity = 1) => {
    setCartItems(prevItems => {
      const existing = prevItems.find(item => item.foodId === food.id);
      if (existing) {
        return prevItems.map(item =>
          item.foodId === food.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prevItems,
        {
          foodId: food.id,
          title: food.title,
          price: food.price,
          image: food.image,
          quantity: quantity,
          restaurantId: food.restaurantId
        }
      ];
    });
  };

  const removeFromCart = (foodId) => {
    setCartItems(prevItems => prevItems.filter(item => item.foodId !== foodId));
  };

  const updateQuantity = (foodId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(foodId);
      return;
    }
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.foodId === foodId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = subtotal > 0 ? 2.99 : 0;
  const tax = subtotal * 0.08; // 8% Tax
  const total = subtotal + deliveryFee + tax;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal: parseFloat(subtotal.toFixed(2)),
        deliveryFee: parseFloat(deliveryFee.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        total: parseFloat(total.toFixed(2))
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
