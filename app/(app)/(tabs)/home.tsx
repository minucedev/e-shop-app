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
              // className="bg-blue-500 p-2 rounded-full"
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
                  onPress={() => {
                    // Navigate to dedicated promotion products screen
                    router.push({
                      pathname: "/(app)/(screens)/promotion-products",
                      params: {
                        campaignId: item.id.toString(),
                        campaignName: item.name,
                      },
                    });
                  }}
                >
                  <View className="bg-blue-100 rounded-xl p-4 relative overflow-hidden shadow-md">
                    {/* Banner Image */}
                    <Image
                      source={{ uri: item.image }}
                      className="w-full h-32 rounded-xl mb-2"
                      resizeMode="cover"
                    />
                    {/* Campaign Name Badge */}
                    <View className="bg-white/90 px-3 py-1.5 rounded-lg">
                      <Text className="text-sm font-bold text-blue-800 text-center">
                        {item.name}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              contentContainerStyle={{ paddingRight: 16 }}
            />
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
