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

const Favorites = () => {
  // Lấy sản phẩm từ ProductContext
  const { products, getProductById } = useProduct();

  // Lấy favorites từ FavoritesContext
  const { favoriteIds, clearFavorites, removeFromFavorites } = useFavorites();

  // State cho giỏ hàng (tạm thời, sau này có thể tạo CartContext)
  const [cartItems, setCartItems] = React.useState<{ [key: string]: number }>(
    {}
  );

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

  // Hàm thêm sản phẩm vào giỏ hàng với số lượng
  const handleAddToCart = (productId: string) => {
    const product = getProductById(productId);
    if (!product) return;

    setCartItems((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }));

    Alert.alert(
      "Added to Cart",
      `${product.name} has been added to your cart!`,
      [
        { text: "Continue Shopping", style: "default" },
        {
          text: "View Cart",
          onPress: () => {
            // TODO: Navigate to cart screen
            console.log("Navigate to cart");
          },
        },
      ]
    );
  };

  // Hàm kiểm tra sản phẩm đã có trong giỏ hàng chưa
  const getCartQuantity = (productId: string) => cartItems[productId] || 0;

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
            keyExtractor={(item) => item!.id.toString()}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={{
              justifyContent: "space-between",
              marginBottom: 20,
            }}
            renderItem={({ item }) => {
              if (!item) return null;
              const cartQuantity = getCartQuantity(item.id.toString());

              return (
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
                      handleRemoveFromFavorites(item.id.toString());
                    }}
                  >
                    <Ionicons name="heart" size={22} color="#e74c3c" />
                  </TouchableOpacity>

                  {/* Badge số lượng trong giỏ hàng */}
                  {cartQuantity > 0 && (
                    <View
                      style={{
                        position: "absolute",
                        top: 10,
                        left: 10,
                        zIndex: 1,
                      }}
                      className="bg-green-500 rounded-full w-6 h-6 items-center justify-center"
                    >
                      <Text className="text-white text-xs font-bold">
                        {cartQuantity}
                      </Text>
                    </View>
                  )}

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
                    {formatPrice(item.price)}
                  </Text>

                  {/* Nút thêm vào giỏ hàng với animation */}
                  <TouchableOpacity
                    className={`rounded-full p-2 self-end ${
                      cartQuantity > 0 ? "bg-green-500" : "bg-blue-500"
                    }`}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleAddToCart(item.id.toString());
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={cartQuantity > 0 ? "checkmark" : "bag-add"}
                      size={18}
                      color="white"
                    />
                  </TouchableOpacity>
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
