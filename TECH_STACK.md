# Tech Stack & Architecture - E-Shop Mobile App

Tài liệu chi tiết về các công nghệ và kiến trúc được sử dụng trong dự án E-Shop Mobile App.

## Mục lục

- [Tổng quan](#tổng-quan)
- [Core Technologies](#core-technologies)
- [UI/UX Technologies](#uiux-technologies)
- [State Management](#state-management)
- [Navigation & Routing](#navigation--routing)
- [API & Data Management](#api--data-management)
- [Development Tools](#development-tools)
- [Build & Deployment](#build--deployment)
- [Project Architecture](#project-architecture)

---

## Tổng quan

E-Shop Mobile App là ứng dụng thương mại điện tử cross-platform được xây dựng với **React Native** và **Expo**, hỗ trợ cả iOS và Android từ một codebase duy nhất.

### Highlights

- ✅ **Cross-platform**: iOS & Android
- ✅ **TypeScript**: Type-safe development
- ✅ **Modern UI**: TailwindCSS + NativeWind
- ✅ **File-based routing**: Expo Router
- ✅ **AI Integration**: Chatbot & Image Search
- ✅ **Real-time updates**: Context API + AsyncStorage
- ✅ **Optimized performance**: React 19 + React Native 0.81

---

## Core Technologies

### 1. React Native (v0.81.4)

**Framework chính để xây dựng mobile app**

```typescript
// React Native Core
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
```

**Tính năng:**
- Native components (View, Text, Image, etc.)
- Native modules (Camera, File Picker, etc.)
- Performance tối ưu với native threads
- Hot Reload & Fast Refresh

**Use Cases:**
- UI Components (Button, Card, List)
- Layout & Styling
- User interactions (Touch, Gesture)
- Platform-specific code

### 2. React (v19.1.0)

**UI Library mới nhất**

```typescript
// React 19 Features
import { useState, useEffect, useContext, createContext } from "react";
```

**Tính năng mới:**
- Improved performance
- Better error handling
- Enhanced hooks
- Server Components support (future)

**Patterns được sử dụng:**
- **Functional Components**: 100% function-based
- **Hooks**: useState, useEffect, useContext, useMemo, useCallback
- **Custom Hooks**: useAuth, useProduct, useCart, useDebounce
- **Context API**: Global state management

### 3. TypeScript (v5.9.2)

**Type-safe JavaScript**

**Configuration:**
```json
// tsconfig.json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

**Benefits:**
- ✅ Type checking at compile time
- ✅ IntelliSense & Auto-completion
- ✅ Prevent runtime errors
- ✅ Better code documentation
- ✅ Easier refactoring

**Examples:**
```typescript
// Type-safe API calls
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

const login = async (data: LoginRequest): Promise<LoginResponse> => {
  // Implementation
};

// Type-safe component props
interface ProductCardProps {
  product: Product;
  onPress: (id: number) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
  // Component
};
```

### 4. Expo SDK (v54.0.12)

**Development platform cho React Native**

**Core Packages:**
- `expo-router` - File-based routing
- `expo-constants` - App configuration
- `expo-font` - Custom fonts
- `expo-image` - Optimized image component
- `expo-linking` - Deep linking
- `expo-splash-screen` - Splash screen management
- `expo-status-bar` - Status bar control

**Media Packages:**
- `expo-image-picker` - Image selection từ gallery/camera
- `expo-haptics` - Haptic feedback

**Development Features:**
- ✅ Expo Go for quick testing
- ✅ OTA Updates
- ✅ Easy native module integration
- ✅ EAS Build for production builds

**Example Usage:**
```typescript
// expo-image-picker
import * as ImagePicker from "expo-image-picker";

const pickImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.8,
  });
  
  if (!result.canceled) {
    const imageUri = result.assets[0].uri;
    // Process image
  }
};

// expo-constants
import Constants from "expo-constants";

const getApiUrl = () => {
  const ip = Constants.expoConfig?.hostUri?.split(":")[0];
  return `http://${ip}:8081/api`;
};
```

---

## UI/UX Technologies

### 1. NativeWind (v4.2.1)

**TailwindCSS cho React Native**

**Setup:**
```javascript
// metro.config.js
const { withNativeWind } = require("nativewind/metro");
module.exports = withNativeWind(config, { input: "./app/global.css" });

// tailwind.config.js
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}", 
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
};
```

**Usage:**
```tsx
import { View, Text } from "react-native";

// Utility-first styling
<View className="flex-1 bg-white p-4">
  <Text className="text-2xl font-bold text-gray-900">
    Hello World
  </Text>
  <View className="flex-row items-center justify-between mt-4">
    <Text className="text-sm text-gray-500">Subtitle</Text>
  </View>
</View>
```

**Benefits:**
- ✅ Rapid UI development
- ✅ Consistent design system
- ✅ Responsive utilities
- ✅ Dark mode support
- ✅ No StyleSheet.create overhead

**Common Patterns:**
```tsx
// Layout
className="flex-1 flex-row items-center justify-between"

// Spacing
className="p-4 px-6 py-3 m-2 mx-4 my-2"

// Typography
className="text-lg font-bold text-gray-900"

// Colors
className="bg-blue-500 text-white"

// Borders & Shadows
className="border border-gray-200 rounded-xl shadow-lg"
```

### 2. React Native Gesture Handler (v2.28.0)

**Advanced gesture system**

```typescript
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Wrap root component
<GestureHandlerRootView style={{ flex: 1 }}>
  <App />
</GestureHandlerRootView>
```

**Features:**
- Swipe gestures
- Pan & Pinch
- Long press
- Better touch handling than React Native core

### 3. React Native Reanimated (v4.1.1)

**Smooth animations**

```typescript
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring 
} from "react-native-reanimated";

const offset = useSharedValue(0);

const animatedStyles = useAnimatedStyle(() => ({
  transform: [{ translateX: offset.value }],
}));

<Animated.View style={animatedStyles}>
  {/* Content */}
</Animated.View>
```

**Use Cases:**
- Smooth scrolling
- Interactive animations
- Gestures with animations
- 60 FPS performance

### 4. React Native Safe Area Context (v5.6.0)

**Handle safe areas (notch, status bar)**

```typescript
import { SafeAreaView } from "react-native-safe-area-context";

<SafeAreaView edges={["top"]} className="flex-1 bg-white">
  {/* Content is automatically adjusted */}
</SafeAreaView>
```

**Benefits:**
- Auto-adjust for iPhone notch
- Status bar handling
- Bottom tab bar spacing
- Cross-platform consistency

### 5. Custom Fonts (Poppins)

**Typography system**

```typescript
// constants/fonts.ts
export const fonts = {
  Regular: "Poppins-Regular",
  Medium: "Poppins-Medium",
  SemiBold: "Poppins-SemiBold",
  Bold: "Poppins-Bold",
  Light: "Poppins-Light",
};

// app/_layout.tsx
import { useFonts } from "expo-font";

const [fontsLoaded] = useFonts({
  [fonts.Regular]: require("@/assets/fonts/poppins_regular.ttf"),
  [fonts.Bold]: require("@/assets/fonts/poppins_bold.ttf"),
  // ...
});
```

**Usage:**
```typescript
<Text style={{ fontFamily: fonts.Bold }}>Bold Text</Text>
```

### 6. Expo Vector Icons (@expo/vector-icons v15.0.2)

**Icon library**

```typescript
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";

<Ionicons name="heart" size={24} color="red" />
<MaterialIcons name="shopping-cart" size={28} color="#333" />
<FontAwesome name="star" size={16} color="gold" />
```

**Icon Sets:**
- Ionicons (primary)
- MaterialIcons
- FontAwesome
- AntDesign
- Feather

---

## State Management

### 1. React Context API

**Global state management without external libraries**

**Architecture:**
```
contexts/
├── AuthContext.tsx          # User authentication state
├── ProductContext.tsx       # Product utilities
├── CartContext.tsx          # Shopping cart state
├── OrderContext.tsx         # Order management
├── WishlistContext.tsx      # Favorites/Wishlist
├── FilterContext.tsx        # Product filters
├── PromotionContext.tsx     # Promotions data
└── ChatContext.tsx          # AI Chatbot state
```

**Pattern:**
```typescript
// 1. Create Context
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 2. Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const signIn = async (email, password) => {
    const response = await authApi.login({ email, password });
    setUser(response.data.user);
  };
  
  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Custom Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

// 4. Usage in Component
const MyComponent = () => {
  const { user, signIn } = useAuth();
  
  return (
    <View>
      <Text>{user?.firstName}</Text>
    </View>
  );
};
```

**Benefits:**
- ✅ No additional dependencies
- ✅ Type-safe with TypeScript
- ✅ Easy to understand
- ✅ Perfect for small-medium apps

### 2. Local Storage (AsyncStorage)

**Persistent data storage**

**Package:** `@react-native-async-storage/async-storage` (v2.2.0)

**Usage:**
```typescript
import AsyncStorage from "@react-native-async-storage/async-storage";

// Store data
await AsyncStorage.setItem("accessToken", token);
await AsyncStorage.setItem("user", JSON.stringify(user));

// Retrieve data
const token = await AsyncStorage.getItem("accessToken");
const user = JSON.parse(await AsyncStorage.getItem("user") || "{}");

// Remove data
await AsyncStorage.removeItem("accessToken");

// Clear all
await AsyncStorage.clear();
```

**Use Cases:**
- Authentication tokens
- User preferences
- Cart data (offline)
- Chat history
- Filter settings

**Example - Token Storage:**
```typescript
// utils/authUtils.ts
export const TokenStorage = {
  async setTokens(accessToken: string, refreshToken: string, expiresIn: number) {
    const expiresAt = Date.now() + expiresIn * 1000;
    await AsyncStorage.multiSet([
      ["accessToken", accessToken],
      ["refreshToken", refreshToken],
      ["expiresAt", expiresAt.toString()],
    ]);
  },
  
  async getAccessToken(): Promise<string | null> {
    return await AsyncStorage.getItem("accessToken");
  },
  
  async clearTokens() {
    await AsyncStorage.multiRemove(["accessToken", "refreshToken", "expiresAt"]);
  },
};
```

### 3. State Management Patterns

**1. Local State (useState)**
```typescript
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

**2. Derived State (useMemo)**
```typescript
const filteredProducts = useMemo(() => {
  return products.filter(p => p.price > minPrice && p.price < maxPrice);
}, [products, minPrice, maxPrice]);
```

**3. Callbacks (useCallback)**
```typescript
const handleAddToCart = useCallback((productId: number) => {
  addToCart(productId, 1);
}, [addToCart]);
```

**4. Effects (useEffect)**
```typescript
useEffect(() => {
  const fetchProducts = async () => {
    const data = await getProducts();
    setProducts(data);
  };
  fetchProducts();
}, []);
```

---

## Navigation & Routing

### Expo Router (v6.0.10)

**File-based routing system for React Native**

**Architecture:**
```
app/
├── _layout.tsx              # Root layout
├── index.tsx                # / (redirect logic)
├── welcome.tsx              # /welcome
├── (auth)/
│   ├── _layout.tsx          # Auth layout
│   ├── login.tsx            # /login
│   ├── signup.tsx           # /signup
│   └── resetpassword.tsx    # /resetpassword
├── (app)/
│   ├── _layout.tsx          # App layout (with ChatButton)
│   ├── (tabs)/              # Bottom tabs
│   │   ├── _layout.tsx      # Tab navigator
│   │   ├── home.tsx         # /home
│   │   ├── shop.tsx         # /shop
│   │   ├── favorites.tsx    # /favorites
│   │   ├── cart.tsx         # /cart
│   │   └── profile.tsx      # /profile
│   └── (screens)/           # Stack screens
│       ├── product-detail.tsx
│       ├── cart-purchase.tsx
│       ├── payment-webview.tsx
│       ├── my-orders.tsx
│       └── ...
└── +not-found.tsx           # 404 page
```

**Key Features:**

**1. File-based Routing**
```typescript
// File: app/(app)/(tabs)/home.tsx
// URL: /home
export default function HomeScreen() {
  return <View>...</View>;
}
```

**2. Dynamic Routes**
```typescript
// File: app/(app)/(screens)/product-detail.tsx
import { useLocalSearchParams } from "expo-router";

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  // Fetch product with id
}
```

**3. Navigation**
```typescript
import { router } from "expo-router";

// Navigate to screen
router.push("/product-detail?id=123");
router.push({ pathname: "/product-detail", params: { id: "123" } });

// Go back
router.back();

// Replace (no back)
router.replace("/login");

// Navigate to tab
router.push("/(app)/(tabs)/cart");
```

**4. Layout Files**
```typescript
// app/(app)/(tabs)/_layout.tsx - Bottom Tab Navigator
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" options={{
        title: "Home",
        tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />
      }} />
      <Tabs.Screen name="shop" />
      {/* ... */}
    </Tabs>
  );
}
```

**5. Stack Navigator**
```typescript
// app/(app)/_layout.tsx
import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(screens)" />
    </Stack>
  );
}
```

**6. Protected Routes (AuthGuard)**
```typescript
// components/AuthGuard.tsx
import { useAuth } from "@/contexts/AuthContext";
import { Redirect } from "expo-router";

export const AuthGuard = ({ children }) => {
  const { accessToken, isLoading } = useAuth();
  
  if (isLoading) return <LoadingScreen />;
  if (!accessToken) return <Redirect href="/welcome" />;
  
  return <>{children}</>;
};

// Usage in layout
<AuthGuard>
  <Stack.Screen name="(app)" />
</AuthGuard>
```

**Benefits:**
- ✅ Type-safe navigation
- ✅ Automatic deep linking
- ✅ Nested navigators
- ✅ Shared layouts
- ✅ Easy to understand structure

---

## API & Data Management

### 1. API Client Architecture

**File:** `services/apiClient.ts`

**Core Features:**
- ✅ Automatic token management
- ✅ Auto-refresh expired tokens
- ✅ Request/Response logging
- ✅ Error handling
- ✅ Type-safe responses

**Implementation:**

```typescript
// Dynamic base URL detection
function getApiBaseUrl() {
  const expoDebuggerHost = Constants.expoConfig?.hostUri;
  
  if (expoDebuggerHost) {
    // Physical device: http://<LOCAL_IP>:8081/api
    const ip = expoDebuggerHost.split(":")[0];
    return `http://${ip}:8081/api`;
  }
  
  if (Platform.OS === "android") {
    // Android Emulator: http://10.0.2.2:8081/api
    return "http://10.0.2.2:8081/api";
  }
  
  // iOS Simulator: http://localhost:8081/api
  return "http://localhost:8081/api";
}

// AI Services (Port 8005)
function getAiApiBaseUrl() {
  // Same logic but port 8005
}
```

**API Client Class:**

```typescript
class ApiClient {
  private baseURL: string;
  private isRefreshing: boolean = false;
  private refreshPromise: Promise<string | null> | null = null;
  
  // Auto-add auth headers
  private async getAuthHeaders(): Promise<HeadersInit> {
    let token = await TokenStorage.getAccessToken();
    
    // Auto-refresh if needed
    if (token && await TokenStorage.shouldRefreshToken()) {
      token = await this.refreshTokenIfNeeded();
    }
    
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }
  
  // Token refresh with queue management
  private async refreshTokenIfNeeded(): Promise<string | null> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;  // Wait for ongoing refresh
    }
    
    this.isRefreshing = true;
    this.refreshPromise = this.performTokenRefresh();
    
    try {
      const newToken = await this.refreshPromise;
      return newToken;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }
  
  // HTTP Methods
  async get<T>(endpoint: string, params?: any): Promise<ApiResponse<T>> {
    const url = params 
      ? `${endpoint}?${new URLSearchParams(params)}`
      : endpoint;
    return this.makeRequest<T>(url, { method: "GET" });
  }
  
  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
  
  async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }
  
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: "DELETE" });
  }
}

