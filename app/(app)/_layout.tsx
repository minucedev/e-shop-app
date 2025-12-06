import { Stack, Redirect } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { ActivityIndicator, View } from "react-native";
import { ChatButton } from "@/components/Chatbot/ChatButton";
import { ChatModal } from "@/components/Chatbot/ChatModal";
import { useChat } from "@/contexts/ChatContext";

export default function AppLayout() {
  const { accessToken, isLoading } = useAuth();
  const { isChatOpen, setChatOpen, messages } = useChat();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!accessToken) {
    return <Redirect href="/(auth)/login" />;
  }

  // Count unread messages (only assistant messages without "read" flag)
  const unreadCount = messages.filter(
    (m) => m.role === "assistant" && !m.timestamp
  ).length;

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />

      <ChatButton
        onPress={() => setChatOpen(true)}
        unreadCount={unreadCount > 0 ? unreadCount : undefined}
      />

      <ChatModal visible={isChatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
}
