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
import { useProduct } from "@/contexts/ProductContext";
import { getActiveCampaigns, ICampaign } from "@/services/campaignApi";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { useRouter } from "expo-router";

const Home = () => {
  const router = useRouter();
  // Get products from ProductContext
  const { products, isLoading } = useProduct();
  const { formatPrice } = useProduct();

  // Campaign banners state
  const [campaigns, setCampaigns] = React.useState<ICampaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = React.useState(true);
  const [selectedCampaign, setSelectedCampaign] =
    React.useState<ICampaign | null>(null);

  // Get wishlist from WishlistContext
  const { isInWishlist, toggleWishlist } = useWishlist();

  // Get cart from CartContext
  const { addToCart } = useCart();

  React.useEffect(() => {
    getActiveCampaigns()
      .then((data) => {
        setCampaigns(data);
      })
      .catch(() => setCampaigns([]))
      .finally(() => setLoadingCampaigns(false));
  }, []);

  const renderProductItem = ({ item }: { item: (typeof products)[0] }) => {
    const isItemFavorite = isInWishlist(item.id);

    // Calculate discount percentage for display
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

    const hasDiscount = item.displayOriginalPrice > item.displaySalePrice;

    return (
      <TouchableOpacity
        className="mr-4 w-48 bg-white rounded-xl shadow-lg border border-gray-100"
        onPress={() =>
          router.push(`/(app)/(screens)/product-detail?id=${item.id}`)
        }
      >
        {/* Product Image */}
        <View className="relative">
          <View className="bg-gray-50 w-32 h-32 rounded-t-xl items-center justify-center overflow-hidden">
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
              toggleWishlist(item.id);
            }}
          >
            <Ionicons
              name={isItemFavorite ? "heart" : "heart-outline"}
              size={25}
              color={isItemFavorite ? "#e74c3c" : "#666"}
            />
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

          {/* Rating */}
          <View className="flex-row items-center mb-2">
            <Ionicons name="star" size={14} color="#FFA500" />
            <Text className="text-xs text-gray-600 ml-1">
              {item.averageRating.toFixed(1)} ({item.totalRatings})
            </Text>
          </View>

          {/* Price and Cart */}
          <View className="flex-row items-center justify-between">
            <View>
              {hasDiscount && (
                <Text className="text-xs text-gray-400 line-through">
                  {formatPrice(item.displayOriginalPrice)}
                </Text>
              )}
              <Text className="text-lg font-bold text-blue-600">
                {formatPrice(item.displaySalePrice)}
              </Text>
            </View>

            {/* View Detail Button */}
            <TouchableOpacity
              className="bg-blue-500 p-2 rounded-full"
              onPress={(e) => {
                e.stopPropagation();
                router.push({
                  pathname: "/(app)/(screens)/product-detail",
                  params: { id: item.id.toString() },
                });
              }}
            ></TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const { user } = useAuth();

  const [searchText, setSearchText] = React.useState("");

  // Handle search - navigate to shop with search query
  const handleSearch = (text: string) => {
    if (text.trim()) {
      // Use router.push with query string
      router.push(
        `/(app)/(tabs)/shop?searchQuery=${encodeURIComponent(text.trim())}`
      );
      setSearchText(""); // Clear search text after navigation
    }
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      {/* Status Bar and Header */}
      <View className="px-6 py-4 bg-white border-b border-gray-100 shadow-sm">
        <Text className="text-3xl font-bold text-gray-900 mt-2">
          {(() => {
            const hour = new Date().getHours();
            if (hour < 12) return "Good morning";
            if (hour < 18) return "Good afternoon";
            return "Good evening";
          })()}{" "}
          {user?.firstName}
        </Text>
        {/* Search Bar */}
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
                placeholder="Search products..."
                placeholderTextColor="#888"
                style={{ borderWidth: 0, backgroundColor: "transparent" }}
                value={searchText}
                onChangeText={setSearchText}
                onSubmitEditing={(e) => handleSearch(e.nativeEvent.text)}
                returnKeyType="search"
              />
            </View>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Campaign Banner Section */}
        <View className="mx-4 mt-2">
          <Text className="text-lg font-bold text-gray-900 mb-2">
            Promotion Events
          </Text>
          {loadingCampaigns ? (
            <Text className="text-gray-500">Loading...</Text>
          ) : (
            <FlatList
              data={campaigns}
              horizontal
              keyExtractor={(item) => item.id.toString()}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="mr-3 w-52"
                  activeOpacity={0.85}
                  onPress={() => setSelectedCampaign(item)}
                >
                  <View className="bg-blue-100 rounded-xl p-4 relative overflow-hidden shadow-md">
                    {/* Banner Image */}
                    <Image
                      source={{ uri: item.image }}
                      className="w-full h-32 rounded-xl mb-2"
                      resizeMode="cover"
                    />
                  </View>
                </TouchableOpacity>
              )}
              contentContainerStyle={{ paddingRight: 16 }}
            />
          )}
          {/* Campaign Popup Modal */}
          {selectedCampaign && (
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.6)",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 99,
              }}
            >
              <View className="bg-white rounded-2xl p-6 w-11/12 max-w-md shadow-2xl">
                {/* Close button */}
                <TouchableOpacity
                  className="absolute top-4 right-4 bg-gray-200 rounded-full p-2 z-10"
                  onPress={() => setSelectedCampaign(null)}
                >
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>

                {/* Campaign Image */}
                {/* <Image
                  source={{ uri: selectedCampaign.image }}
                  className="w-full h-48 rounded-xl mb-4"
                  resizeMode="cover"
                /> */}

                {/* Campaign Name */}
                <Text className="text-2xl font-bold text-blue-800 mb-3 text-center">
                  {selectedCampaign.name}
                </Text>

                {/* Divider */}
                <View className="w-full h-px bg-gray-200 mb-4" />

                {/* Description Section */}
                <View className="mb-4">
                  <View className="flex-row items-center mb-2">
                    <Ionicons
                      name="information-circle"
                      size={20}
                      color="#3a404cff"
                    />
                    <Text className="text-base font-semibold text-gray-800 ml-2">
                      Description
                    </Text>
                  </View>
                  <Text className="text-base text-gray-700 leading-6">
                    {selectedCampaign.description}
                  </Text>
                </View>

                {/* Date Section */}
                <View className="bg-blue-50 rounded-xl p-4 mb-4">
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center flex-1">
                      <Ionicons
                        name="calendar-outline"
                        size={18}
                        color="#2563eb"
                      />
                      <Text className="text-sm font-semibold text-gray-700 ml-2">
                        Start Date
                      </Text>
                    </View>
                    <Text className="text-sm font-bold text-blue-800">
                      {new Date(selectedCampaign.startDate).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "2-digit",
                          year: "numeric",
                        }
                      )}
                    </Text>
                  </View>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      <Ionicons
                        name="calendar-outline"
                        size={18}
                        color="#dc2626"
                      />
                      <Text className="text-sm font-semibold text-gray-700 ml-2">
                        End Date
                      </Text>
                    </View>
                    <Text className="text-sm font-bold text-red-600">
                      {new Date(selectedCampaign.endDate).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "2-digit",
                          year: "numeric",
                        }
                      )}
                    </Text>
                  </View>
                </View>

                {/* Close Button */}
                <TouchableOpacity
                  className="bg-blue-600 py-3 rounded-full"
                  onPress={() => setSelectedCampaign(null)}
                >
                  <Text className="text-white font-bold text-center text-base">
                    Close
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Popular Now Section */}
        <View className="px-4 mt-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">
            Popular Now
          </Text>
          <FlatList
            data={products.slice(6, 9)}
            renderItem={({ item }) => {
              const isItemFavorite = isInWishlist(item.id);
              const hasDiscount =
                item.displayOriginalPrice > item.displaySalePrice;
              return (
                <TouchableOpacity
                  className="mr-4 w-40 bg-white rounded-xl shadow-lg border border-gray-100"
                  onPress={() =>
                    router.push(`/(app)/(screens)/product-detail?id=${item.id}`)
                  }
                >
                  {/* Product Image */}
                  <View className="relative">
                    <View className="bg-gray-50 h-28 rounded-t-xl items-center justify-center overflow-hidden">
                      <Image
                        source={{
                          uri:
                            item.imageUrl || "https://via.placeholder.com/150",
                        }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    </View>
                    {/* Popular Badge */}
                    <View className="absolute top-2 left-2 bg-red-500 rounded-full px-2 py-1">
                      <Text className="text-xs font-bold text-white">HOT</Text>
                    </View>
                    {/* Favorite Icon */}
                    <TouchableOpacity
                      className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-sm"
                      onPress={(e) => {
                        e.stopPropagation();
                        toggleWishlist(item.id);
                      }}
                    >
                      <Ionicons
                        name={isItemFavorite ? "heart" : "heart-outline"}
                        size={25}
                        color={isItemFavorite ? "#e74c3c" : "#666"}
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Product Info */}
                  <View className="p-3">
                    <Text
                      className="text-sm font-bold text-gray-900 mb-1"
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                    <View className="flex-row items-center justify-between">
                      <View>
                        {hasDiscount && (
                          <Text className="text-xs text-gray-400 line-through">
                            {formatPrice(item.displayOriginalPrice)}
                          </Text>
                        )}
                        <Text className="text-base font-bold text-blue-600">
                          {formatPrice(item.displaySalePrice)}
                        </Text>
                      </View>

                      {/* View Detail Button */}
                      <TouchableOpacity
                        // className="bg-blue-500 p-1.5 rounded-full"
                        onPress={(e) => {
                          e.stopPropagation();
                          router.push({
                            pathname: "/(app)/(screens)/product-detail",
                            params: { id: item.id.toString() },
                          });
                        }}
                      ></TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
            keyExtractor={(item) => item.id.toString()}
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
          <FlatList
            data={
              // Lấy 5 sản phẩm random theo id
              [...products].sort(() => Math.random() - 0.5).slice(0, 5)
            }
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 16 }}
          />
        </View>

        {/* Add space at bottom to avoid bottom navigation overlap */}
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
