import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getProducts,
  ProductApiResponse,
  GetProductsParams,
} from "@/services/productApi";

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
  products: Product[]; // All products (unfiltered) - for Home
  filteredProducts: Product[]; // Filtered products - for Shop
  isLoading: boolean;
  error?: string;
  refreshProducts: () => Promise<void>;
  loadMoreProducts: () => Promise<void>;
  fetchProductsWithFilters: (params: GetProductsParams) => Promise<void>;
  loadMoreWithFilters: (params: GetProductsParams) => Promise<void>;
  getProductById: (id: number | string) => Product | undefined;
  searchProducts: (query: string) => Product[];
  formatPrice: (price: number) => string;
  // Pagination info
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
  totalElements: number;
  // Filtered products pagination
  filteredHasMore: boolean;
  filteredCurrentPage: number;
  filteredTotalPages: number;
  filteredTotalElements: number;
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
  // All products state (unfiltered - for Home)
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Filtered products state (for Shop with filters)
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [filteredCurrentPage, setFilteredCurrentPage] = useState(0);
  const [filteredTotalPages, setFilteredTotalPages] = useState(0);
  const [filteredTotalElements, setFilteredTotalElements] = useState(0);
  const [filteredHasMore, setFilteredHasMore] = useState(true);

  // Track ongoing requests to prevent duplicates
  const activeRequestRef = React.useRef<AbortController | null>(null);

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

      // Initially, filteredProducts = products (no filter)
      setFilteredProducts(response.content);
      setFilteredCurrentPage(response.page.number);
      setFilteredTotalPages(response.page.totalPages);
      setFilteredTotalElements(response.page.totalElements);
      setFilteredHasMore(response.page.number < response.page.totalPages - 1);
    } catch (e: any) {
      setError(e?.message || "Failed to load products");
      setProducts([]);
      setFilteredProducts([]);
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

  // Hàm fetch sản phẩm với filters (trang đầu tiên)
  const fetchProductsWithFilters = React.useCallback(
    async (params: GetProductsParams) => {
      // Cancel any ongoing request
      if (activeRequestRef.current) {
        activeRequestRef.current.abort();
      }

      // Create new abort controller for this request
      activeRequestRef.current = new AbortController();

      setIsLoading(true);
      setError(undefined);
      try {
        const response = await getProducts({ ...params, page: 0, size: 20 });

        // Only update state if request wasn't aborted
        if (!activeRequestRef.current?.signal.aborted) {
          setFilteredProducts(response.content);
          setFilteredCurrentPage(response.page.number);
          setFilteredTotalPages(response.page.totalPages);
          setFilteredTotalElements(response.page.totalElements);
          setFilteredHasMore(
            response.page.number < response.page.totalPages - 1
          );
        }
      } catch (e: any) {
        // Only update error if request wasn't aborted
        if (!activeRequestRef.current?.signal.aborted) {
          setError(e?.message || "Failed to load products");
          setFilteredProducts([]);
        }
      } finally {
        // Only clear loading if request wasn't aborted
        if (!activeRequestRef.current?.signal.aborted) {
          setIsLoading(false);
          activeRequestRef.current = null;
        }
      }
    },
    []
  );

  // Hàm tải thêm sản phẩm với filters (infinite scroll)
  const loadMoreWithFilters = React.useCallback(
    async (params: GetProductsParams) => {
      if (!filteredHasMore || isLoadingMore) return;

      setIsLoadingMore(true);
      try {
        const nextPage = filteredCurrentPage + 1;
        const response = await getProducts({
          ...params,
          page: nextPage,
          size: 20,
        });

        setFilteredProducts((prev) => [...prev, ...response.content]);
        setFilteredCurrentPage(response.page.number);
        setFilteredTotalPages(response.page.totalPages);
        setFilteredTotalElements(response.page.totalElements);
        setFilteredHasMore(response.page.number < response.page.totalPages - 1);
      } catch (e: any) {
        setError(e?.message || "Failed to load more products");
      } finally {
        setIsLoadingMore(false);
      }
    },
    [filteredHasMore, isLoadingMore, filteredCurrentPage]
  );

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
        filteredProducts,
        isLoading,
        error,
        refreshProducts,
        loadMoreProducts,
        fetchProductsWithFilters,
        loadMoreWithFilters,
        getProductById,
        searchProducts,
        formatPrice,
        hasMore,
        currentPage,
        totalPages,
        totalElements,
        filteredHasMore,
        filteredCurrentPage,
        filteredTotalPages,
        filteredTotalElements,
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
