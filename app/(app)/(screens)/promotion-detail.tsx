import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { usePromotion, IPromotion } from "@/contexts/PromotionContext";
import { useProduct } from "@/contexts/ProductContext";
import { useWishlist } from "@/contexts/WishlistContext";

const PromotionDetail = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { getPromotions } = usePromotion();
  const { getProductById, formatPrice } = useProduct();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [promotion, setPromotion] = useState<IPromotion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPromotions().then((data) => {
      const promo = data.find((p) => p.id === Number(id));
      setPromotion(promo || null);
      setLoading(false);
    });
  }, [id]);

  // Calculate discounted price
  const getDiscountedPrice = (productPrice: number) => {
    if (!promotion) return productPrice;
    if (promotion.discountType === "PERCENTAGE") {
      const discount = (productPrice * promotion.discountValue) / 100;
      return Math.max(productPrice - discount, 0);
    } else {
      return Math.max(productPrice - promotion.discountValue, 0);
    }
  };

  // Render applicable product (card style - 1.5x size)
  const renderApplicableProduct = ({
    item,
  }: {
    item: IPromotion["applicableProducts"][0];
  }) => {
    const product = getProductById(item.productId);
    if (!product) return null;
    const discountedPrice = getDiscountedPrice(product.displayOriginalPrice);
    const isItemFavorite = isInWishlist(product.id);

    return (
      <TouchableOpacity
        className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 mb-5 flex-row items-center"
        activeOpacity={0.8}
        onPress={() => {
          /* TODO: navigate to product detail */
        }}
      >
        {/* Product Image - 1.5x size */}
        <View className="bg-gray-50 rounded-xl w-32 h-32 items-center justify-center mr-5 overflow-hidden relative">
          <Image
            source={{
              uri: product.imageUrl || "https://via.placeholder.com/150",
            }}
            className="w-full h-full"
            resizeMode="cover"
          />
          {/* Favorite Icon */}
          <TouchableOpacity
            className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-sm"
            onPress={(e) => {
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
          >
            <Ionicons
              name={isItemFavorite ? "heart" : "heart-outline"}
              size={25}
              color={isItemFavorite ? "#e74c3c" : "#666"}
            />
          </TouchableOpacity>
        </View>

        {/* Product Info */}
        <View className="flex-1">
          <Text
            className="font-bold text-lg text-gray-900 mb-2"
            numberOfLines={2}
          >
            {product.name}
          </Text>
          {/* Removed description as it's not in Product type */}

          {/* Price Section */}
          <View className="flex-row items-center justify-between">
            <View className="flex-col">
              <Text className="text-base font-medium text-gray-400 line-through">
                {formatPrice(product.displayOriginalPrice)}
              </Text>
              <Text className="text-xl font-bold text-blue-600">
                {formatPrice(discountedPrice)}
              </Text>
            </View>

            {/* Discount Badge */}
            <View className="bg-red-500 rounded-full px-3 py-1">
              <Text className="text-white text-sm font-bold">
                {promotion?.discountType === "PERCENTAGE"
                  ? `-${promotion.discountValue}%`
                  : `-${Math.round((promotion?.discountValue || 0) / 1000)}K`}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="mt-3 text-gray-700">Loading promotion details...</Text>
      </View>
    );
  }

  if (!promotion) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-lg text-red-500">Promotion not found!</Text>
        <TouchableOpacity
          className="mt-6 flex-row items-center"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#2563eb" />
          <Text className="ml-2 text-blue-600">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header with back button */}
      <View className="flex-row items-center p-4 border-b border-gray-200 bg-white">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#2563eb" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">
          Promotion Detail
        </Text>
      </View>
      <FlatList
        data={promotion.applicableProducts}
        renderItem={renderApplicableProduct}
        keyExtractor={(item) => item.productId.toString()}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View className="px-4 pt-2 pb-4">
            {/* Promotion Banner Header - Similar style to home banner */}
            <View className="bg-blue-100 rounded-xl p-6 mb-6 relative overflow-hidden shadow-lg">
              {/* Diagonal stripe background pattern */}
              <View className="absolute inset-0 opacity-20">
                <View className="absolute w-full h-3 bg-blue-300 top-2 -left-6 right-6 transform -rotate-12"></View>
                <View className="absolute w-full h-3 bg-blue-300 top-8 -left-6 right-6 transform -rotate-12"></View>
                <View className="absolute w-full h-3 bg-blue-300 top-14 -left-6 right-6 transform -rotate-12"></View>
                <View className="absolute w-full h-3 bg-blue-300 top-20 -left-6 right-6 transform -rotate-12"></View>
                <View className="absolute w-full h-3 bg-blue-300 top-26 -left-6 right-6 transform -rotate-12"></View>
                <View className="absolute w-full h-3 bg-blue-300 top-32 -left-6 right-6 transform -rotate-12"></View>
              </View>

              {/* Content */}
              <View className="z-10">
                {/* Name - Largest text at top */}
                <Text className="text-3xl font-extrabold text-blue-800 mb-3 leading-tight">
                  {promotion.name
                    .replace(/^\d+% Off /, "")
                    .replace(/^\d+K Off /, "")}
                </Text>

                {/* Description and Discount Value Row */}
                <View className="flex-row items-start justify-between mb-4">
                  <Text className="text-base font-medium text-blue-700 flex-1 pr-4 leading-relaxed">
                    {promotion.description}
                  </Text>

                  {/* Discount Value Circle */}
                  <View className="bg-blue-800 rounded-full w-20 h-20 items-center justify-center shadow-md">
                    <Text className="text-white font-extrabold text-2xl">
                      {promotion.discountType === "PERCENTAGE"
                        ? `${promotion.discountValue}%`
                        : `${Math.round(promotion.discountValue / 1000)}K`}
                    </Text>
                  </View>
                </View>

                {/* Start and End Date - Bottom row */}
                <View className="flex-row items-center">
                  <Ionicons name="calendar-outline" size={16} color="#1e40af" />
                  <Text className="text-sm font-semibold text-blue-800 ml-2">
                    {new Date(promotion.startDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "2-digit",
                      year: "numeric",
                    })}{" "}
                    -{" "}
                    {new Date(promotion.endDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "2-digit",
                      year: "numeric",
                    })}
                  </Text>
                </View>
              </View>
            </View>

            {/* <Text className="text-lg font-semibold text-blue-600 mb-2">
              Applicable Products:
            </Text> */}
          </View>
        }
      />
    </View>
  );
};

export default PromotionDetail;
