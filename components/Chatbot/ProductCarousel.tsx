// components/Chatbot/ProductCarousel.tsx

import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { useChat } from "@/contexts/ChatContext";
import type { ProductApiResponse } from "@/services/productApi";

interface ProductCarouselProps {
  products: ProductApiResponse[];
}

export const ProductCarousel: React.FC<ProductCarouselProps> = ({
  products,
}) => {
  const router = useRouter();
  const { setChatOpen } = useChat();

  const handleProductPress = (id: number) => {
    console.log("🔍 [ProductCarousel] Navigating to product:", id);

    // Đóng modal TRƯỚC khi navigate
    setChatOpen(false);

    // Navigate sau khi modal đóng
    setTimeout(() => {
      router.push(`/(app)/(screens)/product-detail?id=${id}`);
    }, 100);
  };

  const renderProduct = ({ item }: { item: ProductApiResponse }) => {
    // Null safety checks
    const displayPrice = item.displaySalePrice ?? 0;
    const originalPrice = item.displayOriginalPrice ?? 0;
    const hasDiscount = item.discountValue && item.discountValue > 0;
    const averageRating = item.averageRating ?? 0;
    const totalRatings = item.totalRatings ?? 0;

    // Image URL với fallback
    const imageUri =
      item.imageUrl ||
      "https://placehold.co/160x160/e2e8f0/64748b?text=No+Image";

    // Debug log cho ảnh
    if (!item.imageUrl) {
      console.log(
        `⚠️ [ProductCarousel] Product ${item.id} (${item.name}) has no imageUrl`
      );
    }

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => handleProductPress(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUri }}
            style={styles.productImage}
            resizeMode="cover"
            onError={() =>
              console.log(
                `❌ [ProductCarousel] Failed to load image for product ${item.id}`
              )
            }
          />
          {hasDiscount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>
                -
                {item.discountType === "PERCENTAGE"
                  ? `${item.discountValue}%`
                  : `${item.discountValue}đ`}
              </Text>
            </View>
          )}
        </View>

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

          {averageRating > 0 && (
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingText}>
                ⭐ {averageRating.toFixed(1)}
              </Text>
              {totalRatings > 0 && (
                <Text style={styles.soldText}> • {totalRatings} đánh giá</Text>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  listContent: {
    paddingHorizontal: 4,
  },
  separator: {
    width: 12,
  },
  productCard: {
    width: 160,
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 160,
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
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  discountText: {
    color: "white",
    fontSize: 11,
    fontWeight: "bold",
  },
  productInfo: {
    padding: 10,
  },
  productName: {
    fontSize: 13,
    color: "#111827",
    fontWeight: "500",
    marginBottom: 6,
    lineHeight: 18,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  currentPrice: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#EF4444",
  },
  originalPrice: {
    fontSize: 12,
    color: "#9CA3AF",
    textDecorationLine: "line-through",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 11,
    color: "#6B7280",
  },
  soldText: {
    fontSize: 11,
    color: "#9CA3AF",
  },
});
