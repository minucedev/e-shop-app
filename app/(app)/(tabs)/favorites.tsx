import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  FlatList,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { formatPrice } from "@/contexts/ProductContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { useRouter } from "expo-router";

const Favorites = () => {
  const router = useRouter();

  // product helper (formatPrice imported above)

  // Lấy wishlist từ WishlistContext (API-backed)
  const {
    items: favoriteItemsFromApi,
    isLoading,
    loadWishlist,
    loadMoreWishlist,
    hasMore,
    removeFromWishlist,
  } = useWishlist();

  // Lấy cart từ CartContext
  const { addToCart } = useCart();

  // Map API items (already full product objects)
  const favoriteItems = favoriteItemsFromApi || [];

  // Hàm xóa tất cả sản phẩm yêu thích bằng cách gọi API remove cho từng item
  const handleClearFavorites = () => {
    Alert.alert(
      "Clear Favorites",
      "Are you sure you want to remove all favorite items?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            if (favoriteItems.length === 0) return;
            // Remove sequentially to avoid spamming API too quickly
            for (const it of favoriteItems) {
              try {
                await removeFromWishlist(it.id);
              } catch (e) {
                // ignore individual failures and continue
                console.error("Failed removing", it.id, e);
              }
            }
          },
        },
      ]
    );
  };

  // Hàm xóa một sản phẩm khỏi danh sách yêu thích (API)
  const handleRemoveFromFavorites = (productId: number) => {
    const product = favoriteItems.find((p) => p.id === productId);
    Alert.alert(
      "Remove from Favorites",
      `Are you sure you want to remove "${product?.name}" from your favorites?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            await removeFromWishlist(productId);
          },
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

  // Load wishlist on mount
  React.useEffect(() => {
    loadWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="px-6 py-4 bg-white flex-row items-center justify-between border-b border-gray-100 shadow-sm">
        <Text className="text-3xl font-bold text-gray-900">Favorites</Text>
        <TouchableOpacity onPress={handleClearFavorites} activeOpacity={0.7}>
          <Text className="text-red-500 font-semibold text-base">Clear</Text>
        </TouchableOpacity>
      </View>

      {/* Danh sách sản phẩm yêu thích */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">Loading...</Text>
        </View>
      ) : favoriteItems.length === 0 ? (
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

                    {/* Favorite Icon - uses API remove */}
                    <TouchableOpacity
                      className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-sm"
                      onPress={(e) => {
                        e.stopPropagation();
                        handleRemoveFromFavorites(item.id);
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
    </SafeAreaView>
  );
};

export default Favorites;
