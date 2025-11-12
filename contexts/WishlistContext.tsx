import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as wishlistApi from "../services/wishlistApi";
import { useAuth } from "./AuthContext";

// Feature flag - set to false if backend doesn't have wishlist API yet
const WISHLIST_API_ENABLED = false; // TODO: Set to true when backend implements wishlist API

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

export interface WishlistState {
  items: WishlistProduct[];
  wishlistProductIds: Set<number>;
  isLoading: boolean;
  isLoadingMore: boolean;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
}

interface WishlistContextType extends WishlistState {
  // Core functions
  loadWishlist: () => Promise<void>;
  loadMoreWishlist: () => Promise<void>;
  addToWishlist: (productId: number) => Promise<void>;
  removeFromWishlist: (productId: number) => Promise<void>;
  isInWishlist: (productId: number) => boolean;
  toggleWishlist: (productId: number) => Promise<void>;

  // Utility functions
  refreshWishlist: () => Promise<void>;
  checkMultipleProducts: (productIds: number[]) => Promise<void>;
  clearWishlistState: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};

interface WishlistProviderProps {
  children: ReactNode;
}

export const WishlistProvider: React.FC<WishlistProviderProps> = ({
  children,
}) => {
  const { user } = useAuth();
  const isAuthenticated = !!user; // Tính toán dựa trên user

  const [state, setState] = useState<WishlistState>({
    items: [],
    wishlistProductIds: new Set(),
    isLoading: false,
    isLoadingMore: false,
    currentPage: 0,
    totalPages: 0,
    hasMore: false,
  });

  // Optimistic updates tracking
  const [optimisticUpdates, setOptimisticUpdates] = useState<Set<number>>(
    new Set()
  );

  // Local storage key
  const STORAGE_KEY = "@wishlist_ids";

  // Local storage functions (fallback when API not available)
  const loadLocalWishlist = async (): Promise<Set<number>> => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const ids = JSON.parse(stored);
        return new Set(ids);
      }
    } catch (error) {
      console.error("Error loading local wishlist:", error);
    }
    return new Set();
  };

  const saveLocalWishlist = async (ids: Set<number>) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
    } catch (error) {
      console.error("Error saving local wishlist:", error);
    }
  };

  // Clear state when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      clearWishlistState();
    } else if (!WISHLIST_API_ENABLED) {
      // Load from local storage on mount if API disabled
      loadLocalWishlist().then((ids) => {
        setState((prev) => ({
          ...prev,
          wishlistProductIds: ids,
        }));
      });
    }
  }, [isAuthenticated]);

  const clearWishlistState = () => {
    setState({
      items: [],
      wishlistProductIds: new Set(),
      isLoading: false,
      isLoadingMore: false,
      currentPage: 0,
      totalPages: 0,
      hasMore: false,
    });
    setOptimisticUpdates(new Set());

    // Clear local storage too
    if (!WISHLIST_API_ENABLED) {
      AsyncStorage.removeItem(STORAGE_KEY);
    }
  };

  const loadWishlist = async () => {
    if (!isAuthenticated) {
      clearWishlistState();
      return;
    }

    // Use local storage fallback if API disabled
    if (!WISHLIST_API_ENABLED) {
      try {
        setState((prev) => ({ ...prev, isLoading: true }));
        const ids = await loadLocalWishlist();

        setState((prev) => ({
          ...prev,
          wishlistProductIds: ids,
          items: [],
          isLoading: false,
          hasMore: false,
        }));
      } catch (error) {
        console.error("Error loading local wishlist:", error);
        setState((prev) => ({ ...prev, isLoading: false }));
      }
      return;
    }

    // Use API if enabled
    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      const response = await wishlistApi.getWishlists({ page: 0, size: 20 });

      const productIds = new Set(response.content.map((item) => item.id));

      setState((prev) => ({
        ...prev,
        items: response.content,
        wishlistProductIds: productIds,
        currentPage: response.pageable.pageNumber,
        totalPages: response.totalPages,
        hasMore: !response.last,
        isLoading: false,
      }));
    } catch (error: any) {
      console.error("Error loading wishlist:", error);
      setState((prev) => ({ ...prev, isLoading: false }));

      // Only show toast if it's not a 500 error (backend not implemented)
      if (!error.message?.includes("Server error")) {
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: error.message || "Không thể tải danh sách yêu thích",
        });
      } else {
        console.warn(
          "⚠️ Wishlist API not available - Backend may not be implemented yet"
        );
      }
    }
  };

  const loadMoreWishlist = async () => {
    if (!isAuthenticated || state.isLoadingMore || !state.hasMore) {
      return;
    }

    try {
      setState((prev) => ({ ...prev, isLoadingMore: true }));

      const nextPage = state.currentPage + 1;
      const response = await wishlistApi.getWishlists({
        page: nextPage,
        size: 20,
      });

      const newProductIds = new Set([
        ...state.wishlistProductIds,
        ...response.content.map((item) => item.id),
      ]);

      setState((prev) => ({
        ...prev,
        items: [...prev.items, ...response.content],
        wishlistProductIds: newProductIds,
        currentPage: response.pageable.pageNumber,
        totalPages: response.totalPages,
        hasMore: !response.last,
        isLoadingMore: false,
      }));
    } catch (error: any) {
      console.error("Error loading more wishlist:", error);
      setState((prev) => ({ ...prev, isLoadingMore: false }));

      // Only show toast if it's not a 500 error
      if (!error.message?.includes("Server error")) {
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: error.message || "Không thể tải thêm sản phẩm",
        });
      }
    }
  };

  const addToWishlist = async (productId: number) => {
    if (!isAuthenticated) {
      Toast.show({
        type: "error",
        text1: "Chưa đăng nhập",
        text2: "Vui lòng đăng nhập để sử dụng danh sách yêu thích",
      });
      return;
    }

    // Optimistic update
    const newWishlistIds = new Set([...state.wishlistProductIds, productId]);
    setState((prev) => ({
      ...prev,
      wishlistProductIds: newWishlistIds,
    }));
    setOptimisticUpdates((prev) => new Set([...prev, productId]));

    // Use local storage fallback if API disabled
    if (!WISHLIST_API_ENABLED) {
      try {
        await saveLocalWishlist(newWishlistIds);

        setOptimisticUpdates((prev) => {
          const updated = new Set(prev);
          updated.delete(productId);
          return updated;
        });

        Toast.show({
          type: "success",
          text1: "Thành công",
          text2: "Đã thêm vào danh sách yêu thích",
        });
      } catch (error) {
        console.error("Error saving to local wishlist:", error);

        // Revert optimistic update
        setState((prev) => ({
          ...prev,
          wishlistProductIds: new Set(
            [...prev.wishlistProductIds].filter((id) => id !== productId)
          ),
        }));
        setOptimisticUpdates((prev) => {
          const updated = new Set(prev);
          updated.delete(productId);
          return updated;
        });

        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: "Không thể lưu vào danh sách yêu thích",
        });
      }
      return;
    }

    // Use API if enabled
    try {
      const newProduct = await wishlistApi.addToWishlist(productId);

      // Update with actual data from API
      setState((prev) => ({
        ...prev,
        items: [newProduct, ...prev.items],
        wishlistProductIds: new Set([...prev.wishlistProductIds, productId]),
      }));

      setOptimisticUpdates((prev) => {
        const updated = new Set(prev);
        updated.delete(productId);
        return updated;
      });

      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: "Đã thêm vào danh sách yêu thích",
      });
    } catch (error: any) {
      console.error("Error adding to wishlist:", error);

      // Revert optimistic update
      setState((prev) => ({
        ...prev,
        wishlistProductIds: new Set(
          [...prev.wishlistProductIds].filter((id) => id !== productId)
        ),
      }));
      setOptimisticUpdates((prev) => {
        const updated = new Set(prev);
        updated.delete(productId);
        return updated;
      });

      if (error.response?.status === 400) {
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: "Sản phẩm đã có trong danh sách yêu thích",
        });
      } else if (!error.message?.includes("Server error")) {
        // Only show error toast if not a 500 error
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: error.message || "Không thể thêm vào danh sách yêu thích",
        });
      } else {
        console.warn(
          "⚠️ Wishlist add API not available - Backend may not be implemented yet"
        );
      }
    }
  };

  const removeFromWishlist = async (productId: number) => {
    if (!isAuthenticated) {
      return;
    }

    // Optimistic update
    const originalItems = state.items;
    const originalProductIds = state.wishlistProductIds;
    const newWishlistIds = new Set(
      [...state.wishlistProductIds].filter((id) => id !== productId)
    );

    setState((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== productId),
      wishlistProductIds: newWishlistIds,
    }));
    setOptimisticUpdates((prev) => new Set([...prev, productId]));

    // Use local storage fallback if API disabled
    if (!WISHLIST_API_ENABLED) {
      try {
        await saveLocalWishlist(newWishlistIds);

        // Confirm removal
        setOptimisticUpdates((prev) => {
          const updated = new Set(prev);
          updated.delete(productId);
          return updated;
        });

        Toast.show({
          type: "success",
          text1: "Thành công",
          text2: "Đã xóa khỏi danh sách yêu thích",
        });
      } catch (error) {
        console.error("Error removing from local wishlist:", error);

        // Revert optimistic update
        setState((prev) => ({
          ...prev,
          items: originalItems,
          wishlistProductIds: originalProductIds,
        }));
        setOptimisticUpdates((prev) => {
          const updated = new Set(prev);
          updated.delete(productId);
          return updated;
        });

        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: "Không thể xóa khỏi danh sách yêu thích",
        });
      }
      return;
    }

    // Use API if enabled
    try {
      await wishlistApi.removeFromWishlist(productId);

      // Confirm removal
      setOptimisticUpdates((prev) => {
        const updated = new Set(prev);
        updated.delete(productId);
        return updated;
      });

      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: "Đã xóa khỏi danh sách yêu thích",
      });
    } catch (error: any) {
      console.error("Error removing from wishlist:", error);

      // Revert optimistic update
      setState((prev) => ({
        ...prev,
        items: originalItems,
        wishlistProductIds: originalProductIds,
      }));
      setOptimisticUpdates((prev) => {
        const updated = new Set(prev);
        updated.delete(productId);
        return updated;
      });

      // Only show error toast if not a 500 error
      if (!error.message?.includes("Server error")) {
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: error.message || "Không thể xóa khỏi danh sách yêu thích",
        });
      } else {
        console.warn(
          "⚠️ Wishlist remove API not available - Backend may not be implemented yet"
        );
      }
    }
  };

  const isInWishlist = (productId: number): boolean => {
    return state.wishlistProductIds.has(productId);
  };

  const toggleWishlist = async (productId: number) => {
    if (isInWishlist(productId)) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
  };

  const refreshWishlist = async () => {
    await loadWishlist();
  };

  const checkMultipleProducts = async (productIds: number[]) => {
    if (!isAuthenticated || productIds.length === 0) {
      return;
    }

    try {
      const statusMap = await wishlistApi.checkWishlistStatus(productIds);

      const wishlistIds = new Set<number>();
      Object.entries(statusMap).forEach(([productId, isInWishlist]) => {
        if (isInWishlist) {
          wishlistIds.add(parseInt(productId));
        }
      });

      setState((prev) => ({
        ...prev,
        wishlistProductIds: new Set([
          ...prev.wishlistProductIds,
          ...wishlistIds,
        ]),
      }));
    } catch (error: any) {
      console.error("Error checking wishlist status:", error);
    }
  };

  const contextValue: WishlistContextType = {
    ...state,
    loadWishlist,
    loadMoreWishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    toggleWishlist,
    refreshWishlist,
    checkMultipleProducts,
    clearWishlistState,
  };

  return (
    <WishlistContext.Provider value={contextValue}>
      {children}
    </WishlistContext.Provider>
  );
};
