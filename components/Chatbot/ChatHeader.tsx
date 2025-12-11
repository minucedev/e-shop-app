// components/Chatbot/ChatHeader.tsx

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ChatHeaderProps {
  onClose: () => void;
  onClearChat: () => void;
  messageCount: number;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  onClose,
  onClearChat,
  messageCount,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <View style={styles.iconContainer}>
          <Ionicons name="sparkles" size={24} color="#2563eb" />
        </View>
        <View>
          <Text style={styles.title}>AI Assistant</Text>
          <Text style={styles.subtitle}>
            {messageCount > 0
              ? `${messageCount} tin nhắn`
              : "Hỏi gì cũng được!"}
          </Text>
        </View>
      </View>

      <View style={styles.rightSection}>
        {messageCount > 0 && (
          <TouchableOpacity
            onPress={onClearChat}
            style={styles.iconButton}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={22} color="#6B7280" />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={onClose}
          style={styles.iconButton}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  subtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
});
