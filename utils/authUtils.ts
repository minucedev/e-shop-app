// utils/authUtils.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

export const TokenStorage = {
  async getAccessToken(): Promise<string | null> {
    return AsyncStorage.getItem("accessToken");
  },

  async getRefreshToken(): Promise<string | null> {
    return AsyncStorage.getItem("refreshToken");
  },

  async getTokenExpiry(): Promise<number | null> {
    const expiresAt = await AsyncStorage.getItem("expiresAt");
    return expiresAt ? parseInt(expiresAt, 10) : null;
  },

  async setTokens(
    accessToken: string,
    refreshToken: string,
    expiresIn: number
  ): Promise<void> {
    const expiresAt = Date.now() + expiresIn * 1000;
    await AsyncStorage.multiSet([
      ["accessToken", accessToken],
      ["refreshToken", refreshToken],
      ["expiresAt", expiresAt.toString()],
    ]);
  },

  async clearTokens(): Promise<void> {
    await AsyncStorage.multiRemove([
      "accessToken",
      "refreshToken",
      "expiresAt",
    ]);
  },

  async isTokenExpired(): Promise<boolean> {
    const expiresAt = await this.getTokenExpiry();
    if (!expiresAt) return true;
    return Date.now() >= expiresAt;
  },

  async shouldRefreshToken(): Promise<boolean> {
    const expiresAt = await this.getTokenExpiry();
    if (!expiresAt) return false;
    // Refresh token if expires in next 5 minutes
    return Date.now() >= expiresAt - 5 * 60 * 1000;
  },
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (
  password: string
): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Mật khẩu phải có ít nhất 8 ký tự");
  }

  if (!/(?=.*[a-z])/.test(password)) {
    errors.push("Mật khẩu phải có ít nhất 1 chữ thường");
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push("Mật khẩu phải có ít nhất 1 chữ hoa");
  }

  if (!/(?=.*\d)/.test(password)) {
    errors.push("Mật khẩu phải có ít nhất 1 số");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validatePhone = (phone: string): boolean => {
  // Vietnam phone number format
  const phoneRegex = /^(\+84|84|0)(3|5|7|8|9)([0-9]{8})$/;
  return phoneRegex.test(phone);
};

export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, "");

  // If starts with 84, add +
  if (digits.startsWith("84") && digits.length === 11) {
    return "+" + digits;
  }

  // If starts with 0, keep as is
  if (digits.startsWith("0") && digits.length === 10) {
    return digits;
  }

  return phone; // Return original if can't format
};
