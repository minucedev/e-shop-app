import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  Modal,
  Platform,
} from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";

const validateName = (name: string) => {
  if (!name.trim()) return "Name is required.";
  if (name.trim().length < 2) return "Name must be at least 2 characters.";
  return "";
};

const validatePhone = (phone: string) => {
  if (!phone.trim()) return "Phone is required.";
  if (!/^\d{10,11}$/.test(phone)) return "Phone must be 10-11 digits.";
  return "";
};

const validateDateOfBirth = (date: string) => {
  if (!date) return "Date of birth is required.";
  const dob = new Date(date);
  // Check if the date is valid
  if (isNaN(dob.getTime())) {
    return "Invalid date format.";
  }
  const eighteenYearsAgo = new Date();
  eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
  if (dob > eighteenYearsAgo) {
    return "You must be at least 18 years old.";
  }
  return "";
};

const EditProfile = () => {
  const { user, updateUser } = useAuth();
  const router = useRouter();

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");

  // Modal edit state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editField, setEditField] = useState<"" | "name" | "phone">("");
  const [editLabel, setEditLabel] = useState("");
  const [editValue, setEditValue] = useState("");
  const [editError, setEditError] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Password modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets[0].uri) {
      const newAvatarUri = result.assets[0].uri;
      Alert.alert("Confirm", "Do you want to change your avatar?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          onPress: async () => {
            try {
              if (updateUser) {
                await updateUser({ avatar: newAvatarUri });
              }
              setAvatar(newAvatarUri);
              Alert.alert("Success", "Avatar updated successfully!");
            } catch (e) {
              Alert.alert("Error", "Failed to update avatar.");
            }
          },
        },
      ]);
    }
  };

  const handleEditIconPress = (
    field: "name" | "phone" | "dateOfBirth",
    label: string,
    value: string
  ) => {
    setEditLabel(label);
    setEditValue(value);
    setEditError("");
    if (field === "dateOfBirth") {
      setShowDatePicker(true);
    } else {
      setEditField(field);
      setShowEditModal(true);
    }
  };

  const handleEditModalSave = () => {
    let error = "";
    if (editField === "name") error = validateName(editValue);
    if (editField === "phone") error = validatePhone(editValue);

    if (error) {
      setEditError(error);
      return;
    }

    Alert.alert(
      "Confirm",
      `Do you want to change your ${editLabel.toLowerCase()}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          onPress: async () => {
            try {
              if (updateUser) {
                await updateUser({ [editField]: editValue });
              }
              if (editField === "name") setName(editValue);
              if (editField === "phone") setPhone(editValue);
              setShowEditModal(false);
              Alert.alert("Success", `${editLabel} updated successfully!`);
            } catch (e) {
              setEditError("Failed to update field.");
            }
          },
        },
      ]
    );
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (event.type === "dismissed" || !selectedDate) return;

    // Format date to YYYY-MM-DD manually
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    const newDate = `${year}-${month}-${day}`;

    const error = validateDateOfBirth(newDate);
    if (error) {
      Alert.alert("Invalid Date", error);
      return;
    }

    Alert.alert("Confirm", "Do you want to change your date of birth?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Yes",
        onPress: async () => {
          try {
            if (updateUser) {
              await updateUser({ dateOfBirth: newDate });
            }
            setDateOfBirth(newDate);
            Alert.alert("Success", "Date of birth updated successfully!");
          } catch (e) {
            Alert.alert("Error", "Failed to update date of birth.");
          }
        },
      },
    ]);
  };

  const handleChangePasswordPress = () => {
    Alert.alert("Change Password", "Do you want to change your password?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Yes",
        onPress: () => setShowPasswordModal(true),
      },
    ]);
  };

  const handlePasswordChange = async () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert("Validation", "Please fill in both password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Validation", "Passwords do not match.");
      return;
    }
    if (newPassword === user?.password) {
      Alert.alert(
        "Validation",
        "New password must be different from the old password."
      );
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Validation", "Password must be at least 6 characters.");
      return;
    }

    if (user && updateUser) {
      await updateUser({
        password: newPassword,
      });
      Alert.alert("Success", "Password changed successfully!");
      setShowPasswordModal(false);
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const FieldRow = ({
    label,
    value,
    field,
    editable = true,
  }: {
    label: string;
    value: string;
    field: "name" | "phone" | "dateOfBirth" | "email";
    editable?: boolean;
  }) => (
    <View>
      <Text className="text-base text-gray-500 mb-1 mt-4">{label}</Text>
      <View className="relative">
        <TextInput
          className={`border border-gray-200 rounded-lg px-4 py-3 pr-12 text-base bg-gray-50 text-gray-900 ${!editable ? "opacity-70" : ""}`}
          value={value}
          editable={false}
        />
        {editable && (
          <TouchableOpacity
            className="absolute right-3 top-1/2 -translate-y-1/2"
            onPress={() => handleEditIconPress(field as any, label, value)}
          >
            <Ionicons name="pencil" size={20} color="#bbb" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="bg-gray-50"
      >
        {/* Header */}
        <View className="flex-row items-center justify-center p-4 bg-white border-b border-gray-200 relative">
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute left-4 p-2"
          >
            <Ionicons name="arrow-back" size={24} color="#2563eb" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-900">
            Edit Profile
          </Text>
        </View>

        <View className="flex-1 bg-gray-50 px-6 pt-4 items-center">
          {/* Avatar */}
          <TouchableOpacity
            className="mb-8 relative"
            onPress={pickAvatar}
            activeOpacity={0.8}
          >
            <Image
              source={{ uri: avatar || "https://i.pravatar.cc/150?img=68" }}
              className="w-28 h-28 rounded-full bg-gray-200"
            />
            <View className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2 border border-white">
              <Ionicons name="camera" size={22} color="#fff" />
            </View>
          </TouchableOpacity>

          {/* Fields */}
          <View className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-10">
            <FieldRow
              label="Email"
              value={user?.email || ""}
              field="email"
              editable={false}
            />
            <FieldRow label="Name" value={name} field="name" />
            <FieldRow label="Phone" value={phone} field="phone" />
            <FieldRow
              label="Date of Birth"
              value={dateOfBirth}
              field="dateOfBirth"
            />
            {/* Password */}
            <View>
              <Text className="text-base text-gray-500 mb-1 mt-4">
                Password
              </Text>
              <View className="relative">
                <TextInput
                  className="border border-gray-200 rounded-lg px-4 py-3 pr-12 text-base bg-gray-50 text-gray-900"
                  value="••••••••"
                  editable={false}
                  secureTextEntry
                />
                <TouchableOpacity
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  onPress={handleChangePasswordPress}
                >
                  <Ionicons name="pencil" size={20} color="#bbb" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Nút Save lớn không còn tác dụng */}
          <TouchableOpacity
            className="bg-gray-400 rounded-xl py-4 px-12 items-center mt-4"
            onPress={() =>
              Alert.alert(
                "Info",
                "Please use the pencil icon next to each field to edit."
              )
            }
            activeOpacity={0.8}
          >
            <Text className="text-white text-lg font-bold tracking-wider">
              Save
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={dateOfBirth ? new Date(dateOfBirth) : new Date("2000-01-01")}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateChange}
          maximumDate={
            new Date(new Date().setFullYear(new Date().getFullYear() - 18))
          }
        />
      )}

      {/* Modal chỉnh sửa Name/Phone */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-white p-6 rounded-xl w-[90%] max-w-[400px]">
            <Text className="text-xl font-bold text-center mb-5 text-[#222]">
              Edit {editLabel}
            </Text>
            <TextInput
              className="border border-gray-200 rounded-lg px-4 py-3 text-base bg-gray-50 text-gray-900 mb-3"
              value={editValue}
              onChangeText={setEditValue}
              keyboardType={editField === "phone" ? "phone-pad" : "default"}
              autoFocus
            />
            {editError ? (
              <Text className="text-red-500 text-sm mb-2">{editError}</Text>
            ) : null}
            <View className="flex-row justify-between mt-2 space-x-4">
              <TouchableOpacity
                className="flex-1 py-3 rounded-lg bg-gray-100 items-center"
                onPress={() => setShowEditModal(false)}
              >
                <Text className="text-gray-600 font-medium text-base">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-3 rounded-lg bg-green-500 items-center"
                onPress={handleEditModalSave}
              >
                <Text className="text-white font-bold text-base">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Password Change Modal */}
      <Modal
        visible={showPasswordModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-white p-6 rounded-xl w-[90%] max-w-[400px]">
            <Text className="text-xl font-bold text-center mb-5 text-[#222]">
              Change Password
            </Text>
            <TextInput
              className="border border-gray-200 rounded-lg px-4 py-3 text-base bg-gray-50 text-gray-900"
              placeholder="Enter new password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
            <TextInput
              className="border border-gray-200 rounded-lg px-4 py-3 text-base bg-gray-50 text-gray-900 mt-3"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
            <View className="flex-row justify-between mt-6 space-x-4">
              <TouchableOpacity
                className="flex-1 py-3 rounded-lg bg-gray-100 items-center"
                onPress={() => {
                  setShowPasswordModal(false);
                  setNewPassword("");
                  setConfirmPassword("");
                }}
              >
                <Text className="text-gray-600 font-medium text-base">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-3 rounded-lg bg-blue-500 items-center"
                onPress={handlePasswordChange}
              >
                <Text className="text-white font-bold text-base">Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default EditProfile;
