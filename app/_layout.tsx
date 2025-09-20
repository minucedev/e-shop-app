import { useFonts } from "expo-font";
import { Slot } from "expo-router";
import { fonts } from "./utils/fonts";

export default function Layout() {
  const [fontsLoaded] = useFonts({
    [fonts.Bold]: require("./assets/fonts/poppins_bold.ttf"),
    [fonts.Light]: require("./assets/fonts/poppins_light.ttf"),
    [fonts.Medium]: require("./assets/fonts/poppins_medium.ttf"),
    [fonts.Regular]: require("./assets/fonts/poppins_regular.ttf"),
    [fonts.SemiBold]: require("./assets/fonts/poppins_semibold.ttf"),
  });

  if (!fontsLoaded) return null;
  return <Slot />;
}
