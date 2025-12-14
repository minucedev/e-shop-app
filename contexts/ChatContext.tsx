// contexts/ChatContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { sendChatMessage, ChatResponse } from "@/services/chatbotApi";
import { getProductsBySpus } from "@/services/productApi";
import type { ProductApiResponse } from "@/services/productApi";

// ============================================
// INTERFACES
// ============================================

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  intent?: "PRODUCT" | "POLICY" | "CHITCHAT" | "product_recommendation";
  products?: ProductApiResponse[];
  src?: string; // Source files cho POLICY intent
}

interface ChatContextType {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  isChatOpen: boolean;
  sendMessage: (question: string) => Promise<void>;
  clearChat: () => Promise<void>;
  retryLastMessage: () => Promise<void>;
  setChatOpen: (open: boolean) => void;
}

// ============================================
// CONTEXT
// ============================================

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const STORAGE_KEY = "@techbox_chat_history";
const MAX_MESSAGES = 100; // Giới hạn lưu tối đa 100 messages
const MAX_HISTORY_FOR_API = 10; // Chỉ gửi 10 messages gần nhất cho API

// ============================================
// PROVIDER
// ============================================

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Load chat history khi mount
  useEffect(() => {
    loadHistory();
  }, []);

  // Auto-save khi messages thay đổi
  useEffect(() => {
    if (messages.length > 0) {
      saveHistory();
    }
  }, [messages]);

  /**
   * Load chat history từ AsyncStorage
   */
  const loadHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setMessages(parsed);
        console.log(
          "💬 [ChatContext] Loaded history:",
          parsed.length,
          "messages"
        );
      }
    } catch (err) {
      console.error("❌ [ChatContext] Failed to load history:", err);
    }
  };

  /**
   * Save chat history to AsyncStorage
   * Giới hạn MAX_MESSAGES để tránh storage overflow
   */
  const saveHistory = async () => {
    try {
      // Chỉ lưu MAX_MESSAGES tin nhắn gần nhất
      const toSave = messages.slice(-MAX_MESSAGES);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      console.log("💾 [ChatContext] Saved history:", toSave.length, "messages");
    } catch (err) {
      console.error("❌ [ChatContext] Failed to save history:", err);
    }
  };

  /**
   * Fetch product details từ SPU list
   */
  const fetchProductDetails = async (
    spus: string[]
  ): Promise<ProductApiResponse[]> => {
    try {
      if (!spus || spus.length === 0) return [];

      console.log("🔍 [ChatContext] Fetching products:", spus);

      const products = await getProductsBySpus(spus);
      console.log("✅ [ChatContext] Fetched", products.length, "products");

      if (products.length > 0) {
        console.log(
          "📦 [ChatContext] Product details:",
          products.map((p) => ({ id: p.id, name: p.name }))
        );
      } else {
        console.warn(
          "⚠️ [ChatContext] No products returned. AI may have returned invalid SPU codes."
        );
      }

      return products;
    } catch (err: any) {
      console.error("❌ [ChatContext] Failed to fetch products:", err);
      return [];
    }
  };

  /**
   * Send message to AI chatbot
   */
  const sendMessage = async (question: string) => {
    if (!question.trim()) {
      console.warn("⚠️ [ChatContext] Empty question, ignoring");
      return;
    }

    // 1. Add user message (optimistic update)
    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: "user",
      content: question.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      // 2. Prepare history for API (only last 10 messages)
      const history = messages.slice(-MAX_HISTORY_FOR_API).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      console.log("🤖 [ChatContext] Sending to AI:", {
        question,
        historyLength: history.length,
      });

      // 3. Call AI API
      const response: ChatResponse = await sendChatMessage(question, history);

      console.log("✅ [ChatContext] AI Response:", {
        intent: response.intent,
        productsCount: response.related_products?.length || 0,
        debugQuery: response.debug_query,
      });

      // 4. Fetch product details if needed
      // Check for both "PRODUCT" and "product_recommendation" intents
      let products: ProductApiResponse[] | undefined;
      const isProductIntent =
        response.intent === "PRODUCT" ||
        response.intent === "product_recommendation";

      if (isProductIntent && response.related_products?.length) {
        products = await fetchProductDetails(response.related_products);
      }

      // 5. Add AI message
      const aiMessage: ChatMessage = {
        id: `ai_${Date.now()}`,
        role: "assistant",
        content: response.answer,
        timestamp: Date.now(),
        intent: response.intent,
        products,
        src: response.src,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      console.error("❌ [ChatContext] Send message error:", err);
      setError(err.message || "Failed to send message");

      // Add error message
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        role: "assistant",
        content: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.",
        timestamp: Date.now(),
        intent: "CHITCHAT",
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Clear all chat history
   */
  const clearChat = async () => {
    try {
      setMessages([]);
      await AsyncStorage.removeItem(STORAGE_KEY);
      console.log("🗑️ [ChatContext] Chat history cleared");
    } catch (err) {
      console.error("❌ [ChatContext] Failed to clear chat:", err);
    }
  };

  /**
   * Retry last user message (nếu có lỗi)
   */
  const retryLastMessage = async () => {
    // Tìm tin nhắn user cuối cùng
    const lastUserMessage = [...messages]
      .reverse()
      .find((m) => m.role === "user");

    if (lastUserMessage) {
      // Xóa messages sau tin nhắn user cuối (bao gồm cả error message)
      const indexOfLastUser = messages.findIndex(
        (m) => m.id === lastUserMessage.id
      );
      setMessages((prev) => prev.slice(0, indexOfLastUser + 1));

      // Gửi lại
      await sendMessage(lastUserMessage.content);
    }
  };

  /**
   * Toggle chat modal visibility
   */
  const setChatOpen = (open: boolean) => {
    setIsChatOpen(open);
  };

  const value: ChatContextType = {
    messages,
    isLoading,
    error,
    isChatOpen,
    sendMessage,
    clearChat,
    retryLastMessage,
    setChatOpen,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

// ============================================
// HOOK
// ============================================

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return context;
};
