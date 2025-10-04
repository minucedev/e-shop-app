import React, { createContext, useContext, useEffect, useState } from "react";

// Định nghĩa kiểu sản phẩm theo API model
export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  sku: string;
  image: string;
  imageID: string;
  brandId: number;
  brandName: string;
  categoryId: number;
  categoryName: string;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  rating: number;
  reviewCount: number;
  tags: string[];
  specifications: {
    [key: string]: string;
  };
};

// Helper type để format giá hiển thị
export type ProductDisplay = Product & {
  formattedPrice: string;
};

type ProductContextType = {
  products: Product[];
  isLoading: boolean;
  error?: string;
  refreshProducts: () => Promise<void>;
  getProductById: (id: number | string) => Product | undefined;
  searchProducts: (query: string) => Product[];
  formatPrice: (price: number) => string;
  getProductsByCategory: (categoryId: number) => Product[];
  getFeaturedProducts: () => Product[];
  // Filter functions
  getProductsByBrand: (brandId: number) => Product[];
  getProductsByPriceRange: (minPrice: number, maxPrice: number) => Product[];
  getUniqueCategories: () => { id: number; name: string }[];
  getUniqueBrands: () => { id: number; name: string }[];
  filterProducts: (filters: ProductFilter) => Product[];
  sortProducts: (products: Product[], sortBy: SortOption) => Product[];
};

// Filter types
export type ProductFilter = {
  categoryId?: number;
  brandId?: number;
  minPrice?: number;
  maxPrice?: number;
  searchQuery?: string;
  inStock?: boolean;
  featured?: boolean;
};

export type SortOption =
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc"
  | "rating-desc"
  | "newest";

const ProductContext = createContext<ProductContextType | undefined>(undefined);

