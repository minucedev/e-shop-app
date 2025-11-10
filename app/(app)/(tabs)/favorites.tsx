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
import { useProduct, formatPrice } from "@/contexts/ProductContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useCart } from "@/contexts/CartContext";
import { useRouter } from "expo-router";

const Favorites = () => {
  const router = useRouter();

  // Lấy sản phẩm từ ProductContext
  const { products, getProductById } = useProduct();

  // Lấy favorites từ FavoritesContext
  const { favoriteIds, clearFavorites, removeFromFavorites } = useFavorites();

  // Lấy cart từ CartContext
  const { addToCart } = useCart();

  // Lấy danh sách sản phẩm yêu thích từ IDs
  const favoriteItems = favoriteIds
    .map((id) => getProductById(id))
    .filter(Boolean); // Loại bỏ undefined

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
          onPress: () => clearFavorites(),
        },
      ]
    );
  };

  // Hàm xóa một sản phẩm khỏi danh sách yêu thích
  const handleRemoveFromFavorites = (productId: string) => {
    const product = getProductById(productId);
    Alert.alert(
      "Remove from Favorites",
      `Are you sure you want to remove "${product?.name}" from your favorites?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => removeFromFavorites(productId),
        },
      ]
    );
  };

  // Hàm xem chi tiết sản phẩm
  const handleViewDetail = (productId: string) => {
    router.push({
      pathname: "/(app)/(screens)/product-detail",
      params: { id: productId },
    });
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 py-4 bg-white flex-row items-center justify-between border-b border-gray-100 shadow-sm">
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
            keyExtractor={(item) => item!.id.toString()}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={{
              justifyContent: "space-between",
              marginBottom: 20,
            }}
            renderItem={({ item }) => {
              if (!item) return null;

              return (
                <TouchableOpacity
                  className="bg-white rounded-xl shadow-lg border border-gray-100 w-[48%]"
                  activeOpacity={0.8}
                  onPress={() => {
                    handleViewDetail(item.id.toString());
                  }}
                >
                  {/* Product Image */}
                  <View className="relative">
                    <View className="bg-gray-50 h-32 mr-5 rounded-xl items-center justify-center overflow-hidden">
                      <Image
                        source={{
                          uri:
                            item.imageUrl || "https://via.placeholder.com/150",
                        }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    </View>

                    {/* Favorite Icon - always filled */}
                    <TouchableOpacity
                      className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-sm"
                      onPress={(e) => {
                        e.stopPropagation();
                        handleRemoveFromFavorites(item.id.toString());
                      }}
                    >
                      <Ionicons name="heart" size={25} color="#e74c3c" />
                    </TouchableOpacity>
                  </View>

                  {/* Product Info */}
                  <View className="p-4">
                    <Text
                      className="text-base font-bold text-gray-900 mb-1"
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                    <View className="flex-row items-center mb-2">
                      <Ionicons name="star" size={14} color="#FFA500" />
                      <Text className="text-xs text-gray-600 ml-1">
                        {item.averageRating.toFixed(1)} ({item.totalRatings})
                      </Text>
                    </View>

                    {/* Price and View Detail */}
                    <View className="flex-row items-center justify-between">
                      <Text className="text-lg font-bold text-blue-600">
                        {formatPrice(item.displaySalePrice)}
                      </Text>

                      {/* View Detail Button */}
                      <TouchableOpacity
                        // className="bg-blue-500 p-2 rounded-full"
                        onPress={(e) => {
                          e.stopPropagation();
                          handleViewDetail(item.id.toString());
                        }}
                      ></TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      )}
    </View>
  );
};

export default Favorites;
