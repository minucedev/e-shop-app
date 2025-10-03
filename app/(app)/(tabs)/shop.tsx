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
import { useProduct } from "@/contexts/ProductContext";
import { useFavorites } from "@/contexts/FavoritesContext";

const Shop = () => {
  // Lấy sản phẩm từ ProductContext
  const { products, isLoading, searchProducts } = useProduct();

  // Lấy favorites từ FavoritesContext
  const { isFavorite, toggleFavorite } = useFavorites();

  const [searchText, setSearchText] = React.useState("");

  // State cho kết quả tìm kiếm
  const [filteredProducts, setFilteredProducts] = React.useState(products);

  // Cập nhật danh sách sản phẩm khi products thay đổi
  React.useEffect(() => {
    setFilteredProducts(products);
  }, [products]);

  // Xử lý tìm kiếm
  const handleSearch = (text: string) => {
    if (text.trim() === "") {
      setFilteredProducts(products);
    } else {
      const results = searchProducts(text);
      setFilteredProducts(results);
    }
  };

  // Xử lý toggle yêu thích
  const handleToggleFavorite = (id: string) => {
    toggleFavorite(id);
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
                onChangeText={(text) => {
                  setSearchText(text);
                  handleSearch(text);
                }}
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
          data={filteredProducts}
          numColumns={2}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={{
            justifyContent: "space-between",
            marginBottom: 20,
          }}
          renderItem={({ item }) => {
            const isItemFavorite = isFavorite(item.id);
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
                    name={isItemFavorite ? "heart" : "heart-outline"}
                    size={22}
                    color={isItemFavorite ? "#e74c3c" : "#444"}
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
