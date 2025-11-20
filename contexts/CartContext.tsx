import React, { createContext, useContext, useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";
import { useAuth } from "./AuthContext";
import {
  getCart as fetchCart,
  addToCart as addToCartApi,
  updateCartItem as updateCartItemApi,
  removeCartItem as removeCartItemApi,
  clearCart as clearCartApi,
  CartResponse,
  CartItemResponse,
} from "@/services/cartApi";

// Export types from API
export type { CartItemResponse, CartResponse };

type CartContextType = {
  cart: CartResponse | null;
  cartItems: CartItemResponse[];
  totalAmount: number;
  itemCount: number;
  isLoading: boolean;
  error: string | null;
  updatingItems: Set<number>;
  refreshCart: () => Promise<void>;
  addToCart: (productVariationId: number, quantity?: number) => Promise<void>;
  removeFromCart: (productVariationId: number) => Promise<void>;
  updateQuantity: (
    productVariationId: number,
    quantity: number
  ) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartItemByVariationId: (
    productVariationId: number
  ) => CartItemResponse | undefined;
  formatPrice: (price: number) => string;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { signOut } = useAuth();
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());

  // Helper function to handle auth errors
  const handleAuthError = async (err: any) => {
    if (err.message?.includes("Access denied") || err.message?.includes("AUTHORIZATION_DENIED")) {
      console.log("Auth error detected, signing out and redirecting to login");
      Toast.show({
        type: "error",
        text1: "Phiên đăng nhập hết hạn",
        text2: "Vui lòng đăng nhập lại",
      });
      
      // Sign out to clear tokens
      await signOut();
      
      // Clear cart state
      setCart(null);
      
      // Redirect to login
      router.replace("/(auth)/login");
      return true; // Return true if handled
    }
    return false; // Return false if not handled
  };

  // Derived values
  const cartItems = cart?.items || [];
  const totalAmount = cart?.summary.totalAmount || 0;
  const itemCount = cart?.summary.totalQuantity || 0;

  // Fetch cart from API
  const refreshCart = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const cartData = await fetchCart();
      setCart(cartData);
    } catch (err: any) {
      console.error("Failed to fetch cart:", err);
      setError(err.message || "Failed to load cart");
      
      // Handle auth errors
      if (await handleAuthError(err)) {
        return; // Don't show additional error if redirected
      }
      
      // Don't show toast on initial load failure
    } finally {
      setIsLoading(false);
    }
  };

  // Load cart on mount
  useEffect(() => {
    refreshCart();
  }, []);

  // Add item to cart
  const addToCart = async (
    productVariationId: number,
    quantity: number = 1
  ) => {
    try {
      setIsLoading(true);
      const updatedCart = await addToCartApi(productVariationId, quantity);
      setCart(updatedCart);

      Toast.show({
        type: "success",
        text1: "Đã thêm vào giỏ hàng",
        text2: "Sản phẩm đã được thêm thành công",
      });
    } catch (err: any) {
      console.error("Failed to add to cart:", err);
      
      // Handle auth errors
      if (await handleAuthError(err)) {
        return;
      }
      
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: err.message || "Không thể thêm vào giỏ hàng",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Remove item from cart with optimistic update
  const removeFromCart = async (productVariationId: number) => {
    if (!cart) return;

    try {
      // Optimistic update - remove item immediately from UI
      const itemToRemove = cart.items.find(
        (item) => item.productVariationId === productVariationId
      );

      if (itemToRemove) {
        const optimisticCart = { ...cart };
        optimisticCart.items = optimisticCart.items.filter(
          (item) => item.productVariationId !== productVariationId
        );

        // Update summary
        optimisticCart.summary.totalQuantity -= itemToRemove.quantity;
        optimisticCart.summary.totalAmount -= itemToRemove.totalPrice;
        optimisticCart.summary.uniqueItems -= 1;
        optimisticCart.totalItems = optimisticCart.summary.totalQuantity;
        optimisticCart.subtotal = optimisticCart.summary.totalAmount;
        optimisticCart.empty = optimisticCart.items.length === 0;

        // Apply optimistic update
        setCart(optimisticCart);
      }

      // Call API in background
      const updatedCart = await removeCartItemApi(productVariationId);

      // Update with real data from server
      setCart(updatedCart);

      Toast.show({
        type: "success",
        text1: "Đã xóa",
        text2: "Sản phẩm đã được xóa khỏi giỏ hàng",
      });
    } catch (err: any) {
      console.error("Failed to remove from cart:", err);

      // Handle auth errors
      if (await handleAuthError(err)) {
        return;
      }

      // Revert optimistic update by refreshing from server
      await refreshCart();

      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: err.message || "Không thể xóa sản phẩm",
      });
    }
  };

  // Update quantity with optimistic update
  const updateQuantity = async (
    productVariationId: number,
    quantity: number
  ) => {
    if (!cart) return;

    try {
      if (quantity <= 0) {
        await removeFromCart(productVariationId);
        return;
      }

      // Mark item as updating
      setUpdatingItems((prev) => new Set(prev).add(productVariationId));

      // Optimistic update - update UI immediately
      const optimisticCart = { ...cart };
      const itemIndex = optimisticCart.items.findIndex(
        (item) => item.productVariationId === productVariationId
      );

      if (itemIndex >= 0) {
        const item = optimisticCart.items[itemIndex];
        const oldQuantity = item.quantity;
        const quantityDiff = quantity - oldQuantity;

        // Update item
        optimisticCart.items[itemIndex] = {
          ...item,
          quantity,
          totalPrice: item.unitPrice * quantity,
        };

        // Update summary
        optimisticCart.summary.totalQuantity += quantityDiff;
        optimisticCart.summary.totalAmount =
          optimisticCart.summary.totalAmount -
          item.totalPrice +
          item.unitPrice * quantity;
        optimisticCart.totalItems = optimisticCart.summary.totalQuantity;
        optimisticCart.subtotal = optimisticCart.summary.totalAmount;

        // Apply optimistic update
        setCart(optimisticCart);
      }

      // Call API in background
      const updatedCart = await updateCartItemApi(productVariationId, quantity);

      // Update with real data from server
      setCart(updatedCart);
    } catch (err: any) {
      console.error("Failed to update quantity:", err);

      // Handle auth errors
      if (await handleAuthError(err)) {
        return;
      }

      // Revert optimistic update by refreshing from server
      await refreshCart();

      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: err.message || "Không thể cập nhật số lượng",
      });
    } finally {
      // Remove updating state
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(productVariationId);
        return next;
      });
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      setIsLoading(true);
      const updatedCart = await clearCartApi();
      setCart(updatedCart);

      Toast.show({
        type: "success",
        text1: "Đã xóa giỏ hàng",
        text2: "Tất cả sản phẩm đã được xóa",
      });
    } catch (err: any) {
      console.error("Failed to clear cart:", err);

      // Handle auth errors
      if (await handleAuthError(err)) {
        return;
      }

      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: err.message || "Không thể xóa giỏ hàng",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get cart item by variation ID
  const getCartItemByVariationId = (productVariationId: number) => {
    return cartItems.find(
      (item) => item.productVariationId === productVariationId
    );
  };

  // Format price helper
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartItems,
        totalAmount,
        itemCount,
        isLoading,
        error,
        updatingItems,
        refreshCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartItemByVariationId,
        formatPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
