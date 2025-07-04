import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export type CartItem = {
  id: number;
  product_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  added_at: string;
};

export type CartData = {
  cart_items: CartItem[];
  total_items: number;
  total_amount: number;
};

const API_BASE_URL = 'http://localhost:5001/api';

export const useCartAPI = () => {
  const { token, isAuthenticated } = useAuth();
  const [cart, setCart] = useState<CartData>({ cart_items: [], total_items: 0, total_amount: 0 });
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!isAuthenticated || !token) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/cart/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCart(data);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string, productName: string, productPrice: number, quantity: number = 1) => {
    if (!isAuthenticated || !token) return { success: false, error: 'Not authenticated' };

    try {
      const response = await fetch(`${API_BASE_URL}/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: productId,
          product_name: productName,
          product_price: productPrice,
          quantity,
        }),
      });

      if (response.ok) {
        await fetchCart(); // Refresh cart
        return { success: true };
      } else {
        const data = await response.json();
        return { success: false, error: data.error || 'Failed to add to cart' };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const updateCartItem = async (itemId: number, quantity: number) => {
    if (!isAuthenticated || !token) return { success: false, error: 'Not authenticated' };

    try {
      const response = await fetch(`${API_BASE_URL}/cart/update/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
      });

      if (response.ok) {
        await fetchCart(); // Refresh cart
        return { success: true };
      } else {
        const data = await response.json();
        return { success: false, error: data.error || 'Failed to update cart item' };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const removeFromCart = async (itemId: number) => {
    if (!isAuthenticated || !token) return { success: false, error: 'Not authenticated' };

    try {
      const response = await fetch(`${API_BASE_URL}/cart/remove/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await fetchCart(); // Refresh cart
        return { success: true };
      } else {
        const data = await response.json();
        return { success: false, error: data.error || 'Failed to remove from cart' };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated || !token) return { success: false, error: 'Not authenticated' };

    try {
      const response = await fetch(`${API_BASE_URL}/cart/clear`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await fetchCart(); // Refresh cart
        return { success: true };
      } else {
        const data = await response.json();
        return { success: false, error: data.error || 'Failed to clear cart' };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const checkout = async () => {
    if (!isAuthenticated || !token) return { success: false, error: 'Not authenticated' };

    try {
      const response = await fetch(`${API_BASE_URL}/checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        await fetchCart(); // Refresh cart (should be empty after checkout)
        return { success: true, order: data.order };
      } else {
        const data = await response.json();
        return { success: false, error: data.error || 'Checkout failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCart({ cart_items: [], total_items: 0, total_amount: 0 });
    }
  }, [isAuthenticated, token]);

  return {
    cart,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    checkout,
    fetchCart,
  };
};

