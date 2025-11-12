import React, { useRef, useState } from "react";
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

const PaymentWebView = () => {
  const router = useRouter();
  const { paymentUrl, orderCode } = useLocalSearchParams();
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState("");
  const [hasHandledCallback, setHasHandledCallback] = useState(false);

  // Injected JavaScript to intercept navigation
  const injectedJavaScript = `
    (function() {
      // Override window.location to intercept redirects
      var originalLocation = window.location;
      Object.defineProperty(window, 'location', {
        get: function() {
          return originalLocation;
        },
        set: function(value) {
          if (typeof value === 'string' && value.startsWith('myapp://callback')) {
            // Send message to React Native
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'CALLBACK_URL',
              url: value
            }));
            return;
          }
          originalLocation = value;
        }
      });

      // Also intercept href changes
      document.addEventListener('click', function(e) {
        var target = e.target;
        while (target && target.tagName !== 'A') {
          target = target.parentElement;
        }
        if (target && target.href && target.href.startsWith('myapp://callback')) {
          e.preventDefault();
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'CALLBACK_URL',
            url: target.href
          }));
        }
      });

      // Check current URL on load
      if (window.location.href && window.location.href.startsWith('myapp://callback')) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'CALLBACK_URL',
          url: window.location.href
        }));
      }
    })();
    true; // Required for injectedJavaScript
  `;

  // Handle messages from WebView
  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (__DEV__) {
        console.log("📨 Message from WebView:", data);
      }

      if (data.type === "CALLBACK_URL") {
        if (__DEV__) {
          console.log("✅ Received callback URL from WebView:", data.url);
        }

        if (hasHandledCallback) {
          if (__DEV__) {
            console.log("⚠️ Already handled, skipping...");
          }
          return;
        }

        setHasHandledCallback(true);
        handleCallbackUrl(data.url);
      }
    } catch (error) {
      if (__DEV__) {
        console.error("❌ Error parsing WebView message:", error);
      }
    }
  };

  // Handle should start load - INTERCEPT before loading
  const handleShouldStartLoadWithRequest = (request: any): boolean => {
    const { url } = request;

    if (__DEV__) {
      console.log("🔍 Should load URL:", url);
    }

    // Check if the URL is our return URL (deep link)
    if (url.startsWith("myapp://callback")) {
      if (__DEV__) {
        console.log("✅ Detected callback URL, intercepting...");
      }

      // Prevent duplicate handling
      if (hasHandledCallback) {
        if (__DEV__) {
          console.log("⚠️ Already handled, skipping...");
        }
        return false;
      }

      setHasHandledCallback(true);
      handleCallbackUrl(url);

      // Prevent WebView from trying to load this URL
      return false;
    }

    // Allow all other URLs to load
    return true;
  };

  // Handle callback URL parsing and navigation
  const handleCallbackUrl = (url: string) => {
    try {
      // Parse query parameters from URL
      const urlObj = new URL(url.replace("myapp://", "https://dummy/"));
      const params = urlObj.searchParams;

      // Get VNPay response code
      const vnpResponseCode = params.get("vnp_ResponseCode");
      const vnpTransactionNo = params.get("vnp_TransactionNo");
      const vnpAmount = params.get("vnp_Amount");
      const vnpBankCode = params.get("vnp_BankCode");
      const vnpOrderInfo = params.get("vnp_OrderInfo");

      if (__DEV__) {
        console.log("💳 VNPay Response:", {
          vnpResponseCode,
          vnpTransactionNo,
          vnpAmount,
          vnpBankCode,
          vnpOrderInfo,
        });
      }

      // Navigate based on response code
      if (vnpResponseCode === "00") {
        // Success
        if (__DEV__) {
          console.log("✅ Payment successful, navigating to success screen...");
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
        // Failure
        if (__DEV__) {
          console.log("❌ Payment failed, navigating to failure screen...");
        }
        router.replace({
          pathname: "/(app)/(screens)/payment-failure",
          params: {
            orderCode: orderCode as string,
            responseCode: vnpResponseCode || "Unknown",
            message: getErrorMessage(vnpResponseCode || ""),
          },
        });
      }
    } catch (error) {
      console.error("❌ Error handling callback:", error);
      Alert.alert("Lỗi", "Không thể xử lý kết quả thanh toán");
      router.back();
    }
  };

  // Handle navigation state changes in WebView (for tracking only)
  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    const { url } = navState;
    setCurrentUrl(url);

    if (__DEV__) {
      console.log("🔍 Navigation state changed:", url);
    }

    // Also check URL in navigation state (backup method)
    if (url.startsWith("myapp://callback") && !hasHandledCallback) {
      if (__DEV__) {
        console.log("✅ Detected callback in navigation state");
      }
      setHasHandledCallback(true);
      handleCallbackUrl(url);
    }
  };

  // Get error message based on VNPay response code
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

  const handleLoadStart = () => {
    setIsLoading(true);
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  const handleError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error("WebView error:", nativeEvent);
    Alert.alert(
      "Lỗi",
      "Không thể tải trang thanh toán. Vui lòng thử lại sau.",
      [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]
    );
  };

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

      {/* WebView */}
      <WebView
        ref={webViewRef}
        source={{ uri: paymentUrl as string }}
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
        onNavigationStateChange={handleNavigationStateChange}
        onMessage={handleMessage}
        injectedJavaScript={injectedJavaScript}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        startInLoadingState={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        sharedCookiesEnabled={true}
        thirdPartyCookiesEnabled={true}
        mixedContentMode="always"
        style={{ flex: 1 }}
      />

      {/* Debug info - Remove in production */}
      {__DEV__ && (
        <View className="absolute bottom-0 left-0 right-0 bg-black/80 p-2">
          <Text className="text-white text-xs" numberOfLines={1}>
            Current URL: {currentUrl}
          </Text>
        </View>
      )}
    </View>
  );
};

export default PaymentWebView;
