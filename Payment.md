# Tích hợp thanh toán VNPay Sandbox vào App React Native

## 1. Bối cảnh (Context)

- **Công nghệ:** Ứng dụng di động (Mobile App) được xây dựng bằng **React Native**.
- **Hệ thống:** Có một **Backend Server** (đã tồn tại) xử lý logic nghiệp vụ, tạo đơn hàng và gọi API của VNPay.
- **Cổng thanh toán:** Sử dụng **VNPay Sandbox** cho môi trường thử nghiệm.
- **Thư viện:** Sử dụng `react-native-webview` để hiển thị cổng thanh toán.

## 2. Mục tiêu (Goal)

Tích hợp luồng thanh toán VNPay vào ứng dụng React Native. Luồng này cho phép người dùng thanh toán bên trong ứng dụng (thông qua `WebView`). Sau khi thanh toán xong (thành công hoặc thất bại), ứng dụng phải tự động bắt được kết quả và điều hướng người dùng về màn hình tương ứng.

## 3. Mô tả API (Từ App đến Backend)

Để bắt đầu quá trình thanh toán, App React Native sẽ gọi một API trên Backend Server.

- **Method:** `POST`
- **Endpoint:** `{{baseUrl}}/orders`

---

### 3.1. Request Body (App gửi lên)

Đây là JSON mà app gửi lên server. Trường quan trọng nhất mà app mobile gửi lên là `returnUrl` được thiết lập thành một **Deep Link (URL Scheme)**.

````json
{
  "orderItems": [
    {
      "productVariationId": 1,
      "quantity": 2
    }
  ],
  "shippingInfo": {
    "shippingName": "Nguyễn Văn B",
    "shippingPhone": "0987654321",
    "shippingEmail": "nguyenvana@email.com",
    "shippingAddress": "123 Đường ABC",
    "shippingWard": "Phường 1",
    "shippingDistrict": "Quận 1",
    "shippingCity": "TP.HCM",
    "shippingPostalCode": "70000",
    "shippingCountry": "Vietnam",
    "shippingMethod": "STANDARD",
    "deliveryInstructions": "Gọi trước khi giao hàng"
  },
  "paymentInfo": {
    "paymentMethod": "VNPAY"
  },
  "note": "Đơn hàng test",
  "voucherCode": "NEWUSER15",
  "returnUrl": "myapp://callback"
}

3.2. Response Body (Server trả về)
Server xử lý, gọi VNPay và trả về kết quả cho app. Trường quan trọng nhất app cần lấy là paymentUrl.

Lưu ý: paymentUrl trả về chứa tham số vnp_ReturnUrl đã được mã hóa, tương ứng với myapp://callback mà app đã gửi lên (myapp%3A%2F%2Fcallback).

```json

{
    "id": 14,
    "orderCode": "ORD4961349B55A150",
    "status": "PENDING",
    "paymentMethod": "VNPAY",
    "paymentStatus": "PENDING",
    "totalAmount": 59980000.00,
    "discountAmount": 14095300.0000,
    "shippingFee": 30000,
    "finalAmount": 45914700.0000,
    "shippingName": "Nguyễn Văn B",
    "shippingPhone": "0987654321",
    "shippingAddress": "123 Đường ABC",
    "shippingWard": "Phường 1",
    "shippingDistrict": "Quận 1",
    "shippingCity": "TP.HCM",
    "note": "Đơn hàng test",
    "paymentTransactionId": "VNPAY_53E7E374C2AC",
    "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=4591470000&vnp_Command=pay&vnp_CreateDate=20251112205136&vnp_CurrCode=VND&vnp_ExpireDate=20251112210636&vnp_IpAddr=0.0.0.0&vnp_Locale=vn&vnp_OrderInfo=Payment+for+Order+14&vnp_OrderType=other&vnp_ReturnUrl=myapp%3A%2F%2Fcallback&vnp_TmnCode=ZT7O570P&vnp_TxnRef=53E7E374C2AC&vnp_Version=2.1.0&vnp_SecureHash=c4b9354f28c791eabf3abf79516089da0666899a58d9b805e7a5112ad2e17b0c4b9383e11c62e9a7acc29e3c5869f91cb35c1c1a9babd8d5ba5a7fdeb2b1052c",
    "createdAt": "2025-11-12T13:51:36.135Z",
    "updatedAt": "2025-11-12T13:51:36.135Z",
    "orderItems": [
        {
            "id": 16,
            "productVariationId": 1,
            "productName": "iPhone 15 Pro Max",
            "productVariationName": "256GB - Titan Tự Nhiên",
            "quantity": 2,
            "unitPrice": 29990000.00,
            "totalAmount": 53982000.00,
            "discountAmount": 5998000.00
        }
    ]
}

4. Yêu cầu kỹ thuật (Prerequisites)

4. Yêu cầu kỹ thuật (Prerequisites)
Để vnp_ReturnUrl=myapp://callback hoạt động, ứng dụng React Native bắt buộc phải được cấu hình Deep Linking (URL Scheme).

Scheme: myapp

Host (cho Android): callback

Cấu hình này cần được thực hiện trong app.json (Expo) hoặc AndroidManifest.xml (Android) và Info.plist (iOS) (React Native CLI).

5. Luồng thực hiện chi tiết (Step-by-Step Flow)
BƯỚC 1: Gọi API tạo đơn hàng

Người dùng nhấn nút "Thanh toán".

App React Native gọi POST {{baseUrl}}/orders với returnUrl: "myapp://callback".

BƯỚC 2: Nhận paymentUrl

Backend Server nhận request, tạo đơn hàng, gọi VNPay Sandbox với vnp_ReturnUrl là myapp://callback.

Backend trả về response chứa paymentUrl.

BƯỚC 3: Mở WebView

App điều hướng người dùng đến màn hình PaymentScreen.

Màn hình này chứa component WebView (từ react-native-webview) với 2 props quan trọng:

source={{ uri: paymentUrl }} (sử dụng paymentUrl từ Bước 2).

onNavigationStateChange={handleNavigationStateChange} (hàm theo dõi thay đổi URL).

BƯỚC 4: Người dùng thanh toán

Người dùng thấy giao diện VNPay (chọn ngân hàng, nhập thẻ, nhập OTP...) bên trong WebView.

BƯỚC 5: Xử lý chuyển hướng (Redirect)

Sau khi nhấn "Thanh toán", VNPay Sandbox redirect WebView đến vnp_ReturnUrl đã đăng ký.

URL WebView bị chuyển hướng đến sẽ có dạng: myapp://callback?vnp_Amount=...&vnp_BankCode=...&vnp_ResponseCode=00...

BƯỚC 6: Bắt (Catch) Deep Link trong WebView

Hàm handleNavigationStateChange (từ Bước 3) được kích hoạt.

Hàm này kiểm tra navState.url. Nếu url.startsWith('myapp://callback'), nó sẽ:

Phân tích URL: Tách chuỗi query (sau dấu ?) để lấy vnp_ResponseCode.

Đóng WebView: navigation.goBack().

Điều hướng: Dựa vào vnp_ResponseCode (00 là thành công), điều hướng người dùng đến màn hình PaymentSuccess hoặc PaymentFailure trong app.

BƯỚC 7: Hoàn tất

Người dùng thấy màn hình "Thành công" hoặc "Thất bại" trong app. Luồng thanh toán kết thúc.


````
