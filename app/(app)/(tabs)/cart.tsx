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
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCart } from "@/contexts/CartContext";
import { useProduct } from "@/contexts/ProductContext";

const Cart = () => {
  const router = useRouter();
  const {
    cartItems,
    totalAmount,
    itemCount,
    isLoading,
    removeFromCart,
    updateQuantity,
    clearCart,
    formatPrice,
  } = useCart();

  // Handle remove item with confirmation
  const handleRemoveItem = (cartItem: any) => {
    Alert.alert(
      "Remove Item",
      `Are you sure you want to remove "${cartItem.productName}" from your cart?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => removeFromCart(cartItem.productVariationId),
        },
      ]
    );
  };

  // Handle checkout
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert("Empty Cart", "Please add some items to your cart first.");
      return;
    }

    router.push({
      pathname: "/(app)/(screens)/cart-purchase",
      params: {
        cartItems: JSON.stringify(cartItems),
        totalAmount: totalAmount.toFixed(2),
      },
    });
  };

  // Handle clear cart
  const handleClearCart = () => {
    Alert.alert(
      "Clear Cart",
      "Are you sure you want to remove all items from your cart?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: () => clearCart(),
        },
      ]
    );
  };

  const renderCartItem = ({ item }: { item: any }) => {
    return (
      <View className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4 overflow-hidden">
        <View className="flex-row p-4">
          {/* Product Image */}
          <View className="w-20 h-20 bg-gray-50 rounded-lg mr-4 overflow-hidden">
            <Image
              source={{
                uri: item.productImage || "https://via.placeholder.com/150",
              }}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>

          {/* Product Info */}
          <View className="flex-1">
            <Text
              className="text-base font-bold text-gray-900 mb-1"
              numberOfLines={1}
            >
              {item.productName}
            </Text>
            <Text className="text-sm text-gray-600 mb-2" numberOfLines={1}>
              {item.variantName}
            </Text>
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-bold text-blue-600">
                {formatPrice(item.unitPrice)}
              </Text>
              <Text className="text-sm text-gray-500">
                Total: {formatPrice(item.totalPrice)}
              </Text>
            </View>
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
          <Text className="text-sm text-gray-600 font-medium">Quantity</Text>
          <View className="flex-row items-center">
            <TouchableOpacity
              className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
              onPress={() =>
                updateQuantity(item.productVariationId, item.quantity - 1)
              }
              disabled={item.quantity <= 1}
            >
              <Ionicons
                name="remove"
                size={16}
                color={item.quantity <= 1 ? "#9ca3af" : "#374151"}
              />
            </TouchableOpacity>

            <Text className="mx-4 text-base font-semibold text-gray-900 min-w-8 text-center">
              {item.quantity}
            </Text>

            <TouchableOpacity
              className="w-8 h-8 bg-blue-600 rounded-full items-center justify-center"
              onPress={() =>
                updateQuantity(item.productVariationId, item.quantity + 1)
              }
              disabled={item.quantity >= 10}
            >
              <Ionicons name="add" size={16} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-gray-600 mt-2">Loading your cart...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="bg-white px-6 py-4 flex-row items-center justify-between border-b border-gray-100 shadow-sm">
        <View className="flex-row items-center">
          <Text className="text-3xl font-bold text-gray-900">My Cart</Text>
          {itemCount > 0 && (
            <View className="ml-3 bg-blue-600 rounded-full w-7 h-7 items-center justify-center">
              <Text className="text-white text-sm font-bold">{itemCount}</Text>
            </View>
          )}
        </View>

        {cartItems.length > 0 && (
          <TouchableOpacity
            className="p-2 bg-red-50 rounded-full"
            onPress={handleClearCart}
          >
            <Ionicons name="trash-outline" size={22} color="#ef4444" />
          </TouchableOpacity>
        )}
      </View>

      {/* Cart Content */}
      {cartItems.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6 bg-white">
          <View className="w-28 h-28 bg-blue-50 rounded-full items-center justify-center mb-6">
            <Ionicons name="bag-outline" size={48} color="#2563eb" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 mb-3">
            Your cart is empty
          </Text>
          <Text className="text-gray-600 text-center mb-8 leading-6 text-base">
            Looks like you haven't added any items to your cart yet. {"\n"}
            Start shopping to fill it up!
          </Text>
          <TouchableOpacity
            className="bg-blue-600 px-10 py-4 rounded-full shadow-lg"
            onPress={() => router.push("/(app)/(tabs)/shop")}
          >
            <Text className="text-white font-bold text-base">
              Start Shopping
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Cart Items List */}
          <ScrollView
            className="flex-1 px-4 py-4 bg-white"
            showsVerticalScrollIndicator={false}
          >
            <FlatList
              data={cartItems}
              renderItem={renderCartItem}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />

            {/* Continue Shopping Button */}
            <TouchableOpacity
              className="bg-blue-50 py-4 rounded-xl items-center mt-2 mb-4 border border-blue-100"
              onPress={() => router.push("/(app)/(tabs)/shop")}
            >
              <View className="flex-row items-center">
                <Ionicons name="add-circle" size={22} color="#2563eb" />
                <Text className="text-blue-600 font-semibold ml-2 text-base">
                  Continue Shopping
                </Text>
              </View>
            </TouchableOpacity>
          </ScrollView>

          {/* Bottom Summary & Checkout */}
          <View className="bg-white border-t border-gray-200 px-6 py-4 shadow-lg">
            {/* Order Summary */}
            <View className="mb-4">
              <Text className="text-lg font-bold text-gray-900 mb-3">
                Order Summary
              </Text>

              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-600">Items ({itemCount})</Text>
                <Text className="text-gray-900 font-semibold">
                  {formatPrice(totalAmount)}
                </Text>
              </View>

              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-600">Phí vận chuyển</Text>
                <Text className="text-gray-900 font-semibold">30,000₫</Text>
              </View>

              <View className="border-t border-gray-200 pt-3 mt-2">
                <View className="flex-row justify-between">
                  <Text className="text-lg font-bold text-gray-900">Total</Text>
                  <Text className="text-xl font-bold text-blue-600">
                    {formatPrice(totalAmount + 30000)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Checkout Button */}
            <TouchableOpacity
              className="bg-blue-600 py-4 rounded-xl items-center shadow-lg"
              onPress={handleCheckout}
              activeOpacity={0.8}
            >
              <View className="flex-row items-center">
                <Text className="text-white text-lg font-bold mr-2">
                  Proceed to Checkout
                </Text>
                <Ionicons name="arrow-forward" size={22} color="white" />
              </View>
            </TouchableOpacity>

            {/* Security Note */}
            <View className="flex-row items-center justify-center mt-3">
              <Ionicons name="shield-checkmark" size={16} color="#10b981" />
              <Text className="text-xs text-gray-500 ml-1">
                Secure checkout with SSL encryption
              </Text>
            </View>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

export default Cart;
