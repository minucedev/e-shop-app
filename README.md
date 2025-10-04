# 🛍️ E-Shop App

> Ứng dụng mua sắm trực tuyến hiện đại được xây dựng với React Native và Expo

## � Giới thiệu

E-Shop App là một ứng dụng thương mại điện tử di động được phát triển bằng React Native với Expo framework. Ứng dụng cung cấp trải nghiệm mua sắm hoàn chỉnh với giao diện người dùng hiện đại và các tính năng đầy đủ.

### ✨ Tính năng chính

#### 🔐 **Xác thực người dùng**

- Đăng ký tài khoản mới
- Đăng nhập với email/password
- Quên mật khẩu và đặt lại
- Bảo vệ route với AuthGuard

#### 🏪 **Trang chủ & Khám phá**

- Hiển thị sản phẩm nổi bật
- Danh mục sản phẩm phổ biến
- Giao diện Welcome thân thiện
- Navigation mượt mà

#### 🛒 **Mua sắm**

- **Shop**: Duyệt tất cả sản phẩm với pagination
- **Tìm kiếm**: Search sản phẩm theo tên
- **Lọc & Sắp xếp**:
  - Lọc theo thương hiệu (Brand)
  - Lọc theo danh mục (Category)
  - Lọc theo khoảng giá
  - Sắp xếp theo giá, tên, mới nhất
- **Favorites**: Yêu thích sản phẩm với đồng bộ real-time
- **Cart**: Giỏ hàng với quản lý số lượng

#### 💳 **Thanh toán**

- Hiển thị thông tin người mua
- Chọn phương thức giao hàng
- Tính toán tổng tiền tự động
- Phí giao hàng linh hoạt

#### 👤 **Hồ sơ người dùng**

- Chỉnh sửa thông tin cá nhân
- Quản lý địa chỉ giao hàng
- Lịch sử đơn hàng
- Cài đặt tài khoản

### 🏗️ Kiến trúc

#### **Tech Stack**

- **Framework**: React Native với Expo
- **Language**: TypeScript
- **Navigation**: Expo Router (file-based routing)
- **Styling**: TailwindCSS + NativeWind
- **State Management**: React Context API
- **Storage**: AsyncStorage
- **Icons**: Expo Vector Icons

#### **Cấu trúc dự án**

```
app/
├── (app)/                    # Protected routes (cần đăng nhập)
│   ├── (tabs)/              # Bottom tab navigation
│   │   ├── home.tsx         # Trang chủ
│   │   ├── shop.tsx         # Cửa hàng với filter
│   │   ├── favorites.tsx    # Sản phẩm yêu thích
│   │   ├── cart.tsx         # Giỏ hàng
│   │   └── profile.tsx      # Hồ sơ người dùng
│   └── (screens)/           # Additional screens
│       ├── cart-purchase.tsx # Thanh toán
│       ├── edit-profile.tsx  # Chỉnh sửa profile
│       └── edit-address.tsx  # Chỉnh sửa địa chỉ
├── (auth)/                  # Authentication routes
│   ├── login.tsx           # Đăng nhập
│   ├── signup.tsx          # Đăng ký
│   └── resetpassword.tsx   # Quên mật khẩu
├── _layout.tsx             # Root layout
├── index.tsx               # Entry point
└── welcome.tsx             # Welcome screen

contexts/
├── AuthContext.tsx         # Quản lý authentication
├── ProductContext.tsx      # Quản lý dữ liệu sản phẩm
└── FavoritesContext.tsx   # Quản lý favorites

components/
└── AuthGuard.tsx          # Bảo vệ routes

constants/
├── colors.ts              # Màu sắc
└── fonts.ts              # Font chữ
```

#### **Context Architecture**

- **AuthContext**: Quản lý đăng nhập, thông tin user
- **ProductContext**: Quản lý sản phẩm, search, filter, pricing
- **FavoritesContext**: Đồng bộ favorites giữa các màn hình

## 🚀 Cài đặt và Chạy

### Yêu cầu hệ thống

- **Node.js**: >= 18.0.0
- **npm**: >= 8.0.0 hoặc **Yarn**: >= 1.22.0
- **Expo CLI**: Latest version
- **React Native CLI**: (Optional, cho development build)

### 📦 Cài đặt

1. **Clone repository**

   ```bash
   git clone <repository-url>
   cd e-shop-app
   ```

2. **Cài đặt dependencies**

   ```bash
   npm install
   # hoặc
   yarn install
   ```

3. **Cài đặt Expo CLI (nếu chưa có)**
   ```bash
   npm install -g @expo/cli
   ```

### 🏃‍♂️ Chạy ứng dụng

1. **Khởi động development server**

   ```bash
   npx expo start
   # hoặc
   npm start
   ```

2. **Chạy trên thiết bị**

   **Expo Go (Recommended for development):**
   - Tải app **Expo Go** từ App Store/Google Play
   - Quét QR code từ terminal

   **iOS Simulator:**

   ```bash
   npx expo start --ios
   ```

   **Android Emulator:**

   ```bash
   npx expo start --android
   ```

   **Web Browser:**

   ```bash
   npx expo start --web
   ```

### 🔧 Scripts có sẵn

```bash
npm start          # Khởi động Expo development server
npm run android    # Chạy trên Android emulator
npm run ios        # Chạy trên iOS simulator
npm run web        # Chạy trên web browser
npm run lint       # Chạy ESLint
```

## 🎯 Hướng dẫn Development

### Thêm sản phẩm mới

Chỉnh sửa file `contexts/ProductContext.tsx` và thêm vào mảng `seedProducts`:

```typescript
{
  id: 16,
  name: "Tên sản phẩm",
  description: "Mô tả sản phẩm",
  price: 99.99,
  stock: 50,
  sku: "SKU001",
  image: "https://example.com/image.jpg",
  brandId: 1,
  brandName: "Brand Name",
  categoryId: 1,
  categoryName: "Category Name",
  // ... other fields
}
```

### Thêm Category/Brand mới

Cập nhật các mảng `categories` và `brands` trong `ProductContext.tsx`.

### Customization

- **Colors**: Chỉnh sửa `constants/colors.ts`
- **Fonts**: Cập nhật `constants/fonts.ts`
- **Styling**: Sử dụng TailwindCSS classes

## 📱 Screenshots

_// TODO: Thêm screenshots của app_

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Contact

**Dự án**: E-Shop App  
**Repository**: [GitHub](https://github.com/minucedev/e-shop-app)

---

⭐ **Đừng quên star repository nếu project hữu ích cho bạn!**
