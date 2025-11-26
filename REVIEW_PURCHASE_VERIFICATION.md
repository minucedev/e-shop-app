# 📝 Review Purchase Verification Implementation

## 🎯 Mục tiêu

Chỉ cho phép user đánh giá sản phẩm nếu họ đã mua sản phẩm đó trước.

## 🔍 Phân tích API

### API được sử dụng:

1. **GET /orders** - Lấy lịch sử đơn hàng
   - Response: `OrderHistoryResponse` với array `Order[]`
   - Mỗi Order có: `orderItems[]` chứa `productVariationId`
2. **Review APIs:**
   - `POST /products/{id}/reviews` - Tạo review
   - `GET /products/{id}/reviews/me` - Lấy review của user

### Không cần API mới:

✅ Sử dụng API có sẵn để check purchase history
✅ Không cần backend thêm endpoint `/products/{id}/can-review`

## 🛠️ Implementation

### 1. Client-side Validation

**File:** `app/(app)/(screens)/product-detail.tsx`

**States thêm:**

```typescript
const [hasPurchased, setHasPurchased] = useState(false);
const [isCheckingPurchase, setIsCheckingPurchase] = useState(true);
```

**Logic:**

```typescript
const checkPurchaseHistory = async () => {
  // Get order history (first 100 orders)
  const response = await orderApi.getOrderHistory(0, 100);

  // Get all variation IDs from current product
  const productVariationIds = product.variations?.map((v) => v.id) || [];

  // Check if any COMPLETED/DELIVERED order contains this product
  const purchased = orders.some((order) => {
    const validStatuses = ["COMPLETED", "DELIVERED", "SUCCESS"];
    if (!validStatuses.includes(order.status)) return false;

    return order.orderItems.some((item) =>
      productVariationIds.includes(item.productVariationId)
    );
  });

  setHasPurchased(purchased);
};
```

### 2. UI States

**A. Checking (Loading):**

```
┌─────────────────────────────────────┐
│ 🔄 Đang kiểm tra lịch sử mua hàng... │
└─────────────────────────────────────┘
```

**B. Can Review (Purchased):**

```
┌─────────────────────────────────────┐
│ ⭐ Viết đánh giá cho sản phẩm này    │
└─────────────────────────────────────┘
```

**C. Cannot Review (Not Purchased):**

```
┌─────────────────────────────────────┐
│ 🔒 Chưa thể đánh giá                 │
│                                      │
│ Bạn cần mua sản phẩm này trước khi   │
│ có thể viết đánh giá.                │
└─────────────────────────────────────┘
```

### 3. Validation Layers

**Layer 1: UI Prevention**

- Hide review button if `!hasPurchased`
- Show locked message instead

**Layer 2: Function Check**

```typescript
const handleCreateReview = async (rating: number, content: string) => {
  // Defensive check
  if (!hasPurchased) {
    Alert.alert("Không thể đánh giá", "Bạn cần mua sản phẩm này...");
    return;
  }
  // ... create review
};
```

**Layer 3: Backend Error Handling**

```typescript
catch (error: any) {
  if (error.message?.includes("not purchased")) {
    Alert.alert("Không thể đánh giá", "Bạn chưa mua sản phẩm này");
    setHasPurchased(false); // Update state
  }
}
```

## 📊 Flow Chart

```
User vào Product Detail
    ↓
Kiểm tra: User đã login?
    ↓ Yes
Call GET /orders (0, 100)
    ↓
Lấy tất cả productVariationIds của sản phẩm hiện tại
    ↓
Lọc orders với status = COMPLETED/DELIVERED
    ↓
Check: Có order nào chứa productVariationId?
    ├─ Yes → setHasPurchased(true) → Show "Viết đánh giá"
    └─ No  → setHasPurchased(false) → Show "🔒 Chưa thể đánh giá"
```

## 🎨 UI/UX Design

### Color Scheme:

- **Can review:** Blue (`bg-blue-50`, `border-blue-200`)
- **Cannot review:** Amber (`bg-amber-50`, `border-amber-200`)
- **Loading:** Gray (`bg-gray-50`)

### Icons:

- **Can review:** `star-outline` (blue)
- **Cannot review:** `lock-closed` (amber)
- **Loading:** `ActivityIndicator`

## ✅ Testing Scenarios

### Scenario 1: User chưa mua

1. User vào product detail
2. Hiển thị "🔄 Đang kiểm tra..."
3. Sau 1-2s → Hiển thị "🔒 Chưa thể đánh giá"
4. Message: "Bạn cần mua sản phẩm này trước..."

### Scenario 2: User đã mua

1. User vào product detail
2. Hiển thị "🔄 Đang kiểm tra..."
3. Sau 1-2s → Hiển thị "⭐ Viết đánh giá"
4. Click → Mở form đánh giá

### Scenario 3: User đã review rồi

1. Hiển thị review hiện có của user
2. Có nút "Sửa" và "Xóa"
3. Không hiển thị "Viết đánh giá"

### Scenario 4: User chưa login

1. Không check purchase history
2. Không hiển thị nút đánh giá
3. Chỉ hiển thị reviews của người khác

## 🔧 Configuration

### Pagination:

- Load **first 100 orders** to check purchase
- Có thể tăng nếu user có >100 đơn hàng

### Valid Order Status:

```typescript
const validStatuses = ["COMPLETED", "DELIVERED", "SUCCESS"];
```

### Error Handling:

- Nếu API fail → Default `hasPurchased = true` (không block user)
- Log error nhưng không hiển thị cho user

## 🚀 Deployment Notes

### Backend Requirements:

- ✅ Endpoint `/orders` phải return đủ orderItems
- ✅ Mỗi orderItem phải có `productVariationId`
- ✅ Order status phải chính xác (COMPLETED/DELIVERED)

### Optional Backend Enhancement:

Nếu muốn, backend có thể thêm validation:

```java
// POST /products/{id}/reviews
if (!userHasPurchasedProduct(userId, productId)) {
    throw new ForbiddenException("You haven't purchased this product");
}
```

## 📝 Notes

1. **Performance:** Check purchase chỉ chạy 1 lần khi load product
2. **Cache:** Có thể cache purchase status để tránh re-check
3. **Scalability:** Nếu user có >100 orders, cần implement pagination check
4. **Security:** Backend vẫn nên validate, client-side chỉ là UX enhancement

## 🎯 Benefits

✅ **Better UX:** User biết ngay có thể review hay không
✅ **No Backend Change:** Dùng API có sẵn
✅ **Clear Message:** Giải thích rõ tại sao không thể review
✅ **Secure:** Multi-layer validation (UI + Function + Backend)
✅ **Scalable:** Dễ maintain và extend

---

**Created:** November 26, 2025
**Status:** ✅ Implemented
