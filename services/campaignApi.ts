import { apiClient } from "./apiClient";

export interface ICampaign {
  id: number;
  name: string;
  description: string;
  image: string;
  imageID: string | null;
  startDate: string;
  endDate: string;
  promotionCount: number;
}

export const getActiveCampaigns = async (): Promise<ICampaign[]> => {
  const res = await apiClient.get<ICampaign[]>("/campaigns/active");
  if (res.success && res.data) return res.data;
  throw new Error(res.error || "Failed to fetch campaigns");
};
