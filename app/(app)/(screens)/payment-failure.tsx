import React from "react";
import { View, Text, TouchableOpacity, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";

const PaymentFailure = () => {
  const router = useRouter();
  const { orderCode, responseCode, message } = useLocalSearchParams();

  const handleTryAgain = () => {
    // Go back to cart purchase screen to retry
    router.back();
    router.back(); // Go back twice: once from this screen, once from webview
  };

  const handleViewOrders = () => {
    router.replace("/(app)/(screens)/my-orders");
  };

  const handleBackToShop = () => {
    router.replace("/(app)/(tabs)/shop");
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      {/* Error Icon */}
      <View className="flex-1 justify-center items-center px-6">
        <View className="w-24 h-24 rounded-full bg-red-100 items-center justify-center mb-6">
          <Ionicons name="close-circle" size={80} color="#ef4444" />
        </View>

        <Text className="text-2xl font-bold text-black mb-3 text-center">
          Thanh toán thất bại
        </Text>

        <Text className="text-base text-gray-600 text-center mb-2">
          {message || "Giao dịch không thành công. Vui lòng thử lại sau."}
        </Text>

        {/* Error Details */}
        <View className="w-full bg-red-50 rounded-2xl p-5 mb-6 mt-4">
          <View className="flex-row justify-between items-center mb-3 pb-3 border-b border-red-200">
            <Text className="text-sm text-gray-600">Mã đơn hàng</Text>
            <Text className="text-sm font-bold text-black">
              {orderCode || "N/A"}
            </Text>
          </View>

          <View className="flex-row justify-between items-center">
            <Text className="text-sm text-gray-600">Mã lỗi</Text>
            <Text className="text-sm font-bold text-red-600">
              {responseCode || "Unknown"}
            </Text>
          </View>
        </View>

        {/* Support Info */}
        <View className="w-full bg-blue-50 rounded-2xl p-4 mb-6">
          <View className="flex-row items-start">
            <Ionicons
              name="information-circle"
              size={20}
              color="#3b82f6"
              className="mr-2"
            />
            <View className="flex-1 ml-2">
              <Text className="text-sm text-blue-800 font-semibold mb-1">
                Cần hỗ trợ?
              </Text>
              <Text className="text-xs text-blue-700">
                Nếu bạn đã bị trừ tiền nhưng giao dịch không thành công, vui
                lòng liên hệ với chúng tôi để được hỗ trợ.
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="w-full space-y-3">
          <TouchableOpacity
            onPress={handleTryAgain}
            className="bg-black rounded-full h-14 items-center justify-center mb-3"
            activeOpacity={0.8}
          >
            <Text className="text-white text-base font-bold">Thử lại</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleViewOrders}
            className="border-2 border-black rounded-full h-14 items-center justify-center mb-3"
            activeOpacity={0.8}
          >
            <Text className="text-black text-base font-bold">Xem đơn hàng</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleBackToShop}
            className="border border-gray-300 rounded-full h-14 items-center justify-center"
            activeOpacity={0.8}
          >
            <Text className="text-gray-700 text-base font-semibold">
              Về trang chủ
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default PaymentFailure;
