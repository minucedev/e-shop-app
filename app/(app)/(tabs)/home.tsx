import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

const categories = [
  { icon: "phone-portrait", label: "Phones" },
  { icon: "laptop", label: "Laptops" },
  { icon: "tablet-portrait", label: "Tablets" },
  { icon: "watch", label: "Watches" },
  { icon: "headset", label: "Accessories" },
  { icon: "tv", label: "TVs" },
  { icon: "game-controller", label: "Gaming" },
  { icon: "camera", label: "Cameras" },
];

const featuredProducts = [
  {
    id: "1",
    name: "iPhone 15 Pro Max",
    price: "32.990.000₫",
    image:
      "https://cdn.tgdd.vn/Products/Images/42/303891/iphone-15-pro-max-blue-thumb-600x600.jpg",
  },
  {
    id: "2",
    name: "Samsung Galaxy S24 Ultra",
    price: "28.990.000₫",
    image:
      "https://cdn.tgdd.vn/Products/Images/42/303890/samsung-galaxy-s24-ultra-thumb-600x600.jpg",
  },
  {
    id: "3",
    name: "MacBook Air M3 2024",
    price: "29.990.000₫",
    image:
      "https://cdn.tgdd.vn/Products/Images/44/322927/macbook-air-m3-2024-600x600.jpg",
  },
];

const Home = () => {
  return (
    <ScrollView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-8 pb-4 bg-blue-600 rounded-b-3xl">
        <View>
          <Text className="text-white text-2xl font-bold">E-Shop</Text>
          <Text className="text-blue-100 text-base mt-1">
            Welcome to the best electronics store!
          </Text>
        </View>
        <TouchableOpacity className="bg-white p-2 rounded-full">
          <Ionicons name="person-circle" size={36} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Categories - horizontal scroll */}
      <View className="mt-6">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24 }}
        >
          {categories.map((cat) => (
            <CategoryButton key={cat.label} icon={cat.icon} label={cat.label} />
          ))}
        </ScrollView>
      </View>

      {/* Banner */}
      <View className="px-6 mt-6">
        <Image
          source={{
            uri: "https://cdn.tgdd.vn/2023/11/banner/Banner-Desk-1200x300-1.png",
          }}
          className="w-full h-32 rounded-2xl"
          resizeMode="cover"
        />
      </View>

      {/* Featured products */}
      <View className="px-6 mt-8 mb-10">
        <Text className="text-xl font-bold text-gray-900 mb-4">
          Featured Products
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {featuredProducts.map((item) => (
            <View
              key={item.id}
              className="mr-5 bg-white rounded-2xl shadow p-4 w-48"
            >
              <Image
                source={{ uri: item.image }}
                className="w-full h-32 rounded-xl mb-3"
                resizeMode="contain"
              />
              <Text className="font-semibold text-base text-gray-900 mb-1">
                {item.name}
              </Text>
              <Text className="text-blue-600 font-bold text-lg">
                {item.price}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
};

const CategoryButton = ({ icon, label }: { icon: any; label: string }) => (
  <TouchableOpacity
    className="bg-blue-50 rounded-2xl px-6 py-4 flex-row items-center min-w-[120px] mr-4"
    activeOpacity={1}
  >
    <Ionicons name={icon} size={28} color="#007AFF" className="mr-2" />
    <Text className="text-blue-900 font-semibold text-base">{label}</Text>
  </TouchableOpacity>
);

export default Home;
