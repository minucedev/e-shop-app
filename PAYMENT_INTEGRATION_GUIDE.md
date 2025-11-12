# Hướng Dẫn Tích Hợp Thanh Toán (COD & VNPay)

## Tổng Quan

Ứng dụng e-shop đã được tích hợp 2 phương thức thanh toán:

1. **COD (Cash on Delivery)** - Thanh toán khi nhận hàng
2. **VNPay** - Thanh toán qua cổng VNPay Sandbox

## Cấu Trúc Files

### 📁 Screens Mới

```
app/(app)/(screens)/
├── cart-purchase.tsx          # Màn hình checkout (đã cập nhật)
├── payment-webview.tsx        # WebView hiển thị VNPay
├── payment-success.tsx        # Kết quả thanh toán thành công
└── payment-failure.tsx        # Kết quả thanh toán thất bại
```

### 📁 Services

```
services/
└── orderApi.ts                # API service cho orders (đã có sẵn)
```

### 📁 Configuration

```
app.json                       # Deep linking config (scheme: myapp)
```

## Chi Tiết Implementation

### 1. API Structure

#### Request Body (Giống nhau cho cả COD và VNPay):

```typescript
{
  "orderItems": [
    {
      "productVariationId": 1,
      "quantity": 2
    }
  ],
  "shippingInfo": {
    "shippingName": "Nguyễn Văn A",
    "shippingPhone": "0987654321",
    "shippingEmail": "user@email.com",
    "shippingAddress": "123 Đường ABC",
    "shippingWard": "Phường 1",
    "shippingDistrict": "Quận 1",
    "shippingCity": "TP.HCM",
    "shippingPostalCode": "70000",
    "shippingCountry": "Vietnam",
    "shippingMethod": "STANDARD",      // ✅ Luôn là STANDARD
    "deliveryInstructions": "Gọi trước khi giao hàng"
  },
  "paymentInfo": {
    "paymentMethod": "COD" | "VNPAY"   // ✅ Khác nhau ở đây
  },
  "note": "Đơn hàng từ ứng dụng mobile",
  "returnUrl": "myapp://callback"      // ✅ Deep link callback
}
```

#### Response COD:

```typescript
{
  "id": 18,
  "orderCode": "ORD950492B1810485",
  "paymentMethod": "COD",
  "paymentStatus": "PENDING",
  "paymentUrl": null,                  // ✅ NULL cho COD
  "shippingFee": 30000,                // ✅ Cố định 30,000 VND
  // ... other fields
}
```

#### Response VNPay:

```typescript
{
  "id": 14,
  "orderCode": "ORD4961349B55A150",
  "paymentMethod": "VNPAY",
  "paymentStatus": "PENDING",
  "paymentUrl": "https://sandbox.vnpayment.vn/...",  // ✅ URL để mở WebView
  "shippingFee": 30000,
  // ... other fields
}
```

### 2. Luồng Thanh Toán COD

```
┌─────────────────┐
│  Cart Purchase  │
│   (Chọn COD)    │
└────────┬────────┘
         │ handlePlaceOrder()
         ▼
┌─────────────────┐
│  API: POST      │
│  /orders        │
│  method: COD    │
└────────┬────────┘
         │ success
         ▼
┌─────────────────┐
│  Alert Dialog   │
│  "Đặt hàng OK"  │
│  2 options:     │
│  - Xem đơn      │
│  - Tiếp tục     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Clear Cart +   │
│  Navigate       │
└─────────────────┘
```

### 3. Luồng Thanh Toán VNPay

```
┌─────────────────┐
│  Cart Purchase  │
│  (Chọn VNPay)   │
└────────┬────────┘
         │ handlePlaceOrder()
         ▼
┌─────────────────┐
│  API: POST      │
│  /orders        │
│  method: VNPAY  │
└────────┬────────┘
         │ success + paymentUrl
         ▼
┌─────────────────┐
│ PaymentWebView  │
│   (WebView)     │
│ Load paymentUrl │
└────────┬────────┘
         │
         ├─── User nhập thông tin thẻ
         │    User xác nhận OTP
         │
         ▼
┌─────────────────┐
│  VNPay Redirect │
│  myapp://       │
│  callback?...   │
└────────┬────────┘
         │
         ├─── vnp_ResponseCode = "00" (Success)
         │         │
         │         ▼
         │    ┌──────────────────┐
         │    │ Payment Success  │
         │    │ - Clear Cart     │
         │    │ - Refresh Orders │
         │    └──────────────────┘
         │
         └─── vnp_ResponseCode ≠ "00" (Failure)
                   │
                   ▼
              ┌──────────────────┐
              │ Payment Failure  │
              │ - Show Error     │
              │ - Allow Retry    │
              └──────────────────┘
```

