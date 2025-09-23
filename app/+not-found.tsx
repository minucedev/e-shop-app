import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/colors";
import { fonts } from "@/constants/fonts";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: "Oops! Page Not Found",
          headerShown: false,
        }}
      />

      <View style={styles.container}>
        {/* Error Icon */}
        <View style={styles.iconContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={120}
            color={colors.primary}
          />
        </View>

        {/* Error Text */}
        <View style={styles.textContainer}>
          <Text style={styles.errorCode}>404</Text>
          <Text style={styles.errorTitle}>Page Not Found</Text>
          <Text style={styles.errorDescription}>
            Sorry, the page you are looking for does not exist or has been moved.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {/* Go Home Button */}
          <Link href="/" asChild>
            <TouchableOpacity style={styles.primaryButton}>
              <Ionicons name="home-outline" size={20} color={colors.white} />
              <Text style={styles.primaryButtonText}>Go Home</Text>
            </TouchableOpacity>
          </Link>

          {/* Go Back Button */}
          <Link href="../" asChild>
            <TouchableOpacity style={styles.secondaryButton}>
              <Ionicons
                name="arrow-back-outline"
                size={20}
                color={colors.primary}
              />
              <Text style={styles.secondaryButtonText}>Go Back</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Help Text */}
        <View style={styles.helpContainer}>
          <Text style={styles.helpText}>
            If you think this is a mistake, please contact support.
          </Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  iconContainer: {
    marginBottom: 30,
    opacity: 0.8,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  errorCode: {
    fontSize: 72,
    fontFamily: fonts.Bold,
    color: colors.primary,
    marginBottom: 10,
  },
  errorTitle: {
    fontSize: 28,
    fontFamily: fonts.SemiBold,
    color: colors.primary,
    marginBottom: 15,
    textAlign: "center",
  },
  errorDescription: {
    fontSize: 16,
    fontFamily: fonts.Regular,
    color: colors.secondary,
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 300,
  },
  buttonContainer: {
    width: "100%",
    maxWidth: 300,
    gap: 15,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    gap: 10,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: fonts.SemiBold,
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    paddingHorizontal: 30,
    borderRadius: 25,
    gap: 10,
    backgroundColor: "transparent",
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontFamily: fonts.SemiBold,
  },
  helpContainer: {
    marginTop: 40,
    alignItems: "center",
  },
  helpText: {
    fontSize: 14,
    fontFamily: fonts.Light,
    color: colors.secondary,
    textAlign: "center",
    opacity: 0.7,
  },
});
