// contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { authMock, User } from "@/services/authMock";
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
    name: string,
    email: string,
    password: string,
    dateOfBirth: string,
    phone: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
  refreshTokenFn: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
        await authMock.seedUser();
        const existingUser = await authMock.getUserFromToken();
        if (existingUser) setUser(existingUser);
        const accessToken = await AsyncStorage.getItem("accessToken");
        const refreshToken = await AsyncStorage.getItem("refreshToken");
        const expiresAtStr = await AsyncStorage.getItem("expiresAt");
        setAccessToken(accessToken);
        setRefreshToken(refreshToken);
        setExpiresAt(expiresAtStr ? parseInt(expiresAtStr, 10) : null);
      } catch (e) {
        setHasError(true);
        setErrorMessage("Failed to restore session");
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  // Mock signIn
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    setHasError(false);
    setErrorMessage(undefined);
    try {
      const { user, token } = await authMock.signIn({ email, password });
      const expiresIn = 3600; // 1 hour
      const mockRefreshToken = "mock-refresh-token";
      setUser(user);
      setAccessToken(token);
      setRefreshToken(mockRefreshToken);
      setExpiresAt(Date.now() + expiresIn * 1000);
      await AsyncStorage.setItem("accessToken", token);
      await AsyncStorage.setItem("refreshToken", mockRefreshToken);
      await AsyncStorage.setItem(
        "expiresAt",
        (Date.now() + expiresIn * 1000).toString()
      );
    } catch (e: any) {
      setHasError(true);
      setErrorMessage(e?.message || "Sign in failed");
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  // Mock signUp
  const signUp = async (
    name: string,
    email: string,
    password: string,
    dateOfBirth: string,
    phone: string
  ) => {
    setIsLoading(true);
    setHasError(false);
    setErrorMessage(undefined);
    try {
      const { user, token } = await authMock.signUp({
        name,
        email,
        password,
        dateOfBirth,
        phone,
      });
      const expiresIn = 3600;
      const mockRefreshToken = "mock-refresh-token";
      setUser(user);
      setAccessToken(token);
      setRefreshToken(mockRefreshToken);
      setExpiresAt(Date.now() + expiresIn * 1000);
      await AsyncStorage.setItem("accessToken", token);
      await AsyncStorage.setItem("refreshToken", mockRefreshToken);
      await AsyncStorage.setItem(
        "expiresAt",
        (Date.now() + expiresIn * 1000).toString()
      );
    } catch (e: any) {
      setHasError(true);
      setErrorMessage(e?.message || "Sign up failed");
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    await authMock.signOut();
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    setExpiresAt(null);
    setHasError(false);
    setErrorMessage(undefined);
    await AsyncStorage.multiRemove([
      "accessToken",
      "refreshToken",
      "expiresAt",
    ]);
  };

  // Mock refreshToken logic
  const refreshTokenFn = async () => {
    setIsRefreshing(true);
    setHasError(false);
    setErrorMessage(undefined);
    try {
      // Giả lập refresh token thành công
      const newAccessToken = "mock-access-token-" + Date.now();
      const expiresIn = 3600;
      setAccessToken(newAccessToken);
      setExpiresAt(Date.now() + expiresIn * 1000);
      await AsyncStorage.setItem("accessToken", newAccessToken);
      await AsyncStorage.setItem(
        "expiresAt",
        (Date.now() + expiresIn * 1000).toString()
      );
    } catch (e: any) {
      setHasError(true);
      setErrorMessage(e?.message || "Refresh token failed");
      await signOut();
    } finally {
      setIsRefreshing(false);
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
