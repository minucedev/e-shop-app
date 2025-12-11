import { apiClient } from "./apiClient";

// ============================================
// INTERFACES
// ============================================

export interface Voucher {
  id: number;
  code: string;
  voucherType: "PERCENTAGE" | "FIXED_AMOUNT";
  value: number;
  minOrderAmount: number;
  usageLimit: number;
  usedCount: number;
  reservedQuantity: number;
  availableQuantity: number;
  validFrom: string;
  validUntil: string;
  isValid: boolean;
  hasUsageLeft: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VoucherValidation {
  isValid: boolean;
  message: string;
  voucher?: {
    id: number;
    code: string;
    voucherType: "PERCENTAGE" | "FIXED_AMOUNT";
    value: number;
    minOrderAmount: number;
    usageLimit: number;
    usedCount: number;
    hasUsageLeft: boolean;
  };
  discountAmount: number;
  finalAmount: number;
  discountPercentage?: number;
  errorType?: string;
}

export interface DiscountCalculation {
  subtotal: number;
  voucherDiscount: number;
  shippingFee: number;
  total: number;
  voucherCode?: string;
  voucherType?: "PERCENTAGE" | "FIXED_AMOUNT";
  voucherValue?: number;
}

export interface CalculateDiscountRequest {
  orderItems: Array<{
    productVariationId: number;
    quantity: number;
  }>;
  voucherCode: string;
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Calculate discount when applying voucher
 * Endpoint: POST /orders/calculate-discount
 */
export const calculateDiscount = async (
  data: CalculateDiscountRequest
): Promise<DiscountCalculation> => {
  const response = await apiClient.post<DiscountCalculation>(
    "/orders/calculate-discount",
    data
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to calculate discount");
  }

  return response.data;
};

/**
 * Validate voucher code
 * Endpoint: POST /vouchers/validate
 */
export const validateVoucher = async (data: {
  code: string;
  userId: number;
  orderAmount: number;
}): Promise<VoucherValidation> => {
  const response = await apiClient.post<VoucherValidation>(
    "/vouchers/validate",
    data
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to validate voucher");
  }

  return response.data;
};

/**
 * Get voucher by code
 * Endpoint: GET /vouchers/{code}
 */
export const getVoucherByCode = async (code: string): Promise<Voucher> => {
  const response = await apiClient.get<Voucher>(`/vouchers/${code}`);

  if (!response.success || !response.data) {
    throw new Error(response.error || "Voucher not found");
  }

  return response.data;
};

export const voucherApi = {
  calculateDiscount,
  validateVoucher,
  getVoucherByCode,
};
