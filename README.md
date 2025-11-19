# 🛍️ E-Shop App

> Ứng dụng mua sắm trực tuyến hiện đại được xây dựng với React Native và Expo

## 📋 Mục lục

- [Giới thiệu](#-giới-thiệu)
- [Quick Start](#-quick-start)
- [Cài đặt và Chạy](#-cài-đặt-và-chạy)
- [Cấu hình Backend URL](#-cấu-hình-backend-url-quan-trọng)
- [Build APK](#-build-apk-android)
- [Troubleshooting](#-troubleshooting-xử-lý-lỗi-thường-gặp)
- [Kiến trúc](#️-kiến-trúc)

## ⚡ Quick Start

**Chạy nhanh trong 3 bước:**

```bash
# 1. Cài đặt dependencies
npm install

# 2. Cập nhật IP backend
npm run update-ip

# 3. Khởi động app
Cách 1: npm start
Cách 2: npx expo start
# Quét QR code bằng Expo Go app
```

**Lưu ý:**

- ✅ Backend phải chạy trên cổng 8081
- ✅ Điện thoại và máy tính cùng WiFi
- ✅ Đã cài app **Expo Go** trên điện thoại

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
npm run update-ip  # Cập nhật IP máy vào .env.local (quan trọng!)
npm run android    # Chạy trên Android emulator
npm run ios        # Chạy trên iOS simulator
npm run web        # Chạy trên web browser
npm run lint       # Chạy ESLint
```

### 🌐 Cấu hình Backend URL (Quan trọng!)

#### Khi IP máy thay đổi hoặc lần đầu chạy:

**Bước 1: Cập nhật IP tự động**

```bash
npm run update-ip
```

Script này sẽ:

- ✅ Tự động tìm IP máy tính (bỏ qua IP ảo của WSL/Docker)
- ✅ Cập nhật file `.env.local` với IP đúng
- ✅ Hiển thị API Base URL để kiểm tra

**Bước 2: Kiểm tra file `.env.local`**

```bash
EXPO_PUBLIC_API_BASE_URL=http://192.168.70.13:8081/api
EXPO_PUBLIC_IMAGE_BASE_URL=http://192.168.70.13:8081/uploads
```

**Lưu ý:**

- ⚠️ IP `192.168.x.x` hoặc `10.x.x.x` là IP thật của mạng LAN
- ❌ Tránh IP `172.x.x.x` (thường là IP ảo của WSL/Docker/Hyper-V)
- 📱 Điện thoại phải kết nối **cùng WiFi** với máy tính chạy backend

#### Cách thủ công (nếu cần):

1. **Tìm IP máy:**

   ```bash
   ipconfig
   ```

   Tìm dòng **"IPv4 Address"** trong phần **"Wireless LAN adapter Wi-Fi"**

2. **Cập nhật `.env.local`** với IP vừa tìm được

3. **Restart app:**
   ```bash
   npm start
   ```

## 🎯 Hướng dẫn Development

### 🐛 Troubleshooting (Xử lý lỗi thường gặp)

#### ❌ Lỗi: "Network request failed" hoặc không kết nối được backend

**Nguyên nhân:**

- IP trong `.env.local` không đúng hoặc đã thay đổi
- Backend không chạy
- Điện thoại và máy tính khác mạng WiFi

**Giải pháp:**

```bash
# 1. Cập nhật IP
npm run update-ip

# 2. Kiểm tra backend đang chạy
# Backend phải chạy trên http://[IP]:8081

# 3. Kiểm tra cùng WiFi
# Điện thoại và máy tính phải cùng mạng WiFi

# 4. Restart app
npm start
# Quét QR code lại
```

#### ❌ Lỗi: Script lấy nhầm IP ảo (172.x.x.x)

**Nguyên nhân:**

- Máy có WSL, Docker, Hyper-V tạo ra IP ảo

**Giải pháp:**
Script `update-ip.ps1` đã được cập nhật để:

- ✅ Ưu tiên IP thật (192.168.x.x hoặc 10.x.x.x)
- ✅ Bỏ qua IP ảo (172.x.x.x, 169.x.x.x)
- ✅ Chỉ lấy IP từ Wi-Fi hoặc Ethernet adapter

Nếu vẫn sai, sửa thủ công trong `.env.local`

#### ❌ Lỗi: Build APK failed trong Android Studio

**Nguyên nhân:**

- Gradle cache lỗi
- Dependencies không sync

**Giải pháp:**

```bash
# 1. Clean prebuild
npx expo prebuild --clean

# 2. Clean Gradle
cd android
.\gradlew clean
cd ..

# 3. Trong Android Studio:
# File → Invalidate Caches → Invalidate and Restart
```

#### ❌ Lỗi: "ANDROID_HOME not set"

**Nguyên nhân:**

- Android SDK chưa được cài hoặc không config đúng

**Giải pháp:**

- Sử dụng Android Studio để build (không cần set ANDROID_HOME)
- Hoặc dùng EAS Build cloud

#### ❌ Lỗi: Java version không tương thích

**Giải pháp:**

```bash
# Kiểm tra Java version
java -version

# Cần Java JDK 11 hoặc cao hơn
# Download tại: https://adoptium.net/
```

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

## 📱 Build APK (Android)

### Yêu cầu:

- Android Studio đã cài đặt
- Java JDK 11+ (Android Studio sẽ tự cài)

### 🔨 Cách 1: Build bằng Android Studio (Khuyến nghị)

**Bước 1: Prebuild project**

```bash
npx expo prebuild --platform android
```

**Bước 2: Mở Android Studio**

1. Mở Android Studio
2. Chọn **File** → **Open**
3. Chọn folder `android/` trong project
4. Đợi Gradle sync hoàn tất

**Bước 3: Build APK**

1. Chọn **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
2. Đợi build hoàn tất (5-15 phút)
3. APK sẽ nằm ở: `android/app/build/outputs/apk/debug/app-debug.apk`

**Bước 4: Cài đặt APK**

```bash
# Kết nối điện thoại qua USB (bật USB Debugging)
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### 🌐 Cách 2: Build qua EAS Cloud (Nếu không có Android Studio)

**Bước 1: Cài EAS CLI**

```bash
npm install -g eas-cli
```

**Bước 2: Login Expo**

```bash
eas login
```

**Bước 3: Build APK**

```bash
# Build APK preview (không cần publish)
eas build --platform android --profile preview

# Hoặc build production
eas build --platform android --profile production
```

**Lưu ý:**

- Build cloud mất 10-30 phút (tùy hàng đợi)
- Cần tài khoản Expo (miễn phí)
- APK sẽ được tải về sau khi build xong

### ⚠️ Quan trọng trước khi build:

1. **Cập nhật IP trong `.env.local`:**

   ```bash
   npm run update-ip
   ```

2. **Kiểm tra backend đang chạy:**
   - Backend phải chạy trên cổng 8081
   - Điện thoại và máy tính cùng WiFi

3. **Clean build nếu gặp lỗi:**
   ```bash
   npx expo prebuild --clean
   cd android && .\gradlew clean
   ```

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
