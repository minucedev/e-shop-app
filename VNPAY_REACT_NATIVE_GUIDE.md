# Kịch bản Tích hợp Thanh toán VNPay trên React Native

Tài liệu này mô tả kịch bản chi tiết cho luồng thanh toán sử dụng VNPay trong một ứng dụng React Native, tập trung vào cách xử lý chuyển hướng để quay về ứng dụng một cách liền mạch.

## Bối cảnh

*   **Ứng dụng:** React Native.
*   **Thư viện:** `react-native-webview` để hiển thị cổng thanh toán, `react-navigation` để quản lý màn hình.
*   **Màn hình hiện tại:** `CheckoutScreen`, nơi người dùng đã điền thông tin và sẵn sàng thanh toán.

---

## 1. Đầu vào (Inputs)

*   **Từ Người dùng:** Hành động nhấn vào nút "Thanh toán".
*   **Từ App (State):** Dữ liệu giỏ hàng, thông tin người dùng, địa chỉ giao hàng.
*   **Từ Backend (API):** Một JSON response chứa `paymentUrl`. `paymentUrl` này **bắt buộc** phải chứa tham số `vnp_ReturnUrl` là một deep link đã được cấu hình cho ứng dụng (ví dụ: `myapp://checkout/result`).

---

## 2. Đầu ra (Outputs)

*   **Thanh toán thành công:**
    *   Đóng màn hình WebView thanh toán.
    *   Chuyển người dùng đến màn hình `OrderSuccessScreen`.
    *   Xóa dữ liệu giỏ hàng.
*   **Thanh toán thất bại / Người dùng hủy:**
    *   Đóng màn hình WebView thanh toán.
    *   Hiển thị thông báo lỗi (sử dụng Alert hoặc Toast message).
    *   Giữ người dùng ở lại màn hình `CheckoutScreen` để thử lại.

---

## 3. Quy trình thực hiện (Step-by-Step)

#### Bước 1: Khởi tạo thanh toán (Tại `CheckoutScreen.js`)

Người dùng nhấn nút "Thanh toán", hàm `handleCheckout` được kích hoạt.

```javascript
import React, { useState } from 'react';
import { View, TouchableOpacity, Text, Modal, Alert } from 'react-native';
import api from './api'; // Giả định module gọi API
import PaymentWebView from './PaymentWebView';

const CheckoutScreen = () => {
  const [isWebViewVisible, setWebViewVisible] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');

  const handleCheckout = async () => {
    try {
      // 1. Gửi thông tin đơn hàng lên server
      const orderData = { /* Dữ liệu giỏ hàng, shipping... */ };
      const response = await api.post('/orders', orderData);

      // 2. Lấy paymentUrl từ response của server
      if (response.data && response.data.paymentUrl) {
        // 3. Lưu URL và mở WebView trong một Modal
        setPaymentUrl(response.data.paymentUrl);
        setWebViewVisible(true);
      } else {
        Alert.alert('Lỗi', 'Không thể tạo link thanh toán, vui lòng thử lại.');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Đã có lỗi xảy ra trong quá trình tạo đơn hàng.');
    }
  };

  // ...
};
```

#### Bước 2: Hiển thị WebView thanh toán

Component `CheckoutScreen` sẽ render một `Modal` chứa component `PaymentWebView` khi state `isWebViewVisible` là `true`.

```javascript
// Trong phần render của CheckoutScreen.js
return (
  <View>
    {/* ... các component khác của màn hình checkout ... */}
    <TouchableOpacity onPress={handleCheckout}>
      <Text>Thanh toán</Text>
    </TouchableOpacity>

    <Modal visible={isWebViewVisible} onRequestClose={() => setWebViewVisible(false)}>
      <PaymentWebView 
        url={paymentUrl} 
        onClose={() => setWebViewVisible(false)} 
        onPaymentComplete={handlePaymentComplete}
      />
    </Modal>
  </View>
);
```

