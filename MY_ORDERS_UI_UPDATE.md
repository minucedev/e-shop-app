# My Orders UI Update - November 12, 2025

## Các thay đổi giao diện

### 1. Header mới (Giống Privacy Policy)

**Trước đây**: Sử dụng Stack.Screen header mặc định
**Bây giờ**: Custom header với:

- SafeAreaView cho top edge
- Nút Back (arrow-back icon) bên trái
- Title "Đơn hàng của tôi" ở giữa
- Nút "Lọc" với icon filter ở góc phải
- Background trắng với border bottom

```tsx
<View className="bg-white border-b border-gray-200">
  <SafeAreaView edges={["top"]}>
    <View className="flex-row items-center px-4 py-3">
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#2563eb" />
      </TouchableOpacity>
      <Text className="text-lg font-semibold flex-1">Đơn hàng của tôi</Text>
      <TouchableOpacity onPress={() => setShowFilterModal(true)}>
        <Ionicons name="filter" size={18} color="#2563eb" />
      </TouchableOpacity>
    </View>
  </SafeAreaView>
</View>
```

### 2. Filter Dropdown Modal (Thay horizontal scroll)

**Trước đây**: FlatList horizontal với các tab filter
**Bây giờ**: Modal popup với nhóm filter

**Cấu trúc Modal**:

- **Background overlay**: Semi-transparent black (bg-black/50)
- **Modal container**: Centered, white, rounded corners
- **Header**: Blue background với title "Lọc đơn hàng"
- **All Orders**: Option đầu tiên
- **Group 1 - Đang xử lý**:
  - Chờ xác nhận (PENDING)
  - Đã xác nhận (CONFIRMED)
- **Group 2 - Giao hàng**:
  - Đang giao (SHIPPING)
  - Đã giao (DELIVERED)
  - Đã hủy (CANCELLED)
- **Close button**: Nút đóng ở bottom

**Tính năng**:

- Radio button với checkmark
- Active state với blue border & background
- Icons cho mỗi option
- Group headers với gray background
- Press outside để đóng modal

### 3. Current Filter Display

**Section mới** hiển thị filter hiện tại:

```tsx
<View className="bg-white px-4 py-3 border-b border-gray-200">
  <View className="flex-row items-center justify-between">
    <View className="flex-1">
      <Text className="text-xs text-gray-500">Đang hiển thị</Text>
      <Text className="text-sm font-semibold">{getCurrentFilterLabel()}</Text>
    </View>
    {totalElements > 0 && (
      <View className="bg-blue-100 px-3 py-1 rounded-full">
        <Text className="text-sm font-bold text-blue-700">
          {filteredOrders.length}/{totalElements}
        </Text>
      </View>
    )}
  </View>
</View>
```

**Hiển thị**:

- Label "Đang hiển thị" nhỏ phía trên
- Tên filter hiện tại (vd: "Tất cả đơn hàng", "Chờ xác nhận")
- Badge số lượng: filtered/total (vd: "5/20")

### 4. Filter Groups Configuration

```typescript
const FILTER_OPTIONS = {
  all: {
    status: null,
    label: "Tất cả đơn hàng",
    icon: "list",
  },
  processing: [
    { status: "PENDING", label: "Chờ xác nhận", icon: "time" },
    { status: "CONFIRMED", label: "Đã xác nhận", icon: "checkmark-circle" },
  ],
  delivery: [
    { status: "SHIPPING", label: "Đang giao", icon: "car" },
    { status: "DELIVERED", label: "Đã giao", icon: "checkmark-done" },
    { status: "CANCELLED", label: "Đã hủy", icon: "close-circle" },
  ],
};
```

## Functions Added/Modified

### New Functions:

1. **getCurrentFilterLabel()**: Lấy label của filter hiện tại
2. **handleFilterSelect(status)**: Handle select filter và đóng modal
3. **renderFilterModal()**: Render filter modal

### Removed Functions:

- **renderFilterButton()**: Đã xóa vì không dùng horizontal tabs nữa

## UI Components Hierarchy

```
View (Container)
├── Custom Header (SafeAreaView)
│   └── Back Button | Title | Filter Button
├── Stack.Screen (hidden)
├── Current Filter Display
│   └── Label | Badge Count
├── Filter Modal
│   ├── Overlay (Pressable)
│   └── Modal Content
│       ├── Header (Blue)
│       ├── All Orders Option
│       ├── Processing Group
│       │   ├── Group Header
│       │   └── Options (PENDING, CONFIRMED)
│       ├── Delivery Group
│       │   ├── Group Header
│       │   └── Options (SHIPPING, DELIVERED, CANCELLED)
│       └── Close Button
└── Order List (FlatList)
    └── OrderCard items
```

## Visual Design

### Colors:

- **Header**: White background (#FFFFFF)
- **Filter button**: Blue background (#EFF6FF) with blue text (#2563EB)
- **Modal overlay**: Black 50% opacity
- **Modal header**: Blue (#2563EB)
- **Active filter**: Blue border & background (#2563EB)
- **Group header**: Gray background (#F9FAFB)
- **Badge count**: Blue background (#DBEAFE) with blue text (#1D4ED8)

### Typography:

- **Page title**: 18px, semibold, gray-900
- **Filter label**: 14px, medium, blue-600
- **Current filter**: 14px, semibold, gray-800
- **Group header**: 12px, semibold, uppercase, gray-500
- **Filter option**: 16px, medium, gray-800

### Spacing:

- **Header padding**: 16px horizontal, 12px vertical
- **Modal padding**: 20px horizontal
- **Group spacing**: 8px vertical
- **Option spacing**: 16px vertical

## User Flow

1. User taps "Lọc" button in header
2. Modal slides up from center with fade animation
3. User sees all filter options grouped by category
4. User taps on desired filter
5. Radio button shows selected state
6. Modal closes automatically
7. Order list updates to show filtered results
8. Current filter label updates
9. Badge shows filtered count vs total

## Responsive Behavior

- Modal centers on screen regardless of device size
- SafeAreaView handles notch/status bar
- Filter groups scroll if content exceeds screen height
- Press outside modal to dismiss

## Benefits of New Design

✅ **Cleaner UI**: No horizontal scroll needed
✅ **Better Organization**: Filters grouped by meaning
✅ **More Professional**: Modal pattern is modern
✅ **Easier to Use**: Larger touch targets
✅ **Clearer Feedback**: Current filter always visible
✅ **Better Header**: Consistent with other screens
✅ **Space Efficient**: More room for order list

## Testing Checklist

- [ ] Header back button navigates correctly
- [ ] Filter button opens modal
- [ ] Modal closes on outside press
- [ ] Modal closes on close button
- [ ] Radio buttons show correct selected state
- [ ] Filter selection updates order list
- [ ] Current filter label updates
- [ ] Badge count shows correct numbers
- [ ] All filter options work
- [ ] Pull to refresh still works
- [ ] Infinite scroll still works
- [ ] Empty state displays correctly
- [ ] Error state displays correctly
