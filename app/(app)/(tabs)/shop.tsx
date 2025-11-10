import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  ActivityIndicator,
} from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useProduct } from "@/contexts/ProductContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useCart } from "@/contexts/CartContext";
import { useRouter } from "expo-router";

const Shop = () => {
  // Lấy search params từ navigation
  const { searchQuery } = useLocalSearchParams();

  // Lấy sản phẩm từ ProductContext
  const {
    products,
    isLoading,
    formatPrice,
    searchProducts,
    loadMoreProducts,
    hasMore,
    refreshProducts,
  } = useProduct();

  // Lấy favorites từ FavoritesContext
  const { isFavorite, toggleFavorite } = useFavorites();

  // Lấy cart từ CartContext
  const { addToCart } = useCart();
  const router = useRouter();

  // States
  const [searchText, setSearchText] = React.useState("");
  const [filteredProducts, setFilteredProducts] = React.useState(products);

  // Xử lý search query từ navigation params
  React.useEffect(() => {
    if (searchQuery && typeof searchQuery === "string") {
      console.log("Received searchQuery:", searchQuery);
      setSearchText(searchQuery);
    }
  }, [searchQuery]);

  // Cập nhật danh sách sản phẩm khi products thay đổi hoặc search text thay đổi
  React.useEffect(() => {
    if (searchText.trim()) {
      const filtered = searchProducts(searchText);
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [products, searchText]);

  // Xử lý tìm kiếm
  const handleSearch = (text: string) => {
    setSearchText(text);
  };

  // Xử lý toggle yêu thích
  const handleToggleFavorite = (id: string) => {
    toggleFavorite(id);
  };

  // Reset search
  const resetSearch = () => {
    setSearchText("");
  };

  // Render footer cho FlatList (loading more indicator)
  const renderFooter = () => {
    if (!hasMore) return null;
    return (
      <View className="py-4">
        <ActivityIndicator size="small" color="#3b82f6" />
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 pt-8 pb-2 bg-white">
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-900 text-2xl font-bold">Shop</Text>
          <Text className="text-gray-500 text-sm">
            {filteredProducts.length} products
          </Text>
        </View>

        {/* Thanh tìm kiếm */}
        <View className="flex-row items-center mt-4 space-x-3">
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
                placeholder="Search products..."
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
              {searchText.length > 0 && (
                <TouchableOpacity onPress={resetSearch}>
                  <Ionicons name="close-circle" size={20} color="#888" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Product List */}
      {isLoading && filteredProducts.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="text-gray-500 mt-4">Loading products...</Text>
        </View>
      ) : filteredProducts.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="search-outline" size={64} color="#ccc" />
          <Text className="text-gray-500 text-lg mt-4 text-center">
            No products found
          </Text>
          <Text className="text-gray-400 text-sm mt-2 text-center">
            Try adjusting your search
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={{
            justifyContent: "space-between",
            paddingHorizontal: 16,
            marginBottom: 16,
          }}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
          onEndReached={() => {
            if (!searchText.trim()) {
              loadMoreProducts();
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          renderItem={({ item }) => {
            const isItemFavorite = isFavorite(item.id);
            const hasDiscount =
              item.displayOriginalPrice > item.displaySalePrice;
            const discountPercent =
              item.discountType === "PERCENTAGE"
                ? item.discountValue
                : item.discountValue
                  ? Math.round(
                      ((item.displayOriginalPrice - item.displaySalePrice) /
                        item.displayOriginalPrice) *
                        100
                    )
                  : 0;

            return (
              <TouchableOpacity
                className="bg-white rounded-xl shadow-lg border border-gray-100 w-[48%]"
                activeOpacity={0.8}
                onPress={() =>
                  router.push(`/(app)/(screens)/product-detail?id=${item.id}`)
                }
              >
                {/* Product Image */}
                <View className="relative">
                  <View className="bg-gray-50 h-40 rounded-t-xl items-center justify-center overflow-hidden">
                    <Image
                      source={{
                        uri: item.imageUrl || "https://via.placeholder.com/150",
                      }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  </View>

                  {/* Discount Badge */}
                  {hasDiscount && (
                    <View className="absolute top-2 left-2 bg-red-500 rounded-full px-2 py-1">
                      <Text className="text-white text-xs font-bold">
                        -{discountPercent}%
                      </Text>
                    </View>
                  )}

                  {/* Favorite Icon */}
                  <TouchableOpacity
                    className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-sm"
                    onPress={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(item.id.toString());
                    }}
                  >
                    <Ionicons
                      name={isItemFavorite ? "heart" : "heart-outline"}
                      size={20}
                      color={isItemFavorite ? "#e74c3c" : "#666"}
                    />
                  </TouchableOpacity>
                </View>

                {/* Product Info */}
                <View className="p-3">
                  <Text
                    className="text-sm font-bold text-gray-900 mb-1"
                    numberOfLines={2}
                  >
                    {item.name}
                  </Text>

                  {/* Rating */}
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="star" size={12} color="#FFA500" />
                    <Text className="text-xs text-gray-600 ml-1">
                      {item.averageRating.toFixed(1)} ({item.totalRatings})
                    </Text>
                  </View>

                  {/* Price and Cart */}
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      {hasDiscount && (
                        <Text className="text-xs text-gray-400 line-through">
                          {formatPrice(item.displayOriginalPrice)}
                        </Text>
                      )}
                      <Text
                        className="text-base font-bold text-blue-600"
                        numberOfLines={1}
                      >
                        {formatPrice(item.displaySalePrice)}
                      </Text>
                    </View>

                    {/* Add to Cart Button */}
                    <TouchableOpacity
                      className="bg-blue-500 p-2 rounded-full"
                      onPress={async (e) => {
                        e.stopPropagation();
                        await addToCart(item.id.toString());
                        router.push("/(app)/(tabs)/cart");
                      }}
                    >
                      <Ionicons name="add" size={14} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
};

export default Shop;