// Singleton instances
export const apiClient = new ApiClient(API_BASE_URL);
export const aiApiClient = new ApiClient(AI_API_BASE_URL);
```

### 2. Service Layer Pattern

**Organization:**
```
services/
├── apiClient.ts          # Core API client
├── authApi.ts           # Authentication endpoints
├── productApi.ts        # Product endpoints
├── cartApi.ts           # Cart endpoints
├── orderApi.ts          # Order endpoints
├── reviewApi.ts         # Review endpoints
├── wishlistApi.ts       # Wishlist endpoints
├── categoryApi.ts       # Category endpoints
├── brandApi.ts          # Brand endpoints
├── campaignApi.ts       # Campaign endpoints
├── voucherApi.ts        # Voucher endpoints
├── chatbotApi.ts        # AI Chatbot (port 8005)
├── searchApi.ts         # AI Search (port 8005)
└── vietnamAddressApi.ts # External API
```

**Example Service:**

```typescript
// services/productApi.ts
import { apiClient } from "./apiClient";

export interface GetProductsParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: "ASC" | "DESC";
  name?: string;
  brandId?: number;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  campaignId?: number;
  attributes?: string[];
}

export const getProducts = async (
  params: GetProductsParams = {}
): Promise<ProductsPageResponse> => {
  const queryParams = new URLSearchParams();
  
  // Build query string
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach(v => queryParams.append(key, v));
      } else {
        queryParams.append(key, value.toString());
      }
    }
  });
  
  const url = `/products?${queryParams.toString()}`;
  const response = await apiClient.get<ProductsPageResponse>(url);
  
  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to fetch products");
  }
  
  return response.data;
};

