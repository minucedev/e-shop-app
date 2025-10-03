import React, { createContext, useContext, useState } from "react";

type FavoritesContextType = {
  favoriteIds: string[];
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => void;
  addToFavorites: (productId: string) => void;
  removeFromFavorites: (productId: string) => void;
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
  // State cho danh sách ID sản phẩm yêu thích
  const [favoriteIds, setFavoriteIds] = useState<string[]>([
    "1",
    "2",
    "3",
    "4",
    "5",
    "7",
    "8",
    "9",
    "10", // Mock một số sản phẩm yêu thích ban đầu
  ]);

  // Kiểm tra sản phẩm có trong favorites không
  const isFavorite = (productId: string) => favoriteIds.includes(productId);

  // Toggle trạng thái favorite
  const toggleFavorite = (productId: string) => {
    setFavoriteIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  // Thêm vào favorites
  const addToFavorites = (productId: string) => {
    setFavoriteIds((prev) =>
      prev.includes(productId) ? prev : [...prev, productId]
    );
  };

  // Xóa khỏi favorites
  const removeFromFavorites = (productId: string) => {
    setFavoriteIds((prev) => prev.filter((id) => id !== productId));
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