// Dữ liệu mẫu theo API model, sau này thay bằng fetch API
const SEED_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "AMD RYZEN 9",
    description: "Unleash Performance with advanced architecture",
    price: 299.99,
    stock: 50,
    sku: "AMD-R9-9900X",
    image:
      "https://nguyencongpc.vn/media/product/250-27037-242872903-c_ryzen_9_9900x3d_3dpib.jpg",
    imageID: "products/amd_ryzen_9",
    brandId: 1,
    brandName: "AMD",
    categoryId: 1,
    categoryName: "Processors",
    isActive: true,
    isFeatured: true,
    createdAt: "2024-01-15T10:30:00",
    updatedAt: "2024-01-15T10:30:00",
    deletedAt: null,
    rating: 4.8,
    reviewCount: 156,
    tags: ["processor", "amd", "gaming", "high-performance"],
    specifications: {
      cores: "16 cores",
      threads: "32 threads",
      baseSpeed: "3.4 GHz",
      maxSpeed: "5.6 GHz",
    },
  },
  {
    id: 2,
    name: "Intel Core i7 12700",
    description: "Beyond Limits with hybrid architecture",
    price: 249.99,
    stock: 75,
    sku: "INTEL-I7-12700K",
    image:
      "https://product.hstatic.net/200000320233/product/i7_01bbf06595c041489008499b74309cd5_1024x1024.jpg",
    imageID: "products/intel_i7_12700",
    brandId: 2,
    brandName: "Intel",
    categoryId: 1,
    categoryName: "Processors",
    isActive: true,
    isFeatured: false,
    createdAt: "2024-01-15T10:30:00",
    updatedAt: "2024-01-15T10:30:00",
    deletedAt: null,
    rating: 4.6,
    reviewCount: 203,
    tags: ["processor", "intel", "gaming", "productivity"],
    specifications: {
      cores: "12 cores",
      threads: "20 threads",
      baseSpeed: "3.6 GHz",
      maxSpeed: "5.0 GHz",
    },
  },
  {
    id: 3,
    name: "iPhone 17 Pro Max",
    description: "Pro Performance with A17 Pro chip",
    price: 1990.0,
    stock: 25,
    sku: "IP17P-512-TIT",
    image:
      "https://cdn2.cellphones.com.vn/358x/media/catalog/product/i/p/iphone-17-pro-256-gb.png",
    imageID: "products/iphone_17_pro_max",
    brandId: 3,
    brandName: "Apple",
    categoryId: 2,
    categoryName: "Smartphones",
    isActive: true,
    isFeatured: true,
    createdAt: "2024-01-15T10:30:00",
    updatedAt: "2024-01-15T10:30:00",
    deletedAt: null,
    rating: 4.9,
    reviewCount: 89,
    tags: ["smartphone", "apple", "premium", "5g"],
    specifications: {
      screen: "6.7-inch Super Retina XDR",
      storage: "512GB",
      camera: "48MP Pro camera system",
      battery: "Up to 29 hours video playback",
    },
  },
  {
    id: 4,
    name: "Samsung Galaxy S24 Ultra",
    description: "Ultra Experience with Galaxy AI",
    price: 1980.0,
    stock: 30,
    sku: "SGS24U-512-PHB",
    image:
      "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/s/s/ss-s24-ultra-xam-222.png",
    imageID: "products/galaxy_s24_ultra",
    brandId: 4,
    brandName: "Samsung",
    categoryId: 2,
    categoryName: "Smartphones",
    isActive: true,
    isFeatured: true,
    createdAt: "2024-01-15T10:30:00",
    updatedAt: "2024-01-15T10:30:00",
    deletedAt: null,
    rating: 4.7,
    reviewCount: 142,
    tags: ["smartphone", "samsung", "premium", "5g", "ai"],
    specifications: {
      screen: "6.8-inch Dynamic AMOLED 2X",
      storage: "512GB",
      camera: "200MP main camera",
      battery: "5000mAh",
    },
  },
  {
    id: 5,
    name: "MacBook Air M3 2024",
    description: "Portable Power with M3 chip",
    price: 2300.0,
    stock: 20,
    sku: "MBA13-M3-512-MID",
    image:
      "https://cdn2.cellphones.com.vn/x/media/catalog/product/m/b/mba13-m3-midnight-gallery1-202402_3_1_2_1.jpg",
    imageID: "products/macbook_air_m3",
    brandId: 3,
    brandName: "Apple",
    categoryId: 3,
    categoryName: "Laptops",
    isActive: true,
    isFeatured: true,
    createdAt: "2024-01-15T10:30:00",
    updatedAt: "2024-01-15T10:30:00",
    deletedAt: null,
    rating: 4.8,
    reviewCount: 67,
    tags: ["laptop", "apple", "ultrabook", "m3"],
    specifications: {
      screen: "13.6-inch Liquid Retina",
      storage: "512GB SSD",
      memory: "16GB unified memory",
      battery: "Up to 18 hours",
    },
  },
  {
    id: 6,
    name: "MSI RTX 4080 Gaming X Trio",
    description: "Next-Gen Gaming with Ray Tracing",
    price: 1199.99,
    stock: 25,
    sku: "MSI-RTX4080-GXT",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqlS36dI5Ny67GjZRUILs5cEr1Ky7IqUdhuw&s",
    imageID: "products/msi_rtx_4080",
    brandId: 4,
    brandName: "MSI",
    categoryId: 4,
    categoryName: "Graphics Cards",
    isActive: true,
    isFeatured: true,
    createdAt: "2024-01-15T10:30:00",
    updatedAt: "2024-01-15T10:30:00",
    deletedAt: null,
    rating: 4.9,
    reviewCount: 89,
    tags: ["gpu", "gaming", "ray-tracing", "4k"],
    specifications: {
      memory: "16GB GDDR6X",
      coreClock: "2205 MHz",
      memoryClock: "22400 MHz",
      interface: "PCIe 4.0 x16",
    },
  },
  {
    id: 7,
    name: "Dell XPS 13 Plus",
    description: "Premium Ultrabook for Professionals",
    price: 1899.99,
    stock: 30,
    sku: "DELL-XPS13-PLUS",
    image:
      "https://www.laptopvip.vn/images/ab__webp/detailed/40/xs9320nt-xnb-shot-5-2-gy-www.laptopvip.vn-1733279605.webp",
    imageID: "products/dell_xps_13",
    brandId: 5,
    brandName: "Dell",
    categoryId: 3,
    categoryName: "Laptops",
    isActive: true,
    isFeatured: false,
    createdAt: "2024-01-15T10:30:00",
    updatedAt: "2024-01-15T10:30:00",
    deletedAt: null,
    rating: 4.5,
    reviewCount: 124,
    tags: ["laptop", "ultrabook", "business", "premium"],
    specifications: {
      screen: "13.4-inch InfinityEdge",
      processor: "Intel Core i7-1360P",
      memory: "16GB LPDDR5",
      storage: "1TB SSD",
    },
  },
  {
    id: 8,
    name: "Sony WH-1000XM5",
    description: "Industry Leading Noise Canceling",
    price: 399.99,
    stock: 60,
    sku: "SONY-WH1000XM5",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTStTfIzKJ8PrAVOhtexLsJu1V3dhQqw1ygPw&s",
    imageID: "products/sony_wh1000xm5",
    brandId: 6,
    brandName: "Sony",
    categoryId: 5,
    categoryName: "Audio",
    isActive: true,
    isFeatured: true,
    createdAt: "2024-01-15T10:30:00",
    updatedAt: "2024-01-15T10:30:00",
    deletedAt: null,
    rating: 4.8,
    reviewCount: 312,
    tags: ["headphones", "noise-canceling", "wireless", "premium"],
    specifications: {
      driver: "30mm",
      battery: "30 hours",
      charging: "Quick charge 3 min = 3 hours",
      connectivity: "Bluetooth 5.2",
    },
  },
  {
    id: 9,
    name: "ASUS ROG Strix Z790-E",
    description: "Premium Gaming Motherboard",
    price: 499.99,
    stock: 40,
    sku: "ASUS-ROG-Z790E",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMA5P0l_xDwDngKgD_2AS2TNCQQmA1GnhE5A&s",
    imageID: "products/asus_rog_z790",
    brandId: 7,
    brandName: "ASUS",
    categoryId: 6,
    categoryName: "Motherboards",
    isActive: true,
    isFeatured: false,
    createdAt: "2024-01-15T10:30:00",
    updatedAt: "2024-01-15T10:30:00",
    deletedAt: null,
    rating: 4.7,
    reviewCount: 93,
    tags: ["motherboard", "gaming", "z790", "ddr5"],
    specifications: {
      socket: "LGA1700",
      chipset: "Intel Z790",
      memory: "DDR5-7200+ (OC)",
      slots: "4x DIMM, Max 128GB",
    },
  },
  {
    id: 10,
    name: "Corsair Vengeance LPX 32GB",
    description: "High Performance DDR4 Memory",
    price: 149.99,
    stock: 80,
    sku: "CORSAIR-LPX-32GB",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDqaCPouNc0UBhtQc2wqtKFz-zmdV-BsEUXA&s",
    imageID: "products/corsair_lpx_32gb",
    brandId: 8,
    brandName: "Corsair",
    categoryId: 7,
    categoryName: "Memory",
    isActive: true,
    isFeatured: false,
    createdAt: "2024-01-15T10:30:00",
    updatedAt: "2024-01-15T10:30:00",
    deletedAt: null,
    rating: 4.6,
    reviewCount: 167,
    tags: ["memory", "ddr4", "gaming", "overclocking"],
    specifications: {
      capacity: "32GB (2x16GB)",
      speed: "3200MHz",
      latency: "CL16",
      voltage: "1.35V",
    },
  },
  {
    id: 11,
    name: "iPhone 15 Pro Max",
    description: "Titanium. So strong. So light. So Pro.",
    price: 1199.99,
    stock: 35,
    sku: "IPHONE-15-PRO-MAX",
    image:
      "https://cdn.tgdd.vn/Products/Images/42/305658/iphone-15-pro-max-blue-thumbnew-200x200.jpg",
    imageID: "products/iphone_15_pro_max",
    brandId: 3,
    brandName: "Apple",
    categoryId: 2,
    categoryName: "Smartphones",
    isActive: true,
    isFeatured: true,
    createdAt: "2024-01-15T10:30:00",
    updatedAt: "2024-01-15T10:30:00",
    deletedAt: null,
    rating: 4.9,
    reviewCount: 89,
    tags: ["smartphone", "apple", "pro", "titanium", "5g"],
    specifications: {
      screen: "6.7-inch Super Retina XDR",
      chip: "A17 Pro chip",
      camera: "48MP Main camera",
      storage: "256GB",
    },
  },
  {
    id: 12,
    name: "Samsung 980 PRO SSD 2TB",
    description: "Maximum PCIe 4.0 Performance",
    price: 199.99,
    stock: 65,
    sku: "SAMSUNG-980PRO-2TB",
    image:
      "https://kccshop.vn/media/product/870-1.jpg",
    imageID: "products/samsung_980_pro",
    brandId: 9,
    brandName: "Samsung",
    categoryId: 8,
    categoryName: "Storage",
    isActive: true,
    isFeatured: false,
    createdAt: "2024-01-15T10:30:00",
    updatedAt: "2024-01-15T10:30:00",
    deletedAt: null,
    rating: 4.8,
    reviewCount: 245,
    tags: ["ssd", "nvme", "pcie4", "gaming"],
    specifications: {
      capacity: "2TB",
      interface: "PCIe 4.0 NVMe M.2",
      readSpeed: "7,000 MB/s",
      writeSpeed: "6,900 MB/s",
    },
  },
  {
    id: 13,
    name: "Logitech MX Master 3S",
    description: "Advanced Wireless Mouse for Creators",
    price: 99.99,
    stock: 90,
    sku: "LOGITECH-MX-MASTER-3S",
    image:
      "https://product.hstatic.net/200000320233/product/sao_0-005698__chuot_van_phong_logitech_mx_master_3_wireless__graphite__d848a8977fb9476f9c0beacb58992356_grande.png",
    imageID: "products/logitech_mx_master_3s",
    brandId: 10,
    brandName: "Logitech",
    categoryId: 9,
    categoryName: "Accessories",
    isActive: true,
    isFeatured: false,
    createdAt: "2024-01-15T10:30:00",
    updatedAt: "2024-01-15T10:30:00",
    deletedAt: null,
    rating: 4.7,
    reviewCount: 178,
    tags: ["mouse", "wireless", "productivity", "ergonomic"],
    specifications: {
      sensor: "8000 DPI Darkfield",
      battery: "70 days on full charge",
      connectivity: "USB-C, Bluetooth",
      buttons: "7 customizable buttons",
    },
  },
  {
    id: 14,
    name: "EVGA SuperNOVA 850W Gold",
    description: "Fully Modular 80+ Gold PSU",
    price: 149.99,
    stock: 55,
    sku: "EVGA-850W-GOLD",
    image:
      "https://www.evga.com/products/images/gallery/220-G5-0850-X1_XL_1.jpg",
    imageID: "products/evga_850w_gold",
    brandId: 11,
    brandName: "EVGA",
    categoryId: 10,
    categoryName: "Power Supply",
    isActive: true,
    isFeatured: false,
    createdAt: "2024-01-15T10:30:00",
    updatedAt: "2024-01-15T10:30:00",
    deletedAt: null,
    rating: 4.6,
    reviewCount: 156,
    tags: ["psu", "modular", "80plus-gold", "reliable"],
    specifications: {
      wattage: "850W",
      efficiency: "80+ Gold",
      modular: "Fully Modular",
      warranty: "10 Years",
    },
  },
  {
    id: 15,
    name: 'LG 27" 4K UltraFine Monitor',
    description: "Professional 4K Display with USB-C",
    price: 699.99,
    stock: 25,
    sku: "LG-27UP850-W",
    image:
      "https://hoanghamobile.com/tin-tuc/wp-content/uploads/2024/12/2-10.jpg",
    imageID: "products/lg_27_4k_monitor",
    brandId: 12,
    brandName: "LG",
    categoryId: 11,
    categoryName: "Monitors",
    isActive: true,
    isFeatured: true,
    createdAt: "2024-01-15T10:30:00",
    updatedAt: "2024-01-15T10:30:00",
    deletedAt: null,
    rating: 4.8,
    reviewCount: 94,
    tags: ["monitor", "4k", "usb-c", "professional"],
    specifications: {
      size: "27 inches",
      resolution: "3840 x 2160 (4K UHD)",
      panelType: "IPS",
      connectivity: "USB-C, HDMI, DisplayPort",
    },
  },
];