export const getProductDetail = async (
  id: string
): Promise<ProductDetailResponse> => {
  const response = await apiClient.get<ProductDetailResponse>(`/products/${id}`);
  return response.data!;
};

// Batch fetch (for AI recommendations)
export const getProductsBySpus = async (
  spus: string[],
  size: number = 50
): Promise<ProductApiResponse[]> => {
  const params = new URLSearchParams();
  spus.forEach(spu => params.append("spus", spu));
  params.append("size", size.toString());
  
  const response = await apiClient.get<ProductApiResponse[]>(
    `/products/by-spus?${params.toString()}`
  );
  return response.data || [];
};
```

### 3. Request/Response Logging

**Automatic logging for debugging:**

```typescript
private async makeRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${this.baseURL}${endpoint}`;
  
  console.log(`🚀 API Request: ${options.method || "GET"} ${url}`);
  console.log(`📤 Request config:`, {
    url,
    method: config.method,
    headers: config.headers,
    body: config.body,
  });
  
  const response = await fetch(url, config);
  
  console.log(`📥 Response status: ${response.status}`);
  const data = await response.json();
  console.log(`✅ Response data:`, data);
  
  return { success: response.ok, data };
}
```

**Console Output:**
```
🚀 API Request: GET http://192.168.1.100:8081/api/products?page=0&size=20
📤 Request config: { url: "...", method: "GET", headers: {...} }
📥 Response status: 200
✅ Response data: { content: [...], page: {...} }
```

