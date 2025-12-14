# Tài liệu sử dụng AI và Product API - TechBox Store

## Mục lục

1. [Tổng quan về AI trong TechBox](#1-tổng-quan-về-ai-trong-techbox)
2. [AI Chatbot](#2-ai-chatbot)
3. [AI Search - Tìm kiếm thông minh](#3-ai-search---tìm-kiếm-thông-minh)
4. [AI Recommendation - Gợi ý cá nhân hóa](#4-ai-recommendation---gợi-ý-cá-nhân-hóa)
5. [Product API](#5-product-api)
6. [Kiến trúc và Data Flow](#6-kiến-trúc-và-data-flow)

---

## 1. Tổng quan về AI trong TechBox

TechBox Store tích hợp **3 tính năng AI chính** để nâng cao trải nghiệm người dùng:

### 1.1. AI Chatbot

- **Mô tả**: Trợ lý ảo thông minh hỗ trợ tư vấn sản phẩm 24/7
- **Vị trí**: Popup ở góc phải màn hình (shop layout)
- **Công nghệ**: Natural Language Processing (NLP)
- **Tính năng**: Trả lời câu hỏi, gợi ý sản phẩm phù hợp

### 1.2. AI Search (Tìm kiếm thông minh)

- **Tìm kiếm bằng văn bản**: Semantic search - hiểu ý nghĩa thay vì chỉ khớp từ khóa
- **Tìm kiếm bằng hình ảnh**: Visual search - tìm sản phẩm tương tự qua ảnh
- **Vị trí**: Header navigation bar

### 1.3. AI Recommendation (Gợi ý cá nhân hóa)

- **Mô tả**: Gợi ý sản phẩm dựa trên lịch sử mua hàng và hành vi người dùng
- **Vị trí**: Trang chủ, trang chi tiết sản phẩm
- **Công nghệ**: Collaborative Filtering + Content-based Filtering

---

## 2. AI Chatbot

### 2.1. Tổng quan

AI Chatbot là trợ lý ảo thông minh giúp người dùng:

- Tìm hiểu về sản phẩm
- Nhận tư vấn chọn sản phẩm phù hợp
- Giải đáp thắc mắc nhanh chóng
- Nhận gợi ý sản phẩm cụ thể

### 2.2. Cách sử dụng

#### Bước 1: Mở Chatbot

- Click vào icon chatbot ở góc phải dưới màn hình
- Popup chat sẽ hiện lên với giao diện thân thiện

#### Bước 2: Đặt câu hỏi

Bạn có thể hỏi các dạng câu hỏi như:

```
- "Tôi muốn mua laptop gaming dưới 20 triệu"
- "Laptop nào có màn hình 15 inch và card đồ họa mạnh?"
- "So sánh laptop Dell và Asus"
- "Laptop phù hợp cho sinh viên IT"
```

#### Bước 3: Nhận gợi ý sản phẩm

- Chatbot sẽ phân tích câu hỏi và trả lời
- Nếu có sản phẩm phù hợp, chatbot hiển thị danh sách sản phẩm dạng card
- Click vào card để xem chi tiết sản phẩm

#### Bước 4: Tiếp tục hội thoại

- Lịch sử chat được lưu trong trình duyệt
- Có thể hỏi tiếp để nhận thêm thông tin
- Click "New Chat" để bắt đầu cuộc trò chuyện mới

### 2.3. API Endpoint

**Endpoint**: `POST /aiproxy/chat`

**Request Body**:

```json
{
  "question": "Tôi muốn mua laptop gaming dưới 20 triệu",
  "history": [
    {
      "role": "user",
      "content": "Câu hỏi trước đó"
    },
    {
      "role": "assistant",
      "content": "Câu trả lời trước đó"
    }
  ]
}
```

**Response**:

```json
{
  "answer": "Dựa trên ngân sách của bạn, tôi có thể gợi ý...",
  "intent": "product_recommendation",
  "related_products": ["LAP001", "LAP002", "LAP003"],
  "src": "product_database",
  "debug_query": "laptop gaming price < 20000000"
}
```

### 2.4. Cấu trúc code

#### Service Layer

**File**: `src/services/chatbotService.ts`

```typescript
export async function sendChatMessage(
  question: string,
  history: ChatRequest["history"]
): Promise<ChatResponse> {
  const response = await axios.post<ChatResponse>(CHAT_ENDPOINT, {
    question,
    history,
  });
  return response.data;
}
```

#### Custom Hook

**File**: `src/hooks/useChatbot.ts`

```typescript
export function useChatbot() {
  const [state, setState] = useState<ChatbotState>({
    messages: [],
    isLoading: false,
    error: null,
  });

  const sendMessage = async (question: string) => {
    // 1. Add user message
    // 2. Call API with history (last 10 messages)
    // 3. Fetch product details if SPUs are returned
    // 4. Add AI response with products
    // 5. Save to localStorage
  };

  return { messages, isLoading, error, sendMessage, clearHistory };
}
```

#### Components

```
src/components/chatbot/
├── atoms/
│   ├── ChatInput.tsx          # Input box cho tin nhắn
│   ├── ChatMessage.tsx        # Hiển thị 1 tin nhắn
│   └── LoadingIndicator.tsx   # Animation loading
├── molecules/
│   ├── ChatHeader.tsx         # Header với nút close, new chat
│   ├── MessageList.tsx        # List tất cả messages
│   └── ProductSuggestionList.tsx  # Hiển thị danh sách sản phẩm gợi ý
├── organisms/
│   ├── ChatPopup.tsx          # Nút mở chatbot
│   └── ChatWindow.tsx         # Cửa sổ chat chính
├── types.ts                   # TypeScript interfaces
└── chatbot.css               # Custom styles
```

### 2.5. Data Flow

```
User Input
    ↓
ChatInput → useChatbot.sendMessage()
    ↓
chatbotService.sendChatMessage() → POST /aiproxy/chat
    ↓
Backend AI Processing
    ↓
Response { answer, related_products: ["SPU001", "SPU002"] }
    ↓
ProductService.fetchProductsBySpus() → GET /products/by-spus
    ↓
Merge AI answer + product details
    ↓
Update UI (MessageList + ProductSuggestionList)
    ↓
Save to localStorage
```

### 2.6. Tính năng nâng cao

1. **Persistent Chat History**
   - Lưu lịch sử chat trong localStorage
   - Tự động load khi người dùng quay lại
   - Key: `techbox_chat_history`

2. **Context-aware Conversation**
   - Gửi 10 tin nhắn gần nhất làm context
   - AI hiểu được ngữ cảnh cuộc trò chuyện
   - Trả lời chính xác hơn

3. **Product Cards Integration**
   - Hiển thị sản phẩm dạng card đẹp mắt
   - Có giá, rating, hình ảnh
   - Click để xem chi tiết hoặc thêm vào giỏ

4. **Error Handling**
   - Xử lý lỗi network gracefully
   - Hiển thị thông báo lỗi thân thiện
   - Không làm crash ứng dụng

---

## 3. AI Search - Tìm kiếm thông minh

### 3.1. Text Search (Semantic Search)

#### Mô tả

Tìm kiếm sản phẩm dựa trên **ý nghĩa ngữ nghĩa** thay vì chỉ khớp từ khóa chính xác.

**Ví dụ**:

- Query: "máy tính xách tay cho game thủ"
- Kết quả: Laptop gaming (mặc dù không có từ "laptop" trong query)

#### Cách sử dụng

1. Click icon "Text Search" (biểu tượng chữ) trên header
2. Nhập mô tả sản phẩm muốn tìm
   ```
   VD: "Laptop gaming dưới 20 triệu, màn hình 15 inch, card RTX"
   ```
3. Click "Tìm kiếm"
4. Hệ thống chuyển đến trang kết quả với các sản phẩm phù hợp

#### API Endpoint

**Endpoint**: `POST /aiproxy/search/text`

**Request**:

```json
{
  "query": "laptop gaming dưới 20 triệu",
  "top_k": 20
}
```

**Response**:

```json
{
  "status": "success",
  "data": [
    {
      "spu": "LAP001",
      "score": 0.95
    },
    {
      "spu": "LAP002",
      "score": 0.89
    }
  ]
}
```

#### Code Implementation

**File**: `src/services/searchService.ts`

```typescript
static async searchByText(query: string, topK: number = 20): Promise<SearchResult[]> {
    try {
        const response = await axios.post<SearchResponse>(TEXT_SEARCH_ENDPOINT, {
            query,
            top_k: topK,
        });
        return response.data.data || [];
    } catch (error) {
        console.error('[SearchService] Error searching by text:', error);
        return [];
    }
}
```

**File**: `src/components/search/SearchTextModal.tsx`

```typescript
const handleSearch = async () => {
  const results = await SearchService.searchByText(query, 20);

  if (results.length > 0) {
    const spus = results.map((r) => r.spu).join(",");
    router.push(`/products/all?search_type=text&query=${query}&spus=${spus}`);
  }
};
```

### 3.2. Image Search (Visual Search)

#### Mô tả

Tìm kiếm sản phẩm **tương tự** bằng cách upload hình ảnh. Sử dụng **Computer Vision** và **Deep Learning** để phân tích đặc điểm hình ảnh và tìm sản phẩm có ngoại hình giống nhau.

**Công nghệ:**

- **CNN (Convolutional Neural Networks)**: Trích xuất đặc trưng hình ảnh
- **Vector Similarity Search**: So sánh độ tương đồng giữa các ảnh
- **Image Embedding**: Chuyển ảnh thành vector để so sánh
- **FAISS**: Fast approximate nearest neighbor search

**Use Cases:**

- 📸 User chụp ảnh sản phẩm trong cửa hàng để tìm giá online
- 🖼️ Upload ảnh từ mạng xã hội để tìm sản phẩm tương tự
- 🔍 So sánh nhiều sản phẩm có thiết kế giống nhau
- 🛒 "Tìm sản phẩm giống cái này" shopping experience

#### Cách sử dụng trên Web

1. Click icon "Image Search" (biểu tượng ảnh) trên header
2. Upload hình ảnh sản phẩm:
   - **Click để chọn file** từ máy tính/điện thoại
   - **Kéo thả (Drag & Drop)** file vào vùng upload (chỉ web)
   - **Paste từ clipboard** (Ctrl+V trên web)
3. Preview hình ảnh đã chọn
4. Click "Tìm kiếm"
5. Xem kết quả sản phẩm tương tự (sắp xếp theo score cao nhất)

#### API Endpoint

**Endpoint**: `POST /aiproxy/search/image`

**Request**: `multipart/form-data`

```
file: <image_file>
top_k: 20
```

**Response**:

```json
{
  "status": "success",
  "data": [
    {
      "spu": "LAP001",
      "score": 0.92
    },
    {
      "spu": "LAP003",
      "score": 0.88
    }
  ]
}
```

#### Code Implementation

**File**: `src/services/searchService.ts`

```typescript
static async searchByImage(file: File, topK: number = 20): Promise<SearchResult[]> {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('top_k', topK.toString());

        const response = await axios.post<SearchResponse>(IMAGE_SEARCH_ENDPOINT, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data.data || [];
    } catch (error) {
        console.error('[SearchService] Error searching by image:', error);
        return [];
    }
}
```

**File**: `src/components/search/SearchImageModal.tsx`

```typescript
const handleSearch = async () => {
  if (!selectedFile) return;

  const results = await SearchService.searchByImage(selectedFile, 20);

  if (results.length > 0) {
    const spus = results.map((r) => r.spu).join(",");
    router.push(`/products/all?search_type=image&spus=${spus}`);
  }
};
```

#### Features

1. **Drag & Drop Upload (Web)**
   - Kéo thả file ảnh vào vùng upload
   - Hỗ trợ PNG, JPG, JPEG, WebP
   - Smooth animation khi drag over
   - Visual feedback khi drop

2. **Image Preview**
   - Xem trước ảnh đã chọn ngay lập tức
   - Responsive preview (fit to container)
   - Có nút xóa để chọn lại
   - Show file name và size

3. **File Validation**
   - Chỉ chấp nhận file hình ảnh (image/\*)
   - Giới hạn kích thước: **10MB**
   - Auto reject nếu không hợp lệ
   - Show error message rõ ràng

4. **Loading States**
   - Progress indicator khi upload
   - Disable button khi đang xử lý
   - Prevent duplicate submissions
   - Smooth transition animations

5. **Multi-source Support**
   - 💻 Upload từ máy tính
   - 📱 Chụp ảnh từ camera (mobile)
   - 📋 Paste from clipboard (web)
   - 🔗 Upload từ URL (future)

### 3.3. Header Integration

**File**: `src/components/Header.tsx`

```tsx
export default function Header() {
  const [isTextSearchOpen, setIsTextSearchOpen] = useState(false);
  const [isImageSearchOpen, setIsImageSearchOpen] = useState(false);

  return (
    <header>
      {/* AI Search Buttons */}
      <Button onClick={() => setIsTextSearchOpen(true)}>
        <img src="/search_text.png" alt="Text Search" />
      </Button>

      <Button onClick={() => setIsImageSearchOpen(true)}>
        <img src="/search_img.png" alt="Image Search" />
      </Button>

      {/* Modals */}
      <SearchTextModal isOpen={isTextSearchOpen} onClose={...} />
      <SearchImageModal isOpen={isImageSearchOpen} onClose={...} />
    </header>
  );
}
```

---

## 4. AI Recommendation - Gợi ý cá nhân hóa

### 4.1. Tổng quan

AI Recommendation giúp người dùng khám phá sản phẩm phù hợp dựa trên:

- **Lịch sử mua hàng**: Sản phẩm đã mua trước đó
- **Sản phẩm hiện tại**: Đang xem sản phẩm nào
- **Collaborative Filtering**: Người dùng tương tự thích gì

### 4.2. Vị trí hiển thị

1. **Trang chủ** (`/`)
   - Section "Gợi ý cho bạn"
   - Dựa trên lịch sử mua hàng (nếu đã đăng nhập)

2. **Trang chi tiết sản phẩm** (`/product/[id]`)
   - Section "Sản phẩm tương tự"
   - Dựa trên SPU hiện tại + lịch sử mua hàng

### 4.3. API Endpoint

**Endpoint**: `POST /aiproxy/recommend`

**Request**:

```json
{
  "spus": ["LAP001", "LAP002", "LAP003"],
  "top_k": 10
}
```

**Response**:

```json
{
  "status": "success",
  "data": [
    {
      "spu": "LAP005",
      "score": 0.94
    },
    {
      "spu": "LAP007",
      "score": 0.91
    }
  ]
}
```

### 4.4. Code Implementation

**File**: `src/services/searchService.ts`

```typescript
static async getRecommendations(spus: string[], topK: number = 5): Promise<SearchResult[]> {
    try {
        const response = await axios.post<SearchResponse>(RECOMMEND_ENDPOINT, {
            spus,
            top_k: topK,
        });
        return response.data.data || [];
    } catch (error) {
        console.error('[SearchService] Error getting recommendations:', error);
        return [];
    }
}
```

**File**: `src/components/PersonalizedRecommendation.tsx`

```tsx
export default function PersonalizedRecommendation({ currentSpu }: Props) {
  const { user } = useAuthContext();
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      let spus: string[] = [];

      // 1. Get recent SPUs from order history
      if (user) {
        const recentSpus = await OrderService.getRecentProductSpus(10);
        spus = [...recentSpus];
      }

      // 2. Add current product SPU (if on detail page)
      if (currentSpu) {
        spus = [currentSpu, ...spus];
      }

      // 3. Call AI Recommendation API
      const inputSpus = spus.slice(0, 10);
      const recommendations = await SearchService.getRecommendations(
        inputSpus,
        10
      );

      // 4. Fetch full product details
      const recommendedSpus = recommendations.map((r) => r.spu);
      const productDetails =
        await ProductService.fetchProductsBySpus(recommendedSpus);

      setProducts(productDetails);
    };

    fetchRecommendations();
  }, [user, currentSpu]);

  return (
    <div>
      <h2>Gợi ý cho bạn</h2>
      <div className="grid grid-cols-5 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
```

### 4.5. Data Flow

```
Page Load
    ↓
PersonalizedRecommendation Component
    ↓
Step 1: Get recent SPUs from order history
    OrderService.getRecentProductSpus() → GET /orders/recent-products-spus?k=10
    ↓
Step 2: Add current product SPU (if on detail page)
    ↓
Step 3: Call AI Recommendation API
    SearchService.getRecommendations(spus) → POST /aiproxy/recommend
    ↓
Step 4: Fetch full product details
    ProductService.fetchProductsBySpus(recommended_spus) → GET /products/by-spus
    ↓
Render ProductCard components
```

### 4.6. Order Service Integration

**File**: `src/services/orderService.ts`

```typescript
// Lấy danh sách SPU từ các đơn hàng gần đây của user
static async getRecentProductSpus(k: number = 10): Promise<string[]> {
    return api.get<string[]>(`/orders/recent-products-spus?k=${k}`);
}
```

**Endpoint Backend**: `GET /orders/recent-products-spus?k=10`

**Response**:

```json
["LAP001", "MOUSE02", "KEY03", "LAP004", ...]
```

---

## 5. Product API

### 5.1. Tổng quan API

Product API cung cấp các endpoint để quản lý và truy xuất thông tin sản phẩm.

**Base URL**: `/api/proxy/products`

### 5.2. Danh sách Endpoints

#### 5.2.1. Get Product by ID

**Endpoint**: `GET /products/{id}`

**Description**: Lấy thông tin chi tiết 1 sản phẩm

**Response**:

```typescript
interface ProductDetail {
  id: number;
  name: string;
  spu: string; // Stock Keeping Unit ID
  description: string;
  categoryId: number;
  categoryName: string;
  brandId: number;
  brandName: string;
  imageUrl: string | null;
  imagePublicId: string | null;
  averageRating: number;
  totalRatings: number;
  displayOriginalPrice: number | null;
  displaySalePrice: number | null;
  discountType: "PERCENTAGE" | "FIXED" | null;
  discountValue: number | null;
  createdAt: string;
  updatedAt: string;
  inWishlist: boolean;
  attributes: ProductAttribute[];
  variations: ProductVariation[];
}
```

**Code**:

```typescript
static async getProductById(id: number): Promise<ProductDetail> {
    try {
        return await api.get<ProductDetail>(`products/${id}`);
    } catch (error: any) {
        if (error.response?.status === 404) {
            throw new Error("Sản phẩm không tồn tại");
        }
        throw new Error(error.response?.data?.message || "Không thể tải sản phẩm");
    }
}
```

#### 5.2.2. Get Products with Pagination

**Endpoint**: `GET /products`

**Query Parameters**:

- `categoryId` (optional): Filter by category
- `sortBy` (optional): Field to sort by (default: "id")
- `sortDirection` (optional): "ASC" | "DESC" (default: "ASC")
- `page` (optional): Page number (default: 0)
- `size` (optional): Items per page (default: 20)

**Response**:

```typescript
interface PaginatedProducts {
  content: ProductDetail[];
  totalPages: number;
  totalElements: number;
}
```

**Code**:

```typescript
static async getProducts(params?: {
    categoryId?: number | string;
    sortBy?: string;
    sortDirection?: "ASC" | "DESC";
    page?: number;
    size?: number;
}): Promise<{ content: ProductDetail[]; totalPages: number; totalElements: number }> {
    const {
        categoryId = "",
        sortBy = "id",
        sortDirection = "ASC",
        page = 0,
        size = 20,
    } = params || {};

    return api.get("products", {
        params: { categoryId, sortBy, sortDirection, page, size },
    });
}
```

**Example Usage**:

```typescript
// Get all products (page 0, 20 items)
const result = await ProductService.getProducts();

// Get products in category 5, sorted by price desc
const result = await ProductService.getProducts({
  categoryId: 5,
  sortBy: "price",
  sortDirection: "DESC",
  page: 0,
  size: 10,
});
```

#### 5.2.3. Get Products by SPUs (AI Integration)

**Endpoint**: `GET /products/by-spus`

**Description**: Lấy danh sách sản phẩm theo SPU IDs - **Dùng cho AI Chatbot, AI Search, AI Recommendation**

**Query Parameters**:

- `spus`: Array of SPU IDs (format: `spus=LAP001&spus=LAP002`)
- `size`: Number of items to return

**Response**:

```typescript
interface PaginatedProducts {
  content: ProductDetail[];
  totalPages: number;
  totalElements: number;
}
```

**Code**:

```typescript
static async fetchProductsBySpus(spus: string[]): Promise<any[]> {
    if (!spus || spus.length === 0) {
        return [];
    }

    try {
        const response = await axiosInstance.get('/products/by-spus', {
            params: {
                spus: spus,
                size: spus.length,
            },
            paramsSerializer: (params) => {
                // Convert array to: spus=LAP001&spus=LAP002
                return qs.stringify(params, { arrayFormat: 'repeat' });
            },
        });

        // Extract content array from paginated response
        let products: any[] = [];
        if (response && typeof response === 'object') {
            if (Array.isArray(response)) {
                products = response;
            } else if (response.content && Array.isArray(response.content)) {
                products = response.content;
            }
        }

        return products;
    } catch (error) {
        console.error('[ProductService] Error fetching products by SPUs:', error);
        return [];
    }
}
```

**Example Usage**:

```typescript
// Chatbot gợi ý sản phẩm
const spus = ["LAP001", "LAP002", "MOUSE03"];
const products = await ProductService.fetchProductsBySpus(spus);

// AI Search kết quả
const searchResults = await SearchService.searchByText("laptop gaming");
const spus = searchResults.map((r) => r.spu);
const products = await ProductService.fetchProductsBySpus(spus);
```

#### 5.2.4. Get Product Variations

**Endpoint**: `GET /product-variations`

**Query Parameters**:

- `page` (optional): Page number (default: 0)
- `size` (optional): Items per page (default: 20)

**Response**:

```typescript
interface ProductVariation {
  id: number;
  variationName: string;
  price: number;
  sku: string;
  availableQuantity: number;
  warrantyMonths: number;
  createdAt: string;
  updatedAt: string;
  salePrice: number;
  discountType: "PERCENTAGE" | "FIXED" | null;
  discountValue: number | null;
  images: ProductImage[];
  attributes: ProductAttribute[];
}
```

### 5.3. Category API

#### Get All Categories

**Endpoint**: `GET /categories`

**Code**:

```typescript
static async getAllCategories(): Promise<Category[]> {
    return api.get<Category[]>("categories");
}
```

#### Get Category by ID

**Endpoint**: `GET /categories/{id}`

**Code**:

```typescript
static async getCategoryById(id: number): Promise<Category> {
    return api.get<Category>(`categories/${id}`);
}
```

### 5.4. Product Service File

**File**: `src/services/productService.ts`

```typescript
import { api } from "@/lib/axios";
import { Category } from "@/features/category";
import { ProductDetail } from "@/features/product";
import axiosInstance from "@/lib/axios";
import qs from "qs";

export class ProductService {
  // Get all categories
  static async getAllCategories(): Promise<Category[]> {...}

  // Get category by ID
  static async getCategoryById(id: number): Promise<Category> {...}

  // Get product by ID
  static async getProductById(id: number): Promise<ProductDetail> {...}

  // Get products with pagination & filters
  static async getProducts(params?: {...}): Promise<{...}> {...}

  // Get product variations
  static async getProductVariations(params?: {...}): Promise<{...}> {...}

  // Fetch products by SPU IDs (AI integration)
  static async fetchProductsBySpus(spus: string[]): Promise<any[]> {...}
}
```

### 5.5. Type Definitions

**File**: `src/features/product.ts`

```typescript
// Product Image
export interface ProductImage {
  id: number;
  imageUrl: string;
}

// Product Attribute (CPU, RAM, Storage, etc.)
export interface ProductAttribute {
  id: number;
  name: string;
  value: string;
}

// Product Variation (Cấu hình khác nhau của sản phẩm)
export interface ProductVariation2 {
  id: number;
  variationName: string;
  price: number;
  sku: string;
  availableQuantity: number;
  warrantyMonths: number;
  createdAt: string;
  updatedAt: string;
  salePrice: number;
  discountType: "PERCENTAGE" | "FIXED" | null;
  discountValue: number | null;
  images: ProductImage[];
  attributes: ProductAttribute[];
}

// Main Product Detail
export interface ProductDetail {
  id: number;
  name: string;
  spu: string;
  description: string;
  categoryId: number;
  categoryName: string;
  brandId: number;
  brandName: string;
  imageUrl: string | null;
  imagePublicId: string | null;
  averageRating: number;
  totalRatings: number;
  displayOriginalPrice: number | null;
  displaySalePrice: number | null;
  discountType: "PERCENTAGE" | "FIXED" | null;
  discountValue: number | null;
  createdAt: string;
  updatedAt: string;
  inWishlist: boolean;
  attributes: ProductAttribute[];
  variations: ProductVariation2[];
}

// Simplified Product (for listing)
export interface Product {
  id: number;
  name: string;
  imageUrl: string | null;
  displayOriginalPrice: number | null;
  displaySalePrice: number | null;
  discountType: "PERCENTAGE" | "FIXED" | null;
  discountValue: number | null;
  averageRating: number;
  totalRatings: number;
}
```

---

## 6. Kiến trúc và Data Flow

### 6.1. Layered Architecture

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│  (Components, Pages, UI)                │
│  - ChatWindow, SearchModal, etc.        │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Business Logic Layer            │
│  (Hooks, Context, Utils)                │
│  - useChatbot, useProduct, etc.         │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Service Layer                   │
│  (API Integration)                      │
│  - ProductService, SearchService, etc.  │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Network Layer                   │
│  (Axios Instances, Interceptors)        │
│  - /api/proxy, /aiproxy                 │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Backend APIs                    │
│  - Spring Boot REST API                 │
│  - Python AI/ML Services                │
└─────────────────────────────────────────┘
```

### 6.2. AI Features Data Flow

#### Chatbot Flow

```
User types question
    ↓
ChatInput (Component)
    ↓
useChatbot.sendMessage() (Hook)
    ↓
chatbotService.sendChatMessage() (Service)
    ↓
axios.post('/aiproxy/chat') (Network)
    ↓
AI Backend processes with NLP
    ↓
Response: { answer, related_products: [SPUs] }
    ↓
ProductService.fetchProductsBySpus() (Service)
    ↓
GET /products/by-spus (Backend API)
    ↓
Merge answer + product details
    ↓
Update ChatWindow UI
    ↓
Display message + ProductSuggestionList
```

#### AI Search Flow

```
User inputs query/image
    ↓
SearchModal (Component)
    ↓
SearchService.searchByText/Image() (Service)
    ↓
POST /aiproxy/search/text or /aiproxy/search/image (Network)
    ↓
AI Backend: Vector Search / CNN Image Recognition
    ↓
Response: [{ spu, score }, ...]
    ↓
Redirect to /products/all?spus=LAP001,LAP002
    ↓
ProductListPage fetches products
    ↓
ProductService.fetchProductsBySpus() (Service)
    ↓
Display results in grid
```

#### AI Recommendation Flow

```
Page Load (Home or Product Detail)
    ↓
PersonalizedRecommendation Component
    ↓
Get recent order SPUs (if logged in)
    OrderService.getRecentProductSpus() → GET /orders/recent-products-spus
    ↓
Add current product SPU (if on detail page)
    ↓
SearchService.getRecommendations(spus) (Service)
    ↓
POST /aiproxy/recommend { spus, top_k }
    ↓
AI Backend: Collaborative Filtering
    ↓
Response: [{ spu, score }, ...]
    ↓
ProductService.fetchProductsBySpus()
    ↓
Display recommended products in grid
```

### 6.3. Network Configuration

**File**: `src/lib/axios.ts`

```typescript
const axiosInstance = axios.create({
  baseURL: "/api/proxy", // Backend API proxy
  withCredentials: true, // Send cookies for auth
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds
});

// Auto extract response.data
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Error handling
    console.error("[Axios]", error);
    return Promise.reject(error);
  }
);
```

**AI Proxy Routes**: `/aiproxy/*`

- `/aiproxy/chat` → Python AI Chatbot Service
- `/aiproxy/search/text` → Python Semantic Search Service
- `/aiproxy/search/image` → Python Visual Search Service
- `/aiproxy/recommend` → Python Recommendation Service

**Backend API Routes**: `/api/proxy/*`

- `/api/proxy/products/*` → Spring Boot Product API
- `/api/proxy/orders/*` → Spring Boot Order API
- `/api/proxy/categories/*` → Spring Boot Category API

### 6.4. State Management

#### Local State (useState)

```typescript
// Component-level state
const [products, setProducts] = useState<ProductDetail[]>([]);
const [isLoading, setIsLoading] = useState(false);
```

#### Custom Hooks

```typescript
// Reusable business logic
export function useChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  // ...
  return { messages, sendMessage, clearHistory };
}
```

#### Context API

```typescript
// Global state for auth
export function useAuthContext() {
  const { user, login, logout } = useContext(AuthContext);
  return { user, login, logout };
}
```

#### LocalStorage

```typescript
// Persistent storage
localStorage.setItem("techbox_chat_history", JSON.stringify(messages));
```

### 6.5. Component Structure (Atomic Design)

```
Components/
├── Atoms (Smallest units)
│   ├── Button, Input, Badge, etc.
│   └── ChatInput, ChatMessage, LoadingIndicator
│
├── Molecules (Groups of atoms)
│   ├── ChatHeader, MessageList
│   └── ProductSuggestionList
│
├── Organisms (Complex components)
│   ├── ChatWindow, ChatPopup
│   └── SearchTextModal, SearchImageModal
│
├── Templates (Page layouts)
│   └── ShopLayout, AdminLayout
│
└── Pages (Full pages)
    ├── HomePage
    ├── ProductDetailPage
    └── SearchResultsPage
```

---

## 7. Best Practices & Tips

### 7.1. Sử dụng AI hiệu quả

#### Chatbot

- ✅ Đặt câu hỏi cụ thể, chi tiết
- ✅ Cung cấp ngân sách, yêu cầu rõ ràng
- ❌ Tránh câu hỏi quá chung chung
- ❌ Không dùng viết tắt khó hiểu

**Ví dụ tốt**:

```
"Tôi cần laptop cho lập trình, ngân sách 15-20 triệu,
 ưu tiên RAM 16GB, SSD 512GB"
```

**Ví dụ không tốt**:

```
"Laptop nào tốt?"
```

#### Text Search

- ✅ Mô tả sản phẩm theo nhu cầu sử dụng
- ✅ Bao gồm thông số kỹ thuật quan trọng
- ✅ Có thể dùng ngôn ngữ tự nhiên

**Ví dụ**:

```
"Laptop văn phòng nhẹ, pin lâu, màn hình 14 inch"
"Chuột gaming có LED RGB, DPI cao"
```

#### Image Search

- ✅ Sử dụng ảnh rõ nét, góc nhìn tốt
- ✅ Ảnh sản phẩm không bị che khuất
- ❌ Tránh ảnh mờ, tối, góc nghiêng

### 7.2. Developer Guidelines

#### Error Handling

```typescript
try {
  const results = await SearchService.searchByText(query);
  if (results.length === 0) {
    // Handle empty results gracefully
    showMessage("Không tìm thấy sản phẩm phù hợp");
    return;
  }
  // Process results
} catch (error) {
  console.error("[Search] Error:", error);
  showErrorMessage("Có lỗi xảy ra, vui lòng thử lại");
}
```

#### Loading States

```typescript
const [isLoading, setIsLoading] = useState(false);

const handleSearch = async () => {
  setIsLoading(true);
  try {
    await searchOperation();
  } finally {
    setIsLoading(false); // Always reset loading
  }
};
```

#### Type Safety

```typescript
// Always use TypeScript interfaces
interface SearchResult {
  spu: string;
  score: number;
}

// Type API responses
const response = await api.get<ProductDetail[]>("/products");
```

### 7.3. Performance Optimization

1. **Debounce User Input**

   ```typescript
   const debouncedQuery = useDebounce(searchQuery, 300);
   ```

2. **Lazy Load Components**

   ```typescript
   const ChatPopup = dynamic(() => import("./ChatPopup"), {
     loading: () => <Loader />,
   });
   ```

3. **Cache API Results**

   ```typescript
   // Use SWR or React Query for caching
   const { data, error } = useSWR("/products", fetcher);
   ```

4. **Limit API Calls**
   ```typescript
   // Only send last 10 messages to chatbot
   const history = messages.slice(-10);
   ```

---

## 8. Troubleshooting

### 8.1. Chatbot Issues

**Problem**: Chatbot không hiển thị sản phẩm

**Solution**:

1. Kiểm tra console log: `[useChatbot] API Response`
2. Verify `related_products` array có SPU IDs
3. Check `fetchProductsBySpus()` có trả về data

**Problem**: Chat history bị mất

**Solution**:

1. Kiểm tra localStorage: `techbox_chat_history`
2. Verify browser không ở chế độ Incognito
3. Check quota localStorage không bị đầy

### 8.2. Search Issues

**Problem**: Text search không trả về kết quả

**Solution**:

1. Kiểm tra query có hợp lệ (không rỗng)
2. Verify endpoint `/aiproxy/search/text` hoạt động
3. Check backend AI service có running

**Problem**: Image search upload failed

**Solution**:

1. Verify file size < 10MB
2. Check file type là image (PNG, JPG)
3. Ensure backend có config `multipart/form-data`

### 8.3. Recommendation Issues

**Problem**: Không hiển thị gợi ý sản phẩm

**Solution**:

1. Check user có đơn hàng nào chưa
2. Verify `getRecentProductSpus()` trả về array
3. Ensure AI recommendation service hoạt động

---

## 9. API Reference Summary

### AI Endpoints

| Endpoint                | Method | Description                  |
| ----------------------- | ------ | ---------------------------- |
| `/aiproxy/chat`         | POST   | Chatbot conversation         |
| `/aiproxy/search/text`  | POST   | Semantic text search         |
| `/aiproxy/search/image` | POST   | Visual image search          |
| `/aiproxy/recommend`    | POST   | Personalized recommendations |

### Product Endpoints

| Endpoint              | Method | Description              |
| --------------------- | ------ | ------------------------ |
| `/products`           | GET    | Get paginated products   |
| `/products/{id}`      | GET    | Get product by ID        |
| `/products/by-spus`   | GET    | Get products by SPU list |
| `/product-variations` | GET    | Get product variations   |
| `/categories`         | GET    | Get all categories       |
| `/categories/{id}`    | GET    | Get category by ID       |

### Order Endpoints

| Endpoint                       | Method | Description             |
| ------------------------------ | ------ | ----------------------- |
| `/orders/recent-products-spus` | GET    | Get recent product SPUs |

---

## 10. SPU - Cách sử dụng trong Mobile App

### 10.1. SPU là gì?

**SPU** (Stock Product Unit) là **mã định danh duy nhất** cho mỗi sản phẩm trong hệ thống TechBox.

**Tại sao sử dụng SPU thay vì Product ID?**

- ✅ **AI Services trả về SPU** - Nhẹ, nhanh, không cần fetch full product data
- ✅ **String format** - Dễ serialize, transfer qua network
- ✅ **Human-readable** - VD: "LAP001", "MOUSE02" (dễ debug)
- ✅ **Stable identifier** - Không thay đổi khi migrate database

**Cấu trúc ProductDetail:**

```json
{
  "id": 1,
  "spu": "LAP001",
  "name": "Laptop Gaming ASUS ROG",
  "categoryId": 5,
  "brandId": 3,
  "imageUrl": "https://...",
  "displaySalePrice": 19990000,
  "averageRating": 4.5,
  "variations": [...],
  ...
}
```

### 10.2. Luồng hoạt động SPU

```
┌─────────────────────────────────────────────┐
│   AI Backend (Python)                       │
│   - Chatbot: NLP Processing                 │
│   - Search: Vector/Image Search             │
│   - Recommendation: ML Algorithm            │
└──────────────┬──────────────────────────────┘
               │
               ▼
        Returns: ["SPU001", "SPU002", "SPU003"]
               │
               ▼
┌──────────────┴──────────────────────────────┐
│   Mobile App (React Native/Flutter)         │
│   1. Nhận SPU array từ AI                   │
│   2. Gọi GET /products/by-spus              │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌──────────────┴──────────────────────────────┐
│   Backend API (Spring Boot)                 │
│   GET /products/by-spus?spus=SPU001&...     │
└──────────────┬──────────────────────────────┘
               │
               ▼
        Returns: Full Product Details
               │
               ▼
┌──────────────┴──────────────────────────────┐
│   Mobile App                                │
│   - Hiển thị product cards                  │
│   - Show images, price, rating              │
└─────────────────────────────────────────────┘
```

### 10.3. Implementation Guide cho Mobile App

#### 10.3.1. API Service Layer

**File: `services/ProductService.js` (React Native) hoặc `product_service.dart` (Flutter)**

**React Native:**

```javascript
import axios from "axios";

class ProductService {
  static baseURL = "https://api.techbox.com/api";

  /**
   * Fetch products by SPU IDs
   * @param {string[]} spus - Array of SPU IDs
   * @returns {Promise<Product[]>} - Full product details
   */
  static async fetchProductsBySpus(spus) {
    if (!spus || spus.length === 0) {
      return [];
    }

    try {
      // Build query params: spus=LAP001&spus=LAP002&spus=MOUSE03
      const params = new URLSearchParams();
      spus.forEach((spu) => params.append("spus", spu));
      params.append("size", spus.length);

      const response = await axios.get(
        `${this.baseURL}/products/by-spus?${params.toString()}`
      );

      // Extract products from paginated response
      if (response.data.content && Array.isArray(response.data.content)) {
        return response.data.content;
      }

      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("[ProductService] Error fetching by SPUs:", error);
      return [];
    }
  }

  /**
   * Get product by single ID
   */
  static async getProductById(id) {
    try {
      const response = await axios.get(`${this.baseURL}/products/${id}`);
      return response.data;
    } catch (error) {
      console.error("[ProductService] Error fetching product:", error);
      throw error;
    }
  }
}

export default ProductService;
```

**Flutter (Dart):**

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

class ProductService {
  static const String baseURL = 'https://api.techbox.com/api';

  /// Fetch products by SPU IDs
  static Future<List<Product>> fetchProductsBySpus(List<String> spus) async {
    if (spus.isEmpty) {
      return [];
    }

    try {
      // Build query params
      final queryParams = spus.map((spu) => 'spus=$spu').join('&');
      final url = '$baseURL/products/by-spus?$queryParams&size=${spus.length}';

      final response = await http.get(Uri.parse(url));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);

        // Extract from paginated response
        final List<dynamic> products = data['content'] ?? data;
        return products.map((json) => Product.fromJson(json)).toList();
      }

      return [];
    } catch (e) {
      print('[ProductService] Error fetching by SPUs: $e');
      return [];
    }
  }

  /// Get product by single ID
  static Future<Product?> getProductById(int id) async {
    try {
      final response = await http.get(Uri.parse('$baseURL/products/$id'));

      if (response.statusCode == 200) {
        return Product.fromJson(json.decode(response.body));
      }
      return null;
    } catch (e) {
      print('[ProductService] Error: $e');
      throw e;
    }
  }
}
```

#### 10.3.2. Use Case 1: AI Chatbot

**Kịch bản**: User hỏi "Laptop gaming dưới 20 triệu"

**React Native:**

```javascript
import ProductService from "./services/ProductService";
import ChatbotService from "./services/ChatbotService";

const ChatbotScreen = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (question) => {
    // 1. Add user message
    const userMessage = { role: "user", content: question };
    setMessages((prev) => [...prev, userMessage]);

    setIsLoading(true);
    try {
      // 2. Call AI Chatbot API
      const history = messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await ChatbotService.sendMessage(question, history);
      // Response: { answer: "...", related_products: ["LAP001", "LAP002"] }

      // 3. Fetch product details if SPUs are returned
      let products = [];
      if (response.related_products && response.related_products.length > 0) {
        products = await ProductService.fetchProductsBySpus(
          response.related_products
        );
      }

      // 4. Add AI message with products
      const aiMessage = {
        role: "assistant",
        content: response.answer,
        products: products, // Attach product data
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Chatbot error:", error);
      // Show error message
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View>
      <FlatList
        data={messages}
        renderItem={({ item }) => (
          <MessageBubble message={item}>
            {/* Render product cards if available */}
            {item.products && item.products.length > 0 && (
              <ProductCarousel products={item.products} />
            )}
          </MessageBubble>
        )}
      />
      <ChatInput onSend={sendMessage} disabled={isLoading} />
    </View>
  );
};
```

**Flutter:**

```dart
class ChatbotScreen extends StatefulWidget {
  @override
  _ChatbotScreenState createState() => _ChatbotScreenState();
}

class _ChatbotScreenState extends State<ChatbotScreen> {
  List<ChatMessage> messages = [];
  bool isLoading = false;

  Future<void> sendMessage(String question) async {
    // 1. Add user message
    setState(() {
      messages.add(ChatMessage(role: 'user', content: question));
      isLoading = true;
    });

    try {
      // 2. Call AI Chatbot API
      final history = messages.take(10).map((m) => {
        'role': m.role,
        'content': m.content
      }).toList();

      final response = await ChatbotService.sendMessage(question, history);
      // Response: { answer: "...", related_products: ["LAP001", "LAP002"] }

      // 3. Fetch product details
      List<Product> products = [];
      if (response['related_products'] != null) {
        final spus = List<String>.from(response['related_products']);
        products = await ProductService.fetchProductsBySpus(spus);
      }

      // 4. Add AI message
      setState(() {
        messages.add(ChatMessage(
          role: 'assistant',
          content: response['answer'],
          products: products,
        ));
      });
    } catch (e) {
      print('Chatbot error: $e');
      // Show error
    } finally {
      setState(() {
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Expanded(
          child: ListView.builder(
            itemCount: messages.length,
            itemBuilder: (context, index) {
              final message = messages[index];
              return MessageBubble(
                message: message,
                child: message.products != null && message.products!.isNotEmpty
                    ? ProductCarousel(products: message.products!)
                    : null,
              );
            },
          ),
        ),
        ChatInput(onSend: sendMessage, enabled: !isLoading),
      ],
    );
  }
}
```

**API Call:**

```http
POST /aiproxy/chat
Content-Type: application/json

{
  "question": "Laptop gaming dưới 20 triệu",
  "history": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}

Response:
{
  "answer": "Dựa trên ngân sách của bạn, tôi gợi ý...",
  "intent": "product_recommendation",
  "related_products": ["LAP001", "LAP002", "LAP003"]
}
```

Then:

```http
GET /products/by-spus?spus=LAP001&spus=LAP002&spus=LAP003&size=3

Response:
{
  "content": [
    { "id": 1, "spu": "LAP001", "name": "...", ... },
    { "id": 2, "spu": "LAP002", "name": "...", ... }
  ]
}
```

#### 10.3.3. Use Case 2: AI Text Search

**Kịch bản**: User search "máy tính xách tay cho game thủ"

**React Native:**

```javascript
import SearchService from "./services/SearchService";
import ProductService from "./services/ProductService";

const SearchScreen = () => {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      // 1. Call AI Text Search API
      const results = await SearchService.searchByText(query, 20);
      // Results: [{ spu: "LAP001", score: 0.95 }, ...]

      if (results.length > 0) {
        // 2. Extract SPUs
        const spus = results.map((r) => r.spu);

        // 3. Fetch full product details
        const productDetails = await ProductService.fetchProductsBySpus(spus);

        // 4. Update UI
        setProducts(productDetails);
      } else {
        setProducts([]);
        // Show "No results" message
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View>
      <SearchBar
        value={query}
        onChangeText={setQuery}
        onSubmit={handleSearch}
        placeholder="Mô tả sản phẩm bạn muốn tìm..."
      />

      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={products}
          renderItem={({ item }) => <ProductCard product={item} />}
          numColumns={2}
        />
      )}
    </View>
  );
};
```

**Flutter:**

```dart
class SearchScreen extends StatefulWidget {
  @override
  _SearchScreenState createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final TextEditingController _controller = TextEditingController();
  List<Product> products = [];
  bool isLoading = false;

  Future<void> handleSearch() async {
    final query = _controller.text.trim();
    if (query.isEmpty) return;

    setState(() {
      isLoading = true;
    });

    try {
      // 1. Call AI Text Search
      final results = await SearchService.searchByText(query, 20);
      // Results: [{ spu: "LAP001", score: 0.95 }, ...]

      if (results.isNotEmpty) {
        // 2. Extract SPUs
        final spus = results.map((r) => r['spu'] as String).toList();

        // 3. Fetch products
        final productDetails = await ProductService.fetchProductsBySpus(spus);

        setState(() {
          products = productDetails;
        });
      } else {
        setState(() {
          products = [];
        });
      }
    } catch (e) {
      print('Search error: $e');
    } finally {
      setState(() {
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        SearchBar(
          controller: _controller,
          onSubmitted: (_) => handleSearch(),
          hintText: 'Mô tả sản phẩm...',
        ),
        Expanded(
          child: isLoading
              ? Center(child: CircularProgressIndicator())
              : GridView.builder(
                  gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                  ),
                  itemCount: products.length,
                  itemBuilder: (context, index) {
                    return ProductCard(product: products[index]);
                  },
                ),
        ),
      ],
    );
  }
}
```

**API Sequence:**

```http
1. POST /aiproxy/search/text
{
  "query": "máy tính xách tay cho game thủ",
  "top_k": 20
}

Response:
{
  "data": [
    { "spu": "LAP001", "score": 0.95 },
    { "spu": "LAP002", "score": 0.89 }
  ]
}

2. GET /products/by-spus?spus=LAP001&spus=LAP002&size=2

Response:
{
  "content": [
    { "id": 1, "spu": "LAP001", "name": "Laptop Gaming ASUS", ... },
    { "id": 2, "spu": "LAP002", "name": "Laptop Gaming MSI", ... }
  ]
}
```

#### 10.3.4. Use Case 3: AI Image Search (Upload ảnh để tìm kiếm)

**Kịch bản**: User chụp ảnh hoặc upload ảnh sản phẩm để tìm sản phẩm tương tự

**🎯 Flow hoạt động:**

```
User mở Image Search
    ↓
Chọn nguồn: Camera hoặc Gallery
    ↓
Select/Capture image
    ↓
Preview image
    ↓
Click "Tìm kiếm"
    ↓
Upload image to /aiproxy/search/image (multipart/form-data)
    ↓
AI Backend: Extract image features → Vector search
    ↓
Response: [{ spu, score }, ...]
    ↓
Fetch full product details by SPUs
    ↓
Display results sorted by similarity score
```

---

**React Native Implementation:**

```javascript
import { launchImageLibrary, launchCamera } from "react-native-image-picker";
import { PermissionsAndroid, Platform } from "react-native";
import SearchService from "./services/SearchService";
import ProductService from "./services/ProductService";

const ImageSearchScreen = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Request camera permission (Android)
  const requestCameraPermission = async () => {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  // Pick image from gallery
  const pickFromGallery = async () => {
    const result = await launchImageLibrary({
      mediaType: "photo",
      quality: 0.8,
      maxWidth: 1024,
      maxHeight: 1024,
    });

    if (result.assets && result.assets[0]) {
      setSelectedImage(result.assets[0]);
    }
  };

  // Take photo with camera
  const takePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert("Permission Denied", "Camera permission is required");
      return;
    }

    const result = await launchCamera({
      mediaType: "photo",
      quality: 0.8,
      maxWidth: 1024,
      maxHeight: 1024,
    });

    if (result.assets && result.assets[0]) {
      setSelectedImage(result.assets[0]);
    }
  };

  // Show source selection dialog
  const selectImageSource = () => {
    Alert.alert("Chọn nguồn ảnh", "Bạn muốn lấy ảnh từ đâu?", [
      { text: "Chụp ảnh", onPress: takePhoto },
      { text: "Thư viện", onPress: pickFromGallery },
      { text: "Hủy", style: "cancel" },
    ]);
  };

  // Search by image
  const handleSearch = async () => {
    if (!selectedImage) return;

    setIsLoading(true);
    try {
      // 1. Create FormData for image upload
      const formData = new FormData();
      formData.append("file", {
        uri: selectedImage.uri,
        type: selectedImage.type || "image/jpeg",
        name: selectedImage.fileName || "photo.jpg",
      });
      formData.append("top_k", "20");

      console.log("[ImageSearch] Uploading image...");

      // 2. Call AI Image Search API
      const results = await SearchService.searchByImage(formData);
      // Results: [{ spu: "LAP001", score: 0.92 }, ...]

      console.log("[ImageSearch] Results:", results);

      if (results.length > 0) {
        // 3. Extract SPUs
        const spus = results.map((r) => r.spu);

        // 4. Fetch full product details
        const productDetails = await ProductService.fetchProductsBySpus(spus);

        console.log("[ImageSearch] Products found:", productDetails.length);
        setProducts(productDetails);
      } else {
        setProducts([]);
        Alert.alert("Không tìm thấy", "Không tìm thấy sản phẩm tương tự");
      }
    } catch (error) {
      console.error("[ImageSearch] Error:", error);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi tìm kiếm");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Tìm kiếm bằng hình ảnh</Text>
          <Text style={styles.subtitle}>
            Chụp hoặc chọn ảnh sản phẩm để tìm sản phẩm tương tự
          </Text>
        </View>

        {/* Image Selection/Preview */}
        {!selectedImage ? (
          <TouchableOpacity
            onPress={selectImageSource}
            style={styles.uploadArea}
          >
            <Icon name="camera" size={60} color="#999" />
            <Text style={styles.uploadText}>Chọn hoặc chụp ảnh</Text>
            <Text style={styles.uploadHint}>PNG, JPG, JPEG (tối đa 10MB)</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.previewContainer}>
            <Image
              source={{ uri: selectedImage.uri }}
              style={styles.preview}
              resizeMode="contain"
            />
            <View style={styles.imageInfo}>
              <Text style={styles.fileName}>{selectedImage.fileName}</Text>
              <Text style={styles.fileSize}>
                {(selectedImage.fileSize / 1024).toFixed(0)} KB
              </Text>
            </View>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                onPress={handleSearch}
                style={[styles.button, styles.primaryButton]}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Icon name="search" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Tìm kiếm</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setSelectedImage(null)}
                style={[styles.button, styles.secondaryButton]}
                disabled={isLoading}
              >
                <Icon name="refresh" size={20} color="#666" />
                <Text style={styles.secondaryButtonText}>Chọn lại</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Results */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#E61E4D" />
            <Text style={styles.loadingText}>Đang phân tích hình ảnh...</Text>
          </View>
        )}

        {!isLoading && products.length > 0 && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>
              Tìm thấy {products.length} sản phẩm tương tự
            </Text>
            <FlatList
              data={products}
              renderItem={({ item }) => <ProductCard product={item} />}
              keyExtractor={(item) => item.id.toString()}
              numColumns={2}
              columnWrapperStyle={styles.row}
            />
          </View>
        )}

        {!isLoading && products.length === 0 && selectedImage && (
          <View style={styles.emptyState}>
            <Icon name="search" size={60} color="#ccc" />
            <Text style={styles.emptyText}>
              Không tìm thấy sản phẩm tương tự
            </Text>
            <Text style={styles.emptyHint}>
              Thử chụp ảnh rõ hơn hoặc chọn ảnh khác
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
  },
  uploadArea: {
    margin: 20,
    padding: 60,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#ddd",
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#fafafa",
  },
  uploadText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  uploadHint: {
    fontSize: 12,
    color: "#999",
  },
  previewContainer: {
    margin: 20,
  },
  preview: {
    width: "100%",
    height: 300,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
  },
  imageInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  fileName: {
    fontSize: 14,
    fontWeight: "500",
  },
  fileSize: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: "#E61E4D",
  },
  secondaryButton: {
    backgroundColor: "#f5f5f5",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: "#666",
  },
  resultsContainer: {
    padding: 20,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  row: {
    gap: 12,
  },
  emptyState: {
    padding: 60,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 14,
    color: "#999",
  },
});

export default ImageSearchScreen;
```

---

**Flutter Implementation:**

```dart
import 'package:image_picker/image_picker.dart';
import 'package:permission_handler/permission_handler.dart';
import 'dart:io';

class ImageSearchScreen extends StatefulWidget {
  @override
  _ImageSearchScreenState createState() => _ImageSearchScreenState();
}

class _ImageSearchScreenState extends State<ImageSearchScreen> {
  File? selectedImage;
  List<Product> products = [];
  bool isLoading = false;
  final ImagePicker _picker = ImagePicker();

  // Pick image from gallery
  Future<void> pickFromGallery() async {
    final XFile? image = await _picker.pickImage(
      source: ImageSource.gallery,
      maxWidth: 1024,
      maxHeight: 1024,
      imageQuality: 80,
    );

    if (image != null) {
      setState(() {
        selectedImage = File(image.path);
      });
    }
  }

  // Take photo with camera
  Future<void> takePhoto() async {
    // Request camera permission
    final status = await Permission.camera.request();
    if (!status.isGranted) {
      _showPermissionDeniedDialog();
      return;
    }

    final XFile? photo = await _picker.pickImage(
      source: ImageSource.camera,
      maxWidth: 1024,
      maxHeight: 1024,
      imageQuality: 80,
    );

    if (photo != null) {
      setState(() {
        selectedImage = File(photo.path);
      });
    }
  }

  // Show source selection dialog
  void selectImageSource() {
    showModalBottomSheet(
      context: context,
      builder: (context) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: Icon(Icons.camera_alt),
              title: Text('Chụp ảnh'),
              onTap: () {
                Navigator.pop(context);
                takePhoto();
              },
            ),
            ListTile(
              leading: Icon(Icons.photo_library),
              title: Text('Chọn từ thư viện'),
              onTap: () {
                Navigator.pop(context);
                pickFromGallery();
              },
            ),
            ListTile(
              leading: Icon(Icons.cancel),
              title: Text('Hủy'),
              onTap: () => Navigator.pop(context),
            ),
          ],
        ),
      ),
    );
  }

  // Search by image
  Future<void> handleSearch() async {
    if (selectedImage == null) return;

    setState(() {
      isLoading = true;
    });

    try {
      print('[ImageSearch] Uploading image...');

      // 1. Call AI Image Search
      final results = await SearchService.searchByImage(selectedImage!, 20);
      // Results: [{ spu: "LAP001", score: 0.92 }, ...]

      print('[ImageSearch] Results: ${results.length}');

      if (results.isNotEmpty) {
        // 2. Extract SPUs
        final spus = results.map((r) => r['spu'] as String).toList();

        // 3. Fetch full product details
        final productDetails = await ProductService.fetchProductsBySpus(spus);

        setState(() {
          products = productDetails;
        });

        if (productDetails.isEmpty) {
          _showNoResultsDialog();
        }
      } else {
        setState(() {
          products = [];
        });
        _showNoResultsDialog();
      }
    } catch (e) {
      print('[ImageSearch] Error: $e');
      _showErrorDialog();
    } finally {
      setState(() {
        isLoading = false;
      });
    }
  }

  void _showPermissionDeniedDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Quyền bị từ chối'),
        content: Text('Cần quyền truy cập camera để chụp ảnh'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('OK'),
          ),
        ],
      ),
    );
  }

  void _showNoResultsDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Không tìm thấy'),
        content: Text('Không tìm thấy sản phẩm tương tự. Thử chụp ảnh rõ hơn.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('OK'),
          ),
        ],
      ),
    );
  }

  void _showErrorDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Lỗi'),
        content: Text('Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('OK'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Tìm kiếm bằng hình ảnh'),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Header
            Padding(
              padding: EdgeInsets.all(20),
              child: Text(
                'Chụp hoặc chọn ảnh sản phẩm để tìm sản phẩm tương tự',
                style: TextStyle(fontSize: 14, color: Colors.grey[600]),
              ),
            ),

            // Image Selection/Preview
            selectedImage == null
                ? GestureDetector(
                    onTap: selectImageSource,
                    child: Container(
                      margin: EdgeInsets.all(20),
                      padding: EdgeInsets.all(60),
                      decoration: BoxDecoration(
                        border: Border.all(
                          color: Colors.grey[300]!,
                          width: 2,
                          style: BorderStyle.solid,
                        ),
                        borderRadius: BorderRadius.circular(12),
                        color: Colors.grey[50],
                      ),
                      child: Column(
                        children: [
                          Icon(Icons.camera_alt, size: 60, color: Colors.grey),
                          SizedBox(height: 16),
                          Text(
                            'Chọn hoặc chụp ảnh',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          SizedBox(height: 8),
                          Text(
                            'PNG, JPG, JPEG (tối đa 10MB)',
                            style: TextStyle(fontSize: 12, color: Colors.grey),
                          ),
                        ],
                      ),
                    ),
                  )
                : Container(
                    margin: EdgeInsets.all(20),
                    child: Column(
                      children: [
                        // Image Preview
                        ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: Image.file(
                            selectedImage!,
                            height: 300,
                            width: double.infinity,
                            fit: BoxFit.contain,
                          ),
                        ),
                        SizedBox(height: 16),

                        // Buttons
                        Row(
                          children: [
                            Expanded(
                              child: ElevatedButton.icon(
                                onPressed: isLoading ? null : handleSearch,
                                icon: isLoading
                                    ? SizedBox(
                                        width: 20,
                                        height: 20,
                                        child: CircularProgressIndicator(
                                          strokeWidth: 2,
                                          valueColor: AlwaysStoppedAnimation(
                                              Colors.white),
                                        ),
                                      )
                                    : Icon(Icons.search),
                                label: Text('Tìm kiếm'),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Color(0xFFE61E4D),
                                  padding: EdgeInsets.symmetric(vertical: 16),
                                ),
                              ),
                            ),
                            SizedBox(width: 12),
                            Expanded(
                              child: OutlinedButton.icon(
                                onPressed: isLoading
                                    ? null
                                    : () => setState(() {
                                          selectedImage = null;
                                          products = [];
                                        }),
                                icon: Icon(Icons.refresh),
                                label: Text('Chọn lại'),
                                style: OutlinedButton.styleFrom(
                                  padding: EdgeInsets.symmetric(vertical: 16),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

            // Loading
            if (isLoading)
              Container(
                padding: EdgeInsets.all(40),
                child: Column(
                  children: [
                    CircularProgressIndicator(),
                    SizedBox(height: 16),
                    Text(
                      'Đang phân tích hình ảnh...',
                      style: TextStyle(color: Colors.grey[600]),
                    ),
                  ],
                ),
              ),

            // Results
            if (!isLoading && products.isNotEmpty)
              Container(
                padding: EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Tìm thấy ${products.length} sản phẩm tương tự',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    SizedBox(height: 16),
                    GridView.builder(
                      shrinkWrap: true,
                      physics: NeverScrollableScrollPhysics(),
                      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        crossAxisSpacing: 12,
                        mainAxisSpacing: 12,
                        childAspectRatio: 0.7,
                      ),
                      itemCount: products.length,
                      itemBuilder: (context, index) {
                        return ProductCard(product: products[index]);
                      },
                    ),
                  ],
                ),
              ),

            // Empty State
            if (!isLoading && products.isEmpty && selectedImage != null)
              Container(
                padding: EdgeInsets.all(60),
                child: Column(
                  children: [
                    Icon(Icons.search, size: 60, color: Colors.grey[300]),
                    SizedBox(height: 16),
                    Text(
                      'Không tìm thấy sản phẩm tương tự',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    SizedBox(height: 8),
                    Text(
                      'Thử chụp ảnh rõ hơn hoặc chọn ảnh khác',
                      style: TextStyle(fontSize: 14, color: Colors.grey),
                    ),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    // Clean up
    super.dispose();
  }
}
```

---

**SearchService - Image Upload:**

```javascript
// React Native / JavaScript
class SearchService {
  static baseURL = "https://api.techbox.com/aiproxy";

  static async searchByImage(formData, topK = 20) {
    try {
      const response = await fetch(`${this.baseURL}/search/image`, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
          // Don't set Content-Type - browser/RN will set it automatically with boundary
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error("[SearchService] Error:", error);
      throw error;
    }
  }
}
```

```dart
// Flutter / Dart
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:io';

class SearchService {
  static const String baseURL = 'https://api.techbox.com/aiproxy';

  static Future<List<Map<String, dynamic>>> searchByImage(
    File imageFile,
    int topK,
  ) async {
    try {
      var request = http.MultipartRequest(
        'POST',
        Uri.parse('$baseURL/search/image'),
      );

      // Add image file
      request.files.add(
        await http.MultipartFile.fromPath(
          'file',
          imageFile.path,
        ),
      );

      // Add top_k parameter
      request.fields['top_k'] = topK.toString();

      // Send request
      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return List<Map<String, dynamic>>.from(data['data'] ?? []);
      }

      throw Exception('HTTP ${response.statusCode}');
    } catch (e) {
      print('[SearchService] Error: $e');
      throw e;
    }
  }
}
```

---

**📌 Tips cho Image Search hiệu quả:**

1. **Chất lượng ảnh:**
   - ✅ Ảnh rõ nét, đủ sáng
   - ✅ Góc chụp thẳng, toàn bộ sản phẩm
   - ✅ Nền đơn giản, không bị che khuất
   - ❌ Tránh ảnh mờ, tối, góc nghiêng

2. **Kích thước ảnh:**
   - Resize về 1024x1024 để upload nhanh
   - Giới hạn 10MB
   - Format: JPG (nhỏ hơn PNG)

3. **UX Best Practices:**
   - Show progress indicator khi upload
   - Preview ảnh trước khi search
   - Cache results để không search lại khi back
   - Cho phép crop ảnh trước khi upload

4. **Error Handling:**
   - Validate file size và type
   - Handle network errors gracefully
   - Show retry option
   - Timeout sau 30s

---

#### 10.3.5. Use Case 4: AI Recommendation

- Cache results để không search lại khi back
- Cho phép crop ảnh trước khi upload

4. **Error Handling:**
   - Validate file size và type
   - Handle network errors gracefully
   - Show retry option
   - Timeout sau 30s

---

#### 10.3.5. Use Case 4: AI Recommendation

**Kịch bản**: Hiển thị "Gợi ý cho bạn" trên Home Screen hoặc Product Detail

**React Native:**

```javascript
import { useEffect, useState } from "react";
import OrderService from "./services/OrderService";
import SearchService from "./services/SearchService";
import ProductService from "./services/ProductService";

const RecommendationSection = ({ currentSpu = null }) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, [currentSpu]);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      let spus = [];

      // 1. Get recent SPUs from order history (if logged in)
      const user = await AuthService.getCurrentUser();
      if (user) {
        const recentSpus = await OrderService.getRecentProductSpus(10);
        spus = [...recentSpus];
      }

      // 2. Add current product SPU (if on detail page)
      if (currentSpu) {
        spus = [currentSpu, ...spus];
      }

      // Stop if no SPUs
      if (spus.length === 0) {
        setIsLoading(false);
        return;
      }

      // 3. Call AI Recommendation API
      const inputSpus = spus.slice(0, 10); // Limit to 10
      const recommendations = await SearchService.getRecommendations(
        inputSpus,
        10
      );
      // Results: [{ spu: "LAP005", score: 0.94 }, ...]

      if (recommendations.length > 0) {
        // 4. Fetch full product details
        const recommendedSpus = recommendations.map((r) => r.spu);
        const productDetails =
          await ProductService.fetchProductsBySpus(recommendedSpus);

        setProducts(productDetails);
      }
    } catch (error) {
      console.error("Recommendation error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <ActivityIndicator />;
  }

  if (products.length === 0) {
    return null; // Don't show section if no recommendations
  }

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Gợi ý cho bạn</Text>
      <FlatList
        data={products}
        horizontal
        renderItem={({ item }) => <ProductCard product={item} />}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};
```

**Flutter:**

```dart
class RecommendationSection extends StatefulWidget {
  final String? currentSpu;

  RecommendationSection({this.currentSpu});

  @override
  _RecommendationSectionState createState() => _RecommendationSectionState();
}

class _RecommendationSectionState extends State<RecommendationSection> {
  List<Product> products = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    fetchRecommendations();
  }

  Future<void> fetchRecommendations() async {
    setState(() {
      isLoading = true;
    });

    try {
      List<String> spus = [];

      // 1. Get recent SPUs
      final user = await AuthService.getCurrentUser();
      if (user != null) {
        final recentSpus = await OrderService.getRecentProductSpus(10);
        spus.addAll(recentSpus);
      }

      // 2. Add current SPU
      if (widget.currentSpu != null) {
        spus.insert(0, widget.currentSpu!);
      }

      if (spus.isEmpty) {
        setState(() {
          isLoading = false;
        });
        return;
      }

      // 3. Get recommendations
      final inputSpus = spus.take(10).toList();
      final recommendations = await SearchService.getRecommendations(inputSpus, 10);

      if (recommendations.isNotEmpty) {
        // 4. Fetch products
        final recommendedSpus = recommendations
            .map((r) => r['spu'] as String)
            .toList();
        final productDetails = await ProductService.fetchProductsBySpus(recommendedSpus);

        setState(() {
          products = productDetails;
        });
      }
    } catch (e) {
      print('Recommendation error: $e');
    } finally {
      setState(() {
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return Center(child: CircularProgressIndicator());
    }

    if (products.isEmpty) {
      return SizedBox.shrink();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: EdgeInsets.all(16),
          child: Text(
            'Gợi ý cho bạn',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
        ),
        Container(
          height: 250,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: products.length,
            itemBuilder: (context, index) {
              return ProductCard(product: products[index]);
            },
          ),
        ),
      ],
    );
  }
}
```

**API Sequence:**

```http
1. GET /orders/recent-products-spus?k=10

Response:
["LAP001", "MOUSE02", "KEY03", ...]

2. POST /aiproxy/recommend
{
  "spus": ["LAP001", "MOUSE02", "KEY03"],
  "top_k": 10
}

Response:
{
  "data": [
    { "spu": "LAP005", "score": 0.94 },
    { "spu": "LAP007", "score": 0.91 }
  ]
}

3. GET /products/by-spus?spus=LAP005&spus=LAP007&size=2
```

### 10.4. Common Patterns & Best Practices

#### Pattern 1: Error Handling

```javascript
try {
  const spus = await getSpusFromAI();

  if (!spus || spus.length === 0) {
    // Show "No results" message
    showMessage("Không tìm thấy sản phẩm phù hợp");
    return;
  }

  const products = await ProductService.fetchProductsBySpus(spus);

  if (products.length === 0) {
    // SPUs valid but products not found (rare case)
    showMessage("Sản phẩm tạm thời không khả dụng");
    return;
  }

  // Success - display products
  displayProducts(products);
} catch (error) {
  console.error("Error:", error);
  showError("Có lỗi xảy ra, vui lòng thử lại");
}
```

#### Pattern 2: Loading States

```javascript
const [isLoading, setIsLoading] = useState(false);

const fetchData = async () => {
  setIsLoading(true);
  try {
    // API calls
  } catch (error) {
    // Handle error
  } finally {
    setIsLoading(false); // Always reset loading
  }
};

// UI
{
  isLoading ? <Loader /> : <Content />;
}
```

#### Pattern 3: Caching (Optional but recommended)

```javascript
import AsyncStorage from "@react-native-async-storage/async-storage";

class ProductCache {
  static async getProducts(spus) {
    const cacheKey = `products_${spus.sort().join("_")}`;

    // Try cache first
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      // Cache valid for 5 minutes
      if (Date.now() - timestamp < 5 * 60 * 1000) {
        return data;
      }
    }

    // Fetch from API
    const products = await ProductService.fetchProductsBySpus(spus);

    // Save to cache
    await AsyncStorage.setItem(
      cacheKey,
      JSON.stringify({
        data: products,
        timestamp: Date.now(),
      })
    );

    return products;
  }
}
```

#### Pattern 4: Pagination with SPUs

```javascript
// If AI returns many SPUs, paginate the product fetch
const fetchProductsInBatches = async (allSpus, batchSize = 10) => {
  const allProducts = [];

  for (let i = 0; i < allSpus.length; i += batchSize) {
    const batch = allSpus.slice(i, i + batchSize);
    const products = await ProductService.fetchProductsBySpus(batch);
    allProducts.push(...products);
  }

  return allProducts;
};
```

### 10.5. Request/Response Examples

#### Complete Chatbot Flow

```http
# Step 1: User sends message
POST /aiproxy/chat
{
  "question": "Laptop gaming dưới 20 triệu",
  "history": []
}

Response:
{
  "answer": "Dựa trên ngân sách của bạn, tôi gợi ý một số laptop gaming...",
  "intent": "product_recommendation",
  "related_products": ["LAP001", "LAP002", "LAP003"]
}

# Step 2: Fetch product details
GET /products/by-spus?spus=LAP001&spus=LAP002&spus=LAP003&size=3

Response:
{
  "content": [
    {
      "id": 1,
      "spu": "LAP001",
      "name": "Laptop Gaming ASUS ROG Strix G15",
      "imageUrl": "https://cdn.techbox.com/products/lap001.jpg",
      "displayOriginalPrice": 25000000,
      "displaySalePrice": 19990000,
      "discountType": "PERCENTAGE",
      "discountValue": 20,
      "averageRating": 4.5,
      "totalRatings": 128,
      "categoryName": "Laptop Gaming",
      "brandName": "ASUS",
      "variations": [...]
    },
    {
      "id": 2,
      "spu": "LAP002",
      "name": "Laptop Gaming MSI GF63 Thin",
      "imageUrl": "https://cdn.techbox.com/products/lap002.jpg",
      "displaySalePrice": 18500000,
      "averageRating": 4.3,
      "totalRatings": 95,
      ...
    }
  ],
  "totalPages": 1,
  "totalElements": 3
}
```

### 10.6. Testing SPU Integration

**Test Cases:**

1. **Valid SPUs**

```javascript
const spus = ["LAP001", "LAP002"];
const products = await ProductService.fetchProductsBySpus(spus);
expect(products.length).toBe(2);
expect(products[0].spu).toBe("LAP001");
```

2. **Empty SPU Array**

```javascript
const products = await ProductService.fetchProductsBySpus([]);
expect(products).toEqual([]);
```

3. **Invalid SPUs**

```javascript
const spus = ["INVALID001", "NOTFOUND002"];
const products = await ProductService.fetchProductsBySpus(spus);
// Should return empty or handle gracefully
expect(products.length).toBe(0);
```

4. **Mixed Valid/Invalid**

```javascript
const spus = ["LAP001", "INVALID002", "LAP003"];
const products = await ProductService.fetchProductsBySpus(spus);
// Should return only valid products
expect(products.length).toBeLessThanOrEqual(2);
```

### 10.7. Troubleshooting

**Problem**: SPUs trả về nhưng không có sản phẩm

**Solution**:

- Check backend logs: SPU có tồn tại trong database không?
- Verify query params format: `spus=LAP001&spus=LAP002` (not `spus[]=LAP001`)
- Ensure backend API `/products/by-spus` hoạt động

**Problem**: Lỗi 400 Bad Request

**Solution**:

- Check SPU array không empty
- Verify format: array of strings
- Check size parameter hợp lệ

**Problem**: Performance chậm

**Solution**:

- Implement caching
- Limit số lượng SPUs (max 20-30)
- Fetch products in batches if needed
- Use pagination

---

## 11. Conclusion

TechBox Store sử dụng AI để nâng cao trải nghiệm mua sắm:

### AI Features

1. **Chatbot**: Tư vấn sản phẩm thông minh 24/7
2. **Text Search**: Tìm kiếm ngữ nghĩa hiểu ý định người dùng
3. **Image Search**: Tìm sản phẩm tương tự qua hình ảnh
4. **Recommendations**: Gợi ý sản phẩm cá nhân hóa

### SPU Architecture Benefits

- ✅ Lightweight communication (only IDs transfer)
- ✅ Decoupled AI and Product services
- ✅ Reusable API endpoint (`/products/by-spus`)
- ✅ Easy to implement in any mobile framework

### Mobile Implementation Checklist

- [ ] Implement `ProductService.fetchProductsBySpus()`
- [ ] Integrate AI Chatbot with product display
- [ ] Add Text Search functionality
- [ ] Add Image Search with camera/gallery
- [ ] Implement Recommendation sections
- [ ] Add error handling & loading states
- [ ] Optional: Add caching for better performance
- [ ] Test all SPU-related flows

### Developer Resources

- Service files: `src/services/`
- Hooks: `src/hooks/`
- Components: `src/components/`
- Types: `src/features/`, `src/types/`

---

**Last Updated**: December 6, 2025
**Version**: 2.0.0
**Maintainer**: TechBox Development Team
