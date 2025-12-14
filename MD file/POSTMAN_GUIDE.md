# Hướng dẫn Test API với Postman

## Base URL

```
http://localhost:8000
```

---

## 1. 🔍 Tìm kiếm sản phẩm bằng văn bản

### Endpoint

```
POST http://localhost:8000/search/text
```

### Headers

```
Content-Type: application/json
```

### Body (raw JSON)

```json
{
  "query": "Laptop gaming giá rẻ RTX 4060",
  "top_k": 10
}
```

### Response Example

```json
{
  "status": "success",
  "data": [
    {
      "spu": "PRD-CE1BB567",
      "full_text": "",
      "score": 0.5642926692962646
    },
    {
      "spu": "PRD-51AC82E0",
      "full_text": "",
      "score": 0.5533217787742615
    }
  ]
}
```

---

## 2. 💡 Gợi ý sản phẩm cá nhân hóa

### Endpoint

```
POST http://localhost:8000/recommend
```

### Headers

```
Content-Type: application/json
```

### Body (raw JSON)

```json
{
  "spus": ["PRD-CE1BB567", "PRD-51AC82E0"],
  "top_k": 5
}
```

### Response Example

```json
{
  "data": [
    {
      "spu": "PRD-4B7C996E",
      "score": 0.8954131007194519
    },
    {
      "spu": "PRD-227DC75B",
      "score": 0.8913059234619141
    }
  ]
}
```

---

## 3. 🖼️ Tìm kiếm sản phẩm bằng hình ảnh

### Endpoint

```
POST http://localhost:8000/search/image?top_k=10
```

### Headers

```
(Không cần set, Postman tự động set Content-Type: multipart/form-data)
```

### Body (form-data)

```
Key: file
Type: File
Value: [Chọn file ảnh từ máy tính]

Key: top_k (Optional)
Type: Text
Value: 10
```

### Cách làm trong Postman:

1. Chọn tab **Body**
2. Chọn **form-data**
3. Thêm key `file`, chọn type là **File**
4. Click **Select Files** và chọn ảnh sản phẩm
5. (Optional) Thêm key `top_k` với value `10`

### Response Example

```json
{
  "data": [
    {
      "spu": "PRD-52B77FF2",
      "score": 0.829655110836029
    },
    {
      "spu": "PRD-4276CFFE",
      "score": 0.813904881477356
    }
  ]
}
```

---

## 4. 💬 Chatbot hỗ trợ khách hàng

### Endpoint

```
POST http://localhost:8000/chat
```

### Headers

```
Content-Type: application/json
```

### Body (raw JSON) - Câu hỏi đầu tiên (không có lịch sử)

```json
{
  "question": "Tôi muốn mua laptop gaming",
  "history": []
}
```

### Body (raw JSON) - Câu hỏi tiếp theo (có lịch sử)

```json
{
  "question": "Con nào giá rẻ nhất?",
  "history": [
    {
      "role": "user",
      "content": "Tôi muốn mua laptop gaming"
    },
    {
      "role": "assistant",
      "content": "Chào bạn! Bên mình có nhiều laptop gaming như Lenovo Legion, ASUS TUF..."
    }
  ]
}
```

### Body (raw JSON) - Hỏi về chính sách

```json
{
  "question": "Chính sách bảo hành như thế nào?",
  "history": []
}
```

### Body (raw JSON) - Chào hỏi thông thường

```json
{
  "question": "Xin chào!",
  "history": []
}
```

### Response Example (Intent: PRODUCT)

```json
{
  "answer": "Chào bạn 👋! TechBoxStore rất vui được tư vấn cho bạn về laptop gaming...",
  "intent": "PRODUCT",
  "related_products": ["PRD-4B7C996E", "PRD-3CA4CA5C", "PRD-CE1BB567"],
  "src": ""
}
```

### Response Example (Intent: POLICY)

```json
{
  "answer": "Chính sách bảo hành của TechBoxStore như sau: Tất cả sản phẩm đều được bảo hành chính hãng từ 12-36 tháng...",
  "intent": "POLICY",
  "related_products": [],
  "src": "- policy_warranty.md\n- policy_return.md"
}
```

### Response Example (Intent: CHITCHAT)

```json
{
  "answer": "Xin chào! Mình là trợ lý AI của TechBoxStore. Bạn cần tư vấn gì về sản phẩm công nghệ không ạ?",
  "intent": "CHITCHAT",
  "related_products": [],
  "src": ""
}
```