### 4. Deep Linking Configuration

#### app.json:

```json
{
  "expo": {
    "scheme": "myapp"
    // ... other configs
  }
}
```

#### Callback URL Format:

```
myapp://callback?vnp_Amount=4591470000&vnp_ResponseCode=00&vnp_TransactionNo=14567890&...
```

#### Response Codes:

| Code | Meaning                                |
| ---- | -------------------------------------- |
| `00` | Giao dịch thành công                   |
| `07` | Trừ tiền thành công, nghi ngờ gian lận |
| `09` | Thẻ chưa đăng ký Internet Banking      |
| `10` | Xác thực sai quá 3 lần                 |
| `11` | Hết hạn chờ thanh toán                 |
| `12` | Thẻ bị khóa                            |
| `13` | Sai OTP                                |
| `24` | Khách hàng hủy giao dịch               |
| `51` | Tài khoản không đủ số dư               |
| `65` | Vượt quá hạn mức                       |
| `75` | Ngân hàng bảo trì                      |
| `99` | Lỗi khác                               |

### 5. Code Implementation

#### cart-purchase.tsx - handlePlaceOrder():

```typescript
const handlePlaceOrder = async () => {
  // 1. Validate user & address
  if (!user || !defaultAddress) {
    Alert.alert("Error", "Missing information");
    return;
  }

  // 2. Prepare payload
  const payload: CreateOrderPayload = {
    orderItems: [...],
    shippingInfo: {
      shippingMethod: "STANDARD",  // ✅ Always STANDARD
      // ... other shipping info
    },
    paymentInfo: {
      paymentMethod: selectedPaymentMethod,  // "COD" or "VNPAY"
    },
    returnUrl: "myapp://callback",
  };

  // 3. Call API
  const response = await orderApi.createOrder(payload);

  // 4. Handle based on payment method
  if (selectedPaymentMethod === "COD") {
    // Show success alert
    Alert.alert("Đặt hàng thành công!", ...);
    clearCart();
    router.replace("/my-orders");
  } else if (selectedPaymentMethod === "VNPAY") {
    // Navigate to WebView
    router.push({
      pathname: "/payment-webview",
      params: {
        paymentUrl: response.data.paymentUrl,
        orderCode: response.data.orderCode,
      },
    });
  }
};
```

#### payment-webview.tsx - handleNavigationStateChange():

```typescript
const handleNavigationStateChange = (navState: WebViewNavigation) => {
  const { url } = navState;

  // Detect deep link callback
  if (url.startsWith("myapp://callback")) {
    // Parse URL parameters
    const urlObj = new URL(url.replace("myapp://", "https://dummy/"));
    const params = urlObj.searchParams;
    const vnpResponseCode = params.get("vnp_ResponseCode");

    // Stop WebView loading
    webViewRef.current?.stopLoading();

    // Navigate based on result
    if (vnpResponseCode === "00") {
      router.replace("/payment-success", { orderCode, ... });
    } else {
      router.replace("/payment-failure", { orderCode, ... });
    }

    return false;  // Prevent WebView navigation
  }

  return true;
};
```

#### payment-success.tsx:

```typescript
useEffect(() => {
  // Clear cart after successful payment
  clearCart();
  // Refresh orders to show new order
  loadAllOrders();
}, []);
```

### 6. UI Components

#### Payment Method Selection:

```tsx
<TouchableOpacity
  onPress={() => setSelectedPaymentMethod("COD")}
  className={selectedPaymentMethod === "COD" ? "border-2 border-black" : "border"}
>
  <Ionicons name="checkmark-circle" />
  <Text>Cash on Delivery (COD)</Text>
</TouchableOpacity>

<TouchableOpacity
  onPress={() => setSelectedPaymentMethod("VNPAY")}
  className={selectedPaymentMethod === "VNPAY" ? "border-2 border-black" : "border"}
>
  <Ionicons name="checkmark-circle" />
  <Text>VNPay</Text>
</TouchableOpacity>
```

#### WebView Component:

```tsx
<WebView
  ref={webViewRef}
  source={{ uri: paymentUrl }}
  onNavigationStateChange={handleNavigationStateChange}
  javaScriptEnabled={true}
  domStorageEnabled={true}
  sharedCookiesEnabled={true}
/>
```

### 7. Important Constants

