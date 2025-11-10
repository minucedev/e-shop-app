import { apiClient } from "./apiClient";

// Types
export interface CartItemResponse {
  id: number;
  productVariationId: number;
  productName: string;
  productImage: string | null;
  variantName: string;
  quantity: number;
  originalPrice: number;
  unitPrice: number;
  totalPrice: number;
  discountType: "PERCENTAGE" | "FIXED" | null;
  discountValue: number | null;
  addedAt: string;
  updatedAt: string;
  sku: string;
  stockQuantity: number;
  available: boolean;
}

export interface CartSummary {
  totalQuantity: number;
  totalAmount: number;
  uniqueItems: number;
  hasUnavailableItems: boolean;
}

export interface CartResponse {
  id: number;
  userId: number;
  items: CartItemResponse[];
  totalItems: number;
  subtotal: number;
  createdAt: string;
  updatedAt: string;
  summary: CartSummary;
  empty: boolean;
}

export interface AddToCartRequest {
  productVariationId: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface CartCountResponse {
  totalItems: number;
  uniqueItems: number;
}

// API Functions

/**
 * Get user's cart
 */
export const getCart = async (): Promise<CartResponse> => {
  const response = await apiClient.get("/cart");
  return response.data as CartResponse;
};

/**
 * Add item to cart
 * POST /cart/add
 */
export const addToCart = async (
  productVariationId: number,
  quantity: number
): Promise<CartResponse> => {
  const response = await apiClient.post("/cart/add", {
    productVariationId,
    quantity,
  });
  return response.data as CartResponse;
};

/**
 * Update cart item quantity by productVariationId
 * PUT /cart/items/:productVariationId
 */
export const updateCartItem = async (
  productVariationId: number,
  quantity: number
): Promise<CartResponse> => {
  const response = await apiClient.put(`/cart/items/${productVariationId}`, {
    quantity,
  });
  return response.data as CartResponse;
};

/**
 * Remove item from cart by productVariationId
 * DELETE /cart/items/:productVariationId
 */
export const removeCartItem = async (
  productVariationId: number
): Promise<CartResponse> => {
  const response = await apiClient.delete(`/cart/items/${productVariationId}`);
  return response.data as CartResponse;
};

/**
 * Clear cart (remove all items)
 * DELETE /cart/clear
 */
export const clearCart = async (): Promise<CartResponse> => {
  const response = await apiClient.delete("/cart/clear");
  return response.data as CartResponse;
};

/**
 * Get cart item count
 * GET /cart/count
 */
export const getCartCount = async (): Promise<CartCountResponse> => {
  const response = await apiClient.get("/cart/count");
  return response.data as CartCountResponse;
};
