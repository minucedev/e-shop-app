import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import { colors } from "../constants/colors";
import { fonts } from "../constants/fonts";
import { useRouter } from "expo-router";
import "./global.css";

export default function Index() {
  //Điều hướng
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/logo.png")}
        style={styles.logo}
      />
      <Image
        source={require("../assets/images/man.png")}
        style={styles.bannerImage}
      />
      <Text style={styles.title}>Innovate Your Life.</Text>
      <Text style={styles.subTitle}>Tech for everyone, every day.</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.loginButtonWrapper,
            { backgroundColor: colors.primary },
          ]}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.loginButtonWrapper]}
          onPress={() => router.push("/signup")}
      
        >
          <Text style={styles.signupButtonText}>Sign-up</Text>
        </TouchableOpacity>
      </View>
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
    fontSize: 40,
    fontFamily: fonts.SemiBold,
    paddingHorizontal: 20,
    textAlign: "center",
    color: colors.primary,
    marginTop: 40,
  },
  subTitle: {
    fontSize: 18,
    fontFamily: fonts.Bold,
    paddingHorizontal: 20,
    textAlign: "center",
    color: colors.secondary,
    marginVertical: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 20,
    borderWidth: 2,
    borderColor: colors.primary,
    width: "80%",
    height: 60,
    borderRadius: 100,
  },
  loginButtonWrapper: {
    justifyContent: "center",
    alignItems: "center",
    width: "50%",
    borderRadius: 98,
  },
  loginButtonText: {
    color: colors.white,
    fontSize: 18,
    fontFamily: fonts.SemiBold,
  },
  signupButtonText: {
    fontSize: 18,
    fontFamily: fonts.SemiBold,
  },
});
