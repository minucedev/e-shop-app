import React, { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function InitialScreen() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    // Khi đã biết trạng thái auth, điều hướng bằng router.replace
    if (user) {
      router.replace("/(app)/home"); // thay đổi sang app group
    } else {
      router.replace("/welcome"); // welcome ở root
    }
  }, [user, isLoading, router]);

  // Hiển thị loading trong khi chờ
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
