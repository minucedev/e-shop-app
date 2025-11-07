# 📖 API Usage Guide - TechBox Store

> Hướng dẫn sử dụng các API GET công khai cho khách hàng

## 📋 Mục lục

- [1. Products API](#1-products-api)
- [2. Product Variations API](#2-product-variations-api)
- [3. Campaigns API](#3-campaigns-api)
- [4. Brands API](#4-brands-api)
- [5. Categories API](#5-categories-api)
- [6. Cart API](#6-cart-api)
- [7. Wishlist API](#7-wishlist-api)

---

## 1. Products API

### 1.1. Lấy danh sách sản phẩm (có filter)

**Endpoint:** `GET /products`

**Mô tả:** Lấy danh sách sản phẩm với khả năng lọc, sắp xếp và phân trang

**Query Parameters:**

| Tham số | Kiểu | Bắt buộc | Mặc định | Mô tả |
|---------|------|----------|----------|-------|
| `name` | String | Không | - | Tìm kiếm theo tên sản phẩm |
| `brandId` | Integer | Không | - | Lọc theo thương hiệu |
| `categoryId` | Integer | Không | - | Lọc theo danh mục |
| `attributes` | List<String> | Không | - | Lọc theo thuộc tính (VD: "RAM:8GB", "Color:Black") |
| `minPrice` | BigDecimal | Không | - | Giá tối thiểu |
| `maxPrice` | BigDecimal | Không | - | Giá tối đa |
| `minRating` | Double | Không | - | Đánh giá tối thiểu (0-5) |
| `campaignId` | Integer | Không | - | Lọc sản phẩm theo chiến dịch khuyến mãi |
| `sortBy` | String | Không | `id` | Sắp xếp theo trường (id, name, price, rating) |
| `sortDirection` | String | Không | `ASC` | Hướng sắp xếp (ASC, DESC) |
| `page` | Integer | Không | `0` | Số trang (bắt đầu từ 0) |
| `size` | Integer | Không | `20` | Số sản phẩm mỗi trang |

**Request Example:**

```bash
GET /products?categoryId=1&minPrice=5000000&maxPrice=30000000&sortBy=price&sortDirection=ASC&page=0&size=20
```

**Response 200 OK:**

```json
{
  "content": [
    {
      "id": 1,
      "name": "iPhone 15 Pro Max",
      "imageUrl": "https://example.com/image.jpg",
      "warrantyMonths": 12,
      "displayOriginalPrice": 29990000,
      "displaySalePrice": 26991000,
      "discountType": "PERCENTAGE",
      "discountValue": 10,
      "averageRating": 4.5,
      "totalRatings": 120
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20
  },
  "totalElements": 45,
  "totalPages": 3,
  "last": false,
  "first": true
}
```

---

### 1.2. Lấy chi tiết sản phẩm

**Endpoint:** `GET /products/{id}`

**Mô tả:** Lấy thông tin chi tiết của một sản phẩm bao gồm các biến thể, thuộc tính, đánh giá

**Path Parameters:**

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `id` | Integer | ID của sản phẩm |

**Request Example:**

```bash
GET /products/1
```

**Response 200 OK:**

```json
{
  "id": 1,
  "name": "iPhone 15 Pro Max",
  "description": "iPhone 15 Pro Max với chip A17 Pro mạnh mẽ...",
  "imageUrl": "https://example.com/iphone-main.jpg",
  "imagePublicId": "products/iphone-15-pro-max",
  "categoryId": 1,
  "categoryName": "Điện thoại",
  "brandId": 1,
  "brandName": "Apple",
  "warrantyMonths": 12,
  "displayOriginalPrice": 29990000,
  "displaySalePrice": 26991000,
  "discountType": "PERCENTAGE",
  "discountValue": 10,
  "averageRating": 4.5,
  "totalRatings": 120,
  "variations": [
    {
      "id": 1,
      "variationName": "256GB - Titan Tự Nhiên",
      "price": 29990000,
      "salePrice": 26991000,
      "availableQuantity": 50,
      "discountType": "PERCENTAGE",
      "discountValue": 10,
      "imageUrls": [
        "https://example.com/variant1.jpg"
      ]
    }
  ],
  "attributes": [
    {
      "id": 1,
      "name": "Chip",
      "value": "A17 Pro"
    },
    {
      "id": 2,
      "name": "Màn hình",
      "value": "6.7 inch Super Retina XDR"
    }
  ]
}
```

**Response 404 Not Found:**

```json
{
  "message": "Product not found"
}
```

---

## 2. Product Variations API

### 2.1. Lấy chi tiết biến thể sản phẩm

**Endpoint:** `GET /product-variations/{id}`

**Mô tả:** Lấy thông tin chi tiết của một biến thể sản phẩm bao gồm giá sau khuyến mãi

**Path Parameters:**

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `id` | Integer | ID của biến thể |

**Query Parameters:**

| Tham số | Kiểu | Bắt buộc | Mặc định | Mô tả |
|---------|------|----------|----------|-------|
| `includeDeleted` | Boolean | Không | `false` | Bao gồm biến thể đã xóa |

**Request Example:**

```bash
GET /product-variations/1
```

**Response 200 OK:**

```json
{
  "id": 1,
  "variationName": "256GB - Titan Tự Nhiên",
  "productId": 1,
  "productName": "iPhone 15 Pro Max",
  "price": 29990000,
  "salePrice": 26991000,
  "imageUrls": [
    "https://example.com/variant1-1.jpg",
    "https://example.com/variant1-2.jpg"
  ],
  "availableQuantity": 50,
  "discountType": "PERCENTAGE",
  "discountValue": 10
}
```

**Giải thích các trường:**

- `price`: Giá gốc của biến thể
- `salePrice`: Giá sau khi áp dụng khuyến mãi (nếu có), nếu không có khuyến mãi thì bằng `price`
- `availableQuantity`: Số lượng có sẵn = stockQuantity - reservedQuantity
- `discountType`: Loại giảm giá (`PERCENTAGE` hoặc `FIXED`), `null` nếu không có khuyến mãi
- `discountValue`: Giá trị giảm (%, hoặc số tiền cố định), `null` nếu không có khuyến mãi

---

## 3. Campaigns API

### 3.1. Lấy danh sách chiến dịch đang hoạt động

**Endpoint:** `GET /campaigns/active`

**Mô tả:** Lấy tất cả các chiến dịch khuyến mãi đang hoạt động (trong khoảng thời gian hiệu lực)

**Request Example:**

```bash
GET /campaigns/active
```

**Response 200 OK:**

```json
[
  {
    "id": 1,
    "name": "Tuần lễ vàng iPhone",
    "description": "Giảm giá lớn cho tất cả iPhone",
    "image": "https://example.com/campaign1.jpg",
    "imageID": "campaign_images/abc123",
    "startDate": "2024-11-01T00:00:00Z",
    "endDate": "2024-11-30T23:59:59Z",
    "isActive": true,
    "createdAt": "2024-10-25T10:00:00Z"
  },
  {
    "id": 2,
    "name": "Black Friday 2024",
    "description": "Giảm đến 50% nhiều sản phẩm",
    "image": "https://example.com/campaign2.jpg",
    "imageID": "campaign_images/def456",
    "startDate": "2024-11-20T00:00:00Z",
    "endDate": "2024-11-27T23:59:59Z",
    "isActive": true,
    "createdAt": "2024-10-30T15:00:00Z"
  }
]
```

**Logic xác định campaign active:**

- `startDate <= currentTime <= endDate`
- `deletedAt` is `null`

---

## 4. Brands API

### 4.1. Lấy danh sách tất cả thương hiệu

**Endpoint:** `GET /brands`

**Mô tả:** Lấy danh sách tất cả các thương hiệu có trong hệ thống

**Request Example:**

```bash
GET /brands
```

**Response 200 OK:**

```json
[
  {
    "id": 1,
    "name": "Apple",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  {
    "id": 2,
    "name": "Samsung",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  {
    "id": 3,
    "name": "Xiaomi",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

---

### 4.2. Lấy chi tiết thương hiệu

**Endpoint:** `GET /brands/{id}`

**Mô tả:** Lấy thông tin chi tiết của một thương hiệu

**Path Parameters:**

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `id` | Integer | ID của thương hiệu |

**Request Example:**

```bash
GET /brands/1
```

**Response 200 OK:**

```json
{
  "id": 1,
  "name": "Apple",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

**Response 404 Not Found:**

```json
{
  "message": "Brand not found"
}
```

---

## 5. Categories API

### 5.1. Lấy danh sách tất cả danh mục

**Endpoint:** `GET /categories`

**Mô tả:** Lấy danh sách tất cả các danh mục (bao gồm cả danh mục con)

**Request Example:**

```bash
GET /categories
```

**Response 200 OK:**

```json
[
  {
    "id": 1,
    "name": "Điện thoại",
    "parentCategoryId": null,
    "parentCategoryName": null,
    "childCategories": [
      {
        "id": 11,
        "name": "iPhone",
        "parentCategoryId": 1,
        "parentCategoryName": "Điện thoại",
        "childCategories": []
      },
      {
        "id": 12,
        "name": "Samsung Galaxy",
        "parentCategoryId": 1,
        "parentCategoryName": "Điện thoại",
        "childCategories": []
      }
    ],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  {
    "id": 2,
    "name": "Laptop",
    "parentCategoryId": null,
    "parentCategoryName": null,
    "childCategories": [],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

---

### 5.2. Lấy danh sách danh mục gốc

**Endpoint:** `GET /categories/root`

**Mô tả:** Lấy chỉ các danh mục cấp cao nhất (không có parent)

**Request Example:**

```bash
GET /categories/root
```

**Response 200 OK:**

```json
[
  {
    "id": 1,
    "name": "Điện thoại",
    "parentCategoryId": null,
    "parentCategoryName": null,
    "childCategories": [],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  {
    "id": 2,
    "name": "Laptop",
    "parentCategoryId": null,
    "parentCategoryName": null,
    "childCategories": [],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

---

### 5.3. Lấy danh mục con

**Endpoint:** `GET /categories/{parentId}/children`

**Mô tả:** Lấy các danh mục con của một danh mục cha

**Path Parameters:**

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `parentId` | Integer | ID của danh mục cha |

**Request Example:**

```bash
GET /categories/1/children
```

**Response 200 OK:**

```json
[
  {
    "id": 11,
    "name": "iPhone",
    "parentCategoryId": 1,
    "parentCategoryName": "Điện thoại",
    "childCategories": [],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  {
    "id": 12,
    "name": "Samsung Galaxy",
    "parentCategoryId": 1,
    "parentCategoryName": "Điện thoại",
    "childCategories": [],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

---

## 6. Cart API

> **⚠️ Lưu ý:** Tất cả các API Cart yêu cầu authentication (đăng nhập)

**Authentication:** 
- Header: `Authorization: Bearer <access_token>`
- Role required: `CUSTOMER`

### 6.1. Xem giỏ hàng

**Endpoint:** `GET /cart`

**Mô tả:** Lấy thông tin giỏ hàng của người dùng hiện tại

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Example:**

```bash
GET /cart
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response 200 OK:**

```json
{
  "id": 1,
  "userId": 5,
  "items": [
    {
      "id": 1,
      "productVariationId": 5,
      "productName": "iPhone 15 Pro Max",
      "productImage": "https://example.com/iphone.jpg",
      "variantName": "256GB - Titan Tự Nhiên",
      "quantity": 2,
      "originalPrice": 29990000,
      "unitPrice": 26991000,
      "totalPrice": 53982000,
      "discountType": "PERCENTAGE",
      "discountValue": 10,
      "addedAt": "2024-11-05T10:30:00Z",
      "updatedAt": "2024-11-05T10:30:00Z",
      "sku": "IP15PM-256-TN",
      "stockQuantity": 50,
      "isAvailable": true
    },
    {
      "id": 2,
      "productVariationId": 8,
      "productName": "MacBook Pro M3",
      "productImage": "https://example.com/macbook.jpg",
      "variantName": "16GB RAM - 512GB SSD",
      "quantity": 1,
      "originalPrice": 49990000,
      "unitPrice": 49990000,
      "totalPrice": 49990000,
      "discountType": null,
      "discountValue": null,
      "addedAt": "2024-11-05T14:20:00Z",
      "updatedAt": "2024-11-05T14:20:00Z",
      "sku": "MBP-M3-16-512",
      "stockQuantity": 30,
      "isAvailable": true
    }
  ],
  "totalItems": 3,
  "subtotal": 103972000,
  "isEmpty": false,
  "summary": {
    "totalQuantity": 3,
    "totalAmount": 103972000,
    "originalTotal": 109970000,
    "savedAmount": 5998000,
    "uniqueItems": 2,
    "hasUnavailableItems": false
  },
  "createdAt": "2024-11-05T10:30:00Z",
  "updatedAt": "2024-11-05T14:20:00Z"
}
```

**Giải thích các trường quan trọng:**

- **originalPrice**: Giá gốc của sản phẩm
- **unitPrice**: Giá bán (sau khuyến mãi) - dùng để tính toán
- **totalPrice**: Tổng tiền của item = unitPrice × quantity
- **totalAmount**: Tổng tiền của giỏ hàng (sau khuyến mãi)
- **originalTotal**: Tổng tiền gốc (trước khuyến mãi)
- **savedAmount**: Số tiền tiết kiệm được = originalTotal - totalAmount

---

### 6.2. Số lượng sản phẩm trong giỏ

**Endpoint:** `GET /cart/count`

**Mô tả:** Lấy số lượng sản phẩm trong giỏ hàng (dùng để hiển thị badge)

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Example:**

```bash
GET /cart/count
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response 200 OK:**

```json
{
  "totalItems": 3,
  "uniqueItems": 2
}
```

**Giải thích:**

- `totalItems`: Tổng số lượng tất cả sản phẩm (tính cả số lượng)
- `uniqueItems`: Số loại sản phẩm khác nhau trong giỏ

---

## 7. Wishlist API

> **⚠️ Lưu ý:** Tất cả các API Wishlist yêu cầu authentication (đăng nhập)

**Authentication:** 
- Header: `Authorization: Bearer <access_token>`
- User phải đăng nhập

### 7.1. Xem danh sách yêu thích

**Endpoint:** `GET /wishlists`

**Mô tả:** Lấy danh sách sản phẩm yêu thích của người dùng với phân trang

**Headers:**

```
Authorization: Bearer <access_token>
```

**Query Parameters:**

| Tham số | Kiểu | Bắt buộc | Mặc định | Mô tả |
|---------|------|----------|----------|-------|
| `page` | Integer | Không | `0` | Số trang (bắt đầu từ 0) |
| `size` | Integer | Không | `20` | Số sản phẩm mỗi trang |
| `sortBy` | String | Không | `id` | Sắp xếp theo trường |
| `sortDirection` | String | Không | `DESC` | Hướng sắp xếp (ASC, DESC) |

**Request Example:**

```bash
GET /wishlists?page=0&size=20&sortBy=id&sortDirection=DESC
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response 200 OK:**

```json
{
  "content": [
    {
      "id": 1,
      "name": "iPhone 15 Pro Max",
      "imageUrl": "https://example.com/iphone.jpg",
      "warrantyMonths": 12,
      "displayOriginalPrice": 29990000,
      "displaySalePrice": 26991000,
      "discountType": "PERCENTAGE",
      "discountValue": 10,
      "averageRating": 4.5,
      "totalRatings": 120
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20
  },
  "totalElements": 15,
  "totalPages": 1,
  "last": true,
  "first": true
}
```

---

### 7.2. Thêm sản phẩm vào wishlist

**Endpoint:** `POST /wishlists`

**Mô tả:** Thêm một sản phẩm vào danh sách yêu thích

**Headers:**

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "productId": 1
}
```

**Request Example:**

```bash
POST /wishlists
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "productId": 1
}
```

**Response 201 Created:**

```json
{
  "id": 1,
  "name": "iPhone 15 Pro Max",
  "imageUrl": "https://example.com/iphone.jpg",
  "warrantyMonths": 12,
  "displayOriginalPrice": 29990000,
  "displaySalePrice": 26991000,
  "discountType": "PERCENTAGE",
  "discountValue": 10,
  "averageRating": 4.5,
  "totalRatings": 120
}
```

**Response 400 Bad Request:**

```json
{
  "error": "Product already in wishlist"
}
```

---

### 7.3. Xóa sản phẩm khỏi wishlist

**Endpoint:** `DELETE /wishlists/{productId}`

**Mô tả:** Xóa một sản phẩm khỏi danh sách yêu thích

**Headers:**

```
Authorization: Bearer <access_token>
```

**Path Parameters:**

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `productId` | Integer | ID của sản phẩm cần xóa |

**Request Example:**

```bash
DELETE /wishlists/1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response 204 No Content:**

```
(No response body)
```

**Response 404 Not Found:**

```json
{
  "error": "Product not in wishlist"
}
```

---

### 7.4. Kiểm tra sản phẩm trong wishlist

**Endpoint:** `POST /wishlists/check`

**Mô tả:** Kiểm tra nhiều sản phẩm có trong wishlist hay không (dùng để hiển thị icon trái tim)

**Headers:**

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "productIds": [1, 2, 3, 5, 8]
}
```

**Request Example:**

```bash
POST /wishlists/check
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "productIds": [1, 2, 3, 5, 8]
}
```

**Response 200 OK:**

```json
{
  "1": true,
  "2": false,
  "3": true,
  "5": false,
  "8": true
}
```

**Giải thích:**

- Key: `productId`
- Value: `true` nếu có trong wishlist, `false` nếu không

---

## 📌 Error Responses

### Common Error Codes

| Status Code | Mô tả |
|-------------|-------|
| 400 | Bad Request - Dữ liệu không hợp lệ |
| 401 | Unauthorized - Chưa đăng nhập hoặc token hết hạn |
| 403 | Forbidden - Không có quyền truy cập |
| 404 | Not Found - Không tìm thấy tài nguyên |
| 500 | Internal Server Error - Lỗi server |

### Error Response Format

```json
{
  "error": "Error message here",
  "timestamp": "2024-11-06T10:30:00Z"
}
```

---

## 🔐 Authentication

### Lấy Access Token

**Endpoint:** `POST /auth/login`

**Request Body:**

```json
{
  "email": "customer@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600
}
```

### Sử dụng Token

Thêm header `Authorization` vào mọi request cần authentication:

```
Authorization: Bearer <access_token>
```

---

## 📝 Notes

1. **Pagination**: Tất cả API trả về danh sách đều hỗ trợ phân trang
2. **Sorting**: Có thể sắp xếp theo nhiều trường khác nhau
3. **Filtering**: Products API hỗ trợ filter rất linh hoạt
4. **Price Calculation**: 
   - `originalPrice`: Giá gốc
   - `salePrice`: Giá sau khuyến mãi (realtime)
   - Cart tính toán dựa trên `salePrice`
5. **Stock Availability**: Kiểm tra `isAvailable` và `stockQuantity` trước khi đặt hàng

---

## 🚀 Quick Start Examples

### 1. Xem sản phẩm iPhone

```bash
GET /products?name=iPhone&brandId=1&sortBy=price&sortDirection=ASC
```

### 2. Xem chi tiết sản phẩm

```bash
GET /products/1
```

### 3. Xem campaigns đang chạy

```bash
GET /campaigns/active
```

### 4. Xem giỏ hàng

```bash
GET /cart
Authorization: Bearer <token>
```

### 5. Thêm vào wishlist

```bash
POST /wishlists
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": 1
}
```

---

**Last Updated:** November 6, 2025
**API Version:** 1.0
**Base URL:** `http://localhost:8080` (Development)
