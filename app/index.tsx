import { StyleSheet, Text, View, Image } from "react-native";
import "./global.css";
import { colors } from "./utils/colors";
import { fonts } from "./utils/fonts";
import { useFonts } from "expo-font";

export default function Index() {
  return (
    <View style={styles.container}>
      <Image source={require("./assets/images/logo.png")} style={styles.logo} />
      <Image
        source={require("./assets/images/man.png")}
        style={styles.bannerImage}
      />
      <Text style={styles.title}>Explore the Future of Technology</Text>
      <Text style={styles.subTitle}>
        Discover, learn, and experience the latest tech trends with us. Unlock
        your potential today!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: "center",
  },
  logo: {
    height: 60,
    width: 140,
    marginVertical: 50,
  },
  bannerImage: {
    height: 250,
    width: 231,
  },
  title: {
    fontSize: 36,
    fontFamily: fonts.SemiBold,
    paddingHorizontal: 20,
    textAlign: "center",
    color: colors.primary,
    marginTop: 40,
  },
  subTitle: {
    fontSize: 20,
    fontFamily: fonts.Medium,
    textAlign: "center",
    color: colors.secondary,
  },
});
