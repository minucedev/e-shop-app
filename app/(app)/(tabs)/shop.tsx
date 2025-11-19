import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Animated,
} from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useProduct } from "@/contexts/ProductContext";
import { useFilter } from "@/contexts/FilterContext";
import { useCart } from "@/contexts/CartContext";
import { useRouter } from "expo-router";
import { FilterBottomSheet } from "@/components/FilterBottomSheet";
import { ActiveFilterTags } from "@/components/ActiveFilterTags";
import { ProductCard } from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/ProductCardSkeleton";

const Shop = () => {
  // Lấy search params từ navigation (for search only)
  const params = useLocalSearchParams();
  const { searchQuery } = params;

  // Lấy sản phẩm từ ProductContext
  const {
    filteredProducts,
    isLoading,
    formatPrice,
    fetchProductsWithFilters,
    loadMoreWithFilters,
    filteredHasMore,
  } = useProduct();

  // Lấy filter từ FilterContext
  const { filters, setSearchQuery, getFilterParams, hasActiveFilters } =
    useFilter();

  // Lấy cart từ CartContext (not used but keeping for consistency)
  const { addToCart } = useCart();
  const router = useRouter();

  // States
  const [searchText, setSearchText] = React.useState("");
  const [showFilterModal, setShowFilterModal] = React.useState(false);
  const [isInitialized, setIsInitialized] = React.useState(false);
  const lastFetchedParamsRef = React.useRef<string>("");

  // Animated value for smooth fade transition
  const fadeAnim = React.useRef(new Animated.Value(1)).current;
  const [isTransitioning, setIsTransitioning] = React.useState(false);

  // Sync searchText with filters.searchQuery when it changes externally (e.g., clear from ActiveFilterTags)
  React.useEffect(() => {
    if (filters.searchQuery === undefined && searchText !== "") {
      setSearchText("");
    }
  }, [filters.searchQuery]);

  // Initialize search query from navigation params
  React.useLayoutEffect(() => {
    if (searchQuery && typeof searchQuery === "string") {
      console.log("[Shop] Setting searchQuery:", searchQuery);
      setSearchText(searchQuery);
      setSearchQuery(searchQuery);
    } else if (!searchQuery) {
      setSearchQuery(undefined);
      setSearchText("");
    }
  }, [searchQuery]);

  // Fetch products when filters change with smooth transition
  React.useEffect(() => {
    const currentParams = getFilterParams();
    const paramsKey = JSON.stringify(currentParams);

    // Only fetch if params actually changed
    if (paramsKey !== lastFetchedParamsRef.current) {
      lastFetchedParamsRef.current = paramsKey;

      const fetchId = requestAnimationFrame(() => {
        console.log("[Shop] Fetching with params:", currentParams);

        // Start fade out animation before fetching
        setIsTransitioning(true);
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 150,
          useNativeDriver: true,
        }).start(() => {
          // Fetch data after fade out
          fetchProductsWithFilters(currentParams).then(() => {
            // Fade in animation after data loaded
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }).start(() => {
              setIsTransitioning(false);
            });
          });
        });
      });

      if (!isInitialized) {
        setIsInitialized(true);
      }

      return () => cancelAnimationFrame(fetchId);
    } else if (!isInitialized) {
      setIsInitialized(true);
    }
  }, [filters]);

  // Reset search
  const resetSearch = React.useCallback(() => {
    setSearchText("");
    setSearchQuery(undefined);
  }, [setSearchQuery]);

  // Handle search submit - only search when user presses Enter or search button
  const handleSearch = React.useCallback(() => {
    console.log("[Shop] Manual search triggered:", searchText);
    setSearchQuery(searchText || undefined);
  }, [searchText, setSearchQuery]);

  // Handle filter apply
  const handleApplyFilters = React.useCallback(() => {
    const params = getFilterParams();
    fetchProductsWithFilters(params);
  }, [getFilterParams, fetchProductsWithFilters]);

  // Load more products
  const handleLoadMore = React.useCallback(() => {
    if (!filteredHasMore) return;
    const params = getFilterParams();
    loadMoreWithFilters(params);
  }, [filteredHasMore, getFilterParams, loadMoreWithFilters]);

  // Render footer cho FlatList (loading more indicator)
  const renderFooter = React.useCallback(() => {
    if (!filteredHasMore) return null;
    return (
      <View className="py-4">
        <ActivityIndicator size="small" color="#3b82f6" />
      </View>
    );
  }, [filteredHasMore]);

  // Memoize renderItem for better performance
  const renderItem = React.useCallback(
    ({ item }: { item: any }) => (
      <ProductCard product={item} formatPrice={formatPrice} />
    ),
    [formatPrice]
  );

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 py-4 bg-white border-b border-gray-100 shadow-sm">
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-900 text-2xl font-bold">Shop</Text>
          <View className="flex-row items-center gap-2">
            <Text className="text-gray-500 text-sm">
              {filteredProducts.length} products
            </Text>
            {hasActiveFilters() && (
              <View className="bg-white-600 rounded-full px-2 py-0.5"></View>
            )}
          </View>
        </View>

        {/* Thanh tìm kiếm và filter button */}
        <View className="flex-row items-center mt-4 gap-3">
          <View className="flex-1">
            <View className="flex-row items-center bg-gray-100 rounded-full px-4 h-12">
              <TouchableOpacity onPress={handleSearch}>
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
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
              {searchText.length > 0 && (
                <TouchableOpacity onPress={resetSearch}>
                  <Ionicons name="close-circle" size={20} color="#888" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Filter Button */}
          <TouchableOpacity
            className="bg-blue-600 p-3 rounded-full"
            onPress={() => setShowFilterModal(true)}
          >
            <Ionicons name="options-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Active Filter Tags - no campaign support here anymore */}
      <ActiveFilterTags />

      {/* Product List with smooth transition */}
      {isLoading && filteredProducts.length === 0 ? (
        <ProductGridSkeleton count={6} />
      ) : filteredProducts.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="search-outline" size={64} color="#ccc" />
          <Text className="text-gray-500 text-lg mt-4 text-center">
            No products found
          </Text>
          <Text className="text-gray-400 text-sm mt-2 text-center">
            Try adjusting your filters
          </Text>
        </View>
      ) : (
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
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
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            windowSize={10}
            initialNumToRender={6}
            renderItem={renderItem}
          />
        </Animated.View>
      )}

      {/* Filter Bottom Sheet */}
      <FilterBottomSheet
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={handleApplyFilters}
      />
    </View>
  );
};

export default Shop;
