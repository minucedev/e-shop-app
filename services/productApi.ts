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
  console.log("📦 [productApi] Fetching products:");
  console.log("   URL:", url);
  console.log("   Params:", {
    page,
    size,
    sortBy,
    sortDirection,
    name,
    brandId,
    categoryId,
    minPrice,
    maxPrice,
    minRating,
    campaignId,
  });

  const response = await apiClient.get<ProductsPageResponse>(url);

  if (!response.success || !response.data) {
    console.error("❌ [productApi] Failed to fetch products:", response.error);
    throw new Error(response.error || "Failed to fetch products");
  }

  console.log("✅ [productApi] Products loaded:", {
    total: response.data.page.totalElements,
    page: response.data.page.number,
    size: response.data.content.length,
    totalPages: response.data.page.totalPages,
  });

  return response.data;
};

/**
 * Lấy chi tiết sản phẩm theo ID
 */
export const getProductDetail = async (
  productId: number | string
): Promise<ProductDetailResponse> => {
  console.log("🔍 [productApi] Fetching product detail:", productId);

  const response = await apiClient.get<ProductDetailResponse>(
    `/products/${productId}`
  );

  if (!response.success || !response.data) {
    console.error(
      "❌ [productApi] Failed to fetch product detail:",
      response.error
    );
    throw new Error(response.error || "Failed to fetch product detail");
  }

  console.log("✅ [productApi] Product detail loaded:", response.data.name);

  return response.data;
};

/**
 * Lấy danh sách sản phẩm theo SPU codes (batch fetch)
 * Dùng cho AI Chatbot khi trả về related_products
 *
 * @param spus - Mảng SPU codes (VD: ["LAP001", "LAP002", "MOUSE03"])
 * @returns Mảng ProductApiResponse
 *
 * API Endpoint: GET /products/by-spus?spus=LAP001&spus=LAP002&size=10
 */
export const getProductsBySpus = async (
  spus: string[]
): Promise<ProductApiResponse[]> => {
  if (!spus || spus.length === 0) {
    return [];
  }

  console.log("🔍 [productApi] Fetching products by SPUs:", spus);

  try {
    // Build query string: ?spus=LAP001&spus=LAP002&spus=LAP003&size=10
    const queryParams = new URLSearchParams();
    spus.forEach((spu) => queryParams.append("spus", spu));
    queryParams.append("size", spus.length.toString());

    const url = `/products/by-spus?${queryParams.toString()}`;

    console.log("📡 [productApi] Request URL:", url);

    const response = await apiClient.get<ProductsPageResponse>(url);

    if (!response.success || !response.data) {
      console.error(
        "❌ [productApi] Failed to fetch products by SPUs:",
        response.error
      );
      return [];
    }

    // Extract content array from paginated response
    const products = response.data.content || [];

    console.log(
      "✅ [productApi] Products loaded by SPUs:",
      products.length,
      "products"
    );

    return products;
  } catch (error: any) {
    console.error(
      "❌ [productApi] Error fetching products by SPUs:",
      error.message
    );
    return [];
  }
};
