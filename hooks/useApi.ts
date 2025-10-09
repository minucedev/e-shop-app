// hooks/useApi.ts
import { useState, useCallback } from "react";
import { authApi, User } from "@/services/authApi";
import { handleAuthError } from "@/utils/errorUtils";

export const useAuthApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await authApi.changePassword({
          currentPassword,
          newPassword,
        });
        if (!response.success) {
          throw new Error(response.error);
        }
        return response.data;
      } catch (err: any) {
        const errorMessage = handleAuthError(err);
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const forgotPassword = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authApi.forgotPassword({ email });
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    } catch (err: any) {
      const errorMessage = handleAuthError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(
    async (token: string, newPassword: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await authApi.resetPassword({ token, newPassword });
        if (!response.success) {
          throw new Error(response.error);
        }
        return response.data;
      } catch (err: any) {
        const errorMessage = handleAuthError(err);
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const uploadAvatar = useCallback(
    async (imageFile: File | Blob, fileName: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await authApi.uploadAvatar(imageFile, fileName);
        if (!response.success) {
          throw new Error(response.error);
        }
        return response.data;
      } catch (err: any) {
        const errorMessage = handleAuthError(err);
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    clearError,
    changePassword,
    forgotPassword,
    resetPassword,
    uploadAvatar,
  };
};
