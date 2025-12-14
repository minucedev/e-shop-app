// components/Search/ImageSearchModal.tsx

import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { searchByImage } from "@/services/searchApi";
import { getProductsBySpus } from "@/services/productApi";

interface ImageSearchModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ImageSearchModal: React.FC<ImageSearchModalProps> = ({
  visible,
  onClose,
}) => {
  const router = useRouter();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageInfo, setImageInfo] = useState<{
    fileName: string;
    fileSize: number;
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Request permissions on mount
  React.useEffect(() => {
    (async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        console.warn("⚠️ Media library permission not granted");
      }
    })();
  }, []);

  const pickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        setImageUri(asset.uri);
        setImageInfo({
          fileName: asset.uri.split("/").pop() || "image.jpg",
          fileSize: asset.fileSize || 0,
        });
        console.log("🖼️ [ImageSearch] Image selected:", asset.uri);
      }
    } catch (error: any) {
      console.error("❌ [ImageSearch] Error picking image:", error);
      Alert.alert("Lỗi", "Không thể chọn ảnh. Vui lòng thử lại.");
    }
  };

  const pickFromCamera = async () => {
    try {
      // Request camera permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Cần quyền truy cập",
          "Vui lòng cấp quyền truy cập camera để chụp ảnh."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        setImageUri(asset.uri);
        setImageInfo({
          fileName: `photo_${Date.now()}.jpg`,
          fileSize: asset.fileSize || 0,
        });
        console.log("📸 [ImageSearch] Photo taken:", asset.uri);
      }
    } catch (error: any) {
      console.error("❌ [ImageSearch] Error taking photo:", error);
      Alert.alert("Lỗi", "Không thể chụp ảnh. Vui lòng thử lại.");
    }
  };

  const handleSearch = async () => {
    if (!imageUri) {
      Alert.alert("Chưa chọn ảnh", "Vui lòng chọn ảnh để tìm kiếm.");
      return;
    }

    setIsSearching(true);

    try {
      console.log("🔍 [ImageSearch] Starting search...");

      // Step 1: Search by image to get SPUs
      const searchResults = await searchByImage(imageUri, 20);

      if (searchResults.length === 0) {
        Alert.alert(
          "Không tìm thấy",
          "Không tìm thấy sản phẩm tương tự. Vui lòng thử ảnh khác."
        );
        setIsSearching(false);
        return;
      }

      console.log("✅ [ImageSearch] Found results:", searchResults.length);

      // Step 2: Get SPUs
      const spus = searchResults.map((r) => r.spu);

      // Step 3: Fetch product details
      const products = await getProductsBySpus(spus);

      if (products.length === 0) {
        Alert.alert(
          "Không tìm thấy",
          "Không thể tải thông tin sản phẩm. Vui lòng thử lại."
        );
        setIsSearching(false);
        return;
      }

      console.log("✅ [ImageSearch] Fetched products:", products.length);

      // Close modal
      onClose();

      // Reset state
      setImageUri(null);
      setIsSearching(false);

      // Navigate to search results screen
      // Pass SPUs as comma-separated string
      const spuString = spus.join(",");
      router.push(
        `/(app)/(screens)/search-results?search_type=image&spus=${spuString}`
      );
    } catch (error: any) {
      console.error("❌ [ImageSearch] Search error:", error);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại.");
      setIsSearching(false);
    }
  };

  const handleClear = () => {
    setImageUri(null);
    setImageInfo(null);
  };

  const handleClose = () => {
    setImageUri(null);
    setImageInfo(null);
    setIsSearching(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tìm kiếm bằng hình ảnh</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
        >
          {/* Instructions */}
          <View style={styles.instructionsCard}>
            <Ionicons name="information-circle" size={24} color="#3B82F6" />
            <Text style={styles.instructionsText}>
              Chụp hoặc tải lên hình ảnh sản phẩm để tìm các sản phẩm tương tự
            </Text>
          </View>

          {/* Image Preview or Picker */}
          {imageUri ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
              <TouchableOpacity
                style={styles.clearImageButton}
                onPress={handleClear}
              >
                <Ionicons name="close-circle" size={32} color="#EF4444" />
              </TouchableOpacity>

              {/* Image Info */}
              {imageInfo && (
                <View style={styles.imageInfoCard}>
                  <View style={styles.imageInfoRow}>
                    <Ionicons name="document-text" size={16} color="#6B7280" />
                    <Text style={styles.imageInfoText} numberOfLines={1}>
                      {imageInfo.fileName}
                    </Text>
                  </View>
                  <View style={styles.imageInfoRow}>
                    <Ionicons name="resize" size={16} color="#6B7280" />
                    <Text style={styles.imageInfoText}>
                      {imageInfo.fileSize > 0
                        ? `${(imageInfo.fileSize / 1024).toFixed(0)} KB`
                        : "N/A"}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.pickerContainer}>
              <View style={styles.pickerPlaceholder}>
                <Ionicons name="image-outline" size={64} color="#9CA3AF" />
                <Text style={styles.pickerPlaceholderText}>
                  Chưa chọn hình ảnh
                </Text>
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={pickFromGallery}
              disabled={isSearching}
            >
              <Ionicons name="images" size={24} color="#3B82F6" />
              <Text style={styles.actionButtonText}>Chọn từ thư viện</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={pickFromCamera}
              disabled={isSearching}
            >
              <Ionicons name="camera" size={24} color="#3B82F6" />
              <Text style={styles.actionButtonText}>Chụp ảnh</Text>
            </TouchableOpacity>
          </View>

          {/* Search Button */}
          <TouchableOpacity
            style={[
              styles.searchButton,
              (!imageUri || isSearching) && styles.searchButtonDisabled,
            ]}
            onPress={handleSearch}
            disabled={!imageUri || isSearching}
          >
            {isSearching ? (
              <>
                <ActivityIndicator color="white" size="small" />
                <Text style={styles.searchButtonText}>Đang tìm kiếm...</Text>
              </>
            ) : (
              <>
                <Ionicons name="search" size={20} color="white" />
                <Text style={styles.searchButtonText}>Tìm kiếm</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Tips */}
          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>💡 Mẹo để tìm kiếm tốt hơn:</Text>
            <Text style={styles.tipText}>
              • Sử dụng ảnh có nền sáng, rõ ràng
            </Text>
            <Text style={styles.tipText}>• Sản phẩm nên ở chính giữa ảnh</Text>
            <Text style={styles.tipText}>• Tránh ảnh bị mờ hoặc tối</Text>
            <Text style={styles.tipText}>
              • Ảnh nên chỉ chứa một sản phẩm chính
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

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
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  placeholder: {
    width: 36,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  instructionsCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  instructionsText: {
    flex: 1,
    fontSize: 14,
    color: "#1E40AF",
    lineHeight: 20,
  },
  imagePreviewContainer: {
    position: "relative",
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
  },
  imagePreview: {
    width: "100%",
    height: "100%",
  },
  clearImageButton: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "white",
    borderRadius: 16,
  },
  imageInfoCard: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  imageInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  imageInfoText: {
    flex: 1,
    fontSize: 13,
    color: "#374151",
    fontWeight: "500",
  },
  pickerContainer: {
    width: "100%",
    aspectRatio: 1,
    marginBottom: 24,
  },
  pickerPlaceholder: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  pickerPlaceholderText: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "white",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#3B82F6",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3B82F6",
  },
  searchButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#3B82F6",
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  searchButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
  },
  tipsCard: {
    backgroundColor: "#FFFBEB",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FEF3C7",
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#92400E",
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: "#78350F",
    marginBottom: 6,
    lineHeight: 20,
  },
});