### 4. Error Handling Strategy

**Pattern:**
```typescript
try {
  const response = await apiClient.get("/products");
  
  if (!response.success) {
    // API error (4xx, 5xx)
    console.error("API Error:", response.error);
    Alert.alert("Lỗi", response.error || "Có lỗi xảy ra");
    return;
  }
  
  // Success
  const products = response.data;
  
} catch (error: any) {
  // Network error (timeout, no connection)
  console.error("Network Error:", error.message);
  Alert.alert("Lỗi", "Không thể kết nối đến server");
}
```

**Retry Logic Example:**
```typescript
export const sendChatMessageWithRetry = async (
  question: string,
  history: ChatMessage[] = [],
  maxRetries: number = 2
): Promise<ChatResponse> => {
  let lastError: Error | null = null;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await sendChatMessage(question, history);
    } catch (error: any) {
      lastError = error;
      console.warn(`⚠️ Retry ${i + 1}/${maxRetries}:`, error.message);
      
      if (i < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }
  
  throw lastError;
};
```

### 5. FormData Upload (Image Search)

**Special handling for file uploads:**

```typescript
export const searchByImage = async (
  imageUri: string,
  topK: number = 20
): Promise<SearchResult[]> => {
  const formData = new FormData();
  
  const filename = imageUri.split("/").pop() || "search.jpg";
  const extension = filename.split(".").pop()?.toLowerCase();
  const mimeType = extension === "png" ? "image/png" : "image/jpeg";
  
  formData.append("file", {
    uri: imageUri,
    type: mimeType,
    name: filename,
  } as any);
  
  formData.append("top_k", topK.toString());
  
  // Use fetch directly (not apiClient)
  const response = await fetch(`${AI_API_BASE_URL}/search/image`, {
    method: "POST",
    body: formData,
    headers: {
      // Don't set Content-Type, browser will set it with boundary
    },
  });
  
  const data = await response.json();
  return data.data || [];
};
```

