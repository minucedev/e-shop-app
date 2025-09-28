import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  FlatList,
  Image,
} from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

// Dữ liệu sản phẩm yêu thích (10 sản phẩm để hiển thị)
const FAVORITE_PRODUCTS = [
  {
    id: "1",
    name: "AMD RYZEN 9",
    description: "Unleash Performance",
    price: "€299",
    image:
      "https://nguyencongpc.vn/media/product/250-27037-242872903-c_ryzen_9_9900x3d_3dpib.jpg",
  },
  {
    id: "2",
    name: "Intel Core i7 12700",
    description: "Beyond Limits",
    price: "€249",
    image:
      "https://product.hstatic.net/200000320233/product/i7_01bbf06595c041489008499b74309cd5_1024x1024.jpg",
  },
  {
    id: "3",
    name: "AMD RYZEN 7 7800X3D",
    description: "Gaming Beast",
    price: "€399",
    image:
      "https://images-eu.ssl-images-amazon.com/images/I/51HqC0rU9HL._AC_UL210_SR210,210_.jpg",
  },
  {
    id: "4",
    name: "Intel Core i5 12600K",
    description: "Best Value",
    price: "€199",
    image:
      "https://product.hstatic.net/200000420363/product/1_8fa8f1867f0e4811a7f9e34deddc8e21_master.jpg",
  },
  {
    id: "5",
    name: "AMD RYZEN 5 7600X",
    description: "Efficient Performance",
    price: "€179",
    image:
      "https://product.hstatic.net/200000320233/product/221587605-d_ryzen5_7000_3dpibwof_front_pr.png_c583f96f588e4330bb0587cba78ff959_1024x1024.png",
  },
  {
    id: "6",
    name: "Intel Core i9 13900K",
    description: "Extreme Power",
    price: "€499",
    image:
      "https://product.hstatic.net/200000079075/product/19-118-412-v01_f37d9c13e2b04a8db475eff06f4a8eaa_master.jpg",
  },
  {
    id: "7",
    name: "iPhone 17 Pro Max",
    description: "Pro Performance",
    price: "€1,990",
    image:
      "https://cdn2.cellphones.com.vn/358x/media/catalog/product/i/p/iphone-17-pro-256-gb.png",
  },
  {
    id: "8",
    name: "Samsung Galaxy S24 Ultra",
    description: "Ultra Experience",
    price: "€1,980",
    image:
      "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/s/s/ss-s24-ultra-xam-222.png",
  },
  {
    id: "9",
    name: "MacBook Air M3 2024",
    description: "Portable Power",
    price: "€2,300",
    image:
      "https://cdn2.cellphones.com.vn/x/media/catalog/product/m/b/mba13-m3-midnight-gallery1-202402_3_1_2_1.jpg",
  },
  {
    id: "10",
    name: "NVIDIA RTX 4090",
    description: "Ultimate Graphics",
    price: "€1,699",
    image:
      "https://www.nvidia.com/content/dam/en-us/geforce/news/geforce-rtx-4090-graphics-card/geforce-rtx-4090-3qtr-top-left.jpg",
  },
];

const Favorites = () => {
  // State danh sách sản phẩm yêu thích
  const [favoriteItems, setFavoriteItems] = React.useState(FAVORITE_PRODUCTS);

  // Hàm xóa tất cả sản phẩm yêu thích
  const handleClearFavorites = () => {
    Alert.alert(
      "Clear Favorites",
      "Are you sure you want to remove all favorite items?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => setFavoriteItems([]),
        },
      ]
    );
  };

  // Hàm xóa một sản phẩm khỏi danh sách yêu thích
  const handleRemoveFromFavorites = (productId: string) => {
    const product = favoriteItems.find((item) => item.id === productId);
    Alert.alert(
      "Remove from Favorites",
      `Are you sure you want to remove "${product?.name}" from your favorites?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () =>
            setFavoriteItems((prev) =>
              prev.filter((item) => item.id !== productId)
            ),
        },
      ]
    );
  };

  // Hàm thêm sản phẩm vào giỏ hàng
  const handleAddToCart = (productId: string) => {
    // TODO: Tích hợp API thêm vào giỏ hàng
    console.log("Thêm sản phẩm vào giỏ hàng:", productId);
    Alert.alert("Added to Cart", "Product has been added to your cart!");
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="pt-12 px-4 pb-4 bg-white flex-row items-center justify-between shadow-sm">
        <Text className="text-2xl font-bold text-gray-900">Favorites</Text>
        <TouchableOpacity onPress={handleClearFavorites} activeOpacity={0.7}>
          <Text className="text-red-500 font-semibold text-base">Clear</Text>
        </TouchableOpacity>
      </View>

      {/* Danh sách sản phẩm yêu thích */}
      {favoriteItems.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Ionicons name="heart-outline" size={80} color="#444" />
          <Text className="text-gray-400 text-lg mt-4">No favorite items.</Text>
          <Text className="text-gray-400 text-sm mt-2">
            Add some products to your favorites!
          </Text>
        </View>
      ) : (
        <View className="flex-1 px-4 pt-2">
          <FlatList
            data={favoriteItems}
            numColumns={2}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={{
              justifyContent: "space-between",
              marginBottom: 20,
            }}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="bg-white rounded-2xl shadow p-3 w-[48%] relative"
                activeOpacity={0.8}
                onPress={() => {
                  /* TODO: chuyển sang trang chi tiết sản phẩm */
                }}
              >
                {/* Icon yêu thích - đã được chọn */}
                <TouchableOpacity
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    zIndex: 1,
                  }}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleRemoveFromFavorites(item.id);
                  }}
                >
                  <Ionicons name="heart" size={22} color="#444" />
                </TouchableOpacity>

                {/* Ảnh sản phẩm */}
                <Image
                  source={{ uri: item.image }}
                  className="w-full h-24 rounded-xl mb-2"
                  resizeMode="contain"
                />

                {/* Tên sản phẩm */}
                <Text className="font-bold text-base text-gray-900 mb-1 uppercase">
                  {item.name}
                </Text>

                {/* Mô tả ngắn */}
                <Text className="text-sm text-gray-500 mb-2">
                  {item.description}
                </Text>

                {/* Giá sản phẩm */}
                <Text className="text-lg font-bold text-gray-600 mb-2">
                  {item.price}
                </Text>

                {/* Nút thêm vào giỏ hàng */}
                <TouchableOpacity
                  className="bg-blue-500 rounded-full p-2 self-end"
                  onPress={(e) => {
                    e.stopPropagation();
                    handleAddToCart(item.id);
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="bag-add" size={18} color="white" />
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
};

export default Favorites;
