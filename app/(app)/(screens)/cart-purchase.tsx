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
import { SafeAreaView } from "react-native-safe-area-context";
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
        "Error",
        "User information or address is missing. Please try again."
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
        Alert.alert("Order Failed", response.error || "An error occurred.");
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
      Alert.alert("Error", "An unexpected error occurred: " + error.message);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Delivery info derived from user and address state
  const deliveryInfo = {
    name: user ? `${user.firstName} ${user.lastName}` : "Cannot get name",
    email: user?.email || "Cannot get email",
    address: defaultAddress
      ? `${defaultAddress.streetAddress}, ${defaultAddress.ward}, ${defaultAddress.district}, ${defaultAddress.city}`
      : "No address found. Please add one.",
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="flex-row items-center justify-center py-4 px-6 bg-white border-b border-gray-100 shadow-sm">
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute left-6"
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={26} color="#111827" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-900">Checkout</Text>
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
          <View className="min-h-[48px] rounded-full border border-gray-300 px-5 py-3 mb-2 bg-white justify-center">
            {isLoading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text className="text-base text-gray-900" numberOfLines={2}>
                {deliveryInfo.address}
              </Text>
            )}
          </View>
        </View>

        {/* Payment Method */}
        <View className="px-5 mt-8">
          <Text className="text-xl font-bold text-black mb-4">
            Payment Method
          </Text>

          {/* COD */}
          <TouchableOpacity
            onPress={() => setSelectedPaymentMethod("COD")}
            className={`flex-row items-center p-4 rounded-xl mb-3 ${
              selectedPaymentMethod === "COD"
                ? "border-2 border-blue-600 bg-blue-50"
                : "border border-gray-200 bg-white"
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
              color={selectedPaymentMethod === "COD" ? "#2563eb" : "#9ca3af"}
            />
            <View className="flex-1 ml-3">
              <Text
                className={`text-base font-bold ${
                  selectedPaymentMethod === "COD"
                    ? "text-blue-600"
                    : "text-gray-700"
                }`}
              >
                Cash on Delivery (COD)
              </Text>
            </View>
          </TouchableOpacity>

          {/* VNPay */}
          <TouchableOpacity
            onPress={() => setSelectedPaymentMethod("VNPAY")}
            className={`flex-row items-center p-4 rounded-xl mb-3 ${
              selectedPaymentMethod === "VNPAY"
                ? "border-2 border-blue-600 bg-blue-50"
                : "border border-gray-200 bg-white"
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
              color={selectedPaymentMethod === "VNPAY" ? "#2563eb" : "#9ca3af"}
            />
            <View className="flex-1 ml-3">
              <Text
                className={`text-base font-bold ${
                  selectedPaymentMethod === "VNPAY"
                    ? "text-blue-600"
                    : "text-gray-700"
                }`}
              >
                VNPay
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Spacer for bottom button */}
        <View className="h-20" />
      </ScrollView>

      {/* Total and Continue Button - Fixed at bottom */}
      <View className="px-5 pb-4 pt-4 bg-white border-t border-gray-100">
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
          className="bg-blue-600 rounded-xl h-14 items-center justify-center shadow-lg"
          activeOpacity={0.8}
          onPress={handlePlaceOrder}
          disabled={isPlacingOrder || isLoading}
        >
          {isPlacingOrder ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white text-lg font-bold">Place Order</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default CartPurchase;
