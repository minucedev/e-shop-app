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
import { usePromotion, IPromotion } from "@/contexts/PromotionContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useRouter } from "expo-router";

const Home = () => {
  const router = useRouter();
  // Get products from ProductContext
  const { products, isLoading } = useProduct();
  const { formatPrice } = useProduct();

  // Get promotions from PromotionContext
  const { getPromotions } = usePromotion();
  const [promotions, setPromotions] = React.useState<IPromotion[]>([]);
  const [loadingPromos, setLoadingPromos] = React.useState(true);

  // Get favorites from FavoritesContext
  const { isFavorite, toggleFavorite } = useFavorites();

  React.useEffect(() => {
    getPromotions().then((data) => {
      setPromotions(data);
      setLoadingPromos(false);
    });
  }, []);

  const renderProductItem = ({ item }: { item: (typeof products)[0] }) => {
    const isItemFavorite = isFavorite(item.id);
    return (
      <TouchableOpacity className="mr-4 w-48 bg-white rounded-xl shadow-lg border border-gray-100">
        {/* Product Image */}
        <View className="relative">
          <View className="bg-gray-50 w-32 h-32 rounded-t-xl items-center justify-center overflow-hidden">
            <Image
              source={{ uri: item.image }}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>
          {/* Favorite Icon */}
          <TouchableOpacity 
            className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-sm"
            onPress={(e) => {
              e.stopPropagation();
              toggleFavorite(item.id.toString());
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
        <Text className="text-xs text-gray-500 mb-2" numberOfLines={2}>
          {item.description}
        </Text>

        {/* Price */}
        <Text className="text-lg font-bold text-blue-600">
          {formatPrice(item.price)}
        </Text>
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
      <View className="pt-12 px-4 pb-4 bg-white">
        <Text className="text-3xl font-bold text-gray-900 mt-2">
          {(() => {
            const hour = new Date().getHours();
            if (hour < 12) return "Good morning";
            if (hour < 18) return "Good afternoon";
            return "Good evening";
          })()}{" "}
          {user?.name}
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
        {/* Promotion Banner Section */}
        <View className="mx-4 mt-2">
          <Text className="text-lg font-bold text-gray-900 mb-2">
            Promotion Events
          </Text>
          {loadingPromos ? (
            <Text className="text-gray-500">Loading...</Text>
          ) : (
            <FlatList
              data={promotions}
              horizontal
              keyExtractor={(item) => item.id.toString()}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="mr-3 w-52"
                  activeOpacity={0.85}
                  onPress={() =>
                    router.push({
                      pathname: "/(app)/(screens)/promotion-detail",
                      params: { id: item.id },
                    })
                  }
                >
                  <View className="bg-blue-100 rounded-xl p-4 relative overflow-hidden shadow-md">
                    {/* Diagonal stripe background pattern */}
                    <View className="absolute inset-0 opacity-20">
                      <View className="absolute w-full h-3 bg-blue-300 top-2 -left-6 right-6 transform -rotate-12"></View>
                      <View className="absolute w-full h-3 bg-blue-300 top-8 -left-6 right-6 transform -rotate-12"></View>
                      <View className="absolute w-full h-3 bg-blue-300 top-14 -left-6 right-6 transform -rotate-12"></View>
                      <View className="absolute w-full h-3 bg-blue-300 top-20 -left-6 right-6 transform -rotate-12"></View>
                    </View>

                    {/* Content */}
                    <View className="z-10">
                      <View className="mb-2">
                        <Text className="text-2xl font-extrabold text-blue-800 mb-1">
                          {item.discountType === "PERCENTAGE"
                            ? `${item.discountValue}% OFF`
                            : `${Math.round(item.discountValue / 1000)}K OFF`}
                        </Text>
                        <Text
                          className="text-sm font-medium text-blue-700"
                          numberOfLines={2}
                        >
                          {item.name
                            .replace(/^\d+% Off /, "")
                            .replace(/^\d+K Off /, "")}
                        </Text>
                      </View>

                      <View className="bg-blue-800 rounded-full px-4 py-2 self-start">
                        <Text className="text-sm font-bold text-white">
                          SHOP NOW
                        </Text>
                      </View>
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
              const isItemFavorite = isFavorite(item.id);
              return (
                <TouchableOpacity className="mr-4 w-40 bg-white rounded-xl shadow-lg border border-gray-100">
                  {/* Product Image */}
                  <View className="relative">
                    <View className="bg-gray-50 h-28 rounded-t-xl items-center justify-center overflow-hidden">
                      <Image
                        source={{ uri: item.image }}
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
                        toggleFavorite(item.id.toString());
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
                  <Text className="text-base font-bold text-blue-600">
                    {formatPrice(item.price)}
                  </Text>
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

          {/* Horizontal Product List */}
          <FlatList
            data={products}
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
