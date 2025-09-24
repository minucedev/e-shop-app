import { Stack, Redirect } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { ActivityIndicator, View } from "react-native";

export default function AppLayout() {
  const { accessToken, isLoading } = useAuth();

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

  // Ẩn header cho toàn bộ stack
  return <Stack screenOptions={{ headerShown: false }} />;
}
