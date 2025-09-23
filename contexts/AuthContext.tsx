// contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { authMock, User } from "@/services/authMock";

type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    name: string,
    email: string,
    password: string,
    dateOfBirth: string,
    phone: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Khi app start, restore user từ token
  useEffect(() => {
    const initAuth = async () => {
      try {
        await authMock.seedUser(); // seed user mặc định
        const existingUser = await authMock.getUserFromToken();
        if (existingUser) {
          setUser(existingUser);
          // Lấy token thực từ AsyncStorage thay vì hard-code
          const token = await import(
            "@react-native-async-storage/async-storage"
          ).then((storage) => storage.default.getItem("MOCK_TOKEN"));
          setToken(token);
        }
      } catch (e) {
        console.log("Auth init error", e);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { user, token } = await authMock.signIn({ email, password });
      setUser(user);
      setToken(token);
    } catch (e) {
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (
    name: string,
    email: string,
    password: string,
    dateOfBirth: string,
    phone: string
  ) => {
    setIsLoading(true);
    try {
      const { user, token } = await authMock.signUp({
        name,
        email,
        password,
        dateOfBirth,
        phone,
      });
      setUser(user);
      setToken(token);
    } catch (e) {
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    await authMock.signOut();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
