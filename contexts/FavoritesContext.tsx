import React, { createContext, useContext, useState } from "react";

type FavoritesContextType = {
  favoriteIds: (string | number)[];
  isFavorite: (productId: string | number) => boolean;
  toggleFavorite: (productId: string | number) => void;
  addToFavorites: (productId: string | number) => void;
  removeFromFavorites: (productId: string | number) => void;
  clearFavorites: () => void;
  favoritesCount: number;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined
);

export const FavoritesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // State cho danh sách ID sản phẩm yêu thích (hỗ trợ cả string và number)
  const [favoriteIds, setFavoriteIds] = useState<(string | number)[]>([
    1,
    2,
    3,
    4,
    5, // Mock một số sản phẩm yêu thích ban đầu
  ]);

  // Normalize ID để so sánh (hỗ trợ cả string và number)
  const normalizeId = (id: string | number) => {
    return typeof id === "string" ? parseInt(id, 10) : id;
  };

  // Kiểm tra sản phẩm có trong favorites không
  const isFavorite = (productId: string | number) => {
    const normalizedId = normalizeId(productId);
    return favoriteIds.some((id) => normalizeId(id) === normalizedId);
  };

  // Toggle trạng thái favorite
  const toggleFavorite = (productId: string | number) => {
    const normalizedId = normalizeId(productId);
    setFavoriteIds((prev) =>
      prev.some((id) => normalizeId(id) === normalizedId)
        ? prev.filter((id) => normalizeId(id) !== normalizedId)
        : [...prev, normalizedId]
    );
  };

  // Thêm vào favorites
  const addToFavorites = (productId: string | number) => {
    const normalizedId = normalizeId(productId);
    setFavoriteIds((prev) =>
      prev.some((id) => normalizeId(id) === normalizedId)
        ? prev
        : [...prev, normalizedId]
    );
  };

  // Xóa khỏi favorites
  const removeFromFavorites = (productId: string | number) => {
    const normalizedId = normalizeId(productId);
    setFavoriteIds((prev) =>
      prev.filter((id) => normalizeId(id) !== normalizedId)
    );
  };

  // Xóa tất cả favorites
  const clearFavorites = () => {
    setFavoriteIds([]);
  };

  // Số lượng favorites
  const favoritesCount = favoriteIds.length;

  return (
    <FavoritesContext.Provider
      value={{
        favoriteIds,
        isFavorite,
        toggleFavorite,
        addToFavorites,
        removeFromFavorites,
        clearFavorites,
        favoritesCount,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext);
  if (!ctx)
    throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
};
