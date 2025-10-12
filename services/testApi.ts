// services/testApi.ts
import { apiClient } from "./apiClient";

export const testApiConnection = async (): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> => {
  try {
    // Test basic connection
    const response = await apiClient.get("/health");

    if (response.success) {
      return {
        success: true,
        message: "API connection successful",
        details: response.data,
      };
    } else {
      return {
        success: false,
        message: response.error || "API connection failed",
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: `Connection error: ${error.message}`,
      details: error,
    };
  }
};

export const testAuthEndpoints = async (): Promise<{
  endpoints: Record<string, boolean>;
  details: any;
}> => {
  const endpoints = {
    health: false,
    login: false,
    register: false,
    refresh: false,
  };

  const details: any = {};

  try {
    // Test health endpoint
    const healthResponse = await apiClient.get("/health");
    endpoints.health = healthResponse.success;
    details.health = healthResponse;
  } catch (error) {
    details.health = { error };
  }

  // Note: We can't test login/register without valid data
  // But we can test if the endpoints exist by checking error messages

  try {
    // Test login endpoint with empty data (expect validation error, not 404)
    const loginResponse = await apiClient.post("/auth/login", {});
    endpoints.login = !loginResponse.error?.includes("404");
    details.login = loginResponse;
  } catch (error) {
    details.login = { error };
  }

  try {
    // Test register endpoint
    const registerResponse = await apiClient.post("/auth/register", {});
    endpoints.register = !registerResponse.error?.includes("404");
    details.register = registerResponse;
  } catch (error) {
    details.register = { error };
  }

  try {
    // Test refresh endpoint
    const refreshResponse = await apiClient.post("/auth/refresh", {});
    endpoints.refresh = !refreshResponse.error?.includes("404");
    details.refresh = refreshResponse;
  } catch (error) {
    details.refresh = { error };
  }

  return { endpoints, details };
};
