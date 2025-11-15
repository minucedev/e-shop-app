// components/ReviewCard.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Review } from "@/services/reviewApi";

interface ReviewCardProps {
  review: Review;
  currentUserId?: number;
  onEdit?: (review: Review) => void;
  onDelete?: (reviewId: number) => void;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  currentUserId,
  onEdit,
  onDelete,
}) => {
  const isMyReview = currentUserId && review.userId === currentUserId;

  return (
    <View className="bg-white rounded-xl p-4 mb-3 border border-gray-200">
      {/* Header */}
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900">
            {review.userFullName}
          </Text>
          <View className="flex-row items-center mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name={star <= review.rating ? "star" : "star-outline"}
                size={14}
                color="#FFA500"
              />
            ))}
            <Text className="text-gray-500 text-xs ml-2">
              {formatDate(review.createdAt)}
            </Text>
          </View>
        </View>

        {/* Edit/Delete buttons - only for current user's review */}
        {isMyReview && (
          <View className="flex-row items-center gap-2">
            {onEdit && (
              <TouchableOpacity onPress={() => onEdit(review)} className="p-2">
                <Ionicons name="create-outline" size={20} color="#3b82f6" />
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity
                onPress={() => onDelete(review.id)}
                className="p-2"
              >
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Review Content */}
      <Text className="text-gray-700 leading-5">{review.content}</Text>

      {/* Updated Badge */}
      {review.updatedAt !== review.createdAt && (
        <Text className="text-gray-400 text-xs mt-2 italic">Đã chỉnh sửa</Text>
      )}
    </View>
  );
};
