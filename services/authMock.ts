// services/authMock.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

export type User = {
  id: string;
  name: string;
  email: string;
  password: string; // lưu plain text (mock, không bảo mật)
  dateOfBirth: string; // Format: YYYY-MM-DD
  phone: string;
};

const MOCK_USERS_KEY = "MOCK_USERS";
const MOCK_TOKEN_KEY = "MOCK_TOKEN";

// Hàm tạo token giả
const generateToken = (userId: string) => {
  return `token-${userId}-${Date.now()}`;
};

// Hàm lấy danh sách user từ AsyncStorage
const getStoredUsers = async (): Promise<User[]> => {
  const data = await AsyncStorage.getItem(MOCK_USERS_KEY);
  return data ? JSON.parse(data) : [];
};

// Hàm lưu danh sách user
const saveUsers = async (users: User[]) => {
  await AsyncStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
};

export const authMock = {
  // Đăng ký
  async signUp({
    name,
    email,
    password,
    dateOfBirth,
    phone,
  }: {
    name: string;
    email: string;
    password: string;
    dateOfBirth: string;
    phone: string;
  }) {
    const users = await getStoredUsers();

    // Kiểm tra email trùng
    if (users.find((u) => u.email === email)) {
      throw new Error("Email đã tồn tại");
    }

    // Kiểm tra số điện thoại trùng
    if (users.find((u) => u.phone === phone)) {
      throw new Error("Số điện thoại đã tồn tại");
    }

    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      password,
      dateOfBirth,
      phone,
    };

    const updatedUsers = [...users, newUser];
    await saveUsers(updatedUsers);

    const token = generateToken(newUser.id);
    await AsyncStorage.setItem(MOCK_TOKEN_KEY, token);

    return { user: newUser, token };
  },

  // Đăng nhập
  async signIn({ email, password }: { email: string; password: string }) {
    const users = await getStoredUsers();
    const found = users.find(
      (u) => u.email === email && u.password === password
    );

    if (!found) {
      throw new Error("Sai email hoặc mật khẩu");
    }

    const token = generateToken(found.id);
    await AsyncStorage.setItem(MOCK_TOKEN_KEY, token);

    return { user: found, token };
  },

  // Đăng xuất
  async signOut() {
    await AsyncStorage.removeItem(MOCK_TOKEN_KEY);
  },

  // Lấy user từ token
  async getUserFromToken(): Promise<User | null> {
    const token = await AsyncStorage.getItem(MOCK_TOKEN_KEY);
    if (!token) return null;

    const users = await getStoredUsers();
    // Tìm user từ token
    const parts = token.split("-");
    const userId = parts[1];
    return users.find((u) => u.id === userId) || null;
  },

  // Seed user mặc định (nếu chưa có user nào)
  async seedUser() {
    const users = await getStoredUsers();
    if (users.length === 0) {
      const defaultUser: User = {
        id: "1",
        name: "Test User",
        email: "test@local",
        password: "123456",
        dateOfBirth: "1990-01-01",
        phone: "0123456789",
      };
      await saveUsers([defaultUser]);
    }
  },
};
