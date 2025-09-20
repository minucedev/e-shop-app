import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { colors } from "../constants/colors";
import { fonts } from "@/constants/fonts";

const login = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const validateInputs = () => {
    const newErrors = { email: "", password: "" };
    let isValid = true;

    // Validate email
    if (!email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
      isValid = false;
    }

    // Validate password
    if (!password.trim()) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = () => {
    if (validateInputs()) {
      console.log("Login success with:", email, password);
      // Thêm logic đăng nhập thành công ở đây
    } else {
      console.log("Validation failed");
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButtonWrapper}
        onPress={() => {
          console.log("Back button pressed!");
          router.back();
        }}
      >
        <Ionicons name="arrow-back-outline" size={25} color="white" />
      </TouchableOpacity>

      <View style={styles.textContainer}>
        <Text style={styles.headingText}>Hey,</Text>
        <Text style={styles.headingText}>WELCOME</Text>
        <Text style={styles.headingText}>BACK</Text>
      </View>

      {/* Email và Password Input */}
      <View style={styles.formContainer}>
        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color={colors.secondary} />
          <TextInput
            style={styles.textInput}
            placeholder="Enter your email"
            placeholderTextColor={colors.secondary}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              // Clear error when user starts typing
              if (errors.email) {
                setErrors({ ...errors, email: "" });
              }
            }}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        {errors.email ? (
          <Text style={styles.errorText}>{errors.email}</Text>
        ) : null}

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color={colors.secondary}
          />
          <TextInput
            style={styles.textInput}
            placeholder="Enter your password"
            placeholderTextColor={colors.secondary}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              // Clear error when user starts typing
              if (errors.password) {
                setErrors({ ...errors, password: "" });
              }
            }}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? "eye-outline" : "eye-off-outline"}
              size={20}
              color={colors.secondary}
            />
          </TouchableOpacity>
        </View>
        {errors.password ? (
          <Text style={styles.errorText}>{errors.password}</Text>
        ) : null}
        <TouchableOpacity>
          <Text style={styles.forgotPasswordText}> Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      {/* Login Button */}
      <TouchableOpacity style={styles.loginButtonWrapper} onPress={handleLogin}>
        <Text style={styles.loginText}>Login</Text>
      </TouchableOpacity>

      <View>
        <View></View>
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
  },
  textContainer: {
    marginVertical: 20,
  },
  headingText: {
    fontSize: 32,
    color: colors.primary,
    fontFamily: fonts.SemiBold,
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
  forgotPasswordText: {
    textAlign: "right",
    color: colors.primary,
    fontFamily: fonts.SemiBold,
  },
  loginButtonWrapper: {
    backgroundColor: colors.primary,
    borderRadius: 100,
    marginTop: 20,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  loginText: {
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
});

export default login;