export const ProductProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);

  // Hàm lấy sản phẩm (sau này thay bằng gọi API)
  const refreshProducts = async () => {
    setIsLoading(true);
    setError(undefined);
    try {
      // TODO: fetch từ API thay cho seed
      // const response = await fetch("API_URL");
      // const data = await response.json();
      // setProducts(data.products);
      setProducts(SEED_PRODUCTS);
    } catch (e: any) {
      setError(e?.message || "Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshProducts();
  }, []);

  // Tìm sản phẩm theo id (hỗ trợ cả string và number để tương thích)
  const getProductById = (id: number | string) => {
    const numId = typeof id === "string" ? parseInt(id, 10) : id;
    return products.find((p) => p.id === numId);
  };

  // Tìm kiếm sản phẩm theo tên/mô tả/tags
  const searchProducts = (query: string) => {
    const q = query.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((tag) => tag.toLowerCase().includes(q)) ||
        p.brandName.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q)
    );
  };

  // Format giá để hiển thị
  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  // Lấy sản phẩm theo category
  const getProductsByCategory = (categoryId: number) => {
    return products.filter((p) => p.categoryId === categoryId);
  };

  // Lấy sản phẩm featured
  const getFeaturedProducts = () => {
    return products.filter((p) => p.isFeatured);
  };

  // Lấy sản phẩm theo brand
  const getProductsByBrand = (brandId: number) => {
    return products.filter((p) => p.brandId === brandId);
  };

  // Lấy sản phẩm theo khoảng giá
  const getProductsByPriceRange = (minPrice: number, maxPrice: number) => {
    return products.filter((p) => p.price >= minPrice && p.price <= maxPrice);
  };

  // Lấy danh sách categories duy nhất
  const getUniqueCategories = () => {
    const uniqueCategories = new Map();
    products.forEach((p) => {
      if (!uniqueCategories.has(p.categoryId)) {
        uniqueCategories.set(p.categoryId, {
          id: p.categoryId,
          name: p.categoryName,
        });
      }
    });
    return Array.from(uniqueCategories.values());
  };

  // Lấy danh sách brands duy nhất
  const getUniqueBrands = () => {
    const uniqueBrands = new Map();
    products.forEach((p) => {
      if (!uniqueBrands.has(p.brandId)) {
        uniqueBrands.set(p.brandId, { id: p.brandId, name: p.brandName });
      }
    });
    return Array.from(uniqueBrands.values());
  };

  // Lọc sản phẩm theo nhiều tiêu chí
  const filterProducts = (filters: ProductFilter) => {
    let filteredProducts = [...products];

    // Lọc theo category
    if (filters.categoryId) {
      filteredProducts = filteredProducts.filter(
        (p) => p.categoryId === filters.categoryId
      );
    }

    // Lọc theo brand
    if (filters.brandId) {
      filteredProducts = filteredProducts.filter(
        (p) => p.brandId === filters.brandId
      );
    }

    // Lọc theo khoảng giá
    if (filters.minPrice !== undefined) {
      filteredProducts = filteredProducts.filter(
        (p) => p.price >= filters.minPrice!
      );
    }
    if (filters.maxPrice !== undefined) {
      filteredProducts = filteredProducts.filter(
        (p) => p.price <= filters.maxPrice!
      );
    }

    // Lọc theo từ khóa tìm kiếm
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filteredProducts = filteredProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          p.brandName.toLowerCase().includes(query) ||
          p.categoryName.toLowerCase().includes(query)
      );
    }

    // Lọc theo tồn kho
    if (filters.inStock !== undefined) {
      filteredProducts = filteredProducts.filter((p) =>
        filters.inStock ? p.stock > 0 : p.stock === 0
      );
    }

    // Lọc theo featured
    if (filters.featured !== undefined) {
      filteredProducts = filteredProducts.filter(
        (p) => p.isFeatured === filters.featured
      );
    }

    return filteredProducts;
  };

  // Sắp xếp sản phẩm
  const sortProducts = (products: Product[], sortBy: SortOption) => {
    const sortedProducts = [...products];

    switch (sortBy) {
      case "name-asc":
        return sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
      case "name-desc":
        return sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
      case "price-asc":
        return sortedProducts.sort((a, b) => a.price - b.price);
      case "price-desc":
        return sortedProducts.sort((a, b) => b.price - a.price);
      case "rating-desc":
        return sortedProducts.sort((a, b) => b.rating - a.rating);
      case "newest":
        return sortedProducts.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      default:
        return sortedProducts;
    }
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        isLoading,
        error,
        refreshProducts,
        getProductById,
        searchProducts,
        formatPrice,
        getProductsByCategory,
        getFeaturedProducts,
        getProductsByBrand,
        getProductsByPriceRange,
        getUniqueCategories,
        getUniqueBrands,
        filterProducts,
        sortProducts,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

// Export formatPrice function để sử dụng độc lập
export const formatPrice = (price: number) => {
  return `$${price.toFixed(2)}`;
};

export const useProduct = () => {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error("useProduct must be used within ProductProvider");
  return ctx;
};
