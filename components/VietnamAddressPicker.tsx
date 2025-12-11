import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  Province,
  District,
  Ward,
  vietnamAddressApi,
} from "@/services/vietnamAddressApi";

interface VietnamAddressPickerProps {
  selectedProvince: string;
  selectedDistrict: string;
  selectedWard: string;
  onProvinceChange: (province: string, provinceCode: number) => void;
  onDistrictChange: (district: string, districtCode: number) => void;
  onWardChange: (ward: string, wardCode: number) => void;
}

type PickerMode = "province" | "district" | "ward" | null;

export const VietnamAddressPicker: React.FC<VietnamAddressPickerProps> = ({
  selectedProvince,
  selectedDistrict,
  selectedWard,
  onProvinceChange,
  onDistrictChange,
  onWardChange,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [pickerMode, setPickerMode] = useState<PickerMode>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Data lists
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  // Selected codes for fetching child data
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<
    number | null
  >(null);
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<
    number | null
  >(null);

  // Load provinces on mount
  useEffect(() => {
    loadProvinces();
  }, []);

  const loadProvinces = async () => {
    try {
      setIsLoading(true);
      console.log("🌏 Loading provinces...");
      const data = await vietnamAddressApi.getProvinces();
      console.log("✅ Provinces loaded:", data.length);
      setProvinces(data);
    } catch (error) {
      console.error("❌ Failed to load provinces:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDistricts = async (provinceCode: number) => {
    try {
      setIsLoading(true);
      const data = await vietnamAddressApi.getDistrictsByProvince(provinceCode);
      setDistricts(data);
    } catch (error) {
      console.error("Failed to load districts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadWards = async (districtCode: number) => {
    try {
      setIsLoading(true);
      const data = await vietnamAddressApi.getWardsByDistrict(districtCode);
      setWards(data);
    } catch (error) {
      console.error("Failed to load wards:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openPicker = (mode: PickerMode) => {
    setPickerMode(mode);
    setSearchQuery("");
    setModalVisible(true);

    // Load appropriate data
    if (mode === "district" && selectedProvinceCode) {
      loadDistricts(selectedProvinceCode);
    } else if (mode === "ward" && selectedDistrictCode) {
      loadWards(selectedDistrictCode);
    }
  };

  const handleSelect = (item: Province | District | Ward) => {
    console.log("📍 handleSelect called:", { pickerMode, item });

    if (pickerMode === "province") {
      const province = item as Province;
      console.log("🏙️ Province selected:", province.name, province.code);
      setSelectedProvinceCode(province.code);
      onProvinceChange(province.name, province.code);
      // Reset internal state for districts and wards
      setSelectedDistrictCode(null);
      setDistricts([]);
      setWards([]);
    } else if (pickerMode === "district") {
      const district = item as District;
      console.log("🏘️ District selected:", district.name, district.code);
      setSelectedDistrictCode(district.code);
      onDistrictChange(district.name, district.code);
      // Reset internal state for wards
      setWards([]);
    } else if (pickerMode === "ward") {
      const ward = item as Ward;
      console.log("🏠 Ward selected:", ward.name, ward.code);
      onWardChange(ward.name, ward.code);
    }
    setModalVisible(false);
  };

  const getTitle = () => {
    switch (pickerMode) {
      case "province":
        return "Chọn Tỉnh/Thành phố";
      case "district":
        return "Chọn Quận/Huyện";
      case "ward":
        return "Chọn Phường/Xã";
      default:
        return "";
    }
  };

  const getData = () => {
    switch (pickerMode) {
      case "province":
        return provinces;
      case "district":
        return districts;
      case "ward":
        return wards;
      default:
        return [];
    }
  };

  const getFilteredData = () => {
    const data = getData();
    if (!searchQuery.trim()) return data;

    return data.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const renderPickerField = (
    label: string,
    value: string,
    onPress: () => void,
    disabled: boolean = false
  ) => {
    return (
      <View className="mb-4">
        <Text className="text-gray-700 font-medium mb-2">{label}</Text>
        <TouchableOpacity
          onPress={onPress}
          disabled={disabled}
          className={`border rounded-xl px-4 py-3 flex-row items-center justify-between ${
            disabled ? "border-gray-200 bg-gray-50" : "border-gray-300 bg-white"
          }`}
        >
          <Text
            className={`flex-1 ${
              value ? "text-gray-900" : "text-gray-400"
            } text-base`}
          >
            {value || `Chọn ${label.toLowerCase()}`}
          </Text>
          <Ionicons
            name="chevron-down"
            size={20}
            color={disabled ? "#D1D5DB" : "#6B7280"}
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <>
      {/* Province Picker */}
      {renderPickerField("Tỉnh/Thành phố", selectedProvince, () =>
        openPicker("province")
      )}

      {/* District Picker */}
      {renderPickerField(
        "Quận/Huyện",
        selectedDistrict,
        () => openPicker("district"),
        !selectedProvince
      )}

      {/* Ward Picker */}
      {renderPickerField(
        "Phường/Xã",
        selectedWard,
        () => openPicker("ward"),
        !selectedDistrict
      )}

      {/* Picker Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl h-3/4">
            {/* Header */}
            <View className="flex-row items-center justify-between px-5 pt-5 pb-3 border-b border-gray-200">
              <Text className="text-lg font-bold text-gray-900">
                {getTitle()}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="w-8 h-8 items-center justify-center"
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View className="px-5 pt-3 pb-2">
              <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-2">
                <Ionicons name="search" size={20} color="#9CA3AF" />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Tìm kiếm..."
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 ml-2 text-gray-900"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery("")}>
                    <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* List */}
            {isLoading ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#3b82f6" />
              </View>
            ) : (
              <FlatList
                data={getFilteredData()}
                keyExtractor={(item) => item.code.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleSelect(item)}
                    className="px-5 py-4 border-b border-gray-100"
                  >
                    <Text className="text-gray-900 text-base">{item.name}</Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View className="py-10 items-center">
                    <Text className="text-gray-400">
                      Không tìm thấy kết quả
                    </Text>
                  </View>
                }
              />
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};