**Why not apiClient?**
- FormData requires special Content-Type header with boundary
- Browser auto-sets correct headers
- apiClient.post() sets JSON Content-Type

---

## Development Tools

### 1. ESLint (v9.25.0)

**Code linting và formatting**

**Configuration:**
```javascript
// eslint.config.js
module.exports = {
  extends: ["expo"],
  // Custom rules
};
```

**Scripts:**
```json
{
  "scripts": {
    "lint": "expo lint"
  }
}
```

### 2. Prettier

**Code formatting**

**Plugin:** `prettier-plugin-tailwindcss` (v0.5.14)

**Configuration:**
```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

### 3. Metro Bundler

**JavaScript bundler for React Native**

**Configuration:**
```javascript
// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { 
  input: "./app/global.css" 
});
```

**Features:**
- Fast Refresh
- Source maps
- Asset resolution
- Tree shaking

### 4. Babel

**JavaScript compiler**

**Configuration:**
```javascript
// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
  };
};
```

**Transformations:**
- JSX → JavaScript
- TypeScript → JavaScript
- ES6+ → ES5
- NativeWind className → StyleSheet

---

## Build & Deployment

### 1. Expo Development Build

**Custom native builds with native modules**

```bash
# Install expo-dev-client
npx expo install expo-dev-client

# Run development build
npx expo run:android
npx expo run:ios

