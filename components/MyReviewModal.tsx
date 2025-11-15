import React from "react";
import { View, Text, TouchableOpacity, Modal, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Review } from "@/services/reviewApi";

interface MyReviewModalProps {
  visible: boolean;
  onClose: () => void;
  review: Review | null;
  onEdit: () => void;
  onDelete: () => void;
}

export const MyReviewModal: React.FC<MyReviewModalProps> = ({
  visible,
  onClose,
  review,
  onEdit,
  onDelete,
}) => {
  if (!review) return null;

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Render star rating
  const renderStars = (rating: number) => {
    return (
      <View className="flex-row gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? "star" : "star-outline"}
            size={24}
            color={star <= rating ? "#FFA500" : "#D1D5DB"}
          />
        ))}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl max-h-[85%]">
          {/* Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <Text className="text-xl font-bold text-gray-900">
              Đánh giá của tôi
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView className="p-4">
            {/* User Info */}
            <View className="flex-row items-center gap-3 mb-4">
              <View className="bg-blue-500 w-12 h-12 rounded-full items-center justify-center">
                <Text className="text-white font-bold text-xl">
                  {review.userFullName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View>
                <Text className="font-semibold text-gray-900 text-base">
                  {review.userFullName}
                </Text>
                <Text className="text-sm text-gray-500">
                  {formatDate(review.createdAt)}
                </Text>
              </View>
            </View>

            {/* Rating */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Đánh giá:
              </Text>
              <View className="flex-row items-center gap-3">
                {renderStars(review.rating)}
                <Text className="text-gray-900 font-semibold text-lg">
                  {review.rating}/5
                </Text>
              </View>
            </View>

            {/* Review Content */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Nội dung:
              </Text>
              <View className="bg-gray-50 rounded-lg p-4">
                <Text className="text-gray-900 leading-6 text-base">
                  {review.content}
                </Text>
              </View>
            </View>

            {/* Updated indicator */}
            {review.createdAt !== review.updatedAt && (
              <View className="bg-blue-50 rounded-lg p-3 mb-4">
                <View className="flex-row items-center gap-2">
                  <Ionicons name="time-outline" size={16} color="#3B82F6" />
                  <Text className="text-sm text-blue-700">
                    Đã chỉnh sửa lúc {formatDate(review.updatedAt)}
                  </Text>
                </View>
              </View>
            )}

            {/* Action Buttons */}
            <View className="flex-row gap-3 mt-2">
              <TouchableOpacity
                className="flex-1 bg-blue-600 py-3 rounded-lg flex-row items-center justify-center gap-2"
                onPress={() => {
                  onClose();
                  onEdit();
                }}
              >
                <Ionicons name="pencil" size={20} color="#FFF" />
                <Text className="text-white font-semibold text-base">
                  Chỉnh sửa
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 bg-red-50 py-3 rounded-lg flex-row items-center justify-center gap-2 border border-red-200"
                onPress={() => {
                  onClose();
                  onDelete();
                }}
              >
                <Ionicons name="trash" size={20} color="#EF4444" />
                <Text className="text-red-600 font-semibold text-base">
                  Xóa
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
