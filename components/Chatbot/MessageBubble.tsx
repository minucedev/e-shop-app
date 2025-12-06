// components/Chatbot/MessageBubble.tsx

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { ChatMessage } from "@/contexts/ChatContext";
import { ProductCarousel } from "./ProductCarousel";

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === "user";

  // Format timestamp
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get intent icon
  const getIntentIcon = () => {
    switch (message.intent) {
      case "PRODUCT":
      case "product_recommendation":
        return "bag-outline";
      case "POLICY":
        return "document-text-outline";
      case "CHITCHAT":
        return "chatbubble-outline";
      default:
        return "chatbubble-outline";
    }
  };

  return (
    <View style={[styles.container, isUser && styles.containerUser]}>
      <View
        style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAI]}
      >
        {/* AI Header */}
        {!isUser && (
          <View style={styles.aiHeader}>
            <Ionicons name={getIntentIcon()} size={14} color="#2563eb" />
            <Text style={styles.aiLabel}>AI Assistant</Text>
          </View>
        )}

        {/* Message Content */}
        <Text style={[styles.text, isUser ? styles.textUser : styles.textAI]}>
          {message.content}
        </Text>

        {/* Policy Source (nếu có) */}
        {!isUser && message.src && (
          <View style={styles.sourceContainer}>
            <Ionicons
              name="information-circle-outline"
              size={12}
              color="#6B7280"
            />
            <Text style={styles.sourceText}>Nguồn: {message.src}</Text>
          </View>
        )}

        {/* Timestamp */}
        <Text style={[styles.timestamp, isUser && styles.timestampUser]}>
          {formatTime(message.timestamp)}
        </Text>
      </View>

      {/* Product Carousel - Hiển thị sản phẩm gợi ý */}
      {!isUser && message.products && message.products.length > 0 && (
        <View style={styles.productsSection}>
          <View style={styles.productsHeader}>
            <Ionicons name="bag-handle-outline" size={16} color="#2563eb" />
            <Text style={styles.productsHeaderText}>
              Gợi ý sản phẩm ({message.products.length})
            </Text>
          </View>
          <ProductCarousel products={message.products} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    paddingHorizontal: 16,
    alignItems: "flex-start",
  },
  containerUser: {
    alignItems: "flex-end",
  },
  bubble: {
    maxWidth: "80%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  bubbleUser: {
    backgroundColor: "#2563eb",
    borderBottomRightRadius: 4,
  },
  bubbleAI: {
    backgroundColor: "white",
    borderBottomLeftRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  aiHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  aiLabel: {
    fontSize: 11,
    color: "#6B7280",
    marginLeft: 4,
    fontWeight: "500",
  },
  text: {
    fontSize: 15,
    lineHeight: 20,
  },
  textUser: {
    color: "white",
  },
  textAI: {
    color: "#111827",
  },
  sourceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  sourceText: {
    fontSize: 11,
    color: "#6B7280",
    marginLeft: 4,
    fontStyle: "italic",
  },
  timestamp: {
    fontSize: 10,
    color: "#9CA3AF",
    marginTop: 4,
    alignSelf: "flex-start",
  },
  timestampUser: {
    color: "rgba(255, 255, 255, 0.7)",
    alignSelf: "flex-end",
  },
  productsSection: {
    marginTop: 12,
    width: "100%",
  },
  productsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  productsHeaderText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2563eb",
    marginLeft: 6,
  },
});