# Start with dev client
npx expo start --dev-client
```

**Benefits:**
- Include custom native modules
- Faster than Expo Go
- Production-like environment
- Debug with native code

### 2. Android Build Configuration

**File:** `android/app/build.gradle`

```gradle
android {
    namespace "com.minucedev.myapp"
    compileSdk 35
    
    defaultConfig {
        applicationId "com.minucedev.myapp"
        minSdk 23
        targetSdk 35
        versionCode 1
        versionName "1.0.0"
    }
    
    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

**Build APK:**
```bash
cd android
./gradlew assembleRelease

# APK location:
# android/app/build/outputs/apk/release/app-release.apk
```

### 3. EAS Build (Production)

**File:** `eas.json`

```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

**Commands:**
```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure
eas build:configure

# Build APK (preview)
eas build --platform android --profile preview

# Build AAB (production)
eas build --platform android --profile production
```

### 4. Environment Configuration

**Dynamic IP update script:**

```powershell
# update-ip.ps1
$ipAddress = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Wi-Fi").IPAddress
$filePath = ".\services\apiClient.ts"

(Get-Content $filePath) -replace 'http://\d+\.\d+\.\d+\.\d+:8081', "http://${ipAddress}:8081" | Set-Content $filePath

Write-Host "✅ Updated IP to: $ipAddress"
```

**Usage:**
```bash
npm run update-ip
```

---

## Project Architecture

### 1. Folder Structure

```
e-shop-app/
├── app/                      # Expo Router screens
│   ├── _layout.tsx          # Root layout + Providers
│   ├── index.tsx            # Entry point (redirect)
│   ├── welcome.tsx          # Welcome screen
│   ├── (auth)/              # Auth screens group
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   └── resetpassword.tsx
│   ├── (app)/               # Main app group
│   │   ├── _layout.tsx      # App layout (ChatButton)
│   │   ├── (tabs)/          # Bottom tabs
│   │   │   ├── _layout.tsx  # Tab navigator
│   │   │   ├── home.tsx
│   │   │   ├── shop.tsx
│   │   │   ├── favorites.tsx
│   │   │   ├── cart.tsx
│   │   │   └── profile.tsx
│   │   └── (screens)/       # Stack screens
│   │       ├── product-detail.tsx
│   │       ├── cart-purchase.tsx
│   │       ├── payment-webview.tsx
│   │       ├── my-orders.tsx
│   │       ├── edit-profile.tsx
│   │       ├── edit-address.tsx
│   │       └── ...
│   ├── global.css           # TailwindCSS styles
│   └── +not-found.tsx       # 404 page
│
├── components/              # Reusable components
│   ├── Chatbot/
│   │   ├── ChatButton.tsx
│   │   ├── ChatModal.tsx
│   │   ├── ChatHeader.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── MessageList.tsx
│   │   ├── ChatInput.tsx
│   │   ├── ProductCarousel.tsx
│   │   └── TypingIndicator.tsx
│   ├── Search/
│   │   └── ImageSearchModal.tsx
│   ├── ProductCard.tsx
│   ├── ProductCardSkeleton.tsx
│   ├── OrderCard.tsx
│   ├── ReviewCard.tsx
│   ├── ReviewForm.tsx
│   ├── ReviewSummaryCard.tsx
│   ├── FilterBottomSheet.tsx
│   ├── ActiveFilterTags.tsx
│   ├── AuthGuard.tsx
│   └── ApiDebugger.tsx
│
├── contexts/                # Global state management
│   ├── AuthContext.tsx
│   ├── ProductContext.tsx
│   ├── CartContext.tsx
│   ├── OrderContext.tsx
│   ├── WishlistContext.tsx
│   ├── FilterContext.tsx
│   ├── PromotionContext.tsx
│   └── ChatContext.tsx
│
├── services/                # API services
│   ├── apiClient.ts        # Core API client
│   ├── authApi.ts
│   ├── productApi.ts
│   ├── cartApi.ts
│   ├── orderApi.ts
│   ├── reviewApi.ts
│   ├── wishlistApi.ts
│   ├── categoryApi.ts
│   ├── brandApi.ts
│   ├── campaignApi.ts
│   ├── voucherApi.ts
│   ├── chatbotApi.ts       # AI Chatbot
│   ├── searchApi.ts        # AI Search
│   └── vietnamAddressApi.ts
│
├── utils/                   # Utility functions
│   ├── authUtils.ts        # Token storage
│   ├── errorUtils.ts       # Error handling
│   └── userUtils.ts        # User helpers
│
├── hooks/                   # Custom hooks
│   ├── useApi.ts
│   ├── useAuth.ts
│   └── useDebounce.ts
│
├── constants/               # App constants
│   ├── colors.ts
│   └── fonts.ts
│
├── assets/                  # Static assets
│   ├── fonts/
│   │   ├── poppins_regular.ttf
│   │   ├── poppins_bold.ttf
│   │   └── ...
│   └── images/
│
├── android/                 # Android native code
├── ios/                     # iOS native code (if any)
│
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
├── tailwind.config.js      # TailwindCSS config
├── metro.config.js         # Metro bundler config
├── babel.config.js         # Babel config
├── eas.json               # EAS Build config
├── app.json               # Expo config
└── README.md              # Documentation
```

### 2. Component Architecture

**Smart vs Presentational Components:**

```typescript
// Smart Component (with logic)
// app/(app)/(tabs)/home.tsx
export default function HomeScreen() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchProducts();
  }, []);
  
  const fetchProducts = async () => {
    const data = await getProducts({ page: 0, size: 10 });
    setProducts(data.content);
    setIsLoading(false);
  };
  
  if (isLoading) return <LoadingSpinner />;
  
  return (
    <FlatList
      data={products}
      renderItem={({ item }) => <ProductCard product={item} />}
    />
  );
}

