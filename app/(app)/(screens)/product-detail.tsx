import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  TextInput,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  getProductDetail,
  ProductDetailResponse,
  ProductVariation,
} from "@/services/productApi";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useCart } from "@/contexts/CartContext";
import { useProduct } from "@/contexts/ProductContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const ProductDetail = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const productId = params.id as string;

  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToCart } = useCart();
  const { formatPrice } = useProduct();

  // States
  const [product, setProduct] = useState<ProductDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariation, setSelectedVariation] =
    useState<ProductVariation | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isVariationDropdownOpen, setIsVariationDropdownOpen] = useState(false);

  // Fetch product detail
  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        setIsLoading(true);
        const data = await getProductDetail(productId);
        setProduct(data);
        // Set variation đầu tiên làm mặc định
        if (data.variations && data.variations.length > 0) {
          setSelectedVariation(data.variations[0]);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load product");
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      fetchProductDetail();
    }
  }, [productId]);

  // Get current images based on selected variation
  const currentImages = selectedVariation?.images || [];

  // Calculate discount percentage
  const getDiscountPercent = (
    originalPrice: number,
    salePrice: number,
    discountType: string | null,
    discountValue: number | null
  ) => {
    if (discountType === "PERCENTAGE" && discountValue) {
      return Math.round(discountValue);
    }
    if (originalPrice > salePrice) {
      return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
    }
    return 0;
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!selectedVariation) {
      return;
    }

    if (selectedVariation.availableQuantity <= 0) {
      alert("Sản phẩm đã hết hàng");
      return;
    }

    if (quantity > selectedVariation.availableQuantity) {
      alert(
        `Chỉ còn ${selectedVariation.availableQuantity} sản phẩm trong kho`
      );
      return;
    }

    // Add to cart with variationId
    await addToCart(selectedVariation.id, quantity);
  };

  // Handle quantity change
  const increaseQuantity = () => {
    if (selectedVariation && quantity < selectedVariation.availableQuantity) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-gray-500 mt-4">Đang tải...</Text>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View className="flex-1 justify-center items-center bg-white px-6">
        <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
        <Text className="text-gray-900 text-lg font-bold mt-4">
          Có lỗi xảy ra
        </Text>
        <Text className="text-gray-500 mt-2 text-center">{error}</Text>
        <TouchableOpacity
          className="bg-blue-500 px-6 py-3 rounded-lg mt-6"
          onPress={() => router.back()}
        >
          <Text className="text-white font-semibold">Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isProductFavorite = isFavorite(productId);
  const currentPrice = selectedVariation?.salePrice || product.displaySalePrice;
  const originalPrice =
    selectedVariation?.price || product.displayOriginalPrice;
  const hasDiscount = originalPrice > currentPrice;
  const discountPercent = getDiscountPercent(
    originalPrice,
    currentPrice,
    selectedVariation?.discountType || product.discountType,
    selectedVariation?.discountValue || product.discountValue
  );

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-12 pb-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold flex-1 mx-4" numberOfLines={1}>
          {product.name}
        </Text>
        <TouchableOpacity
          onPress={() => toggleFavorite(productId)}
          className="p-2"
        >
          <Ionicons
            name={isProductFavorite ? "heart" : "heart-outline"}
            size={24}
            color={isProductFavorite ? "#ef4444" : "#222"}
          />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Image Gallery Slider */}
        <View className="bg-gray-50">
          {currentImages.length > 0 ? (
            <>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={(e) => {
                  const x = e.nativeEvent.contentOffset.x;
                  const index = Math.round(x / SCREEN_WIDTH);
                  setCurrentImageIndex(index);
                }}
                scrollEventThrottle={16}
              >
                {currentImages.map((img, index) => (
                  <View
                    key={img.id}
                    style={{ width: SCREEN_WIDTH }}
                    className="h-96 items-center justify-center"
                  >
                    <Image
                      source={{
                        uri: img.imageUrl || "https://via.placeholder.com/400",
                      }}
                      className="w-full h-full"
                      resizeMode="contain"
                    />
                  </View>
                ))}
              </ScrollView>
              {/* Image Indicator */}
              <View className="flex-row justify-center py-3">
                {currentImages.map((_, index) => (
                  <View
                    key={index}
                    className={`h-2 rounded-full mx-1 ${
                      index === currentImageIndex
                        ? "bg-blue-500 w-8"
                        : "bg-gray-300 w-2"
                    }`}
                  />
                ))}
              </View>
            </>
          ) : (
            <View className="h-96 items-center justify-center">
              <Ionicons name="image-outline" size={64} color="#ccc" />
              <Text className="text-gray-400 mt-2">Không có hình ảnh</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View className="px-4 py-4">
          {/* Brand & Category */}
          <View className="flex-row items-center mb-2">
            <Text className="text-blue-600 font-semibold">
              {product.brandName}
            </Text>
            <Text className="text-gray-400 mx-2">•</Text>
            <Text className="text-gray-600">{product.categoryName}</Text>
          </View>

          {/* Product Name */}
          <Text className="text-2xl font-bold text-gray-900 mb-3">
            {product.name}
          </Text>

          {/* Rating */}
          <View className="flex-row items-center mb-4">
            <View className="flex-row items-center">
              <Ionicons name="star" size={18} color="#FFA500" />
              <Text className="text-gray-900 font-semibold ml-1">
                {product.averageRating.toFixed(1)}
              </Text>
            </View>
            <Text className="text-gray-500 ml-2">
              ({product.totalRatings} đánh giá)
            </Text>
          </View>

          {/* Price */}
          <View className="bg-blue-50 p-4 rounded-xl mb-4">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-3xl font-bold text-blue-600">
                  {formatPrice(currentPrice)}
                </Text>
                {hasDiscount && (
                  <View className="flex-row items-center mt-1">
                    <Text className="text-gray-400 line-through text-base mr-2">
                      {formatPrice(originalPrice)}
                    </Text>
                    <View className="bg-red-500 px-2 py-1 rounded">
                      <Text className="text-white text-xs font-bold">
                        -{discountPercent}%
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Variation Selector - Dropdown */}
          {product.variations && product.variations.length > 0 && (
            <View className="mb-4">
              <Text className="text-base font-semibold text-gray-900 mb-3">
                Chọn phiên bản:
              </Text>
              <View>
                {/* Dropdown Button */}
                <TouchableOpacity
                  className="border border-gray-300 rounded-lg p-4 bg-white flex-row items-center justify-between"
                  onPress={() =>
                    setIsVariationDropdownOpen(!isVariationDropdownOpen)
                  }
                >
                  <View className="flex-1">
                    {selectedVariation ? (
                      <>
                        <Text className="font-semibold text-gray-900">
                          {selectedVariation.variationName}
                        </Text>
                        <Text className="text-sm text-gray-600 mt-1">
                          {formatPrice(selectedVariation.salePrice)}
                        </Text>
                      </>
                    ) : (
                      <Text className="text-gray-400">Chọn phiên bản</Text>
                    )}
                  </View>
                  <Ionicons
                    name={
                      isVariationDropdownOpen ? "chevron-up" : "chevron-down"
                    }
                    size={24}
                    color="#666"
                  />
                </TouchableOpacity>

                {/* Dropdown Menu */}
                {isVariationDropdownOpen && (
                  <View className="border border-t-0 border-gray-300 rounded-b-lg bg-white mt-0">
                    {product.variations.map((variation, index) => (
                      <TouchableOpacity
                        key={variation.id}
                        className={`p-4 flex-row items-center justify-between ${
                          index < product.variations.length - 1
                            ? "border-b border-gray-200"
                            : ""
                        }`}
                        onPress={() => {
                          setSelectedVariation(variation);
                          setCurrentImageIndex(0);
                          setQuantity(1);
                          setIsVariationDropdownOpen(false);
                        }}
                        disabled={variation.availableQuantity <= 0}
                      >
                        <View className="flex-1">
                          <Text
                            className={`font-semibold ${
                              variation.availableQuantity <= 0
                                ? "text-gray-400"
                                : "text-gray-900"
                            }`}
                          >
                            {variation.variationName}
                          </Text>
                          <Text
                            className={`text-sm mt-1 ${
                              variation.availableQuantity <= 0
                                ? "text-red-500"
                                : "text-gray-600"
                            }`}
                          >
                            {variation.availableQuantity <= 0
                              ? "Hết hàng"
                              : `Còn ${variation.availableQuantity} sản phẩm`}
                          </Text>
                        </View>
                        <View className="items-end">
                          <Text
                            className={`font-bold ${
                              variation.availableQuantity <= 0
                                ? "text-gray-400"
                                : "text-blue-600"
                            }`}
                          >
                            {formatPrice(variation.salePrice)}
                          </Text>
                          {variation.price > variation.salePrice && (
                            <Text className="text-gray-400 line-through text-sm">
                              {formatPrice(variation.price)}
                            </Text>
                          )}
                        </View>
                        {selectedVariation?.id === variation.id && (
                          <View className="ml-3">
                            <Ionicons
                              name="checkmark-circle"
                              size={24}
                              color="#3b82f6"
                            />
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Quantity Selector */}
          {selectedVariation && selectedVariation.availableQuantity > 0 && (
            <View className="mb-4">
              <Text className="text-base font-semibold text-gray-900 mb-3">
                Số lượng:
              </Text>
              <View className="flex-row items-center">
                <TouchableOpacity
                  className="bg-gray-200 w-12 h-12 rounded-lg items-center justify-center"
                  onPress={decreaseQuantity}
                  disabled={quantity <= 1}
                >
                  <Ionicons
                    name="remove"
                    size={24}
                    color={quantity <= 1 ? "#ccc" : "#222"}
                  />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900 mx-6 min-w-[40px] text-center">
                  {quantity}
                </Text>
                <TouchableOpacity
                  className="bg-gray-200 w-12 h-12 rounded-lg items-center justify-center"
                  onPress={increaseQuantity}
                  disabled={quantity >= selectedVariation.availableQuantity}
                >
                  <Ionicons
                    name="add"
                    size={24}
                    color={
                      quantity >= selectedVariation.availableQuantity
                        ? "#ccc"
                        : "#222"
                    }
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Description */}
          <View className="mb-4">
            <Text className="text-lg font-semibold text-gray-900 mb-2">
              Mô tả sản phẩm
            </Text>
            <Text className="text-gray-700 leading-6">
              {product.description}
            </Text>
          </View>

          {/* Product Attributes */}
          {product.attributes && product.attributes.length > 0 && (
            <View className="mb-4">
              <Text className="text-lg font-semibold text-gray-900 mb-3">
                Thông số kỹ thuật
              </Text>
              <View className="bg-gray-50 rounded-xl p-4">
                {product.attributes.map((attr, index) => (
                  <View
                    key={attr.id}
                    className={`flex-row py-3 ${
                      index < product.attributes.length - 1
                        ? "border-b border-gray-200"
                        : ""
                    }`}
                  >
                    <Text className="text-gray-600 flex-1">{attr.name}</Text>
                    <Text className="text-gray-900 font-semibold flex-1 text-right">
                      {attr.value}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Variation Attributes */}
          {selectedVariation &&
            selectedVariation.attributes &&
            selectedVariation.attributes.length > 0 && (
              <View className="mb-6">
                <Text className="text-lg font-semibold text-gray-900 mb-3">
                  Thông tin phiên bản
                </Text>
                <View className="bg-blue-50 rounded-xl p-4">
                  {selectedVariation.attributes.map((attr, index) => (
                    <View
                      key={attr.id}
                      className={`flex-row py-3 ${
                        index < selectedVariation.attributes.length - 1
                          ? "border-b border-blue-100"
                          : ""
                      }`}
                    >
                      <Text className="text-blue-900 flex-1">{attr.name}</Text>
                      <Text className="text-blue-900 font-semibold flex-1 text-right">
                        {attr.value}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View className="px-4 py-4 bg-white border-t border-gray-200">
        <TouchableOpacity
          className={`py-4 rounded-xl ${
            selectedVariation && selectedVariation.availableQuantity > 0
              ? "bg-blue-500"
              : "bg-gray-300"
          }`}
          onPress={handleAddToCart}
          disabled={
            !selectedVariation || selectedVariation.availableQuantity <= 0
          }
        >
          <Text className="text-white text-center font-bold text-lg">
            {!selectedVariation
              ? "Vui lòng chọn phiên bản"
              : selectedVariation.availableQuantity <= 0
                ? "Hết hàng"
                : "Thêm vào giỏ hàng"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProductDetail;
