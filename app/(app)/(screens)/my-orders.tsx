import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { OrderProvider, useOrders } from "@/contexts/OrderContext";
import { OrderCard } from "@/components/OrderCard";
import { Order } from "@/services/orderApi";

// Tab definitions
type TabKey = "processing" | "completed" | "cancelled";

interface Tab {
  key: TabKey;
  label: string;
  icon: string;
  statuses: string[];
}

const TABS: Tab[] = [
  {
    key: "processing",
    label: "Đang xử lý",
    icon: "time-outline",
    statuses: ["PENDING", "CONFIRMED"],
  },
  {
    key: "completed",
    label: "Hoàn thành",
    icon: "checkmark-done-outline",
    statuses: ["SHIPPING", "DELIVERED"],
  },
  {
    key: "cancelled",
    label: "Đã hủy",
    icon: "close-circle-outline",
    statuses: ["CANCELLED"],
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
  const [activeTab, setActiveTab] = useState<TabKey>("processing");

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

  // Filter orders based on active tab
  const filteredOrders = useMemo(() => {
    const currentTab = TABS.find((tab) => tab.key === activeTab);
    if (!currentTab) {
      return orders;
    }
    return orders.filter((order) => currentTab.statuses.includes(order.status));
  }, [orders, activeTab]);

  // Count orders for each tab
  const tabCounts = useMemo(() => {
    const counts: Record<TabKey, number> = {
      processing: 0,
      completed: 0,
      cancelled: 0,
    };

    orders.forEach((order) => {
      if (["PENDING", "CONFIRMED"].includes(order.status)) {
        counts.processing++;
      } else if (["SHIPPING", "DELIVERED"].includes(order.status)) {
        counts.completed++;
      } else if (order.status === "CANCELLED") {
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

  const renderTabBar = () => (
    <View className="bg-white border-b border-gray-200 px-4 py-3">
      <View className="flex-row justify-between">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const count = tabCounts[tab.key];

          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              className={`flex-1 mx-1 px-3 py-3 rounded-lg items-center ${
                isActive ? "bg-blue-600" : "bg-gray-100"
              }`}
              style={{ maxWidth: "32%" }}
            >
              <Ionicons
                name={tab.icon as any}
                size={20}
                color={isActive ? "#FFFFFF" : "#6B7280"}
              />
              <Text
                className={`mt-1 text-xs font-medium text-center ${
                  isActive ? "text-white" : "text-gray-700"
                }`}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
              {count > 0 && (
                <View
                  className={`mt-1 px-2 py-0.5 rounded-full ${
                    isActive ? "bg-white/20" : "bg-blue-100"
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      isActive ? "text-white" : "text-blue-700"
                    }`}
                  >
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

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

      {/* Tab Bar */}
      {renderTabBar()}

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
