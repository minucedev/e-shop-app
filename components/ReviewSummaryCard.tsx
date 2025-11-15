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
  const totalReviews = summary.totalReviews || 0;
  const averageRating = summary.averageRating || 0;

  // Calculate percentage for each rating
  const getRatingPercentage = (count: number) => {
    if (totalReviews === 0) return 0;
    return Math.round((count / totalReviews) * 100);
  };

  const ratingDistribution = [
    { stars: 5, count: summary.rating5Count },
    { stars: 4, count: summary.rating4Count },
    { stars: 3, count: summary.rating3Count },
    { stars: 2, count: summary.rating2Count },
    { stars: 1, count: summary.rating1Count },
  ];

  return (
    <View className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
      {/* Overall Rating */}
      <View className="items-center mb-4 pb-4 border-b border-gray-200">
        <Text className="text-5xl font-bold text-gray-900">
          {averageRating.toFixed(1)}
        </Text>
        <View className="flex-row gap-1 my-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Ionicons
              key={star}
              name={star <= Math.round(averageRating) ? "star" : "star-outline"}
              size={24}
              color={star <= Math.round(averageRating) ? "#FFA500" : "#D1D5DB"}
            />
          ))}
        </View>
        <Text className="text-gray-600">{totalReviews} đánh giá</Text>
      </View>

      {/* Rating Distribution */}
      <View className="gap-2">
        {ratingDistribution.map((rating) => (
          <View key={rating.stars} className="flex-row items-center gap-2">
            {/* Star number */}
            <Text className="text-sm text-gray-600 w-8">
              {rating.stars} <Ionicons name="star" size={12} color="#FFA500" />
            </Text>

            {/* Progress bar */}
            <View className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <View
                className="h-full bg-yellow-500 rounded-full"
                style={{ width: `${getRatingPercentage(rating.count)}%` }}
              />
            </View>

            {/* Count */}
            <Text className="text-sm text-gray-600 w-12 text-right">
              {rating.count}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};
