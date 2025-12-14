// services/chatbotApi.ts

import { aiApiClient } from "./apiClient";

// ============================================
// INTERFACES
// ============================================

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  question: string;
  history: ChatMessage[];
}

export interface ChatResponse {
  answer: string;
  intent: "PRODUCT" | "POLICY" | "CHITCHAT" | "product_recommendation"; // Intent types từ AI
  related_products?: string[]; // SPU codes (chỉ có khi intent = PRODUCT hoặc product_recommendation)
  src?: string; // Source files (khi intent = POLICY)
  debug_query?: string; // Debug query from AI (optional)
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Gửi tin nhắn đến AI Chatbot
 * Endpoint: POST /chat
 *
 * @param question - Câu hỏi của user
 * @param history - Lịch sử 10 tin nhắn gần nhất
 * @returns ChatResponse với answer và related_products
 *
 * @example
 * // Câu hỏi đầu tiên
 * const response = await sendChatMessage("Tôi muốn mua laptop gaming", []);
 *
 * // Câu hỏi tiếp theo với history
 * const response2 = await sendChatMessage("Con nào giá rẻ nhất?", [
 *   { role: "user", content: "Tôi muốn mua laptop gaming" },
 *   { role: "assistant", content: "Chào bạn! Bên mình có..." }
 * ]);
 */
export const sendChatMessage = async (
  question: string,
  history: ChatMessage[] = []
): Promise<ChatResponse> => {
  // Giới hạn history để tránh token overflow (max 10 messages)
  const limitedHistory = history.slice(-10);

  console.log("🤖 [ChatbotAPI] Sending message:", {
    question,
    historyLength: limitedHistory.length,
  });

  const response = await aiApiClient.post<ChatResponse>("/chat", {
    question,
    history: limitedHistory,
  });

  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to send chat message");
  }

  console.log("✅ [ChatbotAPI] Response:", {
    intent: response.data.intent,
    productsCount: response.data.related_products?.length || 0,
    hasSrc: !!response.data.src,
    debugQuery: response.data.debug_query,
  });

  return response.data;
};

/**
 * Gửi tin nhắn với retry logic
 * Tự động retry 2 lần nếu thất bại
 */
export const sendChatMessageWithRetry = async (
  question: string,
  history: ChatMessage[] = [],
  maxRetries: number = 2
): Promise<ChatResponse> => {
  let lastError: Error | null = null;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await sendChatMessage(question, history);
    } catch (error: any) {
      lastError = error;
      console.warn(
        `⚠️ [ChatbotAPI] Retry ${i + 1}/${maxRetries}:`,
        error.message
      );

      if (i < maxRetries) {
        // Wait 1 second before retry
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  throw lastError || new Error("Failed to send message after retries");
};

// ============================================
// SEARCH & RECOMMENDATION APIs
// ============================================

export interface SearchResult {
  spu: string;
  full_text?: string;
  score: number;
}

export interface SearchTextResponse {
  status: string;
  data: SearchResult[];
}

export interface RecommendResult {
  spu: string;
  score: number;
}

export interface RecommendResponse {
  data: RecommendResult[];
}

/**
 * Tìm kiếm sản phẩm bằng văn bản (Semantic Search)
 * Endpoint: POST /search/text
 *
 * @param query - Câu truy vấn tìm kiếm (VD: "Laptop gaming giá rẻ RTX 4060")
 * @param topK - Số lượng kết quả trả về (mặc định 10)
 * @returns Danh sách SPU với điểm tương đồng
 *
 * @example
 * const results = await searchByText("laptop mỏng nhẹ cho sinh viên", 10);
 * // → [{ spu: "PRD-XXX", score: 0.85 }, ...]
 */
export const searchByText = async (
  query: string,
  topK: number = 10
): Promise<SearchResult[]> => {
  console.log("🔍 [SearchAPI] Text search:", { query, topK });

  const response = await aiApiClient.post<SearchTextResponse>("/search/text", {
    query,
    top_k: topK,
  });

  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to search by text");
  }

  console.log("✅ [SearchAPI] Found:", response.data.data.length, "products");
  return response.data.data;
};

/**
 * Tìm kiếm sản phẩm bằng hình ảnh
 * Endpoint: POST /search/image
 *
 * @param imageUri - URI của ảnh trên thiết bị
 * @param topK - Số lượng kết quả trả về
 * @returns Danh sách SPU tương tự
 *
 * Note: API Client cần hỗ trợ multipart/form-data upload
 * Tạm thời disable function này, cần implement uploadFile method
 */
export const searchByImage = async (
  imageUri: string,
  topK: number = 10
): Promise<SearchResult[]> => {
  console.log("🖼️ [SearchAPI] Image search:", { imageUri, topK });

  // TODO: Implement FormData upload
  // Cần thêm method uploadFile() vào ApiClient class

  throw new Error(
    "Image search not implemented yet. Need to add uploadFile method to ApiClient."
  );

  /* Implementation sẽ như này:
  const formData = new FormData();
  formData.append("file", {
    uri: imageUri,
    type: "image/jpeg",
    name: "search_image.jpg",
  } as any);

  const response = await aiApiClient.uploadFile<SearchResult[]>(
    `/search/image?top_k=${topK}`,
    formData
  );

  return response.data || [];
  */
};

/**
 * Gợi ý sản phẩm cá nhân hóa dựa trên lịch sử
 * Endpoint: POST /recommend
 *
 * @param spus - Danh sách SPU đã xem/mua (tối đa ~10 SPUs)
 * @param topK - Số lượng sản phẩm gợi ý (mặc định 5)
 * @returns Danh sách SPU được gợi ý với điểm số
 *
 * @example
 * // User vừa xem 2 sản phẩm laptop
 * const recommendations = await getRecommendations(
 *   ["PRD-CE1BB567", "PRD-51AC82E0"],
 *   5
 * );
 * // → [{ spu: "PRD-4B7C996E", score: 0.89 }, ...]
 */
export const getRecommendations = async (
  spus: string[],
  topK: number = 5
): Promise<RecommendResult[]> => {
  if (!spus || spus.length === 0) {
    console.warn("⚠️ [RecommendAPI] Empty SPU list, returning empty array");
    return [];
  }

  console.log("💡 [RecommendAPI] Getting recommendations:", {
    spuCount: spus.length,
    topK,
  });

  const response = await aiApiClient.post<RecommendResponse>("/recommend", {
    spus,
    top_k: topK,
  });

  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to get recommendations");
  }

  console.log(
    "✅ [RecommendAPI] Recommended:",
    response.data.data.length,
    "products"
  );
  return response.data.data;
};
