// services/apiClient.ts

import { API_PORT, AI_API_PORT } from "@env";
import { TokenStorage } from "@/utils/authUtils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Platform } from "react-native";

/**
 * Get base host based on platform
 * @returns The appropriate host IP or hostname
 */
function getBaseHost(): string {
  // Lấy IP từ manifest (khi chạy Expo trên thiết bị thật)
  const expoDebuggerHost = Constants.expoConfig?.hostUri;

  if (expoDebuggerHost) {
    const ip = expoDebuggerHost.split(":")[0];
    return ip;
  }

  // Fallback cho Android Emulator
  if (Platform.OS === "android") {
    return "10.0.2.2";
  }

  // Fallback cho iOS Simulator
  return "localhost";
}

function getApiBaseUrl() {
  const host = getBaseHost();
  const port = API_PORT || "8081";
  const url = `http://${host}:${port}/api`;
  console.log(`📡 API Base URL: ${url}`);
  return url;
}

/**
 * Get AI API Base URL
 * AI services run on separate port
 */
function getAiApiBaseUrl() {
  const host = getBaseHost();
  const port = AI_API_PORT || "8005"; // Default to 8005 if not set
  const url = `http://${host}:${port}`;
  console.log(`🤖 AI API Base URL: ${url}`);
  return url;
}

const API_BASE_URL = getApiBaseUrl();
const AI_API_BASE_URL = getAiApiBaseUrl();

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
  private failedQueue: {
    resolve: (token: string | null) => void;
    reject: (error: any) => void;
  }[] = [];
  private isLoggingOut: boolean = false;
  private pendingRequests: Set<AbortController> = new Set();

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Check if currently logging out
   */
  public getIsLoggingOut(): boolean {
    return this.isLoggingOut;
  }

  /**
   * Set logout state and abort all pending requests
   */
  public startLogout(): void {
    if (this.isLoggingOut) return; // Already logging out

    this.isLoggingOut = true;

    // Abort all pending requests
    this.pendingRequests.forEach((controller) => {
      try {
        controller.abort();
      } catch (e) {
        // Ignore abort errors
      }
    });
    this.pendingRequests.clear();
  }

  /**
   * Reset logout state after logout completes
   */
  public endLogout(): void {
    this.isLoggingOut = false;
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = await TokenStorage.getAccessToken();

    // Không tự động refresh ở đây để tránh refresh liên tục
    // Chỉ refresh khi thực sự cần thiết (khi gặp 401)

    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private processQueue(error: any, token: string | null = null) {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });

    this.failedQueue = [];
  }

  private async refreshTokenIfNeeded(): Promise<string | null> {
    // If already refreshing, add to queue and wait
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      });
    }

    this.isRefreshing = true;
    this.refreshPromise = this.performTokenRefresh();

    try {
      const newToken = await this.refreshPromise;
      this.processQueue(null, newToken);
      return newToken;
    } catch (error) {
      this.processQueue(error, null);
      throw error;
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

      console.log("🔄 Starting token refresh...");

      const response = await fetch(`${this.baseURL}/auth/refresh-token`, {
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
        const text = await response.text();
        data = text ? JSON.parse(text) : {};
      } catch (jsonErr) {
        data = {};
      }

      const {
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn,
      } = data.data || data;

      if (!accessToken || !newRefreshToken) {
        throw new Error("Invalid refresh token response");
      }

      await TokenStorage.setTokens(accessToken, newRefreshToken, expiresIn);
      console.log("✅ Token refresh successful");

      return accessToken;
    } catch (error) {
      console.error("❌ Token refresh error:", error);
      // Clear invalid tokens
      await TokenStorage.clearTokens();
      return null;
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    isRetry: boolean = false,
    originalBody?: string
  ): Promise<ApiResponse<T>> {
    // Block new requests if logging out (except logout endpoint itself)
    if (this.isLoggingOut && !endpoint.includes("/auth/logout")) {
      throw new Error("Logging out, request cancelled");
    }

    // Create abort controller for this request
    const abortController = new AbortController();
    this.pendingRequests.add(abortController);

    try {
      const url = `${this.baseURL}${endpoint}`;
      console.log(`🚀 API Request: ${options.method || "GET"} ${url}`);

      // Cache original body for retry
      const requestBody = originalBody || (options.body as string);

      const headers = await this.getAuthHeaders();

      const config: RequestInit = {
        ...options,
        body: requestBody,
        headers: {
          ...headers,
          ...options.headers,
        },
        signal: abortController.signal, // Add abort signal
      };

      console.log(`📤 Request config:`, {
        url,
        method: config.method,
        headers: config.headers,
        body: config.body ? "***BODY_PRESENT***" : undefined,
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

        // Log successful response với full data
        if (response.ok) {
          console.log(`✅ API Response [${response.status}]:`, {
            endpoint,
            method: config.method,
            status: response.status,
            dataType: typeof data,
            dataKeys: data ? Object.keys(data).slice(0, 10) : [],
            fullData: data, // Log toàn bộ response data
          });
        }
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
        console.log("🔄 Got 401, attempting token refresh...");

        try {
          const newToken = await this.refreshTokenIfNeeded();
          if (newToken) {
            console.log("✅ Token refreshed, retrying original request...");
            // Retry with new token and original body
            return this.makeRequest(endpoint, options, true, requestBody);
          }
        } catch (refreshError) {
          console.error("❌ Token refresh failed:", refreshError);
          throw new Error("Session expired. Please login again.");
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
          "AUTHORIZATION_DENIED",
          "Access denied",
        ];
        const isExpectedError =
          response.status === 403 || // Don't log 403 errors
          expectedErrors.some(
            (msg) =>
              data.message?.toLowerCase().includes(msg.toLowerCase()) ||
              data.error?.includes(msg)
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
      // Handle abort errors silently
      if (error.name === "AbortError") {
        throw new Error("Request cancelled");
      }

      // Ẩn log lỗi parse JSON rỗng (SyntaxError: JSON Parse error: Unexpected end of input)
      if (
        error.name === "SyntaxError" &&
        error.message &&
        error.message.includes("JSON Parse error: Unexpected end of input")
      ) {
        // Không log lỗi này ra console
      } else {
        // Special handling for expected errors that shouldn't be logged
        const expectedErrors = [
          "haven't reviewed",
          "already reviewed",
          "already in wishlist",
          "Logging out",
          "Request cancelled",
          "Access denied",
          "AUTHORIZATION_DENIED",
        ];
        const isExpectedError = expectedErrors.some((msg) =>
          error.message?.toLowerCase().includes(msg.toLowerCase())
        );

        // Only log unexpected errors
        if (!isExpectedError) {
          console.error(`API Error [${endpoint}]:`, error);
        }
      }

      // Re-throw the error with a clear message so the caller can handle it.
      const errorMessage =
        error.name === "TypeError" &&
        error.message.includes("Network request failed")
          ? "Network connection error. Please check your internet connection and server address."
          : error.message ||
            "An unexpected error occurred. Please try again later.";

      throw new Error(errorMessage);
    } finally {
      // Remove this request from pending set
      this.pendingRequests.delete(abortController);
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
export const aiApiClient = new ApiClient(AI_API_BASE_URL);
export { AI_API_BASE_URL };
export type { ApiResponse };
