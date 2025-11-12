import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useCart } from "@/contexts/CartContext";
import { useOrders } from "@/contexts/OrderContext";

const PaymentSuccess = () => {
  const router = useRouter();
  const { orderCode, transactionNo, amount, bankCode } = useLocalSearchParams();
  const { clearCart } = useCart();
  const { loadAllOrders } = useOrders();

  useEffect(() => {
    // Clear cart after successful payment
    clearCart();
    // Refresh orders to show new order
    loadAllOrders();
  }, [clearCart, loadAllOrders]);

  const formatAmount = (amt: string) => {
    if (!amt) return "0";
    // VNPay amount is in smallest unit (VND * 100)
    const numAmount = parseInt(amt) / 100;
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(numAmount);
  };

  const handleViewOrders = () => {
    router.replace("/(app)/(screens)/my-orders");
  };

  const handleContinueShopping = () => {
    router.replace("/(app)/(tabs)/shop");
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      {/* Success Icon */}
      <View className="flex-1 justify-center items-center px-6">
        <View className="w-24 h-24 rounded-full bg-green-100 items-center justify-center mb-6">
          <Ionicons name="checkmark-circle" size={80} color="#22c55e" />
        </View>

        <Text className="text-2xl font-bold text-black mb-3 text-center">
          Thanh toán thành công!
        </Text>

        <Text className="text-base text-gray-600 text-center mb-8">
          Đơn hàng của bạn đã được xác nhận và đang được xử lý
        </Text>

        {/* Transaction Details */}
        <View className="w-full bg-gray-50 rounded-2xl p-5 mb-6">
          <View className="flex-row justify-between items-center mb-3 pb-3 border-b border-gray-200">
            <Text className="text-sm text-gray-600">Mã đơn hàng</Text>
            <Text className="text-sm font-bold text-black">
              {orderCode || "N/A"}
            </Text>
          </View>

          {transactionNo && (
            <View className="flex-row justify-between items-center mb-3 pb-3 border-b border-gray-200">
              <Text className="text-sm text-gray-600">Mã giao dịch</Text>
              <Text className="text-sm font-semibold text-black">
                {transactionNo}
              </Text>
            </View>
          )}

          {amount && (
            <View className="flex-row justify-between items-center mb-3 pb-3 border-b border-gray-200">
              <Text className="text-sm text-gray-600">Số tiền</Text>
              <Text className="text-sm font-bold text-green-600">
                {formatAmount(amount as string)}
              </Text>
            </View>
          )}

          {bankCode && (
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-gray-600">Ngân hàng</Text>
              <Text className="text-sm font-semibold text-black uppercase">
                {bankCode}
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View className="w-full space-y-3">
          <TouchableOpacity
            onPress={handleViewOrders}
            className="bg-black rounded-full h-14 items-center justify-center mb-3"
            activeOpacity={0.8}
          >
            <Text className="text-white text-base font-bold">Xem đơn hàng</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleContinueShopping}
            className="border-2 border-black rounded-full h-14 items-center justify-center"
            activeOpacity={0.8}
          >
            <Text className="text-black text-base font-bold">
              Tiếp tục mua sắm
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default PaymentSuccess;
