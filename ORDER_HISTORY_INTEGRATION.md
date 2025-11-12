# Order History Integration - Tích Hợp Lịch Sử Đơn Hàng

## Tổng quan

Tài liệu này mô tả việc tích hợp API lấy lịch sử đơn hàng và thiết kế giao diện My Orders.

## API Endpoint

### Get Order History

- **Method**: GET
- **Endpoint**: `{{baseUrl}}/orders`
- **Query Parameters**:
  - `page`: Số trang (mặc định: 0)
  - `size`: Số lượng items mỗi trang (mặc định: 10)

### Response Structure

```typescript
{
  "content": Order[],
  "page": {
    "size": number,
    "number": number,
    "totalElements": number,
    "totalPages": number
  }
}
```

### Order Object

```typescript
{
  "id": number,
  "orderCode": string,
  "status": "PENDING" | "CONFIRMED" | "SHIPPING" | "DELIVERED" | "CANCELLED",
  "paymentMethod": "COD" | "VNPAY",
  "paymentStatus": "PENDING" | "PAID" | "FAILED",
  "totalAmount": number,
  "discountAmount": number,
  "shippingFee": number,
  "finalAmount": number,
  "shippingName": string,
  "shippingPhone": string,
  "shippingAddress": string,
  "shippingWard": string,
  "shippingDistrict": string,
  "shippingCity": string,
  "note": string | null,
  "paymentTransactionId": string,
  "paymentUrl": string | null,
  "createdAt": string,
  "updatedAt": string,
  "orderItems": OrderItem[]
}
```

## Files Created/Modified

### 1. services/orderApi.ts

**Mục đích**: Service để gọi API order

**Thay đổi**:

- Thêm `PageInfo` interface cho thông tin phân trang
- Thêm `OrderHistoryResponse` interface cho response
- Thêm function `getOrderHistory(page, size)` để lấy danh sách đơn hàng

```typescript
const getOrderHistory = (
  page: number = 0,
  size: number = 10
): Promise<ApiResponse<OrderHistoryResponse>> => {
  return apiClient.get<OrderHistoryResponse>(
    `/orders?page=${page}&size=${size}`
  );
};
```

### 2. contexts/OrderContext.tsx (NEW)

**Mục đích**: Context để quản lý state của orders

**Chức năng**:

- Lưu trữ danh sách orders
- Quản lý pagination (currentPage, totalPages, totalElements)
- Quản lý loading và error states
- Cung cấp `fetchOrders()` để tải danh sách orders
- Cung cấp `refreshOrders()` để refresh danh sách

**Hook**: `useOrders()`

### 3. components/OrderCard.tsx (NEW)

**Mục đích**: Component hiển thị từng order trong danh sách

**Tính năng**:

- Hiển thị mã đơn hàng (orderCode)
- Badge trạng thái đơn hàng với màu sắc
- Danh sách sản phẩm trong đơn (hiển thị tối đa 2 items)
- Thông tin thanh toán (COD/VNPay)
- Trạng thái thanh toán
- Tổng tiền
- Ngày đặt hàng
- Touch để xem chi tiết (sẽ implement sau)

**Helper functions**:

- `formatPrice()`: Format số tiền theo định dạng VND
- `formatDate()`: Format ngày giờ theo định dạng Việt Nam
- `getStatusColor()`: Lấy màu cho status badge
- `getStatusText()`: Chuyển đổi status sang tiếng Việt
- `getPaymentStatusColor()`: Lấy màu cho payment status
- `getPaymentStatusText()`: Chuyển đổi payment status sang tiếng Việt

### 4. app/(app)/(screens)/my-orders.tsx (NEW)

**Mục đích**: Màn hình chính hiển thị danh sách đơn hàng

**Tính năng**:

- Hiển thị tổng số đơn hàng
- Filter tabs theo trạng thái:
  - Tất cả
  - Chờ xác nhận (PENDING)
  - Đã xác nhận (CONFIRMED)
  - Đang giao (SHIPPING)
  - Đã giao (DELIVERED)
  - Đã hủy (CANCELLED)
- Pull to refresh
- Infinite scroll (load more khi scroll đến cuối)
- Empty state khi chưa có đơn hàng
- Error state với nút retry
- Loading indicator

**Layout**:

- Header với title "Đơn hàng của tôi"
- Order count banner
- Filter tabs (horizontal scroll)
- Order list (FlatList)

### 5. app/(app)/(tabs)/profile.tsx

**Thay đổi**: Cập nhật nút "My Order" để navigate đến màn hình my-orders

```typescript
<OptionItem
  iconName="reader-outline"
  title="My Order"
  onPress={() => router.push("/(app)/(screens)/my-orders")}
/>
```

## Order Status Mapping

| Status    | Tiếng Việt   | Màu    |
| --------- | ------------ | ------ |
| PENDING   | Chờ xác nhận | Yellow |
| CONFIRMED | Đã xác nhận  | Blue   |
| SHIPPING  | Đang giao    | Purple |
| DELIVERED | Đã giao      | Green  |
| CANCELLED | Đã hủy       | Red    |

## Payment Status Mapping

| Status  | Tiếng Việt          | Màu    |
| ------- | ------------------- | ------ |
| PENDING | Chưa thanh toán     | Orange |
| PAID    | Đã thanh toán       | Green  |
| FAILED  | Thanh toán thất bại | Red    |

## Payment Method

- **COD**: Cash on Delivery (Thanh toán khi nhận hàng)
- **VNPAY**: VNPay (Cổng thanh toán điện tử)

## Cách sử dụng

### 1. Xem danh sách đơn hàng

```typescript
// Từ Profile screen, click vào "My Order"
router.push("/(app)/(screens)/my-orders");
```

### 2. Filter theo trạng thái

Người dùng có thể tap vào các filter tabs để lọc đơn hàng theo trạng thái

### 3. Refresh danh sách

Pull down từ đầu danh sách để refresh

### 4. Load thêm orders

Scroll đến cuối danh sách để tự động load thêm (nếu còn trang tiếp theo)

## TODO - Những việc cần làm tiếp

1. **Order Detail Screen**: Tạo màn hình chi tiết đơn hàng khi click vào OrderCard
2. **Order Tracking**: Thêm tính năng theo dõi đơn hàng
3. **Order Cancellation**: Cho phép hủy đơn hàng với status PENDING
4. **Reorder**: Cho phép đặt lại đơn hàng
5. **Filter by Date Range**: Thêm filter theo khoảng thời gian
6. **Search Orders**: Thêm tính năng tìm kiếm đơn hàng

## Dependencies

- `expo-router`: Navigation
- `react-native-safe-area-context`: SafeAreaView
- `@expo/vector-icons`: Icons
- TailwindCSS (NativeWind): Styling

## Testing Notes

Để test chức năng này:

1. Đảm bảo đã đăng nhập
2. Navigate đến Profile tab
3. Click vào "My Order"
4. Kiểm tra hiển thị danh sách orders
5. Test filter tabs
6. Test pull to refresh
7. Test infinite scroll (nếu có nhiều orders)

## Integration Notes

- API sử dụng authentication token từ AuthContext
- Pagination được handle tự động bởi OrderContext
- Error handling đã được implement với UI feedback
- Loading states được handle cho cả initial load và load more
