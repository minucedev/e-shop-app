import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";

const CartPurchase = () => {
  const router = useRouter();
  const { cartItems } = useLocalSearchParams();
  const { user } = useAuth();

  // Parse cart items từ params
  const parsedCartItems = cartItems ? JSON.parse(cartItems as string) : [];

  // State cho delivery method
  const [selectedDelivery, setSelectedDelivery] = React.useState("standard");

  // Thông tin giao hàng chỉ hiển thị, không chỉnh sửa
  const deliveryInfo = {
    name: user?.name || "Minuce",
    email: user?.email || "minuce@mail.com",
    address: "xx, Da Nang, Viet Nam", // Không lấy từ user vì không có trường address
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="flex-row items-center justify-center pt-12 pb-4 px-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute left-5"
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-black">Checkout</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Delivery Info */}
        <View className="px-5">
          <Text className="text-xl font-bold text-black mb-4 mt-4">
            Delivery
          </Text>
          {/* Name */}
          <View className="h-12 rounded-full border border-gray-300 px-5 mb-2 bg-white justify-center">
            <Text className="text-base text-gray-900">{deliveryInfo.name}</Text>
          </View>
          {/* Email */}
          <View className="h-12 rounded-full border border-gray-300 px-5 mb-2 bg-white justify-center">
            <Text className="text-base text-gray-900">
              {deliveryInfo.email}
            </Text>
          </View>
          {/* Address */}
          <View className="h-12 rounded-full border border-gray-300 px-5 mb-2 bg-white justify-center">
            <Text className="text-base text-gray-900">
              {deliveryInfo.address}
            </Text>
          </View>
        </View>

        {/* Delivery Method */}
        <View className="px-5 mt-8">
          <Text className="text-xl font-bold text-black mb-4">
            Delivery Method
          </Text>

          {/* Standard Delivery */}
          <TouchableOpacity
            onPress={() => setSelectedDelivery("standard")}
            className={`flex-row items-center p-4 rounded-2xl mb-3 ${
              selectedDelivery === "standard"
                ? "border-2 border-black bg-gray-50"
                : "border border-gray-300"
            }`}
            activeOpacity={0.7}
          >
            <Ionicons
              name={
                selectedDelivery === "standard"
                  ? "checkmark-circle"
                  : "ellipse-outline"
              }
              size={24}
              color={selectedDelivery === "standard" ? "#000" : "#666"}
            />
            <View className="flex-1 ml-3">
              <Text className="text-base font-bold text-black">
                Standard Delivery
              </Text>
              <Text className="text-sm text-gray-600">
                Arrives in 4-6 business days
              </Text>
            </View>
            <Text className="text-base font-bold text-black">Free</Text>
          </TouchableOpacity>

          {/* Express Delivery */}
          <TouchableOpacity
            onPress={() => setSelectedDelivery("express")}
            className={`flex-row items-center p-4 rounded-2xl mb-3 ${
              selectedDelivery === "express"
                ? "border-2 border-black bg-gray-50"
                : "border border-gray-300"
            }`}
            activeOpacity={0.7}
          >
            <Ionicons
              name={
                selectedDelivery === "express"
                  ? "checkmark-circle"
                  : "ellipse-outline"
              }
              size={24}
              color={selectedDelivery === "express" ? "#000" : "#666"}
            />
            <View className="flex-1 ml-3">
              <Text className="text-base font-bold text-black">
                Express Delivery
              </Text>
              <Text className="text-sm text-gray-600">
                Arrives in 1-2 business days
              </Text>
            </View>
            <Text className="text-base font-bold text-black">$5.99</Text>
          </TouchableOpacity>
        </View>

        {/* Spacer for bottom button */}
        <View className="h-20" />
      </ScrollView>

      {/* Tổng tiền và Continue Button - Fixed at bottom */}
      <View className="px-5 pb-8 pt-4 bg-white border-t border-gray-100">
        {/* Tính tổng tiền */}
        {(() => {
          const subtotal = parsedCartItems.reduce(
            (total: number, item: { price: string; quantity: number }) => {
              const price = parseFloat(item.price.replace("$", ""));
              return total + price * item.quantity;
            },
            0
          );
          const expressFee = selectedDelivery === "express" ? 5.99 : 0;
          const total = subtotal + expressFee;
          return (
            <View className="mb-4">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-base text-gray-600">Subtotal</Text>
                <Text className="text-base font-semibold text-gray-900">
                  ${subtotal.toFixed(2)}
                </Text>
              </View>
              {selectedDelivery === "express" && (
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-base text-gray-600">
                    Express Delivery Fee
                  </Text>
                  <Text className="text-base font-semibold text-gray-900">
                    $5.99
                  </Text>
                </View>
              )}
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-lg font-bold text-black">Total</Text>
                <Text className="text-lg font-bold text-black">
                  ${total.toFixed(2)}
                </Text>
              </View>
            </View>
          );
        })()}
        <TouchableOpacity
          className="bg-black rounded-full h-14 items-center justify-center"
          activeOpacity={0.8}
          onPress={() => {
            // TODO: Process checkout
            console.log("Processing checkout...", {
              deliveryInfo,
              selectedDelivery,
              cartItems: parsedCartItems,
            });
          }}
        >
          <Text className="text-white text-lg font-bold">Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CartPurchase;
