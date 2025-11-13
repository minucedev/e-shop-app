// services/brandApi.ts

import { apiClient } from "./apiClient";

/**
 * Brand interface theo API response
 */
export interface Brand {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Lấy danh sách tất cả thương hiệu
 * Endpoint: GET /brands
 */
export const getBrands = async (): Promise<Brand[]> => {
  const response = await apiClient.get<Brand[]>("/brands");

  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to fetch brands");
  }

  return response.data;
};

/**
 * Lấy chi tiết một thương hiệu theo ID
 * Endpoint: GET /brands/{id}
 */
export const getBrandById = async (id: number): Promise<Brand> => {
  const response = await apiClient.get<Brand>(`/brands/${id}`);

  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to fetch brand detail");
  }

  return response.data;
};
