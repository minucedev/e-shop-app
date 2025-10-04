import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// Types for address suggestions
interface AddressSuggestion {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

// Dummy data for demo
const initialAddresses = [
  {
    id: "1",
    name: "Nguyen Van A",
    phone: "0912345678",
    address: "123 Đường ABC, Quận 1, TP.HCM",
    label: "Home",
    isDefault: true,
  },
  {
    id: "2",
    name: "Tran Thi B",
    phone: "0987654321",
    address: "456 Đường XYZ, Quận 3, TP.HCM",
    label: "Work",
    isDefault: false,
  },
];

const LABELS = ["Home", "Work", "Other"];

// Debounce function
const useDebounce = (callback: Function, delay: number) => {
  const [debounceTimer, setDebounceTimer] = useState<any>(null);

  const debouncedCallback = useCallback(
    (...args: any[]) => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      const newTimer = setTimeout(() => callback(...args), delay);
      setDebounceTimer(newTimer);
    },
    [callback, delay, debounceTimer]
  );

  return debouncedCallback;
};

// Address search API function with better error handling
const searchAddresses = async (query: string): Promise<AddressSuggestion[]> => {
  if (query.length < 3) return [];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(query + ", Vietnam")}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "User-Agent": "EShopApp/1.0",
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    // Check if response is OK
    if (!response.ok) {
      console.error(`API Error: ${response.status} - ${response.statusText}`);
      return [];
    }

    // Check content type
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error("API returned non-JSON response:", contentType);
      return [];
    }

    const data = await response.json();

    // Validate response structure
    if (!Array.isArray(data)) {
      console.error("API response is not an array:", data);
      return [];
    }

    return data
      .map((item: any) => ({
        place_id: item.place_id || Date.now() + Math.random(),
        display_name: item.display_name || "Unknown location",
        lat: item.lat || "0",
        lon: item.lon || "0",
      }))
      .filter((item) => item.display_name !== "Unknown location");
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.error("Address search timeout");
    } else {
      console.error("Address search error:", error.message || error);
    }
    return [];
  }
};

