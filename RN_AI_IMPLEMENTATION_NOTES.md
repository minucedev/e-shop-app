# React Native AI Implementation Notes

## Overview

This document explains how the AI features documented in `AI_AND_PRODUCT_API_GUIDE.md` (web app) have been adapted for the **React Native (Expo)** mobile application.

---

## 1. Architecture Differences: Web vs React Native

### 1.1. Platform Adaptations

| Feature              | Web App (Next.js)      | React Native (Expo)                                     | Status                 |
| -------------------- | ---------------------- | ------------------------------------------------------- | ---------------------- |
| **Storage**          | `localStorage`         | `AsyncStorage`                                          | ✅ Implemented         |
| **Routing**          | Next.js router         | Expo Router                                             | ✅ Implemented         |
| **Navigation**       | `router.push('/path')` | `router.push('/(app)/(screens)/product-detail?id=123')` | ✅ Implemented         |
| **State Management** | React Context          | React Context                                           | ✅ Implemented         |
| **File Upload**      | `<input type="file">`  | `expo-image-picker`                                     | ❌ Not Yet Implemented |
| **HTTP Client**      | `axios`                | Custom `apiClient` with platform detection              | ✅ Implemented         |

### 1.2. API Endpoint Mapping

All AI endpoints use the `/aiproxy` prefix as documented:

| Endpoint                     | Purpose                      | Status     |
| ---------------------------- | ---------------------------- | ---------- |
| `POST /aiproxy/chat`         | AI Chatbot                   | ✅ Updated |
| `POST /aiproxy/search/text`  | Semantic text search         | ⏳ Planned |
| `POST /aiproxy/search/image` | Visual image search          | ⏳ Planned |
| `POST /aiproxy/recommend`    | Personalized recommendations | ⏳ Planned |

### 1.3. Backend Product API

| Endpoint                | Purpose                           | Status                                 |
| ----------------------- | --------------------------------- | -------------------------------------- |
| `GET /products/by-spus` | Batch fetch products by SPU codes | ❌ Backend Not Implemented (500 error) |
| `GET /products/{id}`    | Single product fetch              | ✅ Working                             |

**Current Workaround**: Since `GET /products/by-spus` is not implemented, we extract numeric IDs from SPU strings and fetch products individually in parallel.

---

## 2. Implemented Features

### 2.1. AI Chatbot ✅

**Files**:

- `services/chatbotApi.ts` - API layer for AI communication
- `contexts/ChatContext.tsx` - Global chat state with AsyncStorage
- `components/Chatbot/*` - 8 UI components (Button, Modal, Header, Input, etc.)

**Key Features**:

- ✅ Chat with AI assistant
- ✅ Context-aware conversations (10 message history)
- ✅ Product recommendations display (carousel)
- ✅ Persistent chat history (AsyncStorage)
- ✅ Intent handling (PRODUCT, product_recommendation, POLICY, CHITCHAT)
- ✅ Navigation to product detail on tap
- ✅ Error handling (graceful degradation)

**Data Flow**:

```
User Input
    ↓
ChatContext.sendMessage()
    ↓
chatbotApi.sendChatMessage() → POST /aiproxy/chat
    ↓
AI Response { answer, intent, related_products: ["LAP001", ...] }
    ↓
ChatContext.fetchProductDetails()
    ↓
productApi.getProductsBySpus() → WORKAROUND (extract IDs → parallel fetch)
    ↓
Display MessageBubble + ProductCarousel
```

**Endpoint**: `POST /aiproxy/chat`

**Request**:

```typescript
{
  question: "Tôi muốn mua laptop gaming",
  history: [
    { role: "user", content: "..." },
    { role: "assistant", content: "..." }
  ]
}
```

**Response**:

```typescript
{
  answer: "Chào bạn! Bên mình có...",
  intent: "product_recommendation",
  related_products: ["LAP001", "LAP002", "LAP003"],
  debug_query?: "laptop gaming"
}
```

