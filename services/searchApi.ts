// services/searchApi.ts

import { aiApiClient, AI_API_BASE_URL } from "./apiClient";
import { getProductsBySpus } from "./productApi";

// ============================================
// INTERFACES
// ============================================

export interface SearchResult {
  spu: string;
  score: number;
}

export interface SearchResponse {
  status: "success" | "error";
  data: SearchResult[];
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Tìm kiếm sản phẩm bằng văn bản (Semantic Text Search)
 *
 * @param query - Mô tả sản phẩm cần tìm (VD: "laptop gaming dưới 20 triệu")
 * @param topK - Số lượng kết quả tối đa (mặc định: 20)
 * @returns Mảng SearchResult với SPU và score
 *
 * @example
 * const results = await searchByText("laptop gaming RTX 4060", 10);
 * // [{ spu: "LAP001", score: 0.95 }, { spu: "LAP002", score: 0.89 }]
 */
export const searchByText = async (
  query: string,
  topK: number = 20
): Promise<SearchResult[]> => {
  if (!query || query.trim().length === 0) {
    console.warn("⚠️ [SearchAPI] Empty query");
    return [];
  }

  try {
    console.log("🔍 [SearchAPI] Text search:", { query, topK });

    const response = await aiApiClient.post<SearchResponse>("/search/text", {
      query: query.trim(),
      top_k: topK,
    });

    if (!response.success || !response.data) {
      console.error("❌ [SearchAPI] Text search failed:", response.error);
      return [];
    }

    const results = response.data.data || [];

    console.log("✅ [SearchAPI] Text search results:", {
      count: results.length,
      topResult: results[0],
    });

    return results;
  } catch (error: any) {
    console.error("❌ [SearchAPI] Text search error:", error.message);
    return [];
  }
};

/**
 * Tìm kiếm sản phẩm bằng hình ảnh (Visual Search)
 *
 * @param imageUri - URI của ảnh từ ImagePicker
 * @param topK - Số lượng kết quả tối đa (mặc định: 20)
 * @returns Mảng SearchResult với SPU và score
 *
 * @example
 * const result = await ImagePicker.launchImageLibraryAsync({...});
 * if (!result.canceled) {
 *   const results = await searchByImage(result.assets[0].uri, 10);
 * }
 */
export const searchByImage = async (
  imageUri: string,
  topK: number = 20
): Promise<SearchResult[]> => {
  if (!imageUri) {
    console.warn("⚠️ [SearchAPI] No image URI provided");
    return [];
  }

  try {
    console.log("🖼️ [SearchAPI] Image search:", { imageUri, topK });

    // Create FormData
    const formData = new FormData();

    // Extract filename from URI
    const filename = imageUri.split("/").pop() || "search.jpg";

    // Determine MIME type from extension
    const extension = filename.split(".").pop()?.toLowerCase();
    const mimeType =
      extension === "png"
        ? "image/png"
        : extension === "jpg" || extension === "jpeg"
          ? "image/jpeg"
          : "image/jpeg"; // default

    // Append image file
    formData.append("file", {
      uri: imageUri,
      type: mimeType,
      name: filename,
    } as any);

    formData.append("top_k", topK.toString());

    console.log("📤 [SearchAPI] Uploading image:", {
      filename,
      mimeType,
      topK,
      url: `${AI_API_BASE_URL}/search/image`,
    });

    // Note: Use fetch directly for multipart/form-data upload
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    let response: Response;
    try {
      response = await fetch(`${AI_API_BASE_URL}/search/image`, {
        method: "POST",
        body: formData,
        signal: controller.signal,
        // Don't set Content-Type header - let browser set it with boundary
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ [SearchAPI] Image search failed:", {
          status: response.status,
          error: errorText,
        });
        return [];
      }
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === "AbortError") {
        console.error("❌ [SearchAPI] Image upload timeout after 30s");
      } else {
        console.error("❌ [SearchAPI] Image upload network error:", {
          message: fetchError.message,
          url: `${AI_API_BASE_URL}/search/image`,
        });
      }
      throw fetchError;
    }

    const result: SearchResponse = await response.json();
    const results = result.data || [];

    console.log("✅ [SearchAPI] Image search results:", {
      count: results.length,
      topResult: results[0],
    });

    return results;
  } catch (error: any) {
    console.error("❌ [SearchAPI] Image search error:", error.message);
    return [];
  }
};

/**
 * Tìm kiếm sản phẩm và lấy thông tin chi tiết
 * Kết hợp search API + product API
 *
 * @param query - Text query hoặc image URI
 * @param searchType - "text" hoặc "image"
 * @param topK - Số lượng kết quả
 * @returns Mảng ProductApiResponse
 */
export const searchAndFetchProducts = async (
  query: string,
  searchType: "text" | "image",
  topK: number = 20
) => {
  try {
    // Step 1: Search to get SPUs
    const searchResults =
      searchType === "text"
        ? await searchByText(query, topK)
        : await searchByImage(query, topK);

    if (searchResults.length === 0) {
      console.log("ℹ️ [SearchAPI] No search results found");
      return [];
    }

    // Step 2: Extract SPUs
    const spus = searchResults.map((r) => r.spu);

    console.log("📦 [SearchAPI] Fetching product details for SPUs:", spus);

    // Step 3: Fetch product details
    const products = await getProductsBySpus(spus);

    console.log("✅ [SearchAPI] Fetched products:", products.length);

    return products;
  } catch (error: any) {
    console.error(
      "❌ [SearchAPI] searchAndFetchProducts error:",
      error.message
    );
    return [];
  }
};
