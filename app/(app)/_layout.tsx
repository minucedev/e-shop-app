import { Stack, Redirect } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { ActivityIndicator, View } from "react-native";

export default function AppLayout() {
  const { accessToken, isLoading } = useAuth();

  // Hiển thị loading khi đang check auth
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

  // Redirect về login nếu chưa đăng nhập
  if (!accessToken) {
    return <Redirect href="/(auth)/login" />;
  }

  // User đã đăng nhập → hiển thị app screens
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: "#f8f9fa",
        },
        headerTitleStyle: {
          fontWeight: "bold",
          color: "#333",
        },
        headerTintColor: "#333",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Trang chủ",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="home"
        options={{
          title: "Home",
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          title: "Hồ sơ",
        }}
      />
    </Stack>
  );
}
