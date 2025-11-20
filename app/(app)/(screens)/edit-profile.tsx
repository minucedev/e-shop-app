import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { getFullName } from "@/utils/userUtils";
import { validatePhone } from "@/utils/authUtils";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";

const EditProfile = () => {
  const { user, updateUser } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(
    user?.dateOfBirth ? new Date(user.dateOfBirth) : null
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  const handlePhoneChange = (text: string) => {
    setPhone(text);
    if (text.trim() && !validatePhone(text)) {
      setPhoneError("Invalid phone number. Please enter 10-11 digits");
    } else {
      setPhoneError("");
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setDateOfBirth(selectedDate);
    }
  };

  const formatDateForDisplay = (date: Date): string => {
    return date.toLocaleDateString("vi-VN");
  };

  const formatDateForAPI = (date: Date): string => {
    // Return ISO 8601 format with timezone (e.g., "2025-11-07T09:11:55.227Z")
    return date.toISOString();
  };

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert("Error", "Full name cannot be empty");
      return;
    }

    if (phone.trim() && !validatePhone(phone)) {
      Alert.alert("Error", "Invalid phone number");
      return;
    }

    setIsLoading(true);
    try {
      if (updateUser) {
        const updateData: any = {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim() || undefined,
        };

        // Chỉ gửi dateOfBirth nếu user đã có giá trị
        if (dateOfBirth) {
          updateData.dateOfBirth = formatDateForAPI(dateOfBirth);
        }

        await updateUser(updateData);
      }
      Alert.alert("Success", "Profile updated successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Unable to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <SafeAreaView className="flex-row items-center justify-between p-4 bg-white border-b border-gray-200" edges={['top']}>
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="arrow-back" size={24} color="#2563eb" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">
          Edit Profile
        </Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={isLoading}
          className={`px-4 py-2 rounded-lg ${isLoading ? "bg-gray-300" : "bg-blue-600"}`}
        >
          <Text
            className={`font-medium ${isLoading ? "text-gray-500" : "text-white"}`}
          >
            {isLoading ? "Saving..." : "Save"}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Avatar Section */}
      <View className="items-center py-6 bg-white border-b border-gray-100 mb-4">
        <View className="relative">
          <Image
            source={{ uri: "https://i.pravatar.cc/150?img=68" }}
            className="w-24 h-24 rounded-full"
          />
          <TouchableOpacity className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-blue-600 items-center justify-center">
            <Ionicons name="camera-outline" size={16} color="white" />
          </TouchableOpacity>
        </View>
        <Text className="text-sm text-gray-500 mt-2">Tap to change avatar</Text>
      </View>

      {/* Form Fields */}
      <View className="px-4 space-y-4">
        {/* First Name */}
        <View className="bg-white rounded-lg p-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            First Name *
          </Text>
          <TextInput
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Enter first name"
            className="text-base text-gray-900 border-b border-gray-200 py-2"
          />
        </View>

        {/* Last Name */}
        <View className="bg-white rounded-lg p-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Last Name *
          </Text>
          <TextInput
            value={lastName}
            onChangeText={setLastName}
            placeholder="Enter last name"
            className="text-base text-gray-900 border-b border-gray-200 py-2"
          />
        </View>

        {/* Email (Read Only) */}
        <View className="bg-white rounded-lg p-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">Email</Text>
          <Text className="text-base text-gray-500">
            {user?.email || "No email"}
          </Text>
          <Text className="text-xs text-gray-400 mt-1">
            Email cannot be changed
          </Text>
        </View>

        {/* Phone */}
        <View className="bg-white rounded-lg p-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </Text>
          <TextInput
            value={phone}
            onChangeText={handlePhoneChange}
            placeholder="0123456789"
            keyboardType="phone-pad"
            className={`text-base text-gray-900 border-b py-2 ${
              phoneError ? "border-red-500" : "border-gray-200"
            }`}
          />
          {phoneError ? (
            <Text className="text-red-500 text-xs mt-1">{phoneError}</Text>
          ) : null}
          <Text className="text-xs text-gray-400 mt-1">
            Format: 10-11 digits
          </Text>
        </View>

        {/* Date of Birth */}
        <View className="bg-white rounded-lg p-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Date of Birth
          </Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className="border-b border-gray-200 py-2"
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-base text-gray-900">
                {dateOfBirth ? formatDateForDisplay(dateOfBirth) : "Not set"}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#6b7280" />
            </View>
          </TouchableOpacity>
          <Text className="text-xs text-gray-400 mt-1">Tap to select date</Text>

          {showDatePicker && (
            <DateTimePicker
              value={dateOfBirth || new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleDateChange}
              maximumDate={new Date()}
              minimumDate={new Date(1900, 0, 1)}
            />
          )}
        </View>

        {/* User Info Display */}
        {/* <View className="bg-blue-50 rounded-lg p-4 mt-4">
          <Text className="text-sm font-medium text-blue-800 mb-2">
            Current Info:
          </Text>
          <Text className="text-sm text-blue-700">
            Name: {user ? getFullName(user) : "Not set"}
          </Text>
          <Text className="text-sm text-blue-700">
            Roles: {user?.roles.join(", ") || "No roles"}
          </Text>
          <Text className="text-sm text-blue-700">
            Status: {user?.isActive ? "Active" : "Inactive"}
          </Text>
        </View> */}
      </View>

      <View className="h-20" />
    </ScrollView>
  );
};

export default EditProfile;
