// utils/errorUtils.ts
export interface ApiError {
  message: string;
  code?: string;
  field?: string;
  details?: any;
}

export const getErrorMessage = (error: any): string => {
  if (typeof error === "string") {
    return error;
  }

  if (error?.message) {
    return error.message;
  }

  if (error?.error) {
    return error.error;
  }

  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  return "Đã xảy ra lỗi không xác định";
};

export const handleAuthError = (error: any): string => {
  const message = getErrorMessage(error);

  // Map common error messages to Vietnamese
  const errorMap: Record<string, string> = {
    "Invalid credentials": "Sai email hoặc mật khẩu",
    "Email already exists": "Email đã tồn tại",
    "Phone already exists": "Số điện thoại đã tồn tại",
    "User not found": "Không tìm thấy người dùng",
    "Invalid token": "Token không hợp lệ",
    "Token expired": "Token đã hết hạn",
    "Network request failed": "Không thể kết nối đến server",
    Unauthorized: "Không có quyền truy cập",
    Forbidden: "Bị cấm truy cập",
    "Internal server error": "Lỗi server nội bộ",
  };

  return errorMap[message] || message;
};

export const isNetworkError = (error: any): boolean => {
  const message = getErrorMessage(error).toLowerCase();
  return (
    message.includes("network") ||
    message.includes("fetch") ||
    message.includes("connection") ||
    message.includes("timeout")
  );
};

export const shouldRetry = (error: any): boolean => {
  // Retry on network errors or 5xx server errors
  if (isNetworkError(error)) {
    return true;
  }

  if (error?.response?.status >= 500) {
    return true;
  }

  return false;
};
