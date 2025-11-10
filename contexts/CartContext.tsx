import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { useProduct } from "./ProductContext";

// Định nghĩa CartItem
export interface CartItem {
  id: string; // cart item id (unique)
  productId: string; // reference to Product.id
  quantity: number; // max 10
  addedAt: number; // timestamp
}

type CartContextType = {
  cartItems: CartItem[];
  totalAmount: number;
  itemCount: number;
  isLoading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartItem: (productId: string) => CartItem | undefined;
  getCartItemById: (cartItemId: string) => CartItem | undefined;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "CART_ITEMS";
const MAX_QUANTITY_PER_ITEM = 10;

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getProductById } = useProduct();

  // Restore cart on app start
  useEffect(() => {
    const initCart = async () => {
      try {
        const storedCart = await AsyncStorage.getItem(CART_STORAGE_KEY);
        if (storedCart) {
          const parsedCart: CartItem[] = JSON.parse(storedCart);
          setCartItems(parsedCart);
        }
      } catch (error) {
        console.error("Failed to load cart:", error);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to load cart data",
        });
      } finally {
        setIsLoading(false);
      }
    };
    initCart();
  }, []);

  // Save cart to storage whenever cartItems changes
  const saveCartToStorage = async (items: CartItem[]) => {
    try {
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Failed to save cart:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to save cart data",
      });
    }
  };

  // Calculate total amount using ProductContext
  const totalAmount = React.useMemo(() => {
    return cartItems.reduce((total, item) => {
      const product = getProductById(item.productId);
      if (product && product.displaySalePrice) {
        // Use displaySalePrice from API (already a number)
        return total + product.displaySalePrice * item.quantity;
      }
      return total;
    }, 0);
  }, [cartItems, getProductById]);

  // Calculate total item count
  const itemCount = React.useMemo(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  // Add item to cart
  const addToCart = async (productId: string, quantity: number = 1) => {
    try {
      const product = getProductById(productId);
      if (!product) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Product not found",
        });
        return;
      }

      // Check if product already in cart
      const existingItem = cartItems.find(
        (item) => item.productId === productId
      );

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > MAX_QUANTITY_PER_ITEM) {
          Toast.show({
            type: "error",
            text1: "Limit Reached",
            text2: `Cannot add more than ${MAX_QUANTITY_PER_ITEM} items`,
          });
          return;
        }
        await updateQuantity(existingItem.id, newQuantity);
      } else {
        if (quantity > MAX_QUANTITY_PER_ITEM) {
          Toast.show({
            type: "error",
            text1: "Limit Reached",
            text2: `Cannot add more than ${MAX_QUANTITY_PER_ITEM} items`,
          });
          return;
        }

        const newCartItem: CartItem = {
          id: `cart_${Date.now()}_${Math.random()}`,
          productId,
          quantity,
          addedAt: Date.now(),
        };

        const updatedItems = [...cartItems, newCartItem];
        setCartItems(updatedItems);
        await saveCartToStorage(updatedItems);

        Toast.show({
          type: "success",
          text1: "Added to Cart",
          text2: `${product.name} added successfully`,
        });
      }
    } catch (error) {
      console.error("Failed to add to cart:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to add item to cart",
      });
    }
  };

  // Remove item from cart
  const removeFromCart = async (cartItemId: string) => {
    try {
      const itemToRemove = cartItems.find((item) => item.id === cartItemId);
      const updatedItems = cartItems.filter((item) => item.id !== cartItemId);
      setCartItems(updatedItems);
      await saveCartToStorage(updatedItems);

      if (itemToRemove) {
        const product = getProductById(itemToRemove.productId);
        Toast.show({
          type: "success",
          text1: "Removed from Cart",
          text2: `${product?.name || "Item"} removed successfully`,
        });
      }
    } catch (error) {
      console.error("Failed to remove from cart:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to remove item from cart",
      });
    }
  };

  // Update quantity
  const updateQuantity = async (cartItemId: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        await removeFromCart(cartItemId);
        return;
      }

      if (quantity > MAX_QUANTITY_PER_ITEM) {
        Toast.show({
          type: "error",
          text1: "Limit Reached",
          text2: `Cannot add more than ${MAX_QUANTITY_PER_ITEM} items`,
        });
        return;
      }

      const updatedItems = cartItems.map((item) =>
        item.id === cartItemId ? { ...item, quantity } : item
      );
      setCartItems(updatedItems);
      await saveCartToStorage(updatedItems);

      Toast.show({
        type: "success",
        text1: "Updated",
        text2: "Quantity updated successfully",
      });
    } catch (error) {
      console.error("Failed to update quantity:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to update quantity",
      });
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      setCartItems([]);
      await saveCartToStorage([]);
      Toast.show({
        type: "success",
        text1: "Cart Cleared",
        text2: "All items removed from cart",
      });
    } catch (error) {
      console.error("Failed to clear cart:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to clear cart",
      });
    }
  };

  // Get cart item by product id
  const getCartItem = (productId: string) => {
    return cartItems.find((item) => item.productId === productId);
  };

  // Get cart item by cart item id
  const getCartItemById = (cartItemId: string) => {
    return cartItems.find((item) => item.id === cartItemId);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalAmount,
        itemCount,
        isLoading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartItem,
        getCartItemById,
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
