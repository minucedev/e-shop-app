import { apiClient } from "./apiClient";

export interface WishlistProduct {
  id: number;
  name: string;
  imageUrl: string;
  warrantyMonths: number;
  displayOriginalPrice: number;
  displaySalePrice: number;
  discountType: "PERCENTAGE" | "FIXED" | null;
  discountValue: number | null;
  averageRating: number;
  totalRatings: number;
}

export interface WishlistResponse {
  content: WishlistProduct[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

export interface AddToWishlistRequest {
  productId: number;
}

export interface CheckWishlistRequest {
  productIds: number[];
}

export interface CheckWishlistResponse {
  [productId: string]: boolean;
}

/**
 * Lấy danh sách sản phẩm yêu thích với phân trang
 */
export const getWishlists = async (params?: {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: "ASC" | "DESC";
}): Promise<WishlistResponse> => {
  const queryParams = new URLSearchParams();

  if (params?.page !== undefined) {
    queryParams.append("page", params.page.toString());
  }
  if (params?.size !== undefined) {
    queryParams.append("size", params.size.toString());
  }
  if (params?.sortBy) {
    queryParams.append("sortBy", params.sortBy);
  }
  if (params?.sortDirection) {
    queryParams.append("sortDirection", params.sortDirection);
  }

  const response = await apiClient.get(`/wishlists?${queryParams.toString()}`);
  return response.data as WishlistResponse;
};

/**
 * Thêm sản phẩm vào wishlist
 */
export const addToWishlist = async (
  productId: number
): Promise<WishlistProduct> => {
  const response = await apiClient.post("/wishlists", {
    productId,
  });
  return response.data as WishlistProduct;
};

/**
 * Xóa sản phẩm khỏi wishlist
 */
export const removeFromWishlist = async (productId: number): Promise<void> => {
  await apiClient.delete(`/wishlists/${productId}`);
};

/**
 * Kiểm tra nhiều sản phẩm có trong wishlist hay không
 * Dùng để hiển thị heart icons
 */
export const checkWishlistStatus = async (
  productIds: number[]
): Promise<CheckWishlistResponse> => {
  if (productIds.length === 0) {
    return {};
  }

  const response = await apiClient.post("/wishlists/check", {
    productIds,
  });
  return response.data as CheckWishlistResponse;
};