**SPU → Product Details Workaround**:

Since `GET /products/by-spus` is not implemented, we use this workaround:

```typescript
// services/productApi.ts
export const getProductsBySpus = async (
  spus: string[]
): Promise<ProductApiResponse[]> => {
  // Extract numeric IDs from SPU strings
  // Patterns: "123", "LAP-456", "SKU_789" → [123, 456, 789]
  const ids = spus
    .map((spu) => {
      const match = spu.match(/\d+/);
      return match ? parseInt(match[0], 10) : null;
    })
    .filter((id): id is number => id !== null);

  // Fetch in parallel
  const results = await Promise.allSettled(
    ids.map((id) => getProductDetail(id))
  );

  return results
    .filter(
      (r): r is PromiseFulfilledResult<ProductApiResponse> =>
        r.status === "fulfilled"
    )
    .map((r) => r.value);
};
```

**Limitations**:

- ❌ N+1 problem (one API call per product)
- ❌ Requires SPU codes to contain numeric IDs
- ❌ Slower than batch endpoint

**Future**: When backend implements `GET /products/by-spus`, replace workaround:

```typescript
// Future implementation (when backend ready)
const response = await apiClient.get("/products/by-spus", {
  params: { spus: spus, size: spus.length },
  paramsSerializer: (params) => qs.stringify(params, { arrayFormat: "repeat" }),
});
```

### 2.2. Product Display in Chat ✅

**Component**: `components/Chatbot/ProductCarousel.tsx`

**Features**:

- ✅ Horizontal scrollable product cards
- ✅ Product info: image, name, price, rating, discount badge
- ✅ Navigation to detail page on tap: `router.push('/(app)/(screens)/product-detail?id=123')`
- ✅ Responsive design (160px card width)

**Usage**:

```tsx
// components/Chatbot/MessageBubble.tsx
{
  message.products && message.products.length > 0 && (
    <View style={styles.productsSection}>
      <View style={styles.productsHeader}>
        <Ionicons name="bag-outline" size={16} color="#2563eb" />
        <Text style={styles.productsHeaderText}>
          Gợi ý sản phẩm ({message.products.length})
        </Text>
      </View>
      <ProductCarousel products={message.products} />
    </View>
  );
}
```

---

## 3. Planned Features (Not Yet Implemented)

### 3.1. Text Search (Semantic Search) ⏳

**Endpoint**: `POST /aiproxy/search/text`

**Request**:

```typescript
{
  query: "laptop gaming dưới 20 triệu",
  top_k: 20
}
```

**Response**:

```typescript
{
  status: "success",
  data: [
    { spu: "LAP001", score: 0.95 },
    { spu: "LAP002", score: 0.89 }
  ]
}
```

**Implementation Plan**:

1. Create `services/searchApi.ts` with `searchByText()` function
2. Add search icon to header or create dedicated search screen
3. Display results in product list with "Search Results" title
4. Navigate to results: `router.push('/(app)/(tabs)/search?query=...')`

**React Native Considerations**:

- Use `TextInput` component for query input
- Consider using modal or dedicated screen for search
- Handle empty results gracefully

### 3.2. Image Search (Visual Search) ⏳

**Endpoint**: `POST /aiproxy/search/image`

**Request**: `multipart/form-data`

```
file: <image_file>
top_k: 20
```

**Response**: Same as text search

**Implementation Plan**:

1. Install `expo-image-picker`: `npx expo install expo-image-picker`
2. Create image picker UI with camera/gallery options
3. Upload image as FormData
4. Display similar products

**React Native Implementation**:

```typescript
import * as ImagePicker from "expo-image-picker";

const pickImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.8,
  });

  if (!result.canceled) {
    const formData = new FormData();
    formData.append("file", {
      uri: result.assets[0].uri,
      type: "image/jpeg",
      name: "search.jpg",
    } as any);

    // Upload and search
    const results = await searchByImage(formData);
  }
};
```