---

## 5. 🔄 Đồng bộ sản phẩm (Sync API)

### Endpoint - Thêm/Cập nhật sản phẩm

```
POST http://localhost:8000/sync/products
```

### Headers

```
Content-Type: application/json
X-API-Key: your-api-key
```

### Body (raw JSON)

```json
{
  "id": 123,
  "name": "Laptop Dell XPS 15",
  "description": "Laptop cao cấp cho dân văn phòng",
  "categoryId": 1,
  "categoryName": "Laptop",
  "spu": "PRD-DELL-XPS15",
  "brandId": 5,
  "brandName": "Dell",
  "imageUrl": "https://example.com/image.jpg",
  "imagePublicId": "dell_xps_15",
  "warrantyMonths": 24,
  "averageRating": 4.5,
  "totalRatings": 120,
  "displayOriginalPrice": 35000000,
  "displaySalePrice": 32000000,
  "discountType": "PERCENTAGE",
  "discountValue": 10,
  "attributes": [
    {
      "id": 1,
      "name": "CPU",
      "value": "Intel Core i7-12700H"
    },
    {
      "id": 2,
      "name": "RAM",
      "value": "16GB DDR5"
    }
  ],
  "variations": [
    {
      "id": 1,
      "variationName": "Bạc - 512GB",
      "sku": "SKU-001",
      "price": 35000000,
      "availableQuantity": 10,
      "salePrice": 32000000,
      "discountType": "PERCENTAGE",
      "discountValue": 10,
      "images": [
        {
          "id": 1,
          "imageUrl": "https://example.com/variant1.jpg"
        }
      ],
      "attributes": [
        {
          "id": 1,
          "name": "Màu sắc",
          "value": "Bạc"
        },
        {
          "id": 2,
          "name": "SSD",
          "value": "512GB"
        }
      ]
    }
  ]
}
```

### Response

```json
{
  "status": "Products synchronized successfully"
}
```

---

### Endpoint - Xóa sản phẩm

```
DELETE http://localhost:8000/sync/products/PRD-DELL-XPS15
```

### Headers

```
X-API-Key: your-api-key
```

### Response

```json
{
  "status": "Product PRD-DELL-XPS15 deleted from sync successfully"
}
```

---

## 📌 Lưu ý quan trọng

### 1. Chatbot History

- **Chỉ gửi tối đa 10 tin nhắn gần nhất** trong history
- Format đúng: `role` là `"user"` hoặc `"assistant"`

### 2. Intent trong Chatbot

- **PRODUCT**: Hỏi về sản phẩm → Hiển thị `related_products`
- **POLICY**: Hỏi chính sách → Chỉ hiển thị `answer`
- **CHITCHAT**: Chào hỏi, trêu đùa → Chỉ hiển thị `answer`

### 3. Image Search

- Chỉ hỗ trợ ảnh định dạng: JPG, PNG, JPEG
- Kích thước khuyến nghị: < 5MB

### 4. SPU Format

- SPU có dạng: `PRD-XXXXXXXX`
- Tất cả API đều trả về danh sách SPU, cần gọi Spring API `/products/by-spus` để lấy thông tin chi tiết

### 5. Sync API

- Yêu cầu `X-API-Key` trong header
- Dùng để đồng bộ dữ liệu từ Spring Backend sang AI Service

---

## 🧪 Test Flow

### Flow 1: Tìm kiếm và gợi ý

1. Gọi `/search/text` với query "laptop gaming"
2. Lấy 2 SPU đầu tiên từ kết quả
3. Gọi `/recommend` với 2 SPU đó
4. Nhận danh sách SPU được gợi ý

### Flow 2: Chatbot liên tục

1. Gọi `/chat` với câu hỏi đầu tiên
2. Lưu lại câu hỏi và câu trả lời vào biến
3. Gọi `/chat` với câu hỏi tiếp theo + history
4. Tiếp tục lặp lại

### Flow 3: Search by Image

1. Chuẩn bị ảnh sản phẩm (ví dụ: laptop)
2. Gọi `/search/image` với file ảnh
3. Nhận danh sách SPU tương tự

---

## 📚 API Documentation (Swagger)

Mở trình duyệt và truy cập:

```
http://localhost:8000/docs
```

Tại đây bạn có thể:

- Xem chi tiết tất cả API
- Test trực tiếp trên giao diện
- Xem schema của request/response
