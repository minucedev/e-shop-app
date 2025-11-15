// components/ReviewSummaryCard.tsx
import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ReviewSummary } from "@/services/reviewApi";

interface ReviewSummaryCardProps {
  summary: ReviewSummary;
}

export const ReviewSummaryCard: React.FC<ReviewSummaryCardProps> = ({
  summary,
}) => {
  const renderStarBar = (rating: number, count: number) => {
    const percentage =
      summary.totalReviews > 0 ? (count / summary.totalReviews) * 100 : 0;

    return (
      <View className="flex-row items-center mb-2">
        <Text className="text-gray-700 w-12 text-sm">{rating} sao</Text>
        <View className="flex-1 mx-2 bg-gray-200 rounded-full h-2">
          <View
            className="bg-yellow-400 h-2 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </View>
        <Text className="text-gray-600 w-8 text-sm text-right">{count}</Text>
      </View>
    );
  };

  return (
    <View className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
      <Text className="text-lg font-bold text-gray-900 mb-3">
        Đánh giá sản phẩm
      </Text>

      {/* Average Rating */}
      <View className="flex-row items-center mb-4 pb-4 border-b border-gray-200">
        <View className="items-center mr-6">
          <Text className="text-4xl font-bold text-gray-900">
            {summary.averageRating.toFixed(1)}
          </Text>
          <View className="flex-row items-center mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name={
                  star <= Math.round(summary.averageRating)
                    ? "star"
                    : "star-outline"
                }
                size={16}
                color="#FFA500"
              />
            ))}
          </View>
          <Text className="text-gray-500 text-xs mt-1">
            {summary.totalReviews} đánh giá
          </Text>
        </View>

        {/* Rating Distribution */}
        <View className="flex-1">
          {renderStarBar(5, summary.rating5Count)}
          {renderStarBar(4, summary.rating4Count)}
          {renderStarBar(3, summary.rating3Count)}
          {renderStarBar(2, summary.rating2Count)}
          {renderStarBar(1, summary.rating1Count)}
        </View>
      </View>
    </View>
  );
};
