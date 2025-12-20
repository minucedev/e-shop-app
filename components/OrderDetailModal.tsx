import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Order } from "@/services/orderApi";

interface OrderDetailModalProps {
  visible: boolean;
  order: Order | null;
  onClose: () => void;
  onCancelOrder: (orderId: number) => Promise<boolean>;
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
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "CONFIRMED":
      return "bg-blue-100 text-blue-800 border-blue-300";
    case "SHIPPING":
      return "bg-purple-100 text-purple-800 border-purple-300";
    case "DELIVERED":
      return "bg-green-100 text-green-800 border-green-300";
    case "CANCELLED":
      return "bg-red-100 text-red-800 border-red-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
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

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  visible,
  order,
  onClose,
  onCancelOrder,
}) => {
  const [cancelling, setCancelling] = useState(false);

  if (!order) return null;

  // Check if order can be cancelled
  // Only COD orders with PENDING or CONFIRMED status can be cancelled
  const canCancel =
    order.paymentMethod === "COD" &&
    (order.status === "PENDING" || order.status === "CONFIRMED");

  const handleCancelOrder = () => {
    Alert.alert(
      "Xác nhận hủy đơn hàng",
      "Bạn có chắc chắn muốn hủy đơn hàng này?",
      [
        {
          text: "Không",
          style: "cancel",
        },
        {
          text: "Hủy đơn",
          style: "destructive",
          onPress: async () => {
            setCancelling(true);
            const success = await onCancelOrder(order.id);
            setCancelling(false);

            if (success) {
              Alert.alert("Thành công", "Đơn hàng đã được hủy thành công", [
                {
                  text: "OK",
                  onPress: onClose,
                },
              ]);
            } else {
              Alert.alert(
                "Lỗi",
                "Không thể hủy đơn hàng. Vui lòng thử lại sau."
              );
            }
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50">
        <View className="flex-1 mt-20 bg-white rounded-t-3xl">
          {/* Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <Text className="text-lg font-bold">Chi tiết đơn hàng</Text>
            <TouchableOpacity
              onPress={onClose}
              className="p-2"
              disabled={cancelling}
            >
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-4">
            {/* Order Code & Status */}
            <View className="bg-gray-50 rounded-lg p-4 mb-4">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-gray-600 text-sm">Mã đơn hàng</Text>
                <Text className="font-semibold">{order.orderCode}</Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-600 text-sm">Trạng thái</Text>
                <View
                  className={`px-3 py-1 rounded-full border ${getStatusColor(order.status)}`}
                >
                  <Text className="text-xs font-medium">
                    {getStatusText(order.status)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Shipping Information */}
            <View className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
              <Text className="font-semibold text-base mb-3">
                Thông tin giao hàng
              </Text>
              <View className="space-y-2">
                <View className="flex-row">
                  <Ionicons name="person-outline" size={18} color="#6B7280" />
                  <Text className="text-gray-700 ml-2 flex-1">
                    {order.shippingName}
                  </Text>
                </View>
                <View className="flex-row">
                  <Ionicons name="call-outline" size={18} color="#6B7280" />
                  <Text className="text-gray-700 ml-2 flex-1">
                    {order.shippingPhone}
                  </Text>
                </View>
                <View className="flex-row">
                  <Ionicons name="location-outline" size={18} color="#6B7280" />
                  <Text className="text-gray-700 ml-2 flex-1">
                    {order.shippingAddress}, {order.shippingWard},{" "}
                    {order.shippingDistrict}, {order.shippingCity}
                  </Text>
                </View>
              </View>
              {order.note && (
                <View className="mt-3 pt-3 border-t border-gray-200">
                  <Text className="text-gray-600 text-sm mb-1">Ghi chú:</Text>
                  <Text className="text-gray-700">{order.note}</Text>
                </View>
              )}
            </View>

            {/* Order Items */}
            <View className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
              <Text className="font-semibold text-base mb-3">
                Sản phẩm ({order.orderItems.length})
              </Text>
              {order.orderItems.map((item, index) => (
                <View
                  key={item.id}
                  className={`pb-3 ${
                    index < order.orderItems.length - 1
                      ? "mb-3 border-b border-gray-200"
                      : ""
                  }`}
                >
                  <Text className="font-medium text-base mb-1">
                    {item.productName}
                  </Text>
                  <Text className="text-gray-600 text-sm mb-2">
                    {item.productVariationName}
                  </Text>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-gray-600">x{item.quantity}</Text>
                    <View className="items-end">
                      <Text className="text-blue-600 font-medium">
                        {formatPrice(item.unitPrice)}
                      </Text>
                      {item.discountAmount > 0 && (
                        <Text className="text-xs text-gray-500 line-through">
                          {formatPrice(item.unitPrice + item.discountAmount)}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* Payment Information */}
            <View className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
              <Text className="font-semibold text-base mb-3">
                Thông tin thanh toán
              </Text>
              <View className="space-y-2">
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Phương thức</Text>
                  <Text className="font-medium">
                    {order.paymentMethod === "COD" ? "COD" : "VNPay"}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Trạng thái</Text>
                  <Text className="font-medium">
                    {getPaymentStatusText(order.paymentStatus)}
                  </Text>
                </View>
                <View className="flex-row justify-between pt-2 border-t border-gray-200">
                  <Text className="text-gray-600">Tạm tính</Text>
                  <Text>{formatPrice(order.totalAmount)}</Text>
                </View>
                {order.discountAmount > 0 && (
                  <View className="flex-row justify-between">
                    <Text className="text-gray-600">Giảm giá</Text>
                    <Text className="text-green-600">
                      -{formatPrice(order.discountAmount)}
                    </Text>
                  </View>
                )}
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Phí vận chuyển</Text>
                  <Text>{formatPrice(order.shippingFee)}</Text>
                </View>
                <View className="flex-row justify-between pt-2 border-t border-gray-200">
                  <Text className="font-semibold text-base">Tổng cộng</Text>
                  <Text className="font-bold text-lg text-red-600">
                    {formatPrice(order.finalAmount)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Order Dates */}
            <View className="bg-gray-50 rounded-lg p-4 mb-4">
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-600 text-sm">Ngày đặt hàng</Text>
                <Text className="text-sm">{formatDate(order.createdAt)}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600 text-sm">Cập nhật lần cuối</Text>
                <Text className="text-sm">{formatDate(order.updatedAt)}</Text>
              </View>
            </View>

            {/* Cancel Button */}
            {canCancel && (
              <TouchableOpacity
                className={`rounded-lg py-4 mb-4 ${
                  cancelling ? "bg-gray-400" : "bg-red-600"
                }`}
                onPress={handleCancelOrder}
                disabled={cancelling}
              >
                {cancelling ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-center font-semibold text-base">
                    Hủy đơn hàng
                  </Text>
                )}
              </TouchableOpacity>
            )}

            {/* Info about cancellation policy */}
            {canCancel && (
              <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <View className="flex-row">
                  <Ionicons
                    name="information-circle-outline"
                    size={20}
                    color="#D97706"
                  />
                  <Text className="text-xs text-yellow-800 ml-2 flex-1">
                    Bạn chỉ có thể hủy đơn hàng khi đơn hàng đang ở trạng thái
                    "Chờ xác nhận" hoặc "Đã xác nhận"
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
