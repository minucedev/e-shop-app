import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Review } from "@/services/reviewApi";

interface ReviewFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, content: string) => Promise<void>;
  initialReview?: Review | null;
  mode: "create" | "edit";
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  visible,
  onClose,
  onSubmit,
  initialReview,
  mode,
}) => {
  const [rating, setRating] = useState(initialReview?.rating || 5);
  const [content, setContent] = useState(initialReview?.content || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (visible) {
      setRating(initialReview?.rating || 5);
      setContent(initialReview?.content || "");
    }
  }, [visible, initialReview]);

  const handleSubmit = async () => {
    // Validation
    const trimmedContent = content.trim();
    if (trimmedContent.length === 0) {
      Alert.alert("Lỗi", "Vui lòng nhập nội dung đánh giá");
      return;
    }

    if (trimmedContent.length > 500) {
      Alert.alert("Lỗi", "Nội dung đánh giá không được quá 500 ký tự");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(rating, trimmedContent);
      onClose();
      // Reset form
      setRating(5);
      setContent("");
    } catch (error) {
      // Error handled by parent
      console.log("Review submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValidContent = content.trim().length > 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl max-h-[80%]">
            {/* Header */}
            <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
              <Text className="text-xl font-bold text-gray-900">
                {mode === "create" ? "Viết đánh giá" : "Chỉnh sửa đánh giá"}
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView className="p-4">
              {/* Rating Selection */}
              <Text className="text-base font-semibold text-gray-900 mb-3">
                Đánh giá của bạn
              </Text>
              <View className="flex-row justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setRating(star)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={star <= rating ? "star" : "star-outline"}
                      size={40}
                      color={star <= rating ? "#FFA500" : "#D1D5DB"}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Rating Description */}
              <Text className="text-center text-gray-600 mb-6">
                {rating === 5 && "⭐ Xuất sắc"}
                {rating === 4 && "👍 Tốt"}
                {rating === 3 && "😊 Trung bình"}
                {rating === 2 && "😐 Tạm được"}
                {rating === 1 && "😞 Không tốt"}
              </Text>

              {/* Review Content */}
              <Text className="text-base font-semibold text-gray-900 mb-3">
                Nội dung đánh giá
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-300 rounded-lg p-3 min-h-[120px] text-gray-900"
                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                value={content}
                onChangeText={setContent}
                maxLength={500}
              />
              <Text className="text-right text-sm text-gray-500 mt-1">
                {content.length}/500
              </Text>

              {/* Submit Button */}
              <TouchableOpacity
                className={`mt-6 py-4 rounded-lg ${
                  isSubmitting || !isValidContent
                    ? "bg-gray-300"
                    : "bg-blue-600"
                }`}
                onPress={handleSubmit}
                disabled={isSubmitting || !isValidContent}
                activeOpacity={0.7}
              >
                <Text className="text-white text-center font-semibold text-base">
                  {isSubmitting
                    ? "Đang gửi..."
                    : mode === "create"
                      ? "Gửi đánh giá"
                      : "Cập nhật đánh giá"}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