// Presentational Component (pure)
// components/ProductCard.tsx
interface ProductCardProps {
  product: Product;
  onPress?: (id: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onPress 
}) => {
  return (
    <TouchableOpacity onPress={() => onPress?.(product.id)}>
      <View className="p-4 bg-white rounded-xl">
        <Image source={{ uri: product.imageUrl }} />
        <Text className="font-bold">{product.name}</Text>
        <Text className="text-blue-600">{formatPrice(product.price)}</Text>
      </View>
    </TouchableOpacity>
  );
};
```

### 3. Data Flow

```
User Action
    ↓
Component Event Handler
    ↓
API Service Call (services/)
    ↓
API Client (with auth, logging)
    ↓
Backend Server (Port 8081 or 8005)
    ↓
API Response
    ↓
Update Context State
    ↓
Re-render Components
    ↓
UI Update
```

**Example Flow:**

```typescript
// 1. User clicks "Add to Cart"
<TouchableOpacity onPress={handleAddToCart}>

// 2. Event handler
const handleAddToCart = async () => {
  await addToCart(variationId, quantity);  // Context method
};

// 3. Context updates state
const addToCart = async (variationId: number, quantity: number) => {
  const cart = await cartApi.addToCart(variationId, quantity);  // API call
  setCartItems(cart.items);  // Update state
  setCartCount(cart.totalItems);
};

// 4. API service
export const addToCart = async (variationId, quantity) => {
  return await apiClient.post("/cart/add", { variationId, quantity });
};

// 5. API client handles auth, logging, request
const response = await fetch(url, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}` },
  body: JSON.stringify(data),
});

// 6. Components re-render with new cart count
<Text>{cartCount}</Text>  // Shows updated count
```

### 4. Code Organization Principles

**1. Separation of Concerns**
- UI components don't call APIs directly
- Services don't handle UI logic
- Contexts manage global state only

**2. Single Responsibility**
- Each component has one clear purpose
- Each service file handles one domain (products, cart, etc.)
- Each utility file has one category of helpers

