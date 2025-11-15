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

// Feature flag - set to true when backend has wishlist API
const WISHLIST_API_ENABLED = true; // ✅ API is now available

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

export interface WishlistState {
  items: WishlistProduct[];
  wishlistProductIds: Set<number>;
  isLoading: boolean;
  isLoadingMore: boolean;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
  needsRefresh: boolean; // Flag to indicate favorites tab needs refresh
}

interface WishlistContextType extends WishlistState {
  // Core functions
  loadWishlist: (silent?: boolean) => Promise<void>;
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
    needsRefresh: false,
  });

  // Optimistic updates tracking
  const [optimisticUpdates, setOptimisticUpdates] = useState<Set<number>>(
    new Set()
  );

  // Track which products we've already checked to avoid redundant API calls
  const checkedProductsRef = React.useRef<Set<number>>(new Set());

  // Debounce timer for batch checking
  const checkTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const pendingCheckIdsRef = React.useRef<Set<number>>(new Set());

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

    // Cleanup timer on unmount
    return () => {
      if (checkTimerRef.current) {
        clearTimeout(checkTimerRef.current);
      }
    };
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
      needsRefresh: false,
    });
    setOptimisticUpdates(new Set());
    checkedProductsRef.current = new Set();

    // Clear local storage too
    if (!WISHLIST_API_ENABLED) {
      AsyncStorage.removeItem(STORAGE_KEY);
    }
  };

  const loadWishlist = async (silent = false) => {
    if (!isAuthenticated) {
      clearWishlistState();
      return;
    }

    // Use local storage fallback if API disabled
    if (!WISHLIST_API_ENABLED) {
      try {
        if (!silent) {
          setState((prev) => ({ ...prev, isLoading: true }));
        }
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
      if (!silent) {
        setState((prev) => ({ ...prev, isLoading: true }));
      }

      const response = await wishlistApi.getWishlists({ page: 0, size: 20 });

      const productIds = new Set(response.content.map((item) => item.id));

      // Clear checked cache since we have fresh data
      checkedProductsRef.current = new Set(productIds);

      setState((prev) => ({
        ...prev,
        items: response.content,
        wishlistProductIds: productIds,
        currentPage: response.page.number,
        totalPages: response.page.totalPages,
        hasMore: response.page.number < response.page.totalPages - 1,
        isLoading: false,
        needsRefresh: false, // Reset refresh flag
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
        currentPage: response.page.number,
        totalPages: response.page.totalPages,
        hasMore: response.page.number < response.page.totalPages - 1,
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

    // Optimistic update - add to UI immediately
    setState((prev) => ({
      ...prev,
      wishlistProductIds: new Set([...prev.wishlistProductIds, productId]),
    }));
    setOptimisticUpdates((prev) => new Set([...prev, productId]));

    // Use local storage fallback if API disabled
    if (!WISHLIST_API_ENABLED) {
      try {
        const updatedIds = new Set([...state.wishlistProductIds, productId]);
        await saveLocalWishlist(updatedIds);

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
      await wishlistApi.addToWishlist(productId);

      // Mark as checked with correct status (in wishlist)
      checkedProductsRef.current.add(productId);

      // Optimistic update was correct, just mark as needing refresh
      setState((prev) => ({
        ...prev,
        needsRefresh: true, // Mark that favorites tab needs refresh
      }));

      // Confirm optimistic update was correct
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

      // Handle 'already in wishlist' error - treat as success, keep optimistic update
      if (
        error.response?.status === 400 &&
        (error.message?.includes("already in wishlist") ||
          error.response?.data?.message?.includes("already in wishlist"))
      ) {
        // Product is already in wishlist, keep the optimistic update
        setState((prev) => ({
          ...prev,
          needsRefresh: true,
        }));
        checkedProductsRef.current.add(productId);
        setOptimisticUpdates((prev) => {
          const updated = new Set(prev);
          updated.delete(productId);
          return updated;
        });
        return; // Don't show error toast, don't revert
      }

      // For other errors, revert optimistic update
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

    // Save original state for potential revert
    const originalItems = state.items;
    const originalProductIds = state.wishlistProductIds;

    // Create new state without the removed product
    const newWishlistIds = new Set(
      [...state.wishlistProductIds].filter((id) => id !== productId)
    );
    const newItems = state.items.filter((item) => item.id !== productId);

    // Optimistic update - remove from UI immediately
    setState((prev) => ({
      ...prev,
      items: newItems,
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

      // Mark as checked with correct status (not in wishlist)
      checkedProductsRef.current.delete(productId);

      // Optimistic update was correct, just mark as needing refresh and confirm
      setState((prev) => ({
        ...prev,
        needsRefresh: true, // Mark that favorites tab needs refresh
      }));

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

      // Handle specific error cases
      const is404 = error.response?.status === 404;
      const isProductDeleted =
        error.message?.includes("not found") ||
        error.message?.includes("does not exist") ||
        error.response?.data?.message?.includes("not found");

      // If product is already removed or doesn't exist, treat as success
      if (is404 || isProductDeleted) {
        console.log("Product not in wishlist or deleted, treating as success");

        // Keep the optimistic update (already removed from UI)
        checkedProductsRef.current.delete(productId);

        setOptimisticUpdates((prev) => {
          const updated = new Set(prev);
          updated.delete(productId);
          return updated;
        });

        Toast.show({
          type: "info",
          text1: "Đã cập nhật",
          text2: "Sản phẩm không còn trong danh sách yêu thích",
        });
        return;
      }

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

  // Check multiple products using the bulk check API with debouncing
  const checkMultipleProducts = async (productIds: number[]) => {
    if (!isAuthenticated || productIds.length === 0) {
      return;
    }

    // If API is disabled, status is already in state
    if (!WISHLIST_API_ENABLED) {
      return;
    }

    // Add to pending check queue
    productIds.forEach((id) => {
      if (!checkedProductsRef.current.has(id)) {
        pendingCheckIdsRef.current.add(id);
      }
    });

    // Clear existing timer
    if (checkTimerRef.current) {
      clearTimeout(checkTimerRef.current);
    }

    // Debounce: wait 300ms before actually checking
    checkTimerRef.current = setTimeout(async () => {
      const idsToCheck = Array.from(pendingCheckIdsRef.current);
      pendingCheckIdsRef.current.clear();

      if (idsToCheck.length === 0) {
        return;
      }

      try {
        console.log(`[Wishlist] Batch checking ${idsToCheck.length} products`);

        // Call API to check wishlist status for unchecked products
        const result = await wishlistApi.checkWishlistItems(idsToCheck);

        // Update wishlistProductIds based on API result
        setState((prev) => {
          const updatedIds = new Set(prev.wishlistProductIds);

          // Update based on API response
          Object.entries(result).forEach(([idStr, inWishlist]) => {
            const id = parseInt(idStr);
            if (inWishlist) {
              updatedIds.add(id);
            } else {
              updatedIds.delete(id);
            }
            // Mark this product as checked
            checkedProductsRef.current.add(id);
          });

          return {
            ...prev,
            wishlistProductIds: updatedIds,
          };
        });
      } catch (error: any) {
        console.error("Error checking wishlist items:", error);
        // Silent fail - don't show toast for this background operation
      }
    }, 300); // 300ms debounce
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
