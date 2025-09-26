import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { fonts } from "@/constants/fonts";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    [fonts.Bold]: require("@/assets/fonts/poppins_bold.ttf"),
    [fonts.Light]: require("@/assets/fonts/poppins_light.ttf"),
    [fonts.Medium]: require("@/assets/fonts/poppins_medium.ttf"),
    [fonts.Regular]: require("@/assets/fonts/poppins_regular.ttf"),
    [fonts.SemiBold]: require("@/assets/fonts/poppins_semibold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <AuthProvider>
      <AuthGate>
        <Stack screenOptions={{ headerShown: false }}>
          {/* Initial routing screen */}
          <Stack.Screen name="index" options={{ headerShown: false }} />

          {/* Welcome screen (root) */}
          <Stack.Screen name="welcome" options={{ headerShown: false }} />

          {/* Auth screens group */}
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />

          {/* Main app screens group */}
          <Stack.Screen name="(app)" options={{ headerShown: false }} />

          {/* Global screens */}
          <Stack.Screen name="+not-found" />
        </Stack>
      </AuthGate>
    </AuthProvider>
  );
}
