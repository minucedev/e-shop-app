import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
} from "react-native";
import React from "react";
import { Ionicons, Feather } from "@expo/vector-icons";

const PRODUCTS_DATA = [
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
    name: "Intel Core i9 13900K",
    description: "Extreme Power",
    price: "€499",
    image:
      "https://product.hstatic.net/200000079075/product/19-118-412-v01_f37d9c13e2b04a8db475eff06f4a8eaa_master.jpg",
  },
  {
    id: "4",
    name: "AMD RYZEN 7 7800X3D",
    description: "Gaming Beast",
    price: "€399",
    image:
      "https://images-eu.ssl-images-amazon.com/images/I/51HqC0rU9HL._AC_UL210_SR210,210_.jpg",
  },
  {
    id: "5",
    name: "Intel Core i5 12600K",
    description: "Best Value",
    price: "€199",
    image:
      "https://product.hstatic.net/200000420363/product/1_8fa8f1867f0e4811a7f9e34deddc8e21_master.jpg",
  },
  {
    id: "6",
    name: "AMD RYZEN 5 7600X",
    description: "Efficient Performance",
    price: "€179",
    image:
      "https://product.hstatic.net/200000320233/product/221587605-d_ryzen5_7000_3dpibwof_front_pr.png_c583f96f588e4330bb0587cba78ff959_1024x1024.png",
  },
];

const Shop = () => {
  const [favorites, setFavorites] = React.useState<string[]>([]);
  const [searchText, setSearchText] = React.useState("");

  // Xử lý tìm kiếm
  const handleSearch = (text: string) => {
    // TODO: Tích hợp API tìm kiếm sản phẩm ở đây
    console.log("Tìm kiếm:", text);
  };

  // Xử lý toggle yêu thích
  const handleToggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
    // TODO: Tích hợp API thêm/xóa sản phẩm yêu thích ở đây
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 pt-8 pb-2 bg-white">
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-900 text-2xl font-bold">Shop</Text>
        </View>
        {/* Thanh tìm kiếm và icon filter */}
        <View className="flex-row items-center mt-4">
          <View className="flex-1">
            <View className="flex-row items-center bg-gray-100 rounded-full px-4 h-12">
              <TouchableOpacity onPress={() => handleSearch(searchText)}>
                <Ionicons
                  name="search"
                  size={24}
                  color="#222"
                  style={{ marginRight: 8 }}
                />
              </TouchableOpacity>
              <TextInput
                className="flex-1 text-gray-700"
                placeholder="Tìm kiếm sản phẩm..."
                placeholderTextColor="#888"
                style={{ borderWidth: 0, backgroundColor: "transparent" }}
                value={searchText}
                onChangeText={setSearchText}
                onSubmitEditing={(e) => handleSearch(e.nativeEvent.text)}
                returnKeyType="search"
              />
            </View>
          </View>
          <TouchableOpacity className="ml-4">
            <Feather name="filter" size={28} color="#222" />
          </TouchableOpacity>
        </View>
      </View>
      {/* Product Grid */}
      <View className="flex-1 px-4 pt-2">
        <FlatList
          data={PRODUCTS_DATA}
          numColumns={2}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={{
            justifyContent: "space-between",
            marginBottom: 20,
          }}
          renderItem={({ item }) => {
            const isFavorite = favorites.includes(item.id);
            return (
              <TouchableOpacity
                className="bg-white rounded-2xl shadow p-3 w-[48%] relative"
                activeOpacity={0.8}
                onPress={() => {
                  /* TODO: chuyển sang trang chi tiết sản phẩm */
                }}
              >
                {/* Icon yêu thích */}
                <TouchableOpacity
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    zIndex: 1,
                  }}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleToggleFavorite(item.id);
                  }}
                >
                  <Ionicons
                    name={isFavorite ? "heart" : "heart-outline"}
                    size={22}
                    color="#444"
                  />
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
                <Text className="text-sm text-gray-500 mb-1">
                  {item.description}
                </Text>
                {/* Giá sản phẩm */}
                <Text className="text-lg font-bold text-gra-600">
                  {item.price}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </View>
  );
};

export default Shop;
