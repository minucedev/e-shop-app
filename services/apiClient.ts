// services/apiClient.ts

import AsyncStorage from "@react-native-async-storage/async-storage";
import { TokenStorage } from "@/utils/authUtils";
import Constants from "expo-constants";
import { Platform } from "react-native";

function getApiBaseUrl() {
  // Lấy IP từ manifest (khi chạy Expo trên thiết bị thật)
  const expoDebuggerHost = Constants.expoConfig?.hostUri;

  if (expoDebuggerHost) {
    // Khi chạy trên thiết bị thật qua Expo, lấy IP từ debuggerHost
    // Format: "192.168.x.x:8081" -> lấy phần IP
    const ip = expoDebuggerHost.split(":")[0];
    const url = `http://${ip}:8081/api`;
    console.log(`📡 API Base URL (Expo Device): ${url}`);
    return url;
  }

  // Fallback cho Android Emulator
  if (Platform.OS === "android") {
    const url = `http://10.0.2.2:8081/api`;
    console.log(`📡 API Base URL (Android Emulator): ${url}`);
    return url;
  }

  // Fallback cho iOS Simulator
  const url = `http://localhost:8081/api`;
  console.log(`📡 API Base URL (iOS Simulator): ${url}`);
  return url;
}

const API_BASE_URL = getApiBaseUrl();

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiClient {
  private baseURL: string;
  private isRefreshing: boolean = false;
  private refreshPromise: Promise<string | null> | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    let token = await TokenStorage.getAccessToken();

    // Check if token needs refresh
    if (token && (await TokenStorage.shouldRefreshToken())) {
      token = await this.refreshTokenIfNeeded();
    }

    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async refreshTokenIfNeeded(): Promise<string | null> {
    // If already refreshing, wait for the existing promise
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.performTokenRefresh();

    try {
      const newToken = await this.refreshPromise;
      return newToken;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<string | null> {
    try {
      const refreshToken = await TokenStorage.getRefreshToken();
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error("Token refresh failed");
      }

      let data: any = undefined;
      try {
        // Nếu response body rỗng, response.text() sẽ trả về chuỗi rỗng
        const text = await response.text();
        data = text ? JSON.parse(text) : {};
      } catch (jsonErr) {
        // Nếu không parse được JSON, trả về object rỗng và không log lỗi
        data = {};
      }
      const {
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn,
      } = data.data || data;

      await TokenStorage.setTokens(accessToken, newRefreshToken, expiresIn);

      return accessToken;
    } catch (error) {
      console.error("Token refresh error:", error);
      // Clear invalid tokens
      await TokenStorage.clearTokens();
      return null;
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    isRetry: boolean = false
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      console.log(`🚀 API Request: ${options.method || "GET"} ${url}`);

      const headers = await this.getAuthHeaders();

      const config: RequestInit = {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      };

      console.log(`📤 Request config:`, {
        url,
        method: config.method,
        headers: config.headers,
        body: config.body,
      });

      const response = await fetch(url, config);

      // Special handling for logout endpoint - don't parse JSON if empty response
      if (endpoint.includes("/auth/logout")) {
        if (response.ok) {
          return {
            success: true,
            data: { message: "Logged out successfully" } as T,
          };
        } else {
          // For logout, even if it fails on server, consider it successful locally
          console.warn(
            `Logout API failed with status ${response.status}, but continuing with local logout`
          );
          return {
            success: true,
            data: { message: "Logged out locally" } as T,
          };
        }
      }

      // Special handling for DELETE requests - might have empty response body
      if (config.method === "DELETE" && response.ok) {
        const contentType = response.headers.get("content-type");
        // If no content-type or content-length is 0, return success without parsing
        const contentLength = response.headers.get("content-length");
        if (!contentType || contentLength === "0") {
          return {
            success: true,
            data: undefined as T,
          };
        }
      }

      // Try to parse JSON, handle empty responses gracefully
      let data: any;
      try {
        const text = await response.text();
        data = text ? JSON.parse(text) : {};
      } catch (jsonErr) {
        // If DELETE and parse fails, it's probably empty - treat as success
        if (config.method === "DELETE" && response.ok) {
          return {
            success: true,
            data: undefined as T,
          };
        }
        // For other methods, empty response is unexpected
        console.warn("Failed to parse response as JSON:", jsonErr);
        data = {};
      }

      // Handle 401 Unauthorized - try to refresh token once
      if (response.status === 401 && !isRetry && !endpoint.includes("/auth/")) {
        const newToken = await this.refreshTokenIfNeeded();
        if (newToken) {
          // Retry with new token
          return this.makeRequest(endpoint, options, true);
        }
      }

      if (!response.ok) {
        // Better error messages for common status codes
        let errorMessage =
          data.message || `HTTP error! status: ${response.status}`;

        // Special handling for expected errors that shouldn't be logged
        const expectedErrors = [
          "haven't reviewed",
          "already reviewed",
          "already in wishlist",
        ];
        const isExpectedError = expectedErrors.some((msg) =>
          data.message?.toLowerCase().includes(msg.toLowerCase())
        );

        // Log response details for debugging (except expected errors)
        if (!isExpectedError) {
          console.log(`❌ API Error Response:`, {
            status: response.status,
            statusText: response.statusText,
            endpoint,
            data,
          });
        }

        switch (response.status) {
          case 400:
            errorMessage = data.message || "Invalid request data";
            break;
          case 401:
            errorMessage = "Invalid credentials or session expired";
            break;
          case 403:
            errorMessage = "Access denied";
            break;
          case 404:
            errorMessage = data.message || "Resource not found";
            break;
          case 500:
            errorMessage =
              data.message || "Server error. Please try again later";
            break;
        }

        throw new Error(errorMessage);
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error: any) {
      // Ẩn log lỗi parse JSON rỗng (SyntaxError: JSON Parse error: Unexpected end of input)
      if (
        error.name === "SyntaxError" &&
        error.message &&
        error.message.includes("JSON Parse error: Unexpected end of input")
      ) {
        // Không log lỗi này ra console
      } else {
        console.error(`API Error [${endpoint}]:`, error);
      }

      // Re-throw the error with a clear message so the caller can handle it.
      const errorMessage =
        error.name === "TypeError" &&
        error.message.includes("Network request failed")
          ? "Network connection error. Please check your internet connection and server address."
          : error.message ||
            "An unexpected error occurred. Please try again later.";

      throw new Error(errorMessage);
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: "DELETE" });
  }

  // Upload file with multipart/form-data
  async uploadFile<T>(
    endpoint: string,
    formData: FormData
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const token = await AsyncStorage.getItem("accessToken");

      const config: RequestInit = {
        method: "POST",
        body: formData,
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          // Don't set Content-Type for FormData, let the browser set it
        },
      };

      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error: any) {
      console.error(`Upload Error [${endpoint}]:`, error);
      return {
        success: false,
        error: error.message || "Upload failed",
      };
    }
  }
}

export const apiClient = new ApiClient();
export type { ApiResponse };
