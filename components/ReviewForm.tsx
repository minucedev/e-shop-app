// components/ReviewForm.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ReviewFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, content: string) => Promise<void>;
  initialRating?: number;
  initialContent?: string;
  isEdit?: boolean;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  visible,
  onClose,
  onSubmit,
  initialRating = 5,
  initialContent = "",
  isEdit = false,
}) => {
  const [rating, setRating] = useState(initialRating);
  const [content, setContent] = useState(initialContent);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (visible) {
      setRating(initialRating);
      setContent(initialContent);
    }
  }, [visible, initialRating, initialContent]);

  const handleSubmit = async () => {
    if (!content.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập nội dung đánh giá");
      return;
    }

    if (content.trim().length < 10) {
      Alert.alert("Lỗi", "Nội dung đánh giá phải có ít nhất 10 ký tự");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(rating, content.trim());
      setContent("");
      setRating(5);
      onClose();
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Không thể gửi đánh giá");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-gray-900">
              {isEdit ? "Chỉnh sửa đánh giá" : "Viết đánh giá"}
            </Text>
            <TouchableOpacity onPress={onClose} disabled={isSubmitting}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Star Rating */}
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">
              Đánh giá của bạn
            </Text>
            <View className="flex-row items-center justify-center py-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  className="mx-1"
                  disabled={isSubmitting}
                >
                  <Ionicons
                    name={star <= rating ? "star" : "star-outline"}
                    size={40}
                    color="#FFA500"
                  />
                </TouchableOpacity>
              ))}
            </View>
            <Text className="text-center text-gray-600 text-sm">
              {rating === 1 && "Rất không hài lòng"}
              {rating === 2 && "Không hài lòng"}
              {rating === 3 && "Bình thường"}
              {rating === 4 && "Hài lòng"}
              {rating === 5 && "Rất hài lòng"}
            </Text>
          </View>

          {/* Review Content */}
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">
              Nhận xét của bạn
            </Text>
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              className="bg-gray-50 rounded-xl p-4 text-gray-900 border border-gray-200"
              style={{ minHeight: 120 }}
              editable={!isSubmitting}
            />
            <Text className="text-gray-500 text-xs mt-1">
              Tối thiểu 10 ký tự
            </Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting || !content.trim()}
            className={`py-4 rounded-xl ${
              isSubmitting || !content.trim() ? "bg-gray-300" : "bg-blue-600"
            }`}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-bold text-base">
                {isEdit ? "Cập nhật đánh giá" : "Gửi đánh giá"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
