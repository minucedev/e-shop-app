import React from "react";
import {
  View,
  Text,
  StatusBar,
  Image,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Dữ liệu mẫu giỏ hàng - sử dụng dữ liệu từ home.tsx
const CART_ITEMS = [
  {
    id: "1",
    name: "AMD RYZEN 9",
    description: "Unleash Performance",
    price: "$299",
    image:
      "https://nguyencongpc.vn/media/product/250-27037-242872903-c_ryzen_9_9900x3d_3dpib.jpg",
    quantity: 1,
  },
  {
    id: "2",
    name: "Intel Core i7 12700",
    description: "Beyond Limits",
    price: "$249",
    image:
      "https://product.hstatic.net/200000320233/product/i7_01bbf06595c041489008499b74309cd5_1024x1024.jpg",
    quantity: 1,
  },
];

const Cart = () => {
  const [cartItems, setCartItems] = React.useState(CART_ITEMS);

  // Tính tổng số lượng sản phẩm
  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Tính tổng tiền
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.price.replace("$", ""));
      return total + price * item.quantity;
    }, 0);
  };

  // Hàm tăng số lượng sản phẩm
  const increaseQuantity = (itemId: string) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  // Hàm xóa sản phẩm khỏi giỏ hàng
  const removeFromCart = (itemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  // Hàm giảm số lượng sản phẩm
  const decreaseQuantity = (itemId: string) => {
    const item = cartItems.find((item) => item.id === itemId);

    if (item && item.quantity === 1) {
      // Nếu số lượng = 1, hiện popup xác nhận xóa
      Alert.alert(
        "Remove Item",
        `Are you sure you want to remove "${item.name}" from your cart?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: () => removeFromCart(itemId),
          },
        ]
      );
    } else {
      // Nếu số lượng > 1, giảm số lượng
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity - 1 } : item
        )
      );
    }
  };

  // Component render từng item trong giỏ hàng
  const renderCartItem = ({ item }: { item: (typeof CART_ITEMS)[0] }) => (
    <View className="bg-white mx-4 mb-4 p-4 rounded-2xl shadow-sm border border-gray-100">
      <View className="flex-row">
        {/* Ảnh sản phẩm */}
        <Image
          source={{ uri: item.image }}
          className="w-20 h-20 rounded-xl bg-gray-100"
          resizeMode="contain"
        />

        {/* Thông tin sản phẩm */}
        <View className="flex-1 ml-4">
          {/* Tên sản phẩm */}
          <Text className="text-base font-bold text-gray-900 uppercase mb-1">
            {item.name}
          </Text>

          {/* Giá sản phẩm */}
          <Text className="text-lg font-bold text-gray-700 mb-3">
            {item.price}
          </Text>

          {/* Bộ điều chỉnh số lượng */}
          <View className="flex-row items-center">
            {/* Nút giảm */}
            <TouchableOpacity
              onPress={() => decreaseQuantity(item.id)}
              className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
              activeOpacity={0.7}
            >
              <Ionicons name="remove" size={16} color="#666" />
            </TouchableOpacity>

            {/* Số lượng */}
            <Text className="mx-4 text-base font-semibold text-gray-900 min-w-[20px] text-center">
              {item.quantity}
            </Text>

            {/* Nút tăng */}
            <TouchableOpacity
              onPress={() => increaseQuantity(item.id)}
              className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={16} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      {/* Header - theo style của home */}
      <View className="pt-12 px-4 pb-4 bg-white">
        <View className="flex-row justify-between items-center">
          <Text className="text-2xl font-bold text-gray-900">My Cart</Text>
          <Text className="text-base font-semibold text-gray-600">
            {getTotalItems()} items
          </Text>
        </View>
      </View>

      {/* Danh sách sản phẩm trong giỏ hàng */}
      {cartItems.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Ionicons name="bag-outline" size={80} color="#ccc" />
          <Text className="text-gray-400 text-lg mt-4">Your cart is empty</Text>
          <Text className="text-gray-400 text-sm mt-2">
            Add some products to your cart!
          </Text>
        </View>
      ) : (
        <View className="flex-1">
          {/* Danh sách sản phẩm */}
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 8, paddingBottom: 8 }}
          />

          {/* Order Summary */}
          <View className="bg-white mx-4 mb-4 p-6 rounded-2xl shadow-sm border border-gray-100">
            <Text className="text-lg font-bold text-gray-900 mb-4">
              Order Summary
            </Text>

            {/* Subtotal */}
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-base text-gray-600">
                Subtotal ({getTotalItems()} items)
              </Text>
              <Text className="text-base font-semibold text-gray-900">
                ${getTotalPrice().toFixed(2)}
              </Text>
            </View>

            {/* Total */}
            <View className="flex-row justify-between items-center mb-6 pt-3 border-t border-gray-200">
              <Text className="text-lg font-bold text-gray-900">Total</Text>
              <Text className="text-lg font-bold text-gray-900">
                ${getTotalPrice().toFixed(2)}
              </Text>
            </View>

            {/* Finalize Purchase Button */}
            <TouchableOpacity
              className="bg-blue-600 py-4 rounded-2xl items-center"
              activeOpacity={0.8}
              onPress={() => {
                // TODO: Navigate to checkout/payment screen
                console.log("Proceeding to checkout...");
              }}
            >
              <Text className="text-white text-lg font-bold">
                Finalize Purchase
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default Cart;
