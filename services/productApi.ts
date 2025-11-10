// services/productApi.ts

import { apiClient } from "./apiClient";

// Định nghĩa kiểu dữ liệu theo API response
export interface ProductApiResponse {
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

export interface ProductsPageResponse {
  content: ProductApiResponse[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface GetProductsParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: "ASC" | "DESC";
}

// Product Detail Types
export interface ProductAttribute {
  id: number;
  name: string;
  value: string;
}

export interface VariationImage {
  id: number;
  imageUrl: string;
}

export interface ProductVariation {
  id: number;
  variationName: string;
  price: number;
  availableQuantity: number;
  salePrice: number;
  discountType: "PERCENTAGE" | "FIXED" | null;
  discountValue: number | null;
  images: VariationImage[];
  attributes: ProductAttribute[];
}

export interface ProductDetailResponse {
  id: number;
  name: string;
  description: string;
  categoryId: number;
  categoryName: string;
  brandId: number;
  brandName: string;
  imageUrl: string | null;
  imagePublicId: string | null;
  warrantyMonths: number | null;
  averageRating: number;
  totalRatings: number;
  displayOriginalPrice: number;
  displaySalePrice: number;
  discountType: "PERCENTAGE" | "FIXED" | null;
  discountValue: number | null;
  attributes: ProductAttribute[];
  variations: ProductVariation[];
}

/**
 * Lấy danh sách sản phẩm với phân trang
 */
export const getProducts = async (
  params: GetProductsParams = {}
): Promise<ProductsPageResponse> => {
  const { page = 0, size = 20, sortBy = "id", sortDirection = "ASC" } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    sortBy,
    sortDirection,
  });

  const response = await apiClient.get<ProductsPageResponse>(
    `/products?${queryParams.toString()}`
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to fetch products");
  }

  return response.data;
};

/**
 * Lấy chi tiết sản phẩm theo ID
 */
export const getProductDetail = async (
  productId: number | string
): Promise<ProductDetailResponse> => {
  const response = await apiClient.get<ProductDetailResponse>(
    `/products/${productId}`
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to fetch product detail");
  }

  return response.data;
};
