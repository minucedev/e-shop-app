import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { OrderProvider, useOrders } from "@/contexts/OrderContext";
import { OrderCard } from "@/components/OrderCard";
import { Order } from "@/services/orderApi";

// Filter options for dropdown
type FilterKey = "all" | "processing" | "shipping" | "completed" | "cancelled";

interface FilterOption {
  key: FilterKey;
  label: string;
  icon: string;
  statuses: string[]; // Empty array means show all
  description: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  {
    key: "all",
    label: "Tất cả đơn hàng",
    icon: "list-outline",
    statuses: [],
    description: "Hiển thị tất cả",
  },
  {
    key: "processing",
    label: "Đang xử lý",
    icon: "time-outline",
    statuses: ["PENDING", "CONFIRMED", "PROCESSING"],
    description: "Chờ xử lý, đã xác nhận, đang chuẩn bị",
  },
  {
    key: "shipping",
    label: "Đang giao hàng",
    icon: "car-outline",
    statuses: ["SHIPPING"],
    description: "Đang trên đường giao",
  },
  {
    key: "completed",
    label: "Đã hoàn thành",
    icon: "checkmark-done-outline",
    statuses: ["DELIVERED"],
    description: "Đã giao thành công",
  },
  {
    key: "cancelled",
    label: "Đã hủy / Trả hàng",
    icon: "close-circle-outline",
    statuses: ["CANCELLED", "RETURNED"],
    description: "Đơn hủy hoặc trả lại",
  },
];

