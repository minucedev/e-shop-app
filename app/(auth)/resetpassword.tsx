import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { colors } from "@/constants/colors";
import { fonts } from "@/constants/fonts";

const ResetPassword = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async () => {
    setError("");
    setSuccess("");
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Invalid email address");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSuccess("If this email exists, we've sent reset instructions.");
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButtonWrapper}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back-outline" size={25} color="white" />
      </TouchableOpacity>
      <View style={styles.textContainer}>
        <Text style={styles.headingText}>Forgot Password?</Text>
        <Text style={styles.subText}>
          Enter your email to get reset instructions.
        </Text>
      </View>
      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color={colors.secondary} />
          <TextInput
            style={styles.textInput}
            placeholder="Your email"
            placeholderTextColor={colors.secondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading}
          />
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {success ? <Text style={styles.successText}>{success}</Text> : null}
        <TouchableOpacity
          style={[
            styles.resetButtonWrapper,
            isLoading && styles.disabledButton,
          ]}
          onPress={handleReset}
          disabled={isLoading}
        >
          <Text style={styles.resetButtonText}>
            {isLoading ? "Sending..." : "Send"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 20,
    paddingTop: 50,
  },
  backButtonWrapper: {
    height: 40,
    width: 40,
    backgroundColor: colors.primary,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  textContainer: {
    marginVertical: 20,
    alignItems: "center",
  },
  headingText: {
    fontSize: 28,
    color: colors.primary,
    fontFamily: fonts.SemiBold,
    marginBottom: 8,
  },
  subText: {
    fontSize: 15,
    color: colors.secondary,
    fontFamily: fonts.Light,
    textAlign: "center",
  },
  formContainer: {
    marginTop: 20,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 100,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginVertical: 10,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 10,
    fontFamily: fonts.Light,
    fontSize: 16,
  },
  resetButtonWrapper: {
    backgroundColor: colors.primary,
    borderRadius: 100,
    marginTop: 20,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    backgroundColor: colors.secondary,
  },
  resetButtonText: {
    color: colors.white,
    fontSize: 18,
    fontFamily: fonts.SemiBold,
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 12,
    fontFamily: fonts.Light,
    marginTop: 5,
    marginLeft: 20,
  },
  successText: {
    color: colors.primary,
    fontSize: 13,
    fontFamily: fonts.SemiBold,
    marginTop: 10,
    marginLeft: 20,
  },
});

export default ResetPassword;
