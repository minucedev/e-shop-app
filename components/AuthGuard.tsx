import { useAuth } from "../contexts/AuthContext";
import { useRouter, useSegments } from "expo-router";
import { useEffect } from "react";

// Bước 1: Xử lý chính xác các route public
const publicRoutes = ["login", "signup", "welcome", "forgot-password"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { accessToken, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Kiểm tra nếu đang ở route public
    const inPublic = segments.some((seg) => publicRoutes.includes(seg));

    if (!accessToken && !inPublic) {
      router.replace("/(auth)/login");
    } else if (accessToken && inPublic) {
      router.replace("/(app)/home");
    }
  }, [accessToken, isLoading, segments, router]);

  return <>{children}</>;
}
