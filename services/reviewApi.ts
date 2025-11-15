// services/reviewApi.ts
import { apiClient } from "./apiClient";

export interface Review {
  id: number;
  productId: number;
  userId: number;
  userFullName: string;
  rating: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewsResponse {
  content: Review[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface ReviewSummary {
  productId: number;
  totalReviews: number;
  averageRating: number;
  rating1Count: number;
  rating2Count: number;
  rating3Count: number;
  rating4Count: number;
  rating5Count: number;
}

export interface CreateReviewRequest {
  rating: number;
  content: string;
}

export interface UpdateReviewRequest {
  rating: number;
  content: string;
}

/**
 * Get paginated reviews for a product
 */
export const getProductReviews = async (
  productId: number,
  page: number = 0,
  size: number = 20
): Promise<ReviewsResponse> => {
  const response = await apiClient.get<ReviewsResponse>(
    `/products/${productId}/reviews?page=${page}&size=${size}`
  );
  return response.data!;
};

/**
 * Get current user's review for a product
 */
export const getMyReview = async (productId: number): Promise<Review> => {
  const response = await apiClient.get<Review>(
    `/products/${productId}/reviews/me`
  );
  return response.data!;
};

/**
 * Get review summary for a product
 */
export const getReviewSummary = async (
  productId: number
): Promise<ReviewSummary> => {
  const response = await apiClient.get<ReviewSummary>(
    `/products/${productId}/reviews/summary`
  );
  return response.data!;
};

/**
 * Create a new review for a product
 */
export const createReview = async (
  productId: number,
  data: CreateReviewRequest
): Promise<Review> => {
  const response = await apiClient.post<Review>(
    `/products/${productId}/reviews`,
    data
  );
  return response.data!;
};

/**
 * Update an existing review
 */
export const updateReview = async (
  productId: number,
  reviewId: number,
  data: UpdateReviewRequest
): Promise<Review> => {
  const response = await apiClient.put<Review>(
    `/products/${productId}/reviews/${reviewId}`,
    data
  );
  return response.data!;
};

/**
 * Delete a review
 */
export const deleteReview = async (
  productId: number,
  reviewId: number
): Promise<void> => {
  await apiClient.delete(`/products/${productId}/reviews/${reviewId}`);
};
