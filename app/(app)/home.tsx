import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext"; // ← ADDED

const Home = () => {
  const router = useRouter();
  const { signOut } = useAuth(); // ← ADDED

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/welcome"); // redirect to welcome after sign out
    } catch (err) {
      console.error("Sign out failed:", err);
    }
  };

  return (
    <View style={styles.container}>
      {/* Debug label to confirm this file is rendered */}
      <Text style={styles.debugLabel}>Home (file: home.tsx)</Text>

      {/* Top-left back */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        accessibilityLabel="back-button"
      >
        <Ionicons name="arrow-back-outline" size={20} color="#fff" />
      </TouchableOpacity>

      {/* Top-right persistent Sign out */}
      <TouchableOpacity
        style={styles.signOutTopRight}
        onPress={handleSignOut}
        accessibilityLabel="signout-top"
      >
        <Text style={styles.signOutText}>Sign out</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>HOME</Text>
        {/* keep existing sign out in content too (optional) */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },

  // đặt back button ở góc trên cùng
  backButton: {
    position: "absolute",
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },

  // nhãn debug (có thể xóa nếu không cần)
  debugLabel: {
    position: "absolute",
    top: 18,
    left: 64,
    color: "#111",
    fontSize: 12,
    zIndex: 10,
  },

  // nút sign out cố định ở góc trên phải
  signOutTopRight: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#FF3B30",
    borderRadius: 8,
    zIndex: 10,
  },

  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60, // tránh bị che bởi top buttons
  },

  title: { fontSize: 18, fontWeight: "600", color: "#111" },

  // sign out styles (in-content)
  signOutButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#FF3B30",
    borderRadius: 8,
  },
  signOutText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default Home;
