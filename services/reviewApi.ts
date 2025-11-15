import { apiClient, ApiResponse } from "./apiClient";

/**
 * Review data structure
 */
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

/**
 * Review summary with rating distribution
 */
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

/**
 * Page info for pagination
 */
export interface PageInfo {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

/**
 * Reviews list response with pagination
 */
export interface ReviewsResponse {
  content: Review[];
  page: PageInfo;
}

/**
 * Create review request
 */
export interface CreateReviewRequest {
  rating: number;
  content: string;
}

/**
 * Update review request
 */
export interface UpdateReviewRequest {
  rating: number;
  content: string;
}

/**
 * Create a new review for a product
 * @param productId - Product ID
 * @param data - Review data (rating and content)
 * @returns Created review
 */
export const createReview = async (
  productId: number,
  data: CreateReviewRequest
): Promise<Review> => {
  const response = await apiClient.post<Review>(
    `/products/${productId}/reviews`,
    data
  );

  if (!response.data) {
    throw new Error("Failed to create review");
  }

  return response.data;
};

/**
 * Update an existing review
 * @param productId - Product ID
 * @param reviewId - Review ID
 * @param data - Updated review data
 * @returns Updated review
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

  if (!response.data) {
    throw new Error("Failed to update review");
  }

  return response.data;
};

/**
 * Delete a review
 * @param productId - Product ID
 * @param reviewId - Review ID
 */
export const deleteReview = async (
  productId: number,
  reviewId: number
): Promise<void> => {
  await apiClient.delete(`/products/${productId}/reviews/${reviewId}`);
};

/**
 * Get current user's review for a product
 * @param productId - Product ID
 * @returns User's review or null if not reviewed yet
 */
export const getMyReview = async (
  productId: number
): Promise<Review | null> => {
  try {
    const response = await apiClient.get<Review>(
      `/products/${productId}/reviews/me`
    );

    return response.data || null;
  } catch (error: any) {
    // If 404 or error message indicates no review, return null
    if (
      error.response?.status === 404 ||
      error.response?.status === 400 ||
      error.message?.includes("haven't reviewed") ||
      error.response?.data?.message?.includes("haven't reviewed")
    ) {
      return null;
    }
    // For other errors, log but don't throw (fail gracefully)
    console.log("Error fetching user review:", error.message);
    return null;
  }
};

/**
 * Get review summary for a product (rating distribution)
 * @param productId - Product ID
 * @returns Review summary with rating counts
 */
export const getReviewSummary = async (
  productId: number
): Promise<ReviewSummary> => {
  const response = await apiClient.get<ReviewSummary>(
    `/products/${productId}/reviews/summary`
  );

  if (!response.data) {
    // Return empty summary if no data
    return {
      productId,
      totalReviews: 0,
      averageRating: 0,
      rating1Count: 0,
      rating2Count: 0,
      rating3Count: 0,
      rating4Count: 0,
      rating5Count: 0,
    };
  }

  return response.data;
};

/**
 * Get paginated list of reviews for a product
 * @param productId - Product ID
 * @param page - Page number (default: 0)
 * @param size - Page size (default: 5)
 * @returns Paginated reviews response
 */
export const getReviews = async (
  productId: number,
  page: number = 0,
  size: number = 5
): Promise<ReviewsResponse> => {
  const response = await apiClient.get<ReviewsResponse>(
    `/products/${productId}/reviews?page=${page}&size=${size}`
  );

  if (!response.data) {
    // Return empty response if no data
    return {
      content: [],
      page: {
        size,
        number: page,
        totalElements: 0,
        totalPages: 0,
      },
    };
  }

  return response.data;
};
