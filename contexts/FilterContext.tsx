// contexts/FilterContext.tsx

import React, { createContext, useContext, useState, useCallback } from "react";
import { Brand } from "@/services/brandApi";
import { Category } from "@/services/categoryApi";

/**
 * Filter state interface
 */
export interface FilterState {
  // Search
  searchQuery?: string;

  // Multi-select filters
  selectedBrands: number[]; // Array of brand IDs
  selectedCategories: number[]; // Array of category IDs

  // Range filters
  priceRange: {
    min?: number;
    max?: number;
  };

  // Rating filter
  minRating?: number; // 0-5

  // Campaign filter
  campaignId?: number;

  // Attributes (e.g., "RAM:8GB", "Color:Black")
  attributes: string[];

  // Sort options
  sortBy: "id" | "name" | "price" | "rating";
  sortDirection: "ASC" | "DESC";
}

/**
 * Default filter state
 */
export const defaultFilterState: FilterState = {
  searchQuery: undefined,
  selectedBrands: [],
  selectedCategories: [],
  priceRange: {
    min: undefined,
    max: undefined,
  },
  minRating: undefined,
  campaignId: undefined,
  attributes: [],
  sortBy: "id",
  sortDirection: "ASC",
};

/**
 * Filter context type
 */
type FilterContextType = {
  // Current filter state
  filters: FilterState;

  // Master data for filters
  availableBrands: Brand[];
  availableCategories: Category[];

  // Set master data
  setAvailableBrands: (brands: Brand[]) => void;
  setAvailableCategories: (categories: Category[]) => void;

  // Update filter actions
  setSearchQuery: (query?: string) => void;
  toggleBrand: (brandId: number) => void;
  toggleCategory: (categoryId: number) => void;
  setPriceRange: (min?: number, max?: number) => void;
  setMinRating: (rating?: number) => void;
  setCampaignId: (campaignId?: number) => void;
  addAttribute: (attribute: string) => void;
  removeAttribute: (attribute: string) => void;
  setSorting: (
    sortBy: FilterState["sortBy"],
    sortDirection: "ASC" | "DESC"
  ) => void;

  // Bulk actions
  clearFilters: () => void;
  clearAllFilters: () => void;
  setFilters: (filters: Partial<FilterState>) => void;

  // Utility
  hasActiveFilters: () => boolean;
  getActiveFilterCount: () => number;
  getFilterParams: () => Record<string, any>;
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider = ({ children }: { children: React.ReactNode }) => {
  const [filters, setFiltersState] = useState<FilterState>(defaultFilterState);
  const [availableBrands, setAvailableBrands] = useState<Brand[]>([]);
  const [availableCategories, setAvailableCategories] = useState<Category[]>(
    []
  );

  // Update search query
  const setSearchQuery = useCallback((query?: string) => {
    setFiltersState((prev) => ({ ...prev, searchQuery: query }));
  }, []);

  // Toggle brand selection
  const toggleBrand = useCallback((brandId: number) => {
    setFiltersState((prev) => {
      const isSelected = prev.selectedBrands.includes(brandId);
      return {
        ...prev,
        selectedBrands: isSelected
          ? prev.selectedBrands.filter((id) => id !== brandId)
          : [...prev.selectedBrands, brandId],
      };
    });
  }, []);

  // Toggle category selection
  const toggleCategory = useCallback((categoryId: number) => {
    setFiltersState((prev) => {
      const isSelected = prev.selectedCategories.includes(categoryId);
      return {
        ...prev,
        selectedCategories: isSelected
          ? prev.selectedCategories.filter((id) => id !== categoryId)
          : [...prev.selectedCategories, categoryId],
      };
    });
  }, []);

  // Set price range
  const setPriceRange = useCallback((min?: number, max?: number) => {
    setFiltersState((prev) => ({
      ...prev,
      priceRange: { min, max },
    }));
  }, []);

  // Set minimum rating
  const setMinRating = useCallback((rating?: number) => {
    setFiltersState((prev) => ({ ...prev, minRating: rating }));
  }, []);

  // Set campaign ID
  const setCampaignId = useCallback((campaignId?: number) => {
    setFiltersState((prev) => ({ ...prev, campaignId }));
  }, []);

  // Add attribute filter
  const addAttribute = useCallback((attribute: string) => {
    setFiltersState((prev) => {
      if (prev.attributes.includes(attribute)) return prev;
      return {
        ...prev,
        attributes: [...prev.attributes, attribute],
      };
    });
  }, []);

  // Remove attribute filter
  const removeAttribute = useCallback((attribute: string) => {
    setFiltersState((prev) => ({
      ...prev,
      attributes: prev.attributes.filter((attr) => attr !== attribute),
    }));
  }, []);

  // Set sorting
  const setSorting = useCallback(
    (sortBy: FilterState["sortBy"], sortDirection: "ASC" | "DESC") => {
      setFiltersState((prev) => ({ ...prev, sortBy, sortDirection }));
    },
    []
  );

  // Clear only filter values (keep search and sort)
  const clearFilters = useCallback(() => {
    setFiltersState((prev) => ({
      ...prev,
      selectedBrands: [],
      selectedCategories: [],
      priceRange: { min: undefined, max: undefined },
      minRating: undefined,
      campaignId: undefined,
      attributes: [],
    }));
  }, []);

  // Clear all filters including search and sort
  const clearAllFilters = useCallback(() => {
    setFiltersState(defaultFilterState);
  }, []);

  // Set filters in bulk
  const setFilters = useCallback((newFilters: Partial<FilterState>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  }, []);

  // Check if any filter is active (excluding campaign - it has dedicated screen)
  const hasActiveFilters = useCallback((): boolean => {
    return (
      filters.selectedBrands.length > 0 ||
      filters.selectedCategories.length > 0 ||
      filters.priceRange.min !== undefined ||
      filters.priceRange.max !== undefined ||
      filters.minRating !== undefined ||
      filters.attributes.length > 0 ||
      Boolean(filters.searchQuery && filters.searchQuery.trim() !== "")
    );
  }, [filters]);

  // Get count of active filters (excluding campaign)
  const getActiveFilterCount = useCallback(() => {
    let count = 0;
    if (filters.selectedBrands.length > 0) count++;
    if (filters.selectedCategories.length > 0) count++;
    if (
      filters.priceRange.min !== undefined ||
      filters.priceRange.max !== undefined
    )
      count++;
    if (filters.minRating !== undefined) count++;
    // Campaign excluded - has dedicated screen
    if (filters.attributes.length > 0) count += filters.attributes.length;
    if (filters.searchQuery && filters.searchQuery.trim() !== "") count++;
    return count;
  }, [filters]);

  // Get filter params for API call
  const getFilterParams = useCallback(() => {
    const params: Record<string, any> = {
      sortBy: filters.sortBy,
      sortDirection: filters.sortDirection,
    };

    if (filters.searchQuery && filters.searchQuery.trim() !== "") {
      params.name = filters.searchQuery.trim();
    }

    // Note: API chỉ chấp nhận 1 brandId, nếu có nhiều brands thì lấy cái đầu tiên
    // Hoặc có thể gọi API nhiều lần và merge kết quả
    if (filters.selectedBrands.length > 0) {
      params.brandId = filters.selectedBrands[0];
    }

    // Note: Tương tự cho categoryId
    if (filters.selectedCategories.length > 0) {
      params.categoryId = filters.selectedCategories[0];
    }

    if (filters.priceRange.min !== undefined) {
      params.minPrice = filters.priceRange.min;
    }

    if (filters.priceRange.max !== undefined) {
      params.maxPrice = filters.priceRange.max;
    }

    if (filters.minRating !== undefined) {
      params.minRating = filters.minRating;
    }

    if (filters.campaignId !== undefined) {
      params.campaignId = filters.campaignId;
    }

    if (filters.attributes.length > 0) {
      params.attributes = filters.attributes;
    }

    return params;
  }, [filters]);

  const value: FilterContextType = {
    filters,
    availableBrands,
    availableCategories,
    setAvailableBrands,
    setAvailableCategories,
    setSearchQuery,
    toggleBrand,
    toggleCategory,
    setPriceRange,
    setMinRating,
    setCampaignId,
    addAttribute,
    removeAttribute,
    setSorting,
    clearFilters,
    clearAllFilters,
    setFilters,
    hasActiveFilters,
    getActiveFilterCount,
    getFilterParams,
  };

  return (
    <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
  );
};

export const useFilter = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilter must be used within FilterProvider");
  }
  return context;
};
