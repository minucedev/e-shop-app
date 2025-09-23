import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Platform, // ← Để check platform
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { colors } from "@/constants/colors";
import { fonts } from "@/constants/fonts";
import DateTimePicker from "@react-native-community/datetimepicker"; // ← Thêm date picker

// ← Thêm interface ở đầu component
interface SignupErrors {
  name: string;
  dateOfBirth: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
}

const Signup = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ← Thêm các state mới
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");

  const [errors, setErrors] = useState<SignupErrors>({
    name: "",
    dateOfBirth: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });

  // ← Thêm function tính tuổi với proper types
  const calculateAge = (birthDate: Date): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  // ← Format date với proper types
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-GB"); // DD/MM/YYYY format
  };

  const validateInputs = () => {
    const newErrors = {
      name: "",
      dateOfBirth: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
    };
    let isValid = true;

    // ← Validate name
    if (!name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    } else if (name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
      isValid = false;
    }

    // ← Validate age
    const age = calculateAge(dateOfBirth);
    if (age < 18) {
      newErrors.dateOfBirth = "You must be at least 18 years old to register";
      isValid = false;
    }

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

    // Validate confirm password
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    // Validate phone
    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
      isValid = false;
    } else if (!/^[0-9]{10,11}$/.test(phone.replace(/\s+/g, ""))) {
      newErrors.phone = "Please enter a valid phone number";
      isValid = false;
    }

    // Validate date of birth
    if (!dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // ← Handler với proper types
  const handleDateChange = (event: any, selectedDate?: Date): void => {
    const currentDate = selectedDate || dateOfBirth;
    setShowDatePicker(Platform.OS === "ios");
    setDateOfBirth(currentDate);

    // Clear error when date changes
    if (errors.dateOfBirth) {
      setErrors({ ...errors, dateOfBirth: "" });
    }
  };

  const handleSignup = () => {
    if (validateInputs()) {
      console.log("Signup success with:", {
        name,
        dateOfBirth: formatDate(dateOfBirth),
        email,
        password,
        phone,
      });
      // Thêm logic đăng ký thành công ở đây
    } else {
      console.log("Validation failed");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.white }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 50 : 0}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "space-between",
          padding: 20,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButtonWrapper}
          onPress={() => {
            console.log("Back button pressed!");
            router.back();
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back-outline" size={25} color="white" />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.textContainer}>
          <Text style={styles.headingText}>Create your</Text>
          <Text style={styles.headingText}>account</Text>
        </View>

        {/* Form Container */}
        <View style={styles.formContainer}>
          {/* Name Input */}
          <View style={styles.inputContainer}>
            <Ionicons
              name="person-outline"
              size={20}
              color={colors.secondary}
            />
            <TextInput
              style={styles.textInput}
              placeholder="Enter your full name"
              placeholderTextColor={colors.secondary}
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (errors.name) {
                  setErrors({ ...errors, name: "" });
                }
              }}
              autoCapitalize="words"
            />
          </View>
          {errors.name ? (
            <Text style={styles.errorText}>{errors.name}</Text>
          ) : null}

          {/* Date of Birth Input */}
          <TouchableOpacity
            style={styles.inputContainer}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons
              name="calendar-outline"
              size={20}
              color={colors.secondary}
            />
            <View style={styles.dateDisplayContainer}>
              <Text
                style={[
                  styles.dateText,
                  dateOfBirth ? styles.selectedDate : styles.placeholderDate,
                ]}
              >
                {dateOfBirth
                  ? formatDate(dateOfBirth)
                  : "Select your date of birth"}
              </Text>
            </View>
            <Ionicons
              name="chevron-down-outline"
              size={20}
              color={colors.secondary}
            />
          </TouchableOpacity>
          {errors.dateOfBirth ? (
            <Text style={styles.errorText}>{errors.dateOfBirth}</Text>
          ) : null}

          {/* DateTimePicker */}
          {showDatePicker && (
            <DateTimePicker
              value={dateOfBirth}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleDateChange}
              maximumDate={new Date()}
              minimumDate={new Date(1900, 0, 1)}
            />
          )}

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color={colors.secondary} />
            <TextInput
              style={styles.textInput}
              placeholder="Enter your email address"
              placeholderTextColor={colors.secondary}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
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

          {/* Phone Input */}
          <View style={styles.inputContainer}>
            <Ionicons name="call-outline" size={20} color={colors.secondary} />
            <TextInput
              style={styles.textInput}
              placeholder="Enter your phone number"
              placeholderTextColor={colors.secondary}
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                if (errors.phone) {
                  setErrors({ ...errors, phone: "" });
                }
              }}
              keyboardType="phone-pad"
              autoCapitalize="none"
            />
          </View>
          {errors.phone ? (
            <Text style={styles.errorText}>{errors.phone}</Text>
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

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={colors.secondary}
            />
            <TextInput
              style={styles.textInput}
              placeholder="Confirm your password"
              placeholderTextColor={colors.secondary}
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errors.confirmPassword) {
                  setErrors({ ...errors, confirmPassword: "" });
                }
              }}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons
                name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                size={20}
                color={colors.secondary}
              />
            </TouchableOpacity>
          </View>
          {errors.confirmPassword ? (
            <Text style={styles.errorText}>{errors.confirmPassword}</Text>
          ) : null}
        </View>

        {/* Sign Up Button */}
        <TouchableOpacity
          style={styles.loginButtonWrapper}
          onPress={handleSignup}
          activeOpacity={0.8}
        >
          <Text style={styles.loginText}>Create Account</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footerContainer}>
          <Text style={styles.accountText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/login")}>
            <Text style={styles.SignupText}>Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
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
    paddingVertical: 0, // ← Đặt về 0 để dựa vào height
    marginVertical: 6,
    height: 52,
    justifyContent: "center", // ← Thêm để căn giữa content
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 10,
    fontFamily: fonts.Light,
    fontSize: 16,
    color: colors.primary,
    height: "100%", // ← Chiếm full height của container
    // Xóa textAlignVertical vì gây conflict
    paddingVertical: 0, // ← Đặt về 0 để text center tự nhiên
    textAlign: "left", // ← Căn trái text
    includeFontPadding: false, // ← Loại bỏ font padding (Android)
  },
  loginButtonWrapper: {
    backgroundColor: colors.primary,
    borderRadius: 100,
    marginTop: 20,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    height: 52,
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
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
  },
  accountText: {
    color: colors.primary,
    fontFamily: fonts.Regular,
  },
  SignupText: {
    color: colors.primary,
    fontFamily: fonts.Bold,
  },
  dateDisplayContainer: {
    flex: 1,
    paddingHorizontal: 10,
    justifyContent: "center",
    height: "100%", // ← Chiếm full height
    alignItems: "flex-start", // ← Căn trái như TextInput
  },
  dateText: {
    fontSize: 16,
    fontFamily: fonts.Light,
    color: colors.primary, // ← Đảm bảo có màu
    includeFontPadding: false, // ← Loại bỏ font padding
    // Xóa lineHeight và textAlignVertical
  },
  selectedDate: {
    color: colors.primary,
  },
  placeholderDate: {
    color: colors.secondary,
  },
});

export default Signup;
