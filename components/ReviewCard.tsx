import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Review } from "@/services/reviewApi";

interface ReviewCardProps {
  review: Review;
  isOwnReview?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  isOwnReview = false,
  onEdit,
  onDelete,
}) => {
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
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
            size={16}
            color={star <= rating ? "#FFA500" : "#D1D5DB"}
          />
        ))}
      </View>
    );
  };

  return (
    <View className="bg-white p-4 rounded-lg border border-gray-200 mb-3">
      {/* Header: User + Rating */}
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-2">
          <View className="bg-blue-500 w-10 h-10 rounded-full items-center justify-center">
            <Text className="text-white font-bold text-lg">
              {review.userFullName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text className="font-semibold text-gray-900">
              {review.userFullName}
            </Text>
            <Text className="text-xs text-gray-500">
              {formatDate(review.createdAt)}
            </Text>
          </View>
        </View>

        {/* Action buttons for own review */}
        {isOwnReview && (
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={onEdit}
              className="p-2 bg-blue-50 rounded-lg"
            >
              <Ionicons name="pencil" size={16} color="#3B82F6" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onDelete}
              className="p-2 bg-red-50 rounded-lg"
            >
              <Ionicons name="trash" size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Rating stars */}
      <View className="mb-2">{renderStars(review.rating)}</View>

      {/* Review content */}
      <Text className="text-gray-700 leading-5">{review.content}</Text>

      {/* Updated indicator */}
      {review.createdAt !== review.updatedAt && (
        <Text className="text-xs text-gray-400 mt-2">
          Đã chỉnh sửa • {formatDate(review.updatedAt)}
        </Text>
      )}
    </View>
  );
};
