// components/ProductCardSkeleton.tsx
import React from "react";
import { View } from "react-native";

/**
 * Skeleton loader for ProductCard while data is loading
 * Provides better UX by showing placeholder instead of blank screen
 */
export const ProductCardSkeleton: React.FC = () => {
  return (
    <View className="bg-white rounded-xl shadow-lg border border-gray-100 w-[48%] overflow-hidden">
      {/* Image Skeleton */}
      <View className="bg-gray-200 h-40 rounded-t-xl animate-pulse" />

      {/* Content Skeleton */}
      <View className="p-3">
        {/* Title Skeleton - 2 lines */}
        <View className="bg-gray-200 h-4 rounded mb-2 animate-pulse" />
        <View className="bg-gray-200 h-4 rounded w-3/4 mb-3 animate-pulse" />

        {/* Rating Skeleton */}
        <View className="bg-gray-200 h-3 rounded w-24 mb-3 animate-pulse" />

        {/* Price Skeleton */}
        <View className="bg-gray-200 h-5 rounded w-32 animate-pulse" />
      </View>
    </View>
  );
};

/**
 * Grid of skeleton cards for initial loading state
 */
export const ProductGridSkeleton: React.FC<{ count?: number }> = ({
  count = 6,
}) => {
  return (
    <View className="flex-row flex-wrap justify-between px-4 py-4">
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} className="w-[48%] mb-4">
          <ProductCardSkeleton />
        </View>
      ))}
    </View>
  );
};
