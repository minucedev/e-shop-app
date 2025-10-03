import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

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

  // Modal open for add/edit
  const openModal = (type: "add" | "edit", address?: any) => {
    setModalType(type);
    setFormError("");
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
        {/* Header - giống edit-profile */}
        <View
          className="flex-row items-center justify-center mt-8 mb-4 px-6 relative"
          style={{ minHeight: 56 }}
        >
          <TouchableOpacity
            className="bg-gray-100 rounded-full p-2"
            onPress={() => router.back()}
            style={{ position: "absolute", left: 16, zIndex: 1 }}
          >
            <Ionicons name="arrow-back" size={28} color="#007AFF" />
          </TouchableOpacity>
          <Text className="flex-1 text-2xl font-bold text-center text-[#222]">
            Edit Address
          </Text>
        </View>

        <View className="flex-1 bg-white px-6 pt-4 items-center">
          {/* Add Address Button */}
          <View className="w-full mb-6">
            <TouchableOpacity
              className="flex-row items-center justify-center bg-blue-500 rounded-xl py-3"
              onPress={() => openModal("add")}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text className="text-white text-base font-semibold ml-2">
                Add Address
              </Text>
            </TouchableOpacity>
          </View>

          {/* Address List */}
          <View className="w-full">
            {addresses.length === 0 ? (
              <Text className="text-gray-500 text-center mt-10">
                You have no addresses. Please add a new address.
              </Text>
            ) : (
              addresses
                .sort((a, b) => (a.isDefault ? -1 : 1))
                .map((addr) => (
                  <View
                    key={addr.id}
                    className="bg-gray-50 rounded-xl p-4 mb-3 flex-row items-center border border-gray-200"
                  >
                    {/* Radio chọn mặc định */}
                    <TouchableOpacity
                      className="mr-3"
                      onPress={() => handleSetDefault(addr.id)}
                      disabled={addr.isDefault}
                    >
                      <Ionicons
                        name={
                          addr.isDefault
                            ? "radio-button-on"
                            : "radio-button-off"
                        }
                        size={22}
                        color={addr.isDefault ? "#007AFF" : "#bbb"}
                      />
                    </TouchableOpacity>
                    {/* Thông tin địa chỉ */}
                    <View className="flex-1">
                      <Text className="font-semibold text-base">
                        {addr.name} ({addr.label})
                      </Text>
                      <Text className="text-gray-700 text-sm">
                        {addr.phone}
                      </Text>
                      <Text className="text-gray-700 text-sm">
                        {addr.address}
                      </Text>
                      {addr.isDefault && (
                        <Text className="text-xs text-blue-500 font-semibold mt-1">
                          Default Address
                        </Text>
                      )}
                    </View>
                    {/* Sửa (nằm trong hộp) */}
                    <TouchableOpacity
                      className="ml-2 bg-gray-200 p-2 rounded-full"
                      onPress={() => openModal("edit", addr)}
                    >
                      <Ionicons name="pencil" size={18} color="#007AFF" />
                    </TouchableOpacity>
                    {/* Xoá (nằm trong hộp, chỉ hiện khi >1 địa chỉ) */}
                    {addresses.length > 1 && (
                      <TouchableOpacity
                        className="ml-2 bg-red-100 p-2 rounded-full"
                        onPress={() => handleDelete(addr.id)}
                      >
                        <Ionicons name="trash" size={18} color="#FF3B30" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))
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
            <TextInput
              className="border border-gray-200 rounded-lg px-4 py-3 text-base bg-gray-50 text-gray-900 mb-2"
              placeholder="Address"
              value={form.address}
              onChangeText={(text) => setForm({ ...form, address: text })}
              multiline
            />
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
                onPress={() => setShowModal(false)}
              >
                <Text className="text-gray-600 font-medium text-base">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-3 rounded-lg bg-green-500 items-center"
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
