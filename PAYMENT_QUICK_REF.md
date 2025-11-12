# Payment Integration - Quick Reference

## 🎯 Tóm Tắt Nhanh

### Files Đã Tạo/Sửa:

```
✅ app/(app)/(screens)/payment-webview.tsx    (NEW)
✅ app/(app)/(screens)/payment-success.tsx    (NEW)
✅ app/(app)/(screens)/payment-failure.tsx    (NEW)
✅ app/(app)/(screens)/cart-purchase.tsx      (UPDATED)
✅ PAYMENT_INTEGRATION_GUIDE.md               (NEW - Chi tiết)
```

### Dependencies:

```bash
npm install react-native-webview  # ✅ Đã cài
```

### Deep Linking:

```json
// app.json
"scheme": "myapp"  // ✅ Đã có sẵn
```

## 🔄 Luồng Thanh Toán

### COD Flow:

```
Cart → Chọn COD → Place Order → API → Alert Success → Clear Cart → My Orders
```

### VNPay Flow:

```
Cart → Chọn VNPay → Place Order → API → WebView
  → User nhập thẻ → VNPay redirect → myapp://callback
  → Parse response → Success/Failure screen → Clear Cart → My Orders
```

## 📝 API Request

```typescript
POST {{baseUrl}}/orders
{
  "orderItems": [{ "productVariationId": 1, "quantity": 2 }],
  "shippingInfo": {
    "shippingMethod": "STANDARD",  // ✅ LUÔN LÀ STANDARD
    // ... địa chỉ user
  },
  "paymentInfo": {
    "paymentMethod": "COD" | "VNPAY"  // ✅ Chọn 1 trong 2
  },
  "returnUrl": "myapp://callback"  // ✅ Deep link
}
```

## 🧪 Test VNPay Sandbox

### Thẻ Test NCB:

- Số thẻ: `9704198526191432198`
- Tên: `NGUYEN VAN A`
- Ngày: `07/15`
- OTP: `123456`

### Response Codes:

- `00` = Thành công ✅
- `24` = User hủy ❌
- `51` = Không đủ tiền ❌

## 🎨 Màn Hình

### payment-webview.tsx

- Hiển thị VNPay trong WebView
- Bắt `myapp://callback` redirect
- Parse `vnp_ResponseCode`
- Navigate đến success/failure

### payment-success.tsx

- Hiển thị thông tin giao dịch
- Clear cart
- Refresh orders
- 2 buttons: Xem đơn / Tiếp tục mua

### payment-failure.tsx

- Hiển thị lỗi chi tiết
- 3 buttons: Thử lại / Xem đơn / Về shop

## 🔧 Constants Quan Trọng

```typescript
SHIPPING_METHOD = "STANDARD"; // Luôn luôn
SHIPPING_FEE = 30000; // Cố định 30k VND
CALLBACK_URL = "myapp://callback";
SUCCESS_CODE = "00";
```

## ⚠️ Lưu Ý

1. **shippingMethod** luôn là `"STANDARD"` (không phải `"EXPRESS"`)
2. **shippingFee** cố định `30000` VND
3. **returnUrl** phải là `"myapp://callback"` để deep link hoạt động
4. COD → `paymentUrl = null`
5. VNPay → `paymentUrl = "https://sandbox.vnpayment.vn/..."`

## 🐛 Debug

### WebView không redirect:

→ Check `app.json` scheme
→ Rebuild app: `npx expo run:android`

### Cart không clear:

→ Check `clearCart()` trong payment-success

### Orders không hiển thị:

→ Check `loadAllOrders()` trong payment-success

## 📱 Test Checklist

- [ ] COD: Đặt hàng thành công
- [ ] COD: Cart cleared
- [ ] COD: Order hiển thị
- [ ] VNPay: WebView mở đúng
- [ ] VNPay: Thanh toán thành công
- [ ] VNPay: Hủy giao dịch
- [ ] VNPay: Cart cleared khi success
- [ ] VNPay: Orders refresh khi success

## 🚀 Ready to Test!

Ứng dụng đã sẵn sàng để test cả 2 phương thức thanh toán.
Xem chi tiết trong `PAYMENT_INTEGRATION_GUIDE.md`.
