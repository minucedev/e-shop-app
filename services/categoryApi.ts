// services/categoryApi.ts

import { apiClient } from "./apiClient";

/**
 * Category interface theo API response
 * Hỗ trợ cấu trúc hierarchical (parent-child)
 */
export interface Category {
  id: number;
  name: string;
  parentCategoryId: number | null;
  parentCategoryName: string | null;
  childCategories: Category[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Lấy danh sách tất cả danh mục (bao gồm cả danh mục con)
 * Endpoint: GET /categories
 */
export const getCategories = async (): Promise<Category[]> => {
  const response = await apiClient.get<Category[]>("/categories");

  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to fetch categories");
  }

  return response.data;
};

/**
 * Lấy danh sách danh mục gốc (không có parent)
 * Endpoint: GET /categories/root
 */
export const getRootCategories = async (): Promise<Category[]> => {
  const response = await apiClient.get<Category[]>("/categories/root");

  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to fetch root categories");
  }

  return response.data;
};

/**
 * Lấy danh mục con của một danh mục cha
 * Endpoint: GET /categories/{parentId}/children
 */
export const getCategoryChildren = async (
  parentId: number
): Promise<Category[]> => {
  const response = await apiClient.get<Category[]>(
    `/categories/${parentId}/children`
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to fetch category children");
  }

  return response.data;
};
