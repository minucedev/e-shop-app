// components/FilterBottomSheet.tsx

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFilter } from "@/contexts/FilterContext";
import { getBrands } from "@/services/brandApi";
import { getCategories } from "@/services/categoryApi";

interface FilterBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onApply: () => void;
}

export const FilterBottomSheet: React.FC<FilterBottomSheetProps> = ({
  visible,
  onClose,
  onApply,
}) => {
  const {
    filters,
    availableBrands,
    availableCategories,
    setAvailableBrands,
    setAvailableCategories,
    toggleBrand,
    toggleCategory,
    setPriceRange,
    setMinRating,
    setSorting,
    clearFilters,
  } = useFilter();

  const [isLoadingBrands, setIsLoadingBrands] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [localMinPrice, setLocalMinPrice] = useState<string>("");
  const [localMaxPrice, setLocalMaxPrice] = useState<string>("");

  // Load brands và categories khi component mount
  useEffect(() => {
    if (visible && availableBrands.length === 0) {
      loadBrands();
    }
    if (visible && availableCategories.length === 0) {
      loadCategories();
    }
  }, [visible]);

  // Sync local price state với filter state
  useEffect(() => {
    setLocalMinPrice(
      filters.priceRange.min ? filters.priceRange.min.toString() : ""
    );
    setLocalMaxPrice(
      filters.priceRange.max ? filters.priceRange.max.toString() : ""
    );
  }, [filters.priceRange]);

  const loadBrands = async () => {
    setIsLoadingBrands(true);
    try {
      const brands = await getBrands();
      setAvailableBrands(brands);
    } catch (error) {
      console.error("Failed to load brands:", error);
    } finally {
      setIsLoadingBrands(false);
    }
  };

  const loadCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const categories = await getCategories();
      setAvailableCategories(categories);
    } catch (error) {
      console.error("Failed to load categories:", error);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const handleApplyPriceRange = () => {
    const min = localMinPrice ? parseFloat(localMinPrice) : undefined;
    const max = localMaxPrice ? parseFloat(localMaxPrice) : undefined;
    setPriceRange(min, max);
  };

  const handleApply = () => {
    handleApplyPriceRange();
    onApply();
    onClose();
  };

  const handleClearFilters = () => {
    clearFilters();
    setLocalMinPrice("");
    setLocalMaxPrice("");
  };

  const pricePresets = [
    { label: "Under 5M", min: 0, max: 5000000 },
    { label: "5M - 10M", min: 5000000, max: 10000000 },
    { label: "10M - 20M", min: 10000000, max: 20000000 },
    { label: "20M - 30M", min: 20000000, max: 30000000 },
    { label: "Above 30M", min: 30000000, max: undefined },
  ];

  const ratingOptions = [5, 4, 3, 2, 1];

  const sortOptions: Array<{
    label: string;
    sortBy: typeof filters.sortBy;
    sortDirection: "ASC" | "DESC";
  }> = [
    { label: "Name A-Z", sortBy: "name", sortDirection: "ASC" },
    { label: "Name Z-A", sortBy: "name", sortDirection: "DESC" },
    { label: "Price Low-High", sortBy: "price", sortDirection: "ASC" },
    { label: "Price High-Low", sortBy: "price", sortDirection: "DESC" },
    { label: "Rating High-Low", sortBy: "rating", sortDirection: "DESC" },
    { label: "Newest", sortBy: "id", sortDirection: "DESC" },
  ];

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <TouchableOpacity
          className="flex-1"
          activeOpacity={1}
          onPress={onClose}
        />
        <View className="bg-white rounded-t-3xl h-[85%]">
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
            <Text className="text-xl font-bold text-gray-900">Filters</Text>
            <View className="flex-row items-center gap-3">
              <TouchableOpacity onPress={handleClearFilters}>
                <Text className="text-blue-600 font-semibold">Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView className="flex-1 px-6 py-4">
            {/* Sort By Section */}
            <View className="mb-6">
              <Text className="text-base font-bold text-gray-900 mb-3">
                Sort By
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {sortOptions.map((option) => {
                  const isSelected =
                    filters.sortBy === option.sortBy &&
                    filters.sortDirection === option.sortDirection;
                  return (
                    <TouchableOpacity
                      key={option.label}
                      onPress={() =>
                        setSorting(option.sortBy, option.sortDirection)
                      }
                      className={`px-4 py-2 rounded-full border ${
                        isSelected
                          ? "bg-blue-600 border-blue-600"
                          : "bg-white border-gray-300"
                      }`}
                    >
                      <Text
                        className={`font-medium ${
                          isSelected ? "text-white" : "text-gray-700"
                        }`}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Brands Section */}
            <View className="mb-6">
              <Text className="text-base font-bold text-gray-900 mb-3">
                Brands
              </Text>
              {isLoadingBrands ? (
                <ActivityIndicator size="small" color="#3b82f6" />
              ) : (
                <View className="flex-row flex-wrap gap-2">
                  {availableBrands.map((brand) => {
                    const isSelected = filters.selectedBrands.includes(
                      brand.id
                    );
                    return (
                      <TouchableOpacity
                        key={brand.id}
                        onPress={() => toggleBrand(brand.id)}
                        className={`px-4 py-2 rounded-full border ${
                          isSelected
                            ? "bg-blue-600 border-blue-600"
                            : "bg-white border-gray-300"
                        }`}
                      >
                        <Text
                          className={`font-medium ${
                            isSelected ? "text-white" : "text-gray-700"
                          }`}
                        >
                          {brand.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Categories Section */}
            <View className="mb-6">
              <Text className="text-base font-bold text-gray-900 mb-3">
                Categories
              </Text>
              {isLoadingCategories ? (
                <ActivityIndicator size="small" color="#3b82f6" />
              ) : (
                <View className="flex-row flex-wrap gap-2">
                  {availableCategories
                    .filter((cat) => !cat.parentCategoryId)
                    .map((category) => {
                      const isSelected = filters.selectedCategories.includes(
                        category.id
                      );
                      return (
                        <TouchableOpacity
                          key={category.id}
                          onPress={() => toggleCategory(category.id)}
                          className={`px-4 py-2 rounded-full border ${
                            isSelected
                              ? "bg-blue-600 border-blue-600"
                              : "bg-white border-gray-300"
                          }`}
                        >
                          <Text
                            className={`font-medium ${
                              isSelected ? "text-white" : "text-gray-700"
                            }`}
                          >
                            {category.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                </View>
              )}
            </View>

            {/* Price Range Section */}
            <View className="mb-6">
              <Text className="text-base font-bold text-gray-900 mb-3">
                Price Range
              </Text>
              {/* Price presets */}
              <View className="flex-row flex-wrap gap-2 mb-3">
                {pricePresets.map((preset) => {
                  const isSelected =
                    filters.priceRange.min === preset.min &&
                    filters.priceRange.max === preset.max;
                  return (
                    <TouchableOpacity
                      key={preset.label}
                      onPress={() => setPriceRange(preset.min, preset.max)}
                      className={`px-4 py-2 rounded-full border ${
                        isSelected
                          ? "bg-blue-600 border-blue-600"
                          : "bg-white border-gray-300"
                      }`}
                    >
                      <Text
                        className={`font-medium ${
                          isSelected ? "text-white" : "text-gray-700"
                        }`}
                      >
                        {preset.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {/* Custom price inputs would go here - simplified for now */}
            </View>

            {/* Rating Section */}
            <View className="mb-6">
              <Text className="text-base font-bold text-gray-900 mb-3">
                Minimum Rating
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {ratingOptions.map((rating) => {
                  const isSelected = filters.minRating === rating;
                  return (
                    <TouchableOpacity
                      key={rating}
                      onPress={() => setMinRating(rating)}
                      className={`px-4 py-2 rounded-full border flex-row items-center gap-1 ${
                        isSelected
                          ? "bg-blue-600 border-blue-600"
                          : "bg-white border-gray-300"
                      }`}
                    >
                      <Ionicons
                        name="star"
                        size={16}
                        color={isSelected ? "#fff" : "#FFC107"}
                      />
                      <Text
                        className={`font-medium ${
                          isSelected ? "text-white" : "text-gray-700"
                        }`}
                      >
                        {rating}+
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View className="px-6 py-4 border-t border-gray-200">
            <TouchableOpacity
              onPress={handleApply}
              className="bg-blue-600 py-4 rounded-xl"
            >
              <Text className="text-white text-center font-bold text-base">
                Apply Filters
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
