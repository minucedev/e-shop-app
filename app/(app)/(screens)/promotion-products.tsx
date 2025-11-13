// app/(app)/(screens)/promotion-products.tsx
import React from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useProduct } from "@/contexts/ProductContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { ProductCard } from "@/components/ProductCard";
import { getProducts } from "@/services/productApi";
import { getCampaignById, ICampaign } from "@/services/campaignApi";
import type { Product } from "@/contexts/ProductContext";

const PromotionProducts = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { campaignId, campaignName } = params;

  const { formatPrice } = useProduct();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [campaign, setCampaign] = React.useState<ICampaign | null>(null);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isLoadingCampaign, setIsLoadingCampaign] = React.useState(true);
  const [currentPage, setCurrentPage] = React.useState(0);
  const [hasMore, setHasMore] = React.useState(true);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);

  // Fetch campaign details
  const fetchCampaign = React.useCallback(async () => {
    if (!campaignId) return;

    try {
      setIsLoadingCampaign(true);
      const data = await getCampaignById(parseInt(campaignId as string, 10));
      setCampaign(data);
    } catch (error) {
      console.error("Error fetching campaign:", error);
    } finally {
      setIsLoadingCampaign(false);
    }
  }, [campaignId]);

  // Fetch products for this campaign
  const fetchProducts = React.useCallback(
    async (page: number = 0) => {
      if (!campaignId) return;

      try {
        if (page === 0) {
          setIsLoading(true);
        } else {
          setIsLoadingMore(true);
        }

        const response = await getProducts({
          campaignId: parseInt(campaignId as string, 10),
          page,
          size: 20,
        });

        if (page === 0) {
          setProducts(response.content);
        } else {
          setProducts((prev) => [...prev, ...response.content]);
        }

        setCurrentPage(response.page.number);
        setHasMore(response.page.number < response.page.totalPages - 1);
      } catch (error) {
        console.error("Error fetching promotion products:", error);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [campaignId]
  );

  React.useEffect(() => {
    fetchCampaign();
    fetchProducts(0);
  }, [fetchCampaign, fetchProducts]);

  const handleLoadMore = () => {
    if (!hasMore || isLoadingMore) return;
    fetchProducts(currentPage + 1);
  };

  const renderFooter = () => {
    if (!hasMore) return null;
    return (
      <View className="py-4">
        <ActivityIndicator size="small" color="#3b82f6" />
      </View>
    );
  };

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Calculate days remaining
  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header with back button */}
      <View className="bg-white border-b border-gray-200">
        <View className="px-4 py-3 flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-3 p-2 -ml-2"
          >
            <Ionicons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text
            className="text-gray-900 text-lg font-bold flex-1"
            numberOfLines={1}
          >
            Promotion Details
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Campaign Banner & Info */}
        {isLoadingCampaign ? (
          <View className="bg-white p-6">
            <ActivityIndicator size="small" color="#3b82f6" />
          </View>
        ) : campaign ? (
          <View className="bg-white mb-2">
            {/* Banner Image */}
            <View className="relative">
              <Image
                source={{ uri: campaign.image }}
                className="w-full h-56"
                resizeMode="cover"
              />
              {/* Gradient overlay */}
              <View className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />

              {/* Days remaining badge */}
              {getDaysRemaining(campaign.endDate) > 0 && (
                <View className="absolute top-4 right-4 bg-red-500 px-3 py-1.5 rounded-full">
                  <Text className="text-white text-xs font-bold">
                    {getDaysRemaining(campaign.endDate)} days left
                  </Text>
                </View>
              )}
            </View>

            {/* Campaign Info */}
            <View className="px-4 py-4">
              {/* Title */}
              <Text className="text-2xl font-bold text-gray-900 mb-2">
                {campaign.name}
              </Text>

              {/* Date Range */}
              <View className="flex-row items-center mb-3">
                <Ionicons name="calendar-outline" size={16} color="#6b7280" />
                <Text className="text-gray-600 text-sm ml-2">
                  {formatDate(campaign.startDate)} -{" "}
                  {formatDate(campaign.endDate)}
                </Text>
              </View>

              {/* Description */}
              {campaign.description && (
                <View className="bg-blue-50 p-3 rounded-lg mb-3">
                  <View className="flex-row items-start">
                    <Ionicons
                      name="information-circle"
                      size={18}
                      color="#3b82f6"
                    />
                    <Text className="text-gray-700 text-sm ml-2 flex-1">
                      {campaign.description}
                    </Text>
                  </View>
                </View>
              )}

              {/* Stats */}
              <View className="flex-row items-center justify-between border-t border-gray-200 pt-3">
                <View className="flex-row items-center">
                  <Ionicons name="pricetag" size={18} color="#3b82f6" />
                  <Text className="text-gray-600 text-sm ml-2">
                    {campaign.promotionCount} promotions available
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="cube" size={18} color="#10b981" />
                  <Text className="text-gray-600 text-sm ml-2">
                    {products.length} products
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ) : null}

        {/* Products Section Header */}
        <View className="px-4 py-3 bg-white mb-2">
          <Text className="text-lg font-bold text-gray-900">
            Featured Products
          </Text>
          <Text className="text-sm text-gray-500 mt-1">
            Special deals just for you
          </Text>
        </View>

        {/* Product List */}
        {isLoading && products.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20">
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text className="text-gray-500 mt-4">Loading products...</Text>
          </View>
        ) : products.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20 bg-white">
            <Ionicons name="pricetag-outline" size={64} color="#ccc" />
            <Text className="text-gray-500 text-lg mt-4 text-center">
              No products in this promotion
            </Text>
            <Text className="text-gray-400 text-sm mt-2 text-center px-6">
              Check back later for exciting deals!
            </Text>
          </View>
        ) : (
          <View className="bg-white px-2 pb-4">
            <FlatList
              data={products}
              keyExtractor={(item) => item.id.toString()}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={{
                justifyContent: "space-between",
                paddingHorizontal: 8,
                marginBottom: 12,
              }}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.5}
              ListFooterComponent={renderFooter}
              renderItem={({ item }) => (
                <ProductCard
                  product={item}
                  isInWishlist={isInWishlist(item.id)}
                  onToggleWishlist={toggleWishlist}
                  formatPrice={formatPrice}
                />
              )}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default PromotionProducts;
