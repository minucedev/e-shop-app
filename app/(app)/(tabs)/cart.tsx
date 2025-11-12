import React from "react";
import {
  View,
  Text,
  StatusBar,
  Image,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCart, CartItemResponse } from "@/contexts/CartContext";

const Cart = () => {
  const router = useRouter();
  const {
    cart,
    cartItems,
    totalAmount,
    itemCount,
    isLoading,
    updatingItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    formatPrice,
  } = useCart();

  // Handle remove item with confirmation
  const handleRemoveItem = (cartItem: CartItemResponse) => {
    Alert.alert(
      "Xóa sản phẩm",
      `Bạn có chắc muốn xóa "${cartItem.productName}" khỏi giỏ hàng?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: () => removeFromCart(cartItem.productVariationId),
        },
      ]
    );
  };

  // Handle checkout
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert("Giỏ hàng trống", "Vui lòng thêm sản phẩm vào giỏ hàng.");
      return;
    }

    if (cart?.summary.hasUnavailableItems) {
      Alert.alert(
        "Có sản phẩm hết hàng",
        "Vui lòng xóa sản phẩm hết hàng trước khi thanh toán."
      );
      return;
    }

    router.push({
      pathname: "/(app)/(screens)/cart-purchase",
      params: {
        cartItems: JSON.stringify(cartItems),
      },
    });
  };

  // Handle clear cart
  const handleClearCart = () => {
    Alert.alert(
      "Xóa giỏ hàng",
      "Bạn có chắc muốn xóa tất cả sản phẩm khỏi giỏ hàng?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa tất cả",
          style: "destructive",
          onPress: () => clearCart(),
        },
      ]
    );
  };

  const renderCartItem = ({ item }: { item: CartItemResponse }) => {
    const hasDiscount = item.discountValue && item.discountValue > 0;
    const discountPercent =
      item.discountType === "PERCENTAGE"
        ? Math.round(item.discountValue || 0)
        : Math.round(
            ((item.originalPrice - item.unitPrice) / item.originalPrice) * 100
          );
    const isUpdating = updatingItems.has(item.productVariationId);

    return (
      <View className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4 overflow-hidden">
        <View className="flex-row p-4">
          {/* Product Image */}
          <View className="w-24 h-24 bg-gray-50 rounded-lg mr-4 overflow-hidden">
            {item.productImage ? (
              <Image
                source={{ uri: item.productImage }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-full items-center justify-center">
                <Ionicons name="image-outline" size={32} color="#ccc" />
              </View>
            )}
          </View>

          {/* Product Info */}
          <View className="flex-1">
            <Text
              className="text-base font-bold text-gray-900 mb-1"
              numberOfLines={2}
            >
              {item.productName}
            </Text>
            <Text className="text-xs text-gray-500 mb-2" numberOfLines={1}>
              {item.variantName}
            </Text>

            {/* Price Info */}
            <View className="flex-row items-center mb-1">
              <Text className="text-lg font-bold text-blue-600">
                {formatPrice(item.unitPrice)}
              </Text>
              {hasDiscount && (
                <>
                  <Text className="text-sm text-gray-400 line-through ml-2">
                    {formatPrice(item.originalPrice)}
                  </Text>
                  <View className="bg-red-500 px-1.5 py-0.5 rounded ml-2">
                    <Text className="text-white text-xs font-bold">
                      -{discountPercent}%
                    </Text>
                  </View>
                </>
              )}
            </View>

            {/* Stock Status */}
            {!item.available && (
              <View className="flex-row items-center mt-1">
                <Ionicons name="alert-circle" size={14} color="#ef4444" />
                <Text className="text-xs text-red-500 ml-1 font-medium">
                  Hết hàng
                </Text>
              </View>
            )}
            {item.available && item.stockQuantity < 5 && (
              <View className="flex-row items-center mt-1">
                <Ionicons name="warning" size={14} color="#f59e0b" />
                <Text className="text-xs text-orange-500 ml-1">
                  Chỉ còn {item.stockQuantity} sản phẩm
                </Text>
              </View>
            )}
          </View>

          {/* Remove Button */}
          <TouchableOpacity
            className="p-2 ml-2"
            onPress={() => handleRemoveItem(item)}
          >
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>

        {/* Quantity Controls */}
        <View className="flex-row items-center justify-between px-4 pb-4 border-t border-gray-100 pt-3">
          <Text className="text-sm text-gray-600 font-medium">Số lượng</Text>
          <View className="flex-row items-center">
            <TouchableOpacity
              className={`w-8 h-8 rounded-full items-center justify-center ${
                isUpdating ? "bg-gray-200" : "bg-gray-100"
              }`}
              onPress={() =>
                updateQuantity(item.productVariationId, item.quantity - 1)
              }
              disabled={item.quantity <= 1 || !item.available || isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator size={12} color="#9ca3af" />
              ) : (
                <Ionicons
                  name="remove"
                  size={16}
                  color={
                    item.quantity <= 1 || !item.available
                      ? "#9ca3af"
                      : "#374151"
                  }
                />
              )}
            </TouchableOpacity>

            <View className="mx-4 min-w-8 items-center">
              {isUpdating ? (
                <ActivityIndicator size={16} color="#3b82f6" />
              ) : (
                <Text className="text-base font-semibold text-gray-900">
                  {item.quantity}
                </Text>
              )}
            </View>

            <TouchableOpacity
              className={`w-8 h-8 rounded-full items-center justify-center ${
                isUpdating ? "bg-gray-200" : "bg-blue-500"
              }`}
              onPress={() =>
                updateQuantity(item.productVariationId, item.quantity + 1)
              }
              disabled={
                item.quantity >= item.stockQuantity ||
                !item.available ||
                isUpdating
              }
            >
              {isUpdating ? (
                <ActivityIndicator size={12} color="#9ca3af" />
              ) : (
                <Ionicons
                  name="add"
                  size={16}
                  color={
                    item.quantity >= item.stockQuantity || !item.available
                      ? "#9ca3af"
                      : "white"
                  }
                />
              )}
            </TouchableOpacity>
          </View>

          {/* Item Total */}
          <Text className="text-sm font-bold text-gray-900">
            {formatPrice(item.totalPrice)}
          </Text>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-gray-600 mt-2">Đang tải giỏ hàng...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View className="bg-white px-6 py-4 flex-row items-center justify-between border-b border-gray-100 shadow-sm">
        <View className="flex-row items-center">
          <Text className="text-2xl font-bold text-gray-900">Giỏ hàng</Text>
          {itemCount > 0 && (
            <View className="ml-2 bg-blue-500 rounded-full w-6 h-6 items-center justify-center">
              <Text className="text-white text-xs font-bold">{itemCount}</Text>
            </View>
          )}
        </View>

        {cartItems.length > 0 && (
          <TouchableOpacity
            className="p-2 bg-red-50 rounded-full"
            onPress={handleClearCart}
          >
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
          </TouchableOpacity>
        )}
      </View>

      {/* Cart Content */}
      {cartItems.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-24 h-24 bg-blue-50 rounded-full items-center justify-center mb-4">
            <Ionicons name="bag-outline" size={40} color="#3b82f6" />
          </View>
          <Text className="text-xl font-bold text-gray-900 mb-2">
            Giỏ hàng trống
          </Text>
          <Text className="text-gray-600 text-center mb-6 leading-5">
            Bạn chưa có sản phẩm nào trong giỏ hàng.{"\n"}
            Hãy bắt đầu mua sắm ngay!
          </Text>
          <TouchableOpacity
            className="bg-blue-500 px-8 py-3 rounded-full shadow-lg"
            onPress={() => router.push("/(app)/(tabs)/shop")}
          >
            <Text className="text-white font-semibold text-base">
              Bắt đầu mua sắm
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Cart Items List */}
          <ScrollView
            className="flex-1 px-4 py-4"
            showsVerticalScrollIndicator={false}
          >
            <FlatList
              data={cartItems}
              renderItem={renderCartItem}
              keyExtractor={(item) => item.productVariationId.toString()}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />

            {/* Continue Shopping Button */}
            <TouchableOpacity
              className="bg-gray-100 py-3 rounded-xl items-center mt-2 mb-4"
              onPress={() => router.push("/(app)/(tabs)/shop")}
            >
              <View className="flex-row items-center">
                <Ionicons name="add-circle" size={20} color="#6b7280" />
                <Text className="text-gray-700 font-medium ml-2">
                  Tiếp tục mua sắm
                </Text>
              </View>
            </TouchableOpacity>
          </ScrollView>

          {/* Bottom Summary & Checkout */}
          <View className="bg-white border-t border-gray-200 px-6 py-4 shadow-lg">
            {/* Order Summary */}
            <View className="mb-4">
              <Text className="text-lg font-bold text-gray-900 mb-3">
                Tóm tắt đơn hàng
              </Text>

              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-600">
                  Sản phẩm ({cart?.summary.uniqueItems} loại)
                </Text>
                <Text className="text-gray-900 font-semibold">
                  {formatPrice(totalAmount)}
                </Text>
              </View>

              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-600">Tổng số lượng</Text>
                <Text className="text-gray-900 font-semibold">{itemCount}</Text>
              </View>

              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-600">Phí vận chuyển</Text>
                <Text className="text-gray-900 font-semibold">30,000₫</Text>
              </View>

              {cart?.summary.hasUnavailableItems && (
                <View className="flex-row items-center bg-red-50 p-3 rounded-lg mt-2">
                  <Ionicons name="alert-circle" size={20} color="#ef4444" />
                  <Text className="text-red-600 text-sm ml-2 flex-1">
                    Có sản phẩm hết hàng. Vui lòng xóa trước khi thanh toán.
                  </Text>
                </View>
              )}

              <View className="border-t border-gray-200 pt-3 mt-2">
                <View className="flex-row justify-between">
                  <Text className="text-lg font-bold text-gray-900">
                    Tổng cộng
                  </Text>
                  <Text className="text-xl font-bold text-blue-600">
                    {formatPrice(totalAmount + 30000)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Checkout Button */}
            <TouchableOpacity
              className={`py-4 rounded-xl items-center shadow-lg ${
                cart?.summary.hasUnavailableItems
                  ? "bg-gray-300"
                  : "bg-blue-500"
              }`}
              onPress={handleCheckout}
              activeOpacity={0.8}
              disabled={cart?.summary.hasUnavailableItems}
            >
              <View className="flex-row items-center">
                <Text className="text-white text-lg font-bold mr-2">
                  {cart?.summary.hasUnavailableItems
                    ? "Không thể thanh toán"
                    : "Tiến hành thanh toán"}
                </Text>
                {!cart?.summary.hasUnavailableItems && (
                  <Ionicons name="arrow-forward" size={20} color="white" />
                )}
              </View>
            </TouchableOpacity>

            {/* Security Note */}
            <View className="flex-row items-center justify-center mt-3">
              <Ionicons name="shield-checkmark" size={16} color="#10b981" />
              <Text className="text-xs text-gray-500 ml-1">
                Thanh toán an toàn với mã hóa SSL
              </Text>
            </View>
          </View>
        </>
      )}
    </View>
  );
};

export default Cart;
