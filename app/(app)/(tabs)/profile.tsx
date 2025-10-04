import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
} from "react-native";
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// Component cho mỗi tùy chọn trong danh sách
const OptionItem = ({
  iconName,
  title,
  onPress,
}: {
  iconName: any;
  title: string;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    className="flex-row items-center px-5 py-4 bg-white border-b border-gray-100"
  >
    <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-4">
      <Ionicons name={iconName} size={20} color="#2563eb" />
    </View>
    <Text className="flex-1 text-base font-medium text-gray-800">{title}</Text>
    <Ionicons name="chevron-forward-outline" size={20} color="#6b7280" />
  </TouchableOpacity>
);

const Profile = () => {
  const { user, signOut } = useAuth();
  const router = useRouter();

  // Giả định dữ liệu người dùng được lấy từ AuthContext
  const userProfile = {
    name: user?.name || "Robi",
    phone: user?.phone || "8967452743",
    email: user?.email || "robi123@gmail.com",
    avatar: user?.avatar || "https://i.pravatar.cc/150?img=68",
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => signOut(),
      },
    ]);
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-center p-4 bg-white border-b border-gray-200 relative">
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute left-4 p-2"
        >
          <Ionicons name="arrow-back" size={24} color="#2563eb" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">Profile</Text>
      </View>

      {/* User Info Section */}
      <View className="items-center py-6 bg-white border-b border-gray-100 mb-2">
        {/* Avatar */}
        <View className="relative w-32 h-32 items-center justify-center">
          {/* Các vòng tròn đồng tâm */}
          <View className="absolute w-32 h-32 rounded-full border border-blue-100"></View>
          <View className="absolute w-28 h-28 rounded-full border-2 border-blue-200"></View>
          <Image
            source={{ uri: userProfile.avatar }}
            className="w-24 h-24 rounded-full"
          />
          {/* Nút Edit */}
          <TouchableOpacity
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-blue-600 items-center justify-center"
            onPress={() => router.push("/(app)/(screens)/edit-profile")}
          >
            <Ionicons name="pencil-outline" size={16} color="white" />
          </TouchableOpacity>
        </View>

        {/* User Details */}
        <Text className="text-xl font-bold text-gray-900 mt-4">
          {userProfile.name}
        </Text>
        <Text className="text-base text-gray-700 mt-1">
          {userProfile.phone}
        </Text>
        <Text className="text-base text-gray-700">{userProfile.email}</Text>
      </View>

      {/* Options List */}
      <View className="mt-4">
        <OptionItem
          iconName="reader-outline"
          title="My Order"
          onPress={() => console.log("Go to My Order")}
        />
        <OptionItem
          iconName="location-outline"
          title="Shipping Address"
          onPress={() => router.push("/(app)/(screens)/edit-address")}
        />
        <OptionItem
          iconName="add-circle-outline"
          title="Create Request"
          onPress={() => console.log("Go to Create Request")}
        />
        <OptionItem
          iconName="lock-closed-outline"
          title="Privacy Policy"
          onPress={() => router.push("/(app)/(screens)/privacy-policy")}
        />
        <OptionItem
          iconName="log-out-outline"
          title="Log out"
          onPress={handleLogout}
        />
      </View>
    </ScrollView>
  );
};

export default Profile;
