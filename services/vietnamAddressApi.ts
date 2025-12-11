/**
 * Vietnam Address API Service
 * Using: https://provinces.open-api.vn/api/
 * Documentation: https://provinces.open-api.vn/
 */

export interface Province {
  code: number;
  name: string;
  name_en: string;
  full_name: string;
  full_name_en: string;
  code_name: string;
}

export interface District {
  code: number;
  name: string;
  name_en: string;
  full_name: string;
  full_name_en: string;
  code_name: string;
  province_code: number;
}

export interface Ward {
  code: number;
  name: string;
  name_en: string;
  full_name: string;
  full_name_en: string;
  code_name: string;
  district_code: number;
}

export interface ProvinceWithDistricts extends Province {
  districts: District[];
}

export interface DistrictWithWards extends District {
  wards: Ward[];
}

const BASE_URL = "https://provinces.open-api.vn/api";

/**
 * Get all provinces (Tỉnh/Thành phố)
 */
export const getProvinces = async (): Promise<Province[]> => {
  try {
    const response = await fetch(`${BASE_URL}/p/`);
    if (!response.ok) {
      throw new Error("Failed to fetch provinces");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching provinces:", error);
    throw error;
  }
};

/**
 * Get districts by province code (Quận/Huyện)
 */
export const getDistrictsByProvince = async (
  provinceCode: number
): Promise<District[]> => {
  try {
    const response = await fetch(`${BASE_URL}/p/${provinceCode}?depth=2`);
    if (!response.ok) {
      throw new Error("Failed to fetch districts");
    }
    const data: ProvinceWithDistricts = await response.json();
    return data.districts || [];
  } catch (error) {
    console.error("Error fetching districts:", error);
    throw error;
  }
};

/**
 * Get wards by district code (Phường/Xã)
 */
export const getWardsByDistrict = async (
  districtCode: number
): Promise<Ward[]> => {
  try {
    const response = await fetch(`${BASE_URL}/d/${districtCode}?depth=2`);
    if (!response.ok) {
      throw new Error("Failed to fetch wards");
    }
    const data: DistrictWithWards = await response.json();
    return data.wards || [];
  } catch (error) {
    console.error("Error fetching wards:", error);
    throw error;
  }
};

/**
 * Utility: Get postal code based on province code
 * This is a simplified mapping - you can expand this
 */
export const getPostalCodeByProvince = (provinceCode: number): string => {
  // Postal code mapping for major cities in Vietnam
  const postalCodeMap: { [key: number]: string } = {
    79: "70000", // TP. Hồ Chí Minh
    1: "10000", // Hà Nội
    48: "50000", // Đà Nẵng
    31: "43000", // Hải Phòng
    92: "80000", // Cần Thơ
    // Add more as needed
  };

  return postalCodeMap[provinceCode] || "00000";
};

export const vietnamAddressApi = {
  getProvinces,
  getDistrictsByProvince,
  getWardsByDistrict,
  getPostalCodeByProvince,
};
