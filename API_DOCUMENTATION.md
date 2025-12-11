# API Documentation - E-Shop Mobile App

Tài liệu hướng dẫn sử dụng các API trong ứng dụng E-Shop React Native.

## Mục lục

- [Cấu hình API](#cấu-hình-api)
- [Authentication API](#authentication-api)
- [Product API](#product-api)
- [Cart API](#cart-api)
- [Order API](#order-api)
- [Review API](#review-api)
- [Wishlist API](#wishlist-api)
- [Category & Brand API](#category--brand-api)
- [Campaign & Voucher API](#campaign--voucher-api)
- [AI Services API](#ai-services-api)
- [Address API](#address-api)
- [Error Handling](#error-handling)

---

## Cấu hình API

### Base URLs

Ứng dụng sử dụng 2 server riêng biệt:

#### Backend API (Port 8081)
```typescript
// services/apiClient.ts

// Tự động phát hiện IP dựa trên môi trường
const API_BASE_URL = getApiBaseUrl();

// Android Emulator: http://10.0.2.2:8081/api
// iOS Simulator: http://localhost:8081/api
// Physical Device: http://<YOUR_LOCAL_IP>:8081/api
```

#### AI Services API (Port 8005)
```typescript
const AI_API_BASE_URL = getAiApiBaseUrl();

// Android Emulator: http://10.0.2.2:8005
// iOS Simulator: http://localhost:8005
// Physical Device: http://<YOUR_LOCAL_IP>:8005
```

### API Client

**File:** `services/apiClient.ts`

**Tính năng:**
- Tự động thêm Bearer token vào headers
- Auto-refresh token khi hết hạn
- Retry logic cho các request thất bại
- Logging đầy đủ cho debugging

**Cách sử dụng:**

```typescript
import { apiClient, aiApiClient } from "@/services/apiClient";

// Backend API request
const response = await apiClient.get("/products");

// AI Service request
const aiResponse = await aiApiClient.post("/chat", { question: "..." });
```

**HTTP Methods:**
- `apiClient.get<T>(url, params?)`
- `apiClient.post<T>(url, data, params?)`
- `apiClient.put<T>(url, data)`
- `apiClient.patch<T>(url, data)`
- `apiClient.delete<T>(url)`

**Response Format:**
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
```

---

## Authentication API

**File:** `services/authApi.ts`

### 1. Đăng nhập (Login)

**Endpoint:** `POST /auth/login`

**Request:**
```typescript
interface LoginRequest {
  email: string;
  password: string;
}
```

**Response:**
```typescript
interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number; // seconds
}
```

**Cách sử dụng:**
```typescript
import { login } from "@/services/authApi";

const response = await authApi.login({
  email: "user@example.com",
  password: "password123"
});

if (response.success) {
  const { accessToken, refreshToken } = response.data;
  // Store tokens
}
```

### 2. Đăng ký (Register)

**Endpoint:** `POST /auth/register`

**Request:**
```typescript
interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  dateOfBirth?: string;
  phone?: string;
  roleNames?: string[];
}
```

**Response:**
```typescript
interface RegisterResponse {
  user: User;
  tokens: AuthTokens;
}
```

**Cách sử dụng:**
```typescript
const response = await authApi.register({
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  password: "password123",
  phone: "0901234567"
});
```

### 3. Làm mới token (Refresh Token)

**Endpoint:** `POST /auth/refresh`

**Request:**
```typescript
interface RefreshTokenRequest {
  refreshToken: string;
}
```

**Response:**
```typescript
interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}
```

> **Note:** Auto-refresh được xử lý tự động bởi `apiClient`, không cần gọi thủ công.

### 4. Lấy thông tin Profile

**Endpoint:** `GET /users/profile`

**Response:**
```typescript
interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  addresses: Address[];
  dateOfBirth: string | null;
  roles: string[];
  isActive: boolean;
  createdAt: string;
}
```

**Cách sử dụng:**
```typescript
const response = await authApi.getProfile();
if (response.success) {
  const user = response.data;
}
```

### 5. Cập nhật Profile

**Endpoint:** `PATCH /users/{userId}`

**Request:**
```typescript
interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  phone?: string;
}
```

**Cách sử dụng:**
```typescript
await authApi.updateProfile(userId, {
  firstName: "Jane",
  phone: "0912345678"
});
```

### 6. Đổi mật khẩu

**Endpoint:** `PUT /auth/change-password`

**Request:**
```typescript
interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
```

**Cách sử dụng:**
```typescript
await authApi.changePassword({
  currentPassword: "oldpass123",
  newPassword: "newpass456"
});
```

---

## Product API

**File:** `services/productApi.ts`

### 1. Lấy danh sách sản phẩm (Get Products)

**Endpoint:** `GET /products`

**Query Parameters:**
```typescript
interface GetProductsParams {
  // Pagination
  page?: number;          // Default: 0
  size?: number;          // Default: 20
  
  // Sorting
  sortBy?: string;        // Default: "id"
  sortDirection?: "ASC" | "DESC";  // Default: "ASC"
  
  // Filters
  name?: string;          // Tìm kiếm theo tên
  brandId?: number;       // Lọc theo thương hiệu
  categoryId?: number;    // Lọc theo danh mục
  minPrice?: number;      // Giá tối thiểu
  maxPrice?: number;      // Giá tối đa
  minRating?: number;     // Đánh giá tối thiểu (0-5)
  campaignId?: number;    // Lọc theo chiến dịch
  attributes?: string[];  // Lọc theo thuộc tính ["RAM:8GB", "Color:Black"]
}
```

**Response:**
```typescript
interface ProductsPageResponse {
  content: ProductApiResponse[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

interface ProductApiResponse {
  id: number;
  name: string;
  imageUrl: string | null;
  warrantyMonths: number | null;
  displayOriginalPrice: number;
  displaySalePrice: number;
  discountType: "PERCENTAGE" | "FIXED" | null;
  discountValue: number | null;
  averageRating: number;
  totalRatings: number;
}
```

**Cách sử dụng:**
```typescript
import { getProducts } from "@/services/productApi";

// Lấy tất cả sản phẩm (trang 0, 20 items)
const response = await getProducts();

// Lọc theo danh mục và giá
const filtered = await getProducts({
  categoryId: 5,
  minPrice: 10000000,
  maxPrice: 20000000,
  page: 0,
  size: 10
});

// Tìm kiếm theo tên
const searched = await getProducts({
  name: "laptop gaming",
  sortBy: "displaySalePrice",
  sortDirection: "DESC"
});

// Lọc theo thuộc tính
const advanced = await getProducts({
  brandId: 3,
  attributes: ["RAM:16GB", "Storage:512GB SSD"],
  minRating: 4.0
});
```

### 2. Lấy chi tiết sản phẩm (Get Product Detail)

**Endpoint:** `GET /products/{id}`

**Response:**
```typescript
interface ProductDetailResponse {
  id: number;
  name: string;
  description: string;
  categoryId: number;
  categoryName: string;
  brandId: number;
  brandName: string;
  imageUrl: string | null;
  warrantyMonths: number | null;
  averageRating: number;
  totalRatings: number;
  displayOriginalPrice: number;
  displaySalePrice: number;
  discountType: "PERCENTAGE" | "FIXED" | null;
  discountValue: number | null;
  attributes: ProductAttribute[];
  variations: ProductVariation[];
}

interface ProductVariation {
  id: number;
  variationName: string;
  price: number;
  availableQuantity: number;
  salePrice: number;
  discountType: "PERCENTAGE" | "FIXED" | null;
  discountValue: number | null;
  images: VariationImage[];
  attributes: ProductAttribute[];
}
```

**Cách sử dụng:**
```typescript
import { getProductDetail } from "@/services/productApi";

const product = await getProductDetail(123);

// Access variations
const firstVariation = product.variations[0];
console.log(firstVariation.variationName); // "16GB RAM / 512GB SSD"
console.log(firstVariation.availableQuantity); // 15
```

### 3. Lấy sản phẩm theo SPU codes (Batch fetch)

**Endpoint:** `GET /products/by-spus`

**Query Parameters:**
```typescript
{
  spus: string[];  // Mảng SPU codes
  size?: number;   // Default: 50
}
```

**Cách sử dụng:**
```typescript
import { getProductsBySpus } from "@/services/productApi";

// Lấy nhiều sản phẩm cùng lúc
const products = await getProductsBySpus(["LAP001", "LAP002", "PHO003"]);

// Với size limit
const limited = await getProductsBySpus(["LAP001", "LAP002"], 10);
```

**Ví dụ URL được tạo:**
```
GET /products/by-spus?spus=LAP001&spus=LAP002&spus=PHO003&size=50
```

> **Use Case:** API này được dùng để fetch sản phẩm từ AI recommendations hoặc search results.

---

## Cart API

**File:** `services/cartApi.ts`

### 1. Lấy giỏ hàng (Get Cart)

**Endpoint:** `GET /cart`

**Response:**
```typescript
interface CartResponse {
  id: number;
  userId: number;
  items: CartItemResponse[];
  totalItems: number;
  subtotal: number;
  summary: CartSummary;
  empty: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CartItemResponse {
  id: number;
  productVariationId: number;
  productName: string;
  productImage: string | null;
  variantName: string;
  quantity: number;
  originalPrice: number;
  unitPrice: number;
  totalPrice: number;
  discountType: "PERCENTAGE" | "FIXED" | null;
  discountValue: number | null;
  sku: string;
  stockQuantity: number;
  available: boolean;
}
```

**Cách sử dụng:**
```typescript
import { getCart } from "@/services/cartApi";

const cart = await getCart();
console.log(`Total items: ${cart.totalItems}`);
console.log(`Subtotal: ${cart.subtotal}`);

// Check if cart is empty
if (cart.empty) {
  console.log("Cart is empty");
}

// Iterate cart items
cart.items.forEach(item => {
  console.log(`${item.productName} (${item.variantName}) x${item.quantity}`);
});
```

### 2. Thêm vào giỏ hàng (Add to Cart)

**Endpoint:** `POST /cart/add`

**Request:**
```typescript
interface AddToCartRequest {
  productVariationId: number;
  quantity: number;
}
```

**Cách sử dụng:**
```typescript
import { addToCart } from "@/services/cartApi";

// Add 2 units of variation ID 456
const updatedCart = await addToCart(456, 2);
```

### 3. Cập nhật số lượng (Update Quantity)

**Endpoint:** `PUT /cart/items/{productVariationId}`

**Request:**
```typescript
interface UpdateCartItemRequest {
  quantity: number;
}
```

**Cách sử dụng:**
```typescript
import { updateCartItem } from "@/services/cartApi";

// Update quantity to 5
await updateCartItem(456, 5);
```

### 4. Xóa khỏi giỏ hàng (Remove Item)

**Endpoint:** `DELETE /cart/items/{productVariationId}`

**Cách sử dụng:**
```typescript
import { removeCartItem } from "@/services/cartApi";

await removeCartItem(456);
```

### 5. Xóa toàn bộ giỏ hàng (Clear Cart)

**Endpoint:** `DELETE /cart`

**Cách sử dụng:**
```typescript
import { clearCart } from "@/services/cartApi";

await clearCart();
```

### 6. Lấy số lượng items (Get Cart Count)

**Endpoint:** `GET /cart/count`

**Response:**
```typescript
interface CartCountResponse {
  totalItems: number;    // Tổng số items (bao gồm quantity)
  uniqueItems: number;   // Số loại sản phẩm khác nhau
}
```

**Cách sử dụng:**
```typescript
import { getCartCount } from "@/services/cartApi";

const count = await getCartCount();
console.log(`Cart: ${count.uniqueItems} products, ${count.totalItems} items`);
```

---

## Order API

**File:** `services/orderApi.ts`

### 1. Tạo đơn hàng (Create Order)

**Endpoint:** `POST /orders`

**Request:**
```typescript
interface CreateOrderPayload {
  orderItems: OrderItemPayload[];
  shippingInfo: ShippingInfo;
  paymentInfo: PaymentInfo;
  note?: string;
  voucherCode?: string;
  returnUrl?: string;  // For VNPay callback
}

interface OrderItemPayload {
  productVariationId: number;
  quantity: number;
}

interface ShippingInfo {
  shippingName: string;
  shippingPhone: string;
  shippingEmail: string;
  shippingAddress: string;
  shippingWard: string;
  shippingDistrict: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingCountry: string;
  shippingMethod: "STANDARD" | "EXPRESS";
  deliveryInstructions?: string;
}

interface PaymentInfo {
  paymentMethod: "COD" | "VNPAY";
}
```

**Response:**
```typescript
interface Order {
  id: number;
  orderCode: string;
  status: string;
  paymentMethod: "COD" | "VNPAY";
  paymentStatus: string;
  totalAmount: number;
  discountAmount: number;
  shippingFee: number;
  finalAmount: number;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  note: string | null;
  paymentTransactionId: string;
  paymentUrl: string | null;  // VNPay payment URL
  createdAt: string;
  orderItems: OrderItemResponse[];
}
```

**Cách sử dụng:**
```typescript
import { createOrder } from "@/services/orderApi";

const response = await createOrder({
  orderItems: [
    { productVariationId: 123, quantity: 2 },
    { productVariationId: 456, quantity: 1 }
  ],
  shippingInfo: {
    shippingName: "Nguyễn Văn A",
    shippingPhone: "0901234567",
    shippingEmail: "user@example.com",
    shippingAddress: "123 Đường ABC",
    shippingWard: "Phường 1",
    shippingDistrict: "Quận 1",
    shippingCity: "Hồ Chí Minh",
    shippingPostalCode: "700000",
    shippingCountry: "Vietnam",
    shippingMethod: "STANDARD",
    deliveryInstructions: "Gọi trước khi giao"
  },
  paymentInfo: {
    paymentMethod: "VNPAY"
  },
  voucherCode: "SUMMER2024",
  returnUrl: "myapp://payment-result"
});

if (response.success) {
  const order = response.data;
  
  // For VNPay payment
  if (order.paymentUrl) {
    // Open WebView with order.paymentUrl
    router.push(`/payment-webview?url=${encodeURIComponent(order.paymentUrl)}`);
  }
}
```

### 2. Lấy lịch sử đơn hàng (Get Order History)

**Endpoint:** `GET /orders/my-orders`

**Query Parameters:**
```typescript
{
  status?: string;    // Filter by status
  page?: number;      // Default: 0
  size?: number;      // Default: 20
  sortBy?: string;    // Default: "createdAt"
  sortDirection?: "ASC" | "DESC";  // Default: "DESC"
}
```

**Response:**
```typescript
interface OrderHistoryResponse {
  content: Order[];
  page: PageInfo;
}
```

**Cách sử dụng:**
```typescript
import { getOrderHistory } from "@/services/orderApi";

// Get all orders
const response = await getOrderHistory();

// Filter by status
const pending = await getOrderHistory({
  status: "PENDING",
  page: 0,
  size: 10
});

// Paginate
const page2 = await getOrderHistory({ page: 1, size: 20 });
```

### 3. Lấy chi tiết đơn hàng (Get Order Detail)

**Endpoint:** `GET /orders/{orderId}`

**Cách sử dụng:**
```typescript
import { getOrderById } from "@/services/orderApi";

const order = await getOrderById(123);
console.log(`Order Code: ${order.orderCode}`);
console.log(`Status: ${order.status}`);
console.log(`Total: ${order.finalAmount}`);
```

### 4. Hủy đơn hàng (Cancel Order)

**Endpoint:** `PUT /orders/{orderId}/cancel`

**Cách sử dụng:**
```typescript
import { cancelOrder } from "@/services/orderApi";

await cancelOrder(123);
```

### 5. Đếm số đơn hàng theo trạng thái (Count Orders by Status)

**Endpoint:** `GET /orders/count-by-status`

**Response:**
```typescript
interface OrderCountByStatus {
  PENDING: number;
  CONFIRMED: number;
  PROCESSING: number;
  SHIPPING: number;
  DELIVERED: number;
  CANCELLED: number;
  REFUNDED: number;
}
```

**Cách sử dụng:**
```typescript
import { getOrderCountByStatus } from "@/services/orderApi";

const counts = await getOrderCountByStatus();
console.log(`Pending: ${counts.PENDING}`);
console.log(`Shipping: ${counts.SHIPPING}`);
console.log(`Delivered: ${counts.DELIVERED}`);
```

---

## Review API

**File:** `services/reviewApi.ts`

### 1. Lấy reviews của sản phẩm (Get Product Reviews)

**Endpoint:** `GET /products/{productId}/reviews`

**Query Parameters:**
```typescript
{
  page?: number;  // Default: 0
  size?: number;  // Default: 20
}
```

**Response:**
```typescript
interface ReviewsResponse {
  content: Review[];
  page: PageInfo;
}

interface Review {
  id: number;
  productId: number;
  userId: number;
  userFullName: string;
  rating: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}
```

**Cách sử dụng:**
```typescript
import { getProductReviews } from "@/services/reviewApi";

const reviews = await getProductReviews(123, 0, 20);
reviews.content.forEach(review => {
  console.log(`${review.userFullName}: ${review.rating}⭐`);
  console.log(review.content);
});
```

### 2. Lấy review của user (Get My Review)

**Endpoint:** `GET /products/{productId}/reviews/me`

**Cách sử dụng:**
```typescript
import { getMyReview } from "@/services/reviewApi";

try {
  const myReview = await getMyReview(123);
  console.log(`My rating: ${myReview.rating}`);
} catch (error) {
  // User hasn't reviewed this product yet
}
```

### 3. Lấy tóm tắt đánh giá (Get Review Summary)

**Endpoint:** `GET /products/{productId}/reviews/summary`

**Response:**
```typescript
interface ReviewSummary {
  productId: number;
  totalReviews: number;
  averageRating: number;
  rating1Count: number;
  rating2Count: number;
  rating3Count: number;
  rating4Count: number;
  rating5Count: number;
}
```

**Cách sử dụng:**
```typescript
import { getReviewSummary } from "@/services/reviewApi";

const summary = await getReviewSummary(123);
console.log(`Average: ${summary.averageRating}⭐`);
console.log(`Total: ${summary.totalReviews} reviews`);
console.log(`5⭐: ${summary.rating5Count}`);
console.log(`4⭐: ${summary.rating4Count}`);
```

### 4. Tạo review (Create Review)

**Endpoint:** `POST /products/{productId}/reviews`

**Request:**
```typescript
interface CreateReviewRequest {
  rating: number;    // 1-5
  content: string;
}
```

**Cách sử dụng:**
```typescript
import { createReview } from "@/services/reviewApi";

const review = await createReview(123, {
  rating: 5,
  content: "Sản phẩm rất tốt, ship nhanh!"
});
```

### 5. Cập nhật review (Update Review)

**Endpoint:** `PUT /products/{productId}/reviews/{reviewId}`

**Request:**
```typescript
interface UpdateReviewRequest {
  rating: number;
  content: string;
}
```

**Cách sử dụng:**
```typescript
import { updateReview } from "@/services/reviewApi";

await updateReview(123, 456, {
  rating: 4,
  content: "Updated review content"
});
```

### 6. Xóa review (Delete Review)

**Endpoint:** `DELETE /products/{productId}/reviews/{reviewId}`

**Cách sử dụng:**
```typescript
import { deleteReview } from "@/services/reviewApi";

await deleteReview(123, 456);
```

### 7. Kiểm tra lịch sử mua hàng (Check Purchase History)

**Endpoint:** `GET /products/{productId}/reviews/can-review`

**Response:**
```typescript
interface CanReviewResponse {
  canReview: boolean;
  hasPurchased: boolean;
  hasReviewed: boolean;
}
```

**Cách sử dụng:**
```typescript
import { checkCanReview } from "@/services/reviewApi";

const check = await checkCanReview(123);
if (check.canReview) {
  // Show review form
} else if (!check.hasPurchased) {
  // Show "You need to purchase this product first"
} else if (check.hasReviewed) {
  // Show "You already reviewed this product"
}
```

---

## Wishlist API

**File:** `services/wishlistApi.ts`

### 1. Lấy danh sách yêu thích (Get Wishlist)

**Endpoint:** `GET /wishlists`

**Query Parameters:**
```typescript
{
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: "ASC" | "DESC";
}
```

**Response:**
```typescript
interface WishlistResponse {
  content: WishlistProduct[];
  page: PageInfo;
}

interface WishlistProduct {
  id: number;
  name: string;
  imageUrl: string | null;
  warrantyMonths: number | null;
  displayOriginalPrice: number;
  displaySalePrice: number;
  discountType: "PERCENTAGE" | "FIXED" | null;
  discountValue: number | null;
  averageRating: number;
  totalRatings: number;
}
```

**Cách sử dụng:**
```typescript
import { getWishlists } from "@/services/wishlistApi";

const wishlist = await getWishlists({ page: 0, size: 20 });
console.log(`${wishlist.content.length} products in wishlist`);
```

### 2. Thêm vào wishlist (Add to Wishlist)

**Endpoint:** `POST /wishlists`

**Request:**
```typescript
interface AddToWishlistRequest {
  productId: number;
}
```

**Cách sử dụng:**
```typescript
import { addToWishlist } from "@/services/wishlistApi";

await addToWishlist(123);
```

### 3. Xóa khỏi wishlist (Remove from Wishlist)

**Endpoint:** `DELETE /wishlists/{productId}`

**Cách sử dụng:**
```typescript
import { removeFromWishlist } from "@/services/wishlistApi";

await removeFromWishlist(123);
```

### 4. Kiểm tra sản phẩm trong wishlist (Check if in Wishlist)

**Endpoint:** `GET /wishlists/check/{productId}`

**Response:**
```typescript
interface CheckWishlistResponse {
  isInWishlist: boolean;
}
```

**Cách sử dụng:**
```typescript
import { checkIsInWishlist } from "@/services/wishlistApi";

const response = await checkIsInWishlist(123);
if (response.isInWishlist) {
  // Show filled heart icon
} else {
  // Show outline heart icon
}
```

---

## Category & Brand API

### Category API

**File:** `services/categoryApi.ts`

#### 1. Lấy tất cả danh mục (Get All Categories)

**Endpoint:** `GET /categories`

**Response:**
```typescript
interface Category {
  id: number;
  name: string;
  parentCategoryId: number | null;
  parentCategoryName: string | null;
  childCategories: Category[];
  createdAt: string;
  updatedAt: string;
}
```

**Cách sử dụng:**
```typescript
import { getCategories } from "@/services/categoryApi";

const categories = await getCategories();
// Returns hierarchical structure with child categories
```

#### 2. Lấy danh mục gốc (Get Root Categories)

**Endpoint:** `GET /categories/root`

**Cách sử dụng:**
```typescript
import { getRootCategories } from "@/services/categoryApi";

const rootCategories = await getRootCategories();
// Only top-level categories (no parent)
```

#### 3. Lấy danh mục con (Get Category Children)

**Endpoint:** `GET /categories/{parentId}/children`

**Cách sử dụng:**
```typescript
import { getCategoryChildren } from "@/services/categoryApi";

const children = await getCategoryChildren(5);
// Get all subcategories of category ID 5
```

### Brand API

**File:** `services/brandApi.ts`

#### 1. Lấy tất cả thương hiệu (Get All Brands)

**Endpoint:** `GET /brands`

**Response:**
```typescript
interface Brand {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}
```

**Cách sử dụng:**
```typescript
import { getBrands } from "@/services/brandApi";

const brands = await getBrands();
brands.forEach(brand => {
  console.log(`${brand.id}: ${brand.name}`);
});
```

#### 2. Lấy chi tiết thương hiệu (Get Brand by ID)

**Endpoint:** `GET /brands/{id}`

**Cách sử dụng:**
```typescript
import { getBrandById } from "@/services/brandApi";

const brand = await getBrandById(3);
console.log(brand.name);
```

---

## Campaign & Voucher API

### Campaign API

**File:** `services/campaignApi.ts`

#### 1. Lấy chiến dịch đang hoạt động (Get Active Campaigns)

**Endpoint:** `GET /campaigns/active`

**Response:**
```typescript
interface ICampaign {
  id: number;
  name: string;
  description: string;
  image: string;
  imageID: string | null;
  startDate: string;
  endDate: string;
  promotionCount: number;
}
```

**Cách sử dụng:**
```typescript
import { getActiveCampaigns } from "@/services/campaignApi";

const campaigns = await getActiveCampaigns();
campaigns.forEach(campaign => {
  console.log(`${campaign.name}: ${campaign.promotionCount} promotions`);
});
```

#### 2. Lấy chi tiết chiến dịch (Get Campaign by ID)

**Endpoint:** `GET /campaigns/{id}`

**Cách sử dụng:**
```typescript
import { getCampaignById } from "@/services/campaignApi";

const campaign = await getCampaignById(10);
```

### Voucher API

**File:** `services/voucherApi.ts`

#### 1. Tính discount khi áp voucher (Calculate Discount)

**Endpoint:** `POST /orders/calculate-discount`

**Request:**
```typescript
interface CalculateDiscountRequest {
  orderItems: Array<{
    productVariationId: number;
    quantity: number;
  }>;
  voucherCode: string;
}
```

**Response:**
```typescript
interface DiscountCalculation {
  subtotal: number;
  voucherDiscount: number;
  shippingFee: number;
  total: number;
  voucherCode?: string;
  voucherType?: "PERCENTAGE" | "FIXED_AMOUNT";
  voucherValue?: number;
}
```

**Cách sử dụng:**
```typescript
import { calculateDiscount } from "@/services/voucherApi";

const result = await calculateDiscount({
  orderItems: [
    { productVariationId: 123, quantity: 2 }
  ],
  voucherCode: "SUMMER2024"
});

console.log(`Subtotal: ${result.subtotal}`);
console.log(`Discount: -${result.voucherDiscount}`);
console.log(`Shipping: ${result.shippingFee}`);
console.log(`Total: ${result.total}`);
```

#### 2. Validate voucher (Validate Voucher)

**Endpoint:** `POST /orders/validate-voucher`

**Request:**
```typescript
{
  voucherCode: string;
  subtotal: number;
}
```

**Response:**
```typescript
interface VoucherValidation {
  isValid: boolean;
  message: string;
  voucher?: Voucher;
  discountAmount: number;
  finalAmount: number;
  discountPercentage?: number;
  errorType?: string;
}
```

**Cách sử dụng:**
```typescript
import { validateVoucher } from "@/services/voucherApi";

const validation = await validateVoucher({
  voucherCode: "SUMMER2024",
  subtotal: 5000000
});

if (validation.isValid) {
  console.log(`Discount: ${validation.discountAmount}`);
  console.log(`Final: ${validation.finalAmount}`);
} else {
  console.log(`Error: ${validation.message}`);
}
```

#### 3. Lấy danh sách voucher khả dụng (Get Available Vouchers)

**Endpoint:** `GET /vouchers/available`

**Cách sử dụng:**
```typescript
import { getAvailableVouchers } from "@/services/voucherApi";

const vouchers = await getAvailableVouchers();
vouchers.forEach(voucher => {
  console.log(`${voucher.code}: ${voucher.value}${voucher.voucherType === 'PERCENTAGE' ? '%' : 'đ'}`);
  console.log(`Min order: ${voucher.minOrderAmount}`);
  console.log(`Remaining: ${voucher.availableQuantity}`);
});
```

---

## AI Services API

Ứng dụng tích hợp 2 tính năng AI chính:

### 1. AI Chatbot

**File:** `services/chatbotApi.ts`  
**Base URL:** `AI_API_BASE_URL` (Port 8005)

#### Gửi tin nhắn (Send Chat Message)

**Endpoint:** `POST /chat`

**Request:**
```typescript
interface ChatRequest {
  question: string;
  history: ChatMessage[];
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
```

**Response:**
```typescript
interface ChatResponse {
  answer: string;
  intent: "PRODUCT" | "POLICY" | "CHITCHAT" | "product_recommendation";
  related_products?: string[];  // SPU codes
  src?: string;                 // Source files for POLICY intent
  debug_query?: string;         // Debug info
}
```

**Cách sử dụng:**
```typescript
import { sendChatMessage, sendChatMessageWithRetry } from "@/services/chatbotApi";

// Simple usage
const response = await sendChatMessage(
  "Tôi muốn mua laptop gaming",
  []
);

console.log(response.answer);
console.log(`Intent: ${response.intent}`);

if (response.related_products) {
  console.log(`Found ${response.related_products.length} products`);
  // Fetch products using getProductsBySpus()
}

// With retry (recommended)
const responseWithRetry = await sendChatMessageWithRetry(
  "Con nào giá rẻ nhất?",
  [
    { role: "user", content: "Tôi muốn mua laptop gaming" },
    { role: "assistant", content: "Bên mình có nhiều laptop gaming..." }
  ],
  2  // Max 2 retries
);
```

**Intent Types:**

1. **PRODUCT** - User hỏi về sản phẩm cụ thể
   - `related_products`: Mảng SPU codes
   - Dùng `getProductsBySpus()` để fetch chi tiết

2. **product_recommendation** - User xin gợi ý sản phẩm
   - `related_products`: Mảng SPU codes được recommend
   - Hiển thị carousel trong chat

3. **POLICY** - User hỏi về chính sách, bảo hành, đổi trả
   - `src`: Source files chứa thông tin
   - Không có `related_products`

4. **CHITCHAT** - Chào hỏi, cảm ơn, tạm biệt
   - Không có `related_products`
   - Chỉ có `answer`

**Best Practices:**

```typescript
// Limit history to 10 messages
const limitedHistory = chatHistory.slice(-10);

// Always use retry for better UX
const response = await sendChatMessageWithRetry(question, limitedHistory);

// Fetch products if available
if (response.related_products && response.related_products.length > 0) {
  const products = await getProductsBySpus(response.related_products);
  // Display products in carousel
}
```

### 2. AI Search (Text & Image)

**File:** `services/searchApi.ts`  
**Base URL:** `AI_API_BASE_URL` (Port 8005)

#### a) Tìm kiếm bằng văn bản (Text Search)

**Endpoint:** `POST /search/text`

**Request:**
```typescript
{
  query: string;
  top_k: number;  // Default: 20
}
```

**Response:**
```typescript
interface SearchResponse {
  status: "success" | "error";
  data: SearchResult[];
}

interface SearchResult {
  spu: string;
  score: number;  // 0.0 - 1.0
}
```

**Cách sử dụng:**
```typescript
import { searchByText } from "@/services/searchApi";

const results = await searchByText("laptop gaming RTX 4060", 10);

results.forEach(result => {
  console.log(`${result.spu}: ${(result.score * 100).toFixed(1)}% match`);
});

// Fetch product details
const spus = results.map(r => r.spu);
const products = await getProductsBySpus(spus);
```

#### b) Tìm kiếm bằng hình ảnh (Image Search)

**Endpoint:** `POST /search/image`

**Request:**
- `Content-Type: multipart/form-data`
- `file`: Image file (JPG/PNG)
- `top_k`: Number of results (default: 20)

**Response:**
```typescript
interface SearchResponse {
  status: "success" | "error";
  data: SearchResult[];
}
```

**Cách sử dụng:**
```typescript
import { searchByImage } from "@/services/searchApi";
import * as ImagePicker from "expo-image-picker";

// Pick image from gallery
const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
  allowsEditing: true,
  quality: 0.8,
});

if (!result.canceled) {
  const imageUri = result.assets[0].uri;
  
  // Search by image
  const searchResults = await searchByImage(imageUri, 20);
  
  console.log(`Found ${searchResults.length} matching products`);
  
  // Fetch products
  const spus = searchResults.map(r => r.spu);
  const products = await getProductsBySpus(spus);
}
```

**Image Requirements:**
- Format: JPG, JPEG, PNG
- Size: Tối đa 10MB (recommended: < 5MB)
- Quality: 0.7 - 0.9 (để balance giữa chất lượng và tốc độ)

#### c) Combined Search & Fetch

**Helper Function:**
```typescript
import { searchAndFetchProducts } from "@/services/searchApi";

// Text search with auto fetch
const products = await searchAndFetchProducts("laptop gaming", 10, "text");

// Image search with auto fetch
const imageResults = await searchAndFetchProducts(imageUri, 10, "image");
```

**Implementation:**
```typescript
export const searchAndFetchProducts = async (
  input: string,
  topK: number = 20,
  type: "text" | "image"
): Promise<ProductApiResponse[]> => {
  let searchResults: SearchResult[] = [];

  if (type === "text") {
    searchResults = await searchByText(input, topK);
  } else {
    searchResults = await searchByImage(input, topK);
  }

  if (searchResults.length === 0) {
    return [];
  }

  const spus = searchResults.map(r => r.spu);
  const products = await getProductsBySpus(spus);
  
  return products;
};
```

---

## Address API

**File:** `services/vietnamAddressApi.ts`

**Base URL:** `https://provinces.open-api.vn/api`

> **Note:** Đây là external API, không cần authentication.

### 1. Lấy danh sách tỉnh/thành phố (Get Provinces)

**Endpoint:** `GET /p/`

**Response:**
```typescript
interface Province {
  code: number;
  name: string;
  name_en: string;
  full_name: string;
  full_name_en: string;
  code_name: string;
}
```

**Cách sử dụng:**
```typescript
import { getProvinces } from "@/services/vietnamAddressApi";

const provinces = await getProvinces();
provinces.forEach(p => {
  console.log(`${p.code}: ${p.full_name}`);
});
```

### 2. Lấy danh sách quận/huyện (Get Districts)

**Endpoint:** `GET /p/{provinceCode}?depth=2`

**Cách sử dụng:**
```typescript
import { getDistrictsByProvince } from "@/services/vietnamAddressApi";

// Get districts of Ho Chi Minh City (code: 79)
const districts = await getDistrictsByProvince(79);
```

### 3. Lấy danh sách phường/xã (Get Wards)

**Endpoint:** `GET /d/{districtCode}?depth=2`

**Cách sử dụng:**
```typescript
import { getWardsByDistrict } from "@/services/vietnamAddressApi";

// Get wards of District 1 (code: 760)
const wards = await getWardsByDistrict(760);
```

**Complete Flow:**
```typescript
// 1. Load provinces
const provinces = await getProvinces();
setProvinces(provinces);

// 2. When user selects province
const onProvinceSelect = async (provinceCode: number) => {
  setSelectedProvince(provinceCode);
  const districts = await getDistrictsByProvince(provinceCode);
  setDistricts(districts);
  setWards([]);  // Reset wards
};

// 3. When user selects district
const onDistrictSelect = async (districtCode: number) => {
  setSelectedDistrict(districtCode);
  const wards = await getWardsByDistrict(districtCode);
  setWards(wards);
};

// 4. Get full address
const getFullAddress = () => {
  const province = provinces.find(p => p.code === selectedProvince);
  const district = districts.find(d => d.code === selectedDistrict);
  const ward = wards.find(w => w.code === selectedWard);
  
  return {
    city: province?.full_name || "",
    district: district?.full_name || "",
    ward: ward?.full_name || ""
  };
};
```

---

## Error Handling

### API Error Structure

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
```

### Try-Catch Pattern

```typescript
try {
  const response = await apiClient.get("/products");
  
  if (!response.success) {
    // Handle API error
    console.error("API Error:", response.error);
    Alert.alert("Lỗi", response.error || "Có lỗi xảy ra");
    return;
  }
  
  // Success
  const products = response.data;
  
} catch (error: any) {
  // Handle network/unexpected errors
  console.error("Network Error:", error.message);
  Alert.alert("Lỗi", "Không thể kết nối đến server");
}
```

### Common Error Codes

```typescript
// 401 - Unauthorized (token expired/invalid)
// Auto-handled by apiClient with token refresh

// 403 - Forbidden (no permission)
Alert.alert("Lỗi", "Bạn không có quyền thực hiện thao tác này");

// 404 - Not Found
Alert.alert("Lỗi", "Không tìm thấy dữ liệu");

// 500 - Server Error
Alert.alert("Lỗi", "Lỗi server, vui lòng thử lại sau");
```

### Retry Logic Example

```typescript
const fetchWithRetry = async (
  fetchFn: () => Promise<any>,
  maxRetries: number = 3
) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetchFn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      console.log(`Retry ${i + 1}/${maxRetries}`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};

// Usage
const products = await fetchWithRetry(() => getProducts());
```

---

## Context Usage

### Using APIs with Contexts

**AuthContext:**
```typescript
import { useAuth } from "@/contexts/AuthContext";

const { login, user, logout } = useAuth();

// Login
await login(email, password);

// Access user
console.log(user?.firstName);

// Logout
await logout();
```

**ProductContext:**
```typescript
import { useProduct } from "@/contexts/ProductContext";

const { formatPrice } = useProduct();

// Format currency
const formatted = formatPrice(1500000);  // "1.500.000₫"
```

**CartContext:**
```typescript
import { useCart } from "@/contexts/CartContext";

const { cartItems, addToCart, updateQuantity, removeItem, cartCount } = useCart();

// Add to cart
await addToCart(variationId, quantity);

// Update quantity
await updateQuantity(variationId, newQuantity);

// Remove item
await removeItem(variationId);

// Get count
console.log(`Cart has ${cartCount} items`);
```

**ChatContext:**
```typescript
import { useChat } from "@/contexts/ChatContext";

const { messages, sendMessage, isChatOpen, setChatOpen } = useChat();

// Send message
await sendMessage("Tôi muốn mua laptop");

// Open/close chat
setChatOpen(true);

// Access history
messages.forEach(msg => {
  console.log(`${msg.role}: ${msg.content}`);
});
```

---

## Testing APIs

### Test API Service

**File:** `services/testApi.ts`

```typescript
import { testConnection } from "@/services/testApi";

// Test backend connection
const backend = await testConnection();
console.log(`Backend: ${backend.status}`);

// Test AI service connection
const ai = await testConnection("ai");
console.log(`AI Service: ${ai.status}`);
```

### Manual Testing với cURL

**Backend API:**
```bash
# Test backend
curl http://localhost:8081/api/products?page=0&size=5

# With auth token
curl -H "Authorization: Bearer <TOKEN>" \
     http://localhost:8081/api/cart
```

**AI Service:**
```bash
# Test chat
curl -X POST http://localhost:8005/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "Hello", "history": []}'

# Test text search
curl -X POST http://localhost:8005/search/text \
  -H "Content-Type: application/json" \
  -d '{"query": "laptop gaming", "top_k": 5}'

# Test image search
curl -X POST http://localhost:8005/search/image \
  -F "file=@test.jpg" \
  -F "top_k=5"
```

---

## API Change Log

### Version 1.0 (Current)

**Backend APIs (Port 8081):**
- ✅ Authentication & User Management
- ✅ Product Management (List, Detail, Batch fetch)
- ✅ Cart Management
- ✅ Order Management & VNPay Integration
- ✅ Review System
- ✅ Wishlist
- ✅ Category & Brand
- ✅ Campaign & Voucher

**AI Services (Port 8005):**
- ✅ AI Chatbot with multi-intent support
- ✅ Text Search (Semantic)
- ✅ Image Search (Visual)

**External APIs:**
- ✅ Vietnam Address API

---

## Best Practices

### 1. Token Management
```typescript
// Tokens are auto-managed by apiClient
// No need to manually handle refresh
```

### 2. Error Handling
```typescript
// Always check response.success
if (!response.success) {
  handleError(response.error);
  return;
}
```

### 3. Loading States
```typescript
const [isLoading, setIsLoading] = useState(false);

const fetchData = async () => {
  setIsLoading(true);
  try {
    const data = await apiCall();
    setData(data);
  } finally {
    setIsLoading(false);
  }
};
```

### 4. Pagination
```typescript
const [page, setPage] = useState(0);
const [hasMore, setHasMore] = useState(true);

const loadMore = async () => {
  const response = await getProducts({ page, size: 20 });
  setHasMore(response.page.number < response.page.totalPages - 1);
  setPage(prev => prev + 1);
};
```

### 5. Debouncing Search
```typescript
import { useDebounce } from "@/hooks/useDebounce";

const [searchQuery, setSearchQuery] = useState("");
const debouncedQuery = useDebounce(searchQuery, 500);

useEffect(() => {
  if (debouncedQuery) {
    searchProducts(debouncedQuery);
  }
}, [debouncedQuery]);
```

---

## Support

Nếu có vấn đề với API:

1. Check console logs (apiClient tự động log tất cả requests)
2. Verify token validity (check AsyncStorage)
3. Test endpoint với cURL
4. Check server logs (Backend/AI services)

**Debug Tool:** `components/ApiDebugger.tsx`
```typescript
import ApiDebugger from "@/components/ApiDebugger";

// Add to any screen
<ApiDebugger />
```

---

**Last Updated:** December 8, 2025  
**Version:** 1.0  
**Author:** E-Shop Development Team
