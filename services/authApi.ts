// services/authApi.ts
import { apiClient, ApiResponse } from "./apiClient";

export interface Address {
  id: number;
  streetAddress: string;
  ward: string;
  district: string;
  city: string;
  postalCode: string;
  isDefault: boolean;
  addressType: "HOME" | "WORK" | "OTHER";
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  addresses: Address[];
  dateOfBirth: string | null;
  roles: string[];
  isActive: boolean;
  isLocked: boolean;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number; // seconds
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  dateOfBirth?: string;
  phone?: string;
  roleNames?: string[];
}

export interface RegisterResponse {
  user: User;
  tokens: AuthTokens;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  phone?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

class AuthApiService {
  // Đăng nhập
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return apiClient.post<LoginResponse>("/auth/login", credentials);
  }

  // Đăng ký
  async register(
    userData: RegisterRequest
  ): Promise<ApiResponse<RegisterResponse>> {
    return apiClient.post<RegisterResponse>("/auth/register", userData);
  }

  // Làm mới token
  async refreshToken(
    data: RefreshTokenRequest
  ): Promise<ApiResponse<RefreshTokenResponse>> {
    return apiClient.post<RefreshTokenResponse>("/auth/refresh", data);
  }

  // Đăng xuất
  async logout(): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post<{ message: string }>("/auth/logout");
  }

  // Lấy thông tin profile hiện tại
  async getProfile(): Promise<ApiResponse<User>> {
    return apiClient.get<User>("/users/profile");
  }

  // Cập nhật profile
  async updateProfile(
    userId: number,
    data: UpdateProfileRequest
  ): Promise<ApiResponse<User>> {
    return apiClient.patch<User>(`/users/${userId}`, data);
  }

  // Đổi mật khẩu
  async changePassword(
    data: ChangePasswordRequest
  ): Promise<ApiResponse<{ message: string }>> {
    return apiClient.put<{ message: string }>("/auth/change-password", data);
  }

  // // Quên mật khẩu
  // async forgotPassword(
  //   data: ForgotPasswordRequest
  // ): Promise<ApiResponse<{ message: string }>> {
  //   return apiClient.post<{ message: string }>("/auth/forgot-password", data);
  // }

  // // Reset mật khẩu
  // async resetPassword(
  //   data: ResetPasswordRequest
  // ): Promise<ApiResponse<{ message: string }>> {
  //   return apiClient.post<{ message: string }>("/auth/reset-password", data);
  // }

  // Upload avatar
  async uploadAvatar(
    imageFile: File | Blob,
    fileName: string
  ): Promise<ApiResponse<{ avatarUrl: string }>> {
    const formData = new FormData();
    formData.append("avatar", imageFile as any, fileName);

    return apiClient.uploadFile<{ avatarUrl: string }>(
      "/auth/upload-avatar",
      formData
    );
  }

  // Lấy danh sách địa chỉ của user
  async getUserAddresses(userId: number): Promise<ApiResponse<Address[]>> {
    return apiClient.get<Address[]>(`/users/${userId}/addresses`);
  }

  // Tạo địa chỉ mới
  async createAddress(
    userId: number,
    addressData: Omit<Address, "id">
  ): Promise<ApiResponse<Address>> {
    return apiClient.post<Address>(`/users/${userId}/addresses`, addressData);
  }

  // Cập nhật địa chỉ
  async updateAddress(
    userId: number,
    addressId: number,
    addressData: Omit<Address, "id">
  ): Promise<ApiResponse<Address>> {
    return apiClient.patch<Address>(
      `/users/${userId}/addresses/${addressId}`,
      addressData
    );
  }

  // Xóa địa chỉ
  async deleteAddress(
    userId: number,
    addressId: number
  ): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/users/${userId}/addresses/${addressId}`);
  }

  // // Verify email (nếu cần)
  // async verifyEmail(token: string): Promise<ApiResponse<{ message: string }>> {
  //   return apiClient.post<{ message: string }>("/auth/verify-email", { token });
  // }

  // // Resend verification email (nếu cần)
  // async resendVerificationEmail(): Promise<ApiResponse<{ message: string }>> {
  //   return apiClient.post<{ message: string }>("/auth/resend-verification");
  // }
}

export const authApi = new AuthApiService();
