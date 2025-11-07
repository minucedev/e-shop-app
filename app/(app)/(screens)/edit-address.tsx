import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { authApi, Address } from "@/services/authApi";

const ADDRESS_TYPES = ["HOME", "WORK", "OTHER"] as const;

const EditAddress = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    streetAddress: "",
    ward: "",
    district: "",
    city: "",
    postalCode: "70000",
    isDefault: false,
    addressType: "HOME" as "HOME" | "WORK" | "OTHER",
  });

  // Fetch addresses from API
  const fetchAddresses = async () => {
    if (!user) return;

    try {
      const response = await authApi.getUserAddresses(user.id);
      if (response.success && response.data) {
        setAddresses(response.data);
      }
    } catch (error: any) {
      console.error("Error fetching addresses:", error);
      Alert.alert("Error", "Failed to load addresses");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAddresses();
  };

  const resetForm = () => {
    setFormData({
      streetAddress: "",
      ward: "",
      district: "",
      city: "",
      postalCode: "70000",
      isDefault: false,
      addressType: "HOME",
    });
    setEditingAddress(null);
    setModalMode("add");
  };

  const openEditModal = (address: Address) => {
    setFormData({
      streetAddress: address.streetAddress,
      ward: address.ward,
      district: address.district,
      city: address.city,
      postalCode: address.postalCode,
      isDefault: address.isDefault,
      addressType: address.addressType,
    });
    setEditingAddress(address);
    setModalMode("edit");
    setShowModal(true);
  };

  const handleSaveAddress = async () => {
    if (!user) return;

    // Validate form
    if (
      !formData.streetAddress.trim() ||
      !formData.ward.trim() ||
      !formData.district.trim() ||
      !formData.city.trim()
    ) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsSaving(true);
    try {
      if (modalMode === "add") {
        // Check address limit for add mode
        if (addresses.length >= 3) {
          Alert.alert(
            "Address Limit Reached",
            "You can only have a maximum of 3 addresses. Please delete an existing address before adding a new one.",
            [{ text: "OK" }]
          );
          setIsSaving(false);
          return;
        }

        const response = await authApi.createAddress(user.id, formData);
        if (response.success && response.data) {
          setAddresses([response.data, ...addresses]);
          setShowModal(false);
          resetForm();
          Alert.alert("Success", "Address added successfully");
        } else {
          Alert.alert("Error", response.error || "Failed to add address");
        }
      } else {
        // Edit mode
        if (!editingAddress) return;

        const response = await authApi.updateAddress(
          user.id,
          editingAddress.id,
          formData
        );
        if (response.success && response.data) {
          // Update the address in the list
          setAddresses(
            addresses.map((addr) =>
              addr.id === editingAddress.id ? response.data! : addr
            )
          );
          setShowModal(false);
          resetForm();
          Alert.alert("Success", "Address updated successfully");
        } else {
          Alert.alert("Error", response.error || "Failed to update address");
        }
      }
    } catch (error: any) {
      console.error("Error saving address:", error);
      Alert.alert("Error", "Failed to save address");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAddress = async (address: Address) => {
    if (!user) return;

    // Không cho xóa nếu chỉ còn 1 địa chỉ
    if (addresses.length <= 1) {
      Alert.alert(
        "Cannot Delete",
        "You must have at least one address. Add another address before deleting this one.",
        [{ text: "OK" }]
      );
      return;
    }

    // Confirm deletion
    Alert.alert(
      "Delete Address",
      "Are you sure you want to delete this address?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await authApi.deleteAddress(user.id, address.id);
              if (response.success) {
                // Remove from list
                setAddresses(
                  addresses.filter((addr) => addr.id !== address.id)
                );
                Alert.alert("Success", "Address deleted successfully");
              } else {
                Alert.alert(
                  "Error",
                  response.error || "Failed to delete address"
                );
              }
            } catch (error: any) {
              console.error("Error deleting address:", error);
              Alert.alert("Error", "Failed to delete address");
            }
          },
        },
      ]
    );
  };

  const getAddressTypeIcon = (type: string) => {
    switch (type) {
      case "HOME":
        return "home-outline";
      case "WORK":
        return "briefcase-outline";
      default:
        return "location-outline";
    }
  };

  const getAddressTypeLabel = (type: string) => {
    switch (type) {
      case "HOME":
        return "Home";
      case "WORK":
        return "Work";
      default:
        return "Other";
    }
  };

  const formatAddress = (address: Address) => {
    return `${address.streetAddress}, ${address.ward}, ${address.district}, ${address.city} ${address.postalCode}`;
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#007AFF" />
        <Text className="mt-4 text-gray-600">Loading addresses...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-5 shadow-sm">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-black">
            Shipping Addresses
          </Text>
          <View className="w-10" />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="p-5">
          {addresses.length === 0 ? (
            <View className="items-center justify-center py-20">
              <Ionicons name="location-outline" size={64} color="#D1D5DB" />
              <Text className="text-gray-500 mt-4 text-center">
                No addresses yet
              </Text>
              <Text className="text-gray-400 text-sm mt-2 text-center">
                Add your first shipping address
              </Text>
            </View>
          ) : (
            addresses.map((address) => (
              <TouchableOpacity
                key={address.id}
                className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
                onPress={() => openEditModal(address)}
                activeOpacity={0.7}
              >
                {/* Header with label and default badge */}
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center mr-3">
                      <Ionicons
                        name={getAddressTypeIcon(address.addressType)}
                        size={20}
                        color="#007AFF"
                      />
                    </View>
                    <Text className="text-base font-semibold text-gray-900">
                      {getAddressTypeLabel(address.addressType)}
                    </Text>
                  </View>
                  {address.isDefault && (
                    <View className="bg-green-50 px-3 py-1 rounded-full">
                      <Text className="text-xs font-medium text-green-600">
                        Default
                      </Text>
                    </View>
                  )}
                </View>

                {/* Address details */}
                <View className="border-t border-gray-100 pt-3">
                  <Text className="text-gray-900 text-sm leading-5">
                    {formatAddress(address)}
                  </Text>
                </View>

                {/* Tap to edit hint */}
                <View className="flex-row items-center justify-center mt-3 pt-3 border-t border-gray-100">
                  <Text className="text-gray-400 text-xs ml-2">
                    Tap to edit
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Add New Address Button */}
      <View className="bg-white px-5 py-4 shadow-lg">
        <TouchableOpacity
          className="bg-blue-500 rounded-full py-4 items-center"
          onPress={() => {
            if (addresses.length >= 3) {
              Alert.alert(
                "Address Limit Reached",
                "You can only have a maximum of 3 addresses. Please delete an existing address before adding a new one.",
                [{ text: "OK" }]
              );
            } else {
              resetForm();
              setModalMode("add");
              setShowModal(true);
            }
          }}
        >
          <View className="flex-row items-center">
            <Ionicons name="add-circle-outline" size={24} color="white" />
            <Text className="text-white font-semibold text-base ml-2">
              Add New Address{" "}
              {addresses.length > 0 && `(${addresses.length}/3)`}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Add Address Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowModal(false);
          resetForm();
        }}
      >
        <View className="flex-1 justify-end bg-black/50">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ maxHeight: "90%" }}
          >
            <View className="bg-white rounded-t-3xl">
              {/* Modal Header */}
              <View className="flex-row items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
                <Text className="text-xl font-bold text-gray-900">
                  {modalMode === "add" ? "Add New Address" : "Edit Address"}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="w-8 h-8 items-center justify-center"
                >
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={true}
                contentContainerStyle={{
                  paddingHorizontal: 20,
                  paddingVertical: 20,
                }}
                keyboardShouldPersistTaps="handled"
              >
                {/* Street Address */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Street Address *
                  </Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900"
                    placeholder="e.g., 123 Nguyen Van Cu"
                    value={formData.streetAddress}
                    onChangeText={(text) =>
                      setFormData({ ...formData, streetAddress: text })
                    }
                  />
                </View>

                {/* Ward */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Ward *
                  </Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900"
                    placeholder="e.g., Phường 4"
                    value={formData.ward}
                    onChangeText={(text) =>
                      setFormData({ ...formData, ward: text })
                    }
                  />
                </View>

                {/* District */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    District *
                  </Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900"
                    placeholder="e.g., Quận 5"
                    value={formData.district}
                    onChangeText={(text) =>
                      setFormData({ ...formData, district: text })
                    }
                  />
                </View>

                {/* City */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    City *
                  </Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900"
                    placeholder="e.g., TP. Hồ Chí Minh"
                    value={formData.city}
                    onChangeText={(text) =>
                      setFormData({ ...formData, city: text })
                    }
                  />
                </View>

                {/* Address Type */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Address Type *
                  </Text>
                  <View className="flex-row">
                    {ADDRESS_TYPES.map((type) => (
                      <TouchableOpacity
                        key={type}
                        onPress={() =>
                          setFormData({ ...formData, addressType: type })
                        }
                        className={`flex-1 mr-2 py-3 rounded-xl border ${
                          formData.addressType === type
                            ? "bg-blue-500 border-blue-500"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <Text
                          className={`text-center font-medium ${
                            formData.addressType === type
                              ? "text-white"
                              : "text-gray-700"
                          }`}
                        >
                          {type}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Set as Default */}
                <TouchableOpacity
                  onPress={() =>
                    setFormData({ ...formData, isDefault: !formData.isDefault })
                  }
                  className="flex-row items-center mb-6"
                >
                  <View
                    className={`w-6 h-6 rounded border-2 items-center justify-center mr-3 ${
                      formData.isDefault
                        ? "bg-blue-500 border-blue-500"
                        : "border-gray-300"
                    }`}
                  >
                    {formData.isDefault && (
                      <Ionicons name="checkmark" size={16} color="white" />
                    )}
                  </View>
                  <Text className="text-base text-gray-700">
                    Set as default address
                  </Text>
                </TouchableOpacity>
              </ScrollView>

              {/* Action Buttons */}
              <View className="px-5 py-4 border-t border-gray-100">
                {modalMode === "edit" && editingAddress && (
                  <TouchableOpacity
                    onPress={() => {
                      setShowModal(false);
                      handleDeleteAddress(editingAddress);
                    }}
                    className="bg-red-50 rounded-xl py-3 items-center mb-3 border border-red-200"
                    disabled={isSaving}
                  >
                    <View className="flex-row items-center">
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color="#DC2626"
                      />
                      <Text className="text-red-600 font-semibold text-base ml-2">
                        Delete Address
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}

                <View className="flex-row">
                  <TouchableOpacity
                    onPress={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 bg-gray-100 rounded-xl py-4 items-center mr-2"
                    disabled={isSaving}
                  >
                    <Text className="text-gray-700 font-semibold text-base">
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSaveAddress}
                    className="flex-1 bg-blue-500 rounded-xl py-4 items-center ml-2"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text className="text-white font-semibold text-base">
                        {modalMode === "add" ? "Add Address" : "Save Changes"}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
};

export default EditAddress;
