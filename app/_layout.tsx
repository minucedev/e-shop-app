import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { fonts } from "@/constants/fonts"; // import mapping fonts

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

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

  return <Stack screenOptions={{ headerShown: false }} />;
}