#### Bước 3: Xử lý bên trong `PaymentWebView.js` (Phần quan trọng nhất)

Đây là component chứa logic để "lắng nghe" sự thay đổi URL và bắt sự kiện quay về.

```javascript
// PaymentWebView.js
import React from 'react';
import { WebView } from 'react-native-webview';

const PaymentWebView = ({ url, onClose, onPaymentComplete }) => {
  
  // Hàm này được gọi MỖI KHI URL trong WebView thay đổi
  const onNavigationStateChange = (navState) => {
    const { url: newUrl } = navState;
    if (!newUrl) return;

    // **ĐIỂM MẤU CHỐT: Kiểm tra xem URL có phải là deep link trả về không**
    if (newUrl.startsWith('myapp://checkout/result')) {
      // Đã quay về app!
      
      // 1. Đóng WebView ngay lập tức
      onClose();

      // 2. Phân tích URL để lấy mã kết quả
      // Ví dụ URL trả về: myapp://checkout/result?vnp_ResponseCode=00&...
      try {
        const urlParams = new URLSearchParams(newUrl.substring(newUrl.indexOf('?')));
        const responseCode = urlParams.get('vnp_ResponseCode');
        
        // 3. Gọi callback để xử lý kết quả ở màn hình Checkout
        onPaymentComplete(responseCode);
      } catch (error) {
        // Xử lý trường hợp URL không hợp lệ
        onPaymentComplete(null); // Hoặc một mã lỗi tùy chỉnh
      }
    }
  };

  return (
    <WebView
      source={{ uri: url }}
      onNavigationStateChange={onNavigationStateChange}
      startInLoadingState={true}
      // Thêm các props khác nếu cần
    />
  );
};

export default PaymentWebView;
```

#### Bước 4: Hoàn tất quy trình (Quay lại `CheckoutScreen.js`)

Hàm `handlePaymentComplete` nhận `responseCode` từ `PaymentWebView` và quyết định điều hướng tiếp theo.

```javascript
// Trong CheckoutScreen.js
const handlePaymentComplete = (responseCode) => {
  if (responseCode === '00') {
    // Thanh toán thành công!
    Alert.alert('Thành công', 'Đơn hàng của bạn đã được thanh toán.');
    // Ví dụ: Xóa giỏ hàng, sau đó điều hướng
    // clearCart(); 
    navigation.navigate('OrderSuccessScreen', { orderId: '...' });
  } else {
    // Thanh toán thất bại hoặc bị huỷ
    // Dùng responseCode để tra cứu và hiển thị thông báo lỗi chính xác
    const errorMessage = getVnpayErrorMessage(responseCode); // Hàm tự định nghĩa
    Alert.alert('Thanh toán thất bại', errorMessage);
  }
};
```

---

## 4. Cấu hình Deep Link (Bắt buộc)

Để scheme `myapp://` có thể mở được ứng dụng của bạn, nó cần được khai báo trong cấu hình native.

#### Đối với iOS:

Mở file `Info.plist` và thêm cấu hình URL Scheme.

#### Đối với Android:

Thêm một `intent-filter` vào `Activity` chính trong file `android/app/src/main/AndroidManifest.xml`.

```xml
<activity ...>
  <intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="myapp" android:host="checkout" />
  </intent-filter>
</activity>
```
*Lưu ý: Các thư viện như Expo hoặc `react-navigation` có thể cung cấp các công cụ hoặc file cấu hình (`app.json`) để đơn giản hóa quá trình này.*

---

**Kết luận:** Luồng hoạt động dựa trên việc "bẫy" URL trả về của VNPay bên trong `WebView` bằng prop `onNavigationStateChange`. Ngay khi phát hiện URL khớp với deep link đã định sẵn, ứng dụng sẽ chủ động đóng `WebView` và xử lý kết quả, tạo ra một trải nghiệm người dùng liền mạch và chuyên nghiệp.
