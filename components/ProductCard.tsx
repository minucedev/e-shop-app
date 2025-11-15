// components/ProductCard.tsx
import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import type { Product } from "@/contexts/ProductContext";

interface ProductCardProps {
  product: Product;
  formatPrice: (price: number) => string;
}

export const ProductCard = React.memo<ProductCardProps>(
  ({ product, formatPrice }) => {
    const router = useRouter();

    const hasDiscount = product.displayOriginalPrice > product.displaySalePrice;
    const discountPercent =
      product.discountType === "PERCENTAGE"
        ? product.discountValue
        : product.discountValue
          ? Math.round(
              ((product.displayOriginalPrice - product.displaySalePrice) /
                product.displayOriginalPrice) *
                100
            )
          : 0;

    const handlePress = React.useCallback(() => {
      router.push(`/(app)/(screens)/product-detail?id=${product.id}`);
    }, [product.id, router]);

    return (
      <TouchableOpacity
        className="bg-white rounded-xl shadow-lg border border-gray-100 w-[48%]"
        activeOpacity={0.8}
        onPress={handlePress}
      >
        {/* Product Image */}
        <View className="relative">
          <View className="bg-gray-50 h-40 rounded-t-xl items-center justify-center overflow-hidden">
            <Image
              source={{
                uri: product.imageUrl || "https://via.placeholder.com/150",
              }}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>

          {/* Discount Badge */}
          {hasDiscount && (
            <View className="absolute top-2 left-2 bg-red-500 rounded-full px-2 py-1">
              <Text className="text-white text-xs font-bold">
                -{discountPercent}%
              </Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View className="p-3">
          <Text
            className="text-gray-900 font-semibold text-sm mb-1"
            numberOfLines={2}
          >
            {product.name}
          </Text>

          {/* Rating */}
          <View className="flex-row items-center mb-2">
            <Ionicons name="star" size={14} color="#fbbf24" />
            <Text className="text-xs text-gray-600 ml-1">
              {product.averageRating.toFixed(1)} ({product.totalRatings})
            </Text>
          </View>

          {/* Price */}
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-blue-600 font-bold text-base">
                {formatPrice(product.displaySalePrice)}
              </Text>
              {hasDiscount && (
                <Text className="text-gray-400 text-xs line-through">
                  {formatPrice(product.displayOriginalPrice)}
                </Text>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  },
  // Custom comparison function - only re-render if these props change
  (prevProps, nextProps) => {
    return (
      prevProps.product.id === nextProps.product.id &&
      prevProps.isInWishlist === nextProps.isInWishlist &&
      prevProps.product.displaySalePrice ===
        nextProps.product.displaySalePrice &&
      prevProps.product.displayOriginalPrice ===
        nextProps.product.displayOriginalPrice
    );
  }
);

ProductCard.displayName = "ProductCard";
