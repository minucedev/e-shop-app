import React, { createContext, useContext, useState, useCallback } from "react";
import { orderApi, Order, OrderHistoryResponse } from "@/services/orderApi";

interface OrderContextType {
  orders: Order[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
  loading: boolean;
  error: string | null;
  fetchOrders: (page?: number) => Promise<void>;
  loadMoreOrders: () => Promise<void>;
  loadAllOrders: () => Promise<void>;
  refreshOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async (page: number = 0) => {
    try {
      setLoading(true);
      setError(null);
      const response = await orderApi.getOrderHistory(page, 10);

      if (response.success && response.data) {
        if (page === 0) {
          // First page - replace all orders
          setOrders(response.data.content);
        } else {
          // Subsequent pages - append to existing orders
          setOrders((prevOrders) => [...prevOrders, ...response.data!.content]);
        }
        setCurrentPage(response.data.page.number);
        setTotalPages(response.data.page.totalPages);
        setTotalElements(response.data.page.totalElements);
      } else {
        setError(response.message || "Không thể tải danh sách đơn hàng");
      }
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi khi tải đơn hàng");
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMoreOrders = useCallback(async () => {
    if (loading || currentPage >= totalPages - 1) return;
    await fetchOrders(currentPage + 1);
  }, [fetchOrders, loading, currentPage, totalPages]);

  // Load all orders for accurate counts (good for small datasets like school projects)
  const loadAllOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // First, get first page to know total pages
      const firstResponse = await orderApi.getOrderHistory(0, 10);
      if (!firstResponse.success || !firstResponse.data) {
        setError(firstResponse.message || "Không thể tải danh sách đơn hàng");
        return;
      }

      let allOrders = [...firstResponse.data.content];
      const totalPages = firstResponse.data.page.totalPages;

      // If there are more pages, fetch them all
      if (totalPages > 1) {
        const promises = [];
        for (let page = 1; page < totalPages; page++) {
          promises.push(orderApi.getOrderHistory(page, 10));
        }

        const responses = await Promise.all(promises);

        responses.forEach((response) => {
          if (response.success && response.data) {
            allOrders = [...allOrders, ...response.data.content];
          }
        });
      }

      setOrders(allOrders);
      setCurrentPage(totalPages - 1);
      setTotalPages(firstResponse.data.page.totalPages);
      setTotalElements(firstResponse.data.page.totalElements);
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi khi tải đơn hàng");
      console.error("Error loading all orders:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshOrders = useCallback(async () => {
    await loadAllOrders();
  }, [loadAllOrders]);
  return (
    <OrderContext.Provider
      value={{
        orders,
        currentPage,
        totalPages,
        totalElements,
        loading,
        error,
        fetchOrders,
        loadMoreOrders,
        loadAllOrders,
        refreshOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error("useOrders must be used within an OrderProvider");
  }
  return context;
};
