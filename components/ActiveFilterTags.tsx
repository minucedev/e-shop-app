// components/ActiveFilterTags.tsx

import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFilter } from "@/contexts/FilterContext";

export const ActiveFilterTags: React.FC = () => {
  const {
    filters,
    availableBrands,
    availableCategories,
    toggleBrand,
    toggleCategory,
    setPriceRange,
    setMinRating,
    setSearchQuery,
    getActiveFilterCount,
  } = useFilter();

  const activeCount = getActiveFilterCount();

  if (activeCount === 0) return null;

  const getBrandName = (id: number) =>
    availableBrands.find((b) => b.id === id)?.name || `Brand #${id}`;

  const getCategoryName = (id: number) =>
    availableCategories.find((c) => c.id === id)?.name || `Category #${id}`;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <View className="px-4 py-2 bg-gray-50">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-sm font-semibold text-gray-700">
          Active Filters ({activeCount})
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-row gap-2"
      >
        {/* Campaign Tag - Removed (campaigns have dedicated screen) */}

        {/* Search Query Tag */}
        {filters.searchQuery && filters.searchQuery.trim() !== "" && (
          <TouchableOpacity
            onPress={() => setSearchQuery(undefined)}
            className="flex-row items-center bg-blue-100 px-3 py-1.5 rounded-full border border-blue-300"
          >
            <Text className="text-blue-800 font-medium text-sm mr-1">
              "{filters.searchQuery}"
            </Text>
            <Ionicons name="close-circle" size={16} color="#2563eb" />
          </TouchableOpacity>
        )}

        {/* Brand Tags */}
        {filters.selectedBrands.map((brandId) => (
          <TouchableOpacity
            key={`brand-${brandId}`}
            onPress={() => toggleBrand(brandId)}
            className="flex-row items-center bg-green-100 px-3 py-1.5 rounded-full border border-green-300"
          >
            <Text className="text-green-800 font-medium text-sm mr-1">
              {getBrandName(brandId)}
            </Text>
            <Ionicons name="close-circle" size={16} color="#16a34a" />
          </TouchableOpacity>
        ))}

        {/* Category Tags */}
        {filters.selectedCategories.map((categoryId) => (
          <TouchableOpacity
            key={`category-${categoryId}`}
            onPress={() => toggleCategory(categoryId)}
            className="flex-row items-center bg-orange-100 px-3 py-1.5 rounded-full border border-orange-300"
          >
            <Text className="text-orange-800 font-medium text-sm mr-1">
              {getCategoryName(categoryId)}
            </Text>
            <Ionicons name="close-circle" size={16} color="#ea580c" />
          </TouchableOpacity>
        ))}

        {/* Price Range Tag */}
        {(filters.priceRange.min !== undefined ||
          filters.priceRange.max !== undefined) && (
          <TouchableOpacity
            onPress={() => setPriceRange(undefined, undefined)}
            className="flex-row items-center bg-yellow-100 px-3 py-1.5 rounded-full border border-yellow-300"
          >
            <Text className="text-yellow-800 font-medium text-sm mr-1">
              {filters.priceRange.min
                ? formatPrice(filters.priceRange.min)
                : "0"}{" "}
              -{" "}
              {filters.priceRange.max
                ? formatPrice(filters.priceRange.max)
                : "∞"}
            </Text>
            <Ionicons name="close-circle" size={16} color="#ca8a04" />
          </TouchableOpacity>
        )}

        {/* Rating Tag */}
        {filters.minRating !== undefined && (
          <TouchableOpacity
            onPress={() => setMinRating(undefined)}
            className="flex-row items-center bg-pink-100 px-3 py-1.5 rounded-full border border-pink-300"
          >
            <Text className="text-pink-800 font-medium text-sm mr-1">
              Rating {filters.minRating}+
            </Text>
            <Ionicons name="close-circle" size={16} color="#db2777" />
          </TouchableOpacity>
        )}

        {/* Attributes Tags */}
        {filters.attributes.map((attr, index) => (
          <TouchableOpacity
            key={`attr-${index}`}
            onPress={() => {
              // removeAttribute function from context
            }}
            className="flex-row items-center bg-indigo-100 px-3 py-1.5 rounded-full border border-indigo-300"
          >
            <Text className="text-indigo-800 font-medium text-sm mr-1">
              🔧 {attr}
            </Text>
            <Ionicons name="close-circle" size={16} color="#4f46e5" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};
