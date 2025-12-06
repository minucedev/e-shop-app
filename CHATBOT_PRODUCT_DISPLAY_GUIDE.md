# 🛍️ Chatbot Product Display & Navigation Guide

## ✅ Tính năng đã được implement

Chatbot hiện đã hỗ trợ **hiển thị sản phẩm gợi ý trực tiếp trong chat** và cho phép người dùng **nhấn vào sản phẩm để xem chi tiết**.

---

## 🎯 Cách hoạt động

### 1. Flow hoàn chỉnh

```
User: "Tôi muốn mua laptop gaming dưới 20 triệu"
    ↓
AI xử lý câu hỏi → trả về:
{
  "answer": "Dựa trên ngân sách của bạn, tôi gợi ý...",
  "intent": "PRODUCT" hoặc "product_recommendation",
  "related_products": ["SPU001", "SPU002", "SPU003"]
}
    ↓
ChatContext tự động fetch product details:
    getProductsBySpus(["SPU001", "SPU002", "SPU003"])
    ↓
Backend trả về full product info:
[
  { id: 1, name: "Laptop Dell XPS", imageUrl: "...", price: 18000000, ... },
  { id: 2, name: "Laptop ASUS ROG", imageUrl: "...", price: 19500000, ... }
]
    ↓
MessageBubble hiển thị:
  - Câu trả lời text của AI
  - Header "Gợi ý sản phẩm (2)" với icon
  - ProductCarousel với 2 sản phẩm
    ↓
User nhấn vào product card
    ↓
Navigation: router.push("/(app)/(screens)/product-detail?id=1")
    ↓
Mở trang chi tiết sản phẩm
```

---

## 📱 Giao diện hiển thị

### MessageBubble Layout

```
┌─────────────────────────────────────────┐
│ 🤖 AI Assistant              10:30 AM  │
├─────────────────────────────────────────┤
│                                         │
│ Dựa trên ngân sách của bạn, tôi có thể │
│ gợi ý một số laptop gaming phù hợp:    │
│                                         │
├─────────────────────────────────────────┤
│ 🛒 Gợi ý sản phẩm (3)                  │
├─────────────────────────────────────────┤
│ ┌────────┐  ┌────────┐  ┌────────┐    │
│ │ [IMG]  │  │ [IMG]  │  │ [IMG]  │    │
│ │ Dell   │  │ ASUS   │  │ Lenovo │    │
│ │ XPS 13 │  │ ROG    │  │ Legion │    │
│ │ 18tr   │  │ 19.5tr │  │ 17tr   │    │
│ │ ⭐ 4.5 │  │ ⭐ 4.8 │  │ ⭐ 4.3 │    │
│ └────────┘  └────────┘  └────────┘    │
│      ↑ Có thể scroll ngang →          │
└─────────────────────────────────────────┘
```

### Product Card trong Carousel

```
┌──────────────────┐
│                  │
│  [Product Image] │ ← 160x160px
│    -15% badge    │ ← Discount badge (nếu có)
│                  │
├──────────────────┤
│ Product Name     │ ← 2 lines max
│                  │
├──────────────────┤
│ 18,000,000đ      │ ← Sale price (đỏ, bold)
│ 20,000,000đ      │ ← Original price (gạch ngang)
├──────────────────┤
│ ⭐ 4.5 • 120     │ ← Rating + số đánh giá
└──────────────────┘
      ↑ Touchable - Nhấn để xem chi tiết
```

---

## 🔧 Code Implementation

### 1. MessageBubble.tsx

```typescript
{/* Product Carousel - Hiển thị sản phẩm gợi ý */}
{!isUser && message.products && message.products.length > 0 && (
  <View style={styles.productsSection}>
    <View style={styles.productsHeader}>
      <Ionicons name="bag-handle-outline" size={16} color="#2563eb" />
      <Text style={styles.productsHeaderText}>
        Gợi ý sản phẩm ({message.products.length})
      </Text>
    </View>
    <ProductCarousel products={message.products} />
  </View>
)}
```

**Điều kiện hiển thị:**

- ✅ Không phải tin nhắn của user (`!isUser`)
- ✅ Message có field `products`
- ✅ Array products không rỗng (`length > 0`)

### 2. ProductCarousel.tsx

