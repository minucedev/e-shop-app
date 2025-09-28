import React from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";

// Dữ liệu mẫu - cấu trúc dễ mở rộng cho API
const PRODUCTS_DATA = [
  {
    id: "1",
    name: "AMD RYZEN 9",
    description: "Unleash Performance",
    price: "$299",
    image:
      "https://nguyencongpc.vn/media/product/250-27037-242872903-c_ryzen_9_9900x3d_3dpib.jpg",
  },
  {
    id: "2",
    name: "Intel Core i7 12700",
    description: "Beyond Limits",
    price: "$249",
    image:
      "https://product.hstatic.net/200000320233/product/i7_01bbf06595c041489008499b74309cd5_1024x1024.jpg",
  },
  // Có thể thêm nhiều sản phẩm khác
];

const categories = [
  { icon: "phone-portrait", label: "Phones" },
  { icon: "laptop", label: "Laptops" },
  { icon: "tablet-portrait", label: "Tablets" },
  { icon: "watch", label: "Watches" },
  { icon: "headset", label: "Accessories" },
  { icon: "tv", label: "TVs" },
  { icon: "game-controller", label: "Gaming" },
  { icon: "camera", label: "Cameras" },
];

const featuredProducts = [
  {
    id: "1",
    name: "iPhone 17 Pro Max",
    price: "$1.990",
    image:
      "https://cdn2.cellphones.com.vn/358x/media/catalog/product/i/p/iphone-17-pro-256-gb.png",
  },
  {
    id: "2",
    name: "Samsung Galaxy S24 Ultra",
    price: "$1.980",
    image:
      "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/s/s/ss-s24-ultra-xam-222.png",
  },
  {
    id: "3",
    name: "MacBook Air M3 2024",
    price: "$2.300",
    image:
      "https://cdn2.cellphones.com.vn/x/media/catalog/product/m/b/mba13-m3-midnight-gallery1-202402_3_1_2_1.jpg",
  },
];

const Home = () => {
  const router = useRouter();
  // Render mỗi item sản phẩm trong horizontal list
  const renderProductItem = ({ item }: { item: (typeof PRODUCTS_DATA)[0] }) => (
    <TouchableOpacity className="mr-4 w-48 bg-gray-50 rounded-lg p-4 shadow-sm">
      <View className="bg-blue-100 h-32 rounded-md mb-2 items-center justify-center overflow-hidden">
        <Image
          source={{ uri: item.image }}
          className="w-full h-full rounded"
          resizeMode="cover"
        />
      </View>
      <Text className="text-lg font-bold text-gray-900">{item.name}</Text>
      <Text className="text-sm text-gray-600 mb-1">{item.description}</Text>
      <Text className="text-base font-semibold text-gray-600">
        {item.price}
      </Text>
    </TouchableOpacity>
  );

  const { user } = useAuth();

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      {/* Status Bar và Header */}
      <View className="pt-12 px-4 pb-4 bg-white">
        <Text className="text-2xl font-bold text-gray-900 mt-2">
          {(() => {
            const hour = new Date().getHours();
            if (hour < 12) return "Good morning";
            if (hour < 18) return "Good afternoon";
            return "Good evening";
          })()}{" "}
          {user?.name}
        </Text>
        {/* Search Bar */}
        <TextInput
          className="h-12 bg-gray-100 rounded-full px-4 mt-4 text-gray-700"
          placeholder="Search for equipments..."
          placeholderTextColor="#6b7280"
        />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* ALIENWARE Banner */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push("/(app)/(tabs)/shop")}
          className="mx-4 mt-2 rounded-2xl overflow-hidden"
        >
          <View className="flex-row items-center p-6 bg-gray-400 rounded-2xl">
            {/* Hình ảnh bên trái */}
            <Image
              source={{
          uri: "https://hungphatlaptop.com/wp-content/uploads/2023/07/Alienware-Aurora-R15-Gaming-Desktop-2023-H2.jpeg",
              }}
              className="w-24 h-24 rounded-xl mr-4 bg-white"
              resizeMode="cover"
            />
            {/* Nội dung chữ */}
            <View className="flex-1">
              <Text className="text-white text-xl font-bold">
          ALIENWARE GAMINGS
              </Text>
              <Text className="text-white text-lg font-semibold">
          DESKTOPS
              </Text>
              <Text className="text-white text-base mt-1">
          Starting at $1,999
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Popular Now Section */}
        <View className="px-4 mt-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">Popular Now</Text>
          <FlatList
            data={featuredProducts}
            renderItem={({ item }) => (
              <TouchableOpacity className="mr-4 w-40 bg-white rounded-lg p-3 shadow-sm">
          <View className="bg-blue-50 h-24 rounded-md mb-2 items-center justify-center overflow-hidden">
            <Image
              source={{ uri: item.image }}
              className="w-full h-full rounded"
              resizeMode="cover"
            />
          </View>
          <Text className="text-base font-bold text-gray-900" numberOfLines={1}>
            {item.name}
          </Text>
          <Text className="text-sm font-semibold text-blue-700 mt-1">
            {item.price}
          </Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 16 }}
          />
        </View>

        {/* Recommended For You Section */}
        <View className="px-4 mt-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-gray-900">
              Recommended For You
            </Text>
            <TouchableOpacity onPress={() => router.push("/(app)/(tabs)/shop")}>
              <Text className="text-blue-600 font-semibold">See All</Text>
            </TouchableOpacity>
          </View>

          {/* Horizontal Product List */}
          <FlatList
            data={PRODUCTS_DATA}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 16 }}
          />
        </View>

        {/* Thêm khoảng trống ở cuối để không bị bottom navigation che */}
        <View className="h-10" />
      </ScrollView>
    </View>
  );
};

const CategoryButton = ({ icon, label }: { icon: any; label: string }) => (
  <TouchableOpacity
    className="bg-blue-50 rounded-2xl px-6 py-4 flex-row items-center min-w-[120px] mr-4"
    activeOpacity={1}
  >
    <Ionicons name={icon} size={28} color="#007AFF" className="mr-2" />
    <Text className="text-blue-900 font-semibold text-base">{label}</Text>
  </TouchableOpacity>
);

export default Home;
