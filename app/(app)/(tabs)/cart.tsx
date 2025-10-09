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
  } = useCart();
  const { getProductById, formatPrice } = useProduct();

  // Handle remove item with confirmation
  const handleRemoveItem = (cartItem: any) => {
    const product = getProductById(cartItem.productId);
    Alert.alert(
      "Remove Item",
      `Are you sure you want to remove "${product?.name || "this item"}" from your cart?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => removeFromCart(cartItem.id),
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
    const product = getProductById(item.productId);
    if (!product) return null;

    const priceStr =
      typeof product.price === "string"
        ? product.price
        : product.price.toString();
    const itemTotalPrice =
      parseFloat(priceStr.replace("$", "")) * item.quantity;

    return (
      <View className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4 overflow-hidden">
        <View className="flex-row p-4">
          {/* Product Image */}
          <View className="w-20 h-20 bg-gray-50 rounded-lg mr-4 overflow-hidden">
            <Image
              source={{ uri: product.image }}
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
              {product.name}
            </Text>
            <Text className="text-sm text-gray-600 mb-2" numberOfLines={1}>
              {product.description}
            </Text>
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-bold text-blue-600">
                {formatPrice(product.price)}
              </Text>
              <Text className="text-sm text-gray-500">
                Total: ${itemTotalPrice.toFixed(2)}
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
              onPress={() => updateQuantity(item.id, item.quantity - 1)}
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
              className="w-8 h-8 bg-blue-500 rounded-full items-center justify-center"
              onPress={() => updateQuantity(item.id, item.quantity + 1)}
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
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View className="bg-white px-6 py-4 flex-row items-center justify-between border-b border-gray-100 shadow-sm">
        <View className="flex-row items-center">
          <Text className="text-xl font-bold text-gray-900">My Cart</Text>
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
            Your cart is empty
          </Text>
          <Text className="text-gray-600 text-center mb-6 leading-5">
            Looks like you haven't added any items to your cart yet. {"\n"}
            Start shopping to fill it up!
          </Text>
          <TouchableOpacity
            className="bg-blue-500 px-8 py-3 rounded-full shadow-lg"
            onPress={() => router.push("/(app)/(tabs)/shop")}
          >
            <Text className="text-white font-semibold text-base">
              Start Shopping
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
              keyExtractor={(item) => item.id}
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
                  ${totalAmount.toFixed(2)}
                </Text>
              </View>

              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-600">Shipping</Text>
                <Text className="text-green-600 font-semibold">Free</Text>
              </View>

              <View className="border-t border-gray-200 pt-3 mt-2">
                <View className="flex-row justify-between">
                  <Text className="text-lg font-bold text-gray-900">Total</Text>
                  <Text className="text-xl font-bold text-blue-600">
                    ${totalAmount.toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Checkout Button */}
            <TouchableOpacity
              className="bg-blue-500 py-4 rounded-xl items-center shadow-lg"
              onPress={handleCheckout}
              activeOpacity={0.8}
            >
              <View className="flex-row items-center">
                <Text className="text-white text-lg font-bold mr-2">
                  Proceed to Checkout
                </Text>
                <Ionicons name="arrow-forward" size={20} color="white" />
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
    </View>
  );
};

export default Cart;