```typescript
const handleProductPress = (id: number) => {
  router.push(`/(app)/(screens)/product-detail?id=${id}`);
};

const renderProduct = ({ item }: { item: ProductApiResponse }) => {
  return (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => handleProductPress(item.id)}
      activeOpacity={0.7}
    >
      {/* Product Image */}
      <Image source={{ uri: item.imageUrl }} />

      {/* Discount Badge */}
      {hasDiscount && <Badge>-{item.discountValue}%</Badge>}

      {/* Product Info */}
      <Text>{item.name}</Text>
      <Text>{item.displaySalePrice}đ</Text>
      <Text>⭐ {item.averageRating}</Text>
    </TouchableOpacity>
  );
};
```

**Navigation:**

- Route: `/(app)/(screens)/product-detail`
- Param: `id={productId}`
- Example: `/(app)/(screens)/product-detail?id=123`

### 3. ChatContext.tsx

```typescript
// Fetch products khi AI trả về SPUs
const isProductIntent =
  response.intent === "PRODUCT" || response.intent === "product_recommendation";

if (isProductIntent && response.related_products?.length) {
  products = await fetchProductDetails(response.related_products);
}

// Add vào message
const aiMessage: ChatMessage = {
  id: `ai_${Date.now()}`,
  role: "assistant",
  content: response.answer,
  timestamp: Date.now(),
  intent: response.intent,
  products, // ← Sản phẩm đã fetch
  src: response.src,
};
```

---

## 🧪 Testing Guide

### Test Case 1: Product Recommendation

**Bước 1:** Mở chatbot (click floating button)

**Bước 2:** Gửi câu hỏi:

```
"Tôi muốn mua laptop gaming dưới 20 triệu"
```

**Kết quả mong đợi:**

- ✅ AI trả lời text
- ✅ Hiển thị header "Gợi ý sản phẩm (N)"
- ✅ ProductCarousel với các sản phẩm phù hợp
- ✅ Mỗi card hiển thị: ảnh, tên, giá, rating

**Bước 3:** Nhấn vào một product card

**Kết quả mong đợi:**

- ✅ Navigate đến trang chi tiết sản phẩm
- ✅ Trang chi tiết load đúng sản phẩm (theo ID)
- ✅ Chat modal tự đóng (nếu cần)

### Test Case 2: Multiple Products

**Câu hỏi:**

```
"So sánh laptop Dell và ASUS trong tầm giá 15-25 triệu"
```

**Kết quả mong đợi:**

- ✅ AI response với nhiều sản phẩm (Dell + ASUS)
- ✅ Carousel scroll được ngang
- ✅ Tất cả cards đều nhấn được

### Test Case 3: No Products

**Câu hỏi:**

```
"Chính sách bảo hành của bạn như thế nào?"
```

**Kết quả mong đợi:**

- ✅ AI trả lời về chính sách
- ✅ KHÔNG hiển thị ProductCarousel
- ✅ Intent = "POLICY", có field `src`

### Test Case 4: Backend Error

**Scenario:** Backend `/products/by-spus` trả về lỗi

**Kết quả mong đợi:**

- ✅ Console warning: "Products API not available"
- ✅ Message vẫn hiển thị câu trả lời text
- ✅ KHÔNG hiển thị carousel (products = [])
- ✅ App không crash

---

## 📊 Console Logs khi hoạt động

### Successful Flow

```javascript
🤖 [ChatbotAPI] Sending message: {
  question: "laptop gaming dưới 20 triệu",
  historyLength: 0
}

✅ [ChatbotAPI] Response: {
  intent: "product_recommendation",
  productsCount: 3,
  hasSrc: false,
  debugQuery: "laptop gaming price < 20000000"
}

🔍 [ChatContext] Fetching products: ["LAP001", "LAP002", "LAP003"]

📦 [productApi] Fetching products by SPUs: ["LAP001", "LAP002", "LAP003"]

✅ API Response [200]: {
  endpoint: "/products/by-spus",
  method: "POST",
  status: 200,
  dataType: "object",
  dataKeys: ["content", "totalElements", ...],
  fullData: { content: [...], ... }
}

✅ [productApi] Products by SPUs loaded: 3 products

✅ [ChatContext] Fetched 3 products

📦 [ChatContext] Product details: [
  { id: 1, name: "Dell XPS 13" },
  { id: 2, name: "ASUS ROG Strix" },
  { id: 3, name: "Lenovo Legion" }
]

💾 [ChatContext] Saved history: 2 messages
```

### Error Handling