const EditAddress = () => {
  const router = useRouter();
  const [addresses, setAddresses] = useState(initialAddresses);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"add" | "edit">("add");
  const [selectedAddress, setSelectedAddress] = useState<any>(null);

  // Form state
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    label: LABELS[0],
  });
  const [formError, setFormError] = useState("");

  // Address autocomplete states
  const [addressSuggestions, setAddressSuggestions] = useState<
    AddressSuggestion[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  // Debounced search for addresses with fallback
  const debouncedSearch = useDebounce(async (query: string) => {
    if (query.length < 3) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      setIsSearching(false);
      setSearchError("");
      return;
    }

    setIsSearching(true);
    setSearchError("");

    const suggestions = await searchAddresses(query);

    if (suggestions.length === 0 && query.length >= 3) {
      // Fallback: Create local suggestions for common Vietnam locations
      const fallbackSuggestions = getFallbackSuggestions(query);
      setAddressSuggestions(fallbackSuggestions);
      setShowSuggestions(fallbackSuggestions.length > 0);

      if (fallbackSuggestions.length === 0) {
        setSearchError("No addresses found. Please enter manually.");
      }
    } else {
      setAddressSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    }

    setIsSearching(false);
  }, 500);

  // Fallback suggestions for common Vietnam locations
  const getFallbackSuggestions = (query: string): AddressSuggestion[] => {
    const commonAreas = [
      "Quận 1, TP.HCM",
      "Quận 3, TP.HCM",
      "Quận 7, TP.HCM",
      "Quận Bình Thạnh, TP.HCM",
      "Quận Tân Bình, TP.HCM",
      "Ba Đình, Hà Nội",
      "Hoàn Kiếm, Hà Nội",
      "Cầu Giấy, Hà Nội",
      "Thanh Xuân, Hà Nội",
      "Hai Bà Trưng, Hà Nội",
    ];

    return commonAreas
      .filter(
        (area) =>
          area.toLowerCase().includes(query.toLowerCase()) ||
          query.toLowerCase().includes(area.split(",")[0].toLowerCase())
      )
      .slice(0, 3)
      .map((area, index) => ({
        place_id: Date.now() + index,
        display_name: `${query}, ${area}, Vietnam`,
        lat: "10.8231",
        lon: "106.6297",
      }));
  };

  // Handle address input change
  const handleAddressChange = (text: string) => {
    setForm({ ...form, address: text });
    debouncedSearch(text);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: AddressSuggestion) => {
    setForm({ ...form, address: suggestion.display_name });
    setShowSuggestions(false);
    setAddressSuggestions([]);
    setSearchError("");
  };

  // Modal open for add/edit
  const openModal = (type: "add" | "edit", address?: any) => {
    setModalType(type);
    setFormError("");
    setShowSuggestions(false);
    setAddressSuggestions([]);
    if (type === "edit" && address) {
      setForm({
        name: address.name,
        phone: address.phone,
        address: address.address,
        label: address.label,
      });
      setSelectedAddress(address);
    } else {
      setForm({
        name: "",
        phone: "",
        address: "",
        label: LABELS[0],
      });
      setSelectedAddress(null);
    }
    setShowModal(true);
  };

  // Validate form
  const validateForm = () => {
    if (!form.name.trim() || form.name.trim().length < 2)
      return "Name must be at least 2 characters.";
    if (!/^\d{10,11}$/.test(form.phone)) return "Phone must be 10-11 digits.";
    if (!form.address.trim()) return "Address is required.";
    if (!LABELS.includes(form.label)) return "Please select a label.";
    return "";
  };

  // Save address (add or edit)
  const handleSave = () => {
    const error = validateForm();
    if (error) {
      setFormError(error);
      return;
    }
    if (modalType === "add") {
      setAddresses([
        {
          ...form,
          id: Date.now().toString(),
          isDefault: addresses.length === 0,
        },
        ...addresses,
      ]);
    } else if (modalType === "edit" && selectedAddress) {
      setAddresses(
        addresses.map((addr) =>
          addr.id === selectedAddress.id ? { ...addr, ...form } : addr
        )
      );
    }
    setShowSuggestions(false);
    setAddressSuggestions([]);
    setShowModal(false);
  };

  // Set default address
  const handleSetDefault = (id: string) => {
    if (addresses.find((addr) => addr.id === id)?.isDefault) return;
    Alert.alert("Confirm", "Set this address as default?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Yes",
        onPress: () => {
          setAddresses(
            addresses.map((addr) => ({
              ...addr,
              isDefault: addr.id === id,
            }))
          );
        },
      },
    ]);
  };

  // Delete address
  const handleDelete = (id: string) => {
    if (addresses.length === 1) return;
    Alert.alert("Confirm", "Are you sure you want to delete this address?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setAddresses(addresses.filter((addr) => addr.id !== id));
        },
      },
    ]);
  };

  return (
    <>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-900">Addresses</Text>
          <TouchableOpacity className="p-2">
            {/* <Ionicons name="ellipsis-vertical" size={24} color="#374151" /> */}
          </TouchableOpacity>
        </View>

        <View className="flex-1 bg-gray-50 px-4 pt-4">
          {/* Add New Address Button */}
          <View className="mb-4">
            <TouchableOpacity
              className="flex-row items-center bg-white border border-blue-500 rounded-lg py-3 px-4"
              onPress={() => openModal("add")}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={20} color="#3b82f6" />
              <Text className="text-blue-500 text-base font-medium ml-3">
                Add New Address
              </Text>
            </TouchableOpacity>
          </View>

          {/* Address List */}
          <View className="w-full">
            {addresses.length === 0 ? (
              <View className="bg-white rounded-xl p-8 items-center shadow-sm">
                <Ionicons name="location-outline" size={48} color="#9ca3af" />
                <Text className="text-gray-500 text-center mt-4 text-base">
                  No addresses found
                </Text>
                <Text className="text-gray-400 text-center mt-2 text-sm">
                  Add your first address to get started
                </Text>
              </View>
            ) : (
              addresses
                .sort((a, b) => (a.isDefault ? -1 : 1))
                .map((addr) => {
                  const getIconForLabel = (label: string) => {
                    switch (label.toLowerCase()) {
                      case "home":
                        return "home";
                      case "work":
                        return "business";
                      case "office":
                        return "business";
                      default:
                        return "location";
                    }
                  };

                  return (
                    <View
                      key={addr.id}
                      className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-100"
                    >
                      {/* Header with icon, label and checkbox */}
                      <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center">
                          <View className="w-8 h-8 rounded-full bg-blue-50 items-center justify-center mr-3">
                            <Ionicons
                              name={getIconForLabel(addr.label)}
                              size={16}
                              color="#3b82f6"
                            />
                          </View>
                          <Text
                            className={`text-base font-semibold ${
                              addr.isDefault ? "text-blue-600" : "text-gray-900"
                            }`}
                          >
                            {addr.label}
                          </Text>
                        </View>

                        {/* Checkbox */}
                        <TouchableOpacity
                          onPress={() => handleSetDefault(addr.id)}
                          disabled={addr.isDefault}
                        >
                          <View
                            className={`w-6 h-6 rounded border-2 items-center justify-center ${
                              addr.isDefault
                                ? "bg-blue-500 border-blue-500"
                                : "border-gray-300"
                            }`}
                          >
                            {addr.isDefault && (
                              <Ionicons
                                name="checkmark"
                                size={14}
                                color="white"
                              />
                            )}
                          </View>
                        </TouchableOpacity>
                      </View>

                      {/* Address details */}
                      <View className="mb-3">
                        <Text className="text-gray-900 text-sm font-medium mb-1">
                          {addr.address}
                        </Text>
                        <Text className="text-gray-600 text-sm">
                          {addr.phone}
                        </Text>
                      </View>

                      {/* Action buttons */}
                      <View className="flex-row items-center justify-between">
                        <TouchableOpacity
                          className="flex-row items-center"
                          onPress={() => {
                            // TODO: Implement view on map
                            Alert.alert(
                              "View on Map",
                              "Map feature coming soon!"
                            );
                          }}
                        >
                          <Text className="text-blue-500 text-sm font-medium">
                            View on map
                          </Text>
                        </TouchableOpacity>

                        <View className="flex-row items-center">
                          {/* Edit button */}
                          <TouchableOpacity
                            className="p-2"
                            onPress={() => openModal("edit", addr)}
                          >
                            <Ionicons
                              name="pencil-outline"
                              size={16}
                              color="#6b7280"
                            />
                          </TouchableOpacity>

                          {/* More options */}
                          <TouchableOpacity
                            className="p-2 ml-1"
                            onPress={() => {
                              if (addresses.length > 1) {
                                Alert.alert(
                                  "Address Options",
                                  "Choose an action",
                                  [
                                    { text: "Cancel", style: "cancel" },
                                    {
                                      text: "Delete",
                                      style: "destructive",
                                      onPress: () => handleDelete(addr.id),
                                    },
                                  ]
                                );
                              }
                            }}
                          >
                            <Ionicons
                              name="ellipsis-horizontal"
                              size={16}
                              color="#6b7280"
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  );
                })
            )}
          </View>
        </View>
      </ScrollView>

      {/* Modal Thêm/Sửa Địa Chỉ */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View className="flex-1 bg-black/40 justify-center items-center">
          <View className="bg-white p-6 rounded-xl w-[92%] max-w-[400px]">
            <Text className="text-lg font-bold text-center mb-4">
              {modalType === "add" ? "Add Address" : "Edit Address"}
            </Text>
            <TextInput
              className="border border-gray-200 rounded-lg px-4 py-3 text-base bg-gray-50 text-gray-900 mb-2"
              placeholder="Name"
              value={form.name}
              onChangeText={(text) => setForm({ ...form, name: text })}
            />
            <TextInput
              className="border border-gray-200 rounded-lg px-4 py-3 text-base bg-gray-50 text-gray-900 mb-2"
              placeholder="Phone"
              value={form.phone}
              onChangeText={(text) => setForm({ ...form, phone: text })}
              keyboardType="phone-pad"
            />
            {/* Address Input with Autocomplete */}
            <View className="mb-2 relative">
              <View className="flex-row items-center">
                <TextInput
                  className="flex-1 border border-gray-200 rounded-lg px-4 py-3 text-base bg-gray-50 text-gray-900"
                  placeholder="Enter address to search..."
                  value={form.address}
                  onChangeText={handleAddressChange}
                  multiline={false}
                />
                {isSearching && (
                  <ActivityIndicator
                    size="small"
                    color="#2563eb"
                    style={{ position: "absolute", right: 12 }}
                  />
                )}
              </View>

              {/* Search Error Message */}
              {searchError && !isSearching && (
                <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-1">
                  <View className="flex-row items-center">
                    <Ionicons
                      name="warning-outline"
                      size={16}
                      color="#d97706"
                    />
                    <Text className="text-sm text-yellow-700 ml-2 flex-1">
                      {searchError}
                    </Text>
                  </View>
                </View>
              )}

              {/* Address Suggestions */}
              {showSuggestions && addressSuggestions.length > 0 && (
                <View className="border border-gray-200 rounded-lg bg-white mt-1 max-h-48">
                  <FlatList
                    data={addressSuggestions}
                    keyExtractor={(item) => item.place_id.toString()}
                    nestedScrollEnabled
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        className="p-3 border-b border-gray-100"
                        onPress={() => handleSuggestionSelect(item)}
                      >
                        <View className="flex-row items-start">
                          <Ionicons
                            name="location-outline"
                            size={16}
                            color="#6b7280"
                            style={{ marginTop: 2, marginRight: 8 }}
                          />
                          <Text
                            className="text-sm text-gray-700 flex-1"
                            numberOfLines={2}
                          >
                            {item.display_name}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              )}
            </View>
            {/* Label chọn nhãn */}
            <View className="flex-row mb-2">
              {LABELS.map((label) => (
                <TouchableOpacity
                  key={label}
                  className={`px-3 py-1 rounded-full mr-2 border ${
                    form.label === label
                      ? "bg-blue-500 border-blue-500"
                      : "bg-gray-100 border-gray-200"
                  }`}
                  onPress={() => setForm({ ...form, label })}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      form.label === label ? "text-white" : "text-gray-700"
                    }`}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {formError ? (
              <Text className="text-red-500 text-sm mb-2">{formError}</Text>
            ) : null}
            <View className="flex-row justify-between mt-2 space-x-4">
              <TouchableOpacity
                className="flex-1 py-3 rounded-lg bg-gray-100 items-center"
                onPress={() => {
                  setShowSuggestions(false);
                  setAddressSuggestions([]);
                  setShowModal(false);
                }}
              >
                <Text className="text-gray-600 font-medium text-base">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-3 rounded-lg bg-blue-500 items-center"
                onPress={handleSave}
              >
                <Text className="text-white font-bold text-base">
                  {modalType === "add" ? "Add" : "Save"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default EditAddress;
