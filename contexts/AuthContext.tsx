// contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { authApi, User, UpdateProfileRequest } from "@/services/authApi";
import AsyncStorage from "@react-native-async-storage/async-storage";

type AuthContextType = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  isLoading: boolean;
  isRefreshing: boolean;
  hasError: boolean;
  errorMessage?: string;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    dateOfBirth?: string,
    phone?: string,
    address?: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
  refreshTokenFn: () => Promise<void>;
  setUser?: React.Dispatch<React.SetStateAction<User | null>>; // Thêm dòng này
  updateUser?: (updated: UpdateProfileRequest) => Promise<void>; // Thêm dòng này
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  );

  // Restore session on app start
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedAccessToken = await AsyncStorage.getItem("accessToken");
        const storedRefreshToken = await AsyncStorage.getItem("refreshToken");
        const expiresAtStr = await AsyncStorage.getItem("expiresAt");

        setAccessToken(storedAccessToken);
        setRefreshToken(storedRefreshToken);
        setExpiresAt(expiresAtStr ? parseInt(expiresAtStr, 10) : null);

        // Nếu có token, thử lấy thông tin user
        if (storedAccessToken) {
          const currentTime = Date.now();
          const tokenExpiry = expiresAtStr ? parseInt(expiresAtStr, 10) : 0;

          // Kiểm tra token còn hiệu lực không
          if (tokenExpiry > currentTime) {
            const response = await authApi.getProfile();
            if (response.success && response.data) {
              setUser(response.data);
              console.log("Khôi phục thông tin user thành công");
            } else {
              console.warn("Token không hợp lệ, xóa session");
              // Token không hợp lệ, xóa session
              await clearSession();
            }
          } else {
            // Token hết hạn, thử refresh
            if (storedRefreshToken) {
              await refreshTokenFn();
            } else {
              await clearSession();
            }
          }
        }
      } catch (e) {
        console.error("Init auth error:", e);
        setHasError(true);
        setErrorMessage("Failed to restore session");
        await clearSession();
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  // Helper function to clear session
  const clearSession = async () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    setExpiresAt(null);
    await AsyncStorage.multiRemove([
      "accessToken",
      "refreshToken",
      "expiresAt",
    ]);
  };

  // API signIn
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    setHasError(false);
    setErrorMessage(undefined);
    try {
      const response = await authApi.login({ email, password });

      if (!response.success || !response.data) {
        // Improve error message for login failures
        let errorMsg = response.error || "Login failed";
        if (
          errorMsg.includes("401") ||
          errorMsg.includes("Invalid credentials")
        ) {
          errorMsg = "Email hoặc mật khẩu không đúng";
        } else if (errorMsg.includes("Network")) {
          errorMsg = "Lỗi kết nối mạng. Vui lòng kiểm tra internet";
        }
        throw new Error(errorMsg);
      }

      const { accessToken, refreshToken, expiresIn } = response.data;
      const expiresAt = Date.now() + expiresIn * 1000;

      // Lưu tokens
      setAccessToken(accessToken);
      setRefreshToken(refreshToken);
      setExpiresAt(expiresAt);

      await AsyncStorage.setItem("accessToken", accessToken);
      await AsyncStorage.setItem("refreshToken", refreshToken);
      await AsyncStorage.setItem("expiresAt", expiresAt.toString());

      // Sau khi login thành công, lấy thông tin user
      const profileResponse = await authApi.getProfile();
      if (profileResponse.success && profileResponse.data) {
        setUser(profileResponse.data);
        console.log("Đã lấy thông tin user thành công");
      } else {
        console.warn("Không thể lấy thông tin user:", profileResponse.error);
      }
    } catch (e: any) {
      setHasError(true);
      setErrorMessage(e?.message || "Đăng nhập thất bại");
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  // API signUp
  const signUp = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    dateOfBirth?: string,
    phone?: string,
    address?: string
  ) => {
    setIsLoading(true);
    setHasError(false);
    setErrorMessage(undefined);
    try {
      // Bước 1: Đăng ký tài khoản
      const response = await authApi.register({
        firstName,
        lastName,
        email,
        password,
        dateOfBirth,
        phone,
        address,
        roleNames: ["ROLE_CUSTOMER"],
      });

      if (!response.success) {
        throw new Error(response.error || "Registration failed");
      }

      console.log("✅ Registration successful, now logging in...");

      // Bước 2: Tự động đăng nhập với email và password vừa đăng ký
      await signIn(email, password);
    } catch (e: any) {
      setHasError(true);
      setErrorMessage(e?.message || "Sign up failed");
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      // Gọi API logout - now handles errors better in apiClient
      const response = await authApi.logout();
      if (response.success) {
        console.log("Logout API successful");
      }
    } catch (e) {
      console.error("Logout API error:", e);
      // Vẫn tiếp tục clear local session
    }

    // Clear local session - always do this regardless of API result
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    setExpiresAt(null);
    setHasError(false);
    setErrorMessage(undefined);

    try {
      await AsyncStorage.multiRemove([
        "accessToken",
        "refreshToken",
        "expiresAt",
      ]);
      console.log("Local session cleared successfully");
    } catch (storageError) {
      console.error("Error clearing local storage:", storageError);
      // Even if storage clear fails, we've already cleared the state
    }
  };

  // API refreshToken logic
  const refreshTokenFn = async () => {
    if (!refreshToken) {
      await signOut();
      return;
    }

    setIsRefreshing(true);
    setHasError(false);
    setErrorMessage(undefined);
    try {
      const response = await authApi.refreshToken({ refreshToken });

      if (!response.success || !response.data) {
        throw new Error(response.error || "Refresh token failed");
      }

      const {
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn,
      } = response.data;
      const expiresAt = Date.now() + expiresIn * 1000;

      setAccessToken(accessToken);
      setRefreshToken(newRefreshToken);
      setExpiresAt(expiresAt);

      await AsyncStorage.setItem("accessToken", accessToken);
      await AsyncStorage.setItem("refreshToken", newRefreshToken);
      await AsyncStorage.setItem("expiresAt", expiresAt.toString());

      // Lấy lại thông tin user với token mới
      const profileResponse = await authApi.getProfile();
      if (profileResponse.success && profileResponse.data) {
        setUser(profileResponse.data);
        console.log("Refresh token và lấy thông tin user thành công");
      }
    } catch (e: any) {
      console.error("Refresh token error:", e);
      setHasError(true);
      setErrorMessage(e?.message || "Refresh token failed");
      await signOut();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Hàm cập nhật user profile
  const updateUser = async (updated: UpdateProfileRequest) => {
    if (!user) return;

    try {
      const response = await authApi.updateProfile(updated);

      if (!response.success || !response.data) {
        throw new Error(response.error || "Update profile failed");
      }

      setUser(response.data);
    } catch (e: any) {
      console.error("Update user error:", e);
      setHasError(true);
      setErrorMessage(e?.message || "Update profile failed");
      throw e;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        expiresAt,
        isLoading,
        isRefreshing,
        hasError,
        errorMessage,
        signIn,
        signUp,
        signOut,
        refreshTokenFn,
        setUser,
        updateUser, // Thêm dòng này
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