```typescript
// Shipping
const SHIPPING_METHOD = "STANDARD"; // ✅ Always STANDARD
const SHIPPING_FEE = 30000; // ✅ Fixed 30,000 VND

// Deep Link
const DEEP_LINK_SCHEME = "myapp";
const CALLBACK_URL = "myapp://callback";

// VNPay Success Code
const VNPAY_SUCCESS_CODE = "00";
```

### 8. Testing Guide

#### Test COD:

1. Thêm sản phẩm vào giỏ hàng
2. Vào Cart → Checkout
3. Chọn payment method: **COD**
4. Click "Place Order"
5. ✅ Expect: Alert "Đặt hàng thành công"
6. ✅ Expect: Cart cleared
7. ✅ Expect: Order hiển thị trong My Orders

#### Test VNPay (Sandbox):

1. Thêm sản phẩm vào giỏ hàng
2. Vào Cart → Checkout
3. Chọn payment method: **VNPay**
4. Click "Place Order"
5. ✅ Expect: WebView mở VNPay Sandbox
6. Chọn ngân hàng: **NCB**
7. Nhập thông tin test:
   - Số thẻ: `9704198526191432198`
   - Tên: `NGUYEN VAN A`
   - Ngày phát hành: `07/15`
   - OTP: `123456`
8. ✅ Expect: Redirect về app
9. ✅ Expect: Payment Success screen
10. ✅ Expect: Cart cleared
11. ✅ Expect: Order hiển thị trong My Orders

#### Test VNPay Cancel:

1. Làm theo bước 1-6 như trên
2. Click nút "Hủy giao dịch" trong VNPay
3. ✅ Expect: Payment Failure screen
4. ✅ Expect: Hiển thị error code 24
5. ✅ Expect: Cart vẫn còn
6. Click "Thử lại"
7. ✅ Expect: Quay lại cart-purchase

### 9. Error Handling

#### Network Errors:

```typescript
try {
  const response = await orderApi.createOrder(payload);
} catch (error) {
  Alert.alert("Error", "Network error. Please try again.");
}
```

#### WebView Errors:

```typescript
const handleError = (syntheticEvent: any) => {
  Alert.alert("Lỗi", "Không thể tải trang thanh toán", [
    { text: "OK", onPress: () => router.back() },
  ]);
};
```

#### Invalid Payment URL:

```typescript
if (!paymentUrl) {
  return (
    <View>
      <Text>URL thanh toán không hợp lệ</Text>
      <Button onPress={() => router.back()}>Quay lại</Button>
    </View>
  );
}
```

### 10. Security Notes

⚠️ **Production Checklist:**

- [ ] Remove `__DEV__` debug info in WebView
- [ ] Validate `vnp_SecureHash` on server
- [ ] Use HTTPS for all API calls
- [ ] Implement request timeouts
- [ ] Add rate limiting
- [ ] Log all transactions
- [ ] Handle edge cases (network timeout, app backgrounded, etc.)

### 11. Known Limitations

1. **Voucher Code**: Hiện tại không có UI để nhập voucher, hardcoded trong code
2. **Order Note**: Không có UI để nhập note, hardcoded "Đơn hàng từ ứng dụng mobile"
3. **Shipping Fee**: Cố định 30,000 VND, chưa tính theo khoảng cách
4. **Product Variations**: Cart context chưa support variations, dùng `productId` tạm thời

### 12. Future Improvements

- [ ] Add voucher input field
- [ ] Add order note textarea
- [ ] Calculate shipping fee based on location
- [ ] Support product variations properly
- [ ] Add loading skeleton in WebView
- [ ] Add transaction history in profile
- [ ] Implement refund flow
- [ ] Add order tracking
- [ ] Support multiple addresses selection
- [ ] Add payment method cards (save card info)

## Troubleshooting

### Issue: WebView không redirect về app

**Solution**: Kiểm tra deep link config trong `app.json` và rebuild app

### Issue: VNPay luôn báo lỗi

**Solution**: Kiểm tra `vnp_SecureHash` từ server, đảm bảo server config đúng

### Issue: Cart không clear sau thanh toán

**Solution**: Kiểm tra `clearCart()` được gọi trong `payment-success.tsx`

### Issue: Orders không hiển thị sau thanh toán

**Solution**: Đảm bảo `loadAllOrders()` được gọi trong `useEffect` của payment-success

## Kết Luận

✅ Đã tích hợp thành công 2 phương thức thanh toán
✅ COD flow hoạt động smooth
✅ VNPay flow với WebView và deep linking
✅ Error handling đầy đủ
✅ UI/UX consistent với app hiện tại

Ứng dụng đã sẵn sàng cho testing và demo! 🎉
