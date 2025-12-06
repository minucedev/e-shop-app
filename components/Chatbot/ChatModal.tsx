// components/Chatbot/ChatModal.tsx

import React from "react";
import {
  Modal,
  View,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { useChat } from "@/contexts/ChatContext";

interface ChatModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({ visible, onClose }) => {
  const { messages, isLoading, sendMessage, clearChat } = useChat();

  const handleSend = (message: string) => {
    sendMessage(message);
  };

  const handleClearChat = () => {
    clearChat();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <ChatHeader
            onClose={onClose}
            onClearChat={handleClearChat}
            messageCount={messages.length}
          />

          <View style={styles.messagesContainer}>
            <MessageList messages={messages} isLoading={isLoading} />
          </View>

          <ChatInput onSend={handleSend} disabled={isLoading} />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  keyboardView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
});
