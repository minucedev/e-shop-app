import { apiClient, ApiResponse } from "./apiClient";

// =================================================================
// REQUEST PAYLOAD TYPES
// =================================================================

export interface OrderItemPayload {
  productVariationId: number;
  quantity: number;
}

export interface ShippingInfo {
  shippingName: string;
  shippingPhone: string;
  shippingEmail: string;
  shippingAddress: string;
  shippingWard: string;
  shippingDistrict: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingCountry: string;
  shippingMethod: "STANDARD" | "EXPRESS";
  deliveryInstructions?: string;
}

export interface PaymentInfo {
  paymentMethod: "COD" | "VNPAY";
}

export interface CreateOrderPayload {
  orderItems: OrderItemPayload[];
  shippingInfo: ShippingInfo;
  paymentInfo: PaymentInfo;
  note?: string;
  voucherCode?: string;
  returnUrl?: string;
}

// =================================================================
// RESPONSE TYPES
// =================================================================

export interface OrderItemResponse {
  id: number;
  productVariationId: number;
  productName: string;
  productVariationName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  discountAmount: number;
}

export interface Order {
  id: number;
  orderCode: string;
  status: string;
  paymentMethod: "COD" | "VNPAY";
  paymentStatus: string;
  totalAmount: number;
  discountAmount: number;
  shippingFee: number;
  finalAmount: number;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingWard: string;
  shippingDistrict: string;
  shippingCity: string;
  note: string | null;
  paymentTransactionId: string;
  paymentUrl: string | null;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItemResponse[];
}

// =================================================================
// PAGINATION TYPES
// =================================================================

export interface PageInfo {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

export interface OrderHistoryResponse {
  content: Order[];
  page: PageInfo;
}

// =================================================================
// API FUNCTION
// =================================================================

const createOrder = (
  payload: CreateOrderPayload
): Promise<ApiResponse<Order>> => {
  return apiClient.post<Order>("/orders", payload);
};

const getOrderHistory = (
  page: number = 0,
  size: number = 10
): Promise<ApiResponse<OrderHistoryResponse>> => {
  return apiClient.get<OrderHistoryResponse>(
    `/orders?page=${page}&size=${size}`
  );
};

export const orderApi = {
  createOrder,
  getOrderHistory,
};
