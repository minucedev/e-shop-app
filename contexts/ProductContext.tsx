import React, { createContext, useContext, useEffect, useState } from "react";

// Định nghĩa kiểu sản phẩm
export type Product = {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
};

type ProductContextType = {
  products: Product[];
  isLoading: boolean;
  error?: string;
  refreshProducts: () => Promise<void>;
  getProductById: (id: string) => Product | undefined;
  searchProducts: (query: string) => Product[];
};

const ProductContext = createContext<ProductContextType | undefined>(undefined);

// Dữ liệu mẫu, sau này thay bằng fetch API
const SEED_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "AMD RYZEN 9",
    description: "Unleash Performance",
    price: "$299",
    image:
      "https://nguyencongpc.vn/media/product/250-27037-242872903-c_ryzen_9_9900x3d_3dpib.jpg",
  },
  {
    id: "2",
    name: "Intel Core i7 12700",
    description: "Beyond Limits",
    price: "$249",
    image:
      "https://product.hstatic.net/200000320233/product/i7_01bbf06595c041489008499b74309cd5_1024x1024.jpg",
  },
  {
    id: "3",
    name: "Intel Core i9 13900K",
    description: "Extreme Power",
    price: "$499",
    image:
      "https://product.hstatic.net/200000079075/product/19-118-412-v01_f37d9c13e2b04a8db475eff06f4a8eaa_master.jpg",
  },
  {
    id: "4",
    name: "AMD RYZEN 7 7800X3D",
    description: "Gaming Beast",
    price: "$399",
    image:
      "https://images-eu.ssl-images-amazon.com/images/I/51HqC0rU9HL._AC_UL210_SR210,210_.jpg",
  },
  {
    id: "5",
    name: "Intel Core i5 12600K",
    description: "Best Value",
    price: "$199",
    image:
      "https://product.hstatic.net/200000420363/product/1_8fa8f1867f0e4811a7f9e34deddc8e21_master.jpg",
  },
  {
    id: "6",
    name: "AMD RYZEN 5 7600X",
    description: "Efficient Performance",
    price: "$179",
    image:
      "https://product.hstatic.net/200000320233/product/221587605-d_ryzen5_7000_3dpibwof_front_pr.png_c583f96f588e4330bb0587cba78ff959_1024x1024.png",
  },
  {
    id: "7",
    name: "iPhone 17 Pro Max",
    description: "Pro Performance",
    price: "$1990",
    image:
      "https://cdn2.cellphones.com.vn/358x/media/catalog/product/i/p/iphone-17-pro-256-gb.png",
  },
  {
    id: "8",
    name: "Samsung Galaxy S24 Ultra",
    description: "Ultra Experience",
    price: "$1980",
    image:
      "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/s/s/ss-s24-ultra-xam-222.png",
  },
  {
    id: "9",
    name: "MacBook Air M3 2024",
    description: "Portable Power",
    price: "$2300",
    image:
      "https://cdn2.cellphones.com.vn/x/media/catalog/product/m/b/mba13-m3-midnight-gallery1-202402_3_1_2_1.jpg",
  },
  {
    id: "10",
    name: "NVIDIA RTX 4090",
    description: "Ultimate Graphics",
    price: "$1699",
    image:
      "https://www.nvidia.com/content/dam/en-us/geforce/news/geforce-rtx-4090-graphics-card/geforce-rtx-4090-3qtr-top-left.jpg",
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

  // Tìm sản phẩm theo id
  const getProductById = (id: string) => products.find((p) => p.id === id);

  // Tìm kiếm sản phẩm theo tên/mô tả
  const searchProducts = (query: string) => {
    const q = query.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
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
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProduct = () => {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error("useProduct must be used within ProductProvider");
  return ctx;
};
