import { apiClient, ApiResponse } from "./apiClient";

export interface WishlistProduct {
  id: number;
  name: string;
  imageUrl: string | null;
  warrantyMonths: number | null;
  displayOriginalPrice: number;
  displaySalePrice: number;
  discountType: "PERCENTAGE" | "FIXED" | null;
  discountValue: number | null;
  averageRating: number;
  totalRatings: number;
}

export interface PageInfo {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

export interface WishlistResponse {
  content: WishlistProduct[];
  page: PageInfo;
}

export interface AddToWishlistRequest {
  productId: number;
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

  const response = await apiClient.get<WishlistResponse>(
    `/wishlists?${queryParams.toString()}`
  );
  
  if (!response.data) {
    return {
      content: [],
      page: {
        size: params?.size || 20,
        number: params?.page || 0,
        totalElements: 0,
        totalPages: 0,
      },
    };
  }
  
  return response.data;
};

/**
 * Thêm sản phẩm vào wishlist
 */
export const addToWishlist = async (
  productId: number
): Promise<void> => {
  await apiClient.post("/wishlists", {
    productId,
  });
};

/**
 * Xóa sản phẩm khỏi wishlist
 */
export const removeFromWishlist = async (productId: number): Promise<void> => {
  await apiClient.delete(`/wishlists/${productId}`);
};
