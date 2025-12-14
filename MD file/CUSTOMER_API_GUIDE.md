# Hướng dẫn API cho Khách hàng - TechBox Store

## Mục lục

- [Giới thiệu](#giới-thiệu)
- [Authentication](#authentication)
- [API Sản phẩm](#api-sản-phẩm)
- [API Giỏ hàng](#api-giỏ-hàng)
- [API Wishlist (Yêu thích)](#api-wishlist-yêu-thích)
- [API Đơn hàng](#api-đơn-hàng)
- [API Đánh giá](#api-đánh-giá)
- [API Người dùng](#api-người-dùng)
- [API Voucher](#api-voucher)
- [Tìm kiếm sản phẩm](#tìm-kiếm-sản-phẩm)
- [API AI Chatbot](#api-ai-chatbot)
- [API AI Search & Recommendations](#api-ai-search--recommendations)

---

## Giới thiệu

Tài liệu này hướng dẫn khách hàng sử dụng các API của TechBox Store để:

- Xem và tìm kiếm sản phẩm
- Quản lý giỏ hàng
- Đặt hàng và theo dõi đơn hàng
- Đánh giá sản phẩm
- Quản lý thông tin cá nhân

**Base URL:** `http://localhost:8080/api`

**Service files:**

- `src/services/productService.ts` - API sản phẩm
- `src/services/cartService.ts` - API giỏ hàng
- `src/services/orderService.ts` - API đơn hàng
- `src/services/reviewService.ts` - API đánh giá
- `src/services/wishListService.ts` - API wishlist
- `src/services/userService.ts` - API người dùng
- `src/services/promotionService.ts` - API voucher

---

## Authentication

Hầu hết các API yêu cầu đăng nhập. Token được tự động thêm vào header thông qua axios interceptor.

**Lưu ý:** Tất cả các service đều import từ `@/lib/axios` đã được config sẵn authentication.

```typescript
import { api } from "@/lib/axios";
// api tự động thêm Bearer token vào header
```

---

## API Sản phẩm

### 1. Lấy danh sách sản phẩm

```typescript
import { ProductService } from "@/services/productService";

const response = await ProductService.getProducts({
  categoryId: number | string, // Lọc theo danh mục
  sortBy: string, // Sắp xếp theo trường (VD: "price", "name")
  sortDirection: "ASC" | "DESC", // Chiều sắp xếp
  page: number, // Trang (mặc định 0)
  size: number, // Số sản phẩm/trang (mặc định 20)
});
```

**Response:**

```typescript
{
  content: ProductDetail[];      // Mảng sản phẩm
  totalPages: number;           // Tổng số trang
  totalElements: number;        // Tổng số sản phẩm
}
```

**ProductDetail Interface:**

```typescript
interface ProductDetail {
  id: number;
  name: string;
  description: string;
  categoryId: number;
  categoryName: string;
  brandId: number;
  brandName: string;
  imageUrl: string | null;
  averageRating: number;
  totalRatings: number;
  displayOriginalPrice: number | null; // Giá gốc
  displaySalePrice: number | null; // Giá sale
  discountType: "PERCENTAGE" | "FIXED" | null;
  discountValue: number | null;
  inWishlist: boolean; // Đã thêm vào wishlist?
  variations: ProductVariation[]; // Các phiên bản sản phẩm
  attributes: ProductAttribute[]; // Thuộc tính
}
```

**Ví dụ:**

```typescript
// Lấy 20 sản phẩm trang đầu
const products = await ProductService.getProducts();

// Lọc theo danh mục laptop, sắp xếp giá tăng dần
const laptops = await ProductService.getProducts({
  categoryId: 1,
  sortBy: "price",
  sortDirection: "ASC",
  page: 0,
  size: 10,
});
```

---

### 2. Lấy chi tiết sản phẩm theo ID

```typescript
const product = await ProductService.getProductById(id: number);
```

**Response:** Trả về `ProductDetail` object.

**Ví dụ:**

```typescript
try {
  const product = await ProductService.getProductById(123);
  console.log(product.name);
  console.log(product.displaySalePrice);
} catch (error) {
  // Xử lý lỗi: sản phẩm không tồn tại
  console.error(error.message); // "Sản phẩm không tồn tại"
}
```

---

### 3. Lấy danh mục sản phẩm

```typescript
// Lấy tất cả danh mục
const categories = await ProductService.getAllCategories();

// Lấy danh mục theo ID
const category = await ProductService.getCategoryById(id: number);
```

**Category Interface:**

```typescript
interface Category {
  id: number;
  name: string;
  parentCategoryId?: number;
  subcategories?: Category[];
}
```

**Ví dụ:**

```typescript
const categories = await ProductService.getAllCategories();
categories.forEach((cat) => {
  console.log(cat.name);
  cat.subcategories?.forEach((sub) => {
    console.log(`  - ${sub.name}`);
  });
});
```

---

## API Giỏ hàng

### 1. Lấy giỏ hàng hiện tại

```typescript
import { CartService } from "@/services/cartService";

const cart = await CartService.getCart();
```

**Cart Interface:**

```typescript
interface Cart {
  items: CartItem[];
  subtotal: number; // Tổng tiền (chưa phí ship)
  itemCount: number; // Tổng số sản phẩm
}

interface CartItem {
  productVariationId: number;
  productId: number;
  productName: string;
  variationName: string;
  price: number;
  quantity: number;
  imageUrl: string;
  availableQuantity: number;
}
```

**Ví dụ:**

```typescript
const cart = await CartService.getCart();
console.log(`Giỏ hàng có ${cart.itemCount} sản phẩm`);
console.log(`Tổng tiền: ${cart.subtotal.toLocaleString("vi-VN")}đ`);

cart.items.forEach((item) => {
  console.log(`${item.productName} - ${item.variationName}: ${item.quantity}x`);
});
```

---

### 2. Thêm sản phẩm vào giỏ

```typescript
const updatedCart = await CartService.addItem(
  productVariationId: number,
  quantity: number
);
```

**Ví dụ:**

```typescript
// Thêm 2 sản phẩm variation ID 456 vào giỏ
const cart = await CartService.addItem(456, 2);
console.log("Đã thêm vào giỏ hàng!");
```

---

### 3. Cập nhật số lượng sản phẩm

```typescript
const updatedCart = await CartService.updateItem(
  productVariationId: number,
  quantity: number
);
```

**Ví dụ:**

```typescript
// Cập nhật số lượng thành 5
await CartService.updateItem(456, 5);

// Đặt số lượng = 0 để xóa sản phẩm
await CartService.updateItem(456, 0);
```

---

### 4. Xóa sản phẩm khỏi giỏ

```typescript
const updatedCart = await CartService.removeItem(productVariationId: number);
```

**Ví dụ:**

```typescript
await CartService.removeItem(456);
console.log("Đã xóa sản phẩm khỏi giỏ hàng");
```

---

### 5. Xóa toàn bộ giỏ hàng

```typescript
await CartService.clearCart();
```

**Ví dụ:**

```typescript
await CartService.clearCart();
console.log("Đã xóa toàn bộ giỏ hàng");
```

---

## API Wishlist (Yêu thích)

### 1. Lấy danh sách wishlist

```typescript
import { WishlistService } from "@/services/wishListService";

const wishlist = await WishlistService.getWishlist();
```

**Response:**

```typescript
{
  content: Product[];           // Danh sách sản phẩm yêu thích
  page: {
    totalElements: number;      // Tổng số sản phẩm
  }
}
```

**Ví dụ:**

```typescript
const wishlist = await WishlistService.getWishlist();
console.log(`Bạn có ${wishlist.page.totalElements} sản phẩm yêu thích`);

wishlist.content.forEach((product) => {
  console.log(product.name);
});
```

---

### 2. Thêm sản phẩm vào wishlist

```typescript
await WishlistService.addToWishlist(productId: number);
```

**Ví dụ:**

```typescript
await WishlistService.addToWishlist(123);
console.log("Đã thêm vào danh sách yêu thích");
```

---

### 3. Xóa sản phẩm khỏi wishlist

```typescript
await WishlistService.removeFromWishlist(productId: number);
```

**Ví dụ:**

```typescript
await WishlistService.removeFromWishlist(123);
console.log("Đã xóa khỏi danh sách yêu thích");
```

---

## API Đơn hàng

### 1. Tạo đơn hàng mới

```typescript
import { OrderService } from '@/services/orderService';

const order = await OrderService.createOrder(payload: OrderRequest);
```

**OrderRequest Interface:**

```typescript
interface OrderRequest {
  orderItems: {
    productVariationId: number;
    quantity: number;
  }[];
  shippingInfo: {
    shippingName: string;
    shippingPhone: string;
    shippingEmail: string;
    shippingAddress: string;
    shippingWard: string;
    shippingDistrict: string;
    shippingCity: string;
    shippingPostalCode?: string;
    shippingCountry: string;
    shippingMethod: "STANDARD" | "EXPRESS" | "SAME_DAY";
    deliveryInstructions?: string;
  };
  paymentInfo: {
    paymentMethod: "COD" | "VNPAY" | "BANK_TRANSFER";
  };
  note?: string;
  voucherCode?: string; // Mã giảm giá (optional)
}
```

**OrderResponse:**

```typescript
interface OrderResponse {
  id: number;
  orderCode: string; // Mã đơn hàng
  userId: number;
  totalAmount: number;
  status: "PENDING" | "CONFIRMED" | "SHIPPING" | "DELIVERED" | "CANCELLED";
  paymentStatus: "PENDING" | "PAID" | "FAILED";
  createdAt: string;
  items: OrderItem[];
  shippingInfo: ShippingInfo;
  paymentUrl?: string; // URL thanh toán (nếu là VNPAY)
}
```

**Ví dụ:**

```typescript
const order = await OrderService.createOrder({
  orderItems: [
    { productVariationId: 456, quantity: 2 },
    { productVariationId: 789, quantity: 1 },
  ],
  shippingInfo: {
    shippingName: "Nguyễn Văn A",
    shippingPhone: "0912345678",
    shippingEmail: "email@example.com",
    shippingAddress: "123 Đường ABC",
    shippingWard: "Phường 1",
    shippingDistrict: "Quận 1",
    shippingCity: "TP. Hồ Chí Minh",
    shippingCountry: "Việt Nam",
    shippingMethod: "STANDARD",
    deliveryInstructions: "Giao giờ hành chính",
  },
  paymentInfo: {
    paymentMethod: "COD",
  },
  voucherCode: "SUMMER2024", // Áp dụng mã giảm giá
});

console.log(`Đặt hàng thành công! Mã đơn: ${order.orderCode}`);

// Nếu thanh toán VNPAY, chuyển hướng đến URL thanh toán
if (order.paymentUrl) {
  window.location.href = order.paymentUrl;
}
```

---

### 2. Lấy danh sách đơn hàng của tôi

```typescript
const orders = await OrderService.getUserOrders(
  page: number = 0,
  size: number = 10
);
```

**Response:**

```typescript
{
  content: OrderResponse[];
  page: {
    totalElements: number;
    totalPages: number;
  }
}
```

**Ví dụ:**

```typescript
// Lấy 10 đơn hàng đầu tiên
const orders = await OrderService.getUserOrders(0, 10);

orders.content.forEach((order) => {
  console.log(`Đơn ${order.orderCode}: ${order.status}`);
  console.log(`Tổng tiền: ${order.totalAmount.toLocaleString("vi-VN")}đ`);
});
```

---

### 3. Lấy chi tiết đơn hàng

```typescript
const order = await OrderService.getOrderById(orderId: number);
```

**Ví dụ:**

```typescript
const order = await OrderService.getOrderById(123);
console.log(`Mã đơn: ${order.orderCode}`);
console.log(`Trạng thái: ${order.status}`);
console.log(`Số sản phẩm: ${order.items.length}`);
```

---

### 4. Lấy đơn hàng theo trạng thái

```typescript
const orders = await OrderService.getUserOrdersByStatus(
  status: "PENDING" | "CONFIRMED" | "SHIPPING" | "DELIVERED" | "CANCELLED",
  page: number = 0,
  size: number = 10
);
```

**Ví dụ:**

```typescript
// Lấy đơn hàng đang chờ xử lý
const pendingOrders = await OrderService.getUserOrdersByStatus("PENDING");

// Lấy đơn hàng đã giao
const deliveredOrders = await OrderService.getUserOrdersByStatus("DELIVERED");
```

---

### 5. Lấy đơn hàng theo mã

```typescript
const order = await OrderService.getOrderByCode(orderCode: string);
```

**Ví dụ:**

```typescript
const order = await OrderService.getOrderByCode("ORD-2024-001");
console.log(order.status);
```

---

### 6. Hủy đơn hàng

**Chỉ hủy được khi status = PENDING**

```typescript
const order = await OrderService.cancelOrder(orderId: number);
```

**Ví dụ:**

```typescript
try {
  const order = await OrderService.cancelOrder(123);
  console.log("Đã hủy đơn hàng thành công");
} catch (error) {
  console.error("Không thể hủy đơn hàng (có thể đã được xác nhận)");
}
```

---

## API Đánh giá

### 1. Lấy đánh giá sản phẩm

```typescript
import { ReviewService } from '@/services/reviewService';

const reviews = await ReviewService.getProductReviews(
  productId: number,
  page: number = 0,
  size: number = 10
);
```

**ReviewPage Interface:**

```typescript
interface ReviewPage {
  content: Review[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

interface Review {
  id: number;
  productId: number;
  userId: number;
  userFullName: string;
  rating: number; // 1-5 sao
  content: string;
  createdAt: string;
  updatedAt: string;
}
```

**Ví dụ:**

```typescript
const reviews = await ReviewService.getProductReviews(123, 0, 10);
console.log(`Sản phẩm có ${reviews.page.totalElements} đánh giá`);

reviews.content.forEach((review) => {
  console.log(`${review.userFullName}: ${review.rating}⭐`);
  console.log(review.content);
});
```

---

### 2. Lấy tóm tắt đánh giá

```typescript
const summary = await ReviewService.getReviewSummary(productId: number);
```

**ReviewSummary Interface:**

```typescript
interface ReviewSummary {
  productId: number;
  totalReviews: number;
  averageRating: number;
  rating1Count: number; // Số đánh giá 1 sao
  rating2Count: number;
  rating3Count: number;
  rating4Count: number;
  rating5Count: number;
}
```

**Ví dụ:**

```typescript
const summary = await ReviewService.getReviewSummary(123);
console.log(`Trung bình: ${summary.averageRating}⭐`);
console.log(`Tổng: ${summary.totalReviews} đánh giá`);
console.log(`5⭐: ${summary.rating5Count}`);
console.log(`4⭐: ${summary.rating4Count}`);
console.log(`3⭐: ${summary.rating3Count}`);
console.log(`2⭐: ${summary.rating2Count}`);
console.log(`1⭐: ${summary.rating1Count}`);
```

---

### 3. Thêm đánh giá mới

```typescript
const review = await ReviewService.addReview(
  productId: number,
  data: {
    rating: number,          // 1-5
    content: string
  }
);
```

**Ví dụ:**

```typescript
const review = await ReviewService.addReview(123, {
  rating: 5,
  content: "Sản phẩm rất tốt, giao hàng nhanh!",
});
console.log("Đã gửi đánh giá thành công");
```

---

### 4. Lấy đánh giá của tôi cho sản phẩm

```typescript
const myReview = await ReviewService.getMyReview(productId: number);
```

**Response:** `Review | null` (null nếu chưa đánh giá)

**Ví dụ:**

```typescript
const myReview = await ReviewService.getMyReview(123);

if (myReview) {
  console.log(`Bạn đã đánh giá ${myReview.rating}⭐`);
  console.log(myReview.content);
} else {
  console.log("Bạn chưa đánh giá sản phẩm này");
}
```

---

### 5. Cập nhật đánh giá

```typescript
const review = await ReviewService.updateReview(
  productId: number,
  reviewId: number,
  data: {
    rating: number,
    content: string
  }
);
```

**Ví dụ:**

```typescript
const updated = await ReviewService.updateReview(123, 456, {
  rating: 4,
  content: "Sản phẩm tốt nhưng ship hơi lâu",
});
console.log("Đã cập nhật đánh giá");
```

---

### 6. Xóa đánh giá

```typescript
await ReviewService.deleteReview(
  productId: number,
  reviewId: number
);
```

**Ví dụ:**

```typescript
await ReviewService.deleteReview(123, 456);
console.log("Đã xóa đánh giá");
```

---

## API Người dùng

### 1. Lấy thông tin cá nhân

```typescript
import { getCurrentUserProfile } from "@/services/userService";

const user = await getCurrentUserProfile();
```

**User Interface:**

```typescript
interface User {
  id: number;
  email: string;
  fullName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  avatarUrl?: string;
  role: "CUSTOMER" | "ADMIN" | "STAFF";
  createdAt: string;
  updatedAt: string;
}
```

**Ví dụ:**

```typescript
const user = await getCurrentUserProfile();
console.log(`Xin chào, ${user.fullName}!`);
console.log(`Email: ${user.email}`);
```

---

### 2. Cập nhật thông tin cá nhân

```typescript
import { updateUserProfile } from '@/services/userService';

const updatedUser = await updateUserProfile(userData: Partial<User>);
```

**Ví dụ:**

```typescript
const updated = await updateUserProfile({
  fullName: "Nguyễn Văn B",
  phoneNumber: "0987654321",
  gender: "MALE",
});
console.log("Đã cập nhật thông tin");
```

---

### 3. Quản lý địa chỉ

#### Lấy danh sách địa chỉ

```typescript
import { getUserAddresses } from '@/services/userService';

const addresses = await getUserAddresses(userId: number);
```

**Address Interface:**

```typescript
interface Address {
  id: number;
  recipientName: string;
  phoneNumber: string;
  address: string;
  ward: string;
  district: string;
  city: string;
  postalCode?: string;
  country: string;
  isDefault: boolean;
}
```

#### Thêm địa chỉ mới

```typescript
import { addUserAddress } from '@/services/userService';

const address = await addUserAddress(
  userId: number,
  addressData: Omit<Address, "id">
);
```

**Ví dụ:**

```typescript
const newAddress = await addUserAddress(123, {
  recipientName: "Nguyễn Văn A",
  phoneNumber: "0912345678",
  address: "123 Đường ABC",
  ward: "Phường 1",
  district: "Quận 1",
  city: "TP. Hồ Chí Minh",
  country: "Việt Nam",
  isDefault: true,
});
```

#### Cập nhật địa chỉ

```typescript
import { updateUserAddress } from '@/services/userService';

await updateUserAddress(
  userId: number,
  addressId: number,
  addressData: Omit<Address, "id">
);
```

#### Xóa địa chỉ

```typescript
import { deleteUserAddress } from '@/services/userService';

await deleteUserAddress(userId: number, addressId: number);
```

---

## API Voucher

Chi tiết về API Voucher xem tại [VOUCHER_API_DOCUMENTATION.md](./VOUCHER_API_DOCUMENTATION.md)

### Validate voucher (Quan trọng nhất cho khách hàng)

```typescript
import { voucherService } from "@/services/promotionService";

const validation = await voucherService.validate({
  code: string, // Mã voucher
  userId: number, // ID người dùng
  orderAmount: number, // Tổng tiền đơn hàng
});
```

**Response:**

```typescript
interface VoucherValidation {
  isValid: boolean;
  message: string;
  discountAmount: number; // Số tiền được giảm
  finalAmount: number; // Tổng tiền sau giảm
  discountPercentage?: number;
  errorType?: string;
}
```

**Ví dụ:**

```typescript
const validation = await voucherService.validate({
  code: "SUMMER2024",
  userId: 123,
  orderAmount: 1000000,
});

if (validation.isValid) {
  console.log(`Giảm: ${validation.discountAmount.toLocaleString("vi-VN")}đ`);
  console.log(`Còn lại: ${validation.finalAmount.toLocaleString("vi-VN")}đ`);
} else {
  console.log(`Lỗi: ${validation.message}`);
}
```

---

## Tìm kiếm sản phẩm

### Tìm kiếm theo tên

```typescript
// API endpoint: GET /api/products?name={query}&page={page}&size={size}

// Ví dụ: Tìm "laptop"
const response = await fetch(`${baseUrl}/products?name=laptop&page=0&size=20`);
const data = await response.json();
const products = data.content;
```

**Hoặc sử dụng ProductService:**

```typescript
const products = await ProductService.getProducts({
  // Lưu ý: API backend cần hỗ trợ tham số name
  // Hiện tại chỉ hỗ trợ categoryId, sortBy, sortDirection
});
```

**Page implementation:**

```typescript
// File: src/app/(shop)/search/page.tsx
// URL: /search?q=laptop&page=0

const SearchPage = async ({ searchParams }) => {
  const query = searchParams.q?.trim() || "";
  const page = parseInt(searchParams.page || "0");

  const res = await fetch(
    `${baseUrl}/products?name=${encodeURIComponent(
      query
    )}&page=${page}&size=20`,
    { cache: "no-store" }
  );

  const data = await res.json();
  const products = data.content || [];
  const totalPages = data.page?.totalPages || 1;

  // Render products
};
```

---

## API AI Chatbot

Hệ thống AI Chatbot giúp khách hàng tư vấn sản phẩm, trả lời câu hỏi và gợi ý sản phẩm phù hợp.

### Cấu trúc dữ liệu

```typescript
// File: src/components/chatbot/types.ts

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: number;
  products?: Product[]; // Sản phẩm gợi ý từ AI
}

interface ChatRequest {
  question: string;
  history: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
}

interface ChatResponse {
  answer: string; // Câu trả lời từ AI
  intent: string; // Ý định người dùng
  related_products?: string[]; // Mảng SPU sản phẩm liên quan
  src?: string; // Nguồn thông tin
  debug_query?: string; // Debug query (dev only)
}
```

---

### 1. Gửi tin nhắn đến AI Chatbot

**Service:** Tạo file `src/services/chatbotService.ts`

```typescript
import axios from "axios";
import { ChatRequest, ChatResponse } from "@/components/chatbot/types";

const CHAT_ENDPOINT = "/aiproxy/chat";

export async function sendChatMessage(
  question: string,
  history: ChatRequest["history"]
): Promise<ChatResponse> {
  try {
    const response = await axios.post<ChatResponse>(CHAT_ENDPOINT, {
      question,
      history,
    });

    return response.data;
  } catch (error) {
    console.error("[ChatbotService] Error sending message:", error);
    throw error;
  }
}
```

**Parameters:**

- `question`: Câu hỏi của người dùng
- `history`: Lịch sử 10 tin nhắn gần nhất (để AI hiểu ngữ cảnh)

**Response:**

```typescript
{
  answer: "Laptop Dell XPS 13 là lựa chọn tuyệt vời với...",
  intent: "product_recommendation",
  related_products: ["LAPTOP-DELL-XPS-13", "LAPTOP-MACBOOK-AIR"],
  src: "product_database"
}
```

**Ví dụ sử dụng:**

```typescript
import { sendChatMessage } from "@/services/chatbotService";

const history = [
  { role: "user", content: "Tôi cần laptop để làm việc" },
  { role: "assistant", content: "Bạn cần laptop cho công việc gì?" },
];

const response = await sendChatMessage("Chủ yếu là code và design", history);

console.log(response.answer);
// "Tôi gợi ý laptop với RAM ≥ 16GB, CPU mạnh..."

if (response.related_products) {
  // Fetch thông tin chi tiết sản phẩm
  const products = await ProductService.fetchProductsBySpus(
    response.related_products
  );
}
```

---

### 2. Custom Hook: useChatbot

**File:** `src/hooks/useChatbot.ts`

Hook quản lý toàn bộ logic chat, lưu lịch sử, tự động fetch sản phẩm.

```typescript
import { useChatbot } from "@/hooks/useChatbot";

const ChatComponent = () => {
  const {
    messages, // Danh sách tin nhắn
    isLoading, // Đang chờ response
    error, // Lỗi (nếu có)
    sendMessage, // Gửi tin nhắn
    clearHistory, // Xóa lịch sử chat
  } = useChatbot();

  return (
    <div>
      {messages.map((msg, idx) => (
        <div key={idx}>
          <strong>{msg.role}:</strong> {msg.content}
          {/* Hiển thị sản phẩm gợi ý */}
          {msg.products && msg.products.length > 0 && (
            <div className="product-suggestions">
              {msg.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      ))}

      <button onClick={() => sendMessage("Laptop nào tốt?")}>Gửi</button>

      <button onClick={clearHistory}>Chat mới</button>
    </div>
  );
};
```

**Tính năng:**

- ✅ Tự động lưu lịch sử vào `localStorage`
- ✅ Giới hạn 10 tin nhắn gần nhất khi gửi API (tiết kiệm tokens)
- ✅ Tự động fetch sản phẩm khi AI trả về `related_products`
- ✅ Xử lý lỗi và hiển thị thông báo

---

### 3. Flow hoàn chỉnh của Chatbot

```typescript
// 1. User gửi câu hỏi
sendMessage("Laptop gaming tốt nhất là gì?");

// 2. Hook tự động:
//    - Thêm tin nhắn user vào state
//    - Lấy 10 tin nhắn gần nhất làm history
//    - Gọi API sendChatMessage()

// 3. API trả về response
{
  answer: "Laptop gaming tốt nhất hiện nay là...",
  intent: "product_recommendation",
  related_products: ["LAPTOP-ASUS-ROG", "LAPTOP-MSI-GAMING"]
}

// 4. Hook tự động:
//    - Fetch chi tiết sản phẩm từ related_products
//    - Thêm tin nhắn AI + products vào state
//    - Lưu vào localStorage

// 5. UI tự động re-render hiển thị:
//    - Câu trả lời của AI
//    - Danh sách sản phẩm gợi ý (ProductCard)
```

---

### 4. Chatbot Components (Atomic Design)

**Atoms:**

```typescript
// ChatInput - Input + Send button
import { ChatInput } from "@/components/chatbot/atoms/ChatInput";

<ChatInput
  onSend={(message) => sendMessage(message)}
  disabled={isLoading}
  placeholder="Nhập câu hỏi..."
/>;

// ChatMessage - Hiển thị 1 tin nhắn
import { ChatMessage } from "@/components/chatbot/atoms/ChatMessage";

<ChatMessage message={msg} />;
```

**Molecules:**

```typescript
// MessageList - Danh sách tin nhắn + auto scroll
import { MessageList } from "@/components/chatbot/molecules/MessageList";

<MessageList messages={messages} isLoading={isLoading} />;

// ChatHeader - Header với nút đóng và chat mới
import { ChatHeader } from "@/components/chatbot/molecules/ChatHeader";

<ChatHeader
  onClose={() => setOpen(false)}
  onNewChat={clearHistory}
  messageCount={messages.length}
/>;
```

**Organisms:**

```typescript
// ChatWindow - Toàn bộ cửa sổ chat
import { ChatWindow } from "@/components/chatbot/organisms/ChatWindow";

<ChatWindow onClose={() => setOpen(false)} />;

// ChatPopup - Floating button + popup
import { ChatPopup } from "@/components/chatbot/organisms/ChatPopup";

// Thêm vào layout
<ChatPopup />;
```

---

### 5. Ví dụ Use Cases

#### Use Case 1: Hỏi thông tin sản phẩm

```typescript
User: "Laptop Dell XPS 13 có tốt không?"

AI Response: {
  answer: "Dell XPS 13 là dòng laptop cao cấp với thiết kế mỏng nhẹ, màn hình InfinityEdge...",
  intent: "product_inquiry",
  related_products: ["LAPTOP-DELL-XPS-13"],
  src: "product_database"
}

// → Hiển thị thông tin + link đến sản phẩm
```

#### Use Case 2: Tư vấn mua sắm

```typescript
User: "Tôi có 20 triệu, muốn mua laptop để code"

AI Response: {
  answer: "Với 20 triệu, tôi gợi ý các laptop sau phù hợp lập trình...",
  intent: "product_recommendation",
  related_products: [
    "LAPTOP-DELL-INSPIRON-16",
    "LAPTOP-ASUS-VIVOBOOK",
    "LAPTOP-HP-PAVILION"
  ]
}

// → Hiển thị 3 ProductCard với giá, rating, nút "Thêm vào giỏ"
```

#### Use Case 3: So sánh sản phẩm

```typescript
User: "So sánh iPhone 15 và Samsung S24"

AI Response: {
  answer: "iPhone 15 mạnh về hệ sinh thái iOS...\nSamsung S24 nổi bật với màn hình...",
  intent: "product_comparison",
  related_products: ["IPHONE-15", "SAMSUNG-S24"]
}

// → Hiển thị bảng so sánh 2 sản phẩm
```

#### Use Case 4: Hỏi chính sách

```typescript
User: "Chính sách bảo hành như thế nào?"

AI Response: {
  answer: "TechBox có chính sách bảo hành 12 tháng...",
  intent: "policy_inquiry",
  src: "knowledge_base"
}

// → Không có sản phẩm, chỉ hiển thị text
```

---

### 6. Best Practices

**1. Quản lý lịch sử:**

```typescript
// Giới hạn history gửi lên API (10 tin gần nhất)
const historyForAPI = messages.slice(-10).map((msg) => ({
  role: msg.role,
  content: msg.content,
}));
```

**2. Hiển thị sản phẩm:**

```typescript
{
  message.products && message.products.length > 0 && (
    <div className="grid grid-cols-2 gap-2 mt-2">
      {message.products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          compact={true} // Layout nhỏ gọn cho chat
        />
      ))}
    </div>
  );
}
```

**3. Loading state:**

```typescript
{
  isLoading && (
    <div className="flex items-center gap-2 text-gray-500">
      <Loader className="animate-spin" />
      <span>AI đang suy nghĩ...</span>
    </div>
  );
}
```

**4. Error handling:**

```typescript
const sendMessage = async (question: string) => {
  try {
    const response = await sendChatMessage(question, history);
    // Success
  } catch (error) {
    // Hiển thị tin nhắn lỗi
    addMessage({
      role: "assistant",
      content: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.",
      timestamp: Date.now(),
    });
  }
};
```

---

## API AI Search & Recommendations

Hệ thống tìm kiếm thông minh và gợi ý sản phẩm sử dụng AI (Vector Search).

### Cấu trúc dữ liệu

```typescript
// File: src/services/searchService.ts (cần tạo)

interface SearchResult {
  spu: string;
  name: string;
  score: number; // Độ tương đồng (0-1)
  price?: number;
  imageUrl?: string;
}

interface SearchResponse {
  data: SearchResult[];
  total?: number;
}
```

---

### 1. Tìm kiếm bằng text (Semantic Search)

Tìm kiếm thông minh hiểu ngữ nghĩa, không chỉ khớp từ khóa.

```typescript
import axios from "axios";

const TEXT_SEARCH_ENDPOINT = "/aiproxy/search/text";

export class SearchService {
  static async searchByText(
    query: string,
    topK: number = 20
  ): Promise<SearchResult[]> {
    try {
      const response = await axios.post<SearchResponse>(TEXT_SEARCH_ENDPOINT, {
        query,
        top_k: topK,
      });

      return response.data.data || [];
    } catch (error) {
      console.error("[SearchService] Error:", error);
      return [];
    }
  }
}
```

**Ví dụ:**

```typescript
// Tìm kiếm thông minh - hiểu ngữ nghĩa
const results = await SearchService.searchByText(
  "laptop mỏng nhẹ cho sinh viên",
  10
);

results.forEach((result) => {
  console.log(`${result.name} - Score: ${result.score}`);
});

// Kết quả có thể chứa:
// - "Dell XPS 13" (ultrabook)
// - "MacBook Air" (mỏng nhẹ)
// - "ASUS Zenbook" (phù hợp sinh viên)
// Ngay cả khi không chứa từ "mỏng nhẹ sinh viên"
```

**So sánh với tìm kiếm thường:**

```typescript
// Tìm kiếm thường (keyword matching)
GET /api/products?name=laptop
// → Chỉ tìm sản phẩm có chữ "laptop"

// AI Search (semantic search)
POST /aiproxy/search/text
{ query: "máy tính xách tay cho dân văn phòng" }
// → Tìm được laptop phù hợp văn phòng
//    dù không có từ "laptop"
```

---

### 2. Tìm kiếm bằng hình ảnh (Image Search)

Upload ảnh → Tìm sản phẩm tương tự.

```typescript
const IMAGE_SEARCH_ENDPOINT = "/aiproxy/search/image";

export class SearchService {
  static async searchByImage(
    imageFile: File,
    topK: number = 20
  ): Promise<SearchResult[]> {
    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("top_k", topK.toString());

      const response = await axios.post<SearchResponse>(
        IMAGE_SEARCH_ENDPOINT,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      return response.data.data || [];
    } catch (error) {
      console.error("[SearchService] Error:", error);
      return [];
    }
  }
}
```

**Ví dụ:**

```typescript
const ImageSearchComponent = () => {
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const results = await SearchService.searchByImage(file, 10);

    console.log(`Tìm thấy ${results.length} sản phẩm tương tự`);
    results.forEach((r) => {
      console.log(`${r.name} - Độ tương đồng: ${(r.score * 100).toFixed(1)}%`);
    });
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileChange} />
    </div>
  );
};
```

---

### 3. Gợi ý sản phẩm (Product Recommendations)

Dựa trên lịch sử xem/mua của user → Gợi ý sản phẩm liên quan.

```typescript
const RECOMMEND_ENDPOINT = "/aiproxy/recommend";

export class SearchService {
  static async getRecommendations(
    spus: string[],
    topK: number = 5
  ): Promise<SearchResult[]> {
    try {
      const response = await axios.post<SearchResponse>(RECOMMEND_ENDPOINT, {
        spus,
        top_k: topK,
      });

      return response.data.data || [];
    } catch (error) {
      console.error("[SearchService] Error:", error);
      return [];
    }
  }
}
```

**Ví dụ 1: Gợi ý từ sản phẩm hiện tại**

```typescript
// User đang xem "LAPTOP-DELL-XPS-13"
const currentSPU = "LAPTOP-DELL-XPS-13";

const recommendations = await SearchService.getRecommendations([currentSPU], 5);

// → Gợi ý: MacBook Air, ASUS Zenbook, HP Spectre...
```

**Ví dụ 2: Gợi ý từ lịch sử đơn hàng**

```typescript
import { OrderService } from "@/services/orderService";

// Lấy 10 SPU từ đơn hàng gần đây
const recentSPUs = await OrderService.getRecentProductSpus(10);

// Gợi ý 5 sản phẩm tương tự
const recommendations = await SearchService.getRecommendations(recentSPUs, 5);

// → Hiển thị "Sản phẩm bạn có thể thích"
```

**Ví dụ 3: Section "Sản phẩm liên quan"**

```tsx
const ProductDetailPage = ({ productSPU }) => {
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    const fetchRelated = async () => {
      const results = await SearchService.getRecommendations([productSPU], 4);

      // Fetch full product info
      const products = await ProductService.fetchProductsBySpus(
        results.map((r) => r.spu)
      );

      setRelatedProducts(products);
    };

    fetchRelated();
  }, [productSPU]);

  return (
    <div>
      <ProductInfo />

      <section className="mt-8">
        <h2>Sản phẩm liên quan</h2>
        <div className="grid grid-cols-4 gap-4">
          {relatedProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
};
```

---

### 4. Fetch sản phẩm từ SPU IDs

Sau khi có danh sách SPU từ AI → Fetch thông tin chi tiết.

```typescript
// File: src/services/productService.ts

export class ProductService {
  static async fetchProductsBySpus(spus: string[]): Promise<Product[]> {
    if (!spus || spus.length === 0) return [];

    try {
      const response = await api.post("/products/by-spus", {
        spus: spus,
      });

      return response.data || [];
    } catch (error) {
      console.error("[ProductService] Error fetching by SPUs:", error);
      return [];
    }
  }
}
```

**Ví dụ:**

```typescript
// AI trả về SPU IDs
const spus = ["LAPTOP-DELL-XPS-13", "LAPTOP-MACBOOK-AIR"];

// Fetch thông tin đầy đủ
const products = await ProductService.fetchProductsBySpus(spus);

products.forEach((product) => {
  console.log(product.name);
  console.log(product.displaySalePrice);
  console.log(product.imageUrl);
});
```

---

### 5. Flow hoàn chỉnh: AI Search → Display Products

```typescript
const AISearchPage = () => {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);

    // 1. Tìm kiếm bằng AI (semantic search)
    const searchResults = await SearchService.searchByText(query, 20);

    // 2. Lấy danh sách SPU
    const spus = searchResults.map((r) => r.spu);

    // 3. Fetch thông tin đầy đủ của sản phẩm
    const fullProducts = await ProductService.fetchProductsBySpus(spus);

    // 4. Hiển thị kết quả
    setProducts(fullProducts);
    setLoading(false);
  };

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Tìm laptop cho sinh viên..."
      />
      <button onClick={handleSearch}>Tìm kiếm AI</button>

      {loading && <Spinner />}

      <div className="grid grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            showScore={true} // Hiển thị điểm tương đồng
          />
        ))}
      </div>
    </div>
  );
};
```

---

### 6. So sánh AI Search vs Normal Search

| Feature         | Normal Search                     | AI Search                         |
| --------------- | --------------------------------- | --------------------------------- |
| **Cách thức**   | Khớp từ khóa (keyword matching)   | Hiểu ngữ nghĩa (semantic)         |
| **Ví dụ query** | "laptop dell"                     | "máy tính xách tay văn phòng"     |
| **Kết quả**     | Chỉ sản phẩm có chữ "laptop dell" | Tất cả laptop phù hợp văn phòng   |
| **Typo**        | Không tìm được nếu sai chính tả   | Vẫn hiểu (máy tinhh → máy tính)   |
| **Đồng nghĩa**  | Không hiểu                        | Hiểu (laptop = máy tính xách tay) |
| **Performance** | Rất nhanh                         | Chậm hơn (AI inference)           |
| **Use case**    | Tìm nhanh, chính xác              | Tìm thông minh, khám phá          |

**Recommendation:**

- **Normal search**: Thanh tìm kiếm header (nhanh, realtime)
- **AI search**: Trang search chuyên biệt, chatbot

---

### 7. API Endpoints Summary

```typescript
// ===== CHATBOT =====
POST /aiproxy/chat
{
  question: "Laptop nào tốt?",
  history: [...]
}
→ { answer, intent, related_products }

// ===== AI SEARCH =====
POST /aiproxy/search/text
{
  query: "laptop mỏng nhẹ",
  top_k: 20
}
→ { data: [{ spu, name, score }] }

POST /aiproxy/search/image
FormData: { image: File, top_k: 20 }
→ { data: [{ spu, name, score }] }

// ===== RECOMMENDATIONS =====
POST /aiproxy/recommend
{
  spus: ["LAPTOP-DELL-XPS-13"],
  top_k: 5
}
→ { data: [{ spu, name, score }] }

// ===== FETCH PRODUCTS =====
POST /api/products/by-spus
{
  spus: ["LAPTOP-DELL-XPS-13", "LAPTOP-MACBOOK-AIR"]
}
→ [{ id, name, price, imageUrl, ... }]
```

---

### 8. Best Practices cho AI Features

**1. Caching:**

```typescript
// Cache kết quả tìm kiếm để tránh gọi lại
const searchCache = new Map();

const cachedSearch = async (query: string) => {
  if (searchCache.has(query)) {
    return searchCache.get(query);
  }

  const results = await SearchService.searchByText(query);
  searchCache.set(query, results);
  return results;
};
```

**2. Debouncing:**

```typescript
// Tránh gọi API liên tục khi user typing
import { useDebounce } from "@/hooks/useDebounce";

const SearchInput = () => {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    if (debouncedQuery) {
      SearchService.searchByText(debouncedQuery);
    }
  }, [debouncedQuery]);

  return <input onChange={(e) => setQuery(e.target.value)} />;
};
```

**3. Error handling:**

```typescript
try {
  const results = await SearchService.searchByText(query);
  if (results.length === 0) {
    toast.info("Không tìm thấy sản phẩm phù hợp");
  }
} catch (error) {
  toast.error("Lỗi tìm kiếm. Vui lòng thử lại");
  // Fallback to normal search
  const fallback = await ProductService.getProducts({ name: query });
}
```

**4. Loading states:**

```typescript
const [searchState, setSearchState] = useState<
  "idle" | "searching" | "fetching-products" | "done"
>("idle");

// searching: Đang gọi AI search
// fetching-products: Đang fetch thông tin chi tiết
// done: Hoàn thành
```

---

## Các Use Case thực tế

### 1. Flow mua hàng hoàn chỉnh

```typescript
// 1. Khách hàng xem sản phẩm
const products = await ProductService.getProducts({ page: 0, size: 20 });

// 2. Xem chi tiết sản phẩm
const product = await ProductService.getProductById(123);

// 3. Thêm vào giỏ hàng
const variationId = product.variations[0].id;
await CartService.addItem(variationId, 2);

// 4. Xem giỏ hàng
const cart = await CartService.getCart();

// 5. Áp dụng voucher (optional)
const validation = await voucherService.validate({
  code: "SUMMER2024",
  userId: currentUser.id,
  orderAmount: cart.subtotal,
});

// 6. Đặt hàng
const order = await OrderService.createOrder({
  orderItems: cart.items.map((item) => ({
    productVariationId: item.productVariationId,
    quantity: item.quantity,
  })),
  shippingInfo: {
    /* thông tin giao hàng */
  },
  paymentInfo: { paymentMethod: "COD" },
  voucherCode: validation.isValid ? "SUMMER2024" : undefined,
});

// 7. Xóa giỏ hàng
await CartService.clearCart();

// 8. Chuyển đến trang theo dõi đơn hàng
router.push(`/account/orders/${order.id}`);
```

---

### 2. Flow đánh giá sản phẩm

```typescript
// 1. Kiểm tra đã đánh giá chưa
const myReview = await ReviewService.getMyReview(productId);

if (myReview) {
  // 2a. Nếu đã đánh giá -> Cập nhật
  await ReviewService.updateReview(productId, myReview.id, {
    rating: 5,
    content: "Sản phẩm tuyệt vời!",
  });
} else {
  // 2b. Chưa đánh giá -> Thêm mới
  await ReviewService.addReview(productId, {
    rating: 5,
    content: "Sản phẩm tuyệt vời!",
  });
}

// 3. Load lại đánh giá
const reviews = await ReviewService.getProductReviews(productId);
const summary = await ReviewService.getReviewSummary(productId);
```

---

### 3. Quản lý Wishlist

```typescript
// 1. Load wishlist
const wishlist = await WishlistService.getWishlist();

// 2. Toggle wishlist cho sản phẩm
const toggleWishlist = async (productId: number, inWishlist: boolean) => {
  if (inWishlist) {
    await WishlistService.removeFromWishlist(productId);
    toast.success("Đã xóa khỏi yêu thích");
  } else {
    await WishlistService.addToWishlist(productId);
    toast.success("Đã thêm vào yêu thích");
  }
  // Reload wishlist
  const updated = await WishlistService.getWishlist();
};
```

---

### 4. Theo dõi đơn hàng

```typescript
// 1. Lấy tất cả đơn hàng
const allOrders = await OrderService.getUserOrders(0, 20);

// 2. Lọc theo trạng thái
const pendingOrders = await OrderService.getUserOrdersByStatus("PENDING");
const shippingOrders = await OrderService.getUserOrdersByStatus("SHIPPING");
const deliveredOrders = await OrderService.getUserOrdersByStatus("DELIVERED");

// 3. Xem chi tiết đơn
const order = await OrderService.getOrderById(orderId);

// 4. Hủy đơn (nếu đang PENDING)
if (order.status === "PENDING") {
  await OrderService.cancelOrder(orderId);
  toast.success("Đã hủy đơn hàng");
}
```

---

### 5. Tư vấn qua AI Chatbot

```typescript
// Component sử dụng AI Chatbot
import { ChatPopup } from "@/components/chatbot/organisms/ChatPopup";

const App = () => {
  return (
    <div>
      {/* Nội dung trang */}
      <ProductList />

      {/* Floating chatbot button - tự động hiện */}
      <ChatPopup />
    </div>
  );
};

// Flow tư vấn:
// 1. User click vào chatbot icon
// 2. User: "Tôi muốn mua laptop gaming giá rẻ"
// 3. AI phân tích → gợi ý 3-5 sản phẩm phù hợp
// 4. Hiển thị ProductCard ngay trong chat
// 5. User click vào sản phẩm → chuyển đến trang chi tiết
```

---

### 6. Tìm kiếm thông minh với AI

```typescript
// Trang tìm kiếm AI
const AISearchPage = () => {
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState<"text" | "image">("text");
  const [results, setResults] = useState<Product[]>([]);

  const handleTextSearch = async () => {
    // 1. AI semantic search
    const searchResults = await SearchService.searchByText(query, 20);

    // 2. Fetch product details
    const spus = searchResults.map((r) => r.spu);
    const products = await ProductService.fetchProductsBySpus(spus);

    setResults(products);
  };

  const handleImageSearch = async (file: File) => {
    // 1. Upload ảnh và search
    const searchResults = await SearchService.searchByImage(file, 20);

    // 2. Fetch product details
    const spus = searchResults.map((r) => r.spu);
    const products = await ProductService.fetchProductsBySpus(spus);

    setResults(products);
  };

  return (
    <div>
      {/* Tab chọn search type */}
      <div className="tabs">
        <button onClick={() => setSearchType("text")}>Tìm bằng text</button>
        <button onClick={() => setSearchType("image")}>Tìm bằng ảnh</button>
      </div>

      {/* Input */}
      {searchType === "text" ? (
        <div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="VD: laptop mỏng nhẹ cho sinh viên"
          />
          <button onClick={handleTextSearch}>Tìm kiếm AI</button>
        </div>
      ) : (
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageSearch(file);
          }}
        />
      )}

      {/* Results */}
      <div className="grid grid-cols-4 gap-4">
        {results.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};
```

---

### 7. Gợi ý sản phẩm cá nhân hóa

```typescript
// Trang "Dành cho bạn" - Personalized recommendations
const ForYouPage = () => {
  const [recommendations, setRecommendations] = useState<Product[]>([]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      // 1. Lấy lịch sử xem/mua của user
      const recentSPUs = await OrderService.getRecentProductSpus(10);

      if (recentSPUs.length === 0) {
        // User mới → Gợi ý sản phẩm hot
        const hotProducts = await ProductService.getProducts({
          sortBy: "averageRating",
          sortDirection: "DESC",
          size: 10,
        });
        setRecommendations(hotProducts.content);
        return;
      }

      // 2. Gọi AI recommendations
      const aiResults = await SearchService.getRecommendations(recentSPUs, 10);

      // 3. Fetch full product info
      const spus = aiResults.map((r) => r.spu);
      const products = await ProductService.fetchProductsBySpus(spus);

      setRecommendations(products);
    };

    fetchRecommendations();
  }, []);

  return (
    <div>
      <h1>Dành cho bạn</h1>
      <p className="text-gray-600">Dựa trên lịch sử mua sắm của bạn</p>

      <div className="grid grid-cols-5 gap-4 mt-6">
        {recommendations.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};
```

---

## Xử lý lỗi

Tất cả API đều có thể throw error. Nên sử dụng try-catch:

```typescript
try {
  const product = await ProductService.getProductById(123);
  // Xử lý thành công
} catch (error: any) {
  // Xử lý lỗi
  if (error.response?.status === 404) {
    toast.error("Sản phẩm không tồn tại");
  } else if (error.response?.status === 401) {
    toast.error("Vui lòng đăng nhập");
    router.push("/login");
  } else {
    toast.error(error.message || "Có lỗi xảy ra");
  }
}
```

**Error types phổ biến:**

- `401 Unauthorized`: Chưa đăng nhập hoặc token hết hạn
- `403 Forbidden`: Không có quyền truy cập
- `404 Not Found`: Không tìm thấy resource
- `400 Bad Request`: Dữ liệu không hợp lệ
- `500 Internal Server Error`: Lỗi server

---

## Custom Hooks (Recommended)

Dự án có sẵn các custom hooks giúp quản lý data dễ dàng hơn:

### useProducts

```typescript
import { useProducts } from "@/hooks/useProduct";

const ProductList = () => {
  const { products, totalPages, isLoading, error } = useProducts({
    categoryId: 1,
    sortBy: "price",
    sortDirection: "ASC",
    page: 0,
    size: 20,
  });

  if (isLoading) return <Spinner />;
  if (error) return <Error />;

  return (
    <div>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
```

### useCart

```typescript
import { useCart } from "@/hooks/useCart";

const Cart = () => {
  const { cart, isLoading, error, refreshCart } = useCart();

  const handleAddItem = async (variationId: number, quantity: number) => {
    await CartService.addItem(variationId, quantity);
    refreshCart(); // Refresh lại cart
  };

  return (
    <div>
      <h2>Giỏ hàng ({cart?.itemCount || 0})</h2>
      {cart?.items.map((item) => (
        <CartItem key={item.productVariationId} item={item} />
      ))}
      <p>Tổng: {cart?.subtotal.toLocaleString("vi-VN")}đ</p>
    </div>
  );
};
```

### useWishlist

```typescript
import { useWishList } from "@/hooks/useWishList";

const Wishlist = () => {
  const { wishlist, isLoading, toggleWishlist } = useWishList();

  return (
    <div>
      {wishlist.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onToggleWishlist={() => toggleWishlist(product.id)}
        />
      ))}
    </div>
  );
};
```

---

## Tổng kết

### API Services chính:

1. **ProductService** - Xem, tìm kiếm sản phẩm
2. **CartService** - Quản lý giỏ hàng
3. **OrderService** - Đặt hàng, theo dõi đơn hàng
4. **WishlistService** - Danh sách yêu thích
5. **ReviewService** - Đánh giá sản phẩm
6. **voucherService** - Mã giảm giá
7. **userService** - Thông tin người dùng, địa chỉ

### Flow chính:

1. **Duyệt sản phẩm** → getProducts()
2. **Xem chi tiết** → getProductById()
3. **Thêm giỏ hàng** → CartService.addItem()
4. **Checkout** → OrderService.createOrder()
5. **Đánh giá** → ReviewService.addReview()

### Best Practices:

- Sử dụng custom hooks (useProducts, useCart, useWishlist)
- Luôn xử lý lỗi bằng try-catch
- Validate dữ liệu trước khi gửi API
- Sử dụng toast/notification để thông báo cho user
- Refresh data sau khi mutation (add, update, delete)

Tài liệu này cung cấp đầy đủ thông tin để khách hàng sử dụng TechBox Store một cách hiệu quả!
