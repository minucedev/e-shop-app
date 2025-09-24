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
} from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";

const EditProfile = () => {
  const { user, updateUser } = useAuth();
  const router = useRouter();

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [loading, setLoading] = useState(false);

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
      setAvatar(result.assets[0].uri);
    }
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

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Validation", "Name is required.");
      return;
    }
    if (!user) {
      Alert.alert("Error", "User not found.");
      return;
    }
    setLoading(true);
    try {
      if (updateUser) {
        await updateUser({
          name,
          phone,
          dateOfBirth,
          avatar,
        });
      }
      Alert.alert("Success", "Profile updated successfully!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (e) {
      Alert.alert("Error", "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header row: Back button + Title */}
        <View className="flex-row items-center justify-center mt-10 mb-6 px-6 relative">
          <TouchableOpacity
            className="mr-4 bg-gray-100 rounded-full p-3"
            onPress={() => router.back()}
            style={{ position: "absolute", left: 0 }}
          >
            <Ionicons name="arrow-back" size={32} color="#007AFF" />
          </TouchableOpacity>
          <Text className="flex-1 text-[33px] font-bold text-center text-[#222]">
            Edit Profile
          </Text>
        </View>

        <View className="flex-1 bg-white px-6 pt-4 items-center">
          <TouchableOpacity
            className="mb-6 relative"
            onPress={pickAvatar}
            activeOpacity={0.8}
          >
            <Image
              source={{
                uri: avatar || "https://i.pravatar.cc/150?img=3",
              }}
              className="w-36 h-36 rounded-full bg-gray-200"
            />
            <View className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-3 border-2 border-white">
              <Ionicons name="camera" size={30} color="#fff" />
            </View>
          </TouchableOpacity>

          <View className="w-full mb-12">
            <Text className="text-xl text-gray-500 mb-2 mt-5">Name</Text>
            <TextInput
              className="border border-gray-200 rounded-xl px-5 py-4 text-xl bg-gray-50 text-gray-900"
              placeholder="Enter your name"
              value={name}
              onChangeText={setName}
            />

            <Text className="text-xl text-gray-500 mb-2 mt-5">Phone</Text>
            <TextInput
              className="border border-gray-200 rounded-xl px-5 py-4 text-xl bg-gray-50 text-gray-900"
              placeholder="Enter your phone"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            <Text className="text-xl text-gray-500 mb-2 mt-5">
              Date of Birth
            </Text>
            <TextInput
              className="border border-gray-200 rounded-xl px-5 py-4 text-xl bg-gray-50 text-gray-900"
              placeholder="YYYY-MM-DD"
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
            />

            {/* Password field with change button */}
            <Text className="text-xl text-gray-500 mb-2 mt-5">Password</Text>
            <View className="flex-row items-center space-x-3">
              <TextInput
                className="border border-gray-200 rounded-xl px-5 py-4 text-xl bg-gray-50 text-gray-900 flex-1"
                value="••••••••"
                editable={false}
                secureTextEntry
              />
              <TouchableOpacity
                className="bg-blue-500 px-5 py-4 rounded-xl"
                onPress={handleChangePasswordPress}
              >
                <Text className="text-white text-lg font-medium">Change</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            className={`bg-blue-500 rounded-2xl py-5 px-16 items-center mt-6 ${loading ? "opacity-60" : ""}`}
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text className="text-white text-xl font-bold tracking-wider">
              {loading ? "Saving..." : "Save"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Password Change Modal */}
      <Modal
        visible={showPasswordModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-white p-8 rounded-2xl w-[95%] max-w-[500px]">
            <Text className="text-2xl font-bold text-center mb-6 text-[#222]">
              Change Password
            </Text>

            <Text className="text-xl text-gray-500 mb-2 mt-5">
              New Password
            </Text>
            <TextInput
              className="border border-gray-200 rounded-xl px-5 py-4 text-xl bg-gray-50 text-gray-900"
              placeholder="Enter new password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />

            <Text className="text-xl text-gray-500 mb-2 mt-5">
              Confirm Password
            </Text>
            <TextInput
              className="border border-gray-200 rounded-xl px-5 py-4 text-xl bg-gray-50 text-gray-900"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            <View className="flex-row justify-between mt-8 space-x-5">
              <TouchableOpacity
                className="flex-1 py-4 rounded-xl bg-gray-100 items-center"
                onPress={() => {
                  setShowPasswordModal(false);
                  setNewPassword("");
                  setConfirmPassword("");
                }}
              >
                <Text className="text-gray-600 font-semibold text-lg">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-4 rounded-xl bg-blue-500 items-center"
                onPress={handlePasswordChange}
              >
                <Text className="text-white font-bold text-lg">Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default EditProfile;
