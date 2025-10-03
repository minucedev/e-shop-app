import { View, Text, TouchableOpacity, Image, Alert } from "react-native";
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const Profile = () => {
  const { user, signOut } = useAuth();
  const router = useRouter();

  // Logout logic with confirmation popup
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
    <View className="flex-1 bg-white px-8 pt-12">
      {/* Avatar & Name with edit icon */}
      <View className="items-center mb-12">
        <Image
          source={{
            uri: user?.avatar || "https://i.pravatar.cc/150?img=3",
          }}
          className="w-[120px] h-[120px] rounded-full mb-3 bg-gray-200"
        />
        <View className="flex-row items-center mt-2">
          <Text className="text-[28px] font-bold text-gray-900">
            {user?.name && user.name.trim() ? user.name : "Not updated"}
          </Text>
          <TouchableOpacity
            className="ml-3 p-2 rounded-full bg-blue-50"
            onPress={() => router.push("/(app)/(screens)/edit-profile")}
            activeOpacity={0.7}
          >
            <Ionicons name="pencil" size={26} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Action buttons */}
      <View className="bg-white rounded-2xl mb-12 shadow-sm">
        <ProfileButton
          icon={<Ionicons name="location-outline" size={28} color="#007AFF" />}
          label="Address Book"
          onPress={() => router.push("/(app)/(screens)/edit-address")}
        />
        <ProfileButton
          icon={<Ionicons name="list-outline" size={28} color="#007AFF" />}
          label="My Orders"
        />
        <ProfileButton
          icon={
            <Ionicons
              name="shield-checkmark-outline"
              size={28}
              color="#007AFF"
            />
          }
          label="Warranty"
        />
      </View>

      {/* Logout button */}
      <View className="mt-auto items-center pt-6 border-t border-gray-200">
        <TouchableOpacity
          className="flex-row items-center bg-white py-4 px-12 rounded-3xl shadow-sm"
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons
            name="log-out-outline"
            size={28}
            color="#FF3B30"
            style={{ marginRight: 16 }}
          />
          <Text className="text-[#FF3B30] text-lg font-bold">Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

type ProfileButtonProps = {
  icon: React.ReactNode;
  label: string;
  color?: string;
  onPress?: () => void;
};

const ProfileButton = ({
  icon,
  label,
  color = "#222",
  onPress,
}: ProfileButtonProps) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    className="flex-row items-center py-5 border-b border-gray-100 px-2"
  >
    <View className="mr-6">{icon}</View>
    <Text
      className={`text-lg font-semibold ${color !== "#222" ? "" : "text-gray-900"}`}
    >
      {label}
    </Text>
    <Ionicons
      name="chevron-forward"
      size={26}
      color="#bbb"
      style={{ marginLeft: "auto" }}
    />
  </TouchableOpacity>
);

export default Profile;