const MyOrdersContent = () => {
  const {
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
  } = useOrders();

  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    loadAllOrders(); // Load all orders to get accurate counts
  }, [loadAllOrders]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshOrders();
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    // Disabled since we load all orders at once for accurate counts
    return;
  };

  // Filter orders based on active filter
  const filteredOrders = useMemo(() => {
    const currentFilter = FILTER_OPTIONS.find((filter) => filter.key === activeFilter);
    if (!currentFilter || currentFilter.statuses.length === 0) {
      return orders; // Show all orders
    }
    return orders.filter((order) => currentFilter.statuses.includes(order.status));
  }, [orders, activeFilter]);

  // Count orders for each filter
  const filterCounts = useMemo(() => {
    const counts: Record<FilterKey, number> = {
      all: 0,
      processing: 0,
      shipping: 0,
      completed: 0,
      cancelled: 0,
    };

    counts.all = orders.length;

    orders.forEach((order) => {
      if (["PENDING", "CONFIRMED", "PROCESSING"].includes(order.status)) {
        counts.processing++;
      } else if (order.status === "SHIPPING") {
        counts.shipping++;
      } else if (order.status === "DELIVERED") {
        counts.completed++;
      } else if (["CANCELLED", "RETURNED"].includes(order.status)) {
        counts.cancelled++;
      }
    });

    return counts;
  }, [orders]);

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-20">
      <Ionicons name="receipt-outline" size={80} color="#D1D5DB" />
      <Text className="text-gray-500 text-base mt-4">
        Bạn chưa có đơn hàng nào
      </Text>
      <TouchableOpacity
        className="mt-6 bg-blue-600 px-6 py-3 rounded-lg"
        onPress={() => router.push("/(app)/(tabs)/shop")}
      >
        <Text className="text-white font-semibold">Mua sắm ngay</Text>
      </TouchableOpacity>
    </View>
  );

  const renderError = () => (
    <View className="flex-1 items-center justify-center py-20">
      <Ionicons name="alert-circle-outline" size={80} color="#EF4444" />
      <Text className="text-gray-700 text-base mt-4 text-center px-6">
        {error}
      </Text>
      <TouchableOpacity
        className="mt-6 bg-blue-600 px-6 py-3 rounded-lg"
        onPress={() => loadAllOrders()}
      >
        <Text className="text-white font-semibold">Thử lại</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFilterDropdown = () => {
    const currentFilter = FILTER_OPTIONS.find((f) => f.key === activeFilter);
    const count = filterCounts[activeFilter];

    return (
      <View className="bg-white border-b border-gray-200">
        {/* Dropdown Header */}
        <TouchableOpacity
          onPress={() => setIsDropdownOpen(!isDropdownOpen)}
          className="px-4 py-3 flex-row items-center justify-between"
          activeOpacity={0.7}
        >
          <View className="flex-row items-center flex-1">
            <Ionicons
              name={currentFilter?.icon as any}
              size={20}
              color="#2563eb"
            />
            <View className="ml-3 flex-1">
              <Text className="text-base font-semibold text-gray-900">
                {currentFilter?.label}
              </Text>
              <Text className="text-xs text-gray-500 mt-0.5">
                {count} đơn hàng
              </Text>
            </View>
          </View>
          <Ionicons
            name={isDropdownOpen ? "chevron-up" : "chevron-down"}
            size={20}
            color="#6B7280"
          />
        </TouchableOpacity>

        {/* Dropdown Options */}
        {isDropdownOpen && (
          <View className="border-t border-gray-100">
            {FILTER_OPTIONS.map((option) => {
              const isSelected = activeFilter === option.key;
              const optionCount = filterCounts[option.key];

              return (
                <TouchableOpacity
                  key={option.key}
                  onPress={() => {
                    setActiveFilter(option.key);
                    setIsDropdownOpen(false);
                  }}
                  className={`px-4 py-3 flex-row items-center border-b border-gray-50 ${
                    isSelected ? "bg-blue-50" : "bg-white"
                  }`}
                  activeOpacity={0.7}
                >
                  <View
                    className={`w-10 h-10 rounded-full items-center justify-center ${
                      isSelected ? "bg-blue-100" : "bg-gray-100"
                    }`}
                  >
                    <Ionicons
                      name={option.icon as any}
                      size={18}
                      color={isSelected ? "#2563eb" : "#6B7280"}
                    />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text
                      className={`text-sm font-medium ${
                        isSelected ? "text-blue-700" : "text-gray-900"
                      }`}
                    >
                      {option.label}
                    </Text>
                    <Text className="text-xs text-gray-500 mt-0.5">
                      {option.description}
                    </Text>
                  </View>
                  <View
                    className={`px-2.5 py-1 rounded-full ${
                      isSelected ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        isSelected ? "text-white" : "text-gray-700"
                      }`}
                    >
                      {optionCount}
                    </Text>
                  </View>
                  {isSelected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#2563eb"
                      style={{ marginLeft: 8 }}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View className="py-4">
        <ActivityIndicator size="small" color="#2563EB" />
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Custom Header */}
      <View className="bg-white border-b border-gray-200">
        <SafeAreaView edges={["top"]}>
          <View className="flex-row items-center px-4 py-3">
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
              <Ionicons name="arrow-back" size={24} color="#2563eb" />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-gray-900 flex-1">
              Đơn hàng của tôi
            </Text>
            {/* Total Orders Badge */}
            {totalElements > 0 && (
              <View className="bg-blue-100 px-3 py-1.5 rounded-full">
                <Text className="text-sm font-bold text-blue-700">
                  {totalElements} đơn
                </Text>
              </View>
            )}
          </View>
        </SafeAreaView>
      </View>

      {/* Hide default Stack header */}
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* Filter Dropdown */}
      {renderFilterDropdown()}

      {/* Order List */}
      {error ? (
        renderError()
      ) : filteredOrders.length === 0 && !loading ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={({ item }) => <OrderCard order={item} />}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: 32,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#2563EB"
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={renderFooter}
        />
      )}

      {/* Initial Loading */}
      {loading && orders.length === 0 && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563EB" />
          <Text className="text-gray-500 mt-4">Đang tải đơn hàng...</Text>
        </View>
      )}
    </View>
  );
};

export default function MyOrders() {
  return (
    <OrderProvider>
      <MyOrdersContent />
    </OrderProvider>
  );
}