### 3.3. Personalized Recommendations ⏳

**Endpoint**: `POST /aiproxy/recommend`

**Request**:

```typescript
{
  spus: ["LAP001", "LAP002", "LAP003"],
  top_k: 10
}
```

**Response**: Same as search endpoints

**Use Cases**:

1. **Home Screen**: "Gợi ý cho bạn" section based on order history
2. **Product Detail**: "Sản phẩm tương tự" based on current product + order history

**Implementation Plan**:

1. Create `orderApi.getRecentProductSpus()` to fetch user's purchase history
2. Combine current product SPU + recent SPUs
3. Call `/aiproxy/recommend` endpoint
4. Display in horizontal carousel

**Data Flow**:

```
Page Load
    ↓
Get Recent SPUs from Orders: GET /orders/recent-products-spus?k=10
    ↓
Add Current Product SPU (if on detail page)
    ↓
Call AI Recommendation: POST /aiproxy/recommend
    ↓
Fetch Product Details: GET /products/by-spus (or workaround)
    ↓
Display Recommendations
```

---

## 4. API Configuration

### 4.1. Service Ports

| Service      | Port | Environment            |
| ------------ | ---- | ---------------------- |
| Main Backend | 8081 | `http://{IP}:8081/api` |
| AI Service   | 8005 | `http://{IP}:8005`     |

**Platform-specific URLs**:

- **Expo Go**: Use device IP (e.g., `http://192.168.1.100:8005`)
- **Android Emulator**: Use `http://10.0.2.2:8005`
- **iOS Simulator**: Use `http://localhost:8005`

**Configuration**:

```typescript
// services/apiClient.ts

export const getAiApiBaseUrl = (): string => {
  if (Platform.OS === "android") {
    if (__DEV__) {
      return "http://10.0.2.2:8005"; // Android Emulator
    }
    return Constants.expoConfig?.extra?.AI_API_URL || "http://10.0.2.2:8005";
  }

  return Constants.expoConfig?.extra?.AI_API_URL || "http://localhost:8005";
};
```

### 4.2. Error Handling

**Graceful Degradation**:

- If AI service is down → Show error message, don't crash
- If product fetch fails → Show text answer only, hide product carousel
- If AsyncStorage fails → Continue without persistence

**Logging**:

```typescript
// All API calls log:
console.log("🤖 [ChatbotAPI] Sending message:", { question, historyLength });
console.log("✅ [ChatbotAPI] Response:", { intent, productsCount });
console.log("📦 [ProductAPI] Fetching SPUs:", spus);
console.log("✅ [ProductAPI] Fetched products:", products.length);
```

---

## 5. Storage and State Management

### 5.1. AsyncStorage

**Chat History Key**: `@techbox_chat_history`

**Data Structure**:

```typescript
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  intent?: string;
  products?: ProductApiResponse[];
  src?: string;
}
```

**Auto-save on Changes**:

```typescript
useEffect(() => {
  if (messages.length > 0) {
    AsyncStorage.setItem("@techbox_chat_history", JSON.stringify(messages));
  }
}, [messages]);
```

**Load on Mount**:

```typescript
useEffect(() => {
  const loadHistory = async () => {
    const saved = await AsyncStorage.getItem("@techbox_chat_history");
    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      // Show welcome message
    }
  };
  loadHistory();
}, []);
```

### 5.2. React Context

**ChatContext** provides:

```typescript
interface ChatContextType {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  isChatOpen: boolean;
  sendMessage: (question: string) => Promise<void>;
  clearChat: () => void;
  retryLastMessage: () => Promise<void>;
  setChatOpen: (open: boolean) => void;
}
```

**Usage in Components**:

```tsx
const { messages, sendMessage, isChatOpen, setChatOpen } = useChatContext();
```

---

## 6. Navigation Patterns

### 6.1. Expo Router Structure

