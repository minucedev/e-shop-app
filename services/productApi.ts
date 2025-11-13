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
  // Pagination
  page?: number;
  size?: number;

  // Sorting
  sortBy?: string;
  sortDirection?: "ASC" | "DESC";

  // Filters
  name?: string; // Tìm kiếm theo tên sản phẩm
  brandId?: number; // Lọc theo thương hiệu
  categoryId?: number; // Lọc theo danh mục
  minPrice?: number; // Giá tối thiểu
  maxPrice?: number; // Giá tối đa
  minRating?: number; // Đánh giá tối thiểu (0-5)
  campaignId?: number; // Lọc sản phẩm theo chiến dịch khuyến mãi
  attributes?: string[]; // Lọc theo thuộc tính (VD: ["RAM:8GB", "Color:Black"])
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
 * Lấy danh sách sản phẩm với phân trang và filter
 */
export const getProducts = async (
  params: GetProductsParams = {}
): Promise<ProductsPageResponse> => {
  const {
    page = 0,
    size = 20,
    sortBy = "id",
    sortDirection = "ASC",
    name,
    brandId,
    categoryId,
    minPrice,
    maxPrice,
    minRating,
    campaignId,
    attributes,
  } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    sortBy,
    sortDirection,
  });

  // Thêm các filter parameters nếu có
  if (name) queryParams.append("name", name);
  if (brandId !== undefined) queryParams.append("brandId", brandId.toString());
  if (categoryId !== undefined)
    queryParams.append("categoryId", categoryId.toString());
  if (minPrice !== undefined)
    queryParams.append("minPrice", minPrice.toString());
  if (maxPrice !== undefined)
    queryParams.append("maxPrice", maxPrice.toString());
  if (minRating !== undefined)
    queryParams.append("minRating", minRating.toString());
  if (campaignId !== undefined)
    queryParams.append("campaignId", campaignId.toString());
  if (attributes && attributes.length > 0) {
    attributes.forEach((attr) => queryParams.append("attributes", attr));
  }

  const url = `/products?${queryParams.toString()}`;
  console.log("[productApi] Fetching products with URL:", url);
  console.log("[productApi] Campaign ID in params:", campaignId);

  const response = await apiClient.get<ProductsPageResponse>(url);

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
