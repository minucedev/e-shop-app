import React, { createContext, useContext } from "react";

export interface IApplicableProduct {
  productId: number;
  productName: string;
  sku: string;
}

export interface IPromotion {
  id: number;
  name: string;
  description: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  campaignId: number;
  campaignName: string;
  applicableProducts: IApplicableProduct[];
  remainingUsage: number;
  isExpired: boolean;
  isUsageLimitReached: boolean;
}

// Mock data removed - will use real API

interface PromotionContextType {
  promotions: IPromotion[];
  getPromotions: () => Promise<IPromotion[]>;
}

const PromotionContext = createContext<PromotionContextType | undefined>(
  undefined
);

export const PromotionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // API call to get promotions (to be implemented with real API)
  const getPromotions = async (): Promise<IPromotion[]> => {
    // TODO: Implement real API call
    return [];
  };

  return (
    <PromotionContext.Provider value={{ promotions: [], getPromotions }}>
      {children}
    </PromotionContext.Provider>
  );
};

export const usePromotion = () => {
  const ctx = useContext(PromotionContext);
  if (!ctx)
    throw new Error("usePromotion must be used within PromotionProvider");
  return ctx;
};