```
app/
  _layout.tsx              → ChatProvider wrapper
  (app)/
    _layout.tsx            → ChatButton + ChatModal integration
    (screens)/
      product-detail.tsx   → Product detail page
    (tabs)/
      home.tsx             → Home with recommendations (future)
      search.tsx           → Search results (future)
```

### 6.2. Navigation Examples

**From Chat to Product Detail**:

```tsx
// components/Chatbot/ProductCarousel.tsx
const handleProductPress = (id: number) => {
  router.push(`/(app)/(screens)/product-detail?id=${id}`);
};
```

**Open Chat Modal**:

```tsx
// Any screen
const { setChatOpen } = useChatContext();

<TouchableOpacity onPress={() => setChatOpen(true)}>
  <Text>Open Chat</Text>
</TouchableOpacity>;
```

---

## 7. Testing Checklist

### 7.1. AI Chatbot ✅

- [x] Send message and receive AI response
- [x] Display product recommendations in carousel
- [x] Navigate to product detail on card tap
- [x] Chat history persists across app restarts
- [x] Clear chat removes AsyncStorage data
- [x] Error handling when AI service is down
- [x] Intent handling (PRODUCT, POLICY, CHITCHAT)

### 7.2. Product API Workaround ✅

- [x] Extract numeric IDs from SPU strings
- [x] Fetch products in parallel
- [x] Handle missing/invalid SPU codes
- [x] Log SPUs → IDs → products

### 7.3. Future Features ⏳

- [ ] Text search with query input
- [ ] Image search with image picker
- [ ] Personalized recommendations on home
- [ ] "Similar products" on product detail
- [ ] Replace workaround when backend ready

---

## 8. Backend Requirements

### 8.1. Pending Implementation

**Critical**: `GET /products/by-spus`

**Request**:

```
GET /products/by-spus?spus=LAP001&spus=LAP002&spus=LAP003&size=10
```

**Response**:

```json
{
  "content": [
    {
      "id": 123,
      "name": "Laptop Gaming ABC",
      "salePrice": 20000000
      // ... other product fields
    }
  ],
  "totalElements": 3,
  "totalPages": 1
}
```

**Impact**: Will eliminate N+1 problem and improve performance significantly.

### 8.2. Order History API

**For Recommendations**: `GET /orders/recent-products-spus?k=10`

**Response**:

```json
["LAP001", "LAP002", "MOUSE03", ...]
```

---

## 9. Documentation

- **`AI_CHATBOT_IMPLEMENTATION.md`** - Complete chatbot implementation guide
- **`CHATBOT_PRODUCT_DISPLAY_GUIDE.md`** - Product display in chat
- **`BACKEND_API_REQUIREMENTS.md`** - Backend endpoint specifications
- **`AI_AND_PRODUCT_API_GUIDE.md`** - Web app AI features (reference)
- **`RN_AI_IMPLEMENTATION_NOTES.md`** - This document (React Native adaptations)

---

## 10. Summary

### What's Working ✅

- AI Chatbot with context-aware conversations
- Product recommendations display in chat
- Navigation to product details
- Persistent chat history (AsyncStorage)
- Multi-intent support (PRODUCT, POLICY, CHITCHAT)
- Error handling and logging
- Platform-aware API configuration

### What's Pending ⏳

- Text search (semantic)
- Image search (visual)
- Personalized recommendations
- Backend batch product endpoint
- Order history integration

### Key Differences from Web App

- AsyncStorage vs localStorage
- Expo Router vs Next.js router
- Image picker vs file input
- Platform-specific API URLs (Android emulator support)
- Workaround for missing batch endpoint

### Next Steps

1. Test chatbot with real AI backend (port 8005)
2. Implement text search feature
3. Implement image search with expo-image-picker
4. Add personalized recommendations to home screen
5. Coordinate with backend team on `/products/by-spus` implementation
6. Replace workaround when backend is ready
