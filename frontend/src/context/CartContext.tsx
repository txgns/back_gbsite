import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export type Product = {
  id: string; // Changed to string to match backend product_id
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
};

type CartItem = {
  id: number; // Backend cart item ID
  product_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  added_at: string;
  user_id: number;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (product: Product) => Promise<void>;
  removeFromCart: (cartItemId: number) => Promise<void>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
  fetchCart: () => Promise<void>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { token, isAuthenticated } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8001";

  const fetchCart = async () => {
    if (!isAuthenticated || !token) {
      console.log('User not authenticated, clearing cart');
      setCart([]);
      return;
    }

    try {
      console.log('Fetching cart data...');
      const response = await fetch('/api/cart/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Cart data received:', data);
        setCart(data.cart_items || []);
      } else {
        console.error('Failed to fetch cart:', response.status, response.statusText);
        const errorData = await response.json().catch(() => ({}));
        console.error('Error details:', errorData);
        setCart([]);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCart([]);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated, token]);

  const addToCart = async (product: Product) => {
    if (!isAuthenticated || !token) {
      console.error('User must be logged in to add items to cart');
      throw new Error('Você precisa estar logado para adicionar itens ao carrinho');
    }

    try {
      console.log('Adding product to cart:', product);
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: product.id,
          product_name: product.name,
          product_price: product.price,
          quantity: 1,
        }),
      });

      if (response.ok) {
        console.log('Product added to cart successfully');
        await fetchCart(); // Refresh cart
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to add to cart:', response.status, response.statusText, errorData);
        throw new Error(errorData.detail || 'Erro ao adicionar item ao carrinho');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const removeFromCart = async (cartItemId: number) => {
    if (!isAuthenticated || !token) return;

    try {
      console.log('Removing item from cart:', cartItemId);
      const response = await fetch(`/api/cart/remove/${cartItemId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        console.log('Item removed successfully');
        await fetchCart();
      } else {
        console.error('Failed to remove item:', response.statusText);
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const updateQuantity = async (cartItemId: number, quantity: number) => {
    if (!isAuthenticated || !token) return;

    try {
      console.log('Updating cart item quantity:', cartItemId, quantity);
      const response = await fetch(`/api/cart/update/${cartItemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
      });

      if (response.ok) {
        console.log('Quantity updated successfully');
        await fetchCart();
      } else {
        console.error('Failed to update quantity:', response.statusText);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated || !token) return;

    try {
      console.log('Clearing cart...');
      const response = await fetch('/api/cart/clear', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        console.log('Cart cleared successfully');
        await fetchCart();
      } else {
        console.error('Failed to clear cart:', response.statusText);
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  
  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity, 
    0
  );

  return (
    <CartContext.Provider 
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

