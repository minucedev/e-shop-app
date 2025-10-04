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

const MOCK_PROMOTION_DATA: IPromotion[] = [
  {
    id: 1,
    name: "10% Off Orders Over 1 Million VND",
    description: "Applicable to phones and laptops.",
    discountType: "PERCENTAGE",
    discountValue: 10,
    minOrderAmount: 1000000,
    maxDiscountAmount: 500000,
    usageLimit: 100,
    usedCount: 20,
    isActive: true,
    startDate: "2025-10-01T00:00:00Z",
    endDate: "2025-10-31T23:59:59Z",
    campaignId: 101,
    campaignName: "October Super Sale",
    applicableProducts: [
      { productId: 3, productName: "iPhone 17 Pro Max", sku: "IP17P-512-TIT" },
      {
        productId: 5,
        productName: "MacBook Air M3 2024",
        sku: "MBA13-M3-512-MID",
      },
      {
        productId: 11,
        productName: "iPhone 15 Pro Max",
        sku: "IPHONE-15-PRO-MAX",
      },
    ],
    remainingUsage: 80,
    isExpired: false,
    isUsageLimitReached: false,
  },
  {
    id: 2,
    name: "500K Off Orders Over 5 Million VND",
    description: "Applicable to gaming products.",
    discountType: "FIXED_AMOUNT",
    discountValue: 500000,
    minOrderAmount: 5000000,
    maxDiscountAmount: 500000,
    usageLimit: 50,
    usedCount: 10,
    isActive: true,
    startDate: "2025-10-01T00:00:00Z",
    endDate: "2025-10-15T23:59:59Z",
    campaignId: 102,
    campaignName: "Gaming Week",
    applicableProducts: [
      {
        productId: 6,
        productName: "MSI RTX 4080 Gaming X Trio",
        sku: "MSI-RTX4080-GXT",
      },
      {
        productId: 9,
        productName: "ASUS ROG Strix Z790-E",
        sku: "ASUS-ROG-Z790E",
      },
    ],
    remainingUsage: 40,
    isExpired: false,
    isUsageLimitReached: false,
  },
];

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
  // Facade API: lấy danh sách promotion (mock async)
  const getPromotions = async (): Promise<IPromotion[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(MOCK_PROMOTION_DATA);
      }, 300);
    });
  };

  return (
    <PromotionContext.Provider
      value={{ promotions: MOCK_PROMOTION_DATA, getPromotions }}
    >
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
