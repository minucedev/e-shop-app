import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  ScrollView,
  Modal,
} from "react-native";
import React from "react";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import {
  useProduct,
  ProductFilter,
  SortOption,
} from "@/contexts/ProductContext";
import { useFavorites } from "@/contexts/FavoritesContext";

const Shop = () => {
  // Lấy search params từ navigation
  const { searchQuery } = useLocalSearchParams();

  // Lấy sản phẩm từ ProductContext
  const {
    products,
    isLoading,
    formatPrice,
    getUniqueCategories,
    getUniqueBrands,
    filterProducts,
    sortProducts,
  } = useProduct();

  // Lấy favorites từ FavoritesContext
  const { isFavorite, toggleFavorite } = useFavorites();

  // States
  const [searchText, setSearchText] = React.useState("");
  const [filteredProducts, setFilteredProducts] = React.useState(products);
  const [showFilterModal, setShowFilterModal] = React.useState(false);
  const [showSortModal, setShowSortModal] = React.useState(false);

  // Filter states
  const [currentFilters, setCurrentFilters] = React.useState<ProductFilter>({});
  const [currentSort, setCurrentSort] = React.useState<SortOption>("name-asc");

  // Xử lý search query từ navigation params
  React.useEffect(() => {
    if (searchQuery && typeof searchQuery === "string") {
      console.log("Received searchQuery:", searchQuery);
      setSearchText(searchQuery);
    }
  }, [searchQuery]);

  // Cập nhật danh sách sản phẩm khi products thay đổi
  React.useEffect(() => {
    applyFiltersAndSort();
  }, [products, currentFilters, currentSort, searchText]);

  // Áp dụng filter và sort
  const applyFiltersAndSort = () => {
    let filtered = filterProducts({
      ...currentFilters,
      searchQuery: searchText.trim() || undefined,
    });
    let sorted = sortProducts(filtered, currentSort);
    setFilteredProducts(sorted);
  };

  // Xử lý tìm kiếm
  const handleSearch = (text: string) => {
    setSearchText(text);
    setCurrentFilters({
      ...currentFilters,
      searchQuery: text.trim() || undefined,
    });
  };

  // Xử lý toggle yêu thích
  const handleToggleFavorite = (id: string) => {
    toggleFavorite(id);
  };

  // Reset filters
  const resetFilters = () => {
    setCurrentFilters({});
    setSearchText("");
    setCurrentSort("name-asc");
  };

  // Đếm số filter đang active
  const getActiveFilterCount = () => {
    let count = 0;
    if (currentFilters.categoryId) count++;
    if (currentFilters.brandId) count++;
    if (
      currentFilters.minPrice !== undefined ||
      currentFilters.maxPrice !== undefined
    )
      count++;
    if (currentFilters.featured !== undefined) count++;
    if (currentFilters.inStock !== undefined) count++;
    return count;
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
            </View>
          </View>

          {/* Filter Button */}
          <TouchableOpacity
            className="bg-gray-100 rounded-full p-3 relative"
            onPress={() => setShowFilterModal(true)}
          >
            <Feather name="filter" size={20} color="#222" />
            {getActiveFilterCount() > 0 && (
              <View className="absolute -top-1 -right-1 bg-blue-500 rounded-full w-5 h-5 justify-center items-center">
                <Text className="text-white text-xs font-bold">
                  {getActiveFilterCount()}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Sort Button */}
          <TouchableOpacity
            className="bg-gray-100 rounded-full p-3"
            onPress={() => setShowSortModal(true)}
          >
            <Ionicons name="swap-vertical" size={20} color="#222" />
          </TouchableOpacity>
        </View>

        {/* Active Filters Display */}
        {getActiveFilterCount() > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-3"
          >
            <View className="flex-row space-x-2">
              {currentFilters.categoryId && (
                <View className="bg-blue-100 px-3 py-1 rounded-full flex-row items-center">
                  <Text className="text-blue-700 text-sm mr-1">
                    {
                      getUniqueCategories().find(
                        (c) => c.id === currentFilters.categoryId
                      )?.name
                    }
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      setCurrentFilters({
                        ...currentFilters,
                        categoryId: undefined,
                      })
                    }
                  >
                    <Ionicons name="close" size={14} color="#1d4ed8" />
                  </TouchableOpacity>
                </View>
              )}
              {currentFilters.brandId && (
                <View className="bg-green-100 px-3 py-1 rounded-full flex-row items-center">
                  <Text className="text-green-700 text-sm mr-1">
                    {
                      getUniqueBrands().find(
                        (b) => b.id === currentFilters.brandId
                      )?.name
                    }
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      setCurrentFilters({
                        ...currentFilters,
                        brandId: undefined,
                      })
                    }
                  >
                    <Ionicons name="close" size={14} color="#059669" />
                  </TouchableOpacity>
                </View>
              )}
              <TouchableOpacity
                className="bg-red-100 px-3 py-1 rounded-full"
                onPress={resetFilters}
              >
                <Text className="text-red-700 text-sm">Clear All</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </View>
      {/* Product Grid */}
      <View className="flex-1 px-4 pt-2">
        <FlatList
          data={filteredProducts}
          numColumns={2}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={{
            justifyContent: "space-between",
            marginBottom: 20,
          }}
          renderItem={({ item }) => {
            const isItemFavorite = isFavorite(item.id);
            return (
              <TouchableOpacity
                className="bg-white rounded-xl shadow-lg border border-gray-100 w-[48%]"
                activeOpacity={0.8}
                onPress={() => {
                  /* TODO: chuyển sang trang chi tiết sản phẩm */
                }}
              >
                {/* Product Image */}
                <View className="relative">
                  <View className="bg-gray-50 w-28.8 h-32 rounded-xl mr-5 items-center justify-center overflow-hidden ">
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
                      handleToggleFavorite(item.id.toString());
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
                  <Text
                    className="text-xs text-gray-500 mb-2"
                    numberOfLines={2}
                  >
                    {item.description}
                  </Text>
                  <Text className="text-lg font-bold text-blue-600">
                    {formatPrice(item.price)}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View className="flex-1 bg-white">
          <View className="px-6 pt-8 pb-4 border-b border-gray-200">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-bold">Filters</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView className="flex-1 px-6 py-4">
            {/* Categories */}
            <View className="mb-6">
              <Text className="text-lg font-semibold mb-3">Categories</Text>
              <View className="flex-row flex-wrap">
                {getUniqueCategories().map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    className={`mr-3 mb-3 px-4 py-2 rounded-full border ${
                      currentFilters.categoryId === category.id
                        ? "bg-blue-500 border-blue-500"
                        : "bg-white border-gray-300"
                    }`}
                    onPress={() =>
                      setCurrentFilters({
                        ...currentFilters,
                        categoryId:
                          currentFilters.categoryId === category.id
                            ? undefined
                            : category.id,
                      })
                    }
                  >
                    <Text
                      className={
                        currentFilters.categoryId === category.id
                          ? "text-white font-medium"
                          : "text-gray-700"
                      }
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Brands */}
            <View className="mb-6">
              <Text className="text-lg font-semibold mb-3">Brands</Text>
              <View className="flex-row flex-wrap">
                {getUniqueBrands().map((brand) => (
                  <TouchableOpacity
                    key={brand.id}
                    className={`mr-3 mb-3 px-4 py-2 rounded-full border ${
                      currentFilters.brandId === brand.id
                        ? "bg-green-500 border-green-500"
                        : "bg-white border-gray-300"
                    }`}
                    onPress={() =>
                      setCurrentFilters({
                        ...currentFilters,
                        brandId:
                          currentFilters.brandId === brand.id
                            ? undefined
                            : brand.id,
                      })
                    }
                  >
                    <Text
                      className={
                        currentFilters.brandId === brand.id
                          ? "text-white font-medium"
                          : "text-gray-700"
                      }
                    >
                      {brand.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Price Range */}
            <View className="mb-6">
              <Text className="text-lg font-semibold mb-3">Price Range</Text>
              <View className="flex-row flex-wrap">
                {[
                  { label: "Under $100", min: 0, max: 100 },
                  { label: "$100 - $500", min: 100, max: 500 },
                  { label: "$500 - $1000", min: 500, max: 1000 },
                  { label: "Over $1000", min: 1000, max: 9999 },
                ].map((range, index) => {
                  const isSelected =
                    currentFilters.minPrice === range.min &&
                    currentFilters.maxPrice === range.max;
                  return (
                    <TouchableOpacity
                      key={index}
                      className={`mr-3 mb-3 px-4 py-2 rounded-full border ${
                        isSelected
                          ? "bg-purple-500 border-purple-500"
                          : "bg-white border-gray-300"
                      }`}
                      onPress={() =>
                        setCurrentFilters({
                          ...currentFilters,
                          minPrice: isSelected ? undefined : range.min,
                          maxPrice: isSelected ? undefined : range.max,
                        })
                      }
                    >
                      <Text
                        className={
                          isSelected
                            ? "text-white font-medium"
                            : "text-gray-700"
                        }
                      >
                        {range.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Other Filters */}
            <View className="mb-6">
              <Text className="text-lg font-semibold mb-3">Other</Text>
              <TouchableOpacity
                className={`mb-3 px-4 py-3 rounded-lg border ${
                  currentFilters.featured
                    ? "bg-yellow-500 border-yellow-500"
                    : "bg-white border-gray-300"
                }`}
                onPress={() =>
                  setCurrentFilters({
                    ...currentFilters,
                    featured: currentFilters.featured ? undefined : true,
                  })
                }
              >
                <Text
                  className={
                    currentFilters.featured
                      ? "text-white font-medium"
                      : "text-gray-700"
                  }
                >
                  Featured Products Only
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`px-4 py-3 rounded-lg border ${
                  currentFilters.inStock
                    ? "bg-teal-500 border-teal-500"
                    : "bg-white border-gray-300"
                }`}
                onPress={() =>
                  setCurrentFilters({
                    ...currentFilters,
                    inStock: currentFilters.inStock ? undefined : true,
                  })
                }
              >
                <Text
                  className={
                    currentFilters.inStock
                      ? "text-white font-medium"
                      : "text-gray-700"
                  }
                >
                  In Stock Only
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View className="px-6 py-4 border-t border-gray-200">
            <View className="flex-row space-x-3">
              <TouchableOpacity
                className="flex-1 bg-gray-200 py-3 rounded-lg"
                onPress={resetFilters}
              >
                <Text className="text-center text-gray-700 font-medium">
                  Clear All
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-blue-500 py-3 rounded-lg"
                onPress={() => setShowFilterModal(false)}
              >
                <Text className="text-center text-white font-medium">
                  Apply
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Sort Modal */}
      <Modal
        visible={showSortModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View className="flex-1 bg-white">
          <View className="px-6 pt-8 pb-4 border-b border-gray-200">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-bold">Sort By</Text>
              <TouchableOpacity onPress={() => setShowSortModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="px-6 py-4">
            {[
              { label: "Name (A-Z)", value: "name-asc" as SortOption },
              { label: "Name (Z-A)", value: "name-desc" as SortOption },
              {
                label: "Price (Low to High)",
                value: "price-asc" as SortOption,
              },
              {
                label: "Price (High to Low)",
                value: "price-desc" as SortOption,
              },
              { label: "Best Rating", value: "rating-desc" as SortOption },
              { label: "Newest First", value: "newest" as SortOption },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                className={`flex-row items-center justify-between py-4 border-b border-gray-100 ${
                  currentSort === option.value ? "bg-blue-50" : ""
                }`}
                onPress={() => {
                  setCurrentSort(option.value);
                  setShowSortModal(false);
                }}
              >
                <Text
                  className={`text-lg ${
                    currentSort === option.value
                      ? "text-blue-600 font-medium"
                      : "text-gray-700"
                  }`}
                >
                  {option.label}
                </Text>
                {currentSort === option.value && (
                  <Ionicons name="checkmark" size={24} color="#2563eb" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Shop;