```javascript
❌ API Error Response: {
  status: 500,
  endpoint: "/products/by-spus",
  data: { error: "Internal Server Error" }
}

⚠️ [productApi] /products/by-spus endpoint not available: An unexpected error occurred

⚠️ [ChatContext] Products API not available: An unexpected error occurred

💡 [ChatContext] Returning empty products array (endpoint not implemented)

✅ [ChatContext] Fetched 0 products
// Message vẫn hiển thị nhưng không có carousel
```

---

## 🎨 Styling Details

### Product Section Styles

```typescript
productsSection: {
  marginTop: 12,        // Space from message bubble
  width: "100%",        // Full width
}

productsHeader: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 8,
  paddingHorizontal: 4,
}

productsHeaderText: {
  fontSize: 13,
  fontWeight: "600",
  color: "#2563eb",     // Blue color
  marginLeft: 6,
}
```

### Product Card Styles

```typescript
productCard: {
  width: 160,           // Fixed width
  backgroundColor: "white",
  borderRadius: 12,
  overflow: "hidden",
  borderWidth: 1,
  borderColor: "#E5E7EB",
}

imageContainer: {
  width: "100%",
  height: 160,          // Square image
  backgroundColor: "#F3F4F6",
}

discountBadge: {
  position: "absolute",
  top: 8,
  right: 8,
  backgroundColor: "#EF4444",  // Red badge
  paddingHorizontal: 6,
  paddingVertical: 3,
  borderRadius: 6,
}
```

---

## 🔍 Debugging Tips

### 1. Sản phẩm không hiển thị

**Check:**

```javascript
// 1. Kiểm tra intent
console.log("Intent:", message.intent);
// Phải là "PRODUCT" hoặc "product_recommendation"

// 2. Kiểm tra products array
console.log("Products:", message.products);
// Phải có length > 0

// 3. Kiểm tra API response
console.log("Related products:", response.related_products);
// Phải có SPU codes
```

### 2. Navigation không hoạt động

**Check:**

```javascript
// 1. Verify router
console.log("Router:", router);

// 2. Check product ID
console.log("Navigating to product:", item.id);

// 3. Verify route exists
// Route: app/(app)/(screens)/product-detail.tsx
```

### 3. Images không load

**Check:**

```javascript
// 1. Verify imageUrl
console.log("Image URL:", item.imageUrl);

// 2. Check placeholder
// Fallback: "https://via.placeholder.com/160"

// 3. Test image format
// Support: PNG, JPG, JPEG
```

---

## 📝 Best Practices

### 1. Performance

- ✅ Limit products per response (5-10 max)
- ✅ Use FlatList for carousel (optimized rendering)
- ✅ Cache product images
- ✅ Lazy load images với placeholder

### 2. UX

- ✅ Hiển thị header rõ ràng "Gợi ý sản phẩm"
- ✅ Show product count trong header
- ✅ activeOpacity={0.7} cho feedback khi tap
- ✅ Scroll horizontal smooth với showsHorizontalScrollIndicator={false}

### 3. Error Handling

- ✅ Graceful fallback khi API fails
- ✅ Log errors nhưng không crash app
- ✅ Show text answer ngay cả khi không có products
- ✅ Placeholder image cho missing images

---

## 🚀 Future Enhancements

### 1. Advanced Features

- [ ] "Add to Cart" button trực tiếp trong card
- [ ] Quick view modal (không cần navigate)
- [ ] Swipe gesture để xóa sản phẩm
- [ ] Bookmark sản phẩm từ chat

### 2. Analytics

- [ ] Track product click-through rate
- [ ] Log popular recommended products
- [ ] A/B test different carousel layouts

### 3. Personalization

- [ ] Show "Recently viewed" badge
- [ ] Highlight products in wishlist
- [ ] Price alerts for recommended products

---

## ✅ Summary

**Tính năng đã hoàn thành:**

- ✅ Hiển thị sản phẩm trong chatbot
- ✅ Navigation đến trang chi tiết khi tap
- ✅ ProductCarousel với horizontal scroll
- ✅ Discount badge, rating, price display
- ✅ Error handling graceful
- ✅ Logging đầy đủ để debug

**Cách sử dụng:**

1. Hỏi chatbot về sản phẩm
2. AI trả về gợi ý + SPU codes
3. App tự động fetch product details
4. Hiển thị carousel trong chat
5. Tap vào product → Mở trang chi tiết

**Test ngay:**

```
Mở chatbot → Gõ "laptop gaming dưới 20 triệu" → Xem sản phẩm → Tap vào → Chi tiết ✅
```

---

**Last Updated:** December 6, 2025  
**Status:** ✅ Fully Implemented & Ready to Use
