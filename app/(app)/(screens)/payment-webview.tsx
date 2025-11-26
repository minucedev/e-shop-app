import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { WebView } from "react-native-webview";
import type { WebViewNavigation } from "react-native-webview";
import { useCart } from "@/contexts/CartContext";
import { orderApi } from "@/services/orderApi";

const PaymentWebView = () => {
  const router = useRouter();
  const { paymentUrl, orderCode } = useLocalSearchParams();
  const { clearCart } = useCart();
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasHandledCallback, setHasHandledCallback] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");
  const [isPolling, setIsPolling] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start polling backend for payment status
  const startPaymentStatusPolling = () => {
    if (isPolling || !orderCode) return;

    setIsPolling(true);
    const startTime = Date.now();
    const maxDuration = 2 * 60 * 1000; // 2 minutes

    if (__DEV__) {
      console.log("🔄 Starting payment status polling for order:", orderCode);
    }

    pollingIntervalRef.current = setInterval(async () => {
      try {
        // Check if timeout reached
        if (Date.now() - startTime > maxDuration) {
          if (__DEV__) {
            console.log("⏱️ Polling timeout reached");
          }
          stopPolling();
          Alert.alert(
            "Hết thời gian chờ",
            "Vui lòng kiểm tra lại trạng thái đơn hàng trong 'Đơn hàng của tôi'",
            [{ text: "OK", onPress: () => router.back() }]
          );
          return;
        }

        // Check order status
        const order = await orderApi.getOrderByCode(orderCode as string);

        if (__DEV__) {
          console.log("📊 Order status:", order?.paymentStatus);
        }

        // Check if payment completed
        if (
          order &&
          (order.paymentStatus === "PAID" || order.paymentStatus === "SUCCESS")
        ) {
          stopPolling();

          if (__DEV__) {
            console.log("✅ Payment successful via polling");
          }

          await clearCart();
          router.replace({
            pathname: "/(app)/(screens)/payment-success",
            params: {
              orderCode: orderCode as string,
              transactionNo: "",
              amount: "",
              bankCode: "",
            },
          });
        } else if (
          order &&
          (order.paymentStatus === "FAILED" ||
            order.paymentStatus === "CANCELLED")
        ) {
          stopPolling();

          if (__DEV__) {
            console.log("❌ Payment failed via polling");
          }

          router.replace({
            pathname: "/(app)/(screens)/payment-failure",
            params: {
              orderCode: orderCode as string,
              responseCode: "24",
              message: "Giao dịch không thành công",
            },
          });
        }
      } catch (error) {
        if (__DEV__) {
          console.error("❌ Error polling payment status:", error);
        }
      }
    }, 3000); // Poll every 3 seconds
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setIsPolling(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, []);

  // MAIN LOGIC - Handle navigation state changes
  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    const { url } = navState;
    setCurrentUrl(url);

    if (__DEV__) {
      console.log("🔍 Navigation URL:", url);
    }

    // Start polling when user reaches OTP confirmation page
    if (
      (url.includes("/Confirm.html") || url.includes("/Transaction/Confirm")) &&
      !isPolling
    ) {
      if (__DEV__) {
        console.log(
          "📱 On OTP confirmation page - starting payment status polling"
        );
      }
      startPaymentStatusPolling();
    }

    // Still check for direct callback (in case VNPay fixes their sandbox)
    if (url.startsWith("myapp://") || url.includes("vnp_ResponseCode=")) {
      if (hasHandledCallback) {
        return;
      }

      if (__DEV__) {
        console.log("✅ Detected callback URL in navigation:", url);
      }

      setHasHandledCallback(true);
      stopPolling(); // Stop polling if we get direct callback
      handleCallbackUrl(url);
    }
  };

  // CRITICAL: Intercept callback URL before WebView tries to load it
  const handleShouldStartLoadWithRequest = (request: any): boolean => {
    const { url } = request;

    if (__DEV__) {
      console.log("🔍 Should load URL:", url);
    }

    // Intercept any myapp:// scheme
    if (url.startsWith("myapp://")) {
      if (__DEV__) {
        console.log("✅ Intercepting myapp:// scheme:", url);
      }

      if (!hasHandledCallback) {
        setHasHandledCallback(true);
        stopPolling();
        handleCallbackUrl(url);
      }

      // Don't let WebView try to load this URL
      return false;
    }

    // Intercept any URL with VNPay response parameters
    if (
      url.includes("vnp_ResponseCode=") ||
      url.includes("vnp_TransactionNo=")
    ) {
      if (__DEV__) {
        console.log("✅ Intercepting URL with VNPay parameters:", url);
      }

      if (!hasHandledCallback) {
        setHasHandledCallback(true);
        stopPolling();
        handleCallbackUrl(url);
      }

      // Don't let WebView try to load this URL
      return false;
    }

    // Allow all other URLs to load
    return true;
  };

  // Parse callback URL and navigate to result screen
  const handleCallbackUrl = async (url: string) => {
    try {
      if (__DEV__) {
        console.log("💳 Processing callback URL:", url);
      }

      // Parse URL - convert custom scheme to standard URL for parsing
      const urlObj = new URL(url.replace("myapp://", "https://dummy/"));
      const params = urlObj.searchParams;

      // Extract VNPay response parameters
      const vnpResponseCode = params.get("vnp_ResponseCode");
      const vnpTransactionNo = params.get("vnp_TransactionNo");
      const vnpAmount = params.get("vnp_Amount");
      const vnpBankCode = params.get("vnp_BankCode");

      if (__DEV__) {
        console.log("💳 VNPay Response:", {
          responseCode: vnpResponseCode,
          transactionNo: vnpTransactionNo,
          amount: vnpAmount,
          bankCode: vnpBankCode,
        });
      }

      // Check if we got the response code
      if (!vnpResponseCode) {
        if (__DEV__) {
          console.error("❌ No vnp_ResponseCode found in URL");
        }
        Alert.alert("Lỗi", "Không thể xác định kết quả thanh toán");
        router.back();
        return;
      }

      // Navigate based on response code
      if (vnpResponseCode === "00") {
        // Payment successful - Clear cart first
        await clearCart();

        if (__DEV__) {
          console.log("✅ Payment successful, cart cleared");
        }

        router.replace({
          pathname: "/(app)/(screens)/payment-success",
          params: {
            orderCode: orderCode as string,
            transactionNo: vnpTransactionNo || "",
            amount: vnpAmount || "",
            bankCode: vnpBankCode || "",
          },
        });
      } else {
        // Payment failed
        if (__DEV__) {
          console.log("❌ Payment failed with code:", vnpResponseCode);
        }

        router.replace({
          pathname: "/(app)/(screens)/payment-failure",
          params: {
            orderCode: orderCode as string,
            responseCode: vnpResponseCode,
            message: getErrorMessage(vnpResponseCode),
          },
        });
      }
    } catch (error) {
      console.error("❌ Error handling callback URL:", error);
      Alert.alert("Lỗi", "Không thể xử lý kết quả thanh toán");
      router.back();
    }
  };

  // Get VNPay error message based on response code
  const getErrorMessage = (code: string): string => {
    const errorMessages: { [key: string]: string } = {
      "07": "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).",
      "09": "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.",
      "10": "Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần",
      "11": "Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.",
      "12": "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.",
      "13": "Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin quý khách vui lòng thực hiện lại giao dịch.",
      "24": "Giao dịch không thành công do: Khách hàng hủy giao dịch",
      "51": "Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.",
      "65": "Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.",
      "75": "Ngân hàng thanh toán đang bảo trì.",
      "79": "Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định. Xin quý khách vui lòng thực hiện lại giao dịch",
      "99": "Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)",
    };

    return (
      errorMessages[code] || "Giao dịch không thành công. Vui lòng thử lại sau."
    );
  };

  // Loading handlers
  const handleLoadStart = () => {
    setIsLoading(true);
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  // Error handler - handle WebView errors
  const handleError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;

    if (__DEV__) {
      console.error("❌ WebView error:", nativeEvent);
      console.error("Error details:", {
        url: nativeEvent.url,
        code: nativeEvent.code,
        description: nativeEvent.description,
      });
    }

    // If error happens on callback URL or VNPay result URL, try to parse it anyway
    if (
      nativeEvent.url &&
      (nativeEvent.url.startsWith("myapp://") ||
        nativeEvent.url.includes("vnp_ResponseCode="))
    ) {
      if (__DEV__) {
        console.log(
          "🔍 Error on payment URL, attempting to parse:",
          nativeEvent.url
        );
      }

      if (!hasHandledCallback) {
        setHasHandledCallback(true);
        stopPolling();
        handleCallbackUrl(nativeEvent.url);
      }
      return;
    }

    // Show error alert for other errors
    Alert.alert(
      "Lỗi",
      "Không thể tải trang thanh toán. Vui lòng thử lại sau.",
      [
        {
          text: "OK",
          onPress: () => {
            stopPolling();
            router.back();
          },
        },
      ]
    );
  };

  // Validate payment URL
  if (!paymentUrl) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <Text className="text-red-500 text-base">
          URL thanh toán không hợp lệ
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 px-6 py-3 bg-black rounded-full"
        >
          <Text className="text-white font-semibold">Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="flex-row items-center justify-center pt-12 pb-4 px-4 border-b border-gray-200">
        <TouchableOpacity
          onPress={() => {
            Alert.alert(
              "Hủy thanh toán",
              "Bạn có chắc muốn hủy thanh toán không?",
              [
                {
                  text: "Không",
                  style: "cancel",
                },
                {
                  text: "Có",
                  onPress: () => router.back(),
                  style: "destructive",
                },
              ]
            );
          }}
          className="absolute left-5"
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-black">Thanh toán VNPay</Text>
      </View>

      {/* Loading Indicator */}
      {isLoading && (
        <View className="absolute top-20 left-0 right-0 z-10 items-center">
          <View className="bg-white px-4 py-2 rounded-full shadow-lg">
            <ActivityIndicator size="small" color="#000" />
          </View>
        </View>
      )}

      {/* WebView - ENHANCED CONFIG */}
      <WebView
        ref={webViewRef}
        source={{ uri: paymentUrl as string }}
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
        onNavigationStateChange={handleNavigationStateChange}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        startInLoadingState={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        sharedCookiesEnabled={true}
        thirdPartyCookiesEnabled={true}
        style={{ flex: 1 }}
      />

      {/* Debug info - Development only */}
      {__DEV__ && (
        <View className="absolute bottom-0 left-0 right-0 bg-black/90 p-3">
          <Text className="text-white text-xs font-bold mb-1">Debug Info:</Text>
          <Text className="text-white text-xs" numberOfLines={2}>
            URL: {currentUrl}
          </Text>
          <Text className="text-yellow-400 text-xs mt-1">
            {isPolling
              ? "🔄 Polling payment status..."
              : hasHandledCallback
                ? "✅ Payment processed"
                : "⏳ Waiting..."}
          </Text>
        </View>
      )}
    </View>
  );
};

export default PaymentWebView;
