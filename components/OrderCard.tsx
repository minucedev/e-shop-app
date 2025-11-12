import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Order } from "@/services/orderApi";
import { router } from "expo-router";

interface OrderCardProps {
  order: Order;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-800";
    case "CONFIRMED":
      return "bg-blue-100 text-blue-800";
    case "SHIPPING":
      return "bg-purple-100 text-purple-800";
    case "DELIVERED":
      return "bg-green-100 text-green-800";
    case "CANCELLED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "PENDING":
      return "Chờ xác nhận";
    case "CONFIRMED":
      return "Đã xác nhận";
    case "SHIPPING":
      return "Đang giao";
    case "DELIVERED":
      return "Đã giao";
    case "CANCELLED":
      return "Đã hủy";
    default:
      return status;
  }
};

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case "PENDING":
      return "text-orange-600";
    case "PAID":
      return "text-green-600";
    case "FAILED":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
};

const getPaymentStatusText = (status: string) => {
  switch (status) {
    case "PENDING":
      return "Chưa thanh toán";
    case "PAID":
      return "Đã thanh toán";
    case "FAILED":
      return "Thanh toán thất bại";
    default:
      return status;
  }
};

export const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const handlePress = () => {
    // TODO: Implement order detail screen
    // router.push({
    //   pathname: "/(app)/(screens)/order-detail",
    //   params: { orderId: order.id.toString() },
    // });
    console.log("View order detail:", order.id);
  };

  return (
    <TouchableOpacity
      className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-200"
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View className="flex-row justify-between items-center mb-3 pb-3 border-b border-gray-200">
        <View>
          <Text className="text-xs text-gray-500 mb-1">Mã đơn hàng</Text>
          <Text className="font-semibold text-sm">{order.orderCode}</Text>
        </View>
        <View
          className={`px-3 py-1 rounded-full ${getStatusColor(order.status)}`}
        >
          <Text className="text-xs font-medium">
            {getStatusText(order.status)}
          </Text>
        </View>
      </View>

      {/* Order Items */}
      <View className="mb-3">
        {order.orderItems.map((item, index) => (
          <View
            key={item.id}
            className={index > 0 ? "mt-2 pt-2 border-t border-gray-100" : ""}
          >
            <Text className="font-medium text-sm" numberOfLines={1}>
              {item.productName}
            </Text>
            <Text className="text-xs text-gray-600 mt-1">
              {item.productVariationName}
            </Text>
            <View className="flex-row justify-between items-center mt-1">
              <Text className="text-xs text-gray-500">x{item.quantity}</Text>
              <Text className="text-sm font-medium text-blue-600">
                {formatPrice(item.unitPrice)}
              </Text>
            </View>
          </View>
        ))}
        {order.orderItems.length > 2 && (
          <Text className="text-xs text-blue-600 mt-2">
            +{order.orderItems.length - 2} sản phẩm khác
          </Text>
        )}
      </View>

      {/* Payment Info */}
      <View className="flex-row justify-between items-center mb-2 pb-2 border-b border-gray-100">
        <View className="flex-row items-center">
          <Text className="text-xs text-gray-500 mr-2">Thanh toán:</Text>
          <Text className="text-xs font-medium">
            {order.paymentMethod === "COD" ? "COD" : "VNPay"}
          </Text>
        </View>
        <Text
          className={`text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}
        >
          {getPaymentStatusText(order.paymentStatus)}
        </Text>
      </View>

      {/* Total Amount */}
      <View className="flex-row justify-between items-center">
        <Text className="text-xs text-gray-600">Tổng tiền:</Text>
        <Text className="text-base font-bold text-red-600">
          {formatPrice(order.finalAmount)}
        </Text>
      </View>

      {/* Order Date */}
      <View className="mt-2 pt-2 border-t border-gray-100">
        <Text className="text-xs text-gray-500">
          Đặt ngày: {formatDate(order.createdAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