**3. DRY (Don't Repeat Yourself)**
- Reusable components (ProductCard, OrderCard)
- Shared utilities (formatPrice, formatDate)
- Custom hooks (useAuth, useDebounce)

**4. Type Safety**
- All API calls typed with TypeScript
- Props interfaces for all components
- No `any` types (except FormData edge cases)

**5. Performance Optimization**
- useMemo for expensive calculations
- useCallback for event handlers
- React.memo for pure components
- FlatList for long lists

---

## Performance Optimizations

### 1. List Rendering

**FlatList with optimizations:**

```typescript
<FlatList
  data={products}
  renderItem={renderProduct}
  keyExtractor={(item) => item.id.toString()}
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={5}
  removeClippedSubviews={true}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>
```

### 2. Image Optimization

**expo-image for better performance:**

```typescript
import { Image } from "expo-image";

<Image
  source={{ uri: product.imageUrl }}
  contentFit="cover"
  transition={200}
  cachePolicy="memory-disk"
  placeholder={blurhash}
/>
```

### 3. Debouncing Search

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

### 4. Lazy Loading

```typescript
const [page, setPage] = useState(0);
const [hasMore, setHasMore] = useState(true);

const loadMore = async () => {
  if (!hasMore || isLoading) return;
  
  const response = await getProducts({ page: page + 1, size: 20 });
  setProducts(prev => [...prev, ...response.content]);
  setPage(prev => prev + 1);
  setHasMore(response.page.number < response.page.totalPages - 1);
};

<FlatList
  data={products}
  onEndReached={loadMore}
  onEndReachedThreshold={0.5}
/>
```

---

## Testing & Debugging

### 1. API Debugger Component

```typescript
// components/ApiDebugger.tsx
export const ApiDebugger = () => {
  const testBackend = async () => {
    const response = await fetch(`${API_BASE_URL}/products?size=1`);
    console.log(response.status);
  };
  
  const testAI = async () => {
    const response = await fetch(`${AI_API_BASE_URL}/chat`, {
      method: "POST",
      body: JSON.stringify({ question: "test", history: [] }),
    });
    console.log(response.status);
  };
  
  return (
    <View>
      <Button title="Test Backend" onPress={testBackend} />
      <Button title="Test AI" onPress={testAI} />
    </View>
  );
};
```

### 2. Console Logging Strategy

**Structured logging:**

```typescript
// Prefix conventions
console.log("🚀 API Request:", ...);   // API calls
console.log("✅ Success:", ...);        // Success operations
console.log("❌ Error:", ...);          // Errors
console.log("⚠️ Warning:", ...);        // Warnings
console.log("📦 Data:", ...);           // Data inspection
console.log("🔄 Loading:", ...);        // Loading states
```

### 3. Error Boundaries

```typescript
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error("Error boundary caught:", error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallbackUI />;
    }
    return this.props.children;
  }
}
```

---

## Security Best Practices

### 1. Token Security

```typescript
// Store in AsyncStorage (encrypted on iOS, keychain on Android)
await AsyncStorage.setItem("accessToken", token);

// Never log tokens
console.log("Token:", "***REDACTED***");

// Auto-refresh before expiry
if (expiresAt - Date.now() < 5 * 60 * 1000) {
  await refreshToken();
}
```

### 2. HTTPS Only (Production)

```typescript
const API_BASE_URL = __DEV__ 
  ? `http://${ip}:8081/api`        // HTTP in development
  : `https://api.example.com`;     // HTTPS in production
```

### 3. Input Validation

```typescript
const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const validatePassword = (password: string): boolean => {
  return password.length >= 8;
};
```

---

## Dependency Management

### Core Dependencies (package.json)

**Runtime:**
- `react`: 19.1.0
- `react-native`: 0.81.4
- `expo`: ~54.0.12
- `expo-router`: ~6.0.10
- `nativewind`: ^4.2.1
- `typescript`: ~5.9.2

**State & Storage:**
- `@react-native-async-storage/async-storage`: ^2.2.0

**Navigation:**
- `@react-navigation/native`: ^7.1.8
- `@react-navigation/bottom-tabs`: ^7.4.0

**UI Components:**
- `@expo/vector-icons`: ^15.0.2
- `react-native-safe-area-context`: ~5.6.0
- `react-native-screens`: ~4.16.0
- `react-native-gesture-handler`: ~2.28.0
- `react-native-reanimated`: ~4.1.1

**Media:**
- `expo-image`: ~3.0.8
- `expo-image-picker`: ~17.0.9

**Other:**
- `expo-constants`: ~18.0.9
- `expo-web-browser`: ~15.0.8
- `react-native-webview`: ^13.16.0
- `react-native-toast-message`: ^2.3.3

**Dev Dependencies:**
- `@types/react`: ~19.1.0
- `@types/node`: ^24.5.2
- `typescript`: ~5.9.2
- `eslint`: ^9.25.0
- `prettier-plugin-tailwindcss`: ^0.5.14

### Update Strategy

```bash
# Check outdated packages
npm outdated

# Update expo packages
npx expo install --fix

# Update specific package
npm install package-name@latest
```

---

## Summary

### Technology Stack Overview

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Framework** | React Native | 0.81.4 | Mobile app framework |
| **UI Library** | React | 19.1.0 | Component library |
| **Language** | TypeScript | 5.9.2 | Type-safe JavaScript |
| **Platform** | Expo | 54.0.12 | Development platform |
| **Routing** | Expo Router | 6.0.10 | File-based navigation |
| **Styling** | NativeWind | 4.2.1 | TailwindCSS for RN |
| **State** | Context API | Built-in | Global state |
| **Storage** | AsyncStorage | 2.2.0 | Local persistence |
| **API Client** | Fetch API | Native | HTTP requests |
| **Icons** | Expo Vector Icons | 15.0.2 | Icon library |
| **Animations** | Reanimated | 4.1.1 | Smooth animations |
| **Gestures** | Gesture Handler | 2.28.0 | Touch handling |

### Key Architectural Decisions

1. **File-based Routing**: Expo Router cho navigation tự động
2. **Context API**: State management không cần Redux/MobX
3. **TypeScript**: Type safety và better developer experience
4. **NativeWind**: Rapid UI development với TailwindCSS
5. **Service Layer**: Tách biệt API logic khỏi UI components
6. **Custom API Client**: Auto token refresh và error handling
7. **AsyncStorage**: Persistent storage cho tokens và offline data

### Development Workflow

```bash
# 1. Install dependencies
npm install

# 2. Update backend IP
npm run update-ip

# 3. Start development server
npx expo start --dev-client

# 4. Run on device/emulator
npx expo run:android
npx expo run:ios

# 5. Build for production
eas build --platform android --profile production
```

---

**Last Updated:** December 8, 2025  
**Version:** 1.0  
**Author:** E-Shop Development Team
