// app/(app)/(screens)/search-results.tsx

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getProductsBySpus, ProductApiResponse } from "@/services/productApi";

export default function SearchResults() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<ProductApiResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const searchType = params.search_type as string;
  const spus = params.spus as string;

  useEffect(() => {
    const fetchProducts = async () => {
      if (!spus) {
        setIsLoading(false);
        return;
      }

      try {
        console.log("🔍 [SearchResults] Fetching products for SPUs:", spus);

        const spuArray = spus.split(",");
        const productData = await getProductsBySpus(spuArray);

        setProducts(productData);
        console.log("✅ [SearchResults] Loaded products:", productData.length);
      } catch (error) {
        console.error("❌ [SearchResults] Error loading products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [spus]);

  const handleProductPress = (id: number) => {
    router.push(`/(app)/(screens)/product-detail?id=${id}`);
  };

  const renderProduct = ({ item }: { item: ProductApiResponse }) => {
    const displayPrice = item.displaySalePrice ?? 0;
    const originalPrice = item.displayOriginalPrice ?? 0;
    const hasDiscount = item.discountValue && item.discountValue > 0;

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => handleProductPress(item.id)}
        activeOpacity={0.8}
      >
        {/* Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri:
                item.imageUrl ||
                "https://placehold.co/200x200/e2e8f0/64748b?text=No+Image",
            }}
            style={styles.productImage}
            resizeMode="cover"
          />
          {hasDiscount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>
                -
                {item.discountType === "PERCENTAGE"
                  ? `${item.discountValue}%`
                  : `${((item.discountValue ?? 0) / 1000).toFixed(0)}K`}
              </Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>

          {displayPrice > 0 && (
            <View style={styles.priceContainer}>
              <Text style={styles.currentPrice}>
                {displayPrice.toLocaleString("vi-VN")}đ
              </Text>
              {hasDiscount && originalPrice > 0 && (
                <Text style={styles.originalPrice}>
                  {originalPrice.toLocaleString("vi-VN")}đ
                </Text>
              )}
            </View>
          )}

          {item.averageRating > 0 && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={12} color="#F59E0B" />
              <Text style={styles.ratingText}>
                {item.averageRating.toFixed(1)}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Ionicons
            name={searchType === "image" ? "camera" : "search"}
            size={20}
            color="#3B82F6"
          />
          <Text style={styles.headerTitle}>
            {searchType === "image"
              ? "Tìm kiếm bằng hình ảnh"
              : "Kết quả tìm kiếm"}
          </Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Đang phân tích hình ảnh...</Text>
          <Text style={styles.loadingHint}>
            AI đang tìm kiếm sản phẩm tương tự
          </Text>
        </View>
      ) : products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>Không tìm thấy sản phẩm</Text>
          <Text style={styles.emptyDescription}>
            Không có sản phẩm phù hợp với tìm kiếm của bạn.
          </Text>
          <TouchableOpacity
            style={styles.backToHomeButton}
            onPress={() => router.push("/(app)/(tabs)/home")}
          >
            <Text style={styles.backToHomeButtonText}>Quay lại trang chủ</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.listContainer}>
          <Text style={styles.resultCount}>
            Tìm thấy {products.length} sản phẩm
          </Text>
          <FlatList
            data={products}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 4,
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  placeholder: {
    width: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 32,
  },
  loadingText: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "600",
    marginTop: 8,
  },
  loadingHint: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  backToHomeButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backToHomeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  listContainer: {
    flex: 1,
  },
  resultCount: {
    fontSize: 14,
    color: "#6B7280",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  listContent: {
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  productCard: {
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 180,
    backgroundColor: "#F3F4F6",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  discountBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#EF4444",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    color: "white",
    fontSize: 12,
    fontWeight: "700",
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
    lineHeight: 20,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#EF4444",
  },
  originalPrice: {
    fontSize: 13,
    color: "#9CA3AF",
    textDecorationLine: "line-through",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: "#6B7280",
  },
  productWrapper: {
    width: "50%",
    padding: 8,
  },
});
