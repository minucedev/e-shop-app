import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { Address, authApi } from "@/services/authApi";
import {
  orderApi,
  CreateOrderPayload,
  OrderItemPayload,
  ShippingInfo,
  PaymentInfo,
} from "@/services/orderApi";

const CartPurchase = () => {
  const router = useRouter();
  const { cartItems } = useLocalSearchParams();
  const { user } = useAuth();
  const { clearCart } = useCart();

  const [defaultAddress, setDefaultAddress] = useState<Address | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Parse cart items from params
  const parsedCartItems = cartItems ? JSON.parse(cartItems as string) : [];

  // State for payment method
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "COD" | "VNPAY"
  >("COD");

  useEffect(() => {
    const fetchDefaultAddress = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await authApi.getUserAddresses(user.id);
        if (response.success && response.data) {
          const foundDefault = response.data.find((addr) => addr.isDefault);
          if (foundDefault) {
            setDefaultAddress(foundDefault);
          } else if (response.data.length > 0) {
            setDefaultAddress(response.data[0]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch address:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDefaultAddress();
  }, [user]);

  const handlePlaceOrder = async () => {
    if (!user || !defaultAddress) {
      Alert.alert(
        "Lỗi",
        "Thiếu thông tin người dùng hoặc địa chỉ. Vui lòng thử lại."
      );
      return;
    }

    setIsPlacingOrder(true);

    try {
      // Prepare common order data
      const orderItems: OrderItemPayload[] = parsedCartItems.map(
        (item: any) => ({
          productVariationId: item.productVariationId,
          quantity: item.quantity,
        })
      );

      const shippingInfo: ShippingInfo = {
        shippingName: `${user.firstName} ${user.lastName}`,
        shippingPhone: user.phone || "N/A",
        shippingEmail: user.email,
        shippingAddress: defaultAddress.streetAddress,
        shippingWard: defaultAddress.ward,
        shippingDistrict: defaultAddress.district,
        shippingCity: defaultAddress.city,
        shippingPostalCode: defaultAddress.postalCode,
        shippingCountry: "Vietnam",
        shippingMethod: "STANDARD",
        deliveryInstructions: "Gọi trước khi giao hàng",
      };

      const paymentInfo: PaymentInfo = {
        paymentMethod: selectedPaymentMethod,
      };

      const payload: CreateOrderPayload = {
        orderItems,
        shippingInfo,
        paymentInfo,
        note: "Đơn hàng từ ứng dụng mobile",
        returnUrl: "myapp://callback",
      };

      // Call create order API
      const response = await orderApi.createOrder(payload);

      if (!response.success) {
        Alert.alert("Đặt hàng thất bại", response.error || "Có lỗi xảy ra.");
        return;
      }

      // Handle based on payment method
      if (selectedPaymentMethod === "COD") {
        // COD - Show success and clear cart
        Alert.alert(
          "Đặt hàng thành công!",
          "Đơn hàng của bạn đã được đặt thành công. Bạn sẽ thanh toán khi nhận hàng.",
          [
            {
              text: "Xem đơn hàng",
              onPress: () => {
                clearCart();
                router.replace("/(app)/(screens)/my-orders");
              },
            },
            {
              text: "Tiếp tục mua sắm",
              onPress: () => {
                clearCart();
                router.replace("/(app)/(tabs)/shop");
              },
              style: "cancel",
            },
          ]
        );
      } else if (selectedPaymentMethod === "VNPAY") {
        // VNPay - Navigate to WebView with payment URL
        if (response.data?.paymentUrl) {
          router.push({
            pathname: "/(app)/(screens)/payment-webview",
            params: {
              paymentUrl: response.data.paymentUrl,
              orderCode: response.data.orderCode,
            },
          });
        } else {
          Alert.alert(
            "Lỗi",
            "Không thể lấy link thanh toán. Vui lòng thử lại."
          );
        }
      }
    } catch (error: any) {
      Alert.alert("Lỗi", "Có lỗi không mong muốn xảy ra: " + error.message);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Delivery info derived from user and address state
  const deliveryInfo = {
    name: user ? `${user.firstName} ${user.lastName}` : "Không lấy được tên",
    email: user?.email || "Không lấy được email",
    address: defaultAddress
      ? `${defaultAddress.streetAddress}, ${defaultAddress.ward}, ${defaultAddress.district}, ${defaultAddress.city}`
      : "Chưa có địa chỉ. Vui lòng thêm địa chỉ.",
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="bg-white border-b border-gray-200">
        <View className="flex-row items-center px-4 py-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 -ml-2"
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#222" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold flex-1 text-center mr-10">
            Thanh toán
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Delivery Info */}
        <View className="px-5">
          <Text className="text-lg font-bold text-gray-900 mb-4 mt-4">
            Thông tin giao hàng
          </Text>
          {/* Name */}
          <View className="h-12 rounded-lg border border-gray-300 px-4 mb-3 bg-gray-50 justify-center">
            <Text className="text-base text-gray-900">{deliveryInfo.name}</Text>
          </View>
          {/* Email */}
          <View className="h-12 rounded-lg border border-gray-300 px-4 mb-3 bg-gray-50 justify-center">
            <Text className="text-base text-gray-900">
              {deliveryInfo.email}
            </Text>
          </View>
          {/* Address */}
          <View className="min-h-[48px] rounded-lg border border-gray-300 px-4 py-3 mb-3 bg-gray-50 justify-center">
            {isLoading ? (
              <ActivityIndicator color="#3b82f6" />
            ) : (
              <Text className="text-base text-gray-900" numberOfLines={2}>
                {deliveryInfo.address}
              </Text>
            )}
          </View>
        </View>

        {/* Payment Method */}
        <View className="px-5 mt-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Phương thức thanh toán
          </Text>

          {/* COD */}
          <TouchableOpacity
            onPress={() => setSelectedPaymentMethod("COD")}
            className={`flex-row items-center p-4 rounded-lg mb-3 ${
              selectedPaymentMethod === "COD"
                ? "border-2 border-blue-500 bg-blue-50"
                : "border border-gray-300 bg-white"
            }`}
            activeOpacity={0.7}
          >
            <Ionicons
              name={
                selectedPaymentMethod === "COD"
                  ? "checkmark-circle"
                  : "ellipse-outline"
              }
              size={24}
              color={selectedPaymentMethod === "COD" ? "#3b82f6" : "#9ca3af"}
            />
            <View className="flex-1 ml-3">
              <Text className="text-base font-semibold text-gray-900">
                Thanh toán khi nhận hàng (COD)
              </Text>
            </View>
          </TouchableOpacity>

          {/* VNPay */}
          <TouchableOpacity
            onPress={() => setSelectedPaymentMethod("VNPAY")}
            className={`flex-row items-center p-4 rounded-lg mb-3 ${
              selectedPaymentMethod === "VNPAY"
                ? "border-2 border-blue-500 bg-blue-50"
                : "border border-gray-300 bg-white"
            }`}
            activeOpacity={0.7}
          >
            <Ionicons
              name={
                selectedPaymentMethod === "VNPAY"
                  ? "checkmark-circle"
                  : "ellipse-outline"
              }
              size={24}
              color={selectedPaymentMethod === "VNPAY" ? "#3b82f6" : "#9ca3af"}
            />
            <View className="flex-1 ml-3">
              <Text className="text-base font-semibold text-gray-900">
                VNPay
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Spacer for bottom button */}
        <View className="h-20" />
      </ScrollView>

      {/* Total and Continue Button - Fixed at bottom */}
      <View className="px-5 pb-8 pt-4 bg-white border-t border-gray-100">
        {/* Total calculation */}
        {(() => {
          // Calculate subtotal from cart items
          const subtotal = parsedCartItems.reduce(
            (total: number, item: any) => {
              return total + (item.totalPrice || 0);
            },
            0
          );

          // Fixed shipping fee
          const shippingFee = 30000;

          // Total = Subtotal + Shipping
          const total = subtotal + shippingFee;

          // Format VND
          const formatVND = (amount: number) => {
            return new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(amount);
          };

          return (
            <View className="mb-4">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-base text-gray-600">Tạm tính</Text>
                <Text className="text-base font-semibold text-gray-900">
                  {formatVND(subtotal)}
                </Text>
              </View>
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-base text-gray-600">Phí vận chuyển</Text>
                <Text className="text-base font-semibold text-gray-900">
                  {formatVND(shippingFee)}
                </Text>
              </View>
              <View className="flex-row justify-between items-center mb-2 pt-2 border-t border-gray-200">
                <Text className="text-lg font-bold text-black">Tổng cộng</Text>
                <Text className="text-lg font-bold text-black">
                  {formatVND(total)}
                </Text>
              </View>
            </View>
          );
        })()}
        <TouchableOpacity
          className="bg-blue-600 rounded-xl h-14 items-center justify-center shadow-sm"
          activeOpacity={0.8}
          onPress={handlePlaceOrder}
          disabled={isPlacingOrder || isLoading}
        >
          {isPlacingOrder ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white text-lg font-bold">Đặt hàng</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CartPurchase;
