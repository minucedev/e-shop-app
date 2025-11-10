import React, { createContext, useContext, useEffect, useState } from "react";
import { getProducts, ProductApiResponse } from "@/services/productApi";

// Định nghĩa kiểu sản phẩm dựa trên API response
export type Product = {
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
};

// Helper type để format giá hiển thị
export type ProductDisplay = Product & {
  formattedPrice: string;
};

type ProductContextType = {
  products: Product[];
  isLoading: boolean;
  error?: string;
  refreshProducts: () => Promise<void>;
  loadMoreProducts: () => Promise<void>;
  getProductById: (id: number | string) => Product | undefined;
  searchProducts: (query: string) => Product[];
  formatPrice: (price: number) => string;
  // Pagination info
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
  totalElements: number;
};

// Filter types
export type ProductFilter = {
  searchQuery?: string;
};

export type SortOption =
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc"
  | "rating-desc"
  | "newest";

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Hàm lấy sản phẩm trang đầu tiên
  const refreshProducts = async () => {
    setIsLoading(true);
    setError(undefined);
    try {
      const response = await getProducts({ page: 0, size: 20 });

      setProducts(response.content);
      setCurrentPage(response.page.number);
      setTotalPages(response.page.totalPages);
      setTotalElements(response.page.totalElements);
      setHasMore(response.page.number < response.page.totalPages - 1);
    } catch (e: any) {
      setError(e?.message || "Failed to load products");
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm tải thêm sản phẩm (infinite scroll)
  const loadMoreProducts = async () => {
    if (!hasMore || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const response = await getProducts({ page: nextPage, size: 20 });

      setProducts((prev) => [...prev, ...response.content]);
      setCurrentPage(response.page.number);
      setTotalPages(response.page.totalPages);
      setTotalElements(response.page.totalElements);
      setHasMore(response.page.number < response.page.totalPages - 1);
    } catch (e: any) {
      setError(e?.message || "Failed to load more products");
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    refreshProducts();
  }, []);

  // Tìm sản phẩm theo id
  const getProductById = (id: number | string) => {
    const numId = typeof id === "string" ? parseInt(id, 10) : id;
    return products.find((p) => p.id === numId);
  };

  // Tìm kiếm sản phẩm theo tên
  const searchProducts = (query: string) => {
    const q = query.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(q));
  };

  // Format giá để hiển thị (VND)
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        isLoading,
        error,
        refreshProducts,
        loadMoreProducts,
        getProductById,
        searchProducts,
        formatPrice,
        hasMore,
        currentPage,
        totalPages,
        totalElements,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

// Export formatPrice function để sử dụng độc lập
export const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

export const useProduct = () => {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error("useProduct must be used within ProductProvider");
  return ctx;
};
